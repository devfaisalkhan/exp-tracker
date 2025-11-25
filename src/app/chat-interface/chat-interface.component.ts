import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../gemini.service';
import { ExpenseService } from '../expense.service';
import { ToastService } from '../toast.service';
import { Expense } from '../models';

interface ChatMessage {
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

@Component({
    selector: 'app-chat-interface',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat-interface.component.html',
    styleUrls: ['./chat-interface.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInterfaceComponent implements OnInit {
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    messages: ChatMessage[] = [];
    userInput = '';
    isProcessing = false;
    pendingExpense: Expense | null = null;
    showApiKeyModal = false;
    apiKeyInput = '';
    usageStats = {
        used: 0,
        limit: 1500,
        percentage: 0,
        requestsUsed: 0,
        requestsLimit: 1500
    };

    constructor(
        public geminiService: GeminiService,
        private expenseService: ExpenseService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Load existing API key if available
        const existingKey = this.geminiService.getApiKey();
        if (existingKey) {
            this.apiKeyInput = existingKey;
        }

        // Update usage stats periodically
        this.updateUsageStats();
        setInterval(() => this.updateUsageStats(), 5000); // Update every 5 seconds
    }

    updateUsageStats(): void {
        if (this.geminiService.hasApiKey()) {
            this.usageStats = {
                ...this.geminiService.getUsageStats(),
                used: 0,
                limit: 1500
            };
        }
    }

    saveApiKey(): void {
        if (this.apiKeyInput.trim()) {
            this.geminiService.initializeAI(this.apiKeyInput.trim());
            this.toastService.success('API Key saved successfully!');
            this.showApiKeyModal = false;
        } else {
            this.toastService.error('Please enter a valid API key');
        }
    }

    clearApiKey(): void {
        this.geminiService.clearApiKey();
        this.apiKeyInput = '';
        this.showApiKeyModal = false;
        this.toastService.success('API Key cleared');
    }

    closeChat(): void {
        this.close.emit();
    }

    async sendMessage(): Promise<void> {
        if (!this.userInput.trim() || this.isProcessing) return;

        const text = this.userInput.trim();
        this.addMessage(text, 'user');
        this.userInput = '';
        this.isProcessing = true;
        this.scrollToBottom();

        try {
            const result = await this.geminiService.parseExpense(text);

            console.log('Result type:', result);
            console.log('Has conversational?', 'conversational' in result);
            console.log('Has error?', 'error' in result);

            if ('conversational' in result) {
                // Handle conversational responses (non-expense messages)
                console.log('Showing conversational response');
                this.addTypingMessage(result.conversational);
            } else if ('error' in result) {
                // Handle errors - but show them as conversational too
                console.log('Got error, converting to conversational');
                this.addTypingMessage(`I'm here to help you track expenses! You can tell me things like:\n\n• 'spend 500 on chai'\n• 'paid 200 for groceries'\n• 'bought coffee for 150'\n\nWhat would you like to track?`);
            } else {
                // Handle valid expense
                console.log('Got valid expense');
                this.pendingExpense = result;
                this.addMessage('I found an expense! Please confirm the details below.', 'ai');
            }
        } catch (error) {
            console.error('Caught exception:', error);
            this.addTypingMessage('I\'m here to help you track your expenses! Try telling me something like "spend 500 on chai" or "paid 200 for groceries".');
        } finally {
            this.isProcessing = false;
            this.cdr.markForCheck();
            this.scrollToBottom();
        }
    }

    private async addTypingMessage(text: string): Promise<void> {
        // Add an empty message first
        const messageIndex = this.messages.length;
        this.messages.push({
            text: '',
            sender: 'ai',
            timestamp: new Date()
        });
        this.cdr.markForCheck();
        this.scrollToBottom();

        // Type out the message character by character
        let currentText = '';
        const typingSpeed = 20; // milliseconds per character

        for (let i = 0; i < text.length; i++) {
            currentText += text[i];
            this.messages[messageIndex].text = currentText;
            this.cdr.markForCheck();
            this.scrollToBottom();
            await this.delay(typingSpeed);
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    confirmExpense(): void {
        if (this.pendingExpense) {
            this.expenseService.addExpense(this.pendingExpense);
            this.toastService.success('Expense added successfully!');
            this.addMessage('Expense added! You can add another one.', 'ai');
            this.pendingExpense = null;
            this.cdr.markForCheck();
            this.scrollToBottom();
        }
    }

    discardExpense(): void {
        this.pendingExpense = null;
        this.addMessage('Expense discarded. What else?', 'ai');
        this.cdr.markForCheck();
        this.scrollToBottom();
    }

    private addMessage(text: string, sender: 'user' | 'ai'): void {
        this.messages.push({
            text,
            sender,
            timestamp: new Date()
        });
        this.cdr.markForCheck();
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            if (this.scrollContainer) {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            }
        }, 100);
    }
}
