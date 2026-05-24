import React, { useState } from "react";
import { 
  Atom, 
  Search, 
  Sparkles, 
  ArrowLeft, 
  Flame, 
  AlertOctagon, 
  HelpCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Clipboard,
  Lightbulb,
  Heart
} from "lucide-react";

interface IngredientAnalysisResult {
  toxicLevel: "High" | "Moderate" | "Safe";
  summary: string;
  flaggedIngredients?: Array<{
    name: string;
    risk: string;
    limit?: string;
  }>;
  safeIngredients?: string[];
  healthRecommendations?: string[];
}

interface IngredientsScreenProps {
  initialText?: string;
  onBack: () => void;
}

export default function IngredientsScreen({ initialText = "", onBack }: IngredientsScreenProps) {
  const [ingredientsText, setIngredientsText] = useState(initialText);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<IngredientAnalysisResult | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const runAnalysis = async (textToScan: string) => {
    if (!textToScan.trim()) return;
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const response = await fetch("/api/analyze-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: textToScan })
      });
      const data = await response.json();
      if (response.ok && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setErrorStatus(data.error || "Failed to analyze ingredients. Check network connectivity.");
      }
    } catch (err) {
      setErrorStatus("Could not establish server connection to process ingredients catalog.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis(ingredientsText);
  };

  const loadPreset = (presetName: string, text: string) => {
    setIngredientsText(text);
    runAnalysis(text);
  };

  const presets = [
    {
      title: "🍞 Pot. Bromate Toast Bread",
      desc: "Suspicious bakery leavening",
      text: "Wheat flour, Potassium Bromate, Yeast, Granulated Sugar, Hydrogenated vegetable oil, Sodium chloride"
    },
    {
      title: "🧴 Extreme Glowing Cream",
      desc: "Skincare cosmetic bleaching whitening",
      text: "Purified aqua, Hydroquinone (6.0%), Mercury chloride, Stearic acid, Mineral oil, Isopropyl myristate"
    },
    {
      title: "🍯 Clean Cough Syrup",
      desc: "Standard Emzor formula",
      text: "Diphenhydramine HCl, Ammonium Chloride, Sodium Citrate, Menthol, Purified Water, Citric Acid, Sucrose Syrup"
    }
  ];

  return (
    <div className="w-full pb-24">
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
          <Atom className="w-5 h-5 text-brand-green-600" />
          <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">Ingredient Inspector</span>
        </div>
        <div className="w-5"></div> {/* Spacer for symmetry */}
      </header>

      <div className="px-5 mt-5">
        
        {/* Intro */}
        <div className="p-4.5 bg-brand-green-50 border border-brand-green-100 rounded-2xl">
          <div className="flex items-center gap-2 text-brand-green-800">
            <Sparkles className="w-5 h-5 text-brand-green-600 fill-brand-green-600/20" />
            <h3 className="font-bold text-xs uppercase tracking-wider font-heading">AI Toxicological Sandbox</h3>
          </div>
          <p className="text-xs text-brand-green-950 leading-relaxed mt-1 font-medium">
            Paste ingredient lists printed on any medicine pack, snack wrapper, or skin cosmetic. VerifyNG will analyze the contents for banned chemicals like Potassium Bromate or Mercury.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="mt-4.5 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Ingredients List Text</label>
            <textarea
              rows={4}
              placeholder="Paste or type ingredients separated by commas (e.g. Hydroquinone, Monosodium glutamate, Stearic acid)..."
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              className="mt-1.5 w-full p-4 text-sm text-gray-800 bg-white border border-gray-200.5 focus:border-brand-green-500 focus:outline-none focus:ring-1 focus:ring-brand-green-500 rounded-xl leading-relaxed placeholder-gray-400 font-medium"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                const text = "Water, Glycerin, Titanium dioxide, Stearic acid, Fragrance";
                setIngredientsText(text);
              }}
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Fill Basic Template
            </button>

            <button
              type="submit"
              disabled={isLoading || !ingredientsText.trim()}
              className="px-6 py-3 bg-brand-green-600 hover:bg-brand-green-700 disabled:bg-gray-250 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
            >
              {isLoading ? "Running Diagnostic..." : "Inspect Composition"}
            </button>
          </div>
        </form>

        {/* Presets Grid */}
        <div className="mt-6">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Quick Toxicity Presets</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-2">
            {presets.map((p, idx) => (
              <div 
                key={idx}
                onClick={() => loadPreset(p.title, p.text)}
                className="p-3 bg-white hover:bg-brand-green-50/10 border border-gray-200.5 hover:border-brand-green-500 rounded-xl cursor-pointer transition-all text-left"
              >
                <h4 className="text-xs font-bold text-gray-900">{p.title}</h4>
                <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="mt-8 flex flex-col items-center justify-center py-10 bg-white border border-gray-100 rounded-xl animate-pulse">
            <div className="w-10 h-10 border-4 border-brand-green-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-brand-green-850 font-semibold mt-4">Consulting toxicology manuals...</span>
            <span className="text-[10px] text-gray-400 mt-1">AI-powered chemical element matching</span>
          </div>
        )}

        {/* Network Error display */}
        {errorStatus && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-950 text-xs font-medium">
            ⚠️ {errorStatus}
          </div>
        )}

        {/* Analysis Results Visual Area */}
        {analysis && !isLoading && (
          <div className="mt-8 space-y-6">
            <div className={`p-5 rounded-xl border border-gray-200/80 bg-white shadow-xs relative overflow-hidden`}>
              {/* Ribbon indicator */}
              <div className={`absolute top-0 right-0 py-1.5 px-4 rounded-bl-xl text-[10px] font-bold text-white uppercase tracking-wider ${
                analysis.toxicLevel === "High" ? "bg-red-600" : analysis.toxicLevel === "Moderate" ? "bg-amber-500" : "bg-emerald-600"
              }`}>
                {analysis.toxicLevel} Toxicity
              </div>

              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className={`w-5 h-5 ${
                  analysis.toxicLevel === "High" ? "text-red-600" : analysis.toxicLevel === "Moderate" ? "text-amber-500" : "text-emerald-600"
                }`} />
                <h3 className="text-sm font-bold text-gray-900 font-heading">Safety Evaluation Summary</h3>
              </div>

              <p className="text-xs text-gray-700 font-medium leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Flagged hazardous items list */}
            {analysis.flaggedIngredients && analysis.flaggedIngredients.length > 0 && (
              <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-xs">
                <h4 className="text-xs font-bold text-red-750 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Flame className="w-4.5 h-4.5 text-red-650" />
                  BANNED / RESTRICTED SUBSTANCES SIGHTED ({analysis.flaggedIngredients.length})
                </h4>

                <div className="space-y-4">
                  {analysis.flaggedIngredients.map((item, index) => (
                    <div key={index} className="p-4 bg-red-50/40 border border-red-100/60 rounded-xl">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-gray-950 font-mono">{item.name}</span>
                        {item.limit && (
                          <span className="text-[10px] bg-red-100/60 text-red-950 px-2 py-0.5 rounded-full font-bold">
                            Limit: {item.limit}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-red-900 mt-2 font-medium leading-relaxed">
                        <span className="font-bold text-red-750 font-heading uppercase text-[9px] block">CRITICAL REGULATORY THREAT:</span>
                        {item.risk}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safe elements recognized */}
            {analysis.safeIngredients && analysis.safeIngredients.length > 0 && (
              <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-xs">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Standard Approved Elements ({analysis.safeIngredients.length})
                </h4>
                <div className="flex flex-wrap gap-1.5Packed font-medium">
                  {analysis.safeIngredients.map((item, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-850 rounded-lg text-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.healthRecommendations && analysis.healthRecommendations.length > 0 && (
              <div className="p-5 bg-amber-50/50 border border-amber-100 rounded-xl">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Health Safeguard Tips
                </h4>
                <ul className="space-y-2">
                  {analysis.healthRecommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-amber-950 font-medium flex items-start gap-2">
                      <span className="text-amber-600 bg-amber-100 rounded-full w-4.5 h-4.5 text-[10px] flex items-center justify-center shrink-0 font-bold">{idx + 1}</span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
