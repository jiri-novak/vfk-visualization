import { Component, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ILocalizationByKu, ILocalizationByPar, ILocalizationByLv, IFeatureInfoData, IVybraneLv } from '../models/models';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

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

  constructor(private formBuilder: FormBuilder, private modalService: BsModalService) { }

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
      cena: ['']
    });
  }

  showFeatureInfoData(event: any) {
    this.featureInfoData = event;
  }

  cancelSelection() {
    this.localizationCancel.next();
  }

  openModal(template: TemplateRef<any>) {
    this.lvInfoForm.reset();
    const existing = this.selected.find(x => x.telId === this.featureInfoData.telId);
    if (!!existing) {
      this.lvInfoForm.controls.cena.setValue(existing.cena);
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-lg modal-dialog modal-dialog-centered' });
  }

  markIt() {
    const existing = this.selected.find(x => x.telId === this.featureInfoData.telId);
    if (!!existing) {
      existing.cena = this.lvInfoForm.value.cena;
    } else {
      this.selected.push({ telId: this.featureInfoData.telId, cena: this.lvInfoForm.value.cena });
    }
    this.modalRef.hide();
  }

  delete(item: IVybraneLv) {
    this.selected = this.selected.filter(x => x.telId !== item.telId);
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
