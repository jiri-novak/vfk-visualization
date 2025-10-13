import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Component, LOCALE_ID } from '@angular/core';
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
import { NewExportDialog } from './components/new-export.dialog/new-export.dialog';
import { CurrentListDialog } from './components/current-list.dialog/current-list.dialog';
import { ExistingListsDialog } from './components/existing-lists.dialog/existing-lists.dialog';

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
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } }
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
