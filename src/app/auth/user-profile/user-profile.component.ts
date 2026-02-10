import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router, RouterLink} from '@angular/router';
import {LoginService} from '../login.service';
import {UserResponse} from '../user-response';
import {CustomerService} from '../../customer/customer.service';
import {Customer} from '../../customer/customer';
import {Insurance} from '../../insurance/insurance';
import {DatePipe} from '@angular/common';

interface InsuranceType {
    value: string;
    label: string;
    description: string;
}

@Component({
    selector: 'app-user-profile',
    imports: [RouterLink, DatePipe],
    templateUrl: './user-profile.component.html',
    styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
    private readonly loginService = inject(LoginService);
    private readonly customerService = inject(CustomerService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    readonly user = signal<UserResponse | null>(null);
    readonly customer = signal<Customer | null>(null);
    readonly loading = signal(false);
    readonly errorMessage = signal('');

    readonly insuranceTypes: InsuranceType[] = [
        {
            value: 'HOUSEHOLD_INSURANCE',
            label: 'Household Insurance',
            description: 'Protect your home and belongings against damage, theft, and natural disasters.'
        },
        {
            value: 'LIABILITY_INSURANCE',
            label: 'Liability Insurance',
            description: 'Coverage for personal liability claims and legal protection.'
        }
    ];

    readonly isLoggedIn = computed(() => this.user() !== null);
    readonly hasCustomerProfile = computed(() => this.customer() !== null);
    readonly customerInsurances = computed(() => this.customer()?.insurances ?? []);

    ngOnInit(): void {
        this.loadUserData();
    }

    private loadUserData(): void {
        const loggedInUser = this.loginService.getLoggedInUserName();
        if (loggedInUser) {
            this.user.set(loggedInUser);
            this.loadCustomerData(loggedInUser.email);
        } else {
            this.router.navigate(['/login']);
        }
    }

    private loadCustomerData(email: string): void {
        this.loading.set(true);
        this.customerService.getCustomers()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (customers) => {
                    const userCustomer = customers.find(c => c.email === email);
                    if (userCustomer) {
                        this.customer.set(userCustomer);
                    }
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                }
            });
    }

    requestInsurance(insuranceType: string): void {
        const customerId = this.customer()?.id;
        if (customerId) {
            this.router.navigate(['/request-insurance', customerId, insuranceType]);
        } else {
            this.router.navigate(['/create-customer'], {
                queryParams: {returnTo: 'profile', insuranceType}
            });
        }
    }

    logout(): void {
        this.loginService.logout();
    }

    getInsuranceStatusClass(state: string): string {
        switch (state?.toUpperCase()) {
            case 'ACTIVE':
                return 'bg-success';
            case 'PENDING':
                return 'bg-warning';
            case 'CANCELLED':
            case 'REJECTED':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }
}
