import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { AlertModule } from 'ngx-bootstrap/alert';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { MapComponent } from './components/map.component/map.component';
import { SideBarComponent } from './components/side-bar.component/side-bar.component';

import { OlStyles } from './services/ol.styling.service';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SideBarComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    TabsModule.forRoot(),
    AlertModule.forRoot()
  ],
  providers: [
    OlStyles
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
