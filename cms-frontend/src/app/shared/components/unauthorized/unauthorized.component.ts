import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="unauthorized-container">
      <div class="error-card">
        <h1>403</h1>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <div class="actions">
          <button mat-raised-button color="primary" (click)="goHome()">
            Go to Home
          </button>
          <button mat-button (click)="goBack()">
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      padding: 20px;
    }
    .error-card {
      text-align: center;
      max-width: 500px;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }
    .error-card h1 {
      font-size: 72px;
      margin: 0;
      color: #f44336;
    }
    .error-card h2 {
      font-size: 24px;
      margin: 20px 0 10px;
      color: #333;
    }
    .error-card p {
      color: #666;
      margin-bottom: 30px;
    }
    .actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
}
