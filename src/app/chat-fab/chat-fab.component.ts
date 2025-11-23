import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-chat-fab',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './chat-fab.component.html',
    styleUrls: ['./chat-fab.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatFabComponent {
    @Output() toggle = new EventEmitter<void>();

    toggleChat(): void {
        this.toggle.emit();
    }
}
