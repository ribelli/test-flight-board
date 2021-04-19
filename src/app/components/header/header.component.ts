import {Component, OnInit} from '@angular/core';
import {MOBILE_USER_AGENTS} from '@app/entities/user-agents.const';
import {DaytimeHoursTypeEnum} from '@app/entities/daytime-hours';

const PROJECT_NAME = 'RebelTripApp';
const COLORS_OPTION = {
  dayTheme: '#8f87ff',
  nightTheme: '#161248',
};

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public isHidden: boolean;
  public isNowDay: boolean;
  public projectName = PROJECT_NAME;
  public colorsOption = COLORS_OPTION;

  ngOnInit() {
    const isMobile = navigator.userAgent.match(MOBILE_USER_AGENTS);
    const today = new Date();
    const hours = today.getHours();

    this.isHidden = !!isMobile;
    this.isNowDay =
      hours > DaytimeHoursTypeEnum.morning && hours < DaytimeHoursTypeEnum.night;
  }
}
