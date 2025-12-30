import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../core/models/user.model';
import { Role } from '../../../../core/models/role.model';
import { ArticleService } from '../../../../core/services/article.service';

@Component({
  selector: 'app-user-edit-dialog',
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.css']
})
export class UserEditDialogComponent {
  editForm: FormGroup;
  passwordForm: FormGroup;
  roles: Role[] = [];
  profilePhotoPreview: string | null = null;
  selectedFile: File | null = null;
  showPasswordReset = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User; roles: Role[] }
  ) {
    this.roles = data.roles;
    // Use getImageUrl to resolve the profile photo path
    this.profilePhotoPreview = data.user.profilePhoto
      ? this.articleService.getImageUrl(data.user.profilePhoto)
      : null;
    this.editForm = this.fb.group({
      fullName: [data.user.fullName, [Validators.required, Validators.minLength(3)]],
      email: [data.user.email, [Validators.required, Validators.email]],
      role: [data.user.role._id, Validators.required]
    });
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePhotoPreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  togglePasswordReset(): void {
    this.showPasswordReset = !this.showPasswordReset;
    if (!this.showPasswordReset) {
      this.passwordForm.reset();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const formData = new FormData();
      formData.append('fullName', this.editForm.get('fullName')?.value);
      formData.append('email', this.editForm.get('email')?.value);
      formData.append('role', this.editForm.get('role')?.value);

      if (this.selectedFile) {
        formData.append('profilePhoto', this.selectedFile);
      }

      if (this.showPasswordReset && this.passwordForm.valid) {
        formData.append('password', this.passwordForm.get('password')?.value);
      }

      this.dialogRef.close(formData);
    }
  }
}
