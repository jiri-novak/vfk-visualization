import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";

@Component({
  selector: 'confirm-dialog',
  templateUrl: 'confirm.dialog.html',
  styleUrls: ['./confirm.dialog.css'],
  standalone: false
})
export class ConfirmDialog {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: string) {
  }

  busy: Subscription;

  close(): void {
    this.dialogRef.close(false);
  }

  ok(): void {
    this.dialogRef.close(true);
  }
}