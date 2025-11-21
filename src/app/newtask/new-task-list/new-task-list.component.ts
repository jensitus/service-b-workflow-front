import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NewTaskService} from "../new-task.service";
import {TaskDto} from "../task.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-new-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-task-list.component.html',
  styleUrl: './new-task-list.component.scss'
})
export class NewTaskListComponent implements OnInit {

    private newTaskService = inject(NewTaskService);
    private router = inject(Router);

    // Signals for reactive state management
    tasks = signal<TaskDto[]>([]);
    tenantId = signal<string>('');
    currentPage = signal<number>(0);
    pageSize = signal<number>(10);
    totalElements = signal<number>(0);
    totalPages = signal<number>(0);
    sortField = signal<string>('created');
    sortDirection = signal<'asc' | 'desc'>('desc');
    loading = signal<boolean>(false);
    error = signal<string | null>(null);

    // Computed values
    hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);
    hasPreviousPage = computed(() => this.currentPage() > 0);
    startIndex = computed(() => this.currentPage() * this.pageSize() + 1);
    endIndex = computed(() =>
        Math.min((this.currentPage() + 1) * this.pageSize(), this.totalElements())
    );

    ngOnInit(): void {
        // Set default tenant ID or get from route/service
        this.tenantId.set('insurance');
        this.loadTasks();
    }

    loadTasks(): void {
        if (!this.tenantId()) {
            this.error.set('Please enter a tenant ID');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        this.newTaskService.getTasksPaginated(
            this.tenantId(),
            this.currentPage(),
            this.pageSize(),
            this.sortField(),
            this.sortDirection()
        ).subscribe({
            next: (page) => {
                this.tasks.set(page.content);
                this.totalElements.set(page.totalElements);
                this.totalPages.set(page.totalPages);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load tasks: ' + err.message);
                this.loading.set(false);
                console.error('Error loading tasks:', err);
            }
        });
    }

    onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadTasks();
    }

    onPageSizeChange(size: number): void {
        this.pageSize.set(size);
        this.currentPage.set(0); // Reset to first page
        this.loadTasks();
    }

    onSort(field: string): void {
        if (this.sortField() === field) {
            // Toggle direction if same field
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to desc
            this.sortField.set(field);
            this.sortDirection.set('desc');
        }
        this.currentPage.set(0); // Reset to first page
        this.loadTasks();
    }

    onTenantIdChange(newTenantId: string): void {
        this.tenantId.set(newTenantId);
        this.currentPage.set(0);
        this.loadTasks();
    }

    nextPage(): void {
        if (this.hasNextPage()) {
            this.onPageChange(this.currentPage() + 1);
        }
    }

    previousPage(): void {
        if (this.hasPreviousPage()) {
            this.onPageChange(this.currentPage() - 1);
        }
    }

    getSortIcon(field: string): string {
        if (this.sortField() !== field) return '↕';
        return this.sortDirection() === 'asc' ? '↑' : '↓';
    }

    viewTask(task_id) {
        this.router.navigate(['/tasks', task_id]);
    }

    editTask(task_id) {

    }

    deleteTask(task, event) {

    }

}
