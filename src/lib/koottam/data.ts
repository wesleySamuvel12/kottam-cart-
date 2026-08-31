// Koottam Cart — Core typed demo data layer.
// All data is seeded/calculated demo data, clearly labelled in the UI.
// In production these would be backed by Prisma models + live weather/market APIs.

export type DataLabel = "Actual" | "Estimated" | "Predicted" | "Demo";

export interface Location {
  id: string;
  name: string;
  ta: string; // Tamil name
  lat: number;
  lng: number;
}

export const LOCATIONS: Location[] = [
  { id: "madurai", name: "Madurai", ta: "மதுரை", lat: 9.9252, lng: 78.1198 },
  { id: "coimbatore", name: "Coimbatore", ta: "கோயம்புத்தூர்", lat: 11.0168, lng: 76.9558 },
  { id: "tiruchirappalli", name: "Tiruchirappalli", ta: "திருச்சிராப்பள்ளி", lat: 10.7905, lng: 78.7047 },
  { id: "chennai", name: "Chennai", ta: "சென்னை", lat: 13.0827, lng: 80.2707 },
  { id: "salem", name: "Salem", ta: "சேலம்", lat: 11.6643, lng: 78.146 },
  { id: "tirunelveli", name: "Tirunelveli", ta: "திருநெல்வேலி", lat: 8.7139, lng: 77.7567 },
  { id: "dindigul", name: "Dindigul", ta: "திண்டுக்கல்", lat: 10.3673, lng: 77.9803 },
  { id: "thanjavur", name: "Thanjavur", ta: "தஞ்சாவூர்", lat: 10.787, lng: 79.1378 },
];

export interface Product {
  id: string;
  name: string;
  ta: string;
  category: "Vegetable" | "Leafy Green" | "Root" | "Fruit" | "Spice";
  unit: string;
  costPrice: number; // farmer realization ₹/kg
  sellPrice: number; // customer price ₹/kg
  marketLow: number;
  marketHigh: number;
  shelfLifeDays: number;
  trend: "Rising" | "Stable" | "Falling";
  trendPct: number;
}

export const PRODUCTS: Product[] = [
  { id: "tomato", name: "Tomato", ta: "தக்காளி", category: "Vegetable", unit: "kg", costPrice: 28, sellPrice: 42, marketLow: 39, marketHigh: 45, shelfLifeDays: 6, trend: "Rising", trendPct: 6 },
  { id: "onion", name: "Onion", ta: "வெங்காயம்", category: "Root", unit: "kg", costPrice: 26, sellPrice: 38, marketLow: 35, marketHigh: 41, shelfLifeDays: 30, trend: "Rising", trendPct: 4 },
  { id: "potato", name: "Potato", ta: "உருளைக்கிழங்கு", category: "Root", unit: "kg", costPrice: 20, sellPrice: 32, marketLow: 30, marketHigh: 34, shelfLifeDays: 45, trend: "Stable", trendPct: 1 },
  { id: "brinjal", name: "Brinjal", ta: "கத்தரிக்காய்", category: "Vegetable", unit: "kg", costPrice: 24, sellPrice: 36, marketLow: 33, marketHigh: 38, shelfLifeDays: 5, trend: "Stable", trendPct: -1 },
  { id: "bhindi", name: "Lady's Finger", ta: "வெண்டைக்காய்", category: "Vegetable", unit: "kg", costPrice: 30, sellPrice: 46, marketLow: 42, marketHigh: 49, shelfLifeDays: 4, trend: "Rising", trendPct: 5 },
  { id: "carrot", name: "Carrot", ta: "கேரட்", category: "Root", unit: "kg", costPrice: 34, sellPrice: 52, marketLow: 48, marketHigh: 55, shelfLifeDays: 14, trend: "Rising", trendPct: 3 },
  { id: "beans", name: "Beans", ta: "பீன்ஸ்", category: "Vegetable", unit: "kg", costPrice: 32, sellPrice: 48, marketLow: 44, marketHigh: 51, shelfLifeDays: 5, trend: "Stable", trendPct: 0 },
  { id: "spinach", name: "Spinach", ta: "கீரை", category: "Leafy Green", unit: "bundle", costPrice: 6, sellPrice: 12, marketLow: 10, marketHigh: 14, shelfLifeDays: 2, trend: "Falling", trendPct: -8 },
  { id: "coriander", name: "Coriander", ta: "கொத்தமல்லி", category: "Leafy Green", unit: "bundle", costPrice: 5, sellPrice: 10, marketLow: 8, marketHigh: 12, shelfLifeDays: 2, trend: "Rising", trendPct: 18 },
  { id: "curryleaf", name: "Curry Leaves", ta: "கறிவேப்பிலை", category: "Leafy Green", unit: "bundle", costPrice: 4, sellPrice: 8, marketLow: 6, marketHigh: 10, shelfLifeDays: 3, trend: "Stable", trendPct: 2 },
  { id: "drumstick", name: "Drumstick", ta: "முருங்கைக்காய்", category: "Vegetable", unit: "kg", costPrice: 40, sellPrice: 60, marketLow: 55, marketHigh: 65, shelfLifeDays: 4, trend: "Rising", trendPct: 7 },
  { id: "banana", name: "Banana", ta: "வாழைப்பழம்", category: "Fruit", unit: "dozen", costPrice: 36, sellPrice: 54, marketLow: 50, marketHigh: 58, shelfLifeDays: 7, trend: "Stable", trendPct: 1 },
  { id: "lemon", name: "Lemon", ta: "எலுமிச்சை", category: "Fruit", unit: "kg", costPrice: 44, sellPrice: 66, marketLow: 60, marketHigh: 70, shelfLifeDays: 14, trend: "Rising", trendPct: 9 },
  { id: "ginger", name: "Ginger", ta: "இஞ்சி", category: "Spice", unit: "kg", costPrice: 60, sellPrice: 90, marketLow: 84, marketHigh: 96, shelfLifeDays: 21, trend: "Rising", trendPct: 11 },
  { id: "garlic", name: "Garlic", ta: "பூண்டு", category: "Spice", unit: "kg", costPrice: 80, sellPrice: 120, marketLow: 112, marketHigh: 128, shelfLifeDays: 60, trend: "Stable", trendPct: 2 },
];

export interface Farmer {
  id: string;
  name: string;
  ta: string;
  locationId: string;
  rating: number;
  reliability: number;
  distanceKm: number;
  products: string[];
  capacityKg: number;
  lastOrderDays: number;
}

export const FARMERS: Farmer[] = [
  { id: "f1", name: "Ramesh K", ta: "ரமேஷ்", locationId: "madurai", rating: 4.8, reliability: 96, distanceKm: 8, products: ["tomato", "brinjal", "bhindi"], capacityKg: 160, lastOrderDays: 2 },
  { id: "f2", name: "Lakshmi P", ta: "லட்சுமி", locationId: "madurai", rating: 4.6, reliability: 92, distanceKm: 12, products: ["tomato", "spinach", "coriander"], capacityKg: 120, lastOrderDays: 3 },
  { id: "f3", name: "Sankar M", ta: "சங்கர்", locationId: "madurai", rating: 4.9, reliability: 98, distanceKm: 6, products: ["onion", "potato", "drumstick"], capacityKg: 200, lastOrderDays: 1 },
  { id: "f4", name: "Devi S", ta: "தேவி", locationId: "dindigul", rating: 4.4, reliability: 88, distanceKm: 22, products: ["tomato", "beans", "carrot"], capacityKg: 90, lastOrderDays: 4 },
  { id: "f5", name: "Murugan V", ta: "முருகன்", locationId: "dindigul", rating: 4.7, reliability: 94, distanceKm: 18, products: ["brinjal", "bhindi", "drumstick"], capacityKg: 110, lastOrderDays: 2 },
  { id: "f6", name: "Kavitha R", ta: "கவிதா", locationId: "madurai", rating: 4.5, reliability: 90, distanceKm: 15, products: ["lemon", "banana", "curryleaf"], capacityKg: 80, lastOrderDays: 5 },
  { id: "f7", name: "Pandian T", ta: "பாண்டியன்", locationId: "madurai", rating: 4.2, reliability: 85, distanceKm: 28, products: ["ginger", "garlic", "onion"], capacityKg: 130, lastOrderDays: 6 },
  { id: "f8", name: "Geetha N", ta: "கீதா", locationId: "dindigul", rating: 4.8, reliability: 97, distanceKm: 9, products: ["spinach", "coriander", "curryleaf"], capacityKg: 70, lastOrderDays: 1 },
];

export interface Hub {
  id: string;
  name: string;
  locationId: string;
  workers: number;
  operatingCostPerDay: number;
  capacityOrdersPerDay: number;
  pickupEfficiency: number;
  wastePct: number;
}

export const HUBS: Hub[] = [
  { id: "h1", name: "Madurai Central Hub", locationId: "madurai", workers: 6, operatingCostPerDay: 8200, capacityOrdersPerDay: 540, pickupEfficiency: 88, wastePct: 3.1 },
  { id: "h2", name: "Dindigul North Hub", locationId: "dindigul", workers: 4, operatingCostPerDay: 5400, capacityOrdersPerDay: 320, pickupEfficiency: 81, wastePct: 4.6 },
];

export interface Customer {
  id: string;
  name: string;
  group: string;
  locationId: string;
  avgBasketValue: number;
  orderFreqDays: number;
  lastOrderDays: number;
  totalOrders: number;
  churnProb: number;
  status: "Active" | "At Risk" | "Dormant";
}

export const GROUPS = ["Group A — Anna Nagar", "Group B — Thallakulam", "Group C — K.K. Nagar", "Group D — Vandiyur"];

export const CUSTOMERS: Customer[] = [
  { id: "c1042", name: "Priya S", group: GROUPS[0], locationId: "madurai", avgBasketValue: 320, orderFreqDays: 4, lastOrderDays: 18, totalOrders: 41, churnProb: 72, status: "At Risk" },
  { id: "c1043", name: "Karthik R", group: GROUPS[1], locationId: "madurai", avgBasketValue: 280, orderFreqDays: 5, lastOrderDays: 2, totalOrders: 67, churnProb: 9, status: "Active" },
  { id: "c1044", name: "Meena K", group: GROUPS[0], locationId: "madurai", avgBasketValue: 410, orderFreqDays: 3, lastOrderDays: 1, totalOrders: 88, churnProb: 6, status: "Active" },
  { id: "c1045", name: "Arjun V", group: GROUPS[2], locationId: "madurai", avgBasketValue: 240, orderFreqDays: 6, lastOrderDays: 12, totalOrders: 29, churnProb: 54, status: "At Risk" },
  { id: "c1046", name: "Sundari M", group: GROUPS[3], locationId: "madurai", avgBasketValue: 360, orderFreqDays: 4, lastOrderDays: 3, totalOrders: 52, churnProb: 14, status: "Active" },
  { id: "c1047", name: "Velu T", group: GROUPS[1], locationId: "madurai", avgBasketValue: 190, orderFreqDays: 7, lastOrderDays: 21, totalOrders: 18, churnProb: 83, status: "Dormant" },
  { id: "c1048", name: "Deepa R", group: GROUPS[2], locationId: "madurai", avgBasketValue: 300, orderFreqDays: 5, lastOrderDays: 4, totalOrders: 44, churnProb: 18, status: "Active" },
  { id: "c1049", name: "Suresh K", group: GROUPS[0], locationId: "madurai", avgBasketValue: 450, orderFreqDays: 3, lastOrderDays: 2, totalOrders: 91, churnProb: 7, status: "Active" },
  { id: "c1050", name: "Anitha P", group: GROUPS[3], locationId: "madurai", avgBasketValue: 270, orderFreqDays: 6, lastOrderDays: 15, totalOrders: 22, churnProb: 61, status: "At Risk" },
  { id: "c1051", name: "Mani S", group: GROUPS[1], locationId: "madurai", avgBasketValue: 330, orderFreqDays: 4, lastOrderDays: 5, totalOrders: 47, churnProb: 21, status: "Active" },
];

export interface HourlyWeather { hour: string; temp: number; rainProb: number; condition: string; }
export interface DailyWeather { day: string; date: string; tempHi: number; tempLo: number; rainProb: number; rainfall: number; condition: string; icon: string; }
export interface WeatherAlert { id: string; severity: "Critical" | "High" | "Medium" | "Low"; title: string; detail: string; area: string; window: string; }

export interface WeatherData {
  locationId: string;
  temp: number;
  feelsLike: number;
  rainProb: number;
  rainfall: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  condition: string;
  label: DataLabel;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  alerts: WeatherAlert[];
}

export const WEATHER: Record<string, WeatherData> = {
  madurai: {
    locationId: "madurai",
    temp: 31, feelsLike: 35, rainProb: 68, rainfall: 8.2, humidity: 74, windSpeed: 16, uvIndex: 7,
    condition: "Heavy rain expected tomorrow",
    label: "Demo",
    hourly: [
      { hour: "12 PM", temp: 31, rainProb: 40, condition: "Cloudy" },
      { hour: "1 PM", temp: 32, rainProb: 48, condition: "Cloudy" },
      { hour: "2 PM", temp: 32, rainProb: 55, condition: "Showers" },
      { hour: "3 PM", temp: 30, rainProb: 70, condition: "Rain" },
      { hour: "4 PM", temp: 29, rainProb: 82, condition: "Heavy Rain" },
      { hour: "5 PM", temp: 28, rainProb: 76, condition: "Rain" },
      { hour: "6 PM", temp: 27, rainProb: 60, condition: "Showers" },
      { hour: "7 PM", temp: 26, rainProb: 45, condition: "Cloudy" },
    ],
    daily: [
      { day: "Today", date: "Mon", tempHi: 33, tempLo: 25, rainProb: 40, rainfall: 2, condition: "Cloudy", icon: "☁️" },
      { day: "Tomorrow", date: "Tue", tempHi: 29, tempLo: 24, rainProb: 82, rainfall: 18, condition: "Heavy Rain", icon: "🌧️" },
      { day: "Wed", date: "Wed", tempHi: 28, tempLo: 23, rainProb: 65, rainfall: 9, condition: "Showers", icon: "🌦️" },
      { day: "Thu", date: "Thu", tempHi: 31, tempLo: 24, rainProb: 30, rainfall: 1, condition: "Cloudy", icon: "☁️" },
      { day: "Fri", date: "Fri", tempHi: 34, tempLo: 26, rainProb: 12, rainfall: 0, condition: "Sunny", icon: "☀️" },
      { day: "Sat", date: "Sat", tempHi: 35, tempLo: 27, rainProb: 8, rainfall: 0, condition: "Sunny", icon: "☀️" },
      { day: "Sun", date: "Sun", tempHi: 33, tempLo: 26, rainProb: 35, rainfall: 3, condition: "Cloudy", icon: "⛅" },
    ],
    alerts: [
      { id: "wa1", severity: "High", title: "Heavy Rain Alert", detail: "High rainfall probability (82%) detected near Madurai tomorrow between 2 PM–6 PM. Risk of waterlogging on collection routes.", area: "Madurai", window: "Tomorrow 2 PM – 6 PM" },
      { id: "wa2", severity: "Medium", title: "Leafy-Greens Spoilage Risk", detail: "Sustained humidity >70% for 48h increases spinach & coriander spoilage risk. Prioritize early collection.", area: "Madurai", window: "Next 48 hours" },
    ],
  },
  dindigul: {
    locationId: "dindigul",
    temp: 29, feelsLike: 32, rainProb: 35, rainfall: 2.1, humidity: 62, windSpeed: 12, uvIndex: 8,
    condition: "Partly cloudy",
    label: "Demo",
    hourly: [
      { hour: "12 PM", temp: 29, rainProb: 20, condition: "Sunny" },
      { hour: "1 PM", temp: 30, rainProb: 25, condition: "Cloudy" },
      { hour: "2 PM", temp: 31, rainProb: 30, condition: "Cloudy" },
      { hour: "3 PM", temp: 30, rainProb: 40, condition: "Showers" },
      { hour: "4 PM", temp: 29, rainProb: 45, condition: "Showers" },
      { hour: "5 PM", temp: 28, rainProb: 35, condition: "Cloudy" },
      { hour: "6 PM", temp: 27, rainProb: 20, condition: "Cloudy" },
      { hour: "7 PM", temp: 26, rainProb: 12, condition: "Clear" },
    ],
    daily: [
      { day: "Today", date: "Mon", tempHi: 31, tempLo: 23, rainProb: 35, rainfall: 2, condition: "Cloudy", icon: "☁️" },
      { day: "Tomorrow", date: "Tue", tempHi: 30, tempLo: 23, rainProb: 42, rainfall: 4, condition: "Showers", icon: "🌦️" },
      { day: "Wed", date: "Wed", tempHi: 32, tempLo: 24, rainProb: 22, rainfall: 1, condition: "Cloudy", icon: "☁️" },
      { day: "Thu", date: "Thu", tempHi: 34, tempLo: 25, rainProb: 10, rainfall: 0, condition: "Sunny", icon: "☀️" },
      { day: "Fri", date: "Fri", tempHi: 36, tempLo: 26, rainProb: 6, rainfall: 0, condition: "Sunny", icon: "☀️" },
      { day: "Sat", date: "Sat", tempHi: 35, tempLo: 26, rainProb: 15, rainfall: 1, condition: "Sunny", icon: "☀️" },
      { day: "Sun", date: "Sun", tempHi: 32, tempLo: 24, rainProb: 40, rainfall: 5, condition: "Showers", icon: "🌦️" },
    ],
    alerts: [
      { id: "wa3", severity: "Medium", title: "Heat build-up expected", detail: "Temperature trending up to 36°C by Friday. Increase cold-storage for leafy greens and reduce holding time.", area: "Dindigul", window: "Thu–Sat" },
    ],
  },
};

export interface DemandForecastItem {
  productId: string;
  confirmedKg: number;
  predictedKg: number;
  changePct: number;
  confidence: number;
  reason: string;
  action: string;
}

export const DEMAND_FORECAST: DemandForecastItem[] = [
  { productId: "tomato", confirmedKg: 120, predictedKg: 132, changePct: 14, confidence: 91, reason: "Rain tomorrow historically lifts tomato orders ~12–16%. Monday weekday pattern also higher.", action: "Increase farmer allocation by 12 kg." },
  { productId: "onion", confirmedKg: 78, predictedKg: 86, changePct: 7, confidence: 88, reason: "Staple demand rises on rainy days; festival season approaching adds uplift.", action: "Add 8 kg buffer from Sankar M." },
  { productId: "spinach", confirmedKg: 64, predictedKg: 58, changePct: -11, confidence: 84, reason: "Leafy-green demand declines on rainy days; spoilage risk reduces order frequency.", action: "Reduce Lakshmi P allocation by 6 bundles." },
  { productId: "coriander", confirmedKg: 62, predictedKg: 72, changePct: 18, confidence: 86, reason: "Coriander demand rising (trend +18%); festive cooking patterns boosting small-leaf garnish demand.", action: "Add 10 bundles; protect freshness." },
  { productId: "brinjal", confirmedKg: 44, predictedKg: 48, changePct: 9, confidence: 82, reason: "Stable weekday demand with mild rain uplift.", action: "Maintain allocation; +4 kg buffer." },
  { productId: "bhindi", confirmedKg: 30, predictedKg: 33, changePct: 10, confidence: 80, reason: "Consistent household demand; light rain effect neutral.", action: "Maintain allocation." },
];

export interface HarvestRec {
  farmerId: string;
  items: { productId: string; confirmedKg: number; predictedKg: number; recommendedKg: number; expectedRevenue: number; confidence: number }[];
  totalRevenue: number;
  riskLevel: "Low" | "Medium" | "High";
}

export const HARVEST_RECS: HarvestRec[] = [
  {
    farmerId: "f1",
    items: [
      { productId: "tomato", confirmedKg: 70, predictedKg: 78, recommendedKg: 76, expectedRevenue: 2128, confidence: 92 },
      { productId: "brinjal", confirmedKg: 28, predictedKg: 30, recommendedKg: 29, expectedRevenue: 696, confidence: 85 },
      { productId: "bhindi", confirmedKg: 20, predictedKg: 22, recommendedKg: 21, expectedRevenue: 630, confidence: 80 },
    ],
    totalRevenue: 3454,
    riskLevel: "Low",
  },
  {
    farmerId: "f2",
    items: [
      { productId: "tomato", confirmedKg: 40, predictedKg: 44, recommendedKg: 42, expectedRevenue: 1176, confidence: 90 },
      { productId: "spinach", confirmedKg: 22, predictedKg: 18, recommendedKg: 18, expectedRevenue: 108, confidence: 78 },
      { productId: "coriander", confirmedKg: 28, predictedKg: 34, recommendedKg: 33, expectedRevenue: 165, confidence: 84 },
    ],
    totalRevenue: 1449,
    riskLevel: "Medium",
  },
];

export interface WasteRisk {
  productId: string;
  supplyKg: number;
  demandKg: number;
  oversupplyPct: number;
  recommendedReductionKg: number;
  reason: string;
}

export const WASTE_RISKS: WasteRisk[] = [
  { productId: "brinjal", supplyKg: 62, demandKg: 48, oversupplyPct: 29, recommendedReductionKg: 14, reason: "Supply running 29% above predicted demand. Spoilage risk within 5-day shelf life." },
  { productId: "spinach", supplyKg: 30, demandKg: 26, oversupplyPct: 15, recommendedReductionKg: 4, reason: "Short shelf life (2 days); humidity rising. Trim allocation." },
];

export const WASTE_PREVENTED = {
  monthValueInr: 38420,
  monthKg: 214,
  yearValueInr: 412600,
  yearKg: 2380,
};

export interface SourcingPlan {
  productId: string;
  demandKg: number;
  allocations: { farmerId: string; kg: number; score: number }[];
}

export const SOURCING_PLANS: SourcingPlan[] = [
  {
    productId: "tomato",
    demandKg: 480,
    allocations: [
      { farmerId: "f1", kg: 120, score: 96 },
      { farmerId: "f3", kg: 140, score: 94 },
      { farmerId: "f2", kg: 85, score: 90 },
      { farmerId: "f4", kg: 75, score: 84 },
      { farmerId: "f5", kg: 60, score: 80 },
    ],
  },
  {
    productId: "onion",
    demandKg: 220,
    allocations: [
      { farmerId: "f3", kg: 140, score: 95 },
      { farmerId: "f7", kg: 80, score: 82 },
    ],
  },
];

export interface AIAlert {
  id: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  icon: string;
  category: string;
  title: string;
  detail: string;
  evidence: string[];
  action: string;
  time: string;
}

export const AI_ALERTS: AIAlert[] = [
  { id: "a1", priority: "High", icon: "🌧️", category: "Weather", title: "Heavy Rain — Madurai tomorrow", detail: "82% rain probability 2–6 PM. Leafy-green spoilage risk + route waterlogging.", evidence: ["Weather AI forecast", "Historical rainy-day patterns", "Route elevation data"], action: "Shift pickup window to 6–7 PM; protect sensitive produce", time: "2h ago" },
  { id: "a2", priority: "High", icon: "📈", category: "Demand", title: "Tomato demand spike +18%", detail: "Forecast 132 kg vs 120 confirmed. Coriander also trending +18%.", evidence: ["Rain forecast", "Monday pattern", "Recent group orders"], action: "Increase farmer allocation by 12 kg", time: "3h ago" },
  { id: "a3", priority: "Medium", icon: "⚠️", category: "Supply", title: "Brinjal oversupply 24%", detail: "Supply 62 kg vs demand 48 kg. Spoilage risk within 5 days.", evidence: ["Confirmed allocations", "Predicted demand"], action: "Reduce tomorrow's allocation by 14 kg", time: "4h ago" },
  { id: "a4", priority: "Medium", icon: "👥", category: "Churn", title: "3 customers at high churn risk", detail: "Customer #1042 churn probability 72%. 18 days since last order.", evidence: ["Order frequency decline", "Basket value decline", "Inactivity"], action: "Send personalized reactivation offer", time: "5h ago" },
  { id: "a5", priority: "Low", icon: "🚚", category: "Logistics", title: "Route optimization opportunity", detail: "14.8 km savings available on today's Madurai pickup routes.", evidence: ["Route AI", "Order clustering"], action: "Review optimized route plan", time: "6h ago" },
  { id: "a6", priority: "Low", icon: "💰", category: "Profit", title: "Hub margin opportunity", detail: "Reducing sort time by 4 min/order → ~₹18,000/month contribution.", evidence: ["Hub staffing model", "Sort-time analytics"], action: "Pilot 1 extra sorter at 5 PM peak", time: "8h ago" },
];

export const CHURN_LIST = CUSTOMERS.filter((c) => c.churnProb >= 40).map((c) => ({
  ...c,
  signals: [
    `${c.lastOrderDays} days since last order`,
    c.orderFreqDays > 5 ? "order frequency decreasing" : "stable frequency",
    c.avgBasketValue < 280 ? "recent basket value declining" : "basket value steady",
  ],
  recommendedAction:
    c.churnProb >= 70
      ? "Send personalized reactivation offer + ₹50 credit"
      : "Send gentle reminder with weekly essentials",
}));

export interface Anomaly {
  id: string;
  area: string;
  type: string;
  riskScore: number;
  reason: string;
  action: string;
}

export const ANOMALIES: Anomaly[] = [
  { id: "an1", area: "Group D — Vandiyur", type: "Order spike", riskScore: 71, reason: "Order volume +260% in 1 hour vs group baseline. Pattern matches coordinated test behavior, not fraud confirmed.", action: "Manual review by group leader before fulfillment." },
  { id: "an2", area: "Madurai Central Hub", type: "Duplicate order", riskScore: 58, reason: "2 identical baskets from same household within 90 seconds.", action: "Flag for confirmation before pickup." },
  { id: "an3", area: "Settlement", type: "Refund cluster", riskScore: 64, reason: "4 refund requests from Group B within 24h, all citing 'spoiled greens'.", action: "Review quality + refund legitimacy." },
];

export const PAYMENT_INTEL = {
  successRate: 94.2,
  pendingCount: 18,
  pendingValueInr: 84200,
  failedToday: 7,
  settlementDelayHrs: 6,
  commissionThisMonthInr: 184600,
  hubRevenueThisMonthInr: 412400,
  failedPatterns: [
    { reason: "UPI timeout", count: 4 },
    { reason: "Insufficient balance", count: 2 },
    { reason: "Card declined", count: 1 },
  ],
};

export interface RouteStop { label: string; type: "hub" | "farmer" | "customer"; order: number; }

export interface RoutePlan {
  id: string;
  hubId: string;
  vehicle: string;
  stops: RouteStop[];
  distanceKm: number;
  optimizedDistanceKm: number;
  timeMin: number;
  optimizedTimeMin: number;
  fuelEstimateL: number;
  lateRisk: "Low" | "Medium" | "High";
  savingsKm: number;
}

export const ROUTE_PLANS: RoutePlan[] = [
  {
    id: "r1", hubId: "h1", vehicle: "Tempo Traveller #1",
    stops: [
      { label: "Madurai Central Hub", type: "hub", order: 0 },
      { label: "Ramesh K (8km)", type: "farmer", order: 1 },
      { label: "Lakshmi P (12km)", type: "farmer", order: 2 },
      { label: "Sankar M (6km)", type: "farmer", order: 3 },
      { label: "Group A — Anna Nagar", type: "customer", order: 4 },
      { label: "Group B — Thallakulam", type: "customer", order: 5 },
      { label: "Madurai Central Hub", type: "hub", order: 6 },
    ],
    distanceKm: 64.2, optimizedDistanceKm: 49.4, timeMin: 188, optimizedTimeMin: 152, fuelEstimateL: 5.8, lateRisk: "Low", savingsKm: 14.8,
  },
  {
    id: "r2", hubId: "h1", vehicle: "Mini Truck #2",
    stops: [
      { label: "Madurai Central Hub", type: "hub", order: 0 },
      { label: "Kavitha R (15km)", type: "farmer", order: 1 },
      { label: "Pandian T (28km)", type: "farmer", order: 2 },
      { label: "Group C — K.K. Nagar", type: "customer", order: 3 },
      { label: "Group D — Vandiyur", type: "customer", order: 4 },
      { label: "Madurai Central Hub", type: "hub", order: 5 },
    ],
    distanceKm: 88.4, optimizedDistanceKm: 73.1, timeMin: 232, optimizedTimeMin: 201, fuelEstimateL: 8.4, lateRisk: "Medium", savingsKm: 15.3,
  },
];

export interface HubPnL {
  hubId: string;
  revenueForecastInr: number;
  operatingCostForecastInr: number;
  profitForecastInr: number;
  costPerOrder: number;
  gmvPerOrder: number;
  pickupEfficiency: number;
  wastePct: number;
}

export const HUB_PNL: HubPnL[] = [
  { hubId: "h1", revenueForecastInr: 184200, operatingCostForecastInr: 98400, profitForecastInr: 85800, costPerOrder: 38, gmvPerOrder: 312, pickupEfficiency: 88, wastePct: 3.1 },
  { hubId: "h2", revenueForecastInr: 96800, operatingCostForecastInr: 64800, profitForecastInr: 32000, costPerOrder: 47, gmvPerOrder: 278, pickupEfficiency: 81, wastePct: 4.6 },
];

export const PILOT = {
  farmers: 15,
  shgLeaders: 20,
  households: 300,
  durationMonths: 2,
  targets: { customerSavingsPct: 20, farmerIncomeImprovePct: 25, repeatOrderRatePct: 70 },
  actuals: { customerSavingsPct: 21.4, farmerIncomeImprovePct: 23.1, repeatOrderRatePct: 68 },
  health: "At Risk" as "Healthy" | "At Risk" | "Critical",
  note: "Repeat-order rate at 68% vs 70% target. Customer savings and farmer income both ahead of target. Reactivation campaign for dormant households recommended.",
};

export const IMPACT = {
  customerSavingsInr: 1240000,
  farmerIncomeInr: 870000,
  wasteAvoidedKg: 4200,
  householdsServed: 1240,
  kmReduced: 18600,
  shgIncomeInr: 312000,
  period: "Pilot to date",
};

export const MODEL_PERF = {
  forecastAccuracy: 91.4,
  mae: 6.2,
  rmse: 8.1,
  bias: -0.4,
  anomalyPrecision: 88,
  recommendationAcceptanceRate: 73,
  history: [
    { week: "W1", accuracy: 84.2 },
    { week: "W2", accuracy: 86.8 },
    { week: "W3", accuracy: 88.9 },
    { week: "W4", accuracy: 89.7 },
    { week: "W5", accuracy: 90.5 },
    { week: "W6", accuracy: 91.4 },
  ],
};

export interface ExpansionCandidate {
  id: string;
  locationId: string;
  households: number;
  estGmvInr: number;
  complexity: "Low" | "Medium" | "High";
  confidence: number;
}

export const EXPANSION: ExpansionCandidate[] = [
  { id: "e1", locationId: "madurai", households: 2400, estGmvInr: 1840000, complexity: "Medium", confidence: 86 },
  { id: "e2", locationId: "dindigul", households: 1200, estGmvInr: 920000, complexity: "Low", confidence: 82 },
  { id: "e3", locationId: "coimbatore", households: 5200, estGmvInr: 4100000, complexity: "High", confidence: 64 },
  { id: "e4", locationId: "tiruchirappalli", households: 3100, estGmvInr: 2380000, complexity: "Medium", confidence: 71 },
  { id: "e5", locationId: "salem", households: 1800, estGmvInr: 1380000, complexity: "Medium", confidence: 69 },
];

export const PICKUP_WINDOWS = [
  { group: "Group A — Anna Nagar", window: "6:00 PM – 7:00 PM", confidence: 89, reason: "Peak member availability + dry weather window" },
  { group: "Group B — Thallakulam", window: "5:30 PM – 6:30 PM", confidence: 84, reason: "Leader available; order volume moderate" },
  { group: "Group C — K.K. Nagar", window: "6:30 PM – 7:30 PM", confidence: 82, reason: "Late-working members" },
  { group: "Group D — Vandiyur", window: "7:00 PM – 8:00 PM", confidence: 78, reason: "Route tail; consider 2-day cadence" },
];

export const GROUP_INTEL = [
  { group: GROUPS[0], predictedOrders: 48, inactiveMembers: 4, repeatLikelihood: 78, topProduct: "Tomato", growthPct: 12 },
  { group: GROUPS[1], predictedOrders: 33, inactiveMembers: 6, repeatLikelihood: 64, topProduct: "Onion", growthPct: -3 },
  { group: GROUPS[2], predictedOrders: 41, inactiveMembers: 2, repeatLikelihood: 82, topProduct: "Brinjal", growthPct: 18 },
  { group: GROUPS[3], predictedOrders: 27, inactiveMembers: 8, repeatLikelihood: 56, topProduct: "Banana", growthPct: -8 },
];

export const CONTROL_TOWER = {
  demandKg: 18420,
  supplyKg: 17940,
  forecastAccuracy: 91.4,
  wasteRisk: "Low",
  weatherRisk: "Medium",
  logisticsRisk: "Low",
  revenueForecastInr: 482000,
  revenueForecastLakh: 4.82,
  summary:
    "Demand is expected to increase ~9% tomorrow. Rain probability may reduce leafy-green orders by ~11%. Two farmer routes near Madurai require schedule shifts to the 6–7 PM window to avoid waterlogging.",
};

export const GMV_TREND = [
  { day: "Mon", gmv: 61200, orders: 412 },
  { day: "Tue", gmv: 58400, orders: 388 },
  { day: "Wed", gmv: 64800, orders: 431 },
  { day: "Thu", gmv: 67100, orders: 446 },
  { day: "Fri", gmv: 72200, orders: 489 },
  { day: "Sat", gmv: 78600, orders: 528 },
  { day: "Sun", gmv: 69300, orders: 463 },
];

export const HUB_STAFFING = [
  { hubId: "h1", ordersForecast: 520, recommendedWorkers: 7, sortingWorkload: "High", peak: "5:00 PM – 6:30 PM" },
  { hubId: "h2", ordersForecast: 310, recommendedWorkers: 5, sortingWorkload: "Medium", peak: "5:30 PM – 6:30 PM" },
];

export const PERSONAL_SHOPPING = {
  customerId: "c1049",
  predictedBasket: [
    { productId: "tomato", qty: 2, reason: "You buy tomatoes every ~4 days. Next predicted requirement ~2 kg." },
    { productId: "onion", qty: 2, reason: "Weekly staple; usually re-ordered every 5 days." },
    { productId: "coriander", qty: 2, reason: "Frequent garnish; trend rising this season." },
    { productId: "curryleaf", qty: 1, reason: "Paired with tomato/onion in 82% of your baskets." },
  ],
};

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
export function getFarmer(id: string): Farmer | undefined {
  return FARMERS.find((f) => f.id === id);
}
export function getLocation(id: string): Location | undefined {
  return LOCATIONS.find((l) => l.id === id);
}
export function getHub(id: string): Hub | undefined {
  return HUBS.find((h) => h.id === id);
}
export function getWeather(locationId: string): WeatherData | undefined {
  return WEATHER[locationId] ?? WEATHER.madurai;
}
export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
