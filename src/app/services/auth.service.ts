import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  signOut,
  getIdTokenResult,
  User,
} from '@angular/fire/auth';
import { Observable, switchMap, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);

  readonly user$: Observable<User | null> = authState(this.auth);

  /**
   * True only for signed-in users carrying the `admin: true` custom claim
   * set by the CLI's CreateUsers script — being logged in alone isn't
   * enough to reach /admin/*.
   */
  readonly isAdmin$: Observable<boolean> = this.user$.pipe(
    switchMap((user) => (user ? this.hasAdminClaim(user) : of(false)))
  );

  /**
   * Sign in using Firebase Authentication. Non-admin accounts authenticate
   * successfully against Firebase but are immediately signed back out here
   * and rejected, so they never end up in a signed-in state on the admin
   * screens.
   */
  async login(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(
      this.auth,
      email.trim(),
      password
    );

    const isAdmin = await this.hasAdminClaim(credential.user);
    if (!isAdmin) {
      await signOut(this.auth);
      throw new Error('This account does not have admin access.');
    }

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

  private async hasAdminClaim(user: User): Promise<boolean> {
    const token = await getIdTokenResult(user);
    return token.claims['admin'] === true;
  }
}
