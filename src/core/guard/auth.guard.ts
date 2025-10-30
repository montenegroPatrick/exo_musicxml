import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { environment } from 'src/environments/environment';

export const authGuard: CanActivateFn = (route, state) => {
  if (!environment.production) {
    return true;
  }
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token from route query params
  const token = route.queryParamMap.get('token');

  console.log('Auth Guard - Token:', token);
  console.log('Auth Guard - Route:', route);
  console.log('Auth Guard - State URL:', state.url);

  if (token == null) {
    console.log('Auth Guard - No token found, redirecting to /unauthorized');
    return router.parseUrl('/unauthorized');
  }

  const isValid = authService.isValidToken(token);
  console.log('Auth Guard - Token valid:', isValid);

  // If token is invalid, redirect to unauthorized
  if (!isValid) {
    console.log('Auth Guard - Invalid token, redirecting to /unauthorized');
    return router.parseUrl('/unauthorized');
  }

  return true;
};
