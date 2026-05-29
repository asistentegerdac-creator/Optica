export enum UserRole {
  Administrador = "Administrador",
  Vendedor = "Vendedor"
}

export interface CrmNote {
  id: string;
  timestamp: string;
  user: string;
  details: string;
  interactionType: 'Llamada' | 'WhatsApp' | 'Correo' | 'Visita' | 'Otro';
}

export interface EyePrescription {
  sphere: string;   // SPH
  cylinder: string; // CYL
  axis: string;     // AXIS
  addition: string; // ADD
  dip: string;      // DIP (mm)
}

export interface Quote {
  id: string;
  quoteNumber: string;
  date: string; // ISO or date YYYY-MM-DD
  
  // Inline Client Information
  clientName: string;
  clientDni: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;

  // Optional Prescription Information
  hasPrescription: boolean;
  od: EyePrescription;
  oi: EyePrescription;
  lensType: "Monofocal" | "Bifocal" | "Multifocal" | "Ocupacional" | "Digital" | "Solo Montura";
  doctorName?: string;

  // Selected Items Detail (Can be custom-entered or catalog-selected)
  frameBrand: string;
  frameModel: string;
  frameColor: string;
  frameMaterial: string;
  framePrice: number;

  crystalBrand: string;
  crystalType: "Monofocal" | "Bifocal" | "Multifocal" | "Ocupacional" | "Blue Light" | "Fotocromáticas" | "Ninguno";
  crystalMaterial: string;
  crystalPrice: number;

  // Extra Treatments & Gifts checkable lists
  selectedTreatments: string[]; // Treatment IDs or Names
  selectedGifts: string[];      // Gift IDs or Names
  treatmentPrices?: { [name: string]: number }; // Custom edited prices for selected treatments

  // Totals calculations
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  igv: number;
  total: number;

  // Validation & Workflow metadata
  observations: string;
  validDays: number; // default 15 days
  estimatedDeliveryDate: string;

  // CRM Tracker States
  status: 'Nuevo' | 'En Seguimiento' | 'Aceptado / Ganado' | 'Rechazado' | 'Cancelado';
  crmNotes: CrmNote[];
  nextContactDate: string; // For alerts
  nextActionNotes: string; // Alert task content
}

export interface FrameTemplate {
  id: string;
  brand: string;
  model: string;
  color: string;
  material: string;
  price: number;
}

export interface CrystalTemplate {
  id: string;
  brand: string;
  type: string;
  material: string;
  price: number;
}

export interface Treatment {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Gift {
  id: string;
  name: string;
}

export interface ActionLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
}
