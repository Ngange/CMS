import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';
import { Article } from '../../../core/models/article.model';

@Component({
  selector: 'app-article-view',
  templateUrl: './article-view.component.html',
  styleUrls: ['./article-view.component.css']
})
export class ArticleViewComponent implements OnInit {
  article: Article | null = null;
  isLoading = true;
  errorMessage = '';
  canEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Ensure view starts at the top when opening an article
    window.scrollTo({ top: 0, behavior: 'auto' });

    const articleId = this.route.snapshot.params['id'];
    this.loadArticle(articleId);
  }

  loadArticle(id: string): void {
    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        this.article = article;
        this.checkEditPermission();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Article not found';
        this.isLoading = false;
      }
    });
  }

  checkEditPermission(): void {
    if (!this.article) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Can edit if has permission and (is author or has article:update permission)
    const hasUpdatePermission = this.authService.hasPermission('article', 'update');
    const isAuthor = this.article.author._id === currentUser._id;

    this.canEdit = hasUpdatePermission && (isAuthor || this.isAdminOrManager());
  }

  isAdminOrManager(): boolean {
    const currentUser = this.authService.getCurrentUser();
    const roleName = currentUser?.role?.name;
    return roleName === 'SuperAdmin' || roleName === 'Manager';
  }

  editArticle(): void {
    if (this.article && this.canEdit) {
      this.router.navigate(['/articles/edit', this.article._id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/articles']);
  }

  getImageUrl(imagePath: string | null): string | null {
    return this.articleService.getImageUrl(imagePath);
  }
}
