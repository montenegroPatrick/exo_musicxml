import { inject } from '@angular/core';
import {
  ActivatedRoute,
  CanActivateFn,
  CanMatchFn,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const unauthGuard: CanMatchFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const activatedRoute = inject(ActivatedRoute);
  const token = activatedRoute.snapshot.queryParamMap.get('token');

  if (token) {
    return false;
  }

  return true;
};
