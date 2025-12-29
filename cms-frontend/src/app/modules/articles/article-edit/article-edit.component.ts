import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { Article } from '../../../core/models/article.model';

@Component({
  selector: 'app-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css']
})
export class ArticleEditComponent implements OnInit {
  articleForm: FormGroup;
  articleId: string = '';
  article: Article | null = null;
  isLoading = false;
  isLoaded = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      body: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  ngOnInit(): void {
    this.articleId = this.route.snapshot.paramMap.get('id') || '';
    this.loadArticle();
  }

  loadArticle(): void {
    this.isLoading = true;
    this.articleService.getArticleById(this.articleId).subscribe({
      next: (article) => {
        this.article = article;
        this.articleForm.patchValue({
          title: article.title,
          body: article.body
        });
        this.previewUrl = article.image || null;
        this.isLoading = false;
        this.isLoaded = true;
      },
      error: () => {
        this.isLoading = false;
        this.isLoaded = true;
        this.router.navigate(['/articles']);
      }
    });
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

  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onSubmit(): void {
    if (this.articleForm.valid && this.article) {
      this.isLoading = true;

      const formData = new FormData();
      formData.append('title', this.articleForm.get('title')?.value);
      formData.append('body', this.articleForm.get('body')?.value);

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.articleService.updateArticle(this.articleId, formData).subscribe({
        next: () => {
          this.router.navigate(['/articles']);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/articles']);
  }

  get selectedFileName(): string {
    return this.selectedFile?.name || '';
  }
}
