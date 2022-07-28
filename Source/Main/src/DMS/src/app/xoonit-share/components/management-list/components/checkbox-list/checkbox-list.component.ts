import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemOfList } from '../../model';

@Component({
    selector: 'checkbox-list',
    templateUrl: 'checkbox-list.component.html',
    styleUrls: ['./checkbox-list.component.scss'],
})
export class CheckboxListComponent {

    @Input() list: ItemOfList[] = [];
    @Output() onChange: EventEmitter<ItemOfList> = new EventEmitter<ItemOfList>();

    changeStatus(item: ItemOfList) {
        item.isActive = !item.isActive;
        this.onChange.emit(item);
    }
}
