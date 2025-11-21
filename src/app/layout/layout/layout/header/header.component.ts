import {Component, inject, OnInit} from '@angular/core';
import {faBars, faGear, faLaptop} from '@fortawesome/free-solid-svg-icons';
import {faRightFromBracket} from "@fortawesome/free-solid-svg-icons/faRightFromBracket";
import {UserResponse} from "../../../../auth/user-response";
import {LoginService} from "../../../../auth/login.service";
import {NavigationEnd, Router} from "@angular/router";

@Component({
             selector: 'app-header',
             templateUrl: './header.component.html',
             styleUrls: ['./header.component.scss']
           })
export class HeaderComponent implements OnInit {
  faLaptop = faLaptop;
  faBars = faBars;
  faBracket = faRightFromBracket;
  faGear = faGear;
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
