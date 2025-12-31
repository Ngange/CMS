import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';

@Component({
  selector: 'app-article-create',
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.css']
})
export class ArticleCreateComponent {
  articleForm: FormGroup;
  isLoading = false;
  previewUrl: string | ArrayBuffer | null = null;
  uploadedImageUrl: string | null = null;
  isUploadingImage = false;
  successMessage = '';
  errorMessage = '';
  canPublish = false;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private authService: AuthService,
    private router: Router,
    private cloudinaryService: CloudinaryService
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      body: ['', [Validators.required, Validators.minLength(50)]],
      publishState: ['draft']
    });
    this.canPublish = this.authService.hasPermission('article', 'publish');
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      this.errorMessage = '';
      this.isUploadingImage = true;
      this.cloudinaryService.uploadImage(file).subscribe({
        next: (url) => {
          this.uploadedImageUrl = url;
          this.previewUrl = url;
          this.isUploadingImage = false;
        },
        error: (error) => {
          console.error('Failed to upload image:', error);
          this.errorMessage = 'Failed to upload image';
          this.isUploadingImage = false;
        },
      });
    }
  }

  removeImage(): void {
    this.previewUrl = null;
    this.uploadedImageUrl = null;
  }

  onSubmit(): void {
    if (this.articleForm.valid && !this.isUploadingImage) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const payload = {
        title: this.articleForm.get('title')?.value,
        body: this.articleForm.get('body')?.value,
        image: this.uploadedImageUrl,
      };

      this.articleService.createArticle(payload).subscribe({
        next: (article) => {
          const shouldPublish = this.canPublish && this.articleForm.get('publishState')?.value === 'published';
          const articleId = article?._id;

          if (shouldPublish && articleId) {
            this.articleService.publishArticle(articleId).subscribe({
              next: () => this.handleSuccess('Article published successfully'),
              error: (error) => this.handleError(error)
            });
          } else {
            this.handleSuccess('Article created successfully');
          }
        },
        error: (error) => this.handleError(error)
      });
    }
  }

  get isPublishSelected(): boolean {
    return this.canPublish && this.articleForm.get('publishState')?.value === 'published';
  }

  private handleSuccess(message: string): void {
    this.successMessage = message;
    this.isLoading = false;
    setTimeout(() => {
      this.router.navigate(['/articles']);
    }, 1500);
  }

  private handleError(error: any): void {
    console.error('Failed to create/publish article:', error);
    this.isLoading = false;
    this.errorMessage = error?.error?.message || 'Failed to create article';
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

  get titleCharCount(): number {
    return this.articleForm.get('title')?.value?.length || 0;
  }

  get bodyCharCount(): number {
    return this.articleForm.get('body')?.value?.length || 0;
  }
}
