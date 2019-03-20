import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ILocalizationByKu, ILocalizationByPar, ILocalizationByLv, IFeatureInfoData } from '../models/models';
import { stringify } from '@angular/core/src/util';

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

  kuForm: FormGroup;
  kuSubmitted = false;

  parForm: FormGroup;
  parSubmitted = false;

  lvForm: FormGroup;
  lvSubmitted = false;

  featureInfoData: IFeatureInfoData;

  constructor(private formBuilder: FormBuilder) { }

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
  }

  showFeatureInfoData(event: any) {
    this.featureInfoData = event;
  }

  cancelSelection() {
    this.localizationCancel.next();
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
