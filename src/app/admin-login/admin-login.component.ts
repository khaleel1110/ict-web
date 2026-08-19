import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async submit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    try {
      await this.auth.login(email, password);

      await this.router.navigate(['/admin/issues']);
    } catch (error: any) {
      console.error('Login error:', error);

      switch (error?.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          this.errorMessage = 'Invalid email or password.';
          break;

        case 'auth/invalid-email':
          this.errorMessage = 'Please enter a valid email address.';
          break;

        case 'auth/user-disabled':
          this.errorMessage =
            'This account has been disabled. Please contact the administrator.';
          break;

        case 'auth/too-many-requests':
          this.errorMessage =
            'Too many login attempts. Please try again later.';
          break;

        default:
          this.errorMessage =
            'Unable to sign in. Please check your connection and try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
