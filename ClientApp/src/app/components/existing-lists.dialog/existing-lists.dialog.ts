import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ServerAppService } from "src/app/services/serverapp.service";
import { IExport, IExportId, ISession } from "../models/models";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
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
        formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: IExport[]) {
        this.form = formBuilder.group({
            name: ['']
        });
    }

    form: UntypedFormGroup;
    busy: Subscription;
    session: ISession;
    inEdit: { [id: number]: boolean } = [];

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

    edit(exp: IExport) {
        this.form.controls.name.setValue(exp.name);
        this.inEdit[exp.id] = true;
    }

    save(exp: IExport) {
        const newName = this.form.controls.name.value;
        this.busy = this.serverAppService.renameExport(exp.id, { newName: newName })
            .subscribe(s => {
                this.session = s;
                exp.name = newName;
                this.inEdit[exp.id] = false;
            }, (e) => this.toastrService.error(`Nepodařilo se přejmenovat seznam: ${exp.name}: ${e.message}`))
    }
}