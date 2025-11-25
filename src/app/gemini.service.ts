import { Injectable } from '@angular/core';
import { Expense } from './models';

@Injectable({
    providedIn: 'root'
})
export class GeminiService {
    constructor() { }

    hasApiKey(): boolean {
        return true; // No API key needed
    }

    async parseExpense(userMessage: string): Promise<Expense | { error: string } | { conversational: string }> {
        const message = userMessage.toLowerCase().trim();

        // Get current date info
        const today = new Date();
        const currentDate = today.toISOString().split('T')[0];

        // Check if it's a greeting or casual conversation
        const greetings = ['hello', 'hi', 'hey', 'hola', 'howdy', 'greetings'];
        const howAreYou = ['how are you', 'how r u', 'how are u', 'whats up', "what's up", 'sup'];
        const thanks = ['thank', 'thanks', 'thx', 'ty'];
        const help = ['help', 'how to', 'how do i', 'what can you do'];

        // Check for greetings
        if (greetings.some(g => message === g || message.startsWith(g + ' '))) {
            return {
                conversational: "Hi there! 👋 I'm Expense GPT, your personal expense tracker. I can help you log your spending quickly. Just tell me what you spent! For example:\n\n• 'spend 500 on chai'\n• 'paid 200 for groceries'\n• 'bought coffee for 150'\n\nWhat would you like to track?"
            };
        }

        // Check for "how are you"
        if (howAreYou.some(h => message.includes(h))) {
            return {
                conversational: "I'm doing great, thanks for asking! 😊 I'm here to help you track your expenses. You can tell me about any purchases like:\n\n• 'spend 300 on lunch'\n• 'paid 1000 for electricity bill'\n• 'bought shoes for 2500'\n\nWhat did you spend on today?"
            };
        }

        // Check for thanks
        if (thanks.some(t => message.includes(t))) {
            return {
                conversational: "You're welcome! 😊 Feel free to add more expenses anytime. Just tell me what you spent!"
            };
        }

        // Check for help
        if (help.some(h => message.includes(h))) {
            return {
                conversational: "I can help you track your expenses! Just tell me what you spent in natural language. Here are some examples:\n\n• 'spend 500 on chai'\n• 'paid 200 for groceries yesterday'\n• 'bought coffee for 150'\n• '300 for lunch'\n• 'spent 1000 on electricity bill'\n\nI'll understand and create an expense entry for you!"
            };
        }

        // Try to parse as an expense
        const expenseDate = this.extractDate(userMessage);
        const expenseResult = this.tryParseExpense(userMessage, expenseDate);

        if (expenseResult) {
            return expenseResult;
        }

        // If we can't understand it, give helpful guidance
        return {
            conversational: "I'm not sure I understood that. Could you try rephrasing? For example:\n\n• 'spend 500 on chai'\n• 'paid 200 for groceries yesterday'\n• 'bought coffee for 150'\n• '300 for lunch'\n\nWhat would you like to track?"
        };
    }

    private extractDate(message: string): string {
        const today = new Date();
        const lowerMessage = message.toLowerCase();

        // Check for "yesterday"
        if (lowerMessage.includes('yesterday')) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toISOString().split('T')[0];
        }

        // Check for "today" or no date mentioned
        if (lowerMessage.includes('today') || true) {
            // Check for "X days ago"
            const daysAgoMatch = lowerMessage.match(/(\d+)\s+days?\s+ago/);
            if (daysAgoMatch) {
                const daysAgo = parseInt(daysAgoMatch[1]);
                const date = new Date(today);
                date.setDate(date.getDate() - daysAgo);
                return date.toISOString().split('T')[0];
            }

            // Check for "last week"
            if (lowerMessage.includes('last week')) {
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                return lastWeek.toISOString().split('T')[0];
            }

            // Check for "last month"
            if (lowerMessage.includes('last month')) {
                const lastMonth = new Date(today);
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                return lastMonth.toISOString().split('T')[0];
            }

            // Check for day names (monday, tuesday, etc.)
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            for (let i = 0; i < days.length; i++) {
                if (lowerMessage.includes(days[i])) {
                    const targetDay = i;
                    const currentDay = today.getDay();
                    let daysBack = currentDay - targetDay;
                    if (daysBack <= 0) daysBack += 7; // Last occurrence
                    const date = new Date(today);
                    date.setDate(date.getDate() - daysBack);
                    return date.toISOString().split('T')[0];
                }
            }
        }

        // Default to today
        return today.toISOString().split('T')[0];
    }

    private tryParseExpense(message: string, currentDate: string): Expense | null {
        // Common expense patterns
        const patterns = [
            /(?:spend|spent|paid|pay)\s+(\d+)\s+(?:on|for)\s+(.+)/i,
            /(?:bought|buy|purchased)\s+(.+?)\s+for\s+(\d+)/i,
            /(\d+)\s+(?:for|on)\s+(.+)/i,
            /(.+?)\s+(\d+)/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                let amount: number;
                let description: string;

                // Different patterns have amount and description in different positions
                if (pattern.source.includes('bought')) {
                    description = match[1].trim();
                    amount = parseInt(match[2]);
                } else if (match[1] && !isNaN(parseInt(match[1]))) {
                    amount = parseInt(match[1]);
                    description = match[2]?.trim() || 'expense';
                } else {
                    description = match[1]?.trim() || 'expense';
                    amount = parseInt(match[2]);
                }

                if (amount && amount > 0 && description) {
                    return this.createExpense(amount, description, currentDate);
                }
            }
        }

        return null;
    }

    private createExpense(amount: number, description: string, date: string): Expense {
        const category = this.inferCategory(description);
        const title = this.generateTitle(description);

        return {
            id: Math.floor(10000 + Math.random() * 90000),
            title: title,
            amount: amount,
            date: new Date(date),
            category: category as any,
            notes: `Spent ${amount} on ${description}`,
            paymentMethod: '',
            receipt: '',
            tags: this.extractTags(description),
            groupId: undefined,
            recurringId: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    private inferCategory(description: string): string {
        const desc = description.toLowerCase();

        // Food & Drinks
        if (/chai|tea|coffee|food|lunch|dinner|breakfast|restaurant|cafe|snack|meal|pizza|burger/i.test(desc)) {
            return 'Food';
        }

        // Transport
        if (/uber|taxi|cab|bus|train|metro|fuel|petrol|gas|parking|transport/i.test(desc)) {
            return 'Transport';
        }

        // Bills & Utilities
        if (/bill|electricity|water|gas|internet|phone|mobile|utility/i.test(desc)) {
            return 'Bills';
        }

        // Entertainment
        if (/movie|cinema|game|concert|show|entertainment|netflix|spotify/i.test(desc)) {
            return 'Entertainment';
        }

        // Shopping
        if (/shop|cloth|shirt|shoes|dress|buy|purchase|store|mall/i.test(desc)) {
            return 'Shopping';
        }

        // Healthcare
        if (/doctor|medicine|hospital|pharmacy|health|medical/i.test(desc)) {
            return 'Healthcare';
        }

        // Education
        if (/book|course|class|tuition|education|school|college/i.test(desc)) {
            return 'Education';
        }

        // Travel
        if (/hotel|flight|ticket|travel|vacation|trip/i.test(desc)) {
            return 'Travel';
        }

        return 'Other';
    }

    private generateTitle(description: string): string {
        // Take first 1-3 words
        const words = description.trim().split(/\s+/).slice(0, 3);
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    private extractTags(description: string): string[] {
        const words = description.toLowerCase().split(/\s+/);
        return words.slice(0, 3).filter(w => w.length > 2);
    }
}
