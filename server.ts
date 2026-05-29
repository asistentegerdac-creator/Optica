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

// Fallback in-memory arrays (with initial default values) so the app serves instantly
let fallbackUsers: any[] = [
  { username: "admin", password: "admin", full_name: "Administrador General", role: "Administrador" },
  { username: "estefany", password: "123", full_name: "Estefany López", role: "Vendedor" }
];
let fallbackQuotes: any[] = [];
let fallbackLogs: any[] = [];
let fallbackFrames: any[] = [
  { id: "mon-1", brand: "Ray-Ban", model: "Aviator Classic", color: "Dorado / Metal", material: "Metal", price: 450.00 },
  { id: "mon-2", brand: "Oakley", model: "Holbrook Adventure", color: "Negro Mate", material: "Plástico", price: 520.00 },
  { id: "mon-3", brand: "Vogue", model: "Cat-Eye Retro", color: "Carey", material: "Acetato", price: 340.00 }
];
let fallbackCrystals: any[] = [
  { id: "lun-1", brand: "Essilor Crizal", type: "Monofocal", material: "Policarbonato", price: 180.00 },
  { id: "lun-2", brand: "Essilor Varilux", type: "Multifocal", material: "Alto Índice 1.67", price: 320.00 },
  { id: "lun-3", brand: "Hoya BlueLight", type: "Blue Light", material: "Policarbonato", price: 260.00 }
];
let fallbackReminders: any[] = [];

// Helper to load db configuration from file
function loadDbConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      currentDbConfig = JSON.parse(raw);
      initializePool(currentDbConfig);
    } else {
      connectionError = "Base de datos local no configurada. Configure la conexión en la pestaña Base de Datos.";
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

    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(100) PRIMARY KEY,
        password VARCHAR(255),
        full_name VARCHAR(255),
        role VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create frames Catalog table
    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_frames (
        id VARCHAR(100) PRIMARY KEY,
        brand VARCHAR(255),
        model VARCHAR(255),
        color VARCHAR(255),
        material VARCHAR(255),
        price NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create crystals Catalog table
    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_crystals (
        id VARCHAR(100) PRIMARY KEY,
        brand VARCHAR(255),
        type VARCHAR(255),
        material VARCHAR(255),
        price NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create CRM Reminders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id VARCHAR(100) PRIMARY KEY,
        quote_id VARCHAR(100),
        client_name VARCHAR(255),
        date VARCHAR(100),
        time VARCHAR(50),
        notes TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Prepopulate default admin if table is empty
    const adminCheck = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(adminCheck.rows[0].count) === 0) {
      await client.query(
        "INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4)",
        ["admin", "admin", "Administrador General", "Administrador"]
      );
      await client.query(
        "INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4)",
        ["estefany", "123", "Estefany López", "Vendedor"]
      );
    }

    // Prepopulate frame templates if empty
    const framesCheck = await client.query("SELECT COUNT(*) FROM catalog_frames");
    if (parseInt(framesCheck.rows[0].count) === 0) {
      for (const f of fallbackFrames) {
        await client.query(
          "INSERT INTO catalog_frames (id, brand, model, color, material, price) VALUES ($1, $2, $3, $4, $5, $6)",
          [f.id, f.brand, f.model, f.color, f.material, f.price]
        );
      }
    }

    // Prepopulate crystal templates if empty
    const crystalsCheck = await client.query("SELECT COUNT(*) FROM catalog_crystals");
    if (parseInt(crystalsCheck.rows[0].count) === 0) {
      for (const c of fallbackCrystals) {
        await client.query(
          "INSERT INTO catalog_crystals (id, brand, type, material, price) VALUES ($1, $2, $3, $4, $5)",
          [c.id, c.brand, c.type, c.material, c.price]
        );
      }
    }

    client.release();
    console.log("PostgreSQL connected and tables verified/created successfully.");
    connectionError = null;
  } catch (e: any) {
    console.error("PostgreSQL verification table / connection error:", e);
    connectionError = `Fallo de conexión o consulta de inicialización: ${e.message}`;
    dbPool = null;
  }
}

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
    
    // Create all tables if they don't exist
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(100) PRIMARY KEY,
        password VARCHAR(255),
        full_name VARCHAR(255),
        role VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_frames (
        id VARCHAR(100) PRIMARY KEY,
        brand VARCHAR(255),
        model VARCHAR(255),
        color VARCHAR(255),
        material VARCHAR(255),
        price NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_crystals (
        id VARCHAR(100) PRIMARY KEY,
        brand VARCHAR(255),
        type VARCHAR(255),
        material VARCHAR(255),
        price NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id VARCHAR(100) PRIMARY KEY,
        quote_id VARCHAR(100),
        client_name VARCHAR(255),
        date VARCHAR(100),
        time VARCHAR(50),
        notes TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Setup admin
    const adminCheck = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(adminCheck.rows[0].count) === 0) {
      await client.query(
        "INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4)",
        ["admin", "admin", "Administrador General", "Administrador"]
      );
      await client.query(
        "INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4)",
        ["estefany", "123", "Estefany López", "Vendedor"]
      );
    }

    client.release();
    await testPool.end();

    // Setup was successful! Save to JSON configuration
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(testConfig, null, 2), "utf-8");
    currentDbConfig = testConfig;
    initializePool(currentDbConfig);

    res.json({ success: true, message: "Conexión exitosa y tablas inicializadas." });
  } catch (e: any) {
    console.error("Failed to configure database:", e);
    if (testPool) {
      testPool.end().catch(() => {});
    }
    res.status(400).json({ success: false, error: `Fallo al conectar con PostgreSQL: ${e.message}` });
  }
});

// ──────────────────────────────────────────────────────────────────
// AUTHENTICATION APIs
// ──────────────────────────────────────────────────────────────────

// Register
app.post("/api/auth/register", async (req, res) => {
  const { username, password, fullName, role } = req.body;
  if (!username || !password || !fullName) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const uNameLower = username.toLowerCase().trim();

  if (dbPool && !connectionError) {
    try {
      // Check duplicate
      const check = await dbPool.query("SELECT username FROM users WHERE LOWER(username) = $1", [uNameLower]);
      if (check.rows.length > 0) {
        return res.status(400).json({ error: "El nombre de usuario ya está registrado." });
      }

      await dbPool.query(
        "INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4)",
        [uNameLower, password, fullName, role || "Vendedor"]
      );
      res.json({ success: true, username: uNameLower, fullName, role });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    // Fallback
    const duplicate = fallbackUsers.some(u => u.username === uNameLower);
    if (duplicate) {
      return res.status(400).json({ error: "El nombre de usuario ya está registrado en local." });
    }
    const newUser = { username: uNameLower, password, full_name: fullName, role: role || "Vendedor" };
    fallbackUsers.push(newUser);
    res.json({ success: true, username: uNameLower, fullName, role });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Faltan usuario o contraseña" });
  }

  const uNameLower = username.toLowerCase().trim();

  if (dbPool && !connectionError) {
    try {
      const result = await dbPool.query(
        "SELECT username, password, full_name, role FROM users WHERE LOWER(username) = $1",
        [uNameLower]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "El usuario no existe." });
      }
      const user = result.rows[0];
      if (user.password !== password) {
        return res.status(401).json({ error: "Contraseña incorrecta." });
      }
      res.json({
        success: true,
        user: {
          username: user.username,
          fullName: user.full_name,
          role: user.role
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    // Fallback
    const user = fallbackUsers.find(u => u.username === uNameLower);
    if (!user) {
      return res.status(404).json({ error: "El usuario no existe en memoria temporal." });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }
    res.json({
      success: true,
      user: {
        username: user.username,
        fullName: user.full_name,
        role: user.role
      }
    });
  }
});

app.get("/api/users", async (req, res) => {
  if (dbPool && !connectionError) {
    try {
      const result = await dbPool.query("SELECT username, full_name, role, created_at FROM users");
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.json(fallbackUsers.map(u => ({ username: u.username, full_name: u.full_name, role: u.role })));
  }
});

// ──────────────────────────────────────────────────────────────────
// QUOTES APIs
// ──────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────
// ACTION LOGS REST
// ──────────────────────────────────────────────────────────────────

app.get("/api/logs", async (req, res) => {
  if (dbPool && !connectionError) {
    try {
      const result = await dbPool.query("SELECT data FROM action_logs ORDER BY created_at DESC LIMIT 200");
      const list = result.rows.map(row => row.data);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.json(fallbackLogs);
  }
});

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
      res.status(500).json({ error: e.message });
    }
  } else {
    fallbackLogs.unshift(log);
    if (fallbackLogs.length > 200) fallbackLogs.pop();
    res.json({ success: true, log, fallback: true });
  }
});

// ──────────────────────────────────────────────────────────────────
// FRAMES CATALOG APIs
// ──────────────────────────────────────────────────────────────────

app.get("/api/catalog/frames", async (req, res) => {
  if (dbPool && !connectionError) {
    try {
      const result = await dbPool.query("SELECT id, brand, model, color, material, CAST(price AS DOUBLE PRECISION) as price FROM catalog_frames ORDER BY brand, model");
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.json(fallbackFrames);
  }
});

app.post("/api/catalog/frames", async (req, res) => {
  const frame = req.body;
  if (!frame.id) frame.id = `mon-${Date.now()}`;
  
  if (dbPool && !connectionError) {
    try {
      await dbPool.query(
        `INSERT INTO catalog_frames (id, brand, model, color, material, price) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE 
         SET brand = EXCLUDED.brand, model = EXCLUDED.model, color = EXCLUDED.color, material = EXCLUDED.material, price = EXCLUDED.price`,
        [frame.id, frame.brand, frame.model, frame.color || "", frame.material || "", frame.price || 0]
      );
      res.json({ success: true, frame });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    const idx = fallbackFrames.findIndex(f => f.id === frame.id);
    if (idx >= 0) {
      fallbackFrames[idx] = frame;
    } else {
      fallbackFrames.push(frame);
    }
    res.json({ success: true, frame, fallback: true });
  }
});

app.put("/api/catalog/frames/:id", async (req, res) => {
  const { id } = req.params;
  const frame = req.body;
  if (dbPool && !connectionError) {
    try {
      await dbPool.query(
        `UPDATE catalog_frames 
         SET brand = $1, model = $2, color = $3, material = $4, price = $5 
         WHERE id = $6`,
        [frame.brand, frame.model, frame.color, frame.material, frame.price, id]
      );
      res.json({ success: true, frame });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    const idx = fallbackFrames.findIndex(f => f.id === id);
    if (idx >= 0) {
      fallbackFrames[idx] = { ...fallbackFrames[idx], ...frame };
      res.json({ success: true, frame: fallbackFrames[idx], fallback: true });
    } else {
      res.status(404).json({ error: "Frame not found" });
    }
  }
});

app.delete("/api/catalog/frames/:id", async (req, res) => {
  const { id } = req.params;
  if (dbPool && !connectionError) {
    try {
      await dbPool.query("DELETE FROM catalog_frames WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    fallbackFrames = fallbackFrames.filter(f => f.id !== id);
    res.json({ success: true, fallback: true });
  }
});

// ──────────────────────────────────────────────────────────────────
// CRYSTALS CATALOG APIs
// ──────────────────────────────────────────────────────────────────

app.get("/api/catalog/crystals", async (req, res) => {
  if (dbPool && !connectionError) {
    try {
      const result = await dbPool.query("SELECT id, brand, type, material, CAST(price AS DOUBLE PRECISION) as price FROM catalog_crystals ORDER BY brand, type");
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.json(fallbackCrystals);
  }
});

app.post("/api/catalog/crystals", async (req, res) => {
  const crystal = req.body;
  if (!crystal.id) crystal.id = `lun}-${Date.now()}`;
  
  if (dbPool && !connectionError) {
    try {
      await dbPool.query(
        `INSERT INTO catalog_crystals (id, brand, type, material, price) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE 
         SET brand = EXCLUDED.brand, type = EXCLUDED.type, material = EXCLUDED.material, price = EXCLUDED.price`,
        [crystal.id, crystal.brand, crystal.type, crystal.material || "", crystal.price || 0]
      );
      res.json({ success: true, crystal });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    const idx = fallbackCrystals.findIndex(c => c.id === crystal.id);
    if (idx >= 0) {
      fallbackCrystals[idx] = crystal;
    } else {
      fallbackCrystals.push(crystal);
    }
    res.json({ success: true, crystal, fallback: true });
  }
});

app.put("/api/catalog/crystals/:id", async (req, res) => {
  const { id } = req.params;
  const crystal = req.body;
  if (dbPool && !connectionError) {
    try {
      await dbPool.query(
        `UPDATE catalog_crystals 
         SET brand = $1, type = $2, material = $3, price = $4 
         WHERE id = $5`,
        [crystal.brand, crystal.type, crystal.material, crystal.price, id]
      );
      res.json({ success: true, crystal });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    const idx = fallbackCrystals.findIndex(c => c.id === id);
    if (idx >= 0) {
      fallbackCrystals[idx] = { ...fallbackCrystals[idx], ...crystal };
      res.json({ success: true, crystal: fallbackCrystals[idx], fallback: true });
    } else {
      res.status(404).json({ error: "Crystal not found" });
    }
  }
});

app.delete("/api/catalog/crystals/:id", async (req, res) => {
  const { id } = req.params;
  if (dbPool && !connectionError) {
    try {
      await dbPool.query("DELETE FROM catalog_crystals WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    fallbackCrystals = fallbackCrystals.filter(c => c.id !== id);
    res.json({ success: true, fallback: true });
  }
});

// ──────────────────────────────────────────────────────────────────
// CRM REMINDERS APIs
// ──────────────────────────────────────────────────────────────────

app.get("/api/reminders", async (req, res) => {
  if (dbPool && !connectionError) {
    try {
      const result = await dbPool.query("SELECT * FROM reminders ORDER BY date ASC, time ASC");
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.json(fallbackReminders);
  }
});

app.post("/api/reminders", async (req, res) => {
  const rem = req.body;
  if (!rem.id) rem.id = `rem-${Date.now()}`;
  if (dbPool && !connectionError) {
    try {
      await dbPool.query(
        `INSERT INTO reminders (id, quote_id, client_name, date, time, notes, completed) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [rem.id, rem.quote_id || null, rem.client_name, rem.date, rem.time || "", rem.notes || "", rem.completed || false]
      );
      res.json({ success: true, reminder: rem });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    fallbackReminders.push(rem);
    res.json({ success: true, reminder: rem, fallback: true });
  }
});

app.put("/api/reminders/:id", async (req, res) => {
  const { id } = req.params;
  const rem = req.body;
  if (dbPool && !connectionError) {
    try {
      await dbPool.query(
        `UPDATE reminders 
         SET quote_id = $1, client_name = $2, date = $3, time = $4, notes = $5, completed = $6 
         WHERE id = $7`,
        [rem.quote_id || null, rem.client_name, rem.date, rem.time || "", rem.notes || "", rem.completed || false, id]
      );
      res.json({ success: true, reminder: rem });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    const idx = fallbackReminders.findIndex(r => r.id === id);
    if (idx >= 0) {
      fallbackReminders[idx] = { ...fallbackReminders[idx], ...rem };
      res.json({ success: true, reminder: fallbackReminders[idx], fallback: true });
    } else {
      res.status(404).json({ error: "Reminder not found" });
    }
  }
});

app.delete("/api/reminders/:id", async (req, res) => {
  const { id } = req.params;
  if (dbPool && !connectionError) {
    try {
      await dbPool.query("DELETE FROM reminders WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } else {
    fallbackReminders = fallbackReminders.filter(r => r.id !== id);
    res.json({ success: true, fallback: true });
  }
});

// Clear fallback data (to support the clean start requirement)
app.post("/api/db/clear-fallback", (req, res) => {
  fallbackQuotes = [];
  fallbackLogs = [];
  fallbackReminders = [];
  fallbackFrames = [];
  fallbackCrystals = [];
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
