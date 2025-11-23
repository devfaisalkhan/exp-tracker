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
    apiKeyInput = '';
    hasApiKey = false;
    isProcessing = false;
    pendingExpense: Expense | null = null;

    constructor(
        private geminiService: GeminiService,
        private expenseService: ExpenseService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.hasApiKey = this.geminiService.hasApiKey();
    }

    saveApiKey(): void {
        if (this.apiKeyInput.trim()) {
            this.geminiService.setApiKey(this.apiKeyInput.trim());
            this.hasApiKey = true;
            this.apiKeyInput = '';
            this.toastService.success('API Key saved successfully!');
        }
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

            if ('error' in result) {
                this.addMessage(`I couldn't understand that as an expense. ${result.error}`, 'ai');
            } else {
                this.pendingExpense = result;
                this.addMessage('I found an expense! Please confirm the details below.', 'ai');
            }
        } catch (error) {
            this.addMessage('Sorry, something went wrong. Please try again.', 'ai');
        } finally {
            this.isProcessing = false;
            this.cdr.markForCheck();
            this.scrollToBottom();
        }
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
