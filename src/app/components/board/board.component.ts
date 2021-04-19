import {
  AfterContentInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BoardService } from '@services/board.service';
import * as moment from 'moment';
import { Moment } from '../../../../node_modules/moment/src/moment';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'lodash/filter';
import { BoardRowComponent } from './board-row.component';
import {
  DATE_FORMAT,
  DIRECTION_OPTIONS,
  FLIGHT_RACE_CONFIG,
  FlightOptions,
  SelectedDates,
  MAX_PAGE,
  STATUS_CODES,
  WRONG_DATA_TEXT,
  DATE_RANGES,
  PICKED_DATES,
} from '@app/entities/board-settings';


// will need to add Observable<> for flights;

@Component({
  selector: 'app-board-component',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnDestroy, AfterContentInit {
  @ViewChild('scrollTop') private scrollContainer: ElementRef;
  @ViewChild(BoardRowComponent) child: BoardRowComponent;

  public boards = [];
  public flightOptions: FlightOptions;
  public flightRaceConfig = FLIGHT_RACE_CONFIG;
  public wrongDataText: string = WRONG_DATA_TEXT;
  public dateFormat: string = DATE_FORMAT;
  public maxPage = MAX_PAGE;
  public dateRanges = DATE_RANGES;
  public directions = DIRECTION_OPTIONS;
  public statusCodes = STATUS_CODES;
  public selectedDates: SelectedDates = PICKED_DATES;
  public currentDirection = this.directions[0];
  public currentStatusCode = this.statusCodes[0];
  public startTabId = 0;
  public tabs: string[] = Object.values(this.directions);
  public activeTab = this.tabs[this.startTabId];
  public isCurrentStatusCode = false;
  public isHiddenButton = false;
  public isDataLoaded = false;
  public isWrongData = false;
  public isFilteredData = false;
  public singleSelect: any[];
  private currentFlightsChanges: Subscription;
  private page = 1;
  private perPage = 20;

  constructor(private boardService: BoardService) {}

  ngOnDestroy(): void {
    this.currentFlightsChanges.unsubscribe();
  }

  ngAfterContentInit(): void {
    this.flightOptions = {
      dateStart: this.selectedDates.start.toISOString(),
      dateEnd: this.selectedDates.end.toISOString(),
      perPage: this.perPage,
      page: this.page,
    };

    this.getCurrentFlights(this.currentDirection, this.flightOptions);
  }

  getFlights(direction: string, from: Moment, to: Moment, perPage: number, page: number): { result: Observable<any> } {
    return this.boardService.getFlights(direction, from, to, perPage, page);
  }

  getCurrentFlights(direction: string, options: Moment | number): void {
    this.page = 0;
    this.isDataLoaded = false;
    this.currentFlightsChanges =
      this.getFlights(direction, options.dateStart, options.dateEnd, options.perPage, options.page)
        .result
        .subscribe(
        boards => {
            if (!boards || !boards.length) {
              this.isWrongData = true;
              return;
            }
            this.scrollToTop();
            this.boards = boards;
            this.isFilteredData = false;
            this.isDataLoaded = true;
          },
          error => {
            console.log(error);
          }
        );
    this.isWrongData = false;
  }

  setDate(): void {
    this.flightOptions.page = 0;
    this.flightOptions.dateStart = moment(this.selectedDates.start).toISOString();
    this.flightOptions.dateEnd = moment(this.selectedDates.end).toISOString();

    this.statusCodeUpdated();
  }

  statusCodeUpdated() {
    this.isCurrentStatusCode ? this.filterByData() :
      this.getCurrentFlights(this.currentDirection, this.flightOptions);
  }

  filterByData(): void {
    this.getAllFlights()
      .result
        .subscribe(
        boards => {
            if (!boards || !boards.length) {
              return;
            }
            this.boards = filter(boards, { status_code: '1' });
            this.isFilteredData = true;
          },
            error => {
            console.log(error);
          }
      );
  }

  setStatusCode(): void {
    this.isCurrentStatusCode = !this.isCurrentStatusCode;

    this.statusCodeUpdated();
  }

  getAllFlights(): { result: Observable<any> } {
    return this.getFlights(
      this.currentDirection,
      this.flightOptions.dateStart,
      this.flightOptions.dateEnd,
      this.maxPage,
      this.page,
    );
  }

  getFlightsFromRace(): void {
    // will need to make this method later

    this.isFilteredData = true;
    this.boards = this.singleSelect;
  }

  changeFlightStatus(index: number): void {
    this.currentDirection = this.tabs[index];

    this.statusCodeUpdated();
    this.activeTab = this.tabs[index];
  }

  setStateSubRow(index: number): void {
    this.boards[index].isViewContainer = !this.boards[index].isViewContainer;
  }

  onScroll(): void {
    if (this.isFilteredData) {
      return;
    }
    this.page++;
    this.isHiddenButton = false;
    this.getFlights(
      this.currentDirection, this.flightOptions.dateStart, this.flightOptions.dateEnd, this.perPage, this.page
    ).result
      .subscribe(
        flights => {
            if (!flights || !flights.length) {
              return;
            }
            this.boards.push(...flights);
          },
        error => {
          console.log(error);
          }
      );
  }

  scrollToTop(): void {
    try {
      this.isHiddenButton = true;
      this.scrollContainer.nativeElement.scrollTop = 0;
    } catch (error) {
      console.log(error);
    }
  }
}
