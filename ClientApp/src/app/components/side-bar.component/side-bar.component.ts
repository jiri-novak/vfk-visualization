import { ToastrService } from 'ngx-toastr';
import { debounceTime, firstValueFrom, Observable, Subscription, switchMap } from 'rxjs';
import { Component, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ILocalizationByKu, ILocalizationByPar, ILocalizationByLv, IFeatureInfoData, IVybraneLv, IKatuze, ISession } from '../models/models';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ServerAppService } from 'src/app/services/serverapp.service';

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

  modalRef: BsModalRef;

  session: ISession;

  katuzeForm: UntypedFormGroup;
  katuzeOptions: Observable<IKatuze[]>;

  parForm: UntypedFormGroup;
  parSubmitted = false;

  lvForm: UntypedFormGroup;
  lvSubmitted = false;

  lvInfoForm: UntypedFormGroup;
  lvInfoSubmitted = false;

  sessionCollapsed = false;
  legendCollapsed = true;
  localizationCollapsed = false;
  infoCollapsed = false;
  selectedCollapsed = true;

  selected: IVybraneLv[] = [];

  featureInfoData: IFeatureInfoData;

  constructor(
    private toastrService: ToastrService,
    private formBuilder: UntypedFormBuilder,
    private modalService: BsModalService,
    private serverAppService: ServerAppService) {
    this.katuzeForm = this.formBuilder.group({
      katuze: ['', Validators.required]
    });

    this.katuzeOptions = this.katuzeForm.controls.katuze.valueChanges
      .pipe(debounceTime(10), switchMap(s => this.serverAppService.getKus(s)));

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
  }

  async ngOnInit() {
    this.session = await firstValueFrom(this.serverAppService.getSession());
    console.log(this.session);

    if (!!this.session.activeKatuzeKod && !!this.session.activeKatuzeName) {
      const katuze: IKatuze = { id: this.session.activeKatuzeKod, name: this.session.activeKatuzeName };
      this.katuzeForm.controls.katuze.setValue(katuze);
    }
  }

  displayFn(katuze: IKatuze): string {
    if (!!katuze) {
      return `${katuze.name} (${katuze.id})`;
    }
    else {
      return '';
    }
  }

  selectKu(katuze: IKatuze) {
    this.busy = this.serverAppService.setActiveKu(katuze).subscribe(s => this.session = s);
  }

  showFeatureInfoData(event: IFeatureInfoData) {
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
    console.log(`Lokalizace na katastralni uzemi: ${this.session.activeKatuzeKod}.`);
    this.localizationByKu.next({
      katuzeKod: this.session.activeKatuzeKod
    });
  }

  onLocalizePar() {
    console.log(`Lokalizace na parcelu: ${this.session.activeKatuzeKod}, ${this.parForm.value.parCislo}.`);
    this.localizationByPar.next({
      katuzeKod: this.session.activeKatuzeKod,
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
