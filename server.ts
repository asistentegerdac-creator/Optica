import express from "express";
import path from "path";
import fs from "fs";
import pg from "pg";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const CONFIG_FILE = path.join(process.cwd(), "database_config.json");

app.use(express.json());

// Database connection state
let dbPool: pg.Pool | null = null;
let currentDbConfig: any = null;
let connectionError: string | null = null;

// Helper to load db configuration from file
function loadDbConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      currentDbConfig = JSON.parse(raw);
      initializePool(currentDbConfig);
    } else {
      connectionError = "Base de datos local no configurada. Por favor, realice la configuración de conexión.";
    }
  } catch (e: any) {
    console.error("Error loading database config:", e);
    connectionError = `Error al cargar archivo de configuración: ${e.message}`;
  }
}

// Initialize the pg connection pool
function initializePool(config: any) {
  if (dbPool) {
    dbPool.end().catch(() => {});
  }

  const poolConfig: pg.PoolConfig = {
    host: config.host || "localhost",
    port: parseInt(config.port) || 5432,
    user: config.user || "postgres",
    password: config.password || "",
    database: config.database || "optivision",
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 5000,
  };

  dbPool = new pg.Pool(poolConfig);
  connectionError = null;

  // Verify connection and create tables
  verifyAndCreateTables();
}

// Verify tables and create them if they do not exist
async function verifyAndCreateTables() {
  if (!dbPool) return;
  try {
    const client = await dbPool.connect();
    
    // Create Quotes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id VARCHAR(100) PRIMARY KEY,
        quote_number VARCHAR(100) UNIQUE,
        client_name VARCHAR(255),
        client_dni VARCHAR(50),
        date VARCHAR(100),
        total NUMERIC,
        status VARCHAR(50),
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Action Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS action_logs (
        id VARCHAR(100) PRIMARY KEY,
        timestamp VARCHAR(100),
        details TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log("PostgreSQL connected and tables verified/created successfully.");
    connectionError = null;
  } catch (e: any) {
    console.error("PostgreSQL verification table / connection error:", e);
    connectionError = `Fallo de conexión o consulta de inicialización: ${e.message}`;
    dbPool = null;
  }
}

// In-memory fallback if postgres is not connected (useful for testing or first-time setups before pg is ready)
let fallbackQuotes: any[] = [];
let fallbackLogs: any[] = [];

// ──────────────────────────────────────────────────────────────────
// API ROUTES
// ──────────────────────────────────────────────────────────────────

// Database connection status
app.get("/api/db/status", (req, res) => {
  res.json({
    connected: dbPool !== null && connectionError === null,
    error: connectionError,
    config: currentDbConfig ? {
      host: currentDbConfig.host,
      port: currentDbConfig.port,
      user: currentDbConfig.user,
      database: currentDbConfig.database,
      ssl: currentDbConfig.ssl
    } : null
  });
});

// Save configuration and initialize DB
app.post("/api/db/config", async (req, res) => {
  const { host, port, user, password, database, ssl } = req.body;
  
  const testConfig = {
    host: host || "localhost",
    port: parseInt(port) || 5432,
    user: user || "postgres",
    password: password || "",
    database: database || "optivision",
    ssl: !!ssl
  };

  let testPool: pg.Pool | null = null;
  try {
    testPool = new pg.Pool({
      ...testConfig,
      connectionTimeoutMillis: 4000,
    });
    
    const client = await testPool.connect();
    
    // Create tables immediately if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id VARCHAR(100) PRIMARY KEY,
        quote_number VARCHAR(100) UNIQUE,
        client_name VARCHAR(255),
        client_dni VARCHAR(50),
        date VARCHAR(100),
        total NUMERIC,
        status VARCHAR(50),
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS action_logs (
        id VARCHAR(100) PRIMARY KEY,
        timestamp VARCHAR(100),
        details TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    await testPool.end();

    // Setup was successful! Save to JSON configuration
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(testConfig, null, 2), "utf-8");
    currentDbConfig = testConfig;
    initializePool(currentDbConfig);

    res.json({ success: true, message: "Conexión exitosa. Base de datos e información inicializada." });
  } catch (e: any) {
    console.error("Failed to configure database:", e);
    if (testPool) {
      testPool.end().catch(() => {});
    }
    res.status(400).json({ success: false, error: `Fallo al conectar con PostgreSQL: ${e.message}` });
  }
});

// GET Quotes
app.get("/api/quotes", async (req, res) => {
  if (dbPool && !connectionError) {
    try {
      const result = await dbPool.query("SELECT data FROM quotes ORDER BY created_at DESC");
      const list = result.rows.map(row => row.data);
      res.json(list);
    } catch (e: any) {
      console.error("Error fetching quotes from PG:", e);
      res.status(500).json({ error: e.message });
    }
  } else {
    // Return memory fallback
    res.json(fallbackQuotes);
  }
});

// POST Quote
app.post("/api/quotes", async (req, res) => {
  const quote = req.body;
  if (!quote.id) {
    quote.id = `cot-${Date.now()}`;
  }

  if (dbPool && !connectionError) {
    try {
      await dbPool.query(
        `INSERT INTO quotes (id, quote_number, client_name, client_dni, date, total, status, data) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT (id) DO UPDATE 
         SET quote_number = EXCLUDED.quote_number, 
             client_name = EXCLUDED.client_name, 
             client_dni = EXCLUDED.client_dni, 
             date = EXCLUDED.date, 
             total = EXCLUDED.total, 
             status = EXCLUDED.status, 
             data = EXCLUDED.data`,
        [
          quote.id,
          quote.quoteNumber,
          quote.clientName,
          quote.clientDni || "",
          quote.date,
          quote.total || 0,
          quote.status || "Nuevo",
          JSON.stringify(quote)
        ]
      );
      res.json({ success: true, quote });
    } catch (e: any) {
      console.error("Error inserting quote into PG:", e);
      res.status(500).json({ error: e.message });
    }
  } else {
    // Fallback memory logic
    const existsIndex = fallbackQuotes.findIndex(q => q.id === quote.id);
    if (existsIndex >= 0) {
      fallbackQuotes[existsIndex] = quote;
    } else {
      fallbackQuotes.unshift(quote);
    }
    res.json({ success: true, quote, fallback: true });
  }
});

// PUT Quote (Update Status/CRM Notes)
app.put("/api/quotes/:id", async (req, res) => {
  const { id } = req.params;
  const quote = req.body;

  if (dbPool && !connectionError) {
    try {
      await dbPool.query(
        `UPDATE quotes 
         SET quote_number = $1, client_name = $2, client_dni = $3, date = $4, total = $5, status = $6, data = $7 
         WHERE id = $8`,
        [
          quote.quoteNumber,
          quote.clientName,
          quote.clientDni || "",
          quote.date,
          quote.total || 0,
          quote.status || "Nuevo",
          JSON.stringify(quote),
          id
        ]
      );
      res.json({ success: true, quote });
    } catch (e: any) {
      console.error("Error updating quote in PG:", e);
      res.status(500).json({ error: e.message });
    }
  } else {
    const idx = fallbackQuotes.findIndex(q => q.id === id);
    if (idx >= 0) {
      fallbackQuotes[idx] = { ...fallbackQuotes[idx], ...quote };
      res.json({ success: true, quote: fallbackQuotes[idx], fallback: true });
    } else {
      res.status(404).json({ error: "Quote not found" });
    }
  }
});

// DELETE Quote
app.delete("/api/quotes/:id", async (req, res) => {
  const { id } = req.params;
  if (dbPool && !connectionError) {
    try {
      await dbPool.query("DELETE FROM quotes WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (e: any) {
      console.error("Error deleting quote from PG:", e);
      res.status(500).json({ error: e.message });
    }
  } else {
    fallbackQuotes = fallbackQuotes.filter(q => q.id !== id);
    res.json({ success: true, fallback: true });
  }
});

// GET Action Logs
app.get("/api/logs", async (req, res) => {
  if (dbPool && !connectionError) {
    try {
      const result = await dbPool.query("SELECT data FROM action_logs ORDER BY created_at DESC LIMIT 150");
      const list = result.rows.map(row => row.data);
      res.json(list);
    } catch (e: any) {
      console.error("Error fetching logs from PG:", e);
      res.status(500).json({ error: e.message });
    }
  } else {
    res.json(fallbackLogs);
  }
});

// POST Action Log
app.post("/api/logs", async (req, res) => {
  const log = req.body;
  if (!log.id) {
    log.id = `log-${Date.now()}`;
  }

  if (dbPool && !connectionError) {
    try {
      await dbPool.query(
        "INSERT INTO action_logs (id, timestamp, details, data) VALUES ($1, $2, $3, $4)",
        [log.id, log.timestamp, log.details || "", JSON.stringify(log)]
      );
      res.json({ success: true, log });
    } catch (e: any) {
      console.error("Error creating action log in PG:", e);
      res.status(500).json({ error: e.message });
    }
  } else {
    fallbackLogs.unshift(log);
    if (fallbackLogs.length > 200) fallbackLogs.pop();
    res.json({ success: true, log, fallback: true });
  }
});

// Clear fallback data (to support the clean start requirement if no DB is connected yet)
app.post("/api/db/clear-fallback", (req, res) => {
  fallbackQuotes = [];
  fallbackLogs = [];
  res.json({ success: true });
});

// Load config at startup
loadDbConfig();

// ──────────────────────────────────────────────────────────────────
// VITE DEV SERVER OR PRODUCTION SERVING HANDLER
// ──────────────────────────────────────────────────────────────────
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
