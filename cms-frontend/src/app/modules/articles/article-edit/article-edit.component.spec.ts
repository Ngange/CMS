import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleEditComponent } from './article-edit.component';
import { ArticleService } from '../../../core/services/article.service';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('ArticleEditComponent', () => {
  let component: ArticleEditComponent;
  let fixture: ComponentFixture<ArticleEditComponent>;
  let articleService: jasmine.SpyObj<ArticleService>;

  beforeEach(async () => {
    const articleServiceSpy = jasmine.createSpyObj('ArticleService', [
      'getArticleById',
      'updateArticle'
    ]);

    const activatedRouteSpy = {
      snapshot: { paramMap: { get: () => '1' } }
    };

    await TestBed.configureTestingModule({
      declarations: [ArticleEditComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ArticleService, useValue: articleServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    articleService = TestBed.inject(ArticleService) as jasmine.SpyObj<ArticleService>;
    fixture = TestBed.createComponent(ArticleEditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load article on init', () => {
    const mockArticle = {
      _id: '1',
      title: 'Test Article',
      body: 'Test content for editing',
      image: 'image.jpg',
      author: { _id: '1', fullName: 'John' },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    articleService.getArticleById.and.returnValue(of(mockArticle));

    fixture.detectChanges();

    expect(articleService.getArticleById).toHaveBeenCalledWith('1');
    expect(component.article).toEqual(mockArticle);
    expect(component.articleForm.get('title')?.value).toBe('Test Article');
  });

  it('should handle file selection', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(file);
    expect(component.previewUrl).toBeTruthy();
  });

  it('should reject non-image files', () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    expect(component.errorMessage).toBeTruthy();
  });

  it('should update article', () => {
    const mockArticle = {
      _id: '1',
      title: 'Test Article',
      body: 'Updated content',
      author: { _id: '1', fullName: 'John' },
      status: 'draft'
    };

    component.article = mockArticle;
    component.articleId = '1';
    articleService.updateArticle.and.returnValue(of({}));

    component.articleForm.patchValue({
      title: 'Updated Title',
      body: 'Updated content here for the article'
    });

    component.onSubmit();

    expect(articleService.updateArticle).toHaveBeenCalledWith('1', jasmine.any(FormData));
  });

  it('should handle article not found', () => {
    const error = { error: { message: 'Article not found' } };
    articleService.getArticleById.and.returnValue(throwError(() => error));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Article not found');
  });
});
