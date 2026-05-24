export interface Product {
  id: string;
  name: string;
  brand: string;
  category: "food" | "drug" | "cosmetic" | "beverage";
  nafdacNo: string;
  barcode: string;
  status: "verified" | "flagged" | "counterfeit" | "unregistered";
  manufacturer: string;
  manufactureDate?: string;
  expiryDate?: string;
  batchNo?: string;
  origin: string;
  ingredients: string[];
  alertReason?: string;
  safetyscore: number; // 0 to 100
  analysis: {
    safeElements: string[];
    riskyElements: string[];
    description: string;
  };
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export interface FakeAlert {
  id: string;
  productName: string;
  badge: string;
  riskLevel: "High" | "Critical" | "Warning";
  nafdacNo: string;
  targetBatch: string;
  description: string;
  marketSighted: string;
  publishedDate: string;
}

export interface UserReport {
  id: string;
  productName: string;
  brandName: string;
  marketLocation: string;
  city: string;
  customDetails: string;
  sellerShopName?: string;
  timestamp: string;
  status: "pending" | "investigating" | "validated";
  phoneContact?: string;
}

export type ScreenId =
  | "home"
  | "scanner"
  | "results"
  | "ingredients"
  | "alerts"
  | "report"
  | "ai-chat";
