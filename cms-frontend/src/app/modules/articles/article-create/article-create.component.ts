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
    if (this.articleForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      formData.append('title', this.articleForm.get('title')?.value);
      formData.append('body', this.articleForm.get('body')?.value);

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.articleService.createArticle(formData).subscribe({
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
}
