import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title || 'Confirm' }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data.cancelLabel || 'Cancel' }}</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">{{ data.confirmLabel || 'Delete' }}</button>
    </mat-dialog-actions>
  `,
  styles: [
    ':host { display: block; max-width: 420px; }',
    'mat-dialog-content { font-size: 14px; color: #424242; }',
    'mat-dialog-actions { padding: 0 24px 16px; }'
  ]
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
