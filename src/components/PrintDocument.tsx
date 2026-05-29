import React, { useState } from 'react';
import { Quote } from '../types';
import { Printer, X, Award, FileText, CheckCircle, Smartphone, MapPin, ReceiptText } from 'lucide-react';

interface PrintDocumentProps {
  quote: Quote;
  onClose: () => void;
}

export default function PrintDocument({ quote, onClose }: PrintDocumentProps) {
  const [format, setFormat] = useState<'A4' | 'Ticket'>('A4');

  const formattedDate = new Date(quote.date).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  // Simulated Barcode for receipt aesthetic
  const BarcodeSVG = () => (
    <svg className="w-48 h-10 mx-auto" viewBox="0 0 200 40">
      <g fill="#000000">
        <rect x="0" y="0" width="3" height="40" />
        <rect x="5" y="0" width="1" height="40" />
        <rect x="7" y="0" width="2" height="40" />
        <rect x="12" y="0" width="4" height="40" />
        <rect x="18" y="0" width="1" height="40" />
        <rect x="21" y="0" width="3" height="40" />
        <rect x="25" y="0" width="2" height="40" />
        <rect x="30" y="0" width="2" height="40" />
        <rect x="34" y="0" width="4" height="40" />
        <rect x="40" y="0" width="2" height="40" />
        <rect x="45" y="0" width="1" height="40" />
        <rect x="48" y="0" width="3" height="40" />
        <rect x="54" y="0" width="2" height="40" />
        <rect x="58" y="0" width="4" height="40" />
        <rect x="64" y="0" width="1" height="40" />
        <rect x="68" y="0" width="2" height="40" />
        <rect x="72" y="0" width="3" height="40" />
        <rect x="78" y="0" width="1" height="40" />
        <rect x="82" y="0" width="4" height="40" />
        <rect x="88" y="0" width="2" height="40" />
        <rect x="91" y="0" width="1" height="40" />
        <rect x="94" y="0" width="3" height="40" />
        <rect x="98" y="0" width="2" height="40" />
        <rect x="104" y="0" width="4" height="40" />
        <rect x="110" y="0" width="1" height="40" />
        <rect x="114" y="0" width="2" height="40" />
        <rect x="118" y="0" width="3" height="40" />
        <rect x="124" y="0" width="1" height="40" />
        <rect x="128" y="0" width="4" height="40" />
        <rect x="134" y="0" width="2" height="40" />
        <rect x="138" y="0" width="1" height="40" />
        <rect x="141" y="0" width="3" height="40" />
        <rect x="145" y="0" width="2" height="40" />
        <rect x="150" y="0" width="4" height="40" />
        <rect x="160" y="0" width="2" height="40" />
        <rect x="164" y="0" width="3" height="40" />
        <rect x="170" y="0" width="1" height="40" />
        <rect x="174" y="0" width="4" height="40" />
        <rect x="180" y="0" width="2" height="40" />
        <rect x="188" y="0" width="3" height="40" />
        <rect x="194" y="0" width="2" height="40" />
        <rect x="197" y="0" width="3" height="40" />
      </g>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      
      {/* Dynamic Native Print Rules Injection */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-modal-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .printable-paper {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            page-break-after: avoid;
          }
        }
      `}</style>

      {/* Control Frame Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col h-[90vh] print-modal-container overflow-hidden">
        
        {/* Top Header Selector Controls (Hidden during physical print) */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Imprimir Cotización Optométrica
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {quote.quoteNumber} — {quote.clientName || "Cliente Genérico"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Format Selector Tab */}
            <div className="bg-slate-200/70 p-1 rounded-lg flex items-center text-xs font-semibold text-slate-700">
              <button
                onClick={() => setFormat('A4')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition-all ${
                  format === 'A4' ? 'bg-white text-sky-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Formato A4 (Oficina)
              </button>
              <button
                onClick={() => setFormat('Ticket')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition-all ${
                  format === 'Ticket' ? 'bg-white text-sky-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <ReceiptText className="w-3.5 h-3.5" />
                Ticketera (80mm)
              </button>
            </div>

            {/* Print and Close Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Paper Container Body */}
        <div className="p-4 sm:p-8 overflow-y-auto flex justify-center bg-slate-100/70 flex-1 no-print">
          
          {/* Printable Element Frame */}
          <div 
            id="printable-quote-content" 
            className={`bg-white text-slate-950 font-sans tracking-wide leading-relaxed shadow-md border border-slate-200 block printable-paper ${
              format === 'Ticket' 
                ? 'w-[80mm] min-h-[140mm] p-5 text-[11px] font-mono' 
                : 'w-[210mm] min-h-[297mm] p-12 text-xs'
            }`}
          >
            
            {/* 1. TICKET format layout */}
            {format === 'Ticket' ? (
              <div className="space-y-4">
                
                {/* Header info */}
                <div className="text-center space-y-1">
                  <h1 className="text-sm font-black uppercase text-slate-900">ÓPTICA OPTIVISION</h1>
                  <p className="text-[9px] text-slate-600 font-mono uppercase">R.U.C. 20492837492</p>
                  <p className="text-[9px] text-slate-600">Av. Larco 452, Miraflores, Lima</p>
                  <p className="text-[9px] text-slate-600 font-mono">Telf: (01) 445-8910 / 987654321</p>
                  <div className="border-b border-dashed border-slate-400 my-2"></div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider">COTIZACIÓN COMPROBANTE</h2>
                  <p className="text-[11px] font-black">{quote.quoteNumber}</p>
                  <p className="text-[9px] text-slate-500">{formattedDate}</p>
                </div>

                {/* Patient / Client details */}
                <div className="space-y-1 text-[10px] bg-slate-50 p-2 rounded border border-slate-200">
                  <p className="truncate"><span className="font-bold uppercase">Cliente:</span> {quote.clientName}</p>
                  {quote.clientDni && <p><span className="font-bold uppercase">DNI/CE:</span> {quote.clientDni}</p>}
                  {quote.clientPhone && <p><span className="font-bold uppercase font-mono">Telf:</span> {quote.clientPhone}</p>}
                  {quote.clientEmail && <p className="truncate"><span className="font-bold uppercase">Email:</span> {quote.clientEmail}</p>}
                  {quote.clientAddress && <p className="truncate"><span className="font-bold uppercase">Dirección:</span> {quote.clientAddress}</p>}
                </div>

                {/* Optometric prescription if valid */}
                {quote.hasPrescription ? (
                  <div className="border border-dashed border-slate-400 p-2 text-[9px] space-y-1">
                    <p className="font-bold text-center border-b border-dashed border-slate-300 pb-0.5 uppercase tracking-wide">Graduación Oftálmica</p>
                    <div className="grid grid-cols-6 text-center font-bold border-b border-dashed border-slate-100 py-0.5 text-[8px]">
                      <span>OJO</span><span>ESF</span><span>CIL</span><span>EJE</span><span>ADD</span><span>DIP</span>
                    </div>
                    <div className="grid grid-cols-6 text-center text-[9px]">
                      <span className="font-bold">OD</span>
                      <span>{quote.od.sphere}</span>
                      <span>{quote.od.cylinder}</span>
                      <span>{quote.od.axis}</span>
                      <span>{quote.od.addition}</span>
                      <span>{quote.od.dip}</span>
                    </div>
                    <div className="grid grid-cols-6 text-center text-[9px]">
                      <span className="font-bold">OI</span>
                      <span>{quote.oi.sphere}</span>
                      <span>{quote.oi.cylinder}</span>
                      <span>{quote.oi.axis}</span>
                      <span>{quote.oi.addition}</span>
                      <span>{quote.oi.dip}</span>
                    </div>
                    <p className="text-center text-[8px] font-bold border-t border-dashed border-slate-200 pt-1 uppercase">Tipo Luna: {quote.lensType}</p>
                    {quote.doctorName && <p className="text-center text-[8px] text-slate-500 italic block truncate">Optómetra: {quote.doctorName}</p>}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 p-1 text-center text-[9px] uppercase italic text-slate-500">
                    Sin graduación oftálmica asociada
                  </div>
                )}

                {/* Items grid */}
                <div className="space-y-1">
                  <div className="border-b border-dashed border-slate-400 my-1"></div>
                  <div className="grid grid-cols-4 font-bold text-[10px]">
                    <span className="col-span-2 uppercase">ITEM/DETALLE</span>
                    <span className="text-right">CANT</span>
                    <span className="text-right font-mono">TOTAL</span>
                  </div>
                  <div className="border-b border-slate-200 my-1"></div>
                  
                  {/* Frame */}
                  {quote.frameBrand && (
                    <div className="grid grid-cols-4 text-[10px] py-0.5">
                      <span className="col-span-2 uppercase text-slate-800">
                        {quote.frameBrand} {quote.frameModel} <span className="text-[9px] text-slate-600">({quote.frameColor})</span>
                      </span>
                      <span className="text-right">1</span>
                      <span className="text-right font-mono">S/ {quote.framePrice.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Crystal */}
                  {quote.crystalBrand && quote.crystalBrand !== 'Ninguno' && (
                    <div className="grid grid-cols-4 text-[10px] py-0.5">
                      <span className="col-span-2 uppercase text-slate-800">
                        Luna {quote.crystalBrand} <span className="text-[9px] text-slate-600">({quote.crystalType})</span>
                      </span>
                      <span className="text-right">1</span>
                      <span className="text-right font-mono text-right">S/ {quote.crystalPrice.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Treatments */}
                  {quote.selectedTreatments.map((trName, index) => {
                    const price = quote.treatmentPrices?.[trName] !== undefined ? quote.treatmentPrices[trName] : 0;
                    return (
                      <div key={index} className="grid grid-cols-4 text-[9px] py-0.5 text-slate-700 font-mono">
                        <span className="col-span-2 uppercase">+ TRAT: {trName}</span>
                        <span className="text-right">1</span>
                        <span className="text-right">{price > 0 ? `S/ ${price.toFixed(2)}` : 'Incluido'}</span>
                      </div>
                    );
                  })}

                  {/* Gifts */}
                  {quote.selectedGifts.map((gfName, index) => (
                    <div key={index} className="grid grid-cols-4 text-[9px] py-0.5 text-emerald-800 italic font-mono">
                      <span className="col-span-2 uppercase">+ REGALO: {gfName}</span>
                      <span className="text-right">1</span>
                      <span className="text-right font-bold text-emerald-600">S/ 0.00</span>
                    </div>
                  ))}
                </div>

                {/* Calculations block */}
                <div className="space-y-1 text-[10px] border-t border-dashed border-slate-400 pt-2 font-mono">
                  <div className="flex justify-between">
                    <span>SUBTOTAL NETO</span>
                    <span>S/ {quote.subtotal.toFixed(2)}</span>
                  </div>
                  {quote.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>DESC. APLICADO</span>
                      <span>- S/ {quote.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>I.G.V. (18% INC)</span>
                    <span>S/ {quote.igv.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-300 my-1"></div>
                  <div className="flex justify-between font-black text-xs pt-0.5">
                    <span>TOTAL COTIZADO</span>
                    <span>S/ {quote.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Additional notes / deliver times */}
                <div className="border border-slate-200 p-2 rounded text-[9px] space-y-1 block">
                  <p><span className="font-bold uppercase">Validez:</span> {quote.validDays} días calendar.</p>
                  {quote.estimatedDeliveryDate && (
                    <p><span className="font-bold uppercase">Est. Entrega:</span> {quote.estimatedDeliveryDate}</p>
                  )}
                  {quote.observations && (
                    <p className="italic text-slate-600"><span className="font-bold uppercase">Obs:</span> {quote.observations}</p>
                  )}
                </div>

                {/* Barcode details */}
                <div className="text-center pt-2 space-y-2">
                  <BarcodeSVG />
                  <p className="text-[7.5px] leading-relaxed text-slate-500">
                    Esta cotización es de carácter referencial e informativo para presupuestar la confección o adquisición de lentes ópticos. No representa un comprobante fiscal registrado en SUNAT. Validez comercial sujeta a stock.
                  </p>
                  <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider">¡Gracias por preferirnos!</p>
                </div>
              </div>
            ) : (
              
              /* 2. CORPORATE A4 FORMAT LAYOUT */
              <div className="space-y-6">
                
                {/* Header info */}
                <div className="flex justify-between pb-5 border-b-2 border-slate-200">
                  <div className="space-y-1.5 max-w-[60%]">
                    <div className="flex items-center gap-2 text-sky-700 font-black text-2xl tracking-tight">
                      <div className="w-8 h-8 bg-sky-600/10 rounded-lg flex items-center justify-center text-sky-700">
                        <span className="font-serif">O</span>
                      </div>
                      ÓPTICA OPTIVISION
                    </div>
                    <p className="text-slate-600 text-xs font-semibold">Salud visual de vanguardia y monturas de alta gama</p>
                    <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                      Av. Alfredo Benavides 1420, Miraflores, Lima | Telf: (01) 445-8910 / 987654321<br />
                      Email: cotizaciones@optivision.com.pe | Horario: Lun-Sáb 9:00 AM - 8:30 PM
                    </p>
                  </div>

                  {/* Document Badge Box */}
                  <div className="border border-slate-300 p-4 rounded-xl text-center bg-slate-50 min-w-[220px]">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">OPTICA OPTIVISION SAC</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase font-mono mb-2">R.U.C. 20492837492</p>
                    <p className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">PRESUPUESTO DE COMPRA</p>
                    <p className="text-xs font-mono font-black text-sky-600 uppercase tracking-wider">{quote.quoteNumber}</p>
                  </div>
                </div>

                {/* Grid Customer and Metadata */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div>
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Datos del Cliente / Titular</h4>
                    <div className="space-y-1.5 text-slate-700">
                      <p className="font-extrabold text-slate-900 text-sm">{quote.clientName}</p>
                      {quote.clientDni && <p className="text-[11px]"><span className="font-semibold text-slate-400">RUC/DNI:</span> {quote.clientDni}</p>}
                      {quote.clientPhone && <p className="text-[11px] font-mono"><span className="font-semibold text-slate-400 font-sans">Móvil/Telf:</span> {quote.clientPhone}</p>}
                      {quote.clientEmail && <p className="text-[11px]"><span className="font-semibold text-slate-400">Email:</span> {quote.clientEmail}</p>}
                      {quote.clientAddress && <p className="text-[11px]"><span className="font-semibold text-slate-400">Dirección:</span> {quote.clientAddress}</p>}
                    </div>
                  </div>
                  <div className="text-right space-y-1.5">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right mb-2">Información del Presupuesto</h4>
                    <p className="text-[11px]"><span className="text-slate-400 font-semibold mb-1">Fecha Registro:</span> {formattedDate}</p>
                    <p className="text-[11px]"><span className="text-slate-400 font-semibold">Vencimiento:</span> {quote.validDays} Días (Hasta {new Date(new Date(quote.date).getTime() + quote.validDays*24*60*60*1000).toLocaleDateString('es-PE')})</p>
                    {quote.estimatedDeliveryDate && (
                      <p className="text-[11px] text-sky-700 font-bold">
                        <span className="text-slate-400 font-semibold font-normal">Est. Fabricación:</span> {quote.estimatedDeliveryDate}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-700"><span className="text-slate-400 font-semibold">Atendido por:</span> Estefany López</p>
                    <p className="text-[10px] uppercase font-bold tracking-wide mt-1 inline-block px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                      Estado: {quote.status}
                    </p>
                  </div>
                </div>

                {/* Clinical Prescription Table Area */}
                {quote.hasPrescription ? (
                  <div className="border border-slate-200 rounded-xl p-4 bg-white">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <div className="w-1.5 h-3.5 bg-sky-600 rounded-xs"></div>
                      Parámetros de Refracción Oftalmometría
                    </h3>
                    <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded text-center overflow-hidden">
                      <div className="bg-slate-100/80 p-1.5 text-[9px] font-bold text-slate-500 uppercase">Ojo</div>
                      <div className="bg-slate-100/80 p-1.5 text-[9px] font-bold text-slate-500 uppercase">Esfera (SPH)</div>
                      <div className="bg-slate-100/80 p-1.5 text-[9px] font-bold text-slate-500 uppercase">Cilindro (CYL)</div>
                      <div className="bg-slate-100/80 p-1.5 text-[9px] font-bold text-slate-500 uppercase">Eje (AXIS)</div>
                      <div className="bg-slate-100/80 p-1.5 text-[9px] font-bold text-slate-500 uppercase">Adición (ADD)</div>
                      <div className="bg-slate-100/80 p-1.5 text-[9px] font-bold text-slate-500 uppercase">DIP (mm)</div>
                      <div className="bg-slate-100/80 p-1.5 text-[9px] font-bold text-slate-500 uppercase">Tecnologia Luna</div>
                      
                      <div className="bg-white p-2.5 text-xs font-extrabold text-slate-800">OD (Derecho)</div>
                      <div className="bg-white p-2.5 text-xs font-mono text-slate-600">{quote.od.sphere}</div>
                      <div className="bg-white p-2.5 text-xs font-mono text-slate-600">{quote.od.cylinder}</div>
                      <div className="bg-white p-2.5 text-xs font-mono text-slate-600">{quote.od.axis}</div>
                      <div className="bg-white p-2.5 text-xs font-mono text-slate-600">{quote.od.addition}</div>
                      <div className="bg-white p-2.5 text-xs font-mono text-slate-600">{quote.od.dip} mm</div>
                      <div className="bg-white p-2.5 text-xs font-bold text-slate-700 row-span-2 flex items-center justify-center bg-sky-50/10 border-l border-slate-100">
                        {quote.lensType}
                      </div>

                      <div className="bg-white p-2.5 text-xs font-extrabold text-slate-800 border-t border-slate-100">OI (Izquierdo)</div>
                      <div className="bg-white p-2.5 text-xs font-mono text-slate-600 border-t border-slate-100">{quote.oi.sphere}</div>
                      <div className="bg-white p-2.5 text-xs font-mono text-slate-600 border-t border-slate-100">{quote.oi.cylinder}</div>
                      <div className="bg-white p-2.5 text-xs font-mono text-slate-600 border-t border-slate-100">{quote.oi.axis}</div>
                      <div className="bg-white p-2.5 text-xs font-mono text-slate-600 border-t border-slate-100">{quote.oi.addition}</div>
                      <div className="bg-white p-2.5 text-xs font-mono text-slate-600 border-t border-slate-100">{quote.oi.dip} mm</div>
                    </div>
                    {quote.doctorName && (
                      <div className="mt-2.5 text-[10px] text-slate-500 italic flex items-center justify-between px-2 py-1 bg-slate-50 border border-slate-100 rounded">
                        <span><strong className="text-slate-700 not-italic uppercase font-semibold text-[9px]">Optometrista a cargo:</strong> {quote.doctorName}</span>
                        <span>Fórmula verificada conforme con autorefractómetro</span>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Quoted Items Detail Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-3.5 bg-sky-600 rounded-xs"></div>
                    Conceptos de Productos, Aditivos y Beneficios
                  </h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold text-[9px] uppercase tracking-wider">
                        <th className="p-2.5 text-left rounded-l-lg">Código del Ítem</th>
                        <th className="p-2.5 text-left">Detalle y Características del Elemento</th>
                        <th className="p-2.5 text-center">Unid.</th>
                        <th className="p-2.5 text-right">P. Unitario</th>
                        <th className="p-2.5 text-right rounded-r-lg">Valor Neto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      
                      {/* Frame */}
                      {quote.frameBrand && (
                        <tr className="hover:bg-slate-50/50 transition-all">
                          <td className="p-3 font-mono text-[10px] text-slate-400">MON-OPT-{quote.frameBrand.substring(0,3).toUpperCase()}</td>
                          <td className="p-3">
                            <span className="font-extrabold text-slate-900 uppercase text-[11px]">Montura Oftálmica {quote.frameBrand}</span>
                            <div className="text-[10px] text-slate-400 flex gap-4 mt-0.5">
                              <span><strong>Modelo:</strong> {quote.frameModel}</span>
                              <span><strong>Color:</strong> {quote.frameColor}</span>
                              {quote.frameMaterial && <span><strong>Material:</strong> {quote.frameMaterial}</span>}
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold">1</td>
                          <td className="p-3 text-right font-mono">S/ {quote.framePrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">S/ {quote.framePrice.toFixed(2)}</td>
                        </tr>
                      )}

                      {/* Crystal */}
                      {quote.crystalBrand && quote.crystalBrand !== 'Ninguno' && (
                        <tr className="hover:bg-slate-50/50 transition-all">
                          <td className="p-3 font-mono text-[10px] text-slate-400 font-mono">CRIST-{quote.crystalBrand.substring(0,3).toUpperCase()}</td>
                          <td className="p-3">
                            <span className="font-extrabold text-slate-900 uppercase text-[11px]">Lunas Oftálmicas {quote.crystalBrand}</span>
                            <div className="text-[10px] text-slate-400 flex gap-4 mt-0.5">
                              <span><strong>Tratamiento Base:</strong> {quote.crystalType}</span>
                              {quote.crystalMaterial && <span><strong>Material base:</strong> {quote.crystalMaterial}</span>}
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold">1</td>
                          <td className="p-3 text-right font-mono">S/ {quote.crystalPrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">S/ {quote.crystalPrice.toFixed(2)}</td>
                        </tr>
                      )}

                      {/* Treatments */}
                      {quote.selectedTreatments.map((trName, index) => {
                        const price = quote.treatmentPrices?.[trName] !== undefined ? quote.treatmentPrices[trName] : 0;
                        return (
                          <tr key={index} className="hover:bg-slate-50/50 transition-all">
                            <td className="p-3 font-mono text-[10px] text-slate-400">TRAT-COAT-{index+1}</td>
                            <td className="p-3">
                              <span className="font-bold text-slate-800 uppercase text-[10px]">+ Recubrimiento / Aditivo: {trName}</span>
                              <p className="text-[10px] text-slate-400">Película de protección oftálmica termosellada sobre luna.</p>
                            </td>
                            <td className="p-3 text-center font-semibold">1</td>
                            <td className="p-3 text-right font-mono text-slate-400">{price > 0 ? `S/ ${price.toFixed(2)}` : 'Incluido'}</td>
                            <td className="p-3 text-right font-mono text-slate-700">{price > 0 ? `S/ ${price.toFixed(2)}` : 'Incluido'}</td>
                          </tr>
                        );
                      })}

                      {/* Gifts */}
                      {quote.selectedGifts.map((gfName, index) => (
                        <tr key={index} className="bg-emerald-50/10 text-emerald-800">
                          <td className="p-3 font-mono text-[10px] text-emerald-600 font-mono">OBSEQ-PROMO-{index+1}</td>
                          <td className="p-3">
                            <span className="font-bold uppercase text-[10.5px]">🎁 Cortesia: {gfName}</span>
                            <p className="text-[10px] text-emerald-600/70">Obsequio exclusivo por compra del pack completo.</p>
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-700">1</td>
                          <td className="p-3 text-right text-slate-400 line-through">S/ 20.00</td>
                          <td className="p-3 text-right font-black font-mono text-emerald-600">S/ 0.00</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Totals area */}
                <div className="grid grid-cols-2 pt-5 border-t border-slate-200">
                  <div className="space-y-3.5">
                    <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Garantía y Condiciones del Presupuesto</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      * El presente presupuesto cuenta con un margen de validez de 15 días enteros.<br />
                      * Todas nuestras lunas y multifocales cuentan con un periodo de adaptación médica garantizada de hasta 30 días con ajuste de cristales gratuito si se requiere.<br />
                      * Incluye estuche protector rígido de microfibra y spray desempañante de cortesía de obsequio.
                    </p>
                    <div className="border border-emerald-100 bg-emerald-50/50 p-2.5 rounded-lg text-[10px] text-emerald-900 flex items-center gap-2 max-w-[90%] font-medium leading-relaxed">
                      <Award className="w-5 h-5 shrink-0 text-emerald-700" />
                      <span>Certificamos lunas originales con filtros de laboratorios mundiales certificados (Essilor / Zeiss / Rodenstock).</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 w-[260px] justify-self-end text-slate-700">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">Monto Subtotal Neto:</span>
                      <span className="font-mono font-bold">S/ {quote.subtotal.toFixed(2)}</span>
                    </div>
                    {quote.discountAmount > 0 ? (
                      <div className="flex justify-between text-[11px] text-rose-600 font-bold">
                        <span className="font-semibold">Monto Descuento (-):</span>
                        <span className="font-mono font-extrabold">- S/ {quote.discountAmount.toFixed(2)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">I.G.V. de Ley (18% Incluido):</span>
                      <span className="font-mono">S/ {quote.igv.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 my-1"></div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs font-black text-slate-900">PRESUPUESTO NETO TOTAL:</span>
                      <span className="text-2xl font-mono font-black text-sky-600">S/ {quote.total.toFixed(2)}</span>
                    </div>

                    {/* Signature block with lots of fine whitespace */}
                    <div className="pt-14 text-center">
                      <div className="w-36 border-b border-slate-300 mx-auto h-0.5"></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block">Atención Optivision</span>
                      <span className="text-[8px] text-slate-400 block leading-none">Asesor de Presupuestos y Salud Ocular</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
