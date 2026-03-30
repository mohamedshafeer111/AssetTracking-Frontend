import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';

import { Permission } from '../../service/permission/permission';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, RouterOutlet],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  userid: string = '';

  // Permission flags
  canViewTracking = false;
  canViewEvents = false;
  canViewReports = false;
  canViewProcessAutomation = false;
  canViewAdministration = false;
  canViewDashboard = false;

  ngOnInit() {
    this.userid = localStorage.getItem('userid') || '';
    this.permission.loadPermissions();
    this.applyPermissions();
    if (this.isTrackingActive()) {
      this.isTrackingMenuOpen = true;
    }
    if (this.isAdminActive()) {
      this.isAdminMenuOpen = true;
    }
  }

  applyPermissions() {
    this.canViewDashboard = this.permission.hasPermission('Dashboard');
    this.canViewTracking = this.permission.hasPermission('Tracking');
    this.canViewEvents = this.permission.hasPermission('Events');
    this.canViewReports = this.permission.hasPermission('Reports');
    this.canViewProcessAutomation = this.permission.hasPermission('Process & Automation');
    this.canViewAdministration = this.permission.hasPermission('Administration');
  }

  constructor(public router: Router, private eRef: ElementRef, private permission: Permission) { }

  menuOpen = false;

  isAdminMenuOpen = false;

  toggleAdminMenu() {
    this.isAdminMenuOpen = !this.isAdminMenuOpen;

    if (this.isAdminMenuOpen) {
      this.isTrackingMenuOpen = false; // close tracking if admin opens
    }
  }
  isSidebarCollapsed = false;

  toggleSidebar() {
    console.log("click")
    this.isSidebarCollapsed = !this.isSidebarCollapsed;

  }

  closeAdminMenu() {
    this.isAdminMenuOpen = false;
  }

  isTrackingMenuOpen = false;
  isLiveOpen = false;
  isHistoricalsOpen = false;

  toggleTrackingMenu() {
    this.isTrackingMenuOpen = !this.isTrackingMenuOpen;
    if (!this.isTrackingMenuOpen) {
      this.isLiveOpen = false;
      this.isHistoricalsOpen = false;
    }
    if (this.isTrackingMenuOpen) {
      this.isAdminMenuOpen = false;
    }
  }

  toggleLiveMenu() {
    this.isLiveOpen = !this.isLiveOpen;
    this.isHistoricalsOpen = false;
    this.isTrackingMenuOpen = false;
  }

  toggleHistoricalsMenu() {
    this.isHistoricalsOpen = !this.isHistoricalsOpen;
    this.isLiveOpen = false;
    this.isTrackingMenuOpen = false;
  }

  closeTrackingMenu() {
    this.isTrackingMenuOpen = false;
    this.isLiveOpen = false;
    this.isHistoricalsOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target.closest('.menu-icon')) {
      return;
    }

    if (!target.closest('.menu-item')) {
      this.closeTrackingMenu();
      this.closeAdminMenu();
    }
  }


  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click')
  clickOutside() {
    this.menuOpen = false;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  changePassword() {
    this.router.navigate(['/change-password']);
  }

  openHelp() {
    this.router.navigate(['/help']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  closeAllSubmenus() {
    this.isTrackingMenuOpen = false;
    this.isAdminMenuOpen = false;
    this.isLiveOpen = false;
    this.isHistoricalsOpen = false;
  }

  isDashboardActive(): boolean {
    return this.router.url === '/dashboard' ||
      this.router.url === '/customerdashboard' ||
      this.router.url === '/personalDashboard';
  }
  isTrackingActive(): boolean {
    const url = this.router.url;

    const trackingRoutes = [
      '/live',
      '/historicals',
      '/overview'
    ];

    return trackingRoutes.some(route => url.includes(route));
  }

  isAdminActive(): boolean {
    const url = this.router.url;
    console.log('Admin URL check:', url);
    return url.includes('/project') ||
      url.includes('/devices') ||
      url.includes('/asset') ||
      url.includes('/projecthierarchy') ||
      url.includes('/user-management') ||
      url.includes('/role') ||
      url.includes('/createrole') ||
      url.includes('/editrole');
  }

  isReportsActive(): boolean {
    const url = this.router.url;
    return url.includes('/createreport') ||
      url.includes('/reports') ||
      url.includes('/viewreport');
  }

  isProcessActive(): boolean {
    const url = this.router.url;
    return url.includes('/processautomation') ||
      url.includes('/createprocessautomation') ||
      url.includes('/editprocessautomation');
  }

}





