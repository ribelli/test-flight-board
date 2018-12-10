import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';

import {NgSelectModule} from '@ng-select/ng-select';

import {RebelComponentsModule} from './components/components.module';
import {AppComponent} from './components/app.component';
import {AppRoutingModule} from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RebelComponentsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  exports: [
    AppComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
