import {Component, computed, EventEmitter, inject, Output} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {LoginService} from "../../../../auth/login.service";
import {NgClass} from "@angular/common";

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    imports: [
        RouterLink,
        RouterLinkActive,
    ],
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  pushRightClass: string | undefined;
  collapsed: boolean | undefined;
  showMenu: string | undefined;
  isActive: boolean | undefined;
  @Output() collapsedEvent = new EventEmitter<boolean>();
  private loginService = inject(LoginService);

  readonly isLoggedIn = computed(() => this.loginService.currentUser() !== null);

  constructor(public router: Router) {
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

  isToggled(): boolean {
    // @ts-ignore
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(<string>this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    this.collapsedEvent.emit(this.collapsed);
  }

  addExpandClass(element: string) {
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']).then();
  }
}
