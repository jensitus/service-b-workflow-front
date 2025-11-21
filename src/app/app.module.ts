import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {DecimalPipe, NgOptimizedImage} from "@angular/common";
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {AuthInterceptor} from "./auth/auth-interceptor.service";
import {ErrorInterceptor} from "./shared/error.interceptor";
import {BpmnComponent} from "./workflow/bpmn/bpmn.component";
import {AvatarComponent} from "./shared/avatar/avatar.component";

@NgModule({ declarations: [

    ],
    bootstrap: [], imports: [BrowserModule,
        AppRoutingModule,
        NgOptimizedImage,
        BpmnComponent,
        AvatarComponent], providers: [DecimalPipe,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {
}
