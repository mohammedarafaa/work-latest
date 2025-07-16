import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../service/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEditMode = false;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      image: ['', Validators.required],
      area: this.fb.group({
        nameAr: ['', Validators.required],
        name: ['', Validators.required],
        code: [null, Validators.required]
      }),
      zone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.isEditMode = true;
      this.loadProject(Number(projectId));
    }
  }

  loadProject(id: number): void {
    this.loading = true;
    this.projectService.getProject(id).subscribe({
      next: (project) => {
        this.projectForm.patchValue(project);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load project. Please try again later.';
        this.loading = false;
        console.error('Error loading project:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.loading = true;
      const project: Project = this.projectForm.value;

      const request = this.isEditMode
        ? this.projectService.saveProject(project)
        : this.projectService.saveProject(project);

      request.subscribe({
        next: () => {
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          this.error = 'Failed to save project. Please try again later.';
          this.loading = false;
          console.error('Error saving project:', err);
        }
      });
    }
  }
} 