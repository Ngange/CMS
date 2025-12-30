import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './modules/public/login/login.component';
import { RegisterComponent } from './modules/public/register/register.component';
import { HomeComponent } from './modules/public/home/home.component';
import { DashboardComponent } from './modules/public/dashboard/dashboard.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { HasPermissionDirective } from './shared/directives/has-permission.directive';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { PermissionsComponent } from './modules/admin/permissions/permissions.component';
import { MatChipsModule } from '@angular/material/chips';
import { RolesComponent } from './modules/admin/roles/roles.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UsersComponent } from './modules/admin/users/users.component';
import { UserEditDialogComponent } from './modules/admin/users/user-edit-dialog/user-edit-dialog.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ArticleListComponent } from './modules/articles/article-list/article-list.component';
import { ArticleCreateComponent } from './modules/articles/article-create/article-create.component';
import { ArticleEditComponent } from './modules/articles/article-edit/article-edit.component';
import { ArticleViewComponent } from './modules/articles/article-view/article-view.component';
@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		RegisterComponent,
		HomeComponent,
		DashboardComponent,
		NavbarComponent,
		FooterComponent,
		UnauthorizedComponent,
		ProfileComponent,
		PermissionsComponent,
		RolesComponent,
		UsersComponent,
		UserEditDialogComponent,
		ConfirmDialogComponent,
		ArticleListComponent,
		ArticleCreateComponent,
		ArticleEditComponent,
		ArticleViewComponent,
		HasPermissionDirective
	],
	imports: [
		BrowserModule,
		CommonModule,
		BrowserAnimationsModule,
		HttpClientModule,
		ReactiveFormsModule,
		FormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatSelectModule,
		MatProgressSpinnerModule,
		MatIconModule,
		MatTableModule,
		MatPaginatorModule,
		MatSortModule,
		MatDialogModule,
		MatMenuModule,
		MatTooltipModule,
		MatChipsModule,
		MatCheckboxModule,
		MatButtonToggleModule,
		MatSnackBarModule,
		MatDividerModule,
		AppRoutingModule
	],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
