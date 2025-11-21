import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {WorkflowService} from "./service/workflow.service";
import {of, Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {Workflow} from "./model/workflow";
import {Variable} from "./model/variable";
import {NgbNavModule} from "@ng-bootstrap/ng-bootstrap";
import {BpmnComponent} from "./bpmn/bpmn.component";
import {RequestedContractsComponent} from "../insurance/requested-contracts/requested-contracts.component";
import {JsonPipe, SlicePipe} from "@angular/common";
import {BpmnDefinitionViewerComponent} from "../newtask/bpmn-definition-viewer/bpmn-definition-viewer.component";

export interface RideBookedParameters {
    pickupLocation: object;
    pickupTime: string;
    targetLocation: object;
}

@Component({
    selector: 'app-workflow',
    standalone: true,
    templateUrl: './workflow.component.html',
    imports: [NgbNavModule, BpmnComponent, RequestedContractsComponent, JsonPipe, SlicePipe, BpmnDefinitionViewerComponent],
    styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
    private workflowService = inject(WorkflowService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);

    workflow: Workflow;
    variables: Variable[];
    workflowId: string;
    version: string;

    ngOnInit(): void {
        this.workflowId = this.activatedRoute.snapshot.paramMap.get('id');
        this.version = this.activatedRoute.snapshot.paramMap.get('version');
    }

    protected readonly of = of;
    active = 1;
}
