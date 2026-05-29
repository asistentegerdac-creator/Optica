import { 
  Quote, FrameTemplate, CrystalTemplate, Treatment, Gift, ActionLog, UserRole 
} from '../types';

export const mockFrames: FrameTemplate[] = [
  { id: "mon-1", brand: "Ray-Ban", model: "Aviator Classic", color: "Dorado / Metal", material: "Metal", price: 450.00 },
  { id: "mon-2", brand: "Oakley", model: "Holbrook Adventure", color: "Negro Mate", material: "O-Matter Plast.", price: 520.00 },
  { id: "mon-3", brand: "Vogue", model: "Cat-Eye Retro", color: "Carey / Rosado", material: "Acetato", price: 340.00 },
  { id: "mon-4", brand: "Carrera", model: "Pantos Urban", color: "Plata / Negro", material: "Metal Sutil", price: 380.00 },
  { id: "mon-5", brand: "Miraflex", model: "Kids Flex-Lock", color: "Azul Eléctrico", material: "Silicona Hipoalergénica", price: 190.00 },
  { id: "mon-custom", brand: "Personalizado / Otra Marca", model: "Escribir Modelo", color: "N/A", material: "N/A", price: 0.00 }
];

export const mockCrystals: CrystalTemplate[] = [
  { id: "lun-1", brand: "Essilor Crizal", type: "Monofocal", material: "Policarbonato", price: 180.00 },
  { id: "lun-2", brand: "Essilor Varilux", type: "Multifocal", material: "Alto Índice 1.67", price: 320.00 },
  { id: "lun-3", brand: "Kodak Easy", type: "Bifocal", material: "Resina Estándar", price: 150.00 },
  { id: "lun-4", brand: "Hoya Nulux", type: "Blue Light", material: "Policarbonato 1.59", price: 260.00 },
  { id: "lun-5", brand: "Zeiss DriveSafe", type: "Ocupacional", material: "UHD Resina", price: 420.00 },
  { id: "lun-custom", brand: "Personalizado / Otra Marca", type: "Ninguno", material: "N/A", price: 0.00 }
];

export const mockTreatments: Treatment[] = [
  { id: "tr-1", name: "Antirreflejo Estándar (Anti-glare)", price: 40.00, description: "Elimina destellos de luces en la superficie externa." },
  { id: "tr-2", name: "Blue Cut (Filtro Antiazul de Pantallas)", price: 85.00, description: "Protección contra fatiga visual por laptops y celulares." },
  { id: "tr-3", name: "Tratamiento Fotocromático (Transitions)", price: 150.00, description: "Se oscurece bajo rayos solares y se aclara en interiores." },
  { id: "tr-4", name: "Capa Hidrofóbica & Anti-rayones", price: 50.00, description: "Mayor facilidad de limpieza y resistencia al desgaste." },
  { id: "tr-5", name: "Protección UV 400 total", price: 35.00, description: "Bloqueo total contra radiación solar UVA y UVB." }
];

export const mockGifts: Gift[] = [
  { id: "ob-1", name: "Estuche Rígido Imantado OptiVision" },
  { id: "ob-2", name: "Paño de Microfibra de Diseño" },
  { id: "ob-3", name: "Spray Limpiador Antiestático 60ml" },
  { id: "ob-4", name: "Cordón de Sujeción Ajustable (Sport)" },
  { id: "ob-5", name: "Mini Kit Destornillador Llavero" }
];

// Start with no demo data as requested by the user
export const initialQuotes: Quote[] = [];

export const initialLogs: ActionLog[] = [];
