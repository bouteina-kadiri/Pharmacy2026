import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isMenuOpen = false; // Tracks menu state

  constructor(private router: Router) {}

  // Toggle Menu
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
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

  goToPrescriptionStatus() {
    this.router.navigate(['/prescription-status']);
    this.isMenuOpen = false;
  }

  goToContact() {
    this.router.navigate(['/contact']);
    this.isMenuOpen = false;
  }
}
