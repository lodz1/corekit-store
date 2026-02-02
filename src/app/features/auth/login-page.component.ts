import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, LoginRequest } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Signals
  isLoading = signal(false);

  // Form
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['admin@corekit.local', [Validators.required, Validators.email]],
      password: ['Admin123$', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    try {
      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      await this.authService.login(credentials).toPromise();

      this.snackBar.open('¡Inicio de sesión exitoso!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });

      // Redirigir a la página anterior o al home
      const returnUrl = this.router.url.includes('/login') ? '/' : this.router.url;
      this.router.navigateByUrl(returnUrl);
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';

      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Email o contraseña incorrectos.';
      }

      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
