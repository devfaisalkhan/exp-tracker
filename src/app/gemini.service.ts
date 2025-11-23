import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Expense } from './models';
import { ExpenseCategory } from './expense-category.enum';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;

    constructor() {
        // Initialize with API key from environment
        if (environment.geminiApiKey) {
            this.initializeAI(environment.geminiApiKey);
        }
    }

    initializeAI(apiKey: string): void {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    hasApiKey(): boolean {
        return this.genAI !== null;
    }

    async parseExpense(userMessage: string): Promise<Expense | { error: string }> {
        if (!this.genAI) {
            return { error: 'API Key not configured' };
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            // Get current date in YYYY-MM-DD format
            const today = new Date();
            const currentDate = today.toISOString().split('T')[0]; // e.g., "2025-11-23"
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();

            const prompt = `
        You are the AI engine of an expense-tracking application.
        Your job is to read a user's natural-language expense message and convert it into a structured Expense object.

        CURRENT DATE CONTEXT:
        Today's date is: ${currentDate} (${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')})
        Current year: ${currentYear}
        Current month: ${currentMonth}

        EXPENSE OBJECT FORMAT (output must match EXACTLY):
        {
          "id": 0,
          "title": "",
          "amount": 0,
          "date": "",
          "category": "",
          "notes": "",
          "paymentMethod": "",
          "receipt": "",
          "tags": [],
          "groupId": null,
          "recurringId": null,
          "createdAt": "",
          "updatedAt": ""
        }

        FIELD RULES:
        id: Generate a random integer (example: 53211)
        title: 1–3 words summarizing the expense
        amount: Extract numeric amount. If "Rs 200", "200 rupees", detect it.
        date: Convert "today", "yesterday", etc. to YYYY-MM-DD. 
              - "today" = ${currentDate}
              - "yesterday" = subtract 1 day from ${currentDate}
              - If no date mentioned, use ${currentDate}
              - IMPORTANT: Always use ${currentYear} as the year unless user explicitly mentions a different year
        category: Use EXACT enum values: "Food", "Transport", "Bills", "Entertainment", "Shopping", "Healthcare", "Education", "Travel", "Gifts", "Utilities", "Insurance", "Other". Infer based on keywords.
        notes: Full interpreted explanation (e.g., "User spent 200 PKR on chai today using cash.").
        paymentMethod: Infer "Cash", "Credit Card", "Debit Card", "Bank Transfer", "Mobile Payment", "Other". Default to "".
        tags: Extract max 3 keyword tags.
        receipt: Link/file if mentioned, else "".
        groupId: Integer if grouping mentioned, else null.
        recurringId: Integer if recurring mentioned, else null.
        createdAt & updatedAt: Current ISO timestamp.

        VERY IMPORTANT RULES:
        1. Output must always be VALID JSON.
        2. Output must contain ONLY JSON. No text outside JSON.
        3. If NOT an expense → return { "error": "Not an expense entry" }
        4. ALWAYS use the current year (${currentYear}) unless user explicitly states otherwise

        User Message: "${userMessage}"
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up the response to ensure it's valid JSON
            const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error parsing expense with Gemini:', error);
            return { error: 'Failed to process request' };
        }
    }
}
