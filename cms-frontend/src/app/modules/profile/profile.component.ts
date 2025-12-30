import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ArticleService } from '../../core/services/article.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: User | null = null;
  isEditing = false;
  isLoading = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  passwordChangeMode = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private articleService: ArticleService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          fullName: user.fullName,
          email: user.email
        });
        // Use getImageUrl to resolve the profile photo path
        this.previewUrl = user.profilePhoto
          ? this.articleService.getImageUrl(user.profilePhoto)
          : null;
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.errorMessage = 'Failed to load profile';
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePhoto(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const formData = new FormData();
      formData.append('fullName', this.profileForm.get('fullName')?.value);
      formData.append('email', this.profileForm.get('email')?.value);

      if (this.selectedFile) {
        formData.append('profilePhoto', this.selectedFile);
      }

      this.authService.updateProfile(formData).subscribe({
        next: () => {
          this.isEditing = false;
          this.isLoading = false;
          this.successMessage = 'Profile updated successfully';
          this.selectedFile = null;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.isLoading = false;
          this.errorMessage = 'Failed to update profile';
        }
      });
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const passwordData = this.passwordForm.value;
      this.authService.changePassword(passwordData).subscribe({
        next: () => {
          this.passwordForm.reset();
          this.isLoading = false;
          this.passwordChangeMode = false;
          this.successMessage = 'Password changed successfully';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Failed to change password:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to change password';
        }
      });
    }
  }

  togglePasswordChangeMode(): void {
    this.passwordChangeMode = !this.passwordChangeMode;
    if (!this.passwordChangeMode) {
      this.passwordForm.reset();
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedFile = null;
    this.loadUserProfile();
  }
}
