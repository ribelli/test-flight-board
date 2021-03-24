import {Component, OnInit} from '@angular/core';

const MOBILE_USER_AGENT = /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i;


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public isHidden: boolean;
  public isNowDay: boolean;
  projectName = 'RebelTripApp';

  ngOnInit() {
    const isMobile = navigator.userAgent.match(MOBILE_USER_AGENT);
    const today = new Date();
    const hour = today.getHours();

    this.isHidden = !!isMobile;
    this.isNowDay = hour > 8 && hour < 21;
  }
}
