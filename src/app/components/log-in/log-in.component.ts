import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountUser, DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
})
export class LoginComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  isSignup = this.route.snapshot.data['signup'] === true;
  name = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  user: AccountUser | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('registered') === '1') this.successMessage = 'Account created successfully. Sign in with your email and password.';
    if (isPlatformBrowser(this.platformId)) {
      this.dataService.currentUser().subscribe({ next: result => this.user = result.user, error: () => {} });
    }
  }

  loginUser(form: NgForm): void {
    if (this.isSubmitting) return;
    this.errorMessage = '';
    this.successMessage = '';
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    if (this.isSignup && this.password !== this.confirmPassword) {
      this.errorMessage = 'The passwords do not match.';
      return;
    }
    this.isSubmitting = true;
    if (this.isSignup) {
      this.dataService.signupUser({ name: this.name.trim(), lastName: this.lastName.trim(), email: this.email.trim(), password: this.password }).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.password = '';
          this.confirmPassword = '';
          void this.router.navigate(['/login'], { queryParams: { registered: '1' } });
        },
        error: error => this.handleError(error),
      });
      return;
    }
    this.dataService.loginUser({ email: this.email.trim(), password: this.password }).subscribe({
      next: result => {
        this.isSubmitting = false;
        this.password = '';
        this.user = result.user;
        this.successMessage = 'Sign-in successful. Welcome back!';
      },
      error: error => this.handleError(error),
    });
  }

  logout(): void {
    this.isSubmitting = true;
    this.dataService.logoutUser().subscribe({
      next: () => {
        this.user = null;
        this.isSignup = false;
        this.isSubmitting = false;
        this.successMessage = 'You have signed out.';
        this.errorMessage = '';
      },
      error: error => this.handleError(error),
    });
  }

  private handleError(error: HttpErrorResponse): void {
    this.isSubmitting = false;
    this.errorMessage = [400, 401, 409, 429].includes(error.status)
      ? error.error?.message || 'The email or password is incorrect. New clients must sign up first.'
      : 'We could not connect to the account service. Please try again later.';
  }
}
