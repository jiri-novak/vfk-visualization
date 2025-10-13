import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { IExportDetails, IPriceDetails } from "../models/models";

@Component({
    selector: 'current-list-dialog',
    templateUrl: 'current-list.dialog.html',
    styleUrls: ['./current-list.dialog.css'],
    standalone: false
})
export class CurrentListDialog {
    constructor(
        private dialogRef: MatDialogRef<CurrentListDialog>,
        @Inject(MAT_DIALOG_DATA) public data: IExportDetails) {
    }

    close(): void {
        this.dialogRef.close();
    }

    onLocalize(item: IPriceDetails): void {
        this.dialogRef.close(item);
    }

    onDelete(item: IPriceDetails): void {
        
    }
}