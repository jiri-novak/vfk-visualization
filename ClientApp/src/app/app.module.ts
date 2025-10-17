import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Component, LOCALE_ID, Injectable } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs';
registerLocaleData(localeCs);

import { TabsModule } from 'ngx-bootstrap/tabs';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { NgBusyModule, BusyConfig, BUSY_CONFIG_DEFAULTS } from 'ng-busy';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { MapComponent } from './components/map.component/map.component';
import { SideBarComponent } from './components/side-bar.component/side-bar.component';

import { OlStyles } from './services/ol.styling.service';
import { ServerAppService } from './services/serverapp.service';

import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { NewExportDialog } from './components/new-export.dialog/new-export.dialog';
import { CurrentListDialog } from './components/current-list.dialog/current-list.dialog';
import { ExistingListsDialog } from './components/existing-lists.dialog/existing-lists.dialog';
import { ConfirmDialog } from './components/confirm.dialog/confirm.dialog';

@Component({
  selector: 'app-busy',
  template: `
  <div class="spinner-point">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
  </div>
  `,
  standalone: false
})
export class CustomBusyComponent { }

export function busyConfigFactory(): BusyConfig {
  return {
    message: '',
    delay: 200,
    template: CustomBusyComponent,
    minDuration: BUSY_CONFIG_DEFAULTS.minDuration,
    backdrop: true,
    wrapperClass: BUSY_CONFIG_DEFAULTS.wrapperClass,
    templateNgStyle: BUSY_CONFIG_DEFAULTS.templateNgStyle,
    disableAnimation: BUSY_CONFIG_DEFAULTS.disableAnimation
  };
}

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
  itemsPerPageLabel = 'Záznamů na stránku';
  nextPageLabel = 'Další stránka';
  previousPageLabel = 'Předchozí stránka';
  firstPageLabel = 'První stránka';
  lastPageLabel = 'Poslední stránka';

  getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return '0 z ' + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return startIndex + 1 + ' - ' + endIndex + ' z ' + length;
  };
}

@NgModule({
  exports: [
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatTabsModule,
    MatDialogModule,
    MatBadgeModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }
  ]
})
export class MaterialModule { };

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SideBarComponent,
    CustomBusyComponent,
    NewExportDialog,
    CurrentListDialog,
    ConfirmDialog,
    ExistingListsDialog,
  ],
  bootstrap: [AppComponent],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    TabsModule.forRoot(),
    AlertModule.forRoot(),
    AccordionModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 5000,
      autoDismiss: true,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    NgBusyModule.forRoot(busyConfigFactory())],
  providers: [
    { provide: LOCALE_ID, useValue: 'cs-CZ' },
    OlStyles,
    ServerAppService,
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule { }
