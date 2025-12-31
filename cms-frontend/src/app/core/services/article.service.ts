import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) { }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }

  getArticleById(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  createArticle(articleData: any): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, articleData);
  }

  updateArticle(id: string, articleData: any): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, articleData);
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  publishArticle(id: string): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/${id}/publish`, {});
  }

  unpublishArticle(id: string): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/${id}/unpublish`, {});
  }

  getImageUrl(imagePath: string | null): string | null {
    if (!imagePath) return null;
    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, prepend the backend URL
    return `${environment.backendUrl}/${imagePath}`;
  }
}
