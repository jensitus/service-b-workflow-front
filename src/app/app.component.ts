import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {SideLayoutService} from "./shared/side-layout.service";
import {filter, Subscription} from "rxjs";
import {NavigationEnd, Router} from "@angular/router";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    private sideLayoutService = inject(SideLayoutService);
    private router = inject(Router);

    title = 'insurance-showcase';
    collapedSideBar: boolean = false;
    showSidebar = true;
    showHeader = true;
    subscription: Subscription;
    private routerSubscription: Subscription;

    private noSidebarRoutes = ['/login', '/register', '/verify-email'];

    ngOnInit(): void {
        this.subscription = this.sideLayoutService.sidebar$.subscribe(() => {
            this.showSidebar = !this.showSidebar;
        });
        this.routerSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                // Check if current route should hide sidebar
                this.showSidebar = !this.noSidebarRoutes.some(route =>
                    event.urlAfterRedirects.startsWith(route));
            });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
        }
    }

    receiveCollapsed($event: boolean) {
        this.collapedSideBar = $event;
    }

    toggleSidebar() {
        this.showSidebar = !this.showSidebar;
    }

}
