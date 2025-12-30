import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleListComponent } from './article-list.component';
import { ArticleService } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('ArticleListComponent', () => {
  let component: ArticleListComponent;
  let fixture: ComponentFixture<ArticleListComponent>;
  let articleService: jasmine.SpyObj<ArticleService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const articleServiceSpy = jasmine.createSpyObj('ArticleService', [
      'getArticles',
      'deleteArticle',
      'publishArticle',
      'unpublishArticle'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
      'hasPermission'
    ]);

    await TestBed.configureTestingModule({
      declarations: [ArticleListComponent],
      providers: [
        { provide: ArticleService, useValue: articleServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    articleService = TestBed.inject(ArticleService) as jasmine.SpyObj<ArticleService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(ArticleListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load articles on init', () => {
    const mockArticles = [
      {
        _id: '1',
        title: 'Test Article',
        body: 'Test content',
        author: { _id: '1', fullName: 'John' },
        status: 'published'
      }
    ];

    articleService.getArticles.and.returnValue(of(mockArticles));
    authService.getCurrentUser.and.returnValue(null);

    fixture.detectChanges();

    expect(articleService.getArticles).toHaveBeenCalled();
    expect(component.articles.length).toBe(1);
  });

  it('should filter articles by search term', () => {
    component.articles = [
      {
        _id: '1',
        title: 'Test Article',
        body: 'Test content',
        author: { _id: '1', fullName: 'John' },
        status: 'published'
      },
      {
        _id: '2',
        title: 'Another Article',
        body: 'Different content',
        author: { _id: '2', fullName: 'Jane' },
        status: 'draft'
      }
    ];

    component.searchTerm = 'Test';
    component.applyFilters();

    expect(component.filteredArticles.length).toBe(1);
  });

  it('should filter articles by status', () => {
    component.articles = [
      {
        _id: '1',
        title: 'Test Article',
        body: 'Test content',
        author: { _id: '1', fullName: 'John' },
        status: 'published'
      },
      {
        _id: '2',
        title: 'Draft Article',
        body: 'Draft content',
        author: { _id: '2', fullName: 'Jane' },
        status: 'draft'
      }
    ];

    component.statusFilter = 'published';
    component.applyFilters();

    expect(component.filteredArticles.length).toBe(1);
    expect(component.filteredArticles[0].status).toBe('published');
  });

  it('should delete article', () => {
    const article = {
      _id: '1',
      title: 'Test',
      body: 'Content',
      author: { _id: '1', fullName: 'John' },
      status: 'published'
    };

    component.articles = [article];
    articleService.deleteArticle.and.returnValue(of({}));
    spyOn(window, 'confirm').and.returnValue(true);

    component.onDelete(article);

    expect(articleService.deleteArticle).toHaveBeenCalledWith('1');
  });
});
