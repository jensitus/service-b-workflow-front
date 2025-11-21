import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {LoginService} from "../login.service";
import {Subscription} from "rxjs";
import {NgbToast} from "@ng-bootstrap/ng-bootstrap";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [
        FormsModule,
        NgbToast,
        RouterLink
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  username: string;
  password: string;
  private loginService = inject(LoginService);
  private router =  inject(Router);
  private subscriptions: Subscription[] = [];
  showErrorToast: boolean = false;
  errorMessage: string;
  successMessage: string;
  invalidLogin = false;
  loginSuccess = false;


  login() {
    this.subscriptions.push(
      this.loginService.login(this.username, this.password).subscribe({
        next: result => {
          this.invalidLogin = false;
          this.loginSuccess = true;
          this.successMessage = 'Login Successful.';
          this.loginService.registerSuccessfulLogin(result);
          this.router.navigate(['/new-task-list']).then();
        },
        error: err => {
          this.showErrorToast = true;
          this.errorMessage = err.error.text;
          this.invalidLogin = true;
          this.loginSuccess = false;
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loginService.logout();
  }
}
