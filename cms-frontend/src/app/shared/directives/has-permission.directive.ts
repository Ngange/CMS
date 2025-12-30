import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * Structural directive to show/hide elements based on user permissions
 *
 * Usage: *appHasPermission="'resource:action'"
 * Example: *appHasPermission="'article:create'" - shows element only if user has create permission on articles
 *
 * Valid format: 'resource:action'
 * - resource: user, role, article, etc.
 * - action: create, read, update, delete, publish
 *
 * @example
 * <button *appHasPermission="'article:delete'">Delete</button>
 */
@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) { }

  @Input() set appHasPermission(permission: string) {
    this.updateView(permission);
  }

  private updateView(permission: string): void {
    // Validate permission format
    if (!permission || typeof permission !== 'string') {
      this.viewContainer.clear();
      this.hasView = false;
      return;
    }

    // Parse permission string
    const parts = permission.split(':');
    if (parts.length !== 2) {
      console.warn(
        `Invalid permission format: "${permission}". Expected format: "resource:action" (e.g., "article:create")`
      );
      this.viewContainer.clear();
      this.hasView = false;
      return;
    }

    const [resource, action] = parts;

    if (this.authService.hasPermission(resource, action)) {
      if (!this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
    } else {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
