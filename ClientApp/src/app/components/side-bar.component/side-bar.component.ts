import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Component, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ILocalizationByKu, ILocalizationByPar, ILocalizationByLv, IFeatureInfoData, IVybraneLv } from '../models/models';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ServerAppService } from 'src/app/services/serverapp.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  @Output() localizationByKu: EventEmitter<ILocalizationByKu> = new EventEmitter<ILocalizationByKu>();
  @Output() localizationByPar: EventEmitter<ILocalizationByPar> = new EventEmitter<ILocalizationByPar>();
  @Output() localizationByLv: EventEmitter<ILocalizationByLv> = new EventEmitter<ILocalizationByLv>();
  @Output() localizationCancel: EventEmitter<void> = new EventEmitter<void>();

  public busy: Subscription;

  modalRef: BsModalRef;

  kuForm: FormGroup;
  kuSubmitted = false;

  parForm: FormGroup;
  parSubmitted = false;

  lvForm: FormGroup;
  lvSubmitted = false;

  lvInfoForm: FormGroup;
  lvInfoSubmitted = false;

  legendCollapsed = true;
  localizationCollapsed = false;
  infoCollapsed = false;
  selectedCollapsed = true;

  selected: IVybraneLv[] = [];

  featureInfoData: IFeatureInfoData;

  constructor(
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private serverAppService: ServerAppService) { }

  ngOnInit() {
    this.kuForm = this.formBuilder.group({
      kodKu: ['703567', Validators.required]
    });

    this.parForm = this.formBuilder.group({
      kodKu: ['703567', Validators.required],
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
  }

  showFeatureInfoData(event: any) {
    this.featureInfoData = event;
  }

  cancelSelection() {
    this.localizationCancel.next();
  }

  openModal(template: TemplateRef<any>, c: string) {
    this.lvInfoForm.reset();
    const existing = this.selected.find(x => x.telId === this.featureInfoData.telId);
    if (!!existing) {
      this.lvInfoForm.controls.cena.setValue(existing.cena);
      this.lvInfoForm.controls.poznamka.setValue(existing.poznamka);
    }
    this.modalRef = this.modalService.show(template, { class: `${c} modal-dialog modal-xl modal-dialog-centered` });
  }

  closeModal() {
    this.modalRef.hide();
  }

  markIt() {
    const existing = this.selected.find(x => x.telId === this.featureInfoData.telId);
    if (!!existing) {
      existing.cena = this.lvInfoForm.value.cena;
    } else {
      this.selected.push({
        ku: this.featureInfoData.lv.find(x => x.label === 'k.ú.:').valueWithUnit,
        cislo: this.featureInfoData.lv.find(x => x.label === 'číslo:').valueWithUnit,
        telId: this.featureInfoData.telId,
        cena: this.lvInfoForm.value.cena,
        poznamka: this.lvInfoForm.value.poznamka,
        inEdit: false
      });
    }
    this.closeModal();
  }

  unMarkAll() {
    this.selected = [];
  }

  export() {
    this.busy = this.serverAppService.export(this.selected)
      .subscribe(
        () => this.toastrService.success('Sestava vybraných LV úspěšně vygenerována.', 'Generování XLSX'),
        () => this.toastrService.error('Sestavu vybraných LV se nepodařilo vygenerovat.', 'Generování XLSX'));
  }

  delete(item: IVybraneLv) {
    this.selected = this.selected.filter(x => x.telId !== item.telId);
  }

  edit(item: IVybraneLv) {
    item.inEdit = true;
  }

  confirm(item: IVybraneLv) {
    item.inEdit = false;
  }

  onLocalizeKu() {
    this.kuSubmitted = true;

    if (this.kuForm.invalid) {
      return;
    }

    console.log(`Lokalizace na katastralni uzemi: ${this.kuForm.value.kodKu}.`);
    this.localizationByKu.next({
      katuzeKod: this.kuForm.value.kodKu
    });
  }

  onLocalizePar() {
    this.parSubmitted = true;

    if (this.parForm.invalid) {
      return;
    }

    console.log(`Lokalizace na parcelu: ${this.parForm.value.kodKu}, ${this.parForm.value.parCislo}.`);
    this.localizationByPar.next({
      katuzeKod: this.parForm.value.kodKu,
      parCislo: this.parForm.value.parCislo
    });
  }

  onLocalizeLv() {
    this.lvSubmitted = true;

    if (this.lvForm.invalid) {
      return;
    }

    console.log(`Lokalizace na LV: ${this.lvForm.value.kodKu}, ${this.lvForm.value.lvId}.`);
    this.localizationByLv.next({
      katuzeKod: this.lvForm.value.kodKu,
      lvId: this.lvForm.value.lvId
    });
  }
}
