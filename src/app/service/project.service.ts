import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment._apiUrl}/projects`;

  constructor(private http: HttpClient) { }

  getAllProjects(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list`);
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  saveProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  deleteProject(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }
} 