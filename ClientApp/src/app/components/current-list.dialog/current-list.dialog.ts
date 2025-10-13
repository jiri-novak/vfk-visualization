import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { IExportDetails, IPriceDetails, ISession, ISetPriceAndComment } from "../models/models";
import { ServerAppService } from "src/app/services/serverapp.service";
import { Subscription, switchMap } from "rxjs";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'current-list-dialog',
    templateUrl: 'current-list.dialog.html',
    styleUrls: ['./current-list.dialog.css'],
    standalone: false
})
export class CurrentListDialog {
    constructor(
        private dialogRef: MatDialogRef<CurrentListDialog>,
        private serverAppService: ServerAppService,
        private toastrService: ToastrService,
        @Inject(MAT_DIALOG_DATA) public data: IExportDetails) {
    }

    busy: Subscription;
    session?: ISession;

    close(): void {
        this.dialogRef.close(this.session);
    }

    onLocalize(item: IPriceDetails): void {
        this.dialogRef.close(item);
    }

    onDelete(item: IPriceDetails): void {
        const setPriceAndComment: ISetPriceAndComment = { exportId: this.data.exportId, price: null, comment: null };
        this.busy = this.serverAppService.setPriceAndComment(item.telId, setPriceAndComment)
            .pipe(switchMap(s => {
                this.session = s;
                return this.serverAppService.getExportDetails(this.data.exportId);
            }))
            .subscribe(s => {
                this.data = s;
            },
                (e) => this.toastrService.error(`Nepodařilo se smazat cenu: ${e.message}`));
    }
}