import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Camera, 
  Search, 
  AlertOctagon, 
  Sparkles, 
  FileText, 
  Activity, 
  ChevronRight, 
  ChevronDown,
  MapPin, 
  Bell, 
  ArrowRight,
  Sparkle,
  BookmarkCheck,
  AlertTriangle,
  History,
  Trash2,
  ListFilter,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { ScreenId } from "../types";

interface HomeScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSearchVerify: (query: string) => void;
  alertsCount: number;
}

// Highly accurate, real-world toxicological additives common to Nigerian markets
interface ToxicAdditive {
  code: string;
  name: string;
  category: "Food" | "Cosmetics" | "Pharmaceutics";
  risk: "Critical" | "Warning" | "Moderate";
  status: "Banned" | "Highly Restricted" | "Safety Warning";
  nafdacRule: string;
  symptoms: string;
}

const TOXIC_GLOSSARY: ToxicAdditive[] = [
  {
    code: "E102",
    name: "Tartrazine (Synthetic Yellow 5)",
    category: "Food",
    risk: "Warning",
    status: "Highly Restricted",
    nafdacRule: "Must be clearly labeled on all Nigerian soft drinks & packaged snacks. Banned in infants products.",
    symptoms: "Severe allergic reactions, hyperactivity in children, asthma amplification.",
  },
  {
    code: "HQ-01",
    name: "Hydroquinone",
    category: "Cosmetics",
    risk: "Critical",
    status: "Banned",
    nafdacRule: "NAFDAC strictly forbids Hydroquinone concentrations above 0% in over-the-counter Nigerian lightening creams.",
    symptoms: "Ochronosis (permanent blue-black skin soot), subcutaneous tissue decay, liver toxicity risk.",
  },
  {
    code: "E924",
    name: "Potassium Bromate",
    category: "Food",
    risk: "Critical",
    status: "Banned",
    nafdacRule: "Banned entirely in Nigerian bakeries by NAFDAC and Standards Organisation of Nigeria (SON).",
    symptoms: "Renal failure, peripheral neuropathy, carcinogenicity (strong carcinogen).",
  },
  {
    code: "MP-10",
    name: "Methylparaben",
    category: "Cosmetics",
    risk: "Moderate",
    status: "Safety Warning",
    nafdacRule: "Allowed in concentrations lower than 0.4%. Must not leak into damaged epidermal layers.",
    symptoms: "Endocrine disruption, suspected tumor growth amplification in cosmetic application.",
  },
  {
    code: "E110",
    name: "Sunset Yellow (FCF)",
    category: "Food",
    risk: "Warning",
    status: "Highly Restricted",
    nafdacRule: "Permitted levels limited to under 100mg/kg in snacks. Mandatory warn labels required.",
    symptoms: "Eczema flares, stomach upset, hives reactions in vulnerable consumers.",
  },
  {
    code: "MC-02",
    name: "Ammoniated Mercury",
    category: "Cosmetics",
    risk: "Critical",
    status: "Banned",
    nafdacRule: "Strictly banned. Any cosmetic soap or lotion from Balogun/Onitsha containing mercury is illegal.",
    symptoms: "Neurological tremors, kidney damage, maternal-fetal brain development toxicity.",
  }
];

const DEFAULT_DEMO_LOGS = [
  {
    id: "p7",
    name: "Caro White Active Lightening Beauty Cream",
    brand: "Caro White Cosmetic",
    category: "cosmetic",
    nafdacNo: "B4-4015",
    barcode: "6151122110443",
    status: "counterfeit",
    manufacturer: "Illegal Cosmetic Formulation Lab",
    origin: "Delta State, Nigeria",
    safetyscore: 8,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "p1",
    name: "Emzor Paracetamol 500mg Tablets",
    brand: "Emzor Pharmaceuticals",
    category: "drug",
    nafdacNo: "04-0125",
    barcode: "6151100010254",
    status: "verified",
    manufacturer: "Emzor Pharmaceutical Industries Ltd",
    origin: "Lagos, Nigeria",
    safetyscore: 98,
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "p2",
    name: "My Pikin Paracetamol Syrup",
    brand: "Unknown Craft / Counterfeit Label",
    category: "drug",
    nafdacNo: "04-2198",
    barcode: "6159987410299",
    status: "counterfeit",
    manufacturer: "Unknown counterfeit packing facility",
    origin: "Onitsha Market, Nigeria",
    safetyscore: 0,
    timestamp: new Date(Date.now() - 14400000).toISOString()
  }
];

export default function HomeScreen({ onNavigate, onSearchVerify, alertsCount }: HomeScreenProps) {
  const [searchInput, setSearchInput] = useState("");
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Food" | "Cosmetics" | "Pharmaceutics">("All");
  const [expandedAdditive, setExpandedAdditive] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isNafdacUpdatesOpen, setIsNafdacUpdatesOpen] = useState(false);

  // Load audit history logs from localStorage
  const loadHistoryLogs = () => {
    try {
      const stored = localStorage.getItem("verify_ng_scans");
      if (stored) {
        setScanHistory(JSON.parse(stored));
      } else {
        // Set default logs in browser with Caro White & others if fresh
        localStorage.setItem("verify_ng_scans", JSON.stringify(DEFAULT_DEMO_LOGS));
        setScanHistory(DEFAULT_DEMO_LOGS);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistoryLogs();
    
    // Listen for global custom update triggers when a search finishes
    window.addEventListener("verify_ng_scans_updated", loadHistoryLogs);
    return () => {
      window.removeEventListener("verify_ng_scans_updated", loadHistoryLogs);
    };
  }, []);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem("verify_ng_scans");
      setScanHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchVerify(searchInput);
    }
  };

  const quickVerifyCodes = [
    { name: "Caro White Beauty Cream", code: "6151122110443", type: "Barcode" },
    { name: "Peak Cream Milk", code: "8711300125862", type: "Barcode" },
    { name: "My Pikin Paracetamol Syrup", code: "04-2198", type: "NAFDAC" },
    { name: "Emzor Paracetamol 500mg", code: "6151100010254", type: "Barcode" },
    { name: "Mega-Glow Hydroquinone Lightener", code: "B4-9981A", type: "NAFDAC" }
  ];

  // Filter additives glossary
  const filteredAdditives = TOXIC_GLOSSARY.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(glossaryQuery.toLowerCase()) || 
                          item.code.toLowerCase().includes(glossaryQuery.toLowerCase()) ||
                          item.symptoms.toLowerCase().includes(glossaryQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full pb-20 px-1 md:px-0">
      <div className="space-y-6">
        
        {/* Verification Hero Card */}
        <div className="relative p-6 md:p-8 lg:p-10 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green-900 via-brand-green-800 to-gray-900 text-white shadow-md">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-6 w-72 h-72 bg-brand-green-600 rounded-full opacity-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 transform -translate-x-12 translate-y-6 w-56 h-56 bg-emerald-450 rounded-full opacity-10 blur-2xl"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold tracking-wider text-brand-green-100 uppercase bg-white/10 rounded-full border border-white/10 mb-5">
              <Sparkle className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              Nafdac Active Surveillance Matrix
            </div>
            <h1 className="text-2xl sm:text-3.5xl md:text-4xl font-black font-heading tracking-tight leading-9">
              Verify Before <br className="hidden sm:inline" />
              <span className="text-emerald-400">You Buy or Consume.</span>
            </h1>
            <p className="text-gray-300 text-xs md:text-sm mt-3.5 max-w-xl leading-relaxed font-light">
              Protect your family and retail friends in Nigeria from unlisted cosmetic formulations, fake paracetamol batches, and carcinogenic food agents.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-white/10">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border border-brand-green-800 bg-emerald-700 font-bold flex items-center justify-center text-[9px] text-white">EM</div>
                <div className="w-7 h-7 rounded-full border border-brand-green-800 bg-teal-850 font-bold flex items-center justify-center text-[9px] text-white">N4</div>
                <div className="w-7 h-7 rounded-full border border-brand-green-800 bg-emerald-950 font-bold flex items-center justify-center text-[9px] text-white">PK</div>
              </div>
              <span className="text-[11px] text-emerald-300 font-bold tracking-wide">
                Coupled with standard national Sproxil verification nodes
              </span>
            </div>
          </div>
        </div>

        {/* Global Instant Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative z-20">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2 bg-white rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-brand-green-500 shadow-xs transition-all">
            <div className="flex items-center flex-1 py-1 px-2.5">
              <Search className="w-5.5 h-5.5 text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Type NAFDAC Registration Number or Product Barcode..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full text-sm text-gray-800 focus:outline-none bg-transparent placeholder-gray-400 font-semibold"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate("scanner")}
                className="flex items-center justify-center w-11 h-11 bg-brand-green-50 text-brand-green-600 rounded-xl hover:bg-brand-green-100 transition-colors shrink-0 cursor-pointer"
                title="Scan Barcode"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-3 bg-brand-green-600 hover:bg-brand-green-700 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition-colors shrink-0 cursor-pointer"
              >
                Instant Search
              </button>
            </div>
          </div>
        </form>

        {/* Quick Search Tags for demo */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 font-mono">
            Try Verification Demo Logs
          </span>
          <div className="flex flex-wrap gap-2">
            {quickVerifyCodes.map((tag) => (
              <button
                key={tag.code}
                onClick={() => {
                  setSearchInput(tag.code);
                  onSearchVerify(tag.code);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-gray-700 bg-white border border-gray-200 hover:border-brand-green-500 rounded-xl font-semibold hover:bg-slate-50 hover:shadow-2xs transition-all cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{tag.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">({tag.type}: {tag.code})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toxicological Additives Glossary section */}
        <div className="p-6 bg-white border border-gray-150 rounded-2xl shadow-xs text-left">
          {/* Collapse Header Button */}
          <button 
            type="button"
            onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
            className="w-full flex items-center justify-between text-left focus:outline-none group pb-1"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-green-50 text-brand-green-650 flex items-center justify-center shrink-0">
                <ListFilter className="w-5.5 h-5.5 text-brand-green-650" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 font-heading uppercase tracking-wider">
                  Toxicological Additives Glossary
                </h4>
                <p className="text-[10.5px] text-gray-500">Search and audit banned, restricted, or hazardous chemicals commonly flagged in consumer cosmetics & food imports</p>
              </div>
            </div>
            <div className="p-1.5 px-3 border border-gray-200 rounded-xl bg-slate-50 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-700 transition-all flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider">{isGlossaryOpen ? "Collapse" : "Expand"}</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${isGlossaryOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {isGlossaryOpen && (
            <div className="mt-5 pt-5 border-t border-gray-100 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-4 border-b border-gray-100">
                <div className="text-left">
                  <span className="text-xs font-bold text-gray-500">Filter parameters</span>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search additive by formula/E-number..."
                    value={glossaryQuery}
                    onChange={(e) => setGlossaryQuery(e.target.value)}
                    className="w-full text-xs font-semibold pl-8.5 pr-2.5 py-2 border border-gray-205 focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Filtering badges */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {(["All", "Food", "Cosmetics", "Pharmaceutics"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-brand-green-600 text-white shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-gray-600 border border-gray-150"
                    }`}
                  >
                    {cat} Additives
                  </button>
                ))}
              </div>

              {/* Results list */}
              <div className="mt-4.5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredAdditives.length === 0 ? (
                  <div className="col-span-full py-6.5 text-center text-gray-400">
                    <p className="text-xs font-bold">No toxic additives matched "{glossaryQuery}" in category "{selectedCategory}"</p>
                  </div>
                ) : (
                  filteredAdditives.map((item) => {
                    const isExpanded = expandedAdditive === item.code;
                    return (
                      <div 
                        key={item.code}
                        className="border border-gray-150 rounded-xl p-4 hover:border-brand-green-300 bg-white transition-all text-left flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2.5">
                            <span className="font-mono text-xs font-black text-brand-green-700 bg-brand-green-50 px-2 py-0.5 rounded">
                              {item.code}
                            </span>
                            
                            <div className="flex gap-1.5">
                              <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded ${
                                item.risk === "Critical" 
                                  ? "bg-red-50 text-red-650 border border-red-100"
                                  : item.risk === "Warning"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-blue-50 text-blue-700 border border-blue-105"
                              }`}>
                                {item.risk} Risk
                              </span>

                              <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded bg-gray-100 text-gray-700 border border-gray-150`}>
                                {item.status}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mt-2.5 font-sans leading-tight">{item.name}</h4>
                          <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                            <strong className="text-gray-700 font-bold">Adverse symptoms:</strong> {item.symptoms}
                          </p>

                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1.5 animate-fade-in">
                              <p>
                                <span className="font-bold text-gray-750">NAFDAC Rule:</span> {item.nafdacRule}
                              </p>
                              <p>
                                <span className="font-bold text-gray-750">Product Source Category:</span> {item.category} Formulation
                              </p>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => setExpandedAdditive(isExpanded ? null : item.code)}
                          className="text-xs text-brand-green-650 hover:text-brand-green-800 font-bold mt-3 border-t border-gray-50 pt-2 flex items-center justify-start gap-1 w-full text-left cursor-pointer transition-colors"
                        >
                          <span>{isExpanded ? "Hide Regulatory Policy" : "Read NAFDAC Regulatory Guideline"}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Latest NAFDAC Regulatory Updates Section */}
        <div className="p-6 bg-white border border-gray-150 rounded-2xl shadow-xs text-left">
          {/* Collapse Header Button */}
          <button 
            type="button"
            onClick={() => setIsNafdacUpdatesOpen(!isNafdacUpdatesOpen)}
            className="w-full flex items-center justify-between text-left focus:outline-none group pb-1"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-650 flex items-center justify-center shrink-0">
                <Bell className="w-5.5 h-5.5 text-red-600 animate-swing" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 font-heading uppercase tracking-wider flex items-center gap-2 flex-wrap">
                  <span>Latest NAFDAC Regulatory Updates & Recalls</span>
                  <span className="bg-red-50 text-red-700 font-bold text-[9px] border border-red-200 px-2 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-650"></span>
                    Live Feed
                  </span>
                </h4>
                <p className="text-[10px] text-gray-500">Official directives and safety advisories on contraband, fake medicines, and cosmetics in Nigeria</p>
              </div>
            </div>
            <div className="p-1.5 px-3 border border-gray-200 rounded-xl bg-slate-50 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-700 transition-all flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider">{isNafdacUpdatesOpen ? "Collapse" : "Expand"}</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${isNafdacUpdatesOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {isNafdacUpdatesOpen && (
            <div className="mt-5 pt-5 border-t border-gray-100 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Update Item 1 */}
                <div className="p-4 bg-slate-50 border border-gray-155 rounded-xl hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded tracking-wide uppercase">Critical Recall</span>
                      <span className="text-[10.5px] text-gray-400 font-mono font-bold">May 2026</span>
                    </div>
                    <h5 className="font-extrabold text-xs text-gray-950 mt-2.5 hover:text-red-700 transition-colors">
                      Immediate Recall on Contaminated Cough Syrup Batches
                    </h5>
                    <p className="text-[11px] text-gray-550 mt-1.5 leading-relaxed font-medium">
                      NAFDAC advises all healthcare practices & mothers to scan bottle barcodes and verify MAS scratch PIN cards. High risk of deadly diethylene glycol glycol contaminants has been flagged in unauthorized shipments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-gray-200/50">
                    <span className="text-[9.5px] text-red-650 font-black uppercase tracking-widest font-mono">STATUS: HIGH RESCUE ALERT</span>
                  </div>
                </div>

                {/* Update Item 2 */}
                <div className="p-4 bg-slate-50 border border-gray-155 rounded-xl hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded tracking-wide uppercase">Contraband Seizure</span>
                      <span className="text-[10.5px] text-gray-400 font-mono font-bold">May 2026</span>
                    </div>
                    <h5 className="font-extrabold text-xs text-gray-950 mt-2.5 hover:text-amber-800 transition-colors">
                      Zero Tolerance Crackdown on Unlabeled Bleaching Actives
                    </h5>
                    <p className="text-[11px] text-gray-505 mt-1.5 leading-relaxed font-medium">
                      Market surveillance squads in Lagos (Balogun, Trade Fair) and Onitsha are seizing cosmetic soaps containing Ammoniated Mercury. Cross-check your formulations against VerifyNG's toxic additive list.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-gray-200/50">
                    <span className="text-[9.5px] text-amber-700 font-black uppercase tracking-widest font-mono">STATUS: DEPLOYED ENFORCEMENT</span>
                  </div>
                </div>

                {/* Update Item 3 */}
                <div className="p-4 bg-slate-50 border border-gray-155 rounded-xl hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded tracking-wide uppercase">National Standards</span>
                      <span className="text-[10.5px] text-gray-400 font-mono font-bold">April 2026</span>
                    </div>
                    <h5 className="font-extrabold text-xs text-gray-950 mt-2.5 hover:text-emerald-700 transition-colors">
                      Mandatory MAS Scratch Envelopes on All Infant Formulas
                    </h5>
                    <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed font-medium">
                      SON and NAFDAC have solidified mandatory inclusion of secure authentication stickers on all locally processed and imported formula foods. Always scratch to reveal codes and query instantly in the VerifyNG terminal.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-gray-200/50">
                    <span className="text-[9.5px] text-emerald-700 font-black uppercase tracking-widest font-mono">STATUS: ACTIVE INGRESS SHIELD</span>
                  </div>
                </div>

                {/* Update Item 4 */}
                <div className="p-4 bg-slate-50 border border-gray-155 rounded-xl hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded tracking-wide uppercase">Court Ruling</span>
                      <span className="text-[10.5px] text-gray-400 font-mono font-bold">April 2026</span>
                    </div>
                    <h5 className="font-extrabold text-xs text-gray-950 mt-2.5 hover:text-brand-green-700 transition-colors">
                      Four Bakeries Sealed Over Potassium Bromate Usage
                    </h5>
                    <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed font-medium">
                      Surveillance in Wuse, Abuja has led to the sealing of 4 bakeries using toxic bromates as dough improvers. Consumers have been urged to report crumbly, suspiciously rapid-rising bread batches to VerifyNG.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-gray-200/50">
                    <span className="text-[9.5px] text-teal-700 font-black uppercase tracking-widest font-mono">STATUS: RESOLVED PENALTY</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Urgent Action Banner: Report Counterfeit Box */}
        <div className="relative p-5 overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-650 to-amber-600 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-6 w-56 h-56 bg-white/5 rounded-full blur-xl"></div>
          <div className="relative z-10 flex items-start gap-4 w-full md:w-auto text-left">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/25">
              <AlertTriangle className="w-6 h-6 text-yellow-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-red-800 text-white text-[9px] px-2 py-0.5 font-sans font-black uppercase tracking-wider rounded border border-red-700">Urgent Safe Watch</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                </span>
                <span className="text-[10px] text-yellow-250 font-bold uppercase tracking-widest font-mono">Counterfeit Monitoring Portal</span>
              </div>
              <h4 className="text-base font-extrabold text-white mt-1 leading-snug">
                Spot a Fake Product or Suspicious Formulation?
              </h4>
              <p className="text-xs text-rose-50 mt-1 max-w-xl font-medium leading-relaxed">
                If you encounter a missing scratch PIN, duplicate NAFDAC serials, or suspicious coloring in local markets like Alaba, Ariaria, or Onitsha Main, file a safety report immediately.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate("report")}
            className="relative z-10 w-full md:w-auto px-5.5 py-3 bg-white hover:bg-slate-50 text-red-700 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Report Suspicious Product</span>
            <ArrowRight className="w-3.5 h-3.5 text-red-700" />
          </button>
        </div>



        {/* AI Assistant Banner */}
        <div 
          onClick={() => onNavigate("ai-chat")}
          className="flex items-center justify-between p-4.5 bg-brand-green-50 hover:bg-brand-green-100/40 border border-brand-green-100/80 rounded-2xl cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-brand-green-600 text-white rounded-xl flex items-center justify-center relative shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-brand-green-950 uppercase tracking-widest font-mono">SafeBot AI Safety Guide</h4>
                <span className="bg-brand-green-600 text-white text-[8px] px-1 font-bold rounded-sm uppercase tracking-wide">Stable Active</span>
              </div>
              <p className="text-xs text-brand-green-800 leading-tight mt-0.5 font-medium">
                "Ask me about paracetamol warnings, Sproxil PINs, or NAFDAC registry formats."
              </p>
            </div>
          </div>
          <button className="p-1.5 bg-white text-brand-green-600 rounded-lg border border-brand-green-100 group-hover:bg-brand-green-600 group-hover:text-white transition-colors shrink-0 cursor-pointer">
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </button>
        </div>


        {/* Dynamic Scan History Container */}
        <div className="p-5.5 bg-white border border-gray-150 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-gray-500" />
              <div className="text-left">
                <h4 className="text-sm font-bold text-gray-900 font-heading uppercase tracking-wider">Session Search History Audit Log</h4>
                <p className="text-[10.5px] text-gray-500">Instant tracking of registration searches performed in this browser window</p>
              </div>
            </div>
            
            {scanHistory.length > 0 && (
              <button 
                onClick={handleClearHistory}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-bold font-sans cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {scanHistory.length === 0 ? (
            <div className="py-8.5 text-center text-gray-400">
              <div className="w-11 h-11 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-2.5">
                <History className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium">Your scan history is currently empty.</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Test any demo tag above to audit regulatory logs instantly.</p>
            </div>
          ) : (
            <div className="mt-3.5 space-y-2.5">
              {scanHistory.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSearchVerify(item.nafdacNo || item.id)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-50 border border-gray-150 rounded-xl hover:border-brand-green-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 bg-white border border-gray-150 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle className={`w-4.5 h-4.5 ${
                        item.status === "verified" ? "text-brand-green-600" : "text-amber-500 animate-pulse"
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900 group-hover:text-brand-green-700 transition-colors">{item.name}</p>
                      <p className="text-[10px] text-gray-500 font-sans font-semibold mt-0.5">
                        Brand: {item.brand} • NAFDAC: <span className="font-mono">{item.nafdacNo}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0 self-start sm:self-center">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase font-sans tracking-wider ${
                      item.status === "verified" ? "bg-emerald-50 text-brand-green-700 border border-emerald-100" : "bg-red-55 text-red-650 border border-red-100"
                    }`}>
                      {item.status === "verified" ? "Authentic" : "Suspicious"}
                    </span>
                    <span className="text-[10px] bg-slate-205 py-0.5 px-1.5 rounded-md font-mono text-gray-500 font-semibold">
                      Score: {item.safetyscore}/100
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



        {/* Nigeria Safety Analytics Statistics */}
        <div className="p-6 bg-white border border-gray-150 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5 pb-4.5 border-b border-gray-100">
            <Activity className="w-5.5 h-5.5 text-brand-green-650" />
            <h4 className="text-sm font-bold text-gray-900 font-heading leading-tight uppercase tracking-widest">National Surveillance Activity Feed</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 mt-5 text-center animate-pulse">
            <div className="pt-3 sm:pt-0">
              <div className="text-2xl font-black text-gray-950 tracking-tight font-sans">2,149</div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">Queries Managed Today</p>
            </div>
            <div className="pt-3 sm:pt-0">
              <div className="text-2xl font-black text-brand-green-600 tracking-tight font-sans">98.4%</div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">Classification Accuracy</p>
            </div>
            <div className="pt-3 sm:pt-0">
              <div className="text-2xl font-black text-red-650 tracking-tight font-sans">18</div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-1">Banned Goods Seized</p>
            </div>
          </div>
        </div>

        {/* Informative Step banner */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-900 font-heading uppercase tracking-wider mb-4">Stay Safe In 3 Core Steps</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-start gap-4 p-4.5 bg-white border border-gray-150 rounded-2xl">
              <span className="w-8 h-8 rounded-xl bg-brand-green-50 text-brand-green-700 text-xs font-bold flex items-center justify-center shrink-0 font-mono">1</span>
              <div>
                <h5 className="text-sm font-bold text-gray-950">Check Scratch Panels</h5>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Most genuine drug seals have a scratch space revealing an authentication PIN.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4.5 bg-white border border-gray-150 rounded-2xl">
              <span className="w-8 h-8 rounded-xl bg-brand-green-50 text-brand-green-700 text-xs font-bold flex items-center justify-center shrink-0 font-mono">2</span>
              <div>
                <h5 className="text-sm font-bold text-gray-950">SMS PIN to 38353</h5>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">The shortcode 38353 is completely free. You will receive an instant validation SMS reply.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4.5 bg-white border border-gray-150 rounded-2xl">
              <span className="w-8 h-8 rounded-xl bg-brand-green-50 text-brand-green-700 text-xs font-bold flex items-center justify-center shrink-0 font-mono">3</span>
              <div>
                <h5 className="text-sm font-bold text-gray-950">Cross-Verify (VerifyNG)</h5>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-sans">Paste registration logs or analyze hazardous ingredients via our secure cloud toolkit and glossary.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
