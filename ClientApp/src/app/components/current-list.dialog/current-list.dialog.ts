import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { IExportDetails, IPriceDetails, ISession, ISetPriceAndComment } from "../models/models";
import { ServerAppService } from "src/app/services/serverapp.service";
import { Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { ConfirmDialog } from "../confirm.dialog/confirm.dialog";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

@Component({
    selector: 'current-list-dialog',
    templateUrl: 'current-list.dialog.html',
    styleUrls: ['./current-list.dialog.css'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentListDialog implements AfterViewInit {
    constructor(
        private dialogRef: MatDialogRef<CurrentListDialog>,
        private dialog: MatDialog,
        private serverAppService: ServerAppService,
        private toastrService: ToastrService,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: IExportDetails) {
        this.dataSource = new MatTableDataSource<IPriceDetails>(data.prices);
    }

    busy: Subscription;
    session?: ISession;
    displayedColumns: string[] = ['actions', 'pracoviste', 'ku', 'cisloLv', 'createdAt', 'cenaNabidkova', 'poznamka'];
    dataSource: MatTableDataSource<IPriceDetails>;

    @ViewChild(MatTable) table: MatTable<IPriceDetails>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.table.renderRows();
        this.cdr.detectChanges();
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
                const setPriceAndComment: ISetPriceAndComment = { exportId: this.data.exportId, price: null, comment: null };
                this.busy = this.serverAppService.setPriceAndComment(item.telId, setPriceAndComment)
                    .subscribe(s => {
                        this.session = s;
                        this.data.prices = this.data.prices.filter(x => x.telId != item.telId);
                    },
                        (e) => this.toastrService.error(`Nepodařilo se smazat cenu pro ${item.pracoviste} - ${item.ku} - ${item.cisloLv}: ${e.message}`));
            }
        });
    }
}