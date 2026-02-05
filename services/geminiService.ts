
import { GoogleGenAI, Type } from "@google/genai";
import { MoodResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeMoodFromImage = async (base64Image: string): Promise<MoodResult> => {
  const model = 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Analyze this face's micro-expressions. Return a JSON object with: 'mood' (e.g., 'A bit Tired', 'Pure Joy', 'Calm & Steady'), 'description' (one friendly sentence), 'confidence' (percentage integer 0-100), 'tags' (array of strings), 'energyLevel' (string), and 'recommendations' (an array of 3-4 physical products that match this mood, each with 'name', 'category', 'price' in USD, and 'reason' justifying why it fits). Be very expressive and modern.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mood: { type: Type.STRING },
          description: { type: Type.STRING },
          confidence: { type: Type.INTEGER },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          energyLevel: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                price: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["name", "category", "price", "reason"]
            }
          }
        },
        required: ["mood", "description", "confidence", "tags", "energyLevel", "recommendations"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  const parsed = JSON.parse(text) as MoodResult;
  
  // Assign a placeholder 3D avatar based on energy level/mood
  const avatarMoodMap: Record<string, string> = {
    'Tired': 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&q=80&w=400',
    'Joy': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    'Calm': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    'Steady': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
  };

  const matchedKey = Object.keys(avatarMoodMap).find(k => 
    parsed.mood.toLowerCase().includes(k.toLowerCase()) || 
    parsed.tags.some(t => t.toLowerCase().includes(k.toLowerCase()))
  ) || 'Steady';
  
  parsed.avatarUrl = avatarMoodMap[matchedKey];

  return parsed;
};
