import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Page, TaskDto} from "./task.model";
import {CompleteTaskEvent} from "../task/CompleteTaskEvent";

@Injectable({
  providedIn: 'root'
})
export class NewTaskService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/tasks';

    getTasksPaginated(
        tenantId: string,
        page: number = 0,
        size: number = 20,
        sortField: string = 'created',
        sortDirection: 'asc' | 'desc' = 'desc'
    ): Observable<Page<TaskDto>> {
        const params = new HttpParams()
            .set('tenantId', tenantId)
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', `${sortField},${sortDirection}`);

        return this.http.get<Page<TaskDto>>(`${this.apiUrl}/tenant_id/${tenantId}/paginated`, { params });
    }

    getTaskById(id: string): Observable<TaskDto> {
        return this.http.get<TaskDto>(`${this.apiUrl}/${id}`);
    }

    updateTask(id: string, updateRequest: Partial<TaskDto>): Observable<TaskDto> {
        return this.http.put<TaskDto>(`${this.apiUrl}/${id}`, updateRequest);
    }

    deleteTask(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    completeTask(id: string, completeTaskEvent: CompleteTaskEvent): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/complete`, completeTaskEvent);
    }

}
