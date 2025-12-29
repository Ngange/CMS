import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { PermissionGuard } from './core/guards/permission.guard';

// Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

// Components
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { HomeComponent } from './modules/public/home/home.component';
import { LoginComponent } from './modules/public/login/login.component';
import { RegisterComponent } from './modules/public/register/register.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { ArticleListComponent } from './modules/articles/article-list/article-list.component';
import { ArticleCreateComponent } from './modules/articles/article-create/article-create.component';
import { ArticleEditComponent } from './modules/articles/article-edit/article-edit.component';
import { UsersComponent } from './modules/admin/users/users.component';
import { RolesComponent } from './modules/admin/roles/roles.component';
import { PermissionsComponent } from './modules/admin/permissions/permissions.component';

// Directives
import { HasPermissionDirective } from './shared/directives/has-permission.directive';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'articles',
    component: ArticleListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'articles/create',
    component: ArticleCreateComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { resource: 'article', action: 'create' }
  },
  {
    path: 'articles/edit/:id',
    component: ArticleEditComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { resource: 'article', action: 'update' }
  },

  // Admin routes
  {
    path: 'admin/users',
    component: UsersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'SuperAdmin' }
  },
  {
    path: 'admin/roles',
    component: RolesComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { resource: 'role', action: 'read' }
  },
  {
    path: 'admin/permissions',
    component: PermissionsComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { resource: 'role', action: 'read' }
  },

  // Error pages
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    UnauthorizedComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    ProfileComponent,
    ArticleListComponent,
    ArticleCreateComponent,
    ArticleEditComponent,
    UsersComponent,
    RolesComponent,
    PermissionsComponent,
    HasPermissionDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),

    // Angular Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTableModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatExpansionModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatSortModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AuthGuard,
    RoleGuard,
    PermissionGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
