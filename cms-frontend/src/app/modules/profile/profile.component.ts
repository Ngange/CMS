import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ArticleService } from '../../core/services/article.service';
import { CloudinaryService } from '../../core/services/cloudinary.service';
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
  previewUrl: string | ArrayBuffer | null = null;
  uploadedImageUrl: string | null = null;
  isUploadingImage = false;
  passwordChangeMode = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private articleService: ArticleService,
    private cloudinaryService: CloudinaryService
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
        this.uploadedImageUrl = user.profilePhoto || null;
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
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      this.isUploadingImage = true;
      this.cloudinaryService.uploadImage(file).subscribe({
        next: (url) => {
          this.uploadedImageUrl = url;
          this.previewUrl = url;
          this.isUploadingImage = false;
        },
        error: (error) => {
          console.error('Failed to upload profile photo:', error);
          this.errorMessage = 'Failed to upload profile photo';
          this.isUploadingImage = false;
        },
      });
    }
  }

  removeProfilePhoto(): void {
    this.previewUrl = null;
    this.uploadedImageUrl = null;
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid && !this.isUploadingImage) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const payload = {
        fullName: this.profileForm.get('fullName')?.value,
        email: this.profileForm.get('email')?.value,
        profilePhoto: this.uploadedImageUrl,
      };

      this.authService.updateProfile(payload).subscribe({
        next: () => {
          this.isEditing = false;
          this.isLoading = false;
          this.successMessage = 'Profile updated successfully';
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
    this.loadUserProfile();
  }
}
