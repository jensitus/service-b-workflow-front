import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {TaskComponent} from "./task/task.component";
import {WorkflowComponent} from "./workflow/workflow.component";
import {TaskListComponent} from "./task/task-list/task-list.component";
import {WorkflowListComponent} from "./workflow/workflow-list/workflow-list.component";
import {CreateCustomerComponent} from "./customer/create-customer/create-customer.component";
import {CustomerListComponent} from "./customer/customer-list/customer-list.component";
import {CustomerComponent} from "./customer/customer/customer.component";
import {RequestInsuranceComponent} from "./insurance/request-insurance/request-insurance.component";
import {SseComponent} from "./course/sse/sse.component";
import {LoginComponent} from "./auth/login/login.component";
import {NewTaskListComponent} from "./newtask/new-task-list/new-task-list.component";
import {TaskDetailComponent} from "./newtask/task-detail/task-detail.component";
import {RegisterComponent} from "./auth/register/register.component";
import {VerifyEmailComponent} from "./auth/verify-email/verify-email.component";

const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'home', component: HomeComponent},
    {path: 'task-list', component: TaskListComponent},
    {path: 'new-task-list', component: NewTaskListComponent},
    {path: 'tasks/:id', component: TaskDetailComponent},
    {path: 'workflow-list', component: WorkflowListComponent},
    {path: 'workflow/:id/:version', component: WorkflowComponent},
    {path: 'tasks/:id', component: TaskComponent},
    {path: 'create-customer', component: CreateCustomerComponent},
    {path: 'customers', component: CustomerListComponent},
    {path: 'customers/:id', component: CustomerComponent},
    {path: 'request-insurance/:customerId/:insuranceType', component: RequestInsuranceComponent},
    {path: 'sse', component: SseComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'verify-email', component: VerifyEmailComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
