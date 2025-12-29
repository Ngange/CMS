import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

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
    const [resource, action] = permission.split(':');

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
