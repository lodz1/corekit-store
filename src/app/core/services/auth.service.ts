import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiBaseUrl;

  // Signals para el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signals para compatibilidad
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          this.setAuthState(token, user);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          this.clearAuth();
        }
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuthState(response.token, response.user);
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decodificar el JWT para verificar expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  private setAuthState(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }

    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }

    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  // Método para obtener el token para usar en headers
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}
