import React, { useState } from 'react';
import { Quote } from '../types';
import { Printer, X, Award, FileText, CheckCircle, Smartphone, MapPin, ReceiptText, Sparkles, ShieldCheck } from 'lucide-react';

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
    <svg className="w-52 h-12 mx-auto" viewBox="0 0 200 40">
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col h-[92vh] print-modal-container overflow-hidden border border-slate-200">
        
        {/* Top Header Selector Controls (Hidden during physical print) */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-indigo-950 tracking-wider">
                Proforma Oficial — Óptica Dac
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {quote.quoteNumber} — {quote.clientName || "Cliente"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Format Selector Tab */}
            <div className="bg-slate-200 p-1 rounded-lg flex items-center text-xs font-semibold text-slate-700">
              <button
                onClick={() => setFormat('A4')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  format === 'A4' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                A4 Corporativo
              </button>
              <button
                onClick={() => setFormat('Ticket')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  format === 'Ticket' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                <ReceiptText className="w-3.5 h-3.5" />
                Ticket 80mm
              </button>
            </div>

            {/* Print and Close Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Paper Container Body */}
        <div className="p-4 sm:p-8 overflow-y-auto flex justify-center bg-slate-100 flex-1 no-print">
          
          {/* Printable Element Frame */}
          <div 
            id="printable-quote-content" 
            className={`bg-white text-slate-950 font-sans tracking-wide leading-relaxed shadow-lg border border-slate-350 block printable-paper ${
              format === 'Ticket' 
                ? 'w-[80mm] min-h-[140mm] p-4 text-[11px] font-mono' 
                : 'w-[210mm] min-h-[297mm] p-12 text-[13px] font-sans'
            }`}
          >
            
            {/* 1. TICKET format layout */}
            {format === 'Ticket' ? (
              <div className="space-y-4 font-mono">
                
                {/* Header info */}
                <div className="text-center space-y-1">
                  <h1 className="text-base font-black uppercase text-slate-900 tracking-tighter">ÓPTICA DAC</h1>
                  <p className="text-[10px] text-slate-700 tracking-widest font-mono font-bold">PREMIUM VISUAL EXPERTS</p>
                  <p className="text-[9px] text-slate-500">R.U.C. 10428593741</p>
                  <p className="text-[9px] text-slate-600">Lima, Perú</p>
                  <div className="border-b border-dashed border-slate-300 my-2"></div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider">COTIZACIÓN DE PRESUPUESTO</h2>
                  <p className="text-[12px] font-black text-indigo-950">{quote.quoteNumber}</p>
                  <p className="text-[9px] text-slate-500">{formattedDate}</p>
                </div>

                {/* Patient / Client details */}
                <div className="space-y-1 text-[10px] bg-slate-50 p-2 rounded border border-slate-200">
                  <p className="truncate"><span className="font-bold uppercase">Cliente:</span> {quote.clientName}</p>
                  {quote.clientDni && <p className="font-mono"><span className="font-bold uppercase">Documento:</span> {quote.clientDni}</p>}
                  {quote.clientPhone && <p><span className="font-bold uppercase">Celular:</span> {quote.clientPhone}</p>}
                </div>

                {/* Optometric prescription if valid */}
                {quote.hasPrescription ? (
                  <div className="border border-dashed border-slate-400 p-2 text-[9px] space-y-1 bg-slate-50/50 rounded">
                    <p className="font-bold text-center text-[10px] text-indigo-900 border-b border-dashed border-slate-350 pb-0.5 uppercase tracking-wide">RECETA DE GRADUACIÓN</p>
                    <div className="grid grid-cols-6 text-center font-bold border-b border-dashed border-slate-200 py-0.5 text-[8.5px]">
                      <span>OJO</span><span>ESF</span><span>CIL</span><span>EJE</span><span>ADD</span><span>DIP</span>
                    </div>
                    <div className="grid grid-cols-6 text-center text-[9px]">
                      <span className="font-bold">OD</span>
                      <span>{quote.od.sphere || '0.00'}</span>
                      <span>{quote.od.cylinder || '0.00'}</span>
                      <span>{quote.od.axis || '0'}°</span>
                      <span>{quote.od.addition || '0.00'}</span>
                      <span>{quote.od.dip || '-'}</span>
                    </div>
                    <div className="grid grid-cols-6 text-center text-[9px]">
                      <span className="font-bold">OI</span>
                      <span>{quote.oi.sphere || '0.00'}</span>
                      <span>{quote.oi.cylinder || '0.00'}</span>
                      <span>{quote.oi.axis || '0'}°</span>
                      <span>{quote.oi.addition || '0.00'}</span>
                      <span>{quote.oi.dip || '-'}</span>
                    </div>
                    <p className="text-center text-[8.5px] font-bold border-t border-dashed border-slate-200 pt-1 uppercase text-indigo-950">Luna: {quote.lensType}</p>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 p-1 text-center text-[9px] uppercase italic text-slate-400">
                    Sin refracción asociada
                  </div>
                )}

                {/* Items grid */}
                <div className="space-y-1">
                  <div className="border-b border-dashed border-slate-350 my-1"></div>
                  <div className="grid grid-cols-4 font-bold text-[10px] text-slate-800">
                    <span className="col-span-2 uppercase">DESCRIPCIÓN</span>
                    <span className="text-right">CANT</span>
                    <span className="text-right">TOTAL</span>
                  </div>
                  <div className="border-b border-dashed border-slate-200 my-1"></div>
                  
                  {/* Frame */}
                  {quote.frameBrand && (
                    <div className="grid grid-cols-4 text-[10px] py-1">
                      <span className="col-span-2 uppercase text-slate-900 font-bold">
                        Montura: {quote.frameBrand} {quote.frameModel}<br />
                        <span className="text-[8.5px] text-slate-500 font-normal">({quote.frameColor} / {quote.frameMaterial})</span>
                      </span>
                      <span className="text-center">1</span>
                      <span className="text-right font-bold text-slate-950">S/ {quote.framePrice.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Crystal */}
                  {quote.crystalBrand && quote.crystalBrand !== 'Ninguno' && (
                    <div className="grid grid-cols-4 text-[10px] py-1 border-t border-dashed border-slate-100">
                      <span className="col-span-2 uppercase text-slate-900 font-bold">
                        Lunas: {quote.crystalBrand}<br />
                        <span className="text-[8.5px] text-slate-500 font-normal">({quote.crystalType} / {quote.crystalMaterial})</span>
                      </span>
                      <span className="text-center">1</span>
                      <span className="text-right font-bold text-slate-950">S/ {quote.crystalPrice.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Treatments */}
                  {quote.selectedTreatments.map((trName, index) => {
                    const price = quote.treatmentPrices?.[trName] !== undefined ? quote.treatmentPrices[trName] : 0;
                    return (
                      <div key={index} className="grid grid-cols-4 text-[9px] py-0.5 text-slate-700 italic border-t border-dashed border-slate-100">
                        <span className="col-span-2 uppercase">+ Tratamiento: {trName}</span>
                        <span className="text-center">1</span>
                        <span className="text-right font-bold">{price > 0 ? `S/ ${price.toFixed(2)}` : 'Incluido'}</span>
                      </div>
                    );
                  })}

                  {/* Gifts */}
                  {quote.selectedGifts.map((gfName, index) => (
                    <div key={index} className="grid grid-cols-4 text-[9px] py-0.5 text-emerald-800 italic border-t border-dashed border-slate-100 bg-emerald-50/20">
                      <span className="col-span-2 uppercase">🎁 Regalo: {gfName}</span>
                      <span className="text-center">1</span>
                      <span className="text-right font-bold text-emerald-600">Gratis</span>
                    </div>
                  ))}
                </div>

                {/* Calculations block */}
                <div className="space-y-1 text-[10px] border-t border-dashed border-slate-350 pt-2 font-mono">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>S/ {quote.subtotal.toFixed(2)}</span>
                  </div>
                  {quote.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>Descuento (-)</span>
                      <span>- S/ {quote.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-slate-200 my-1"></div>
                  <div className="flex justify-between font-black text-xs pt-0.5 text-indigo-950">
                    <span>Monto Total</span>
                    <span>S/ {quote.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Additional notes */}
                <div className="border border-slate-300 p-2 rounded text-[8.5px] text-slate-600 space-y-1">
                  <p>• Validez de proforma: {quote.validDays} días.</p>
                  {quote.estimatedDeliveryDate && (
                    <p>• Entrega estimada: {quote.estimatedDeliveryDate}</p>
                  )}
                  {quote.observations && (
                    <p className="italic">• Observaciones: {quote.observations}</p>
                  )}
                </div>

                {/* Ticket footer */}
                <div className="text-center pt-2 space-y-2">
                  <BarcodeSVG />
                  <p className="text-[7.5px] leading-relaxed text-slate-500">
                    Esta cotización es de carácter referencial para Óptica Dac. No reemplaza un comprobante de pago oficial registrado en SUNAT.
                  </p>
                  <p className="font-extrabold text-[10px] text-indigo-950 uppercase tracking-wider">¡Su salud visual en la mejor calidad!</p>
                </div>
              </div>
            ) : (
              
              /* 2. CORPORATE A4 FORMAT LAYOUT - HIGHLY MODERN & ELEGANT */
              <div className="space-y-6 font-sans text-slate-800 printable-content">
                
                {/* Header info */}
                <div className="flex justify-between pb-6 border-b-4 border-indigo-900 items-end">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-indigo-950 font-black text-3xl tracking-tight">
                      <div className="w-10 h-10 bg-indigo-900 text-white rounded-xl flex items-center justify-center font-serif shadow-sm">
                        <span>D</span>
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="font-serif italic font-extrabold text-indigo-950 text-2xl tracking-wide">ÓPTICA DAC</span>
                        <span className="text-[10px] font-mono tracking-widest font-extrabold text-indigo-600 mt-1">SALUD Y MODA VISUAL PREMIUM</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-slate-500 leading-normal max-w-sm">
                      Especialistas en lentes multifocales de alta gama, filtros de protección digital y armazones importados.
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Oficinas y Tiendas Autorizadas | Telf: 987 654 321<br />
                      Soporte y Cotizaciones: dacopticas_lima@gmail.com
                    </p>
                  </div>

                  {/* Document Badge Box */}
                  <div className="border-2 border-indigo-950 p-4 rounded-xl text-center bg-indigo-50/50 min-w-[240px] shadow-sm">
                    <p className="text-[9.5px] font-black text-indigo-900 tracking-widest uppercase mb-1">PROFORMA DE COMPRA OFICIAL</p>
                    <p className="text-[9px] font-bold text-slate-500 font-mono uppercase mb-2">R.U.C. 10428593741</p>
                    <div className="h-0.5 bg-indigo-950 my-1"></div>
                    <p className="text-xs font-mono font-black text-indigo-950 uppercase tracking-widest mt-1.5">{quote.quoteNumber}</p>
                    <p className="text-[10px] text-indigo-600 font-mono font-bold mt-1">SISTEMA POS CONECTADO</p>
                  </div>
                </div>

                {/* Grid Customer and Metadata */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <span className="text-indigo-600 font-bold">ℹ</span> 
                      DATOS PATIENTE / ADQUIRENTE
                    </h4>
                    <div className="space-y-1 text-slate-700">
                      <p className="font-extrabold text-indigo-950 text-sm uppercase">{quote.clientName}</p>
                      {quote.clientDni && <p className="text-[11px]"><span className="font-semibold text-slate-400">DNI / RUC:</span> <strong className="text-slate-800 font-mono">{quote.clientDni}</strong></p>}
                      {quote.clientPhone && <p className="text-[11px]"><span className="font-semibold text-slate-400">Celular de Contacto:</span> <strong className="text-slate-800 font-mono">{quote.clientPhone}</strong></p>}
                      {quote.clientEmail && <p className="text-[11px]"><span className="font-semibold text-slate-400">Correo Electrónico:</span> {quote.clientEmail}</p>}
                      {quote.clientAddress && <p className="text-[11px]"><span className="font-semibold text-slate-400">Domicilio Fiscal:</span> {quote.clientAddress}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-right">
                    <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-wider border-b border-slate-200 pb-1 text-right flex items-center justify-end gap-1.5">
                      DETALLES COMERCIALES
                      <span className="text-indigo-600 font-bold">📋</span> 
                    </h4>
                    <div className="space-y-1.5 text-slate-700">
                      <p className="text-[11px]"><span className="text-slate-400 font-semibold">Fecha Registro:</span> {formattedDate}</p>
                      <p className="text-[11px]"><span className="text-slate-400 font-semibold">Validez Proforma:</span> {quote.validDays} días calendar.</p>
                      <p className="text-[11px]"><span className="text-slate-400 font-semibold">Límite Comercial:</span> {new Date(new Date(quote.date).getTime() + quote.validDays*24*60*60*1000).toLocaleDateString('es-PE')}</p>
                      {quote.estimatedDeliveryDate && (
                        <p className="text-[11.5px] text-indigo-900 font-extrabold">
                          <span className="text-slate-400 font-semibold font-normal">Plazo de Confección:</span> {quote.estimatedDeliveryDate}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-700 font-bold"><span className="text-slate-400 font-normal">Asesor Visual:</span> Estefany López</p>
                    </div>
                  </div>
                </div>

                {/* Clinical Prescription Table Area (With larger typography) */}
                {quote.hasPrescription ? (
                  <div className="border border-slate-350 rounded-xl p-5 bg-white shadow-xs">
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-3.5 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-700" />
                      REFRACCIÓN OFTÁLMICA CERTIFICADA
                    </h3>
                    <div className="grid grid-cols-7 gap-px bg-slate-300 border border-slate-350 rounded overflow-hidden">
                      <div className="bg-slate-900 p-2.5 text-[9.5px] font-extrabold text-white text-center uppercase">OJO</div>
                      <div className="bg-slate-900 p-2.5 text-[9.5px] font-extrabold text-white text-center uppercase">ESFERA (SPH)</div>
                      <div className="bg-slate-900 p-2.5 text-[9.5px] font-extrabold text-white text-center uppercase">CILINDRO (CYL)</div>
                      <div className="bg-slate-900 p-2.5 text-[9.5px] font-extrabold text-white text-center uppercase">EJE (AXIS)</div>
                      <div className="bg-slate-900 p-2.5 text-[9.5px] font-extrabold text-white text-center uppercase">ADICIÓN (ADD)</div>
                      <div className="bg-slate-900 p-2.5 text-[9.5px] font-extrabold text-white text-center uppercase">D.I.P (mm)</div>
                      <div className="bg-slate-900 p-2.5 text-[9.5px] font-extrabold text-white text-center uppercase">TECNOLOGÍA LUNA</div>
                      
                      <div className="bg-slate-50 p-3 text-[12px] font-extrabold text-slate-800 text-center leading-none border-b border-slate-100">OD (DERECHO)</div>
                      <div className="bg-white p-3 text-sm font-mono font-bold text-center text-slate-700 border-b border-indigo-50 leading-none">{quote.od.sphere || '0.00'}</div>
                      <div className="bg-white p-3 text-sm font-mono font-bold text-center text-slate-700 border-b border-indigo-50 leading-none">{quote.od.cylinder || '0.00'}</div>
                      <div className="bg-white p-3 text-sm font-mono font-bold text-center text-slate-700 border-b border-indigo-50 leading-none">{quote.od.axis || '0'}°</div>
                      <div className="bg-white p-3 text-sm font-mono font-bold text-center text-slate-700 border-b border-indigo-50 leading-none">{quote.od.addition || '0.00'}</div>
                      <div className="bg-white p-3 text-sm font-mono font-bold text-center text-indigo-900 border-b border-indigo-50 leading-none">{quote.od.dip || '-'} mm</div>
                      <div className="bg-indigo-50/20 p-3 text-xs font-black text-indigo-950 text-center row-span-2 flex items-center justify-center border-l border-slate-200">
                        {quote.lensType}
                      </div>

                      <div className="bg-slate-50 p-3 text-[12px] font-extrabold text-slate-800 text-center leading-none">OI (IZQUIERDO)</div>
                      <div className="bg-white p-3 text-sm font-mono font-bold text-center text-slate-700 leading-none">{quote.oi.sphere || '0.00'}</div>
                      <div className="bg-white p-3 text-sm font-mono font-bold text-center text-slate-700 leading-none">{quote.oi.cylinder || '0.00'}</div>
                      <div className="bg-white p-3 text-sm font-mono font-bold text-center text-slate-700 leading-none">{quote.oi.axis || '0'}°</div>
                      <div className="bg-white p-3 text-sm font-mono font-bold text-center text-slate-700 leading-none">{quote.oi.addition || '0.00'}</div>
                      <div className="bg-white p-3 text-sm font-mono font-bold text-center text-indigo-900 leading-none">{quote.oi.dip || '-'} mm</div>
                    </div>
                    {quote.doctorName && (
                      <div className="mt-3 text-[11px] text-slate-500 italic flex items-center justify-between px-3 py-1.5 bg-indigo-50/20 border border-indigo-100 rounded">
                        <span><strong className="text-indigo-900 not-italic uppercase font-bold text-[9.5px]">PROFESIONAL OPTÓMETRA:</strong> {quote.doctorName}</span>
                        <span>Medidas sujetas a control goniométrico de lunas.</span>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Quoted Items Detail Table */}
                <div className="space-y-3.5">
                  <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-indigo-900 rounded-xs"></div>
                    PRESUPUESTO DETALLADO DE PACK OFTÁLMICO
                  </h3>
                  
                  <div className="border border-slate-350 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider">
                          <th className="p-3 text-left w-[20%]">CODIFICACIÓN</th>
                          <th className="p-3 text-left w-[50%]">ESPECIFICACIÓN / TRATAMIENTOS</th>
                          <th className="p-3 text-center w-[10%]">CANT.</th>
                          <th className="p-3 text-right w-[20%]">PRECIO NETO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                        
                        {/* Frame */}
                        {quote.frameBrand && (
                          <tr className="hover:bg-slate-50/40">
                            <td className="p-3.5 font-mono text-[10.5px] text-slate-400 font-bold block">MON-DAC-{quote.frameBrand.substring(0,3).toUpperCase()}</td>
                            <td className="p-3.5">
                              <span className="font-extrabold text-indigo-950 uppercase text-[12.5px] block leading-tight">Montura Oftálmica {quote.frameBrand}</span>
                              <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 mt-1 font-sans">
                                <span><strong>Modelo:</strong> {quote.frameModel}</span>
                                <span><strong>Color y Tonos:</strong> {quote.frameColor}</span>
                                {quote.frameMaterial && <span><strong>Material:</strong> {quote.frameMaterial}</span>}
                              </div>
                            </td>
                            <td className="p-3.5 text-center font-bold text-slate-900">1</td>
                            <td className="p-3.5 text-right font-mono font-extrabold text-slate-900">S/ {quote.framePrice.toFixed(2)}</td>
                          </tr>
                        )}

                        {/* Crystal */}
                        {quote.crystalBrand && quote.crystalBrand !== 'Ninguno' && (
                          <tr className="hover:bg-slate-50/40">
                            <td className="p-3.5 font-mono text-[10.5px] text-slate-400 font-bold">LUN-DAC-{quote.crystalBrand.substring(0,3).toUpperCase()}</td>
                            <td className="p-3.5">
                              <span className="font-extrabold text-indigo-950 uppercase text-[12.5px] block leading-tight">Cristal Técnico {quote.crystalBrand}</span>
                              <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 mt-1">
                                <span><strong>Tratamiento:</strong> {quote.crystalType}</span>
                                {quote.crystalMaterial && <span><strong>Material y Tipo:</strong> {quote.crystalMaterial}</span>}
                              </div>
                            </td>
                            <td className="p-3.5 text-center font-bold text-slate-900">1</td>
                            <td className="p-3.5 text-right font-mono font-extrabold text-slate-900">S/ {quote.crystalPrice.toFixed(2)}</td>
                          </tr>
                        )}

                        {/* Treatments */}
                        {quote.selectedTreatments.map((trName, index) => {
                          const price = quote.treatmentPrices?.[trName] !== undefined ? quote.treatmentPrices[trName] : 0;
                          return (
                            <tr key={index} className="hover:bg-slate-50/40">
                              <td className="p-3 text-slate-400 font-mono text-[10px]">TRAT-COAT-{index+1}</td>
                              <td className="p-3">
                                <span className="font-bold text-slate-800 uppercase text-[11px]">+ {trName}</span>
                                <p className="text-[10px] text-slate-400 leading-none mt-0.5">Filtro de recubrimiento sellado de protección visual.</p>
                              </td>
                              <td className="p-3 text-center font-semibold text-slate-900">1</td>
                              <td className="p-3 text-right font-mono text-[11px] font-bold text-indigo-950">
                                {price > 0 ? `S/ ${price.toFixed(2)}` : 'Incluido'}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Gifts */}
                        {quote.selectedGifts.map((gfName, index) => (
                          <tr key={index} className="bg-emerald-50/15 text-emerald-900 border-l-4 border-emerald-500">
                            <td className="p-3 font-mono text-[10px] text-emerald-600 font-bold">OBSEQ-PROMO-{index+1}</td>
                            <td className="p-3">
                              <span className="font-black uppercase text-[11px] text-emerald-950">🎁 Obsequio Dac: {gfName}</span>
                              <p className="text-[10px] text-emerald-600 leading-none mt-0.5">Cortesía de fidelidad por la compra de la montura.</p>
                            </td>
                            <td className="p-3 text-center font-bold text-emerald-800">1</td>
                            <td className="p-3 text-right font-mono text-[11px] text-emerald-600 font-black">S/ 0.00</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Totals area */}
                <div className="grid grid-cols-2 pt-6 border-t-2 border-slate-300">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-indigo-950 uppercase tracking-widest block border-b border-slate-200 pb-1">Garantías Optronómicas y Condiciones</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      • **Período de Adaptación**: Ofrecemos hasta 30 días para calibrar y moldear sus multifocales o lunas conforme recete su médico.<br />
                      • **Laboratorios Certificados**: Óptica Dac solo comercializa cristales legítimos con tarjetas de garantía Essilor, Zeiss y Hoya.<br />
                      • **Mantenimiento**: Limpieza ultrasónica y repuestos de plaquetas gratis por un año.
                    </p>
                    <div className="border border-indigo-150 bg-indigo-50/20 p-3 rounded-lg text-[11px] text-indigo-950 flex items-center gap-2 font-medium leading-relaxed max-w-[95%]">
                      <Award className="w-5 h-5 shrink-0 text-indigo-700" />
                      <span>Todas nuestras monturas de marca importadas cuentan con un año de garantía contra rotura de bisagras o fallas de fábrica.</span>
                    </div>
                  </div>

                  {/* Calculations and totals with thick typography */}
                  <div className="space-y-2 w-[280px] justify-self-end text-slate-800">
                    <div className="flex justify-between text-[11.5px]">
                      <span className="font-bold text-slate-500">Subtotal Neto:</span>
                      <span className="font-mono font-bold text-slate-900">S/ {quote.subtotal.toFixed(2)}</span>
                    </div>
                    {quote.discountAmount > 0 ? (
                      <div className="flex justify-between text-[11.5px] text-rose-700 font-black font-sans bg-rose-50 p-1.5 rounded border border-rose-100">
                        <span>Descuento Aplicado (-):</span>
                        <span className="font-mono">- S/ {quote.discountAmount.toFixed(2)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-[11.5px]">
                      <span className="font-bold text-slate-500">I.G.V. de Ley (18% Incl.):</span>
                      <span className="font-mono">S/ {quote.igv.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-350 my-2"></div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-[11px] font-black text-indigo-950 tracking-wider">PRESUPUESTO NETO TOTAL:</span>
                      <span className="text-3xl font-mono font-black text-indigo-900 tracking-tighter">S/ {quote.total.toFixed(2)}</span>
                    </div>

                    {/* Signature block */}
                    <div className="pt-16 text-center">
                      <div className="w-40 border-b-2 border-indigo-900/60 mx-auto h-0.5"></div>
                      <span className="text-[9.5px] font-extrabold text-indigo-900 uppercase tracking-widest mt-2 block">Control Comercial Dac</span>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">Optómetras Especialistas Asociados</span>
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
