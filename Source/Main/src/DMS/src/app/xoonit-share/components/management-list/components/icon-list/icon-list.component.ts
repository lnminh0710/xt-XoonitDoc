import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { RoleIdsDisableEdit } from '@app/app.constants';
import { ItemOfList } from '../../model';

@Component({
    selector: 'icon-list',
    templateUrl: 'icon-list.component.html',
    styleUrls: ['./icon-list.component.scss'],
})
export class IconListComponent {
    public readonly ROLE_IDS_DISABLE_EDIT_CONSTANT = RoleIdsDisableEdit;

    @Input() widgetId: string;
    @Input() headerTitle: string = '';
    @Input() list: ItemOfList[] = [];
    @Input() selectedItem: ItemOfList;
    @Input() hideAllDeleteButton: boolean;
    @Input() hideAllEditButton: boolean;
    @Input() iconTemplateForAll: TemplateRef<any>;
    @Output() onAdd: EventEmitter<void> = new EventEmitter<void>();
    @Output() onEdit: EventEmitter<ItemOfList> = new EventEmitter<ItemOfList>();
    @Output() onDelete: EventEmitter<ItemOfList> = new EventEmitter<ItemOfList>();
    @Output() onRowClick: EventEmitter<ItemOfList> = new EventEmitter<ItemOfList>();

    constructor() {}

    addItem() {
        this.onAdd.emit();
    }

    editItem(event: MouseEvent, item: ItemOfList) {
        event.stopPropagation();
        this.onEdit.emit(item);
    }

    deleteItem(event: MouseEvent, item: ItemOfList) {
        event.stopPropagation();
        this.onDelete.emit(item);
    }

    rowClickItem(item: ItemOfList) {
        this.selectedItem = item;
        this.onRowClick.emit(item);
    }
}
