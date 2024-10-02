import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  public authService: AuthService; // Use 'public' modifier here

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    authService: AuthService // Initialize in the constructor
  ) {
    this.authService = authService;
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      
      this.apiService.login(loginData).subscribe(
        (response: any) => {
          console.log('Login successful', response.message);
          if (response && response.user && response.user.unique_id) {
            this.authService.saveToken(response.token);
            this.authService.saveUniqueId(response.user.unique_id); // Ensure this is the correct path to the unique ID
            this.router.navigate(['/mp']);
          } else {
            console.error('Invalid response structure:', response);
            alert('Login failed: Invalid response structure');
          }
        },
        (error) => {
          console.error('Login failed', error);
          alert('Login failed: ' + error.error.error);
        }
      );
    }
  }
}