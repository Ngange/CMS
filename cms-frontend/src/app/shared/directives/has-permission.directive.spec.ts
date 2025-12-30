import { HasPermissionDirective } from './has-permission.directive';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';

@Component({
  template: `
    <div *appHasPermission="'article:create'" id="test-element">
      Test Content
    </div>
  `
})
class TestComponent { }

describe('HasPermissionDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasPermission']);

    TestBed.configureTestingModule({
      declarations: [TestComponent, HasPermissionDirective],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should show element when user has permission', () => {
    authService.hasPermission.and.returnValue(true);
    fixture.detectChanges();

    const element = fixture.debugElement.query(By.css('#test-element'));
    expect(element).toBeTruthy();
  });

  it('should hide element when user does not have permission', () => {
    authService.hasPermission.and.returnValue(false);
    fixture.detectChanges();

    const element = fixture.debugElement.query(By.css('#test-element'));
    expect(element).toBeFalsy();
  });
});
