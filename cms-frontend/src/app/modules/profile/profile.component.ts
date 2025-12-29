import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
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
        this.previewUrl = user.profilePhoto || null;
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

  onUpdateProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;

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
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;

      const passwordData = this.passwordForm.value;
      this.authService.changePassword(passwordData).subscribe({
        next: () => {
          this.passwordForm.reset();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
