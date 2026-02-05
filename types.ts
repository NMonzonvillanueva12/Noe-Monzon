
export interface ProductRecommendation {
  name: string;
  category: string;
  price: string;
  reason: string;
}

export interface MoodResult {
  mood: string;
  description: string;
  confidence: number;
  tags: string[];
  energyLevel: string;
  avatarUrl?: string;
  recommendations: ProductRecommendation[];
}

export enum AppState {
  HOME = 'HOME',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  RECOMMENDATIONS = 'RECOMMENDATIONS'
}
