import React, { useState } from "react";
import { 
  Home, 
  Camera, 
  Atom, 
  AlertOctagon, 
  Flag, 
  Sparkles,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";

import { ScreenId, Product } from "./types";
import HomeScreen from "./components/HomeScreen";
import ScannerScreen from "./components/ScannerScreen";
import ResultScreen from "./components/ResultScreen";
import IngredientsScreen from "./components/IngredientsScreen";
import AlertsScreen from "./components/AlertsScreen";
import ReportScreen from "./components/ReportScreen";
import AIChatScreen from "./components/AIChatScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>("home");
  const [verifiedProduct, setVerifiedProduct] = useState<Product | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Cross-screen pre-fill parameters
  const [passedIngredientsText, setPassedIngredientsText] = useState("");
  const [passedReportProductName, setPassedReportProductName] = useState("");
  const [passedReportLocation, setPassedReportLocation] = useState("");

  const handleGlobalSearchVerify = async (query: string) => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      if (response.ok && data.result) {
        setVerifiedProduct(data.result);
        setCurrentScreen("results");

        // Save successfully verified product to localStorage scan history
        try {
          const prev = localStorage.getItem("verify_ng_scans");
          const list = prev ? JSON.parse(prev) : [];
          const matchedItem = {
            id: data.result.id,
            name: data.result.name,
            brand: data.result.brand,
            status: data.result.status,
            nafdacNo: data.result.nafdacNo,
            safetyscore: data.result.safetyscore,
            timestamp: new Date().toISOString()
          };
          const filtered = list.filter((item: any) => item.id !== data.result.id && item.nafdacNo !== data.result.nafdacNo);
          const newList = [matchedItem, ...filtered].slice(0, 10);
          localStorage.setItem("verify_ng_scans", JSON.stringify(newList));
          
          // Trigger custom event so HomeScreen knows to update
          window.dispatchEvent(new Event("verify_ng_scans_updated"));
        } catch (e) {
          console.error("Failed to commit scan audit trace:", e);
        }
      } else {
        setSearchError(data.error || "Failed to decode product serial mapping.");
      }
    } catch (err) {
      setSearchError("Failed to connect to VerifyNG services. Please check connectivity.");
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleGoToReportFromAlert = (name: string, location: string) => {
    setPassedReportProductName(name);
    setPassedReportLocation(location);
    setCurrentScreen("report");
  };

  const handleGoToIngredientsFromResults = (ingredients: string) => {
    setPassedIngredientsText(ingredients);
    setCurrentScreen("ingredients");
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case "home":
        return (
          <HomeScreen 
            onNavigate={(screen) => {
              if (screen === "ingredients") {
                setPassedIngredientsText(""); // clear
              }
              if (screen === "report") {
                setPassedReportProductName("");
                setPassedReportLocation("");
              }
              setCurrentScreen(screen);
            }} 
            onSearchVerify={handleGlobalSearchVerify}
            alertsCount={4}
          />
        );
      case "scanner":
        return (
          <ScannerScreen 
            onBack={() => setCurrentScreen("home")}
            onVerify={handleGlobalSearchVerify}
          />
        );
      case "results":
        return verifiedProduct ? (
          <ResultScreen 
            product={verifiedProduct}
            onBack={() => setCurrentScreen("home")}
            onGoToReport={handleGoToReportFromAlert}
            onGoToIngredients={handleGoToIngredientsFromResults}
          />
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-150 shadow-sm max-w-sm mx-auto mt-12">
            <p className="text-red-500 font-bold text-sm">No product verified yet</p>
            <p className="text-xs text-gray-500 mt-1">Please enter a scratch PIN or verification code on the dashboard.</p>
            <button 
              onClick={() => setCurrentScreen("home")}
              className="mt-5 px-4.5 py-2 bg-brand-green-600 hover:bg-brand-green-700 text-white rounded-xl transition-all font-bold text-xs cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        );
      case "ingredients":
        return (
          <IngredientsScreen 
            initialText={passedIngredientsText}
            onBack={() => setCurrentScreen("home")}
          />
        );
      case "alerts":
        return (
          <AlertsScreen 
            onBack={() => setCurrentScreen("home")}
            onGoToReport={handleGoToReportFromAlert}
          />
        );
      case "report":
        return (
          <ReportScreen 
            initialProductName={passedReportProductName}
            initialLocation={passedReportLocation}
            onBack={() => setCurrentScreen("home")}
          />
        );
      case "ai-chat":
        return (
          <AIChatScreen 
            onBack={() => setCurrentScreen("home")}
          />
        );
      default:
        return <div className="p-5 text-center">Screen not found</div>;
    }
  };

  // Header Navigation tabs definition
  const bottomNavItems = [
    { id: "home", label: "Verify", icon: Home },
    { id: "scanner", label: "Scanner", icon: Camera },
    { id: "ingredients", label: "Analyzer", icon: Atom },
    { id: "alerts", label: "Blacklist", icon: AlertOctagon },
    { id: "report", label: "Report", icon: Flag },
    { id: "ai-chat", label: "SafeBot", icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-gray-850 select-none">
      
      {/* 1. Global Side Navigation Bar - Present as sidebar on desktop and compact top bar on mobile */}
      <header className="sticky top-0 z-40 bg-gray-950 text-white border-b md:border-b-0 md:border-r border-gray-800 shadow-sm md:h-screen md:w-64 shrink-0 flex flex-col justify-between">
        <div className="p-4 md:p-6 flex flex-col md:h-full justify-between gap-4 md:gap-8">
          
          <div>
            {/* Logo Brand Frame */}
            <div className="flex items-center gap-2.5 mb-2 md:mb-8 text-left">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-green-600 text-white shadow-md shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black tracking-tight text-white font-heading">Verify</span>
                  <span className="text-lg font-black text-emerald-400 font-heading">NG</span>
                </div>
                <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">Consumer Safety Portal</p>
              </div>
            </div>

            {/* Unified Navigation Links - Scrollable row on mobile, styled vertical tabs on desktop */}
            <nav className="flex md:flex-col items-center gap-1 overflow-x-auto md:overflow-x-visible w-full shrink-0 justify-start pb-1 md:pb-0 no-scrollbar">
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id || (item.id === "home" && currentScreen === "results");
                const labelText = item.id === "home" ? "Dashboard" : item.id === "ai-chat" ? "SafeBot AI" : item.label;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchError(null);
                      if (item.id === "ingredients") {
                        setPassedIngredientsText("");
                      }
                      if (item.id === "report") {
                        setPassedReportProductName("");
                        setPassedReportLocation("");
                      }
                      setCurrentScreen(item.id as ScreenId);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-3.5 rounded-xl transition-all font-bold text-xs shrink-0 cursor-pointer text-left md:w-full ${
                      isActive 
                        ? "bg-brand-green-600 text-white shadow-md font-extrabold"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{labelText}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Side Panel Desktop Footer */}
          <div className="hidden md:block border-t border-gray-800/60 pt-4 text-left">
            <p className="text-[9px] text-gray-500 font-mono tracking-wider">VERIFYNG DIGITAL SHIELD</p>
            <p className="text-[9.5px] text-gray-400 mt-1 leading-normal">
              Analyzing ingredient toxicities, product registrations, and tracking counter-feiters in Nigeria.
            </p>
          </div>

        </div>
      </header>

      {/* 2. Main Body Viewport */}
      <main className="flex-1 flex flex-col justify-between relative bg-slate-50 min-h-screen md:h-screen md:overflow-y-auto animate-fade-in">

        {/* Dynamic global loader screen overlay when doing network verification */}
        {searchLoading && (
          <div className="absolute inset-0 z-50 bg-brand-green-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-brand-green-100/10 flex items-center justify-center text-teal-400 mb-6 animate-ripple">
              <ShieldCheck className="w-9 h-9 text-brand-green-500 fill-brand-green-500/10 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold font-heading text-white">Collecting Diagnostic Report</h3>
            <p className="text-xs text-brand-green-200 mt-2 max-w-sm leading-relaxed animate-pulse">
              Querying online NAFDAC databases, manufacturer supply records, and compiling the safety analysis scorecard...
            </p>
            <div className="mt-8 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-green-500 rounded-full animate-bounce"></span>
              <span className="w-2.5 h-2.5 bg-brand-green-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-2.5 h-2.5 bg-brand-green-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}

        {/* Search error modal / notification drop down */}
        {searchError && (
          <div className="absolute top-16 left-4 right-4 z-40 p-4 bg-red-650 text-white rounded-xl shadow-lg flex items-start gap-3 animate-slide-up max-w-md md:left-auto md:right-8 md:top-8">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wide">Verification Error</h4>
              <p className="text-xs text-red-100 mt-0.5">{searchError}</p>
            </div>
            <button 
              onClick={() => setSearchError(null)}
              className="text-white hover:text-red-200 font-bold text-xs px-1.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Animated App Area with Framer Motion page entrance transitions */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative p-4 md:p-8 lg:p-10">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, scale: 0.99, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-w-7xl mx-auto w-full"
          >
            {renderActiveScreen()}
          </motion.div>
        </div>

      </main>
    </div>
  );
}
