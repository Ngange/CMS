import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';
import { Article } from '../../../core/models/article.model';
import { getImageUrl } from '../../../shared/utils/image-url.util';
import { CloudinaryService } from '../../../core/services/cloudinary.service';

@Component({
  selector: 'app-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css']
})
export class ArticleEditComponent implements OnInit {
  articleForm!: FormGroup;
  articleId: string = '';
  article: Article | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  isLoaded = false;
  imagePreview: string | null = null;
  uploadedImageUrl: string | null = null;
  isUploadingImage = false;
  imageRemoved = false;
  canPublish = false;
  previousStatus: 'draft' | 'published' = 'draft';

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cloudinaryService: CloudinaryService
  ) {}

  ngOnInit(): void {
    this.articleId = this.route.snapshot.params['id'];
    this.canPublish = this.authService.hasPermission('article', 'publish');

    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      body: ['', [Validators.required, Validators.minLength(50)]],
      status: ['draft', Validators.required]
    });

    this.loadArticle();
  }

  loadArticle(): void {
    this.articleService.getArticleById(this.articleId).subscribe({
      next: (article) => {
        this.article = article;
        this.previousStatus = article.status;
        this.articleForm.patchValue({
          title: article.title,
          body: article.body,
          status: article.status
        });

        this.imagePreview = article.image ? getImageUrl(article.image) : null;
        this.uploadedImageUrl = article.image || null;
        this.isLoading = false;
        this.isLoaded = true;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load article';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      this.isUploadingImage = true;
      this.imageRemoved = false;
      this.cloudinaryService.uploadImage(file).subscribe({
        next: (url) => {
          this.uploadedImageUrl = url;
          this.imagePreview = url;
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
    this.imagePreview = null;
    this.uploadedImageUrl = null;
    this.imageRemoved = true;
  }

  onSubmit(): void {
    if (this.articleForm.invalid || this.isSubmitting || this.isUploadingImage) {
      return;
    }

    this.isSubmitting = true;
    this.isLoading = true;
    this.errorMessage = '';

    const desiredStatus: 'draft' | 'published' = this.canPublish
      ? this.articleForm.value.status
      : this.previousStatus;

    const payload = {
      title: this.articleForm.value.title.trim(),
      body: this.articleForm.value.body.trim(),
      status: desiredStatus,
      image: this.imageRemoved ? null : this.uploadedImageUrl,
    };

    this.articleService.updateArticle(this.articleId, payload).subscribe({
      next: (article) => {
        if (this.canPublish) {
          const articleId = article?._id || this.articleId;

          if (desiredStatus === 'published') {
            this.articleService.publishArticle(articleId).subscribe({
              next: () => this.handleSuccess('Article published successfully'),
              error: (error) => this.handleError(error)
            });
          } else {
            this.articleService.unpublishArticle(articleId).subscribe({
              next: () => this.handleSuccess('Article saved as draft'),
              error: (error) => this.handleError(error)
            });
          }
        } else {
          this.handleSuccess('Article updated successfully');
        }
      },
      error: (error) => this.handleError(error)
    });
  }

  onCancel(): void {
    this.router.navigate(['/articles']);
  }

  get title() { return this.articleForm.get('title'); }
  get body() { return this.articleForm.get('body'); }
  get status() { return this.articleForm.get('status'); }

  get isPublishSelected(): boolean {
    return this.canPublish && this.articleForm.get('status')?.value === 'published';
  }

  get titleCharCount(): number {
    return this.articleForm?.get('title')?.value?.length || 0;
  }

  get bodyCharCount(): number {
    return this.articleForm?.get('body')?.value?.length || 0;
  }

  get previewUrl(): string | null {
    return this.imagePreview;
  }

  private handleSuccess(message: string): void {
    this.successMessage = message;
    this.isSubmitting = false;
    this.isLoading = false;
    setTimeout(() => {
      this.router.navigate(['/articles']);
    }, 1000);
  }

  private handleError(error: any): void {
    console.error('Failed to update article:', error);
    this.errorMessage = error?.error?.message || 'Failed to update article';
    this.isSubmitting = false;
    this.isLoading = false;
  }
}
