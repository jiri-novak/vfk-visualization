import { AfterViewInit, Component, Inject, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { IExportDetails, IPriceDetails, ISession, ISetPriceAndComment } from "../models/models";
import { ServerAppService } from "src/app/services/serverapp.service";
import { Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { ConfirmDialog } from "../confirm.dialog/confirm.dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

@Component({
    selector: 'current-list-dialog',
    templateUrl: 'current-list.dialog.html',
    styleUrls: ['./current-list.dialog.css'],
    standalone: false,
})
export class CurrentListDialog implements AfterViewInit {
    constructor(
        private dialogRef: MatDialogRef<CurrentListDialog>,
        private dialog: MatDialog,
        private serverAppService: ServerAppService,
        private toastrService: ToastrService,
        @Inject(MAT_DIALOG_DATA) data: IExportDetails) {
        this.exportId = data.exportId;
        this.dataSource = new MatTableDataSource<IPriceDetails>(data.prices);
    }

    exportId: number;
    busy: Subscription;
    session?: ISession;
    displayedColumns: string[] = ['actions', 'pracoviste', 'ku', 'cisloLv', 'createdAt', 'cenaNabidkova', 'poznamka'];
    dataSource: MatTableDataSource<IPriceDetails>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    close(): void {
        this.dialogRef.close(this.session);
    }

    onLocalize(item: IPriceDetails): void {
        this.dialogRef.close(item);
    }

    onDelete(item: IPriceDetails): void {
        const dialogRef = this.dialog.open(ConfirmDialog, {
            data: `nabídkovou cenu pro ${item.pracoviste} - ${item.ku} - ${item.cisloLv}`
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result == true) {
                const setPriceAndComment: ISetPriceAndComment = { exportId: this.exportId, price: null, comment: null };
                this.busy = this.serverAppService.setPriceAndComment(item.telId, setPriceAndComment)
                    .subscribe(s => {
                        this.session = s;
                        this.dataSource.data = this.dataSource.data.filter(x => x.telId != item.telId);
                    },
                        (e) => this.toastrService.error(`Nepodařilo se smazat cenu pro ${item.pracoviste} - ${item.ku} - ${item.cisloLv}: ${e.message}`));
            }
        });
    }
}