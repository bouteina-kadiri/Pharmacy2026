import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Login method
  loginUser(user: { email: string; password: string }): Observable<{ user: AccountUser }> {
    return this.http.post<{ user: AccountUser }>(`${this.apiUrl}/users/login`, user, { withCredentials: true });
  }

  signupUser(user: { name: string; lastName: string; email: string; password: string }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/signup`, user, { withCredentials: true });
  }

  currentUser(): Observable<{ user: AccountUser }> {
    return this.http.get<{ user: AccountUser }>(`${this.apiUrl}/users/me`, { withCredentials: true });
  }

  logoutUser(): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/users/logout`, {}, { withCredentials: true });
  }

  getPrescriptionStatus(firstName: string, lastName: string): Observable<PrescriptionStatus> {
    const params = new HttpParams().set('firstName', firstName).set('lastName', lastName);
    return this.http.get<PrescriptionStatus>(`${this.apiUrl}/prescription-status`, { params });
  }
}

export interface PrescriptionStatus {
  name: string;
  last_name: string;
  prescription_ready: boolean;
}

export interface AccountUser { id: string; name: string; lastName: string; email: string; }
