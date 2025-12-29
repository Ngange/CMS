import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';
import { Article } from '../../../core/models/article.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  articles: Article[] = [];
  isLoading = true;
  isAuthenticated = false;

  constructor(
    private articleService: ArticleService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();

    if (this.isAuthenticated) {
      this.loadPublishedArticles();
    } else {
      this.isLoading = false;
      // Show public content
    }
  }

  loadPublishedArticles(): void {
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.articles = articles.filter(article => article.status === 'published');
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
