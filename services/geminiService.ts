import { GoogleGenAI, Type } from "@google/genai";
import { AIGeneratedMetadata } from "../types";

// NOTE: Ideally, this should be handled by a backend proxy to keep keys safe.
// For this frontend-only demo, we assume the environment variable is available.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const generateMovieMetadata = async (movieTitle: string): Promise<AIGeneratedMetadata> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock data.");
    return {
      description: "API Key missing. Please configure your environment.",
      year: "2024",
      genre: ["Unknown"],
      rating: 0,
      suggestedTagline: "Unknown Movie",
      imdbId: "tt0000000"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate metadata for the movie "${movieTitle}". 
      Crucial: Provide the correct IMDB ID (starts with 'tt') if possible.
      Return a JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "A short, engaging plot summary (max 30 words)." },
            year: { type: Type.STRING, description: "Release year." },
            genre: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of genres (e.g. Action, Sci-Fi)"
            },
            rating: { type: Type.NUMBER, description: "A number between 1 and 10 representing quality." },
            suggestedTagline: { type: Type.STRING, description: "A catchy short tagline." },
            imdbId: { type: Type.STRING, description: "The IMDB ID of the movie (e.g. tt1234567)" }
          },
          required: ["description", "year", "genre", "rating", "suggestedTagline", "imdbId"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");
    
    return JSON.parse(text) as AIGeneratedMetadata;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback in case of error
    return {
      description: "Could not generate details. Please fill manually.",
      year: "N/A",
      genre: ["General"],
      rating: 5.0,
      suggestedTagline: "Watch now",
      imdbId: ""
    };
  }
};