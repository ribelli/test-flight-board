import {AfterContentInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BoardService} from '../../services/board.service';
import {BoardItem} from '../../entities/board-item';
import * as moment from 'moment';
import {BoardRowComponent} from './board-row.component';
import {filter} from 'lodash';

// will need to add Observable<> for flights;

const wrongDataText = 'Попробуйте задать другие критерии';

@Component({
  selector: 'app-board-component',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy, AfterContentInit {
  @ViewChild('scrollTop') private scrollContainer: ElementRef;
  @ViewChild(BoardRowComponent) child: BoardRowComponent;

  public flightOptions: {
    dateStart: moment.Moment | string;
    dateEnd: moment.Moment | string;
    perPage: number;
    page: number
  };
  public flightRaceConfig = {
    displayKey: 'flt',
    placeholder: 'Select flight number',
    search: true
  };
  public dateRanges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
  };
  public boards = [];
  private currentFlightsChanges: any;
  public wrongDataText = wrongDataText;
  public direction = {0: 'departure', 1: 'arrival'};
  public tabs: string[] = Object.values(this.direction);
  public activeTab = this.tabs[0];
  private currentDirection = this.direction[0];
  public statusCode = {0: 'delayed', 1: 'ontime'};
  public currentStatusCode = false;
  public isDataLoaded = false;
  public isHiddenButton = false;
  public isWrongData = false;
  private page = 1;
  private perPage = 20;
  private filteredData = false;
  public singleSelect: any = [];
  public selectedDates: any;
  selectedBoardItem: BoardItem;

  constructor(private boardService: BoardService) {
  }

  ngOnInit() {
    this.selectedDates = {
      start: moment(),
      end: moment().add(1, 'days')
    };
  }

  ngOnDestroy() {
    this.currentFlightsChanges.unsubscribe();
  }

  ngAfterContentInit() {
    this.flightOptions = {
      dateStart: this.selectedDates.start.toISOString(),
      dateEnd: this.selectedDates.end.toISOString(),
      perPage: this.perPage,
      page: this.page
    };
    this.getCurrentFlights(this.currentDirection, this.flightOptions);
  }

  getCurrentFlights(direction, options) {
    this.page = 0;
    this.isDataLoaded = false;
    this.currentFlightsChanges = this.boardService.getFlights(
      direction, options.dateStart, options.dateEnd, options.perPage, options.page)
      .result
      .subscribe(boards => {
        if (!boards || !boards.length) {
          this.isWrongData = true;
          return;
        }
        this.scrollToTop();
        this.boards = boards;
        this.filteredData = false;
        this.isDataLoaded = true;
      }, error => {
        console.log(error);
      });
    this.isWrongData = false;
  }

  setDate() {
    this.flightOptions.page = 0;
    this.flightOptions.dateStart = moment(this.selectedDates.start).toISOString();
    this.flightOptions.dateEnd = moment(this.selectedDates.end).toISOString();

    if (this.currentStatusCode) {
      this.filterByData();
    } else {
      this.getCurrentFlights(this.currentDirection, this.flightOptions);
    }
  }

  filterByData() {
    this.getAllFlights().result.subscribe(boards => {
      if (!boards || !boards.length) {
        return;
      }
      this.boards = filter(boards, {status_code: '1'});
      this.filteredData = true;
    }, error => {
      console.log(error);
    });
  }

  setStatusCode() {
    this.currentStatusCode = !this.currentStatusCode;
    if (this.currentStatusCode) {
      this.filterByData();
    } else {
      this.getCurrentFlights(this.currentDirection, this.flightOptions);
    }
  }

  getAllFlights() {
    const maxPage = 99999;
    return this.boardService.getFlights(
      this.currentDirection, this.flightOptions.dateStart, this.flightOptions.dateEnd, maxPage, this.page
    );
  }

  getFlightsFromRace() {
    // will need to make this method later
    
    this.filteredData = true;
    this.boards = this.singleSelect;
  }

  changeFlightStatus(index) {
    this.currentDirection = this.tabs[index];
    if (this.currentStatusCode) {
      this.filterByData();
    } else {
      this.getCurrentFlights(this.currentDirection, this.flightOptions);
    }
    this.activeTab = this.tabs[index];
  }

  setStateSubRow(index) {
    this.boards[index].isViewContainer = !this.boards[index].isViewContainer;
  }

  onScroll() {
    if (this.filteredData) {
      return;
    }
    this.page++;
    this.isHiddenButton = false;
    this.boardService.getFlights(
      this.currentDirection, this.flightOptions.dateStart, this.flightOptions.dateEnd, this.perPage, this.page)
      .result
      .subscribe(flights => {
        if (!flights || !flights.length) {
          return;
        }
        this.boards.push(...flights);
      }, error => {
        console.log(error);
      });
  }

  scrollToTop() {
    try {
      this.isHiddenButton = true;
      this.scrollContainer.nativeElement.scrollTop = 0;
    } catch (error) {
      console.log(error);
    }
  }
}
