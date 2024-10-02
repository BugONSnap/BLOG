import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      // Remove or comment out the console.log statement
      // console.log('Sending registration data:', registerData);
      this.apiService.register(registerData)
        .subscribe(
          response => {
            // Remove or comment out the console.log statements
            // console.log('Registration successful:', response.message);
            // console.log('Unique ID:', response.unique_id); // Log the unique ID
            this.router.navigate(['/login']);
          },
          error => {
            console.error('Registration failed:', error);
            alert('Registration failed: ' + error.error.error);
          }
        );
    }
  }
}