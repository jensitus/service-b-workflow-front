import {Component, DestroyRef, inject, model, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormsModule} from "@angular/forms";
import {LoginService} from "../login.service";
import {NgbToast} from "@ng-bootstrap/ng-bootstrap";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    NgbToast,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly username = model('');
  readonly password = model('');
  readonly showErrorToast = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly invalidLogin = signal(false);
  readonly loginSuccess = signal(false);

  constructor() {
    this.loginService.logout();
  }

  login() {
    this.loginService.login(this.username(), this.password())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.invalidLogin.set(false);
          this.loginSuccess.set(true);
          this.successMessage.set('Login Successful.');
          this.loginService.registerSuccessfulLogin(result);
          this.router.navigate(['/new-task-list']);
        },
        error: err => {
          this.showErrorToast.set(true);
          this.errorMessage.set(err.error.text);
          this.invalidLogin.set(true);
          this.loginSuccess.set(false);
        }
      });
  }
}
