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
  roles: Role[] = [];
  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleId: ['', Validators.required],
      profilePhoto: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        // Filter out SuperAdmin role for registration
        this.roles = roles.filter(role => role.name !== 'SuperAdmin');
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = new FormData();
      formData.append('fullName', this.registerForm.get('fullName')?.value);
      formData.append('email', this.registerForm.get('email')?.value);
      formData.append('password', this.registerForm.get('password')?.value);
      formData.append('roleId', this.registerForm.get('roleId')?.value);

      if (this.selectedFile) {
        formData.append('profilePhoto', this.selectedFile);
      }

      this.authService.register(formData).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Registration failed';
          this.isLoading = false;
        }
      });
    }
  }
}
