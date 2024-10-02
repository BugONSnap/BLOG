import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { securityAuthGuard } from './security-auth.guard';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('securityAuthGuard', () => {
  let authService: AuthService;
  let router: Router;

  const executeGuard = () => 
      TestBed.runInInjectionContext(() => securityAuthGuard({} as any, {} as any));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => true } }
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should navigate to login if not logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(false);
    spyOn(router, 'navigate');

    const result = executeGuard();
    console.log('Guard result:', result); // Add logging to debug

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(false); // Ensure the guard returns false
  });

  it('should allow navigation if logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(true);

    const result = executeGuard();
    console.log('Guard result:', result); // Add logging to debug

    expect(result).toBe(true); // Ensure the guard returns true
  });
});