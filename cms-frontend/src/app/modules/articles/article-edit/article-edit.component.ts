import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';
import { Article } from '../../../core/models/article.model';
import { getImageUrl } from '../../../shared/utils/image-url.util';

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
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.articleId = this.route.snapshot.params['id'];

    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      body: ['', [Validators.required, Validators.minLength(10)]],
      status: ['draft', Validators.required]
    });

    this.loadArticle();
  }

  loadArticle(): void {
    this.articleService.getArticleById(this.articleId).subscribe({
      next: (article) => {
        this.article = article;
        this.articleForm.patchValue({
          title: article.title,
          body: article.body,
          status: article.status
        });

        this.imagePreview = article.image ? getImageUrl(article.image) : null;
        this.isLoading = false;
        this.isLoaded = true;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load article';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.articleForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('title', this.articleForm.value.title.trim());
    formData.append('body', this.articleForm.value.body.trim());
    formData.append('status', this.articleForm.value.status);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.articleService.updateArticle(this.articleId, formData).subscribe({
      next: (article) => {
        this.successMessage = 'Article updated successfully';
        this.isLoading = false;
        this.router.navigate(['/articles']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update article';
        this.isSubmitting = false;
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/articles']);
  }

  get title() { return this.articleForm.get('title'); }
  get body() { return this.articleForm.get('body'); }
  get status() { return this.articleForm.get('status'); }

  get titleCharCount(): number {
    return this.articleForm?.get('title')?.value?.length || 0;
  }

  get bodyCharCount(): number {
    return this.articleForm?.get('body')?.value?.length || 0;
  }

  get previewUrl(): string | null {
    return this.imagePreview;
  }

  get selectedFileName(): string {
    return this.selectedFile?.name || '';
  }
}
