import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ArticleService } from '../../../core/services/article.service';
import { Article } from '../../../core/models/article.model';
import { User } from '../../../core/models/user.model';
import { ROLE_NAMES } from '../../../core/constants/roles.constants';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  myArticles?: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  greeting: string = '';
  stats: DashboardStats = {
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    myArticles: 0
  };
  recentArticles: Article[] = [];
  isLoading = true;
  ROLE_NAMES = ROLE_NAMES;

  constructor(
    private authService: AuthService,
    private articleService: ArticleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.greeting = this.getRoleBasedGreeting();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.calculateStats(articles);
        this.recentArticles = articles
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 5);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats(articles: Article[]): void {
    this.stats.totalArticles = articles.length;
    this.stats.publishedArticles = articles.filter(a => a.status === 'published').length;
    this.stats.draftArticles = articles.filter(a => a.status === 'draft').length;

    if (this.currentUser) {
      this.stats.myArticles = articles.filter(
        a => a.author._id === this.currentUser?._id
      ).length;
    }
  }

  getRoleBasedGreeting(): string {
    const hour = new Date().getHours();
    let timeGreeting = '';

    if (hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour < 18) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }

    if (this.currentUser && this.currentUser.role) {
      return `${timeGreeting}, ${this.currentUser.fullName}`;
    }

    return `${timeGreeting}`;
  }

  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }

  canAccessDrafts(): boolean {
    // Viewers can only see published articles, so they shouldn't see draft stats
    return this.currentUser?.role?.name !== ROLE_NAMES.VIEWER;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  viewArticle(articleId: string): void {
    this.router.navigate(['/articles/view', articleId]);
  }

  getStatusClass(status: string): string {
    return status === 'published' ? 'status-published' : 'status-draft';
  }

  getImageUrl(imagePath: string | null): string | null {
    return this.articleService.getImageUrl(imagePath);
  }
}
