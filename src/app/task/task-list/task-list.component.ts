import {
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {CommonModule, DecimalPipe} from "@angular/common";
import {TaskService} from "../service/task.service";
import {Router, RouterLink} from "@angular/router";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgbHighlight, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {TaskListEntryDto} from "../task-list-entry-dto";
import {TaskListService} from "./task-list.service";
import {AddAssigneeComponent} from "../add-assignee/add-assignee.component";
import {IAddAssignee} from "../task.component";
import {LoginService} from "../../auth/login.service";

export interface ITaskRequest {
  state: string;
  assigned?: boolean;
}

export type SortColumn = keyof TaskListEntryDto | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = {asc: 'desc', desc: '', '': 'asc'};

const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  standalone: true,
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class NgbdSortableHeader {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}

@Component({
  standalone: true,
  selector: 'app-task-list',
  imports: [CommonModule, RouterLink, DecimalPipe, ReactiveFormsModule, NgbHighlight, NgbdSortableHeader, FormsModule, NgbPagination, AddAssigneeComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit, OnDestroy {

  private subscription$: Subscription[] = [];
  private taskService = inject(TaskService);
  private loginService = inject(LoginService);
  taskList: TaskListEntryDto[];
  taskList$: Observable<TaskListEntryDto[]>;
  total$: Observable<number>;
  filter = new FormControl('', {nonNullable: true});
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  @ViewChild('tableElement') tableElement: ElementRef;

  ngOnDestroy(): void {
    this.subscription$.forEach((s) => {
      s.unsubscribe();
    })
  }

  constructor(
    public service: TaskListService,
    public renderer: Renderer2,
    public elementRef: ElementRef,
    private router: Router,
    ) {}

  getTasks() {
    this.taskList$ = this.service.tasks$;
    this.total$ = this.service.total$;
  }

  getSubject() {
    this.service.notify.subscribe({
      next: data => {
        if (data) {
          // this.addNewTrElement(data)
        }
      }
    })
  }

  ngOnInit(): void {
    if (!this.loginService.isUserLoggedIn()) {
      this.router.navigate(['/login']).then();
    }
    this.getTasks();
    this.getSubject();
  }

  onSort({column, direction}: SortEvent) {
    // resetting other headers

    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;

  }

  reloadList(event: IAddAssignee) {
    console.log(event);
  }

  addNewTrElement(data: TaskListEntryDto) {
    let background = '#ffffff';
    let tr = this.renderer.createElement('tr');
    this.renderer.setAttribute(tr, 'id', 'new_tr');
    this.renderer.setStyle(tr, 'background', background);
    this.renderer.appendChild(this.tableElement.nativeElement, tr);
    let td_hash = this.renderer.createElement('td');
    this.renderer.setStyle(td_hash, 'background', background);
    let td_customer = this.renderer.createElement('td');
    this.renderer.setStyle(td_customer, 'background', background);
    let td_title = this.renderer.createElement('td');
    this.renderer.setStyle(td_title, 'background', background);
    let td_type = this.renderer.createElement('td');
    this.renderer.setStyle(td_type, 'background', background);
    let td_assignee = this.renderer.createElement('td');
    this.renderer.setStyle(td_assignee, 'background', background);
    let td_createdAt = this.renderer.createElement('td');
    this.renderer.setStyle(td_createdAt, 'background', background);
    let a = this.renderer.createElement('a');
    let linkText = this.renderer.createText(data.taskId);
    this.renderer.setAttribute(a, 'href', 'http://localhost:4200/tasks/' + data.taskId)
    this.renderer.appendChild(a, linkText);
    this.renderer.appendChild(td_hash, a);
    this.renderer.appendChild(tr, td_hash);
    this.renderer.appendChild(td_customer, this.renderer.createText(data.customerName));
    this.renderer.appendChild(tr, td_customer);
    this.renderer.appendChild(td_title, this.renderer.createText(data.title));
    this.renderer.appendChild(tr, td_title);
    this.renderer.appendChild(td_type, this.renderer.createText(data.type));
    this.renderer.appendChild(tr, td_type);
    this.renderer.appendChild(td_assignee, this.renderer.createText(data.assignee));
    this.renderer.appendChild(tr, td_assignee);
    this.renderer.appendChild(td_createdAt, this.renderer.createText(data.createdAt));
    this.renderer.appendChild(tr, td_createdAt);

  }

}
