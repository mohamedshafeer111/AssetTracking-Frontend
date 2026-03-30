import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Permission {
  

  private permissions: { featureName: string; status: boolean }[] = [];

  constructor() {
    this.loadPermissions();
  }

  loadPermissions() {
    const stored = localStorage.getItem('permissions');
    this.permissions = stored ? JSON.parse(stored) : [];
  }

  // Check if a feature is allowed
  hasPermission(featureName: string): boolean {
    const permission = this.permissions.find(
      p => p.featureName.toLowerCase() === featureName.toLowerCase()
    );
    return permission ? permission.status : false;
  }
}
