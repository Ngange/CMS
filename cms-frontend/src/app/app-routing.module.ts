import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/public/login/login.component';
import { RegisterComponent } from './modules/public/register/register.component';
import { HomeComponent } from './modules/public/home/home.component';
import { DashboardComponent } from './modules/public/dashboard/dashboard.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PermissionsComponent } from './modules/admin/permissions/permissions.component';
import { PermissionGuard } from './core/guards/permission.guard';
import { RolesComponent } from './modules/admin/roles/roles.component';
import { UsersComponent } from './modules/admin/users/users.component';
import { ArticleListComponent } from './modules/articles/article-list/article-list.component';
import { ArticleCreateComponent } from './modules/articles/article-create/article-create.component';
import { ArticleEditComponent } from './modules/articles/article-edit/article-edit.component';
import { ArticleViewComponent } from './modules/articles/article-view/article-view.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'articles', component: ArticleListComponent, canActivate: [AuthGuard, PermissionGuard], data: { resource: 'article', action: 'read' } },
  { path: 'articles/create', component: ArticleCreateComponent, canActivate: [AuthGuard, PermissionGuard], data: { resource: 'article', action: 'create' } },
  { path: 'articles/view/:id', component: ArticleViewComponent, canActivate: [AuthGuard] },
  { path: 'articles/edit/:id', component: ArticleEditComponent, canActivate: [AuthGuard, PermissionGuard], data: { resource: 'article', action: 'update' } },
  { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'admin/permissions', component: PermissionsComponent, canActivate: [AuthGuard, PermissionGuard], data: { resource: 'role', action: 'read' } },
  { path: 'admin/roles', component: RolesComponent, canActivate: [AuthGuard, PermissionGuard], data: { resource: 'role', action: 'read' } },
  { path: 'admin/users', component: UsersComponent, canActivate: [AuthGuard, PermissionGuard], data: { resource: 'user', action: 'read' } },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
