import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, PrescriptionStatus } from '../../services/data.service';

@Component({
  selector: 'app-prescription-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prescription-status.component.html',
  styleUrl: './prescription-status.component.css'
})
export class PrescriptionStatusComponent {
  firstName = '';
  lastName = '';
  result?: PrescriptionStatus;
  error = '';
  isLoading = false;

  constructor(private dataService: DataService) {}

  checkStatus(): void {
    this.result = undefined;
    this.error = '';

    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.error = 'Enter your first and last name.';
      return;
    }

    this.isLoading = true;
    this.dataService.getPrescriptionStatus(this.firstName.trim(), this.lastName.trim()).subscribe({
      next: (status) => {
        this.result = status;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.status === 404
          ? 'We could not find a client with that name.'
          : 'We could not check your prescription right now. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
