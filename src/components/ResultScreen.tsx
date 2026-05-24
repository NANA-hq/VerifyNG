import React, { useState } from "react";
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Activity, 
  Atom,
  HelpCircle,
  Share2, 
  AlertOctagon, 
  MapPin, 
  Calendar, 
  Tag, 
  CornerDownRight, 
  HeartHandshake,
  Search
} from "lucide-react";
import { Product, ScreenId } from "../types";

interface ResultScreenProps {
  product: Product;
  onBack: () => void;
  onGoToReport: (name: string, brand: string) => void;
  onGoToIngredients: (ingredients: string) => void;
}

export default function ResultScreen({ product, onBack, onGoToReport, onGoToIngredients }: ResultScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`VerifyNG Alert: ${product.name} (NAFDAC: ${product.nafdacNo}) is verified as ${product.status.toUpperCase()}. Safety Score: ${product.safetyscore}/100.`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusConfig = () => {
    switch (product.status) {
      case "verified":
        return {
          bg: "bg-emerald-50 border-emerald-200",
          text: "text-emerald-800",
          iconBg: "bg-emerald-500 text-white",
          badgeBg: "bg-emerald-600 text-white",
          label: "CERTIFIED NAFDAC VALID",
          badgeIcon: ShieldCheck,
          accentColor: "emerald"
        };
      case "counterfeit":
        return {
          bg: "bg-red-50 border-red-200",
          text: "text-red-955",
          iconBg: "bg-red-650 text-white",
          badgeBg: "bg-red-650 text-white",
          label: "CONFIRMED COUNTERFEIT",
          badgeIcon: AlertOctagon,
          accentColor: "red"
        };
      case "flagged":
        return {
          bg: "bg-amber-50 border-amber-200",
          text: "text-amber-900",
          iconBg: "bg-amber-500 text-white",
          badgeBg: "bg-amber-500 text-white",
          label: "REGULATORY WARNING / FLAGGED",
          badgeIcon: AlertTriangle,
          accentColor: "amber"
        };
      case "unregistered":
      default:
        return {
          bg: "bg-slate-50 border-slate-200",
          text: "text-slate-800",
          iconBg: "bg-slate-500 text-white",
          badgeBg: "bg-slate-700 text-white",
          label: "UNREGISTERED / NOT FOUND",
          badgeIcon: HelpCircle,
          accentColor: "slate"
        };
    }
  };

  const conf = getStatusConfig();
  const BadgeIcon = conf.badgeIcon;

  return (
    <div className="w-full pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-700 hover:text-gray-950 font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-heading">Diagnostic Report</span>
        <button 
          onClick={handleShare}
          className="p-2 text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200.5 transition-colors"
          title="Share verification copy"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </header>

      {copied && (
        <div className="mx-5 mt-4 p-2.5 bg-brand-green-600 text-white text-xs font-semibold text-center rounded-lg shadow-sm animate-fade-in">
          ✓ Copied report summary clipboard! Share with family on WhatsApp.
        </div>
      )}

      {/* Main Container */}
      <div className="px-5 mt-5 space-y-4">
        
        {/* Simplified Status Notification */}
        <div className={`p-4 rounded-xl border ${conf.bg} text-left`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${conf.iconBg}`}>
              <BadgeIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">SURVEILLANCE DIRECTORY STATUS</span>
              <h2 className={`text-sm font-bold uppercase tracking-tight ${conf.text}`}>{conf.label}</h2>
            </div>
          </div>
          {product.alertReason && (
            <div className="mt-3 p-3 bg-red-50/75 border-l-2 border-red-500 rounded-r-lg text-xs leading-relaxed text-red-900 font-medium">
              <span className="font-bold text-red-755 block text-[10px] uppercase">Reason:</span>
              {product.alertReason}
            </div>
          )}
        </div>

        {product.status === "unregistered" ? (
          /* Unregistered Safe Protocol Warning Frame */
          <div className="bg-white border border-gray-150 rounded-xl p-5 text-left shadow-xs">
            <div className="text-center py-6 border-b border-gray-100 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-slate-500" />
              </div>
              <h1 className="text-base font-bold font-heading text-gray-950 tracking-tight">No Active Registry Record</h1>
              <p className="text-xs text-gray-505 mt-1.5 px-3 leading-relaxed">
                The identifier <span className="font-mono font-bold text-gray-800 bg-gray-50 px-1 py-0.5 rounded">"{product.barcode || product.nafdacNo || product.name}"</span> is not registered inside the active NAFDAC online database registry.
              </p>
            </div>

            <div className="space-y-4 text-xs text-gray-600">
              <div className="p-3.5 bg-red-50/60 border border-red-100 rounded-xl">
                <span className="font-bold text-red-755 block text-[10px] uppercase mb-1">DANGER ADVISORY:</span>
                <p className="leading-relaxed">
                  Unregistered drug, cosmetic, or food formulations skip professional sanitary safety inspections, chemical hazard controls, and validation procedures. This item risks containing banned bleaching agents, heavy metals, or contaminated excipients.
                </p>
              </div>

              <div className="p-3.5 border border-dashed border-gray-200 rounded-xl">
                <span className="font-bold text-gray-900 block mb-1">Recommended Safety Actions:</span>
                <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
                  <li>Double check that the input scratch numerical digits matched the packaging card exactly.</li>
                  <li>Inspect cosmetic cartons or tubes for an official NAFDAC registration code imprint.</li>
                  <li>Refuse to purchase medication or nutritional formulas from open kiosks or transient traders.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Minimalist Verified Detail Certificate Card */}
            <div className="bg-white border border-gray-150 rounded-xl p-5 text-left shadow-xs">
              <div className="border-b border-gray-100 pb-4">
                {product.status === "verified" ? (
                  <span className="inline-block text-[9px] font-bold text-brand-green-800 bg-brand-green-50 border border-brand-green-100 px-2 py-0.5 rounded uppercase font-mono">
                    ✓ NAFDAC Sourced Verified
                  </span>
                ) : product.status === "counterfeit" ? (
                  <span className="inline-block text-[9px] font-bold text-red-800 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase font-mono">
                    ✗ Confirmed Counterfeit Batch
                  </span>
                ) : (
                  <span className="inline-block text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded uppercase font-mono">
                    ⚠️ Regulatory Flagged Warning
                  </span>
                )}
                <h1 className="text-base font-bold font-heading mt-2 text-gray-950 tracking-tight">{product.name}</h1>
                <p className="text-xs text-gray-500 mt-0.5">Brand Code / Owner: <span className="text-gray-900 font-semibold">{product.brand}</span></p>
              </div>

              {/* Sourced Data Spec Table */}
              <div className="mt-4 space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-50">
                  <span className="text-gray-400">NAFDAC Reg No:</span>
                  <span className="font-mono font-bold text-gray-900">{product.nafdacNo}</span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-gray-50">
                  <span className="text-gray-400">Barcode / GTIN:</span>
                  <span className="font-mono font-bold text-gray-950">{product.barcode || "N/A"}</span>
                </div>

                {product.manufacturer && (
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                    <span className="text-gray-400">Manufacturer / Factory:</span>
                    <span className="font-bold text-gray-900 truncate max-w-[220px]" title={product.manufacturer}>{product.manufacturer}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 font-mono">
                  <span className="text-gray-400 font-sans">Batch Code:</span>
                  <span className="font-bold text-gray-900 bg-slate-50 px-1.5 py-0.5 rounded">{product.batchNo || "Verified Active Register"}</span>
                </div>

                {product.expiryDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-sans">Registry Expiration:</span>
                    <span className="font-bold text-gray-900 font-mono">
                      {product.expiryDate}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Clean Chemical Safety & Ingredients Overview */}
            <div className="bg-white border border-gray-150 rounded-xl p-5 text-left shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Atom className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase font-heading">Ingredient Report</h3>
                </div>
                <button
                  onClick={() => onGoToIngredients(product.ingredients.join(", "))}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Analyze List
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-3">{product.analysis.description || "Formulation matches active pharmaceutical safety parameters."}</p>

              <div className="space-y-2.5 text-xs">
                {product.analysis.riskyElements.length > 0 && (
                  <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg">
                    <span className="text-[10px] font-bold text-red-700 uppercase block mb-1">Detected Hazardous Active Fillers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.analysis.riskyElements.map((elem, idx) => (
                        <span key={idx} className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded">
                          {elem}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.analysis.safeElements.length > 0 && (
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1 font-sans">Certified Safe Sighted Elements:</span>
                    <div className="flex flex-wrap gap-1.5 font-mono">
                      {product.analysis.safeElements.map((elem, idx) => (
                        <span key={idx} className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {elem}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Dynamic Action footer built to user intent */}
        <div className="mt-5.5 space-y-3 text-center">
          {product.status === "verified" && (
            <div className="p-4 bg-brand-green-50/50 border border-brand-green-200 rounded-xl flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 text-brand-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-brand-green-950 leading-relaxed text-left font-medium">
                VerifyNG confirms this item matches NAFDAC registered parameters. If you suspect packaging defects, blurred barcode labels, or cloned numerical registration values, please use the button below to report this batch immediately.
              </p>
            </div>
          )}

          <button
            onClick={() => onGoToReport(product.name, product.brand)}
            className="w-full py-4 bg-red-600 text-white rounded-xl font-extrabold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer border-2 border-red-800"
          >
            <AlertOctagon className="w-4 h-4" />
            Report Counterfeit Batch to NAFDAC
          </button>

          <button
            onClick={onBack}
            className="w-full py-3 bg-gray-150 text-gray-700 hover:text-gray-900 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            Perform Another Safety Check
          </button>
        </div>
      </div>
    </div>
  );
}
