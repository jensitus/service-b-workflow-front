import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router, RouterLink} from '@angular/router';
import {LoginService} from '../login.service';
import {UserResponse} from '../user-response';
import {CustomerService} from '../../customer/customer.service';
import {Customer} from '../../customer/customer';
import {Insurance} from '../../insurance/insurance';
import {DatePipe} from '@angular/common';
import {WorkflowService} from '../../workflow/service/workflow.service';
import {Workflow} from '../../workflow/model/workflow';
import {BpmnViewerComponent} from '../../newtask/bpmn-viewer/bpmn-viewer.component';
import {NewTaskService} from '../../newtask/new-task.service';
import {TaskDto} from '../../newtask/task.model';
import {forkJoin, Observable} from 'rxjs';
import {SseService} from '../../course/sse/sse.service';

interface InsuranceType {
    value: string;
    label: string;
    description: string;
}

@Component({
    selector: 'app-user-profile',
    imports: [RouterLink, DatePipe, BpmnViewerComponent],
    templateUrl: './user-profile.component.html',
    styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
    private readonly loginService = inject(LoginService);
    private readonly customerService = inject(CustomerService);
    private readonly workflowService = inject(WorkflowService);
    private readonly taskService = inject(NewTaskService);
    private readonly sseService = inject(SseService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    readonly user = signal<UserResponse | null>(null);
    readonly customer = signal<Customer | null>(null);
    readonly loading = signal(false);
    readonly errorMessage = signal('');
    readonly activeProcessInstances = signal<Workflow[]>([]);
    readonly insuranceTaskMap = signal<Map<string, TaskDto>>(new Map());

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
    readonly selectedProcessId = signal<string | null>(null);
    readonly activeProcessInstanceIds = computed(() => this.activeProcessInstances().map(w => w.id));
    readonly displayedProcessInstanceIds = computed(() => {
        const sel = this.selectedProcessId();
        return sel ? [sel] : this.activeProcessInstanceIds();
    });

    readonly highlightedInsuranceId = computed(() => {
        const sel = this.selectedProcessId();
        if (!sel) return null;
        for (const [insuranceId, task] of this.insuranceTaskMap()) {
            if (task.processInstanceId === sel) return insuranceId;
        }
        return null;
    });

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
                        if (userCustomer.id) {
                            this.loadActiveProcesses(userCustomer.id);
                        }
                        if (userCustomer.insurances?.length) {
                            this.loadInsuranceTasks(userCustomer.insurances);
                        }
                        this.subscribeToInsuranceEvents();
                    }
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                }
            });
    }

    private subscribeToInsuranceEvents(): void {
        this.sseService.createInsuranceEventSource('http://localhost:8080/server-send-insurance')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (updatedInsurance) => this.handleInsuranceUpdate(updatedInsurance)
            });
    }

    private handleInsuranceUpdate(updatedInsurance: Insurance): void {
        const customer = this.customer();
        if (!customer?.insurances) return;

        const idx = customer.insurances.findIndex(i => i.id === updatedInsurance.id);
        if (idx === -1) return;

        const updatedInsurances = [...customer.insurances];
        updatedInsurances[idx] = {...updatedInsurances[idx], ...updatedInsurance};
        this.customer.set({...customer, insurances: updatedInsurances});

        this.taskService.getTasksByInsuranceId(updatedInsurance.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (tasks) => {
                    const map = new Map(this.insuranceTaskMap());
                    if (tasks.length > 0) {
                        map.set(updatedInsurance.id, tasks[0]);
                    } else {
                        map.delete(updatedInsurance.id);
                    }
                    this.insuranceTaskMap.set(map);
                }
            });

        const terminalStates = ['CANCELLED', 'REJECTED', 'APPROVED', 'COMPLETED'];
        if (terminalStates.includes(updatedInsurance.state?.toUpperCase())) {
            if (customer.id) {
                this.loadActiveProcesses(customer.id);
            }
        }
    }

    private loadInsuranceTasks(insurances: Insurance[]): void {
        const requests = insurances.reduce((acc, ins) => {
            if (ins.id) acc[ins.id] = this.taskService.getTasksByInsuranceId(ins.id);
            return acc;
        }, {} as Record<string, Observable<TaskDto[]>>);

        forkJoin(requests)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (results) => {
                    const map = new Map<string, TaskDto>();
                    for (const [insuranceId, tasks] of Object.entries(results)) {
                        if (tasks.length > 0) {
                            map.set(insuranceId, tasks[0]);
                        }
                    }
                    this.insuranceTaskMap.set(map);
                },
                error: () => { /* silently ignore */ }
            });
    }

    private loadActiveProcesses(customerId: string): void {
        const customerDigits = customerId.replace(/[^0-9]/g, '');
        this.workflowService.getWorkflowListByKey('insurance_showcase')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (workflows) => {
                    const matches = workflows.filter(w => w.businessKey === customerDigits);
                    this.activeProcessInstances.set(matches);
                },
                error: () => {
                    // silently ignore if workflow service is unavailable
                }
            });
    }

    selectProcess(id: string | null): void {
        this.selectedProcessId.set(id);
    }

    requestInsurance(insuranceType: string): void {
        const customerId = this.customer()?.id;
        if (customerId) {
            this.router.navigate(['/request-insurance', customerId, insuranceType]);
        } else {
            this.router.navigate(['/complete-profile']);
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
