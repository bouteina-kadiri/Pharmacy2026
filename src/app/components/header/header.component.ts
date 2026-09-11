import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isMenuOpen = false; // Tracks menu state

  constructor(private router: Router) {}

  // Toggle Menu
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    console.log("Menu toggled:", this.isMenuOpen);
  }

  // Navigation Methods
  goToHome() {
    this.router.navigate(['/']);
    this.isMenuOpen = false;
  }

  goToLogin() {
    this.router.navigate(['/login']);
    this.isMenuOpen = false;
  }

  goToAbout() {
    this.router.navigate(['/about']);
    this.isMenuOpen = false;
  }

  goToServices() {
    this.router.navigate(['/services']);
    this.isMenuOpen = false;
  }

  goToContact() {
    this.router.navigate(['/contact']);
    this.isMenuOpen = false;
  }
}
