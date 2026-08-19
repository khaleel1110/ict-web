import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);

  readonly user$: Observable<User | null> = authState(this.auth);

  /**
   * Sign in using Firebase Authentication.
   */
  async login(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(
      this.auth,
      email.trim(),
      password
    );

    return credential.user;
  }

  /**
   * Check whether a user is currently authenticated.
   */
  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  /**
   * Get currently authenticated user.
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Sign out the current user.
   */
  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
