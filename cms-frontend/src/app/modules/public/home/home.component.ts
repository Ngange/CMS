import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ArticleService } from '../../../core/services/article.service';
import { Article } from '../../../core/models/article.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isAuthenticated = false;
  currentUser: User | null = null;
  publishedArticles: Article[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private articleService: ArticleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();

    if (this.isAuthenticated) {
      this.loadPublishedArticles();
    } else {
      this.isLoading = false;
    }
  }

  loadPublishedArticles(): void {
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.publishedArticles = articles
          .filter(a => a.status === 'published')
          .sort((a, b) => new Date(b.publishedAt || b.createdAt!).getTime() -
                          new Date(a.publishedAt || a.createdAt!).getTime())
          .slice(0, 6);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.isLoading = false;
      }
    });
  }

  viewArticle(articleId: string): void {
    this.router.navigate(['/articles/view', articleId]);
  }

  getExcerpt(body: string, length: number = 120): string {
    return body.length > length ? body.substring(0, length) + '...' : body;
  }

  getImageUrl(imagePath: string | null): string | null {
    return this.articleService.getImageUrl(imagePath);
  }
}
