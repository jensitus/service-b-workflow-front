import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { LoginService } from '../login.service';
import {AuthService} from "../auth.service";
import {UserRegistrationRequest} from "../user-registration-request";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-register',
  standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        NgIf
    ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{

    registerForm: FormGroup;
    errorMessage: string = '';
    successMessage: string = '';
    loading: boolean = false;
    registrationComplete: boolean = false;

    private fb = inject(FormBuilder);
    private loginService = inject(LoginService);
    private router =  inject(Router);
    private authService = inject(AuthService);

    ngOnInit(): void {
        this.registerForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            firstName: [''],
            lastName: ['']
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }
        return null;
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            Object.keys(this.registerForm.controls).forEach(key => {
                this.registerForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const request: UserRegistrationRequest = {
            username: this.registerForm.value.username,
            email: this.registerForm.value.email,
            password: this.registerForm.value.password,
            firstName: this.registerForm.value.firstName,
            lastName: this.registerForm.value.lastName
        };

        this.authService.registerUser(request).subscribe({
            next: (response) => {
                this.loading = false;
                this.registrationComplete = true;
                this.successMessage = 'Registration successful! Please check your email to verify your account.';
                this.registerForm.reset();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
            }
        });
    }

    resendVerificationEmail(): void {
        const email = this.registerForm.value.email;
        if (!email) {
            this.errorMessage = 'Please enter your email address';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.resendVerification(email).subscribe({
            next: (response) => {
                this.loading = false;
                this.successMessage = 'Verification email sent! Please check your inbox.';
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Failed to resend verification email.';
            }
        });
    }

    navigateToLogin(): void {
        this.router.navigate(['/login']);
    }

}
