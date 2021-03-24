import {Injectable, NgModule} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {map} from 'rxjs/operators';

const GENERAL_URL = 'https://www.svo.aero/bitrix/timetable';
const USE_MOCK = false;

@Injectable()

@NgModule({
  imports: [
    HttpClient,
    BrowserModule,
  ]
})
export class BoardService {
  constructor(private http: HttpClient) {}

  getFlights(direction: string, dateStart, dateEnd, perPage: number, page: number) {
    if (USE_MOCK) {
      // return apiMock.items;
    } else {
      const params = new HttpParams();
      const headers = new HttpHeaders();
      params.set('direction', direction);
      headers.set('Accept', 'application/json');

      const locale = 'en';
      const url = `${GENERAL_URL}/?direction=${direction}&dateStart=${dateStart}&dateEnd=${dateEnd}` +
        `&perPage=${perPage}&page=${page}&locale=${locale}`;

      const result = this.http.get(url, {params, headers})
        .pipe(map(resp => {
          return resp['items'];
        }));
      return {
        result
      };
    }
  }

}

const apiMock = {
  'items': [
    {
      'isViewContainer': true,
      'id': 'D',
      'aircraft_type_name': 'Airbus A320',
      'flt': 555,
      'dat': '2017-12-24T17:00:00.000+01:00',
      'estimated_chin_start': '2017-12-24T17:00:00',
      'co': {
        'name': 'KLM'
      },
      'mar1': {
        'iata': 'SVO',
        'city': 'Москва'
      },
      'mar2': {
        'iata': 'AMS',
        'city': 'Амстердам'
      },
      'vip_status_eng': 'Boarding soon',
      'gate_id': '40',
      't_boarding_start': '2018-11-17T17:38:25+03:00',
      't_bording_finish': '2018-11-17T17:48:25+03:00'
    },
    {
      'isViewContainer': true,
      'id': 'D',
      'aircraft_type_name': 'Airbus A320',
      'flt': 555,
      'dat': '2017-12-24T17:00:00.000+01:00',
      'estimated_chin_start': '2017-12-24T17:00:00',
      'co': {
        'name': 'KLM'
      },
      'mar1': {
        'iata': 'SVO',
        'city': 'Москва'
      },
      'mar2': {
        'iata': 'AMS',
        'city': 'Амстердам'
      },
      'vip_status_eng': 'Boarding soon',
      'gate_id': '40',
      't_boarding_start': '2018-11-17T17:38:25+03:00',
      't_bording_finish': '2018-11-17T17:48:25+03:00'
    }
  ]
};
