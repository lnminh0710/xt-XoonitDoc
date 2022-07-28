import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ControlGridModel } from '@app/models';
import { Uti } from '@app/utilities';
import { HeaderNoticeRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-notice-ref';
import { PopupRef } from '@app/xoonit-share/components/global-popup/popup-ref';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { InputDebounceComponent } from '@xn-control/xn-input-debounce';
import { delay, first } from 'rxjs/operators';

@Component({
    selector: 'xn-search-table',
    styleUrls: ['./xn-search-table.component.scss'],
    templateUrl: './xn-search-table.component.html',
})
export class XnSearchTableComponent implements OnInit, OnDestroy {
    readonly guid: string = Uti.guid();
    private selectedItem: { key: string; value: any }[] = [];

    popup: PopupRef<any>;
    loading: boolean;
    firstLoadDialog: boolean;
    hightlightKeywords: string = '';

    private _rowSelected: number;
    public set rowSelected(index: number) {
        if (index < 0 || index >= this.dataSource?.data.length) {
            return;
        } else {
            this._rowSelected = index;
        }
    }

    public get rowSelected(): number {
        return this._rowSelected;
    }

    @Input() globalProperties: any;
    @Input() id: string;
    @Input() dataSource: ControlGridModel = new ControlGridModel();
    @Input() isShowAddNew: boolean;
    @Input() titleAddNew: string = 'Add New';
    @Input() maxHeight: number = 400;
    @Input() parentWidth: number = 400;
    @Input() position: 'start' | 'end' = 'end';
    @Input() top: number = 55;
    @Input() x: number = 10;
    @Input() isAddNew: boolean;
    @Input() title: string = 'Search';
    @Input() placeholder: string;
    @Input() isHiddenSearchBox: boolean;
    @Input() tooltipSearch: string;

    @Output() onSearchChange: EventEmitter<{ searchKey: string; idPerson: string }> = new EventEmitter<{
        searchKey: string;
        idPerson: string;
    }>();
    @Output() onClearSearch: EventEmitter<void> = new EventEmitter<void>();
    @Output() onAddNew: EventEmitter<void> = new EventEmitter<void>();
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() onKeydown: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(InputDebounceComponent) inputComponent: InputDebounceComponent;
    @ViewChild('tableSearchPopup') tableSearchPopup: TemplateRef<any>;
    constructor(private zone: NgZone, private popupService: PopupService) {}

    ngOnInit() {}

    ngOnDestroy() {
        this.close();
    }

    toggleSearch(isShow: boolean, event?: any) {
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        this.loading = true;
        this.firstLoadDialog = true;
        this.popup = this.popupService.open({
            content: this.tableSearchPopup,
            hasBackdrop: true,
            header: {
                title: this.title,
                iconClose: true,
            },
            disableCloseOutside: true,
            optionResize: true,
            optionDrapDrop: true,
            minWidth: (currentWidth * 70) / 100,
            minHeight: (currentHeight * 70) / 100,
        });
        this.onSearchChange.emit({ searchKey: '', idPerson: '-1' });
        this.zone.onStable.pipe(first(), delay(200)).subscribe(() => {
            this.inputComponent?.focusInput?.();
        });
        this.popup.afterClosed$.subscribe(
            (() => {
                this.hightlightKeywords = '';
                this.onClearSearch.emit();
            }).bind(this),
        );
    }

    clear() {
        this.hightlightKeywords = this.inputComponent.inputControl.nativeElement.value = '';
    }

    search(event: string) {
        if (this.hightlightKeywords === event) {
            return;
        }
        this.hightlightKeywords = event;
        this.onSearchChange.emit({ searchKey: event, idPerson: '' });
    }

    addNew() {
        this.close();
        this.onAddNew.emit();
    }

    handleKeydown(event: KeyboardEvent) {
        // switch (event.key) {
        //     case 'ArrowDown':
        //     case 'ArrowUp':
        //         if (this.rowSelected == null) {
        //             this.rowSelected = 0;
        //             return;
        //         }
        //         let nextPosition = event.key === 'ArrowDown' ? 1 : -1;
        //         this.rowSelected += nextPosition;
        //         break;
        //     case 'Enter':
        //         this.select();
        //         break;
        // }
        // this.onKeydown.emit(event);
    }

    selectRow(event) {
        this.selectedItem = event;
    }

    // choose(event?) {
    //     this.close();
    //     this.onSelect.emit(event || this.selectedItem);
    // }

    close() {
        this.rowSelected = null;
        this.popup?.close();
        this.popup = null;
        this.hightlightKeywords = '';
    }

    ready() {
        this.loading = false;
    }

    select() {
        this.popup.close();
        this.onSelect.emit(this.selectedItem);
        this.popup = null;
    }
}
