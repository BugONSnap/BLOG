import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';
  private tokenKey = 'auth_token';
  private userKey = 'user';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  checkAccount(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/check-account?email=${email}`);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  saveUniqueId(uniqueId: string): void {
    const user = { unique_id: uniqueId };
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUniqueId(): string | null {
    const user = localStorage.getItem(this.userKey);
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        return parsedUser.unique_id;
      } catch (e) {
        console.error('Error parsing user from local storage', e);
        return null;
      }
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string {
    // Implement the logic to get the username
    return 'username'; // Replace with actual logic
  }

  // New method to get email by unique ID
  getEmailByUniqueId(uniqueId: string): Observable<{ email: string }> {
    return this.http.get<{ email: string }>(`${this.baseUrl}/get-email?unique_id=${uniqueId}`);
  }
}