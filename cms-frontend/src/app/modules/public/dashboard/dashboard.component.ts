import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ArticleService } from '../../../core/services/article.service';
import { User } from '../../../core/models/user.model';
import { Article } from '../../../core/models/article.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  articles: Article[] = [];
  stats = {
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0
  };
  quickActions: any[] = [];

  constructor(
    private authService: AuthService,
    private articleService: ArticleService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadArticles();
    this.setupQuickActions();
  }

  loadArticles(): void {
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.calculateStats(articles);
      }
    });
  }

  calculateStats(articles: Article[]): void {
    this.stats.totalArticles = articles.length;
    this.stats.publishedArticles = articles.filter(a => a.status === 'published').length;
    this.stats.draftArticles = articles.filter(a => a.status === 'draft').length;
  }

  setupQuickActions(): void {
    const actions = [];

    if (this.authService.hasPermission('article', 'create')) {
      actions.push({
        label: 'Create Article',
        icon: 'add',
        route: '/articles/create',
        color: 'primary'
      });
    }

    if (this.authService.hasPermission('user', 'read') && this.currentUser?.role.name === 'SuperAdmin') {
      actions.push({
        label: 'Manage Users',
        icon: 'people',
        route: '/admin/users',
        color: 'accent'
      });
    }

    if (this.authService.hasPermission('role', 'create') && this.currentUser?.role.name === 'SuperAdmin') {
      actions.push({
        label: 'Manage Roles',
        icon: 'admin_panel_settings',
        route: '/admin/roles',
        color: 'warn'
      });
    }

    this.quickActions = actions;
  }

  getRoleBasedGreeting(): string {
    const hour = new Date().getHours();
    let greeting = 'Good ';

    if (hour < 12) greeting += 'Morning';
    else if (hour < 18) greeting += 'Afternoon';
    else greeting += 'Evening';

    return `${greeting}, ${this.currentUser?.fullName}!`;
  }
}
