import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import {Observable} from "rxjs";
import {inject, Injectable} from "@angular/core";
import {LoginService} from "./login.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private loginService = inject(LoginService);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = sessionStorage.getItem('token');
        if (token) {
            req = req.clone({
                setHeaders: {Authorization: `Bearer ${token}`}
            });
            return next.handle(req);
        } else {
            this.loginService.logout();
            return next.handle(req);
        }
    }

}

