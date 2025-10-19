import { AfterViewInit, Component, Inject, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ServerAppService } from "src/app/services/serverapp.service";
import { IExport, IExportId, ISession } from "../models/models";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { NewExportDialog } from "../new-export.dialog/new-export.dialog";
import { ConfirmDialog } from "../confirm.dialog/confirm.dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";

@Component({
    selector: 'existing-lists-dialog',
    templateUrl: 'existing-lists.dialog.html',
    styleUrls: ['./existing-lists.dialog.css'],
    standalone: false
})
export class ExistingListsDialog implements AfterViewInit {
    constructor(
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ExistingListsDialog>,
        private serverAppService: ServerAppService,
        private toastrService: ToastrService,
        formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) data: IExport[]) {
        this.form = formBuilder.group({ name: [''] });
        this.dataSource = new MatTableDataSource<IExport>(data);
    }

    form: UntypedFormGroup;
    busy: Subscription;
    session: ISession;
    inEdit: { [id: number]: boolean } = [];
    displayedColumns: string[] = ['name', 'createdAt', 'pricesCount', 'actions'];
    dataSource: MatTableDataSource<IExport>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    close(): void {
        this.dialogRef.close();
    }

    ok(): void {
        this.dialogRef.close(this.session);
    }

    delete(exp: IExport) {
        const dialogRef = this.dialog.open(ConfirmDialog, {
            data: `seznam ${exp.name}`,
            autoFocus: false,
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result == true) {
                this.busy = this.serverAppService.deleteExport(exp.id).subscribe(s => {
                    this.session = s;
                    this.dataSource.data = this.dataSource.data.filter(x => x.id != exp.id);
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
        const dialogRef = this.dialog.open(NewExportDialog, { autoFocus: false, });

        dialogRef.afterClosed().subscribe(result => {
            if (result !== undefined) {
                this.dataSource.data = this.dataSource.data.concat([result]).sort((a, b) => a.name.localeCompare(b.name))
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