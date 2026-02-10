import {Component, inject, OnInit} from '@angular/core';
import {UserResponse} from "../../../../auth/user-response";
import {LoginService} from "../../../../auth/login.service";
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {AvatarComponent} from "../../../../shared/avatar/avatar.component";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    imports: [
        AvatarComponent,
        RouterLink
    ],
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser: UserResponse | undefined;
    public pushRightClass: string;

  private loginService = inject(LoginService);
  private router = inject(Router);

    constructor() {
        this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 992 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });
    }

    ngOnInit(): void {
        this.pushRightClass = 'push-right';
        this.currentUser = this.loginService.getLoggedInUserName();

    }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    getCurrentUser() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

}
