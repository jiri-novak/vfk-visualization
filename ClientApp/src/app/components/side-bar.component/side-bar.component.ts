import { ToastrService } from 'ngx-toastr';
import { debounceTime, Observable, Subscription, switchMap } from 'rxjs';
import { Component, OnInit, Output, EventEmitter, TemplateRef, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ILocalizationByKu, ILocalizationByPar, ILocalizationByLv, IFeatureInfoData, IKatuze, ISession, IExportId, ICreateExport, IExportDetails, IPriceDetails } from '../models/models';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ServerAppService } from 'src/app/services/serverapp.service';
import { DatePipe } from '@angular/common';

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

  @ViewChild('selectedLvs', { static: true }) selectedLvsRef: TemplateRef<any>;

  busy: Subscription;

  modalRef: BsModalRef;

  session: ISession;

  exportForm: UntypedFormGroup;
  exportOptions: Observable<IExportId[]>;

  katuzeForm: UntypedFormGroup;
  katuzeOptions: Observable<IKatuze[]>;

  parForm: UntypedFormGroup;
  lvForm: UntypedFormGroup;
  lvInfoForm: UntypedFormGroup;

  sessionCollapsed = false;
  localizationCollapsed = false;
  infoCollapsed = false;

  featureInfoData: IFeatureInfoData;

  exportDetails: IExportDetails;

  constructor(
    private toastrService: ToastrService,
    private formBuilder: UntypedFormBuilder,
    private modalService: BsModalService,
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
      parCislo: ['782/8', Validators.required]
    });

    this.lvForm = this.formBuilder.group({
      kodKu: ['703567', Validators.required],
      lvId: ['536', Validators.required]
    });

    this.lvInfoForm = this.formBuilder.group({
      cena: [''],
      poznamka: ['']
    });

    this.lvInfoForm.controls.cena.valueChanges
      .pipe(debounceTime(1000),
        switchMap(s => this.serverAppService.setPrice(this.featureInfoData.telId, { exportId: this.session.activeExport.id, price: s })))
      .subscribe();

    this.lvInfoForm.controls.poznamka.valueChanges
      .pipe(debounceTime(1000),
        switchMap(s => this.serverAppService.setComment(this.featureInfoData.telId, { exportId: this.session.activeExport.id, comment: s })))
      .subscribe();
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
    });
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
      return `${exportId.name} (${datePipe.transform(exportId.createdAt, 'd. MMMM yyyy HH:mm:ss')})`;
    }
    else {
      return '';
    }
  }

  katuzeFocus() {
    this.katuzeForm.controls.katuze.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  exportIdFocus() {
    this.exportForm.controls.name.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  createExport() {
    const createExport: ICreateExport = { name: this.exportForm.controls.name.value };
    this.busy = this.serverAppService.createExport(createExport).subscribe(s => {
      this.exportForm.controls.name.setValue(s, { emitEvent: false });
      this.selectExport(s);
    });
  }

  deleteExport() {
    this.busy = this.serverAppService.deleteExport(this.session.activeExport.id).subscribe(s => {
      this.exportForm.controls.name.setValue('', { emitEvent: false });
    });
  }

  selectExport(exportId: IExportId) {
    this.busy = this.serverAppService.sectActiveExport(exportId).subscribe(s => this.session = s);
  }

  selectKu(katuze: IKatuze) {
    this.busy = this.serverAppService.setActiveKu(katuze).subscribe(s => this.session = s);
  }

  showFeatureInfoData(event: IFeatureInfoData) {
    this.featureInfoData = event;
    this.lvInfoForm.controls.cena.setValue(event.cena, { emitEvent: false });
    this.lvInfoForm.controls.poznamka.setValue(event.poznamka, { emitEvent: false });
  }

  cancelSelection() {
    this.localizationCancel.next();
  }

  openModal(template: TemplateRef<any>, c: string) {
    this.modalRef = this.modalService.show(template, { class: `${c} modal-dialog modal-xl modal-dialog-centered` });
  }

  closeModal() {
    this.modalRef.hide();
  }

  unMarkAll() {
  }

  viewExport() {
    this.busy = this.serverAppService.getExportDetails(this.session.activeExport.id)
      .subscribe(d => {
        this.exportDetails = d;
        console.log(d);
        this.openModal(this.selectedLvsRef, 'modal-lg');
      });
  }

  export() {
    this.busy = this.serverAppService.export({ exportId: this.session.activeExport.id })
      .subscribe(
        () => this.toastrService.success('Sestava vybraných LV úspěšně vygenerována.', 'Generování XLSX'),
        () => this.toastrService.error('Sestavu vybraných LV se nepodařilo vygenerovat.', 'Generování XLSX'));
  }

  delete(item: IPriceDetails) {
    // this.selected = this.selected.filter(x => x.telId !== item.telId);
  }

  edit(item: IPriceDetails) {
    item.inEdit = true;
  }

  confirm(item: IPriceDetails) {
    item.inEdit = false;
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

  onLocalizePar2() {
    const katuzeKod = this.featureInfoData.lv.find(x => x.id == 'KU').code;
    const parCislo = this.featureInfoData.par.find(x => x.id == 'PAR_CISLO').value;
    console.log(`Lokalizace na parcelu: ${katuzeKod}, ${parCislo}.`);
    this.localizationByPar.next({
      katuzeKod: katuzeKod,
      parCislo: parCislo
    });
  }

  onLocalizeLv() {
    console.log(`Lokalizace na LV: ${this.lvForm.value.kodKu}, ${this.lvForm.value.lvId}.`);
    this.localizationByLv.next({
      katuzeKod: this.lvForm.value.kodKu,
      lvId: this.lvForm.value.lvId
    });
  }

  onLocalizeLv2() {
    const katuzeKod = this.featureInfoData.lv.find(x => x.id == 'KU').code;
    const lvId = parseInt(this.featureInfoData.lv.find(x => x.id == 'LVID').value);
    console.log(`Lokalizace na LV: ${katuzeKod}, ${lvId}.`);
    this.localizationByLv.next({
      katuzeKod: katuzeKod,
      lvId: lvId
    });
  }
}
