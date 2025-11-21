import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {UserResponse} from "./user-response";
import { HttpClient } from "@angular/common/http";
import {UserRegistrationRequest} from "./user-registration-request";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private baseUrl = environment.api_url + '/api/auth';

    registerUser(request: UserRegistrationRequest): Observable<UserResponse> {
        return this.http.post<UserResponse>(`${this.baseUrl}/register`, request);
    }

    verifyEmail(token: string): Observable<Map<string, string>> {
        return this.http.get<Map<string, string>>(`${this.baseUrl}/verify-email`, {
            params: {token}
        });
    }

    resendVerification(email: string): Observable<Map<string, string>> {
        return this.http.post<Map<string, string>>(`${this.baseUrl}/resend-verification`, null, {
            params: {email}
        });
    }

}
