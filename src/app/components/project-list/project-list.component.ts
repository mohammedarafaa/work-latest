import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../service/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  error: string | null = null;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = null;
    
    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load projects. Please try again later.';
        this.loading = false;
        console.error('Error loading projects:', err);
      }
    });
  }

  deleteProject(id: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => {
          this.projects = this.projects.filter(project => project.code !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete project. Please try again later.';
          console.error('Error deleting project:', err);
        }
      });
    }
  }
} 