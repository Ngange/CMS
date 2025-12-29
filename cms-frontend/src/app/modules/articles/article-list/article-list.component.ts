import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ArticleService } from '../../../core/services/article.service';
import { Article } from '../../../core/models/article.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css']
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  currentUser: User | null = null;
  isLoading = true;
  statusFilter = 'all';
  searchTerm = '';

  constructor(
    private articleService: ArticleService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadArticles();
  }

  loadArticles(): void {
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.articles = this.filterArticlesByRole(articles);
        this.filteredArticles = [...this.articles];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterArticlesByRole(articles: Article[]): Article[] {
    if (this.currentUser?.role.name === 'Contributor') {
      return articles.filter(article =>
        article.author._id === this.currentUser?._id
      );
    }
    if (this.currentUser?.role.name === 'Viewer') {
      return articles.filter(article => article.status === 'published');
    }
    return articles;
  }

  applyFilters(): void {
    this.filteredArticles = this.articles.filter(article => {
      // Status filter
      if (this.statusFilter !== 'all' && article.status !== this.statusFilter) {
        return false;
      }

      // Search filter
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        return (
          article.title.toLowerCase().includes(term) ||
          article.body.toLowerCase().includes(term) ||
          article.author.fullName.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }

  canEdit(article: Article): boolean {
    if (this.authService.hasPermission('article', 'update')) {
      if (this.currentUser?.role.name === 'SuperAdmin' || this.currentUser?.role.name === 'Manager') {
        return true;
      }
      if (this.currentUser?.role.name === 'Contributor') {
        return article.author._id === this.currentUser?._id;
      }
    }
    return false;
  }

  canDelete(article: Article): boolean {
    if (this.authService.hasPermission('article', 'delete')) {
      if (this.currentUser?.role.name === 'SuperAdmin' || this.currentUser?.role.name === 'Manager') {
        return true;
      }
      if (this.currentUser?.role.name === 'Contributor') {
        return article.author._id === this.currentUser?._id;
      }
    }
    return false;
  }

  canPublish(article: Article): boolean {
    return this.authService.hasPermission('article', 'publish') &&
           (this.currentUser?.role.name === 'SuperAdmin' || this.currentUser?.role.name === 'Manager');
  }

  onPublish(article: Article): void {
    this.articleService.publishArticle(article._id).subscribe({
      next: () => {
        article.status = 'published';
        article.publishedAt = new Date();
      }
    });
  }

  onUnpublish(article: Article): void {
    this.articleService.unpublishArticle(article._id).subscribe({
      next: () => {
        article.status = 'draft';
        article.publishedAt = undefined;
      }
    });
  }

  onDelete(article: Article): void {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(article._id).subscribe({
        next: () => {
          this.articles = this.articles.filter(a => a._id !== article._id);
          this.applyFilters();
        }
      });
    }
  }

  viewArticle(article: Article): void {
    this.router.navigate(['/articles', article._id]);
  }

  editArticle(article: Article): void {
    this.router.navigate(['/articles/edit', article._id]);
  }
}
