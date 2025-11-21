import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SidebarComponent} from "./layout/layout/layout/sidebar/sidebar.component";
import {HeaderComponent} from "./layout/layout/layout/header/header.component";
import {HomeComponent} from './home/home.component';
import {DecimalPipe, NgOptimizedImage} from "@angular/common";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {WorkflowListComponent} from './workflow/workflow-list/workflow-list.component';
import {AuthInterceptor} from "./auth/auth-interceptor.service";
import {ErrorInterceptor} from "./shared/error.interceptor";
import {BpmnComponent} from "./workflow/bpmn/bpmn.component";
import {AvatarComponent} from "./shared/avatar/avatar.component";

@NgModule({ declarations: [
        AppComponent,
        SidebarComponent,
        HeaderComponent,
        HomeComponent,
        WorkflowListComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        NgOptimizedImage,
        BpmnComponent,
        AvatarComponent], providers: [DecimalPipe,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {
}
