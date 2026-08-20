import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Protects /admin/* routes. Waits for Firebase's persisted auth state to
 * resolve (important on refresh — auth.currentUser isn't populated
 * synchronously) and requires the `admin` custom claim, not just any
 * signed-in user.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAdmin$.pipe(
    take(1),
    map((isAdmin) => {
      if (isAdmin) {
        return true;
      }
      router.navigate(['/admin/login']);
      return false;
    })
  );
};
