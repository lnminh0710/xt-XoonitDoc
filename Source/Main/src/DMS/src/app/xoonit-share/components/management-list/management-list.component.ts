import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { MessageModel } from '@app/models';
import { ModalService } from '@app/services';
import { TypeOfList, ItemOfList } from './model';

@Component({
    selector: 'management-list',
    templateUrl: 'management-list.component.html',
    styleUrls: ['./management-list.component.scss'],
})
export class ManagementListComponent {
    public readonly TypeOfList = TypeOfList;

    @Input() widgetId: string;
    @Input() type: TypeOfList = TypeOfList.ICON;
    @Input() headerTitle: string = '';
    @Input() list: ItemOfList[] = [];
    @Input() selectedItem: ItemOfList;
    @Input() hideAllDeleteButton: boolean;
    @Input() hideAllEditButton: boolean;
    @Input() iconTemplateForAll: TemplateRef<any>;
    @Output() onAdd: EventEmitter<void> = new EventEmitter<void>();
    @Output() onEdit: EventEmitter<ItemOfList> = new EventEmitter<ItemOfList>();
    @Output() onDelete: EventEmitter<ItemOfList> = new EventEmitter<ItemOfList>();
    @Output() onRowClickItem: EventEmitter<ItemOfList> = new EventEmitter<ItemOfList>();
    @Output() onChange: EventEmitter<ItemOfList> = new EventEmitter<ItemOfList>();

    constructor(private modalService: ModalService) {}

    addItem() {
        this.onAdd.emit();
    }

    editItem(item: ItemOfList) {
        this.onEdit.emit(item);
    }

    deleteItem(item: ItemOfList) {
        this.modalService.confirmDeleteMessageHtmlContent(
            new MessageModel({
                message: [
                    { key: '<p>' },
                    { key: 'Modal_Message__AreYouSureToDeleteThisItemWithoutQuestion' },
                    { key: '<strong>' },
                    { key: item.name },
                    { key: '</strong>' },
                    { key: ' ?</p>' },
                ],
                callBack1: this.emitDeleteItem.bind(this, item),
            }),
        );
    }

    emitDeleteItem(item: ItemOfList) {
        this.onDelete.emit(item);
    }

    rowClickItem(item: ItemOfList) {
        this.onRowClickItem.emit(item);
    }

    changeStatus(item: ItemOfList) {
        this.onChange.emit(item);
    }
}
