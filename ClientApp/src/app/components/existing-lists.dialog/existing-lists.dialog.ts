import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ServerAppService } from "src/app/services/serverapp.service";
import { IExport, IExportId, ISession } from "../models/models";
import { UntypedFormGroup } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { NewExportDialog } from "../new-export.dialog/new-export.dialog";
import { ConfirmDialog } from "../confirm.dialog/confirm.dialog";

@Component({
    selector: 'existing-lists-dialog',
    templateUrl: 'existing-lists.dialog.html',
    styleUrls: ['./existing-lists.dialog.css'],
    standalone: false
})
export class ExistingListsDialog {
    constructor(
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ExistingListsDialog>,
        private serverAppService: ServerAppService,
        private toastrService: ToastrService,
        @Inject(MAT_DIALOG_DATA) public data: IExport[]) {
    }

    form: UntypedFormGroup;
    busy: Subscription;
    session: ISession;

    close(): void {
        this.dialogRef.close();
    }

    ok(): void {
        this.dialogRef.close(this.session);
    }

    delete(exp: IExport) {
        const dialogRef = this.dialog.open(ConfirmDialog, {
            data: `seznam ${exp.name}`
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result == true) {
                this.busy = this.serverAppService.deleteExport(exp.id).subscribe(s => {
                    this.session = s;
                    this.data = this.data.filter(x => x.id != exp.id);
                },
                    (e) => this.toastrService.error(`Nepodařilo se smazat seznam ${exp.name}: ${e.message}`));
            }
        });
    }

    select(exp: IExport) {
        const expId: IExportId = { id: exp.id, name: exp.name, createdAt: exp.createdAt };
        this.busy = this.serverAppService.setActiveExport(expId).subscribe(s => {
            this.session = s;
            this.dialogRef.close(s);
        }, (e) => this.toastrService.error(`Nepodařilo se vybrat aktivní seznam: ${exp.name}: ${e.message}`));
    }

    create() {
        const dialogRef = this.dialog.open(NewExportDialog, {});

        dialogRef.afterClosed().subscribe(result => {
            if (result !== undefined) {
                this.data = this.data.concat([result]).sort((a, b) => a.name.localeCompare(b.name))
            }
        });
    }
}