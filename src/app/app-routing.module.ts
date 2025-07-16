import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@service/_helpers/auth.guard';
// import { AuthGuard } from '@service/_helpers/auth.guard';
// import { ProjectListComponent } from './components/project-list/project-list.component';
// import { ProjectFormComponent } from './components/project-form/project-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },

  {
    path: '',
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
  },
  { path: 'Auth', loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule) },
  // { path: 'projects', component: ProjectListComponent },
  // { path: 'projects/new', component: ProjectFormComponent },
  // { path: 'projects/:id', component: ProjectFormComponent },
  {
    path: "**",
    redirectTo: "/Error/404"
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
