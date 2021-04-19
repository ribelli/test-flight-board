import {Moment} from '../../../node_modules/moment/src/moment';
import {FlightRaceConfig} from '@app/entities/flight-settings';
import * as moment from 'moment';


const DAYS_TEXT = 'days';
const PLACEHOLDER_TEXT = 'Select flight number';

export const WRONG_DATA_TEXT = 'Something went wrong. No flights found for current date/dates.';
export const DATE_FORMAT = 'DD/MM/YYYY';
export const MAX_PAGE = 1000;

export interface FlightOptions {
  dateStart: Moment | string;
  dateEnd: Moment | string;
  perPage: number;
  page: number;
}

export interface SelectedDates {
  start: Moment | any;
  end: Moment | any;
}

export const DATE_RANGES = {
  'Today': [moment(), moment()],
  'Yesterday': [moment().subtract(1, DAYS_TEXT), moment().subtract(1, DAYS_TEXT)],
  'Last 7 Days': [moment().subtract(6, DAYS_TEXT), moment()],
};

export const PICKED_DATES = {
  start: moment(),
  end: moment().add(1, DAYS_TEXT)
};

export const FLIGHT_RACE_CONFIG: FlightRaceConfig = {
  displayKey: 'flt',
  placeholder: PLACEHOLDER_TEXT,
  search: true,
};

export const DIRECTION_OPTIONS = {
  0: 'departure',
  1: 'arrival',
};

export const STATUS_CODES = {
  0: 'delayed',
  1: 'ontime'
};
