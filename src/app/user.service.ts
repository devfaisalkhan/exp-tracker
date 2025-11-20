import { Injectable } from '@angular/core';
import { User } from './models';
import { ToastService } from './toast.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private localStorageKey = 'userProfile';
  private defaultUser: User = {
    id: 1,
    name: 'Default User',
    email: 'user@example.com',
    currency: 'PKR',
    theme: 'light',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(private toastService: ToastService, private storageService: StorageService) { }

  private loadUser(): User | null {
    const stored = this.storageService.getItem(this.localStorageKey);
    if (stored) {
      const userData = stored;
      return {
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt)
      };
    }
    return null;
  }

  private saveUser(user: User): void {
    this.storageService.setItem(this.localStorageKey, user);
  }

  getUser(): User {
    const user = this.loadUser();
    return user || this.defaultUser;
  }

  updateUser(userData: Partial<User>): User {
    const currentUser = this.getUser();
    const updatedUser = {
      ...currentUser,
      ...userData,
      updatedAt: new Date()
    };
    this.saveUser(updatedUser);
    this.toastService.success('Profile updated successfully!');
    return updatedUser;
  }

  setUser(user: User): void {
    this.saveUser(user);
    this.toastService.success('User profile saved successfully!');
  }
}