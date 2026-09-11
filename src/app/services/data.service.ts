import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = 'http://localhost:8080/api/users'; // Update to match your backend API URL

  constructor(private http: HttpClient) {}

  // Login method
  loginUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, user);
  }

  // Optional: Method to fetch users (if needed)
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`);
  }
}
