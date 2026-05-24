import React, { useState } from "react";
import { 
  ArrowLeft, 
  Flag, 
  FileCheck, 
  MapPin, 
  Store, 
  FileText, 
  Phone, 
  Trash2, 
  ShieldAlert, 
  User,
  PlusCircle,
  Clock
} from "lucide-react";
import { UserReport } from "../types";

// Standard mock initial user reports of counterfeits logged locally
const INITIAL_REPORTS: UserReport[] = [
  {
    id: "rep-1",
    productName: "Mega-Glow Hydroquinone Bleach",
    brandName: "Glow & Tone Cosmetics",
    marketLocation: "Balogun Market Stall C14",
    city: "Lagos Island",
    sellerShopName: "Mama Tunde Cosmetics Depot",
    customDetails: "Selling the 6% hydroquinone version which has been blacklisted by NAFDAC regulations. Packaging does not carry authorized scratch cards.",
    timestamp: "2026-05-23T14:30:00Z",
    status: "investigating"
  },
  {
    id: "rep-2",
    productName: "Emzor Paracetamol 500mg (Imitation)",
    brandName: "Unknown Repackager",
    marketLocation: "Drug Stalls opposite Pharmacy Board",
    city: "Onitsha Main Market",
    sellerShopName: "Obinna Wholesalers",
    customDetails: "Packaging has blurry text, and scratching the Mas-Care code returned the verification 'PIN already verified 41 times'. Suspect fake batch.",
    timestamp: "2026-05-21T09:12:00Z",
    status: "validated"
  }
];

interface ReportScreenProps {
  initialProductName?: string;
  initialLocation?: string;
  onBack: () => void;
}

export default function ReportScreen({ initialProductName = "", initialLocation = "", onBack }: ReportScreenProps) {
  const [reports, setReports] = useState<UserReport[]>(INITIAL_REPORTS);
  
  // Form fields
  const [productName, setProductName] = useState(initialProductName);
  const [brandName, setBrandName] = useState("");
  const [marketLocation, setMarketLocation] = useState(initialLocation);
  const [city, setCity] = useState("Lagos");
  const [sellerShopName, setSellerShopName] = useState("");
  const [customDetails, setCustomDetails] = useState("");
  const [phoneContact, setPhoneContact] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !marketLocation.trim()) {
      setNotification("Please fill in Product Name and Market/Shop Location.");
      return;
    }

    const newReport: UserReport = {
      id: "rep-" + Date.now(),
      productName: productName.trim(),
      brandName: brandName.trim() || "Unspecified Brand",
      marketLocation: marketLocation.trim(),
      city: city.trim() || "Nigeria",
      sellerShopName: sellerShopName.trim() || "Unknown Trader",
      customDetails: customDetails.trim() || "Suspicious look & smudge packaging",
      timestamp: new Date().toISOString(),
      status: "pending"
    };

    setReports([newReport, ...reports]);
    setNotification("🎉 Safety Report submitted successfully! Our Nigerian field inspection databases have been logged anonymously.");

    // Clear form except default selections
    setProductName("");
    setBrandName("");
    setMarketLocation("");
    setSellerShopName("");
    setCustomDetails("");

    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  return (
    <div className="w-full pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4.5 border-b border-gray-150 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
        <div className="flex items-center gap-1.5 font-heading">
          <Flag className="w-4.5 h-4.5 text-red-650" />
          <span className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Lodge Safety Report</span>
        </div>
        <div className="w-12"></div>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        
        {/* Banner info */}
        <div className="p-5 bg-red-50/60 border border-red-100 rounded-2xl text-left">
          <h3 className="text-xs font-bold text-red-950 uppercase tracking-widest font-heading flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-red-650" />
            Empower Community Safety Shield
          </h3>
          <p className="text-xs text-red-900/90 mt-2 leading-relaxed font-semibold">
            Spotted a counterfeit drug? A cosmetological bleach formula with unlisted mercury or zero scratch panels? Submit details below. Your contribution is completely anonymous and helps coordinate local safety measures.
          </p>
        </div>

        {notification && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-extrabold leading-relaxed animate-fade-in shadow-xs text-left">
            {notification}
          </div>
        )}

        {/* Report Form */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6.5 shadow-2xs text-left">
          <div className="pb-4.5 border-b border-gray-100 mb-5">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest font-heading flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-red-600" />
              ANONYMOUS REPORT REGISTRY
            </h3>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Cough Syrup, Peak Milk, Caro White..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="mt-1.5 w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-850 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Brand / Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g. Unknown import, counterfeited brand"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="mt-1.5 w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-850 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">City / Nigerian State *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5 w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-850 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                >
                  <option value="Lagos">Lagos State</option>
                  <option value="Anambra">Anambra State (Onitsha)</option>
                  <option value="Kano">Kano State</option>
                  <option value="Abuja">Abuja FCT</option>
                  <option value="Aba">Abia State (Aba)</option>
                  <option value="Kaduna">Kaduna State</option>
                  <option value="Rivers">Rivers State (PH)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Market & Stall Location *</label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Balogun St Row C, Trade Fair"
                    value={marketLocation}
                    onChange={(e) => setMarketLocation(e.target.value)}
                    required
                    className="w-full pl-9 p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-850 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Trader Shop / Seller Name</label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Store className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Mama Tunde Store, Stall G4"
                    value={sellerShopName}
                    onChange={(e) => setSellerShopName(e.target.value)}
                    className="w-full pl-9 p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-850 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Anomaly Description & Packaging Issues *</label>
              <div className="relative mt-1.5">
                <span className="absolute top-3 left-3 text-gray-400">
                  <FileText className="w-4 h-4" />
                </span>
                <textarea
                  rows={3}
                  placeholder="Describe the defect (e.g. blurred font labels, missing scratch PIN, unusual color, bad chemical aroma, already activated Sproxil code)..."
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  className="w-full pl-9 p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-855 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 duration-150"
            >
              <Flag className="w-4 h-4 text-white" />
              <span>Submit Safety Report Successfully</span>
            </button>
          </form>
        </div>

        {/* Local Reports Listing */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest font-heading leading-tight">Secure Sighting Logbook</h4>
              <p className="text-[10px] text-gray-500">Your logged report files are kept completely private and cached locally.</p>
            </div>
            <span className="text-[10px] font-bold text-brand-green-700 bg-brand-green-50 px-2 py-0.5 rounded-full border border-brand-green-150">
              Offline Cache
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {reports.map((r) => (
              <div 
                key={r.id}
                className="bg-white border border-gray-150 p-4.5 rounded-xl text-left shadow-2xs relative"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      r.status === "validated" ? "bg-emerald-50 text-emerald-850 border border-emerald-150" : 
                      r.status === "investigating" ? "bg-amber-50 text-amber-850 border border-amber-150" : 
                      "bg-gray-50 text-gray-500 border border-gray-150"
                    }`}>
                      {r.status.toUpperCase()}
                    </span>
                    <h4 className="text-sm font-bold text-gray-950 font-heading mt-2.5 leading-tight">{r.productName}</h4>
                    <span className="text-[11px] text-gray-500 font-medium">{r.brandName}</span>
                  </div>

                  <button 
                    onClick={() => handleDeleteReport(r.id)}
                    className="p-1 px-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:border-red-200 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                    title="Remove Local Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs text-gray-600 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>Sighted: <span className="font-bold text-gray-900">{r.marketLocation} ({r.city})</span></span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium">
                    <Store className="w-3.5 h-3.5 text-gray-400" />
                    <span>Stall: <span className="font-bold text-gray-900">{r.sellerShopName}</span></span>
                  </div>

                  <p className="text-[11px] leading-relaxed italic bg-gray-50 p-2.5 rounded-md mt-1 border-l-2 border-brand-green-500 text-gray-700">
                    "{r.customDetails}"
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-400 justify-end font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Logged {new Date(r.timestamp).toLocaleString("en-US", { hour12: true, month: "short", day: "numeric" })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
