import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { User } from '../enhanced-expense.model';
import { PWAService } from '../pwa.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user: User | null = null;
  themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];
  currencies = [
    { value: 'PKR', label: 'Pakistani Rupee (PKR)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' }
  ];
  showInstallButton = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private pwaService: PWAService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.initForm();
    
    // Check if install is possible
    this.showInstallButton = this.pwaService.canInstall();
    
    console.log('Profile component - show install button:', this.showInstallButton);
  }

  private initForm(): void {
    if (this.user) {
      this.profileForm = this.fb.group({
        name: [this.user.name, [Validators.required, Validators.minLength(2)]],
        email: [this.user.email, [Validators.required, Validators.email]],
        currency: [this.user.currency, [Validators.required]],
        theme: [this.user.theme, [Validators.required]]
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.user) {
      const formValue = this.profileForm.value;
      const updatedUser = {
        ...this.user,
        name: formValue.name,
        email: formValue.email,
        currency: formValue.currency,
        theme: formValue.theme
      };
      
      this.userService.updateUser(updatedUser);
      this.user = updatedUser;
      
      alert('Profile updated successfully!');
    }
  }
  
  installPWA(): void {
    console.log('Manual install triggered from profile');
    this.pwaService.showInstallPrompt();
  }
}