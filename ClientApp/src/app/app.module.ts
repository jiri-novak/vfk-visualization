import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { NgBusyModule, BusyConfig, BUSY_CONFIG_DEFAULTS } from 'ng-busy';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { MapComponent } from './components/map.component/map.component';
import { SideBarComponent } from './components/side-bar.component/side-bar.component';

import { OlStyles } from './services/ol.styling.service';
import { ServerAppService } from './services/serverapp.service';

@Component({
  selector: 'app-busy',
  template: `
  <div class="spinner-point">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
  </div>
  `
})
export class CustomBusyComponent {}

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
    declarations: [
        AppComponent,
        MapComponent,
        SideBarComponent,
        CustomBusyComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
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
        NgBusyModule.forRoot(busyConfigFactory())
    ],
    providers: [
        OlStyles,
        ServerAppService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
