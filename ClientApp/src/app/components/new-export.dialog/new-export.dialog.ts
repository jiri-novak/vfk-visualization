import { Component, model } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ServerAppService } from "src/app/services/serverapp.service";
import { ICreateExport } from "../models/models";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'new-export-dialog',
  templateUrl: 'new-export.dialog.html',
  styleUrls: ['./new-export.dialog.css'],
  standalone: false
})
export class NewExportDialog {
  constructor(
    private dialogRef: MatDialogRef<NewExportDialog>,
    private serverAppService: ServerAppService,
    private formBuilder: UntypedFormBuilder) {
    this.form = this.formBuilder.group({
      export: ['', Validators.required]
    });
  }

  form: UntypedFormGroup;
  busy: Subscription;

  close(): void {
    this.dialogRef.close();
  }

  ok(): void {
    const createExport: ICreateExport = { name: this.form.controls.export.value };
    this.busy = this.serverAppService.createExport(createExport).subscribe(s => {
      this.dialogRef.close(s);
    },
      (e) => {
        this.form.controls.export.setErrors({ notUnique: e.message });
      }
    );
  }
}