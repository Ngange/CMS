import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../core/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { of, throwError } from 'rxjs';
import { ArticleService } from '../../core/services/article.service';
import { CloudinaryService } from '../../core/services/cloudinary.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let cloudinaryService: jasmine.SpyObj<CloudinaryService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getProfile',
      'updateProfile',
      'changePassword'
    ]);

    const articleServiceSpy = jasmine.createSpyObj('ArticleService', ['getImageUrl']);
    articleServiceSpy.getImageUrl.and.callFake((path: string) => path);

    const cloudinaryServiceSpy = jasmine.createSpyObj('CloudinaryService', ['uploadImage']);
    cloudinaryServiceSpy.uploadImage.and.returnValue(of('https://cloudinary.com/example.jpg'));

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ArticleService, useValue: articleServiceSpy },
        { provide: CloudinaryService, useValue: cloudinaryServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    cloudinaryService = TestBed.inject(CloudinaryService) as jasmine.SpyObj<CloudinaryService>;
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user profile on init', () => {
    const mockUser = {
      _id: '1',
      fullName: 'John Doe',
      email: 'john@example.com',
      profilePhoto: 'photo.jpg',
      role: { _id: '1', name: 'Admin' }
    };

    authService.getProfile.and.returnValue(of(mockUser));
    fixture.detectChanges();

    expect(authService.getProfile).toHaveBeenCalled();
    expect(component.currentUser).toEqual(mockUser);
    expect(component.profileForm.get('fullName')?.value).toBe('John Doe');
  });

  it('should handle profile update', () => {
    authService.updateProfile.and.returnValue(of({}));
    component.profileForm.patchValue({
      fullName: 'Jane Doe',
      email: 'jane@example.com'
    });

    component.onUpdateProfile();

    expect(authService.updateProfile).toHaveBeenCalled();
    expect(component.isEditing).toBeFalse();
    expect(component.successMessage).toBeTruthy();
  });

  it('should validate password match', () => {
    component.passwordForm.patchValue({
      currentPassword: 'old123',
      newPassword: 'new123',
      confirmPassword: 'different'
    });

    expect(component.passwordForm.hasError('mismatch')).toBeTrue();
  });

  it('should handle file selection', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(file);
    expect(component.uploadedImageUrl).toBe('https://cloudinary.com/example.jpg');
  });

  it('should handle password change error', () => {
    const error = { error: { message: 'Invalid password' } };
    authService.changePassword.and.returnValue(throwError(() => error));

    component.passwordForm.patchValue({
      currentPassword: 'old123',
      newPassword: 'new123',
      confirmPassword: 'new123'
    });

    component.onChangePassword();

    expect(component.errorMessage).toBeTruthy();
    expect(component.isLoading).toBeFalse();
  });
});
