import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';

@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.css']
})
export class ArticleCreateComponent {
  articleForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private router: Router
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      body: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onSubmit(): void {
    if (this.articleForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = new FormData();
      formData.append('title', this.articleForm.get('title')?.value);
      formData.append('body', this.articleForm.get('body')?.value);

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.articleService.createArticle(formData).subscribe({
        next: () => {
          this.successMessage = 'Article created successfully';
          setTimeout(() => {
            this.router.navigate(['/articles']);
          }, 1500);
        },
        error: (error) => {
          console.error('Failed to create article:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to create article';
        }
      });
    }
  }

  onCancel(): void {
    if (this.articleForm.dirty) {
      if (confirm('Are you sure you want to discard your changes?')) {
        this.router.navigate(['/articles']);
      }
    } else {
      this.router.navigate(['/articles']);
    }
  }

  get selectedFileName(): string {
    return this.selectedFile?.name || '';
  }

  get titleCharCount(): number {
    return this.articleForm.get('title')?.value?.length || 0;
  }

  get bodyCharCount(): number {
    return this.articleForm.get('body')?.value?.length || 0;
  }
}
