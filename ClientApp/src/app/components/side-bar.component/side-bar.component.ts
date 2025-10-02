import { ToastrService } from 'ngx-toastr';
import { debounceTime, Observable, Subscription, switchMap } from 'rxjs';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ILocalizationByKu, ILocalizationByPar, ILocalizationByLv, IFeatureInfoData, IKatuze, ISession, IExportId, ISortableLabel } from '../models/models';
import { ServerAppService } from 'src/app/services/serverapp.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ExistingListsDialog } from '../existing-lists.dialog/existing-lists.dialog';
import { CurrentListDialog } from '../current-list.dialog/current-list.dialog';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
  standalone: false
})
export class SideBarComponent implements OnInit {

  @Output() localizationByKu: EventEmitter<ILocalizationByKu> = new EventEmitter<ILocalizationByKu>();
  @Output() localizationByPar: EventEmitter<ILocalizationByPar> = new EventEmitter<ILocalizationByPar>();
  @Output() localizationByLv: EventEmitter<ILocalizationByLv> = new EventEmitter<ILocalizationByLv>();
  @Output() localizationCancel: EventEmitter<void> = new EventEmitter<void>();

  busy: Subscription;

  session: ISession;

  exportForm: UntypedFormGroup;
  exportOptions: Observable<IExportId[]>;

  katuzeForm: UntypedFormGroup;
  katuzeOptions: Observable<IKatuze[]>;

  parForm: UntypedFormGroup;
  lvForm: UntypedFormGroup;
  lvInfoForm: UntypedFormGroup;

  listCollapsed = false;
  localizationCollapsed = false;
  infoCollapsed = false;

  featureInfoData: IFeatureInfoData;

  constructor(
    private toastrService: ToastrService,
    private formBuilder: UntypedFormBuilder,
    private dialog: MatDialog,
    private serverAppService: ServerAppService) {
    this.exportForm = this.formBuilder.group({
      name: ['', Validators.required]
    });

    this.exportOptions = this.exportForm.controls.name.valueChanges
      .pipe(debounceTime(1000), switchMap(s => this.serverAppService.getExports(s)));

    this.katuzeForm = this.formBuilder.group({
      katuze: ['', Validators.required]
    });

    this.katuzeOptions = this.katuzeForm.controls.katuze.valueChanges
      .pipe(debounceTime(1000), switchMap(s => this.serverAppService.getKus(s)));

    this.parForm = this.formBuilder.group({
      parCislo: ['', Validators.required]
    });

    this.lvForm = this.formBuilder.group({
      lvId: ['', Validators.required]
    });

    this.lvInfoForm = this.formBuilder.group({
      cena: [''],
      poznamka: ['']
    });
  }

  confirmPrice() {
    this.busy = this.serverAppService.setPrice(this.featureInfoData.telId, { exportId: this.session.activeExport.id, price: this.lvInfoForm.controls.cena.value })
      .subscribe(() => { }, (e) => this.toastrService.error(`Nepodařilo se uložit nabídkovou cenu: ${e.message}`));
  }

  confirmComment() {
    this.busy = this.serverAppService.setComment(this.featureInfoData.telId, { exportId: this.session.activeExport.id, comment: this.lvInfoForm.controls.poznamka.value })
      .subscribe(() => { }, (e) => this.toastrService.error(`Nepodařilo se uložit poznámku: ${e.message}`));
  }

  ngOnInit() {
    this.busy = this.serverAppService.getSession().subscribe(s => {
      this.session = s;

      if (!!this.session.activeKatuzeKod && !!this.session.activeKatuzeName) {
        const katuze: IKatuze = { id: this.session.activeKatuzeKod, name: this.session.activeKatuzeName };
        this.katuzeForm.controls.katuze.setValue(katuze, { emitEvent: false });
      }

      if (!!this.session.activeExport) {
        this.exportForm.controls.name.setValue(this.session.activeExport, { emitEvent: false });
      }
    },
      (e) => this.toastrService.error(`Nepodařilo se uložit poznámku: ${e.message}`)
    );
  }

  displayFnKatuze(katuze: IKatuze): string {
    if (!!katuze) {
      return `${katuze.name} (${katuze.id})`;
    }
    else {
      return '';
    }
  }

  displayFnExportId(exportId: IExportId): string {
    if (!!exportId) {
      const datePipe = new DatePipe('cs-CZ');
      return `${exportId.name} (${datePipe.transform(exportId.createdAt, 'dd.MM.yyyy HH:mm:ss')})`;
    }
    else {
      return '';
    }
  }

  katuzeFocus() {
    this.katuzeForm.controls.katuze.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  katuzeFocusOut() {
    if (!!this.session.activeKatuzeKod && !!this.session.activeKatuzeName) {
      const katuze: IKatuze = { id: this.session.activeKatuzeKod, name: this.session.activeKatuzeName }
      this.katuzeForm.controls.katuze.setValue(katuze, { emit: false });
    }
    else {
      this.katuzeForm.controls.katuze.setValue('', { emit: false });
    }
  }

  exportFocus() {
    this.exportForm.controls.name.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  exportFocusOut() {
    if (!!this.session.activeExport) {
      this.exportForm.controls.name.setValue(this.session.activeExport, { emit: false });
    }
    else {
      this.exportForm.controls.name.setValue('', { emit: false });
    }
  }

  selectExport(exportId: IExportId) {
    this.busy = this.serverAppService.setActiveExport(exportId).subscribe(s => this.session = s,
      (e) => this.toastrService.error(`Nepodařilo se vybrat seznam s id ${exportId}: ${e.message}`)
    );
  }

  handleNoExport(value: string) {
    if (!value) {
      this.busy = this.serverAppService.setNoActiveExport().subscribe(s => this.session = s,
        (e) => this.toastrService.error(`Nepodařilo se odvybrat katastrální území: ${e.message}`)
      )
    }
  }

  selectKu(katuze: IKatuze) {
    this.busy = this.serverAppService.setActiveKu(katuze).subscribe(s => this.session = s,
      (e) => this.toastrService.error(`Nepodařilo se vybrat katastrální území ${katuze.name} (${katuze.id}): ${e.message}`)
    );
  }

  handleNoKu(value: string) {
    if (!value) {
      this.busy = this.serverAppService.setNoActiveKu().subscribe(s => this.session = s,
        (e) => this.toastrService.error(`Nepodařilo se odvybrat katastrální území: ${e.message}`)
      )
    }
  }

  showFeatureInfoData(event: IFeatureInfoData) {
    this.featureInfoData = event;
    this.lvInfoForm.controls.cena.setValue(event.cena, { emitEvent: false });
    this.lvInfoForm.controls.poznamka.setValue(event.poznamka, { emitEvent: false });
  }

  cancelSelection() {
    this.localizationCancel.next();
  }

  viewExport() {
    this.busy = this.serverAppService.getExportDetails(this.session.activeExport.id)
      .subscribe(d => {
        const dialogRef = this.dialog.open(CurrentListDialog, {
          data: d,
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result !== undefined) {
    console.log(`Lokalizace na LV: ${result.kuKod}, ${result.cisloLv}.`);
            this.localizationByLv.next({
              katuzeKod: result.kuKod,
              lvId: result.cisloLv,
            });
          }
        });
      },
        (e) => `Nepodařilo se získat detail seznamu: ${e}`
      );
  }

  export() {
    this.busy = this.serverAppService.export({ exportId: this.session.activeExport.id })
      .subscribe(
        () => this.toastrService.success('Sestava vybraných LV úspěšně vygenerována.', 'Generování XLSX'),
        () => this.toastrService.error('Sestavu vybraných LV se nepodařilo vygenerovat.', 'Generování XLSX'));
  }

  existingExports() {
    this.busy = this.serverAppService.getAllExports()
      .subscribe((exports) => {
        const dialogRef = this.dialog.open(ExistingListsDialog, {
          data: exports,
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result !== undefined) {
            this.session = result;
            this.exportForm.controls.name.setValue(this.session.activeExport, { emitEvent: false });
          }
        });
      });
  }

  onLocalizeKu() {
    console.log(`Lokalizace na katastralni uzemi: ${this.session.activeKatuzeKod}.`);
    this.localizationByKu.next({
      katuzeKod: this.session.activeKatuzeKod
    });
  }

  onLocalizeKu2() {
    const katuzeKod = this.featureInfoData.lv.find(x => x.id == 'KU').code;
    console.log(`Lokalizace na katastralni uzemi: ${katuzeKod}.`);
    this.localizationByKu.next({
      katuzeKod: katuzeKod
    });
  }

  onLocalizePar() {
    console.log(`Lokalizace na parcelu: ${this.session.activeKatuzeKod}, ${this.parForm.value.parCislo}.`);
    this.localizationByPar.next({
      katuzeKod: this.session.activeKatuzeKod,
      parCislo: this.parForm.value.parCislo
    });
  }

  onLocalizePar2(item: ISortableLabel) {
    const katuzeKod = this.featureInfoData.lv.find(x => x.id == 'KU').code;
    const parCislo = item.value;
    console.log(`Lokalizace na parcelu: ${katuzeKod}, ${parCislo}.`);
    this.localizationByPar.next({
      katuzeKod: katuzeKod,
      parCislo: parCislo
    });
  }

  onLocalizeLv() {
    console.log(`Lokalizace na LV: ${this.session.activeKatuzeKod}, ${this.lvForm.value.lvId}.`);
    this.localizationByLv.next({
      katuzeKod: this.session.activeKatuzeKod,
      lvId: this.lvForm.value.lvId,
    });
  }

  onLocalizeLv2() {
    const katuzeKod = this.featureInfoData.lv.find(x => x.id == 'KU').code;
    const lvId = parseInt(this.featureInfoData.lv.find(x => x.id == 'LVID').value);
    console.log(`Lokalizace na LV: ${katuzeKod}, ${lvId}.`);
    this.localizationByLv.next({
      katuzeKod: katuzeKod,
      lvId: lvId,
    });
  }
}
