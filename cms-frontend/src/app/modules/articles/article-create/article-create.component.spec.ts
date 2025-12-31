import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleCreateComponent } from './article-create.component';
import { ArticleService } from '../../../core/services/article.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { CloudinaryService } from '../../../core/services/cloudinary.service';

describe('ArticleCreateComponent', () => {
  let component: ArticleCreateComponent;
  let fixture: ComponentFixture<ArticleCreateComponent>;
  let articleService: jasmine.SpyObj<ArticleService>;
  let cloudinaryService: jasmine.SpyObj<CloudinaryService>;

  beforeEach(async () => {
    const articleServiceSpy = jasmine.createSpyObj('ArticleService', ['createArticle']);
    const cloudinaryServiceSpy = jasmine.createSpyObj('CloudinaryService', ['uploadImage']);
    cloudinaryServiceSpy.uploadImage.and.returnValue(of('https://cloudinary.com/example.jpg'));

    await TestBed.configureTestingModule({
      declarations: [ArticleCreateComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ArticleService, useValue: articleServiceSpy },
        { provide: CloudinaryService, useValue: cloudinaryServiceSpy }
      ]
    }).compileComponents();

    articleService = TestBed.inject(ArticleService) as jasmine.SpyObj<ArticleService>;
    cloudinaryService = TestBed.inject(CloudinaryService) as jasmine.SpyObj<CloudinaryService>;
    fixture = TestBed.createComponent(ArticleCreateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.articleForm.get('title')?.value).toBe('');
    expect(component.articleForm.get('body')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.articleForm;
    expect(form.valid).toBeFalse();

    form.patchValue({
      title: 'Test Title',
      body: 'This is a test body content for the article'
    });

    expect(form.valid).toBeTrue();
  });

  it('should validate minimum length', () => {
    const form = component.articleForm;

    form.patchValue({
      title: 'Hi',
      body: 'Short'
    });

    expect(form.get('title')?.hasError('minlength')).toBeTrue();
    expect(form.get('body')?.hasError('minlength')).toBeTrue();
  });

  it('should handle file selection', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(file);
    expect(component.uploadedImageUrl).toBe('https://cloudinary.com/example.jpg');
  });

  it('should reject non-image files', () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    expect(component.errorMessage).toBeTruthy();
    expect(component.uploadedImageUrl).toBeNull();
  });

  it('should remove selected image', () => {
    component.uploadedImageUrl = 'https://cloudinary.com/example.jpg';
    component.previewUrl = 'https://cloudinary.com/example.jpg';

    component.removeImage();

    expect(component.previewUrl).toBeNull();
    expect(component.uploadedImageUrl).toBeNull();
  });

  it('should submit form with valid data', () => {
    articleService.createArticle.and.returnValue(of({}));

    component.articleForm.patchValue({
      title: 'Test Article',
      body: 'This is a test body content for the article'
    });

    component.onSubmit();

    expect(articleService.createArticle).toHaveBeenCalledWith({
      title: 'Test Article',
      body: 'This is a test body content for the article',
      image: null,
    });
  });
});
