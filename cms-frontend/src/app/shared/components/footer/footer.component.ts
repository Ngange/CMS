import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; {{currentYear}} Role-Based CMS. All rights reserved.</p>
        <p>Built with Angular & Node.js</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #3f51b5;
      color: white;
      padding: 20px 0;
      margin-top: auto;
    }
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
      padding: 0 20px;
    }
    .footer p {
      margin: 5px 0;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
