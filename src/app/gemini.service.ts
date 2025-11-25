import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Expense } from './models';

@Injectable({
    providedIn: 'root'
})
export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private readonly STORAGE_KEY = 'gemini_api_key';

    constructor() {
        // Try to load API key from localStorage
        const savedKey = localStorage.getItem(this.STORAGE_KEY);
        if (savedKey) {
            this.initializeAI(savedKey);
        }
    }

    initializeAI(apiKey: string): void {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Save to localStorage
        localStorage.setItem(this.STORAGE_KEY, apiKey);
    }

    hasApiKey(): boolean {
        return this.genAI !== null;
    }

    getApiKey(): string | null {
        return localStorage.getItem(this.STORAGE_KEY);
    }

    clearApiKey(): void {
        this.genAI = null;
        localStorage.removeItem(this.STORAGE_KEY);
    }

    async parseExpense(userMessage: string): Promise<Expense | { error: string } | { conversational: string }> {
        if (!this.genAI) {
            return { error: 'API Key not configured. Please add your Gemini API key in settings.' };
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            // Get current date info
            const today = new Date();
            const currentDate = today.toISOString().split('T')[0];
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();

            const prompt = `You are "Expense GPT", a friendly AI assistant for an expense tracking app.

CURRENT DATE: ${currentDate} (Year: ${currentYear}, Month: ${currentMonth}, Day: ${currentDay})

YOUR DUAL ROLE:
1. If the user's message is about tracking an expense (spending money, buying something, paying for something), respond with ONLY a JSON object in this EXACT format:
{
  "id": <random 5-digit number>,
  "title": "<short 1-3 word summary>",
  "amount": <numeric amount>,
  "date": "${currentDate}",
  "category": "<one of: Food, Transport, Bills, Entertainment, Shopping, Healthcare, Education, Travel, Gifts, Utilities, Insurance, Other>",
  "notes": "<brief explanation>",
  "paymentMethod": "",
  "receipt": "",
  "tags": [<max 3 keywords>],
  "groupId": null,
  "recurringId": null,
  "createdAt": "${today.toISOString()}",
  "updatedAt": "${today.toISOString()}"
}

IMPORTANT DATE PARSING:
- "yesterday" → use ${new Date(today.getTime() - 86400000).toISOString().split('T')[0]}
- "2 days ago" → subtract 2 days from current date
- "last week" → subtract 7 days
- "monday", "tuesday", etc. → find the most recent occurrence

2. If the message is NOT about an expense (greetings, questions, casual chat, asking about you, etc.), respond naturally like a helpful, friendly chatbot. You can answer any questions, have casual conversations, and provide information. Be conversational and engaging!

CRITICAL: 
- For expenses, output ONLY the JSON object, nothing else
- For conversations, respond naturally without JSON

User message: "${userMessage}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('=== GEMINI RAW RESPONSE ===');
            console.log(text);
            console.log('=== END RAW RESPONSE ===');

            // Clean up response
            let cleanText = text.trim();
            cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

            // Try to parse as JSON (expense)
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    // Check if it looks like an expense object
                    if (parsed.amount && parsed.title) {
                        // Convert to proper types
                        return {
                            ...parsed,
                            date: new Date(parsed.date),
                            category: parsed.category as any,
                            groupId: undefined,
                            recurringId: undefined,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                    }
                } catch (e) {
                    // Not valid JSON, treat as conversational
                }
            }

            // It's a conversational response
            return {
                conversational: cleanText
            };

        } catch (error) {
            console.error('=== ERROR CALLING GEMINI API ===');
            console.error(error);
            console.error('=== END ERROR ===');

            if (error instanceof Error && error.message.includes('API key')) {
                return {
                    error: 'Invalid API key. Please check your Gemini API key in settings.'
                };
            }

            return {
                conversational: "I'm having trouble connecting right now. Please check your internet connection or API key."
            };
        }
    }
}
