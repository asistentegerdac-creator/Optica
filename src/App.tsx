import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserRole, Quote, CrmNote, FrameTemplate, CrystalTemplate, Treatment, Gift, ActionLog 
} from './types';
import { 
  initialQuotes, mockFrames, mockCrystals, mockTreatments, mockGifts, initialLogs 
} from './data/mockData';

// Subcomponents
import PrintDocument from './components/PrintDocument';

// Recharts for stats
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Icons
import { 
  LayoutDashboard, ShoppingBag, TrendingUp, Search, Plus, Printer, Coins, 
  Activity, Sparkles, Calendar, Tag, Gift as GiftIcon, FileText, Check, 
  ChevronRight, AlertTriangle, Phone, Mail, MapPin, X, Bell, CheckCircle2,
  PhoneCall, MessageSquare, Award, Clock, ArrowRight, ClipboardList, Trash2, HeartHandshake,
  Database
} from 'lucide-react';

export default function App() {
  // 1. Core State with LocalStorage & API Sync fallback
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('crm_quotes');
    return saved ? JSON.parse(saved) : initialQuotes;
  });

  const [logs, setLogs] = useState<ActionLog[]>(() => {
    const saved = localStorage.getItem('crm_logs');
    return saved ? JSON.parse(saved) : initialLogs;
  });

  // DB Connection States
  const [dbConnected, setDbConnected] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbConfig, setDbConfig] = useState<any>(null);

  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('5432');
  const [dbUser, setDbUser] = useState('postgres');
  const [dbPassword, setDbPassword] = useState('');
  const [dbName, setDbName] = useState('optivision');
  const [dbSsl, setDbSsl] = useState(false);

  // States to add custom treatments and gifts dynamically
  const [treatmentPrices, setTreatmentPrices] = useState<{ [name: string]: number }>({});
  const [customTreatments, setCustomTreatments] = useState<{ name: string; price: number }[]>([]);
  const [newTreatmentName, setNewTreatmentName] = useState('');
  const [newTreatmentPrice, setNewTreatmentPrice] = useState<number>(0);

  const [customGifts, setCustomGifts] = useState<string[]>([]);
  const [newGiftName, setNewGiftName] = useState('');

  // Navigation
  // Tabs: 'dashboard' | 'cotizador' | 'crm' | 'database'
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'cotizador' | 'crm' | 'database'>('dashboard');
  const [currentUser, setCurrentUser] = useState<string>('Estefany López');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.Vendedor);

  // 2. POS Quote Builder Inline Form State
  const [clientName, setClientName] = useState('');
  const [clientDni, setClientDni] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Prescription Parameters State (Optional)
  const [hasPrescription, setHasPrescription] = useState(false);
  const [odSphere, setOdSphere] = useState('0.00');
  const [odCylinder, setOdCylinder] = useState('0.00');
  const [odAxis, setOdAxis] = useState('0°');
  const [odAddition, setOdAddition] = useState('0.00');
  const [odDip, setOdDip] = useState('0.0');

  const [oiSphere, setOiSphere] = useState('0.00');
  const [oiCylinder, setOiCylinder] = useState('0.00');
  const [oiAxis, setOiAxis] = useState('0°');
  const [oiAddition, setOiAddition] = useState('0.00');
  const [oiDip, setOiDip] = useState('0.0');

  const [lensType, setLensType] = useState<"Monofocal" | "Bifocal" | "Multifocal" | "Ocupacional" | "Digital" | "Solo Montura">('Monofocal');
  const [doctorName, setDoctorName] = useState('');

  // Selected Items Strategy (Preset vs Custom)
  const [frameInputMode, setFrameInputMode] = useState<'preset' | 'custom'>('preset');
  const [selectedFramePresetId, setSelectedFramePresetId] = useState('mon-1');
  const [customFrameBrand, setCustomFrameBrand] = useState('');
  const [customFrameModel, setCustomFrameModel] = useState('');
  const [customFrameColor, setCustomFrameColor] = useState('');
  const [customFrameMaterial, setCustomFrameMaterial] = useState('');
  const [customFramePrice, setCustomFramePrice] = useState<number>(0);

  const [crystalInputMode, setCrystalInputMode] = useState<'preset' | 'custom'>('preset');
  const [selectedCrystalPresetId, setSelectedCrystalPresetId] = useState('lun-1');
  const [customCrystalBrand, setCustomCrystalBrand] = useState('');
  const [customCrystalType, setCustomCrystalType] = useState<"Monofocal" | "Bifocal" | "Multifocal" | "Ocupacional" | "Blue Light" | "Fotocromáticas" | "Ninguno">('Monofocal');
  const [customCrystalMaterial, setCustomCrystalMaterial] = useState('');
  const [customCrystalPrice, setCustomCrystalPrice] = useState<number>(0);

  // Extra checkable options
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [observations, setObservations] = useState('');
  const [validDays, setValidDays] = useState<number>(15);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

  // 3. CRM Follow-up Trigger States
  const [selectedQuoteForCrm, setSelectedQuoteForCrm] = useState<Quote | null>(null);
  const [crmNoteType, setCrmNoteType] = useState<'Llamada' | 'WhatsApp' | 'Correo' | 'Visita' | 'Otro'>('WhatsApp');
  const [crmNoteDetails, setCrmNoteDetails] = useState('');
  const [crmScheduleDate, setCrmScheduleDate] = useState('');
  const [crmScheduleNotes, setCrmScheduleNotes] = useState('');

  // Filters for CRM Tab Quotes Checklist
  const [searchQuery, setSearchQuery] = useState('');
  const [crmStatusFilter, setCrmStatusFilter] = useState<string>('Todos');

  // Print simulation launcher
  const [printQuote, setPrintQuote] = useState<Quote | null>(null);

  // Fetch status and data from Postgres APIs
  const fetchAllData = async () => {
    try {
      const statusRes = await fetch('/api/db/status');
      const statusData = await statusRes.json();
      setDbConnected(statusData.connected);
      setDbError(statusData.error);
      setDbConfig(statusData.config);

      if (statusData.config) {
        setDbHost(statusData.config.host || 'localhost');
        setDbPort(statusData.config.port?.toString() || '5432');
        setDbUser(statusData.config.user || 'postgres');
        setDbName(statusData.config.database || 'optivision');
        setDbSsl(!!statusData.config.ssl);
      }

      const quotesRes = await fetch('/api/quotes');
      const quotesData = await quotesRes.json();
      setQuotes(quotesData);

      const logsRes = await fetch('/api/logs');
      const logsData = await logsRes.json();
      setLogs(logsData);
    } catch (e) {
      console.error("API Fetch error, utilizing Client state fallback:", e);
    }
  };

  const handleTestAndSaveDb = async () => {
    try {
      const res = await fetch('/api/db/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          database: dbName,
          ssl: dbSsl
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("¡Conexión con PostgreSQL exitosa! Las tablas fueron creadas y el sistema está sincronizado permanentemente.");
        await fetchAllData();
      } else {
        alert("Error de conexión: " + (data.error || "No se pudo conectar a Postgres. Revise credenciales."));
      }
    } catch (e: any) {
      alert("Error crítico al configurar base de datos: " + (e.message || "Fallo de conexión."));
    }
  };

  const handleClearFallbackData = async () => {
    if (window.confirm("¿Está seguro de borrar la memoria volátil del CRM? Esta acción limpiará todas las cotizaciones creadas en fallback y restablecerá el sistema en blanco.")) {
      try {
        await fetch('/api/db/clear-fallback', { method: 'POST' });
        alert("Memoria volátil de cotizaciones y logs borrada exitosamente.");
        await fetchAllData();
      } catch (e: any) {
        alert("Error al vaciar datos: " + e.message);
      }
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Backwards-compatible action writer, syncs immediately with PG database
  const addLog = async (action: string, details: string) => {
    const newLog: ActionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser,
      role: currentUserRole,
      action,
      details
    };
    
    setLogs(prev => [newLog, ...prev]);
    localStorage.setItem('crm_logs', JSON.stringify([newLog, ...logs]));

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
    } catch (err) {
      console.error("API Log push failed:", err);
    }
  };

  // 4. Resolve frame descriptions dynamically
  const activeFrame = useMemo(() => {
    return {
      brand: customFrameBrand,
      model: customFrameModel,
      color: customFrameColor,
      material: customFrameMaterial,
      price: customFramePrice
    };
  }, [customFrameBrand, customFrameModel, customFrameColor, customFrameMaterial, customFramePrice]);

  // Resolve crystal descriptions dynamically
  const activeCrystal = useMemo(() => {
    return {
      brand: customCrystalBrand,
      type: customCrystalType,
      material: customCrystalMaterial,
      price: customCrystalPrice
    };
  }, [customCrystalBrand, customCrystalType, customCrystalMaterial, customCrystalPrice]);

  // Computing Subtotals reactively
  const subtotalPrice = useMemo(() => {
    let sum = activeFrame.price + activeCrystal.price;
    // Add treatment pricing if matched and checked in treatments catalog
    selectedTreatments.forEach(trName => {
      const price = treatmentPrices[trName] !== undefined
        ? treatmentPrices[trName]
        : (mockTreatments.find(t => t.name === trName || t.id === trName)?.price || 0);
      sum += price;
    });
    return sum;
  }, [activeFrame, activeCrystal, selectedTreatments, treatmentPrices]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percentage') {
      return (subtotalPrice * discountValue) / 100;
    }
    return Math.min(discountValue, subtotalPrice);
  }, [subtotalPrice, discountType, discountValue]);

  const totalPrice = useMemo(() => {
    return Math.max(0, subtotalPrice - discountAmount);
  }, [subtotalPrice, discountAmount]);

  const taxAmount = useMemo(() => {
    // 18% IGV Peru is historically calculated as tax-included block of the grand total
    return totalPrice - (totalPrice / 1.18);
  }, [totalPrice]);

  // 5. Pre-fill autocomplete mock clients to simplify tester life
  const handleSelectRecentClientPreset = (index: number) => {
    const clientsPreset = [
      { name: "Carlos Mendoza Quispe", dni: "47281938", phone: "987654321", email: "carlos.mendoza@email.com", address: "Av. Larco 452, Miraflores, Lima" },
      { name: "Ana Sofía Rodríguez Silva", dni: "72198302", phone: "912345678", email: "ana.rodriguez@email.com", address: "Calle Los Pinos 104, San Isidro, Lima" },
      { name: "José Miguel Herrera Ramos", dni: "09182374", phone: "998877665", email: "jherrera@email.com", address: "Jr. Huallaga 892, Centro de Lima" },
      { name: "María Elena Delgado Paz", dni: "41928374", phone: "945612378", email: "maria.epaz@email.com", address: "Av. Primavera 1238, Santiago de Surco" }
    ];
    const client = clientsPreset[index];
    if (client) {
      setClientName(client.name);
      setClientDni(client.dni);
      setClientPhone(client.phone);
      setClientEmail(client.email);
      setClientAddress(client.address);
      addLog("Autocomplete cliente", `Se autocompletaron los campos para ${client.name}`);
    }
  };

  // Convert state entries to a Quote
  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert("Por favor ingrese el Nombre del Cliente.");
      return;
    }

    const newQuote: Quote = {
      id: `cot-${Date.now()}`,
      quoteNumber: `COT-2026-0${quotes.length + 1}`,
      date: new Date().toISOString(),
      
      clientName,
      clientDni,
      clientPhone,
      clientEmail,
      clientAddress,

      hasPrescription,
      od: {
        sphere: odSphere,
        cylinder: odCylinder,
        axis: odAxis,
        addition: odAddition,
        dip: odDip
      },
      oi: {
        sphere: oiSphere,
        cylinder: oiCylinder,
        axis: oiAxis,
        addition: oiAddition,
        dip: oiDip
      },
      lensType: hasPrescription ? lensType : 'Solo Montura',
      doctorName: hasPrescription ? doctorName : undefined,

      frameBrand: activeFrame.brand,
      frameModel: activeFrame.model,
      frameColor: activeFrame.color,
      frameMaterial: activeFrame.material,
      framePrice: activeFrame.price,

      crystalBrand: activeCrystal.brand,
      crystalType: activeCrystal.type,
      crystalMaterial: activeCrystal.material,
      crystalPrice: activeCrystal.price,

      selectedTreatments: [...selectedTreatments],
      selectedGifts: [...selectedGifts],
      treatmentPrices: { ...treatmentPrices },

      subtotal: subtotalPrice,
      discountType,
      discountValue,
      discountAmount,
      igv: taxAmount,
      total: totalPrice,

      observations,
      validDays,
      estimatedDeliveryDate: estimatedDeliveryDate || new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],

      status: 'Nuevo',
      crmNotes: [
        {
          id: `crm-note-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: currentUser,
          details: `Cotización inicial generada formalmente. Enviados precios de Montura (${activeFrame.brand || "Sin montura"}) y Luna (${activeCrystal.brand || "Sin lunas"}).`,
          interactionType: 'Otro'
        }
      ],
      nextContactDate: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0], // 2 days follow up suggested
      nextActionNotes: "Escribir recordándole la cotización de lunas oftálmicas."
    };

    // Optimistically update locally
    setQuotes(prev => [newQuote, ...prev]);
    addLog("Guardar Cotización", `Se guardó la cotización ${newQuote.quoteNumber} para ${newQuote.clientName} por S/ ${newQuote.total.toFixed(2)}.`);

    // Persistent save through Express API
    try {
      await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuote)
      });
      // Sync from DB
      fetchAllData();
    } catch (err) {
      console.error("API Quote save failed, using local fallback state:", err);
    }

    // Open print Document immediately
    setPrintQuote(newQuote);

    // Clear quote inputs to prevent dirty repeats
    setClientName('');
    setClientDni('');
    setClientPhone('');
    setClientEmail('');
    setClientAddress('');
    setHasPrescription(false);
    setOdSphere('0.00');
    setOdCylinder('0.00');
    setOdAxis('0°');
    setOdAddition('0.00');
    setOdDip('0.0');
    setOiSphere('0.00');
    setOiCylinder('0.00');
    setOiAxis('0°');
    setOiAddition('0.00');
    setOiDip('0.0');
    setLensType('Monofocal');
    setDoctorName('');
    setCustomFrameBrand('');
    setCustomFrameModel('');
    setCustomFrameColor('');
    setCustomFrameMaterial('');
    setCustomFramePrice(0);
    setCustomCrystalBrand('');
    setCustomCrystalType('Monofocal');
    setCustomCrystalMaterial('');
    setCustomCrystalPrice(0);
    setSelectedTreatments([]);
    setSelectedGifts([]);
    setDiscountValue(0);
    setObservations('');
    setEstimatedDeliveryDate('');

    // Go to CRM tab
    setCurrentTab('crm');
  };

  // 6. Inline CRM Actions note additions
  const handleAddCrmNote = async () => {
    if (!selectedQuoteForCrm || !crmNoteDetails.trim()) return;

    const newNote: CrmNote = {
      id: `note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser,
      details: crmNoteDetails,
      interactionType: crmNoteType
    };

    const targetQuote = quotes.find(q => q.id === selectedQuoteForCrm.id);
    if (!targetQuote) return;

    const updatedQuote: Quote = {
      ...targetQuote,
      crmNotes: [...targetQuote.crmNotes, newNote],
      nextContactDate: crmScheduleDate,
      nextActionNotes: crmScheduleNotes
    };

    const updatedQuotes = quotes.map(q => q.id === selectedQuoteForCrm.id ? updatedQuote : q);
    setQuotes(updatedQuotes);
    setSelectedQuoteForCrm(updatedQuote);
    addLog("Anotación CRM", `Se añadió nota de tipo ${crmNoteType} para cotización ${selectedQuoteForCrm.quoteNumber}.`);
    setCrmNoteDetails('');

    try {
      await fetch(`/api/quotes/${selectedQuoteForCrm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuote)
      });
      fetchAllData();
    } catch (err) {
      console.error("Failed to update CRM notes on server:", err);
    }
  };

  // Change quote status in CRM pane
  const handleUpdateQuoteStatusDirect = async (quoteId: string, newStatus: Quote['status']) => {
    const targetQuote = quotes.find(q => q.id === quoteId);
    if (!targetQuote) return;

    const updatedQuote: Quote = {
      ...targetQuote,
      status: newStatus,
      crmNotes: [
        ...targetQuote.crmNotes,
        {
          id: `log-status-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: currentUser,
          details: `Estado comercial actualizado manualmente a: [${newStatus}]`,
          interactionType: 'Otro'
        }
      ]
    };

    const updated = quotes.map(q => q.id === quoteId ? updatedQuote : q);
    setQuotes(updated);
    if (selectedQuoteForCrm && selectedQuoteForCrm.id === quoteId) {
      setSelectedQuoteForCrm(updatedQuote);
    }

    addLog("Cambio de Estado", `Se actualizó cotización ${targetQuote.quoteNumber} a estado: ${newStatus}`);

    try {
      await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuote)
      });
      fetchAllData();
    } catch (err) {
      console.error("Failed to save state on server:", err);
    }
  };

  // Delete quote
  const handleDeleteQuote = async (id: string, number: string) => {
    // Avoid window.confirm/alert that block in iFrame if possible, but keeping confirm since it is safe and works when opened
    if (window.confirm(`¿Está seguro que desea eliminar la cotización ${number}? Esta acción no se puede deshacer.`)) {
      setQuotes(prev => prev.filter(q => q.id !== id));
      addLog("Eliminar Cotización", `Se eliminó físicamente el registro de cotización ${number}.`);
      if (selectedQuoteForCrm?.id === id) {
        setSelectedQuoteForCrm(null);
      }

      try {
        await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
        fetchAllData();
      } catch (err) {
        console.error("Failed to delete quote on server:", err);
      }
    }
  };

  // 7. Dynamic Computed Statistics for Dashboard
  const statsMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayQuotes = quotes.filter(q => q.date.split('T')[0] === todayStr);

    const totalQuotedToday = todayQuotes.reduce((sum, q) => sum + q.total, 0);
    const countToday = todayQuotes.length;

    // Total general calculations
    const totalQuotesCount = quotes.length;
    const acceptedQuotes = quotes.filter(q => q.status === 'Aceptado / Ganado');
    const totalWonSum = acceptedQuotes.reduce((sum, q) => sum + q.total, 0);
    
    // Conversion rate (%)
    const conversionRate = totalQuotesCount > 0 
      ? (acceptedQuotes.length / totalQuotesCount) * 100 
      : 0;

    // Schedulers alerts for today or past due
    const todayTime = new Date().setHours(0,0,0,0);
    const followUpAlerts = quotes.filter(q => {
      if (!q.nextContactDate || q.status === 'Aceptado / Ganado' || q.status === 'Cancelado') return false;
      const alertTime = new Date(q.nextContactDate).setHours(0,0,0,0);
      return alertTime <= todayTime;
    });

    return {
      totalQuotedToday,
      countToday,
      totalQuotesCount,
      wonQuotesCount: acceptedQuotes.length,
      totalWonSum,
      conversionRate,
      followUpAlerts
    };
  }, [quotes]);

  // Aggregate daily records for recharts AreaGraph
  const dailyChartData = useMemo(() => {
    const dayMap: { [dateStr: string]: { dateLabel: string; valor: number; cantidad: number } } = {};
    
    // Fill last 5 days with 0 initial to make graphs look complete even when empty
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const friendlyLabel = d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
      dayMap[iso] = { dateLabel: friendlyLabel, valor: 0, cantidad: 0 };
    }

    quotes.forEach(q => {
      const iso = q.date.split('T')[0];
      if (dayMap[iso] !== undefined) {
        dayMap[iso].valor += q.total;
        dayMap[iso].cantidad += 1;
      } else {
        // Also capture older dates
        const dateObj = new Date(q.date);
        const label = dateObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
        dayMap[iso] = { dateLabel: label, valor: q.total, cantidad: 1 };
      }
    });

    // Sort chronologically
    return Object.keys(dayMap)
      .sort((a,b) => a.localeCompare(b))
      .slice(-7) // Show last 7 days max for spacing density
      .map(key => dayMap[key]);
  }, [quotes]);

  // Status breakdown data for graphic pie chart
  const statusPieData = useMemo(() => {
    const counts = { Nuevo: 0, 'En Seguimiento': 0, 'Aceptado / Ganado': 0, Rechazado: 0, Cancelado: 0 };
    quotes.forEach(q => {
      if (counts[q.status] !== undefined) {
        counts[q.status]++;
      } else if (q.status === 'Aceptado / Ganado') {
        counts['Aceptado / Ganado']++;
      }
    });

    return [
      { name: 'Nuevas', value: counts['Nuevo'], color: '#38bdf8' }, // sky
      { name: 'En Seguimiento', value: counts['En Seguimiento'], color: '#f59e0b' }, // amber
      { name: 'Ganadas (Aceptadas)', value: counts['Aceptado / Ganado'], color: '#10b981' }, // emerald
      { name: 'Rechazadas / Perdidas', value: counts['Rechazado'] + counts['Cancelado'], color: '#ef4444' } // red
    ].filter(item => item.value > 0);
  }, [quotes]);

  // Dynamic searches filtering for general quotes list
  const filteredQuotes = useMemo(() => {
    let result = quotes;

    // Filter status
    if (crmStatusFilter !== 'Todos') {
      result = result.filter(q => q.status === crmStatusFilter);
    }

    // Filter text search (Name, DNI, quote description, quote number)
    if (searchQuery.trim()) {
      const low = searchQuery.toLowerCase().trim();
      result = result.filter(q => 
        q.clientName.toLowerCase().includes(low) ||
        q.clientDni.includes(low) ||
        q.clientPhone.includes(low) ||
        q.quoteNumber.toLowerCase().includes(low) ||
        (q.frameBrand && q.frameBrand.toLowerCase().includes(low))
      );
    }

    return result;
  }, [quotes, crmStatusFilter, searchQuery]);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden no-print">
      
      {/* ──────────────────────────────────────────────────────────────────
          SIDEBAR CONFIGURATION (Swiss geometric branding)
          ────────────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none no-print">
        
        {/* Brand visual header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2.5 text-sky-450 font-bold text-xl tracking-tight">
            <div className="w-9 h-9 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-5050/30">
              <span className="font-serif text-sky-400 text-xl font-black">O</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-black text-white tracking-widest text-base">OPTIVISION</span>
              <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase mb-1">CRM Cotizador</span>
            </div>
          </div>
        </div>

        {/* User identification */}
        <div className="px-5 py-2">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider">Operador Actual</span>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            </div>
            <p className="font-bold text-white uppercase">{currentUser}</p>
            <select
              value={currentUserRole}
              onChange={(e) => {
                const role = e.target.value as UserRole;
                setCurrentUserRole(role);
                setCurrentUser(role === UserRole.Administrador ? 'Juan Pérez' : 'Estefany López');
                addLog('Cambio Perfil', `Firma del operador modificada a ${role}`);
              }}
              className="mt-1 w-full bg-slate-950 p-1 rounded border border-slate-700 text-[10px] text-sky-400 font-bold focus:outline-hidden"
              id="role-switcher-dropdown"
            >
              <option value={UserRole.Vendedor}>Asesor Comercial ({UserRole.Vendedor})</option>
              <option value={UserRole.Administrador}>Administrador ({UserRole.Administrador})</option>
            </select>
          </div>
        </div>

        {/* Nav list options */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <span className="block text-[9px] uppercase font-black text-slate-500 tracking-widest px-3 mb-2">OPERATOR VIEW</span>
          
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              currentTab === 'dashboard' 
                ? 'bg-sky-600 text-white shadow-xs font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            id="nav-tab-dashboard"
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            Dashboard y Reportes
          </button>

          <button
            onClick={() => setCurrentTab('crm')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              currentTab === 'crm' 
                ? 'bg-sky-600 text-white shadow-xs font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            id="nav-tab-crm"
          >
            <span className="flex items-center gap-3">
              <ClipboardList className="w-4.5 h-4.5" />
              CRM Seguimiento
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 rounded-sm font-bold">
              {quotes.length}
            </span>
          </button>

          <div className="pt-4 pb-2 border-t border-slate-800 my-4">
            <span className="block text-[9px] uppercase font-black text-slate-500 tracking-widest px-3 mb-2">QUOTATION EXPRESS</span>
          </div>

          <button
            onClick={() => setCurrentTab('cotizador')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold tracking-wider transition-all border border-dashed cursor-pointer ${
              currentTab === 'cotizador' 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md font-black scale-102' 
                : 'text-emerald-400 hover:text-white hover:bg-emerald-950/20 border-emerald-950/50'
            }`}
            id="nav-tab-cotizador"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            🎯 NUEVA PLANILLA POS
          </button>

          <div className="pt-4 pb-2 border-t border-slate-800 my-4">
            <span className="block text-[9px] uppercase font-black text-slate-500 tracking-widest px-3 mb-2">SISTEMA BASE DE DATOS</span>
          </div>

          <button
            onClick={() => setCurrentTab('database')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              currentTab === 'database' 
                ? 'bg-indigo-600 text-white shadow-xs font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            id="nav-tab-database"
          >
            <span className="flex items-center gap-3">
              <Database className="w-4.5 h-4.5 text-indigo-400" />
              Configurar Postgres Local
            </span>
            <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          </button>

          {/* Alert Alerts reminders trigger */}
          {statsMetrics.followUpAlerts.length > 0 && (
            <div className="mt-6 p-3 bg-amber-950/20 border border-amber-900/60 rounded-xl space-y-1.5 text-left select-none">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px] tracking-wider uppercase font-mono">
                <Bell className="w-3.5 h-3.5 animate-bounce shrink-0" />
                Seguimientos Hoy ({statsMetrics.followUpAlerts.length})
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">Tienes pacientes agendados para contacto hoy.</p>
              <button 
                onClick={() => { setCrmStatusFilter('En Seguimiento'); setCurrentTab('crm'); }}
                className="text-[9.5px] text-amber-400 font-bold hover:underline font-mono flex items-center gap-0.5"
              >
                Ver alertas agendadas <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400 space-y-0.5 font-mono text-left">
          <p className="font-bold text-white uppercase">{currentUser}</p>
          <p className="text-[9.5px] text-slate-500">OptiVision POS CRM v4.0</p>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────────────
          MAIN DISPLAY SPLIT
          ────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden no-print">
        
        {/* Dynamic header Status Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-xs z-10 no-print">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
              <span className="text-sky-700 font-extrabold tracking-tight">Caja central</span> 
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 font-light text-sm">
                {currentTab === 'dashboard' && 'Dashboard de Presupuestos y Reporte Diario'}
                {currentTab === 'cotizador' && 'Generación de Cotización Oftalmológica'}
                {currentTab === 'crm' && 'CRM Seguimiento y Post-Venta'}
                {currentTab === 'database' && 'Configuración de Conexión local PostgreSQL'}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {dbConnected ? (
              <button 
                onClick={() => setCurrentTab('database')}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-full text-[10px] text-emerald-700 font-bold font-mono transition-all cursor-pointer"
              >
                <Database className="w-3 h-3 animate-pulse" />
                POSTGRESQL CONECTADO
              </button>
            ) : (
              <button 
                onClick={() => setCurrentTab('database')}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-full text-[10px] text-rose-700 font-bold font-mono transition-all cursor-pointer animate-pulse"
              >
                <Database className="w-3 h-3" />
                POSTGRES DESCONECTADO (CONFIGURAR)
              </button>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-100 rounded-full text-[10px] text-sky-700 font-bold font-mono">
              <Activity className="w-3.5 h-3.5" />
              CRM SINCRONIZADO
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT SCROLLABLE CANVAS */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 scrollbar-thin">
          
          {/* A. DASHBOARD & ANALYTICS TAB */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Top Metrics Indicators Box */}
              <div className="grid grid-cols-4 gap-4">
                
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Cotizado HOY</span>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black text-sky-600 font-mono tracking-tight">
                      S/ {statsMetrics.totalQuotedToday.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-sky-600 font-bold bg-sky-50 px-1 rounded-sm">
                      {statsMetrics.countToday} Planillas
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400">Total presupuestado el día de hoy</p>
                </div>

                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Conversión CRM</span>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                      {statsMetrics.conversionRate.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded-sm">
                      {statsMetrics.wonQuotesCount} Ganadas
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400">Tasa de aceptación de presupuestos</p>
                </div>

                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Monto Ganado</span>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                      S/ {statsMetrics.totalWonSum.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono font-bold">
                      {quotes.length} Emitidas
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400">Suma total de cotizaciones aprobadas</p>
                </div>

                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Seguimiento Activo</span>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black text-amber-500 font-mono tracking-tight">
                      {quotes.filter(q => q.status === 'En Seguimiento').length}
                    </span>
                    {statsMetrics.followUpAlerts.length > 0 ? (
                      <span className="text-[9px] text-rose-600 font-bold bg-rose-50 px-1 rounded-sm animate-pulse">
                        {statsMetrics.followUpAlerts.length} HOY!
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-bold bg-slate-50 px-1 rounded-sm">
                        Al día
                      </span>
                    )}
                  </div>
                  <p className="text-[9.5px] text-slate-400">Presupuestos en etapa de llamada/negociación</p>
                </div>

              </div>

              {/* Graphical Analysis Split Panel */}
              <div className="grid grid-cols-3 gap-6">
                
                {/* 1. Daily Quoted Value Graph Recharts Area Chart */}
                <div className="col-span-2 bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider text-xs">
                      <TrendingUp className="w-4 h-4 text-sky-500" />
                      Monto Cotizado por Día (Últimos Días de Mayo)
                    </h3>
                    <p className="text-xs text-slate-500">Muestra el volumen monetario de cotizaciones generadas en la clínica por cada día.</p>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dailyChartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="dateLabel" 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(v) => `S/ ${v}`}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                          formatter={(value: any) => [`S/ ${parseFloat(value).toFixed(2)}`, 'Suma Cotizada']}
                          labelFormatter={(label) => `Fecha: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="valor" 
                          stroke="#0284c7" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#colorValor)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Right col Funnel/Conversion Pie Chart */}
                <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider text-xs">
                      <ClipboardList className="w-4.5 h-4.5 text-indigo-500" />
                      Embudo Comercial CRM
                    </h3>
                    <p className="text-xs text-slate-500">Distribución porcentual de los presupuestos por estado actual.</p>
                  </div>

                  <div className="h-48 w-full flex items-center justify-center relative">
                    {statusPieData.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No hay suficientes cotizaciones para calcular porcentajes.</p>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {statusPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '10px', border: 'none' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Center text indicating total */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-lg font-black text-slate-900 font-mono leading-none">{quotes.length}</span>
                          <span className="text-[8px] text-slate-440 uppercase font-bold tracking-wider">Planillas</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5 text-[10px] bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ganada</span>
                      <strong className="font-mono">{statusPieData.find(i => i.name === 'Ganadas (Aceptadas)')?.value || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Seguimiento</span>
                      <strong className="font-mono">{statusPieData.find(i => i.name === 'En Seguimiento')?.value || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-450"></span> Nuevas</span>
                      <strong className="font-mono">{statusPieData.find(i => i.name === 'Nuevas')?.value || 0}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Third section: Follow-up alarms list right inside dashboard to action quickly */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-rose-500 shrink-0" />
                      Alertas de Seguimiento Pendientes para Hoy o Atrasadas
                    </h3>
                    <p className="text-xs text-slate-500 font-light">Clientes agendados en el CRM a los cuales debes llamar o escribir para concretar su compra.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">Total Alarmas: {statsMetrics.followUpAlerts.length}</span>
                </div>

                {statsMetrics.followUpAlerts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic text-xs space-y-1">
                    <p className="text-emerald-600 font-bold block text-sm">✓ Todo al día</p>
                    <p>No hay alertas de contactos agendados pendientes para la fecha actual.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {statsMetrics.followUpAlerts.slice(0, 4).map(q => (
                      <div key={q.id} className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-3 relative overflow-hidden flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex justify-between font-bold items-start leading-none mb-1">
                            <span className="text-amber-800 font-mono text-[10px] font-black uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-amber-200">{q.quoteNumber}</span>
                            <span className="text-rose-600 font-mono text-xs">Venc: {q.nextContactDate}</span>
                          </div>
                          <p className="font-bold text-slate-900 text-xs truncate uppercase">Paciente: {q.clientName}</p>
                          <p className="text-[10.5px] text-slate-600 bg-white p-2 rounded border border-slate-150 italic font-medium leading-relaxed">
                            "{q.nextActionNotes || "Sin llamada agendada descriptiva"}"
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <span className="text-slate-500 font-mono">Total Cotizado: S/ {q.total.toFixed(2)}</span>
                          <button
                            onClick={() => { setSelectedQuoteForCrm(q); }}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[9px] px-2.5 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <PhoneCall className="w-3 h-3" /> Iniciar CRM
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* B. EXPRESS QUOTES GENERATOR TAB */}
          {currentTab === 'cotizador' && (
            <form onSubmit={handleSaveQuote} className="grid grid-cols-3 gap-6 animate-fade-in text-left">
              
              {/* Left Column Span 2: Client, Rx, and Products configuration */}
              <div className="col-span-2 space-y-6">
                
                {/* Section 1: Client Information */}
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-indigo-50 pb-2">
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                      <div className="w-1.5 h-3.5 bg-indigo-600 rounded-xs"></div>
                      Paso 1: Información del Paciente
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <span>Rellenar Demo:</span>
                      <button type="button" onClick={() => handleSelectRecentClientPreset(0)} className="hover:text-sky-600 underline px-1 cursor-pointer">Carlos</button>|
                      <button type="button" onClick={() => handleSelectRecentClientPreset(1)} className="hover:text-sky-600 underline px-1 cursor-pointer">Ana</button>|
                      <button type="button" onClick={() => handleSelectRecentClientPreset(3)} className="hover:text-sky-600 underline px-1 cursor-pointer">María</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-4 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre Completo del Cliente <strong className="text-red-500">*</strong></label>
                      <input 
                        type="text" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Carlos Mendoza Quispe"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">DNI / CE</label>
                      <input 
                        type="text" 
                        value={clientDni}
                        onChange={(e) => setClientDni(e.target.value)}
                        maxLength={12}
                        placeholder="DNI Opcional"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Número telefónico</label>
                      <input 
                        type="text" 
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="celular de contacto para CRM"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Correo electrónico</label>
                      <input 
                        type="email" 
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="paciente@email.com"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>

                    <div className="col-span-6 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Dirección de entrega o habitación</label>
                      <input 
                        type="text" 
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        placeholder="calle, distrito, ciudad"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Optometric eye-test values (Opcional - Retractable Accordion) */}
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-sky-900 uppercase tracking-wide flex items-center gap-1.5">
                      <div className="w-1.5 h-3.5 bg-sky-600 rounded-xs"></div>
                      Paso 2: Medición y Receta Oftálmica
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={hasPrescription} 
                        onChange={(e) => setHasPrescription(e.target.checked)} 
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                      <span className="ml-2 text-xs font-bold text-slate-700">Asociar Receta</span>
                    </label>
                  </div>

                  {hasPrescription && (
                    <div className="space-y-4 animate-slide-down">
                      <div className="grid grid-cols-7 gap-1 bg-slate-100 border border-slate-200 rounded-lg p-3 text-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase self-end pb-1.5">Ojo</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase self-end pb-1.5 font-mono">Esfera (SPH)</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase self-end pb-1.5 font-mono">Cilindro (CYL)</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase self-end pb-1.5 font-mono">Eje (AXIS)</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase self-end pb-1.5 font-mono">Adic (ADD)</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase self-end pb-1.5 font-mono">DIP (mm)</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase self-end pb-1.5">Tipo</div>

                        {/* OD */}
                        <div className="text-xs font-extrabold text-slate-800 self-center">OD (Der)</div>
                        <div><input type="text" value={odSphere} onChange={(e) => setOdSphere(e.target.value)} className="w-full text-center text-xs p-1 bg-white border border-slate-200 rounded font-mono" /></div>
                        <div><input type="text" value={odCylinder} onChange={(e) => setOdCylinder(e.target.value)} className="w-full text-center text-xs p-1 bg-white border border-slate-200 rounded font-mono" /></div>
                        <div><input type="text" value={odAxis} onChange={(e) => setOdAxis(e.target.value)} className="w-full text-center text-xs p-1 bg-white border border-slate-200 rounded font-mono" /></div>
                        <div><input type="text" value={odAddition} onChange={(e) => setOdAddition(e.target.value)} className="w-full text-center text-xs p-1 bg-white border border-slate-200 rounded font-mono" /></div>
                        <div><input type="text" value={odDip} onChange={(e) => setOdDip(e.target.value)} className="w-full text-center text-xs p-1 bg-white border border-slate-200 rounded font-mono" /></div>
                        
                        {/* Lens type selector */}
                        <div className="row-span-2 self-center">
                          <select 
                            value={lensType} 
                            onChange={(e) => setLensType(e.target.value as any)} 
                            className="bg-white border border-slate-200 p-1 text-[10px] rounded block w-full focus:outline-hidden font-bold"
                          >
                            <option value="Monofocal">Mono</option>
                            <option value="Bifocal">Bifo</option>
                            <option value="Multifocal">Multi</option>
                            <option value="Ocupacional">Ocupa</option>
                            <option value="Digital">Digi</option>
                          </select>
                        </div>

                        {/* OI */}
                        <div className="text-xs font-extrabold text-slate-800 self-center">OI (Izq)</div>
                        <div><input type="text" value={oiSphere} onChange={(e) => setOiSphere(e.target.value)} className="w-full text-center text-xs p-1 bg-white border border-slate-200 rounded font-mono" /></div>
                        <div><input type="text" value={oiCylinder} onChange={(e) => setOiCylinder(e.target.value)} className="w-full text-center text-xs p-1 bg-white border border-slate-200 rounded font-mono" /></div>
                        <div><input type="text" value={oiAxis} onChange={(e) => setOiAxis(e.target.value)} className="w-full text-center text-xs p-1 bg-white border border-slate-200 rounded font-mono" /></div>
                        <div><input type="text" value={oiAddition} onChange={(e) => setOiAddition(e.target.value)} className="w-full text-center text-xs p-1 bg-white border border-slate-200 rounded font-mono" /></div>
                        <div><input type="text" value={oiDip} onChange={(e) => setOiDip(e.target.value)} className="w-full text-center text-xs p-1 bg-white border border-slate-200 rounded font-mono" /></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre del Especialista (Profesional Firmante)</label>
                          <input 
                            type="text" 
                            value={doctorName} 
                            onChange={(e) => setDoctorName(e.target.value)} 
                            placeholder="e.g. Dra. Rebeca Torres (C.O.P. 8492)" 
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                          />
                        </div>
                        <div className="text-slate-400 text-[10.5px] leading-relaxed self-center">
                          ℹ️ Los parámetros se imprimirán en las tablas oftálmicas del reporte A4 y ticket de caja como garantía de refracción.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Frame Configuration (Preset list or full custom) */}
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-indigo-50 pb-2">
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                      <div className="w-1.5 h-3.5 bg-indigo-600 rounded-xs"></div>
                      Paso 3: Montura Ofrecida
                    </h3>
                    
                    <div className="flex bg-slate-150 p-0.5 rounded-lg text-[10px] font-bold text-slate-600 font-mono">
                      <button 
                        type="button" 
                        onClick={() => setFrameInputMode('preset')}
                        className={`px-2 py-1 rounded-md transition-all ${frameInputMode === 'preset' ? 'bg-white text-indigo-900' : ''}`}
                      >
                        PREDETERMINADAS
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFrameInputMode('custom')}
                        className={`px-2 py-1 rounded-md transition-all ${frameInputMode === 'custom' ? 'bg-white text-indigo-900' : ''}`}
                      >
                        OTRA / PERSONALIZADO
                      </button>
                    </div>
                  </div>

                  {frameInputMode === 'preset' ? (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase leading-none">Seleccionar de catálogo actual (autocompleta los campos de edición)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {mockFrames.map((f) => (
                          <div
                            key={f.id}
                            type="button"
                            onClick={() => {
                              setSelectedFramePresetId(f.id);
                              setCustomFrameBrand(f.brand);
                              setCustomFrameModel(f.model);
                              setCustomFrameColor(f.color);
                              setCustomFrameMaterial(f.material);
                              setCustomFramePrice(f.price);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                              selectedFramePresetId === f.id 
                                ? 'border-sky-500 bg-sky-50/20 text-sky-950 font-bold shadow-xs' 
                                : 'border-slate-200 hover:border-slate-350 bg-slate-50/10'
                            }`}
                          >
                            <div>
                              <p className="font-extrabold truncate text-slate-900 uppercase text-[11px] leading-tight">{f.brand}</p>
                              <p className="text-[9.5px] text-slate-500 truncate">{f.model}</p>
                            </div>
                            <div className="flex justify-between items-baseline self-stretch">
                              <span className="text-[8px] uppercase tracking-wide px-1 rounded bg-slate-200 text-slate-600">{f.material}</span>
                              <span className="text-xs font-mono font-bold text-sky-600">S/ {f.price.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Interactive Sub-editing Form Block */}
                      <div className="mt-2 p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-3">
                        <span className="text-[9.5px] uppercase font-mono font-black tracking-widest text-slate-500 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          Detalles de Montura Seleccionada (¡PRECIOS E INFORMACIÓN 100% EDITABLES!)
                        </span>
                        <div className="grid grid-cols-4 gap-2.5 font-sans">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Marca del Aro</label>
                            <input type="text" value={customFrameBrand} onChange={(e) => setCustomFrameBrand(e.target.value)} className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-800" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Modelo específico</label>
                            <input type="text" value={customFrameModel} onChange={(e) => setCustomFrameModel(e.target.value)} className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-800" />
                          </div>
                          <div className="col-span-1.5 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Color / Patrón</label>
                            <input type="text" value={customFrameColor} onChange={(e) => setCustomFrameColor(e.target.value)} className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-800" />
                          </div>
                          <div className="col-span-1.5 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Material</label>
                            <input type="text" value={customFrameMaterial} onChange={(e) => setCustomFrameMaterial(e.target.value)} className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-800" />
                          </div>
                          <div className="col-span-1 space-y-1 text-center font-mono">
                            <label className="text-[9px] font-black text-indigo-900 uppercase font-sans block text-center">P. Venta (S/)</label>
                            <input type="number" value={customFramePrice || ''} onChange={(e) => setCustomFramePrice(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full text-xs p-1.5 bg-white border border-indigo-250 font-black focus:border-indigo-600 rounded-lg text-center text-slate-900" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3 animate-slide-down">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Marca del Aro</label>
                        <input type="text" value={customFrameBrand} onChange={(e) => setCustomFrameBrand(e.target.value)} placeholder="e.g. Gucci" className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Modelo específico</label>
                        <input type="text" value={customFrameModel} onChange={(e) => setCustomFrameModel(e.target.value)} placeholder="e.g. Gold Edition" className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Color / Patrón</label>
                        <input type="text" value={customFrameColor} onChange={(e) => setCustomFrameColor(e.target.value)} placeholder="e.g. Negro/Dorado" className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Material de Fabricación</label>
                        <input type="text" value={customFrameMaterial} onChange={(e) => setCustomFrameMaterial(e.target.value)} placeholder="e.g. Acetato" className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">P. Venta (S/)</label>
                        <input type="number" value={customFramePrice || ''} onChange={(e) => setCustomFramePrice(Math.max(0, parseFloat(e.target.value) || 0))} placeholder="0.00" className="w-full text-xs p-2 bg-slate-50 border border-slate-250 focus:border-sky-500 rounded-lg font-mono font-bold text-center" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Crystal Configurations (Preset list or full custom) */}
                <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-indigo-50 pb-2">
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                      <div className="w-1.5 h-3.5 bg-indigo-600 rounded-xs"></div>
                      Paso 4: Fórmula de Luna / Cristales
                    </h3>
                    
                    <div className="flex bg-slate-150 p-0.5 rounded-lg text-[10px] font-bold text-slate-600 font-mono">
                      <button 
                        type="button" 
                        onClick={() => setCrystalInputMode('preset')}
                        className={`px-2 py-1 rounded-md transition-all ${crystalInputMode === 'preset' ? 'bg-white text-indigo-900' : ''}`}
                      >
                        PREDETERMINADOS
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCrystalInputMode('custom')}
                        className={`px-2 py-1 rounded-md transition-all ${crystalInputMode === 'custom' ? 'bg-white text-indigo-900' : ''}`}
                      >
                        OTRA / PERSONALIZADA
                      </button>
                    </div>
                  </div>

                  {crystalInputMode === 'preset' ? (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase leading-none">Seleccionar de catálogo actual (autocompleta los campos de edición)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {mockCrystals.map((c) => (
                          <div
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCrystalPresetId(c.id);
                              setCustomCrystalBrand(c.brand);
                              setCustomCrystalType(c.type as any);
                              setCustomCrystalMaterial(c.material);
                              setCustomCrystalPrice(c.price);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                              selectedCrystalPresetId === c.id 
                                ? 'border-sky-500 bg-sky-50/20 text-sky-950 font-bold shadow-xs' 
                                : 'border-slate-200 hover:border-slate-350 bg-slate-50/10'
                            }`}
                          >
                            <div>
                              <p className="font-extrabold truncate text-slate-900 uppercase text-[11px] leading-tight">{c.brand}</p>
                              <p className="text-[9.5px] text-slate-500 truncate">{c.type}</p>
                            </div>
                            <div className="flex justify-between items-baseline self-stretch">
                              <span className="text-[8px] uppercase tracking-wide px-1 rounded bg-slate-200 text-slate-600 truncate max-w-[50%]">{c.material}</span>
                              <span className="text-xs font-mono font-bold text-sky-600">S/ {c.price.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Interactive Sub-editing Form Block */}
                      <div className="mt-2 p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-3">
                        <span className="text-[9.5px] uppercase font-mono font-black tracking-widest text-slate-500 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          Detalles de Luna Seleccionada (¡PRECIOS E INFORMACIÓN 100% EDITABLES!)
                        </span>
                        <div className="grid grid-cols-4 gap-2.5 font-sans">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Marca de Luna</label>
                            <input type="text" value={customCrystalBrand} onChange={(e) => setCustomCrystalBrand(e.target.value)} className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-800" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Tipo / Tratamiento de Luna</label>
                            <input type="text" value={customCrystalType} onChange={(e) => setCustomCrystalType(e.target.value as any)} placeholder="e.g. Monofocal, Multifocal Advance, etc." className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-800" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Material de Fabricación</label>
                            <input type="text" value={customCrystalMaterial} onChange={(e) => setCustomCrystalMaterial(e.target.value)} className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-800" />
                          </div>
                          <div className="col-span-2 space-y-1 font-mono">
                            <label className="text-[9px] font-black text-indigo-900 uppercase font-sans block">Precio Editable (S/)</label>
                            <input type="number" value={customCrystalPrice || ''} onChange={(e) => setCustomCrystalPrice(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full text-xs p-1.5 bg-white border border-indigo-250 font-black focus:border-indigo-600 rounded-lg text-center text-slate-900" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3 animate-slide-down">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Marca de Luna</label>
                        <input type="text" value={customCrystalBrand} onChange={(e) => setCustomCrystalBrand(e.target.value)} placeholder="e.g. Tokai" className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tratamiento o tipo de la luna</label>
                        <input 
                          type="text"
                          value={customCrystalType} 
                          onChange={(e) => setCustomCrystalType(e.target.value as any)} 
                          placeholder="e.g. Monofocal, Multifocal, Fotocromáticas, etc."
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden text-slate-800 font-bold"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Material de Fabricación (Resina, alto índice)</label>
                        <input type="text" value={customCrystalMaterial} onChange={(e) => setCustomCrystalMaterial(e.target.value)} placeholder="e.g. Policarbonato 1.59" className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">P. Tarifa Venta (S/)</label>
                        <input type="number" value={customCrystalPrice || ''} onChange={(e) => setCustomCrystalPrice(Math.max(0, parseFloat(e.target.value) || 0))} placeholder="0.00" className="w-full text-xs p-2 bg-slate-50 border border-slate-250 focus:border-sky-500 rounded-lg font-mono font-bold text-center" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 5: Extra checkables Treatments & Gifts side by side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Treatments checkboxes */}
                  <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest leading-none border-b border-indigo-50 pb-2">Tratamientos Adicionales</h3>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                        {mockTreatments.map((tr) => {
                          const isChecked = selectedTreatments.includes(tr.name);
                          const defaultPrice = tr.price;
                          const currentVal = treatmentPrices[tr.name] !== undefined ? treatmentPrices[tr.name] : defaultPrice;
                          return (
                            <div
                              key={tr.id}
                              onClick={() => {
                                setSelectedTreatments(prev => 
                                  isChecked ? prev.filter(item => item !== tr.name) : [...prev, tr.name]
                                );
                              }}
                              className={`p-2 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition-all ${
                                isChecked ? 'bg-sky-50/40 border-sky-400 text-sky-950 font-bold font-sans' : 'border-slate-150 hover:border-slate-300 text-slate-600'
                              }`}
                            >
                              <span className="truncate max-w-[70%]">{tr.name}</span>
                              <span className="font-mono text-[10.5px] text-sky-750">S/ {currentVal}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Show Editable Pricing Inputs */}
                    {selectedTreatments.length > 0 && (
                      <div className="mt-3 p-2.5 bg-indigo-50/20 border border-indigo-100 rounded-lg space-y-1.5">
                        <span className="text-[8.5px] uppercase font-mono font-black tracking-widest text-indigo-900 block border-b border-indigo-50 pb-1">✍️ Precios Editables de Tratamientos</span>
                        <div className="space-y-1 font-sans">
                          {selectedTreatments.map(name => {
                            const defaultPrice = mockTreatments.find(t => t.name === name || t.id === name)?.price || 0;
                            const currentPrice = treatmentPrices[name] !== undefined ? treatmentPrices[name] : defaultPrice;
                            return (
                              <div key={name} className="flex justify-between items-center text-[10.5px]">
                                <span className="font-medium text-slate-700 truncate max-w-[55%]">{name}</span>
                                <div className="flex items-center gap-1 font-mono">
                                  <span className="text-[8px] text-slate-400">S/</span>
                                  <input 
                                    type="number" 
                                    value={currentPrice} 
                                    onChange={(e) => setTreatmentPrices(prev => ({
                                      ...prev,
                                      [name]: Math.max(0, parseFloat(e.target.value) || 0)
                                    }))}
                                    className="w-14 text-center text-[10.5px] py-0.5 bg-white border border-slate-200 rounded font-bold text-indigo-950"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Add Custom Treatment input */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex gap-1.5 font-sans">
                      <input 
                        type="text" 
                        placeholder="Tratamiento personalizado" 
                        value={newTreatmentName} 
                        onChange={(e) => setNewTreatmentName(e.target.value)} 
                        className="flex-1 text-[10.5px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden text-slate-800"
                      />
                      <input 
                        type="number" 
                        placeholder="S/" 
                        value={newTreatmentPrice || ''} 
                        onChange={(e) => setNewTreatmentPrice(Math.max(0, parseFloat(e.target.value) || 0))} 
                        className="w-12 text-[10.5px] text-center px-1 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-850"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (!newTreatmentName.trim()) return;
                          const name = newTreatmentName.trim();
                          if (!selectedTreatments.includes(name)) {
                            setSelectedTreatments(prev => [...prev, name]);
                            setTreatmentPrices(prev => ({ ...prev, [name]: newTreatmentPrice }));
                          }
                          setNewTreatmentName('');
                          setNewTreatmentPrice(0);
                        }}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Gifts checkboxes */}
                  <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest leading-none border-b border-indigo-50 pb-2">Obsequios Incluidos</h3>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                        {mockGifts.map((gf) => {
                          const isChecked = selectedGifts.includes(gf.name);
                          return (
                            <div
                              key={gf.id}
                              onClick={() => {
                                setSelectedGifts(prev => 
                                  isChecked ? prev.filter(item => item !== gf.name) : [...prev, gf.name]
                                );
                              }}
                              className={`p-2 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition-all ${
                                isChecked ? 'bg-emerald-50/40 border-emerald-400 text-emerald-950 font-bold' : 'border-slate-150 hover:border-slate-300 text-slate-600'
                              }`}
                            >
                              <span className="truncate max-w-[80%]">🎁 {gf.name}</span>
                              <span className="text-[9.5px] font-black uppercase text-emerald-600 font-mono">Gratis</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Custom Gift input */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex gap-1.5 font-sans">
                      <input 
                        type="text" 
                        placeholder="Obsequio personalizado" 
                        value={newGiftName} 
                        onChange={(e) => setNewGiftName(e.target.value)} 
                        className="flex-1 text-[10.5px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden text-slate-800"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (!newGiftName.trim()) return;
                          const name = newGiftName.trim();
                          if (!selectedGifts.includes(name)) {
                            setSelectedGifts(prev => [...prev, name]);
                          }
                          setNewGiftName('');
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Calculations totals, discount selections, and Save */}
              <div className="space-y-6">
                
                <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-lg flex flex-col p-5 space-y-4">
                  <div className="bg-slate-950 p-4 -mx-5 -mt-5 rounded-t-2xl text-white">
                    <h3 className="text-xs font-black uppercase font-mono tracking-widest">Resumen de Totales y Descuentos</h3>
                    <p className="text-[9.5px] text-slate-400">PLANILLA DE PRESUPUESTOS OPTIC</p>
                  </div>

                  {/* Item Summary Breakdown */}
                  <div className="space-y-2.5 text-xs text-slate-700 border-b border-slate-100 pb-3 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suma Montura:</span>
                      <strong className="font-mono">{activeFrame.brand ? `S/ ${activeFrame.price.toFixed(2)}` : 'S/ 0.00'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suma Cristal:</span>
                      <strong className="font-mono">{activeCrystal.brand !== 'Ninguno' ? `S/ ${activeCrystal.price.toFixed(2)}` : 'S/ 0.00'}</strong>
                    </div>
                    {selectedTreatments.map((trName, index) => {
                      const defaultPrice = mockTreatments.find(t => t.name === trName || t.id === trName)?.price || 0;
                      const currentPrice = treatmentPrices[trName] !== undefined ? treatmentPrices[trName] : defaultPrice;
                      return (
                        <div key={index} className="flex justify-between text-[11px] text-slate-500 font-mono italic">
                          <span>+ {trName}:</span>
                          <span>S/ {currentPrice.toFixed(2)}</span>
                        </div>
                      );
                    })}
                    {selectedGifts.map((gfName, index) => (
                      <div key={index} className="flex justify-between text-[11px] text-emerald-600 italic">
                        <span>🎁 {gfName}:</span>
                        <span className="font-bold font-mono">S/ 0.00</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 shrink-0 text-xs text-left">
                    {/* Discount Picker */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[9px] text-slate-500 uppercase tracking-wide">Descuento de Campaña</span>
                        <div className="flex bg-slate-300 p-0.5 rounded text-[9.5px] font-bold">
                          <button
                            type="button"
                            onClick={() => { setDiscountType('percentage'); setDiscountValue(0); }}
                            className={`px-1.5 py-0.5 rounded-sm ${discountType === 'percentage' ? 'bg-sky-600 text-white' : 'text-slate-650'}`}
                          >
                            %
                          </button>
                          <button
                            type="button"
                            onClick={() => { setDiscountType('fixed'); setDiscountValue(0); }}
                            className={`px-1.5 py-0.5 rounded-sm ${discountType === 'fixed' ? 'bg-sky-600 text-white' : 'text-slate-650'}`}
                          >
                            S/
                          </button>
                        </div>
                      </div>

                      <input 
                        type="number" 
                        value={discountValue || ''}
                        onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder={discountType === 'percentage' ? 'Ej. 10 para 10%' : 'Ej. 50 para S/ 50'}
                        className="w-full text-center text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>

                    {/* Calcs rows */}
                    <div className="space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span>Subtotal Neto:</span>
                        <span className="font-mono text-slate-900 font-medium">S/ {subtotalPrice.toFixed(2)}</span>
                      </div>
                      {discountAmount > 0 ? (
                        <div className="flex justify-between text-red-600 font-bold">
                          <span>Descuento aplicado:</span>
                          <span className="font-mono">- S/ {discountAmount.toFixed(2)}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>IGV 18% Incluido en precio:</span>
                        <span className="font-mono">S/ {taxAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Massive General Total Indicator */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">TOTAL PRESUPUESTADO</span>
                      <span className="text-3xl font-mono font-black text-sky-600 leading-none">S/ {totalPrice.toFixed(2)}</span>
                    </div>

                    {/* Expiration and validation metadata */}
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Validez (Días)</label>
                        <input type="number" value={validDays} onChange={(e) => setValidDays(Math.max(1, parseInt(e.target.value) || 15))} className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-center" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">F. Est. Entrega</label>
                        <input type="date" value={estimatedDeliveryDate} onChange={(e) => setEstimatedDeliveryDate(e.target.value)} className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded text-center" />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Observación General o Clínica</label>
                      <textarea
                        rows={2}
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="e.g. Paciente regresará el fin de semana a concretar pago..."
                        className="w-full text-[10.5px] p-2 bg-slate-50 border border-slate-200 rounded-lg resize-none"
                      />
                    </div>
                  </div>

                  {/* Save action triggers */}
                  <div className="pt-1.5 border-t border-slate-100 space-y-2 text-center">
                    <button
                      type="submit"
                      disabled={!clientName}
                      className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
                        clientName 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:scale-[1.01]' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      id="save-quote-submit-button"
                    >
                      <Check className="w-4 h-4" /> REGISTRAR Y MOSTRAR IMPRESIÓN
                    </button>
                    <p className="text-[9px] text-slate-400 block font-light">
                      El guardado abrirá el pop-up de impresión A4 o Ticket para el cliente automáticamente.
                    </p>
                  </div>
                </div>

              </div>
            </form>
          )}

          {/* C. CRM FOLLOW-UP & QUOTES LIST TAB */}
          {currentTab === 'crm' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Header Checklist filters and widgets */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
                
                {/* Search Text field */}
                <div className="relative w-[340px]">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por Paciente, DNI, Móvil, o COT-..."
                    className="w-full text-xs p-2.5 pl-9 border border-slate-250 rounded-lg bg-slate-50 focus:outline-hidden"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="absolute right-2 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold">✕</button>
                  )}
                </div>

                {/* status tabs toggles */}
                <div className="bg-slate-150 p-1 rounded-xl flex items-center text-xs font-bold text-slate-600 select-none border border-slate-200">
                  {['Todos', 'Nuevo', 'En Seguimiento', 'Aceptado / Ganado', 'Rechazado', 'Cancelado'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setCrmStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        crmStatusFilter === st 
                          ? 'bg-sky-600 text-white shadow-xs font-black' 
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {st === 'Aceptado / Ganado' ? 'Ganadas' : st === 'Todos' ? 'Masivo' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quotes Database block list */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[9.5px] uppercase tracking-wider">
                      <th className="p-3.5">Presupuesto</th>
                      <th className="p-3.5">Fecha</th>
                      <th className="p-3.5">Cliente</th>
                      <th className="p-3.5 font-mono text-center">Teléfono CRM</th>
                      <th className="p-3.5">Detalles de la Oferta</th>
                      <th className="p-3.5 text-right font-mono">Total Cotiz.</th>
                      <th className="p-3.5 text-center">Estado Comercial</th>
                      <th className="p-3.5 text-right font-mono">Próximo Recontacto</th>
                      <th className="p-3.5 text-right">Opciones CRM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    {filteredQuotes.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-slate-400 italic text-xs">
                          No se encontraron cotizaciones emitidas que coincidan con los filtros de búsqueda seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredQuotes.map(q => {
                        const hasAlert = q.nextContactDate && (new Date(q.nextContactDate).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)) && q.status !== 'Aceptado / Ganado' ? true : false;
                        return (
                          <tr key={q.id} className="hover:bg-slate-50/50 transition-all font-medium">
                            <td className="p-3.5 font-mono font-extrabold text-slate-900">{q.quoteNumber}</td>
                            <td className="p-3.5 text-slate-400 font-mono text-[10.5px]">
                              {new Date(q.date).toLocaleDateString('es-PE')}
                            </td>
                            <td className="p-3.5">
                              <p className="font-extrabold text-slate-900 uppercase text-[11px] font-sans">{q.clientName}</p>
                              {q.clientDni && <span className="text-[9.5px] text-slate-400 font-mono font-bold block">DNI: {q.clientDni}</span>}
                            </td>
                            <td className="p-3.5 text-center font-mono font-bold text-slate-650">
                              {q.clientPhone ? (
                                <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded border border-slate-150">
                                  <Phone className="w-3 h-3 text-sky-600" />
                                  {q.clientPhone}
                                </span>
                              ) : (
                                <span className="text-slate-300 italic text-[10px]">-</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <div className="max-w-[240px] truncate space-y-0.5" title={`${q.frameBrand || "Sin montura"} | ${q.crystalBrand || "Sin lunas"}`}>
                                <p className="text-[10px] text-slate-600 truncate uppercase">Aros: <strong className="font-semibold text-slate-800">{q.frameBrand || "Solo cristales"}</strong></p>
                                <p className="text-[10px] text-slate-600 truncate uppercase">Luna: <strong className="font-semibold text-slate-800">{q.crystalBrand} ({q.lensType})</strong></p>
                              </div>
                            </td>
                            <td className="p-3.5 text-right font-mono font-extrabold text-slate-900 text-sm">
                              S/ {q.total.toFixed(2)}
                            </td>
                            <td className="p-3.5 text-center">
                              {/* Status Badges */}
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded inline-block border ${
                                q.status === 'Nuevo' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                                q.status === 'En Seguimiento' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                q.status === 'Aceptado / Ganado' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                q.status === 'Rechazado' ? 'bg-rose-150 text-rose-800 border-rose-250' :
                                'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {q.status === 'Aceptado / Ganado' ? 'Ganada' : q.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-mono text-[10.5px]">
                              {q.nextContactDate ? (
                                <div className="inline-flex items-center gap-1">
                                  {hasAlert && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
                                  <span className={hasAlert ? "text-rose-600 font-bold" : "text-slate-500"}>
                                    {q.nextContactDate}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-300 italic">-</span>
                              )}
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex justify-end gap-1.5 items-center">
                                {/* Print A4/Ticket launch button */}
                                <button
                                  type="button"
                                  onClick={() => setPrintQuote(q)}
                                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer border border-slate-200"
                                  title="Imprimir / Formatos"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedQuoteForCrm(q);
                                    // pre-populate contact details
                                    setCrmScheduleDate(q.nextContactDate || '');
                                    setCrmScheduleNotes(q.nextActionNotes || '');
                                  }}
                                  className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all hover:scale-102 flex items-center gap-1.5"
                                  title="Ingresar ficha CRM seguimiento"
                                >
                                  <HeartHandshake className="w-3.5 h-3.5" /> CRM
                                </button>

                                {currentUserRole === UserRole.Administrador && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuote(q.id, q.quoteNumber)}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* Dynamic geometric telemetry footer */}
        <footer className="h-10 bg-slate-900 text-slate-400 border-t border-slate-800 px-6 flex items-center justify-between shrink-0 text-[10px] no-print select-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="font-bold text-slate-300">NÚCLEO CRM OPERANDO</span>
            </div>
            <div className="text-slate-500">
              Terminal: <strong className="font-bold text-slate-300 font-mono">OPT_TERM_010</strong>
            </div>
            <div className="text-slate-500">
              Usuario: <strong className="font-bold text-slate-300 uppercase">{currentUser}</strong> ({currentUserRole})
            </div>
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">
            Modo Cotizar y CRM activo • Sin módulos secundarios de inventario ni facturación SUNAT
          </div>
        </footer>

      </main>

      {/* ──────────────────────────────────────────────────────────────────
          CRM LIGHTBOX SLIDE-OVER DRAWER (MODAL OVERLAY)
          ────────────────────────────────────────────────────────────────── */}
      {selectedQuoteForCrm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end no-print animate-fade-in">
          
          <div className="bg-white max-w-lg w-full h-full shadow-2xl flex flex-col justify-between overflow-hidden relative">
            
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="space-y-1 text-left">
                <span className="text-[9px] font-bold text-sky-400 uppercase font-mono tracking-widest bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">Ficha de Seguimiento CRM</span>
                <h3 className="text-base font-black tracking-tight uppercase">{selectedQuoteForCrm.quoteNumber}</h3>
                <p className="text-xs text-slate-400 truncate max-w-[320px]">Paciente: {selectedQuoteForCrm.clientName}</p>
              </div>
              <button 
                onClick={() => setSelectedQuoteForCrm(null)} 
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 text-left scrollbar-thin">
              
              {/* Quick Customer Card & Direct WhatsApp action */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-none">Canales Directos con el Cliente</h4>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p><strong className="font-bold text-slate-900 text-sm">{selectedQuoteForCrm.clientName}</strong></p>
                  {selectedQuoteForCrm.clientPhone && (
                    <p className="font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Teléfono:</strong> {selectedQuoteForCrm.clientPhone}
                    </p>
                  )}
                  {selectedQuoteForCrm.clientEmail && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Email:</strong> {selectedQuoteForCrm.clientEmail}
                    </p>
                  )}
                  {selectedQuoteForCrm.clientAddress && (
                    <p className="truncate flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Dirección:</strong> {selectedQuoteForCrm.clientAddress}
                    </p>
                  )}
                </div>

                {/* Instant trigger for WhatsApp Web */}
                {selectedQuoteForCrm.clientPhone && (
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${selectedQuoteForCrm.clientPhone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(selectedQuoteForCrm.clientName)}%2C%20le%20escribimos%20de%20Optica%20Optivision%20para%20hacerle%20seguimiento%20a%20su%20cotizacion%20de%20lunas%20oftalmologicas.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 uppercase transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" /> Enviar Mensaje WhatsApp Web
                    </a>
                  </div>
                )}
              </div>

              {/* Status Swift panel */}
              <div className="space-y-2">
                <h4 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Modificar Estado Comercial Directamente</h4>
                <div className="grid grid-cols-5 gap-1">
                  {(['Nuevo', 'En Seguimiento', 'Aceptado / Ganado', 'Rechazado', 'Cancelado'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateQuoteStatusDirect(selectedQuoteForCrm.id, st)}
                      className={`py-2 text-[8.5px] font-black uppercase rounded-md border text-center transition-colors ${
                        selectedQuoteForCrm.status === st 
                          ? 'bg-sky-550 border-sky-400 text-sky-950 font-black' 
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      {st === 'Aceptado / Ganado' ? 'Ganada' : st === 'En Seguimiento' ? 'Seguim.' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* CRM note Logger form */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3.5">
                <h4 className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1 leading-none">
                  <Plus className="w-4 h-4 text-sky-600" /> Registrar Nueva Interacción
                </h4>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Medio Utilizado</label>
                    <select
                      value={crmNoteType}
                      onChange={(e) => setCrmNoteType(e.target.value as any)}
                      className="w-full bg-white border border-slate-205 py-1.5 px-2 rounded focus:outline-hidden font-bold text-slate-700"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Llamada">Llamada</option>
                      <option value="Correo">Correo</option>
                      <option value="Visita">Visita Pres.</option>
                      <option value="Otro">Otro medio</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Anotaciones de la conversación o avances</label>
                    <textarea
                      rows={1}
                      value={crmNoteDetails}
                      onChange={(e) => setCrmNoteDetails(e.target.value)}
                      placeholder="e.g. Paciente indica recibir descuento del 10% para comprar."
                      className="w-full text-xs p-1.5 bg-white border border-slate-205 rounded resize-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCrmNote}
                  disabled={!crmNoteDetails.trim()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-950 hover:scale-[1.01] text-white font-extrabold text-[10.5px] rounded-lg uppercase tracking-wide transition-all shadow-xs"
                >
                  Confirmar Grabado de Nota CRM
                </button>
              </div>

              {/* Reprogramming Reminder alert settings */}
              <div className="border border-indigo-100 bg-indigo-50/20 p-4 rounded-xl space-y-3 text-xs text-indigo-900">
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider border-b border-indigo-100 pb-1.5 flex items-center gap-1.5 leading-none">
                  <Calendar className="w-4 h-4 text-indigo-700" /> Programación de Próximo Recontacto
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[9px] font-bold text-indigo-400 uppercase">Fecha de Alerta</label>
                    <input 
                      type="date" 
                      value={crmScheduleDate} 
                      onChange={(e) => setCrmScheduleDate(e.target.value)} 
                      className="w-full p-1.5 bg-white rounded border border-indigo-200 text-[11px] font-mono text-center font-bold" 
                    />
                  </div>
                  <div className="col-span-2 space-y-1 font-medium">
                    <label className="text-[9px] font-bold text-indigo-400 uppercase">Descripción / Tarea del recontacto</label>
                    <input 
                      type="text" 
                      value={crmScheduleNotes} 
                      onChange={(e) => setCrmScheduleNotes(e.target.value)} 
                      placeholder="e.g. Llamar por fin de mes a las 3:00 PM" 
                      className="w-full p-1.5 bg-white rounded border border-indigo-200 text-xs" 
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateQuoteStatusDirect(selectedQuoteForCrm.id, 'En Seguimiento');
                    handleAddCrmNote(); // Save log
                    alert("Aviso re-programado exitosamente en el CRM comercial.");
                  }}
                  className="w-full py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[10px] rounded-md uppercase transition-colors"
                >
                  Registrar Alerta de Recontacto Calendario
                </button>
              </div>

              {/* Historic Notes Timeline logs */}
              <div className="space-y-3.5">
                <h4 className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Bitácora de Seguimiento de Planilla</h4>
                <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-2">
                  {selectedQuoteForCrm.crmNotes.map((note, index) => (
                    <div key={note.id || index} className="space-y-1 relative relative">
                      {/* Timeline dot circle indicator */}
                      <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-400 border border-white"></span>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-mono bg-slate-100 px-1 py-0.2 rounded font-black text-slate-650 tracking-wider">
                          {note.interactionType}
                        </span>
                        <span>{new Date(note.timestamp).toLocaleString('es-PE')}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                        "{note.details}"
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-right font-mono">
                        Reg: {note.user}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Quick drawer controls bottom */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedQuoteForCrm(null)}
                className="flex-1 py-2.5 border border-slate-350 bg-white hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-650 uppercase"
              >
                Cerrar Ficha
              </button>
              <button
                type="button"
                onClick={() => { setPrintQuote(selectedQuoteForCrm); }}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase rounded-lg flex items-center justify-center gap-1"
              >
                <Printer className="w-4 h-4" /> Formato Impresión A4/Ticket
              </button>
            </div>

          </div>
        </div>
      )}

      {currentTab === 'database' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left font-sans">
          {/* Header Card */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-indigo-600 block font-mono uppercase">CONECTIVIDAD CORPORATIVA</span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Configuración de Conexión PostgreSQL Local</h2>
              <p className="text-xs text-slate-500 max-w-xl">
                Configure los parámetros de red y credenciales para conectar su sistema POS/CRM a PostgreSQL. El sistema creará automáticamente las tablas y esquemas necesarios si no existen.
              </p>
            </div>
            <Database className="w-12 h-12 text-slate-300 stroke-1" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left form */}
            <div className="col-span-2 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Formulario de Conexión</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Host / Dirección IP (e.g. localhost o 127.0.0.1)</label>
                  <input 
                    type="text" 
                    value={dbHost} 
                    onChange={(e) => setDbHost(e.target.value)} 
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 text-slate-800 font-medium" 
                    placeholder="localhost"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Puerto de postgres (e.g. 5432)</label>
                  <input 
                    type="text" 
                    value={dbPort} 
                    onChange={(e) => setDbPort(e.target.value)} 
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-mono text-slate-800 font-medium" 
                    placeholder="5432"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Base de Datos PostgreSQL</label>
                  <input 
                    type="text" 
                    value={dbName} 
                    onChange={(e) => setDbName(e.target.value)} 
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-mono text-slate-800 font-medium" 
                    placeholder="optivision"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Usuario de postgres</label>
                  <input 
                    type="text" 
                    value={dbUser} 
                    onChange={(e) => setDbUser(e.target.value)} 
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 text-slate-800 font-medium" 
                    placeholder="postgres"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Contraseña de Postgres</label>
                  <input 
                    type="password" 
                    value={dbPassword} 
                    onChange={(e) => setDbPassword(e.target.value)} 
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-mono text-slate-800 font-medium" 
                    placeholder="Contraseña del usuario postgres"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="dbSsl"
                    checked={dbSsl} 
                    onChange={(e) => setDbSsl(e.target.checked)} 
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="dbSsl" className="text-xs font-bold text-slate-500 select-none">Habilitar conexión segura (SSL/HTTPS fallback)</label>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestAndSaveDb}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider shadow-sm transition-all cursor-pointer scale-100 active:scale-98"
                >
                  Guardar Configuración y Conectar
                </button>
              </div>
            </div>

            {/* Right details */}
            <div className="space-y-6">
              {/* Connection status card */}
              <div className={`p-6 border rounded-2xl shadow-sm space-y-4 ${dbConnected ? 'bg-emerald-50/20 border-emerald-250' : 'bg-rose-50/25 border-rose-250'}`}>
                <h4 className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-400">ESTADO DE CONEXIÓN</h4>
                
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                  <strong className={`font-black text-sm ${dbConnected ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {dbConnected ? 'CONECTADO Y ACTIVO' : 'SIN CONEXIÓN POSTGRES'}
                  </strong>
                </div>

                <p className="text-[11.5px] text-slate-500 leading-normal">
                  {dbConnected 
                    ? 'La planilla POS está guardando y cargando todas las cotizaciones y bitácoras directamente en las tablas SQL de PostgreSQL.'
                    : 'La planilla POS está ejecutándose con la memoria volátil del backend/navegador porque aún no se ha enlazado a PostgreSQL local.'}
                </p>

                {dbConnected && dbConfig && (
                  <div className="text-xs p-3.5 bg-white/60 border border-emerald-200 rounded-xl space-y-1 block font-mono">
                    <span className="block text-[8.5px] font-black text-emerald-600 uppercase font-mono">DATOS ACTIVOS:</span>
                    <p className="font-mono text-[10px] font-bold text-slate-600">
                      Host: {dbConfig.host}<br />
                      Database: {dbConfig.database}<br />
                      User: {dbConfig.user}
                    </p>
                  </div>
                )}
                
                {!dbConnected && (
                  <div className="text-xs p-3.5 bg-rose-50 border border-rose-150 rounded-xl space-y-1 block">
                    <span className="block text-[8.5px] font-black text-rose-600 uppercase font-mono">MOTOR VOLÁTIL FALLBACK:</span>
                    <p className="text-[10.5px] text-rose-700 leading-normal font-semibold">
                      Los datos se guardan en estados temporales hasta que configure la conexión Postgres local.
                    </p>
                  </div>
                )}
              </div>

              {/* Reset Fallback Button */}
              <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <span className="text-[9px] uppercase font-black text-rose-600 tracking-wider">MANTENIMIENTO DEL SISTEMA</span>
                <h4 className="text-xs font-black text-slate-700 uppercase">Vincular Base de Datos en Blanco</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Elimine la información temporal stored en la memoria volátil del backend para arrancar el sistema completamente libre de demostración.
                </p>
                <button
                  type="button"
                  onClick={handleClearFallbackData}
                  className="w-full py-2 border border-rose-350 bg-rose-50/50 hover:bg-rose-50 text-rose-700 font-extrabold text-[10.5px] rounded-xl uppercase transition-colors cursor-pointer"
                >
                  Borrar Memoria Temporal
                </button>
              </div>

              {/* SQL Schemas View */}
              <div className="bg-slate-900 text-slate-350 p-4 rounded-2xl block space-y-2.5 text-left font-mono text-[9px] border border-slate-800 shadow-lg">
                <span className="text-[8px] font-black uppercase text-indigo-400 block tracking-widest leading-none">ESQUEMAS SQL AUTO-GENERADOS</span>
                <p className="leading-normal text-slate-400">El servidor genera automáticamente las siguientes tablas si no existen:</p>
                <pre className="bg-slate-950 p-2.5 rounded-lg text-indigo-300 font-mono max-h-[140px] overflow-y-auto scrollbar-thin overflow-x-auto text-[8.5px] leading-relaxed">
{`CREATE TABLE IF NOT EXISTS quotes (
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

CREATE TABLE IF NOT EXISTS action_logs (
  id VARCHAR(100) PRIMARY KEY,
  timestamp VARCHAR(100),
  details TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PRINT SIMULATION MODAL OVERLAY (LIGHTBOX)
          ────────────────────────────────────────────────────────────────── */}
      {printQuote && (
        <PrintDocument 
          quote={printQuote} 
          onClose={() => setPrintQuote(null)} 
        />
      )}

    </div>
  );
}
