import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  isLoadingRoles = true;
  errorMessage = '';
  private viewerRoleId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoadingRoles = true;
    this.authService.getSystemRoles().subscribe({
      next: (roles) => {
        console.log('Roles loaded:', roles);
        // Find and store VIEWER role ID
        const viewerRole = roles.find(role => role.name === 'Viewer');
        if (viewerRole) {
          this.viewerRoleId = viewerRole._id;
          console.log('Viewer role ID set to:', this.viewerRoleId);
        } else {
          console.error('Viewer role not found in roles');
          this.errorMessage = 'Viewer role not available. Please contact admin.';
        }
        this.isLoadingRoles = false;
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
        this.errorMessage = 'Failed to load system roles. Please refresh the page.';
        this.isLoadingRoles = false;
      }
    });
  }

  onSubmit(): void {
    console.log('Submit clicked - Form valid:', this.registerForm.valid, 'ViewerRoleId:', this.viewerRoleId);

    if (!this.registerForm.valid) {
      console.error('Form is invalid');
      return;
    }

    if (!this.viewerRoleId) {
      console.error('Viewer role ID not loaded');
      this.errorMessage = 'System roles not loaded. Please refresh the page.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registerData = {
      fullName: this.registerForm.get('fullName')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      roleId: this.viewerRoleId
    };

    console.log('Submitting registration with data:', registerData);

    this.authService.register(registerData).subscribe({
      next: () => {
        console.log('Registration successful');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.error?.message || 'Registration failed';
        this.isLoading = false;
      }
    });
  }
}
