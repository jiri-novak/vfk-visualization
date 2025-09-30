import { Component, model } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ServerAppService } from "src/app/services/serverapp.service";
import { ICreateExport } from "../models/models";
import { UntypedFormGroup } from "@angular/forms";

@Component({
    selector: 'current-list-dialog',
    templateUrl: 'current-list.dialog.html',
    styleUrls: ['./current-list.dialog.css'],
    standalone: false
})
export class CurrentListDialog {
    constructor(
        private dialogRef: MatDialogRef<CurrentListDialog>,
        private serverAppService: ServerAppService) {
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