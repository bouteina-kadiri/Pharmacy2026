import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: []
})
export class HomeComponent {
  emblemLoaded = false;

  constructor(private router: Router) {}

  goToContact() {
    this.router.navigate(['/contact']);
  }
}
