import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgDatepickerModule} from 'ng2-datepicker';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {SelectDropDownModule} from 'ngx-select-dropdown';

import {BoardComponent} from './board/board.component';
import {BoardRowComponent} from './board/board-row.component';
import {HeaderComponent} from './header/header.component';
import {HeaderContentComponent} from './header/header-content.component';
import {SpinnerComponent} from './spinner/spinner.component';
import {BoardService} from '../services/board.service';

@NgModule({
  declarations: [
    BoardComponent,
    BoardRowComponent,
    HeaderComponent,
    HeaderContentComponent,
    SpinnerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    NgDatepickerModule,
    NgxDaterangepickerMd,
    SelectDropDownModule,
    InfiniteScrollModule
  ],
  exports: [
    BoardComponent,
    BoardRowComponent,
    HeaderComponent,
    HeaderContentComponent,
    SpinnerComponent
  ],
  providers: [BoardService],
  bootstrap: []
})
export class RebelComponentsModule {
}
