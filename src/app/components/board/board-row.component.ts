import {Component, Input} from '@angular/core';
import {BoardItem} from '../../entities/board-item';
import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-board-row',
  templateUrl: './board-row.component.html',
  styleUrls: ['./board-row.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-30%)'}),
        animate('230ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('230ms ease-in', style({transform: 'translateY(-50%)'}))
      ])
    ])
  ]
})
export class BoardRowComponent {
  @Input() item: BoardItem;
}

