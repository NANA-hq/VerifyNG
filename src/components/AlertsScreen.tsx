import React, { useState } from "react";
import { 
  AlertOctagon, 
  Search, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  ShieldAlert, 
  Megaphone, 
  CornerDownRight, 
  X,
  PlusSquare,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Plus,
  Info
} from "lucide-react";
import { FakeAlert, ScreenId } from "../types";

const INITIAL_ALERTS: FakeAlert[] = [
  {
    id: "a1",
    productName: "My Pikin Paracetamol Syrup",
    badge: "Contaminated Glycol",
    riskLevel: "Critical",
    nafdacNo: "04-2198",
    targetBatch: "MP-9941A & MP-9942B",
    description: "Contaminated with Diethylene Glycol during backyard manufacturing. Highly lethal substance causing severe infant renal failures and death. NAFDAC has prohibited all distribution of bottles carrying this brand profile.",
    marketSighted: "Onitsha Main Market, Anambra State & Sabon Gari Market, Kano",
    publishedDate: "May 20, 2026"
  },
  {
    id: "a2",
    productName: "Glow & Tone Hydroquinone Body Whitener",
    badge: "Banned Mercury",
    riskLevel: "High",
    nafdacNo: "B4-9981A",
    targetBatch: "MG-WHITE-01",
    description: "Contains extremely lethal concentrations of mercury salts and 6.2% Hydroquinone. Promotes rapid organ cancer, chronic skin thinning, and black chemical pigmentation. Stop usage immediately.",
    marketSighted: "Balogun Market, Lagos Island & Ariaria International Market, Aba",
    publishedDate: "May 18, 2026"
  },
  {
    id: "a3",
    productName: "Golden Morn Refill Cereal Multipack",
    badge: "Aflatoxin Poison",
    riskLevel: "High",
    nafdacNo: "Nestle Spoof 01-0056",
    targetBatch: "GM-2026-FAKE",
    description: "Counterfeit bags produced using low-grade animal grain feed containing severe aflatoxin mould infestation. Exhibits double heat-seal trails along the edges. Can cause acute liver failure in youngsters.",
    marketSighted: "Sabo Market, Kaduna & Wuse General Market, Abuja",
    publishedDate: "May 14, 2026"
  },
  {
    id: "a4",
    productName: "Tandem Cough Linctus Formula",
    badge: "Ethylene Contaminant",
    riskLevel: "Critical",
    nafdacNo: "04-4518",
    targetBatch: "TND-CL-55",
    description: "Lab checks confirmed high levels of Ethylene Glycol. Prohibited by NAFDAC directive. If sighted, confiscate and report dealer shop instantly.",
    marketSighted: "Osun State Supermarkets & Port Harcourt Retail Stalls",
    publishedDate: "May 10, 2026"
  },
  {
    id: "a5",
    productName: "Amatem Softgel 20/120 Antimalarial (Counterfeit)",
    badge: "Zero Active Ingredients",
    riskLevel: "Critical",
    nafdacNo: "A4-8521",
    targetBatch: "AM-9022X & AM-9104Y",
    description: "Counterfeit softgel capsules containing zero Artemether or Lumefantrine therapeutic actives. Failed standard chromatography analyses. Leaving malaria patients standardly untreated, risking quick cerebral malaria complications.",
    marketSighted: "Idumota Plaza, Lagos Island & Onitsha Patent Medicine stores",
    publishedDate: "May 08, 2026"
  },
  {
    id: "a6",
    productName: "Dr. Miracle's Hair Treatment (Banned Batch)",
    badge: "Heavy Formaldehyde",
    riskLevel: "Warning",
    nafdacNo: "02-9921B",
    targetBatch: "DM-HAIR-882",
    description: "Contains extremely high levels of carcinogen Formaldehyde, causing quick chemical burns, hair follicle loss, and chronic asthma flares on contact. Check labels carefully.",
    marketSighted: "Wuse Market, Abuja & Gbagi Market, Ibadan",
    publishedDate: "April 29, 2026"
  },
  {
    id: "a7",
    productName: "Procaine Penicillin G Injection Vials",
    badge: "Chalk Adulterant",
    riskLevel: "Critical",
    nafdacNo: "04-7123",
    targetBatch: "PC-1994V7",
    description: "Non-sterile injection formulations diluted with cheap inert calcium sulfate binders (chalk). Sighted in local clinics. Poses immediate terminal risks of septic shock and systemic bacterial infections.",
    marketSighted: "Sabon Gari Market, Kano & Abubakar Rimi Market",
    publishedDate: "April 22, 2026"
  },
  {
    id: "a8",
    productName: "Nido Fortified Milk Powder (Refill Counterfeit)",
    badge: "Industrial Melamine",
    riskLevel: "Critical",
    nafdacNo: "Nestle Spoof 02-1144",
    targetBatch: "ND-FORT-90F",
    description: "Counterfeit cheap nylon packaging containing toxic industrial melamine compound to falsely spikes automated protein-density tests. Induces kidney sand/stones and acute system failures in growing babies.",
    marketSighted: "Mile 12 Market, Lagos & Bodija Foods Market, Ibadan",
    publishedDate: "April 15, 2026"
  }
];

interface AlertsScreenProps {
  onBack: () => void;
  onGoToReport: (name: string, location: string) => void;
}

export default function AlertsScreen({ onBack, onGoToReport }: AlertsScreenProps) {
  const [alerts, setAlerts] = useState<FakeAlert[]>(INITIAL_ALERTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<FakeAlert | null>(null);
  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({
    a1: true // Expand the first hazard record by default to show capability
  });

  // User Advisory Contribution state
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customBadge, setCustomBadge] = useState("");
  const [customRisk, setCustomRisk] = useState<"Critical" | "High" | "Warning">("High");
  const [customNafdac, setCustomNafdac] = useState("");
  const [customBatch, setCustomBatch] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customMarket, setCustomMarket] = useState("");

  const filteredAlerts = alerts.filter(a => 
    a.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.marketSighted.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedAlerts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customBadge.trim()) return;

    const newAlert: FakeAlert = {
      id: "contributed-" + Date.now(),
      productName: customName,
      badge: customBadge,
      riskLevel: customRisk,
      nafdacNo: customNafdac || "Awaiting NAFDAC Lab Code",
      targetBatch: customBatch || "All Batches Marked",
      description: customDescription || "Advisory warning flagged by active consumer. Verified on-grid sample scheduled for national laboratory review.",
      marketSighted: customMarket || "General retail stores in Nigeria",
      publishedDate: "Today (Contributed Log)"
    };

    setAlerts([newAlert, ...alerts]);
    setExpandedAlerts(prev => ({ ...prev, [newAlert.id]: true }));

    // Reset fields
    setCustomName("");
    setCustomBadge("");
    setCustomRisk("High");
    setCustomNafdac("");
    setCustomBatch("");
    setCustomDescription("");
    setCustomMarket("");
    setShowAddForm(false);
  };

  return (
    <div className="w-full pb-24 relative">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-700 hover:text-gray-950 font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <div className="flex items-center gap-1.5 font-heading">
          <AlertOctagon className="w-5 h-5 text-red-600 animate-pulse" />
          <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">Active Scam Alerts</span>
        </div>
        <div className="w-5"></div>
      </header>

      <div className="px-5 mt-5">
        
        {/* Banner */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-955 text-left">
          <Megaphone className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider font-heading flex items-center gap-2">
              <span>NAFDAC & SON Blacklist Feed</span>
              <span className="text-[9px] bg-red-105 text-red-700 font-mono px-1.5 py-0.2 rounded-full uppercase">
                {alerts.length} Records Active
              </span>
            </h4>
            <p className="text-xs text-red-900 mt-0.5 leading-relaxed font-medium">
              Daily intelligence log of counterfeit batches, unregistered chemicals, and toxic imports discovered at borders and major Nigerian open markets.
            </p>
          </div>
        </div>

        {/* Toolbar Grid: Search and Collapse/Form actions */}
        <div className="mt-4.5 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center p-3 bg-white rounded-xl border border-gray-200 focus-within:ring-1 focus-within:ring-brand-green-500 shadow-sm">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by product name, ingredient or market..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-gray-800 bg-transparent focus:outline-none placeholder-gray-400 font-medium"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Log a custom alert advisory based on field reports"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Sighting</span>
            </button>
          </div>
        </div>

        {/* Form Container to Log a Custom Blacklist Sighting */}
        {showAddForm && (
          <form 
            onSubmit={handleAddCustomAlert}
            className="mt-4 p-5 bg-white border border-red-152 rounded-2xl shadow-xs text-left animate-fade-in space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
                <h4 className="text-xs font-black uppercase tracking-wider font-heading text-gray-900">
                  Submit Sighted Counterfeit Advisory Log
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-650 bg-slate-50 hover:bg-slate-100 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <p className="text-[10.5px] text-gray-500 leading-normal">
              Contribute verified field warnings on fakes or banned batches. Sourced logs are immediately prepended to your portal index.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amatem Softgel 20/120 (Imitation)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-205 focus:border-brand-green-500 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Hazard / Active Toxicant *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Contains high-concentration mercury salts"
                  value={customBadge}
                  onChange={(e) => setCustomBadge(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-205 focus:border-brand-green-500 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">NAFDAC Reg No (if spoofed)</label>
                <input
                  type="text"
                  placeholder="e.g. B4-9981X"
                  value={customNafdac}
                  onChange={(e) => setCustomNafdac(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-205 focus:border-brand-green-500 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Batches / Codes</label>
                <input
                  type="text"
                  placeholder="e.g. BT-4402A & BT-4403B"
                  value={customBatch}
                  onChange={(e) => setCustomBatch(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-205 focus:border-brand-green-500 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Risk Threat Level</label>
                <select
                  value={customRisk}
                  onChange={(e) => setCustomRisk(e.target.value as any)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:border-brand-green-500 outline-none"
                >
                  <option value="Critical">🚨 Critical Hazard</option>
                  <option value="High">⚠️ High Risk</option>
                  <option value="Warning">ℹ️ Safety Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Sighted Locations / Hotbed Markets</label>
                <input
                  type="text"
                  placeholder="e.g. Idumota Market, Lagos & Mile 12"
                  value={customMarket}
                  onChange={(e) => setCustomMarket(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-205 focus:border-brand-green-500 rounded-lg outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 font-mono">Detailed Sighting Warnings / Adverse Signs</label>
              <textarea
                placeholder="Describe chemical irregularities, packaging flaws (e.g., poor double seal), or physical symptoms reported from usage..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={3}
                className="w-full text-xs font-semibold p-2.5 border border-gray-205 focus:border-brand-green-500 rounded-lg outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Verify & Append to Blacklist Feed
            </button>
          </form>
        )}

        {/* Alerts List */}
        <div className="mt-6 space-y-3.5">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 bg-white rounded-xl text-center border border-gray-100">
              <span className="text-xs text-gray-400 font-semibold block">No matching fraud alerts logged in registry.</span>
              <p className="text-[11px] text-gray-400 mt-1">Try searching for other words like "Syrup" or "Lagos".</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isExpanded = !!expandedAlerts[alert.id];
              return (
                <div 
                  key={alert.id}
                  className={`bg-white border rounded-xl p-5 hover:shadow-xs transition-all text-left ${
                    isExpanded ? "border-red-300 ring-2 ring-red-50/50" : "hover:border-red-200 border-gray-150"
                  }`}
                >
                  {/* Top row trigger list card body toggle */}
                  <div 
                    onClick={() => toggleExpand(alert.id)}
                    className="flex justify-between items-start gap-4 cursor-pointer select-none"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap pb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                          alert.riskLevel === "Critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {alert.riskLevel} Hazard
                        </span>
                        
                        <p className="text-xs text-red-700 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-md self-start">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-655" />
                          <span>{alert.badge}</span>
                        </p>
                      </div>

                      <h3 className="text-base font-bold text-gray-950 font-heading tracking-tight mt-2">{alert.productName}</h3>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-gray-400 text-[10px] font-bold font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-300" />
                          <span>Advisory Date: {alert.publishedDate}</span>
                        </span>
                        <span className="flex items-center gap-1 text-red-400">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[280px]">Hotbed: {alert.marketSighted.split("&")[0].trim()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors shrink-0 flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-1 hidden sm:inline">
                        {isExpanded ? "Hide detail" : "Read detail"}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-red-500" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Collapsible details body rendering inline */}
                  {isExpanded ? (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fade-in text-xs text-gray-600">
                      <div>
                        <span className="text-[9.5px] font-bold text-red-500 font-mono tracking-wider uppercase block mb-1">Advisory Incident Description & Action Matrix</span>
                        <p className="leading-relaxed text-gray-700 font-medium">
                          {alert.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-[9.2px] font-extrabold text-gray-440 uppercase tracking-widest block mb-0.5">NAFDAC Regulatory ID</span>
                          <span className="font-mono font-bold text-gray-950 text-xs">{alert.nafdacNo}</span>
                        </div>
                        <div>
                          <span className="text-[9.2px] font-extrabold text-gray-440 uppercase tracking-widest block mb-0.5">Suspect Batches</span>
                          <span className="font-mono font-bold text-gray-900 text-xs">{alert.targetBatch}</span>
                        </div>
                        <div>
                          <span className="text-[9.2px] font-extrabold text-gray-440 uppercase tracking-widest block mb-0.5">Sighted Market Locations</span>
                          <span className="font-bold text-gray-900 text-xs block truncate" title={alert.marketSighted}>{alert.marketSighted}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Always check scratch PIN cards on these batches.</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            className="px-3 py-2 border border-gray-200 hover:border-red-200 rounded-xl font-bold hover:bg-slate-50 transition-all text-gray-700 cursor-pointer text-[11px]"
                          >
                            Inspection Details
                          </button>
                          <button
                            onClick={() => {
                              const alertProd = alert.productName;
                              const alertLoc = alert.marketSighted.split("&")[0].trim();
                              onGoToReport(alertProd, alertLoc);
                            }}
                            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-[11px] uppercase tracking-wide shadow-2xs"
                          >
                            <PlusSquare className="w-3.5 h-3.5" />
                            Report Sighting
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5 pt-2.5 border-t border-dashed border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <div className="truncate max-w-[80%]">
                        <span className="font-bold text-gray-500 font-sans">Warning Scope:</span> {alert.description}
                      </div>
                      <button 
                        onClick={() => toggleExpand(alert.id)}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer transition-colors shrink-0"
                      >
                        Read warning →
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Alert Details Overlay Modal Drawer */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fade-in p-2">
          <div className="bg-white w-full max-w-md rounded-t-2xl shadow-2xl p-6 text-left max-h-[85vh] overflow-y-auto relative animate-slide-up">
            <button 
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
              selectedAlert.riskLevel === "Critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            }`}>
              {selectedAlert.riskLevel} Threat Status
            </span>

            <h2 className="text-lg font-bold font-heading text-gray-950 mt-3 tracking-tight">{selectedAlert.productName}</h2>
            <p className="text-xs text-gray-500 mt-1">Registered NAFDAC: <span className="text-gray-900 font-mono font-bold">{selectedAlert.nafdacNo}</span></p>

            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-600 rounded-r-lg">
              <span className="text-[9px] font-bold text-red-750 uppercase tracking-widest block">Core Toxic Additive Warning</span>
              <p className="text-xs text-red-955 font-bold mt-1">{selectedAlert.badge}</p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incident Description & Symptoms</h4>
                <p className="text-xs text-gray-650 leading-relaxed font-semibold mt-1">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 bg-gray-50 p-3 rounded-lg">
                <div>
                  <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Suspect Batch Numbers</h4>
                  <p className="text-xs font-mono font-bold text-gray-900 mt-1 outline-amber-300">{selectedAlert.targetBatch}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Published On</h4>
                  <p className="text-xs font-bold text-gray-900 mt-1">{selectedAlert.publishedDate}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  Primary Sighting Hotbeds
                </h4>
                <p className="text-xs font-bold text-gray-900 mt-1.5">{selectedAlert.marketSighted}</p>
              </div>
            </div>

            <div className="mt-7 pt-4 border-t border-gray-100 space-y-3">
              <button
                onClick={() => {
                  const alertProd = selectedAlert.productName;
                  const alertLoc = selectedAlert.marketSighted.split("&")[0].trim();
                  setSelectedAlert(null);
                  onGoToReport(alertProd, alertLoc);
                }}
                className="w-full py-3 bg-red-650 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusSquare className="w-4 h-4" />
                Sighted this batch? Report Shop Alert
              </button>
              
              <button
                onClick={() => setSelectedAlert(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                Go Back to Blacklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
