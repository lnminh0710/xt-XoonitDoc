import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { IWidgetCommonAction, FieldFilter, FilterData } from '../../../models';
import { Subject } from 'rxjs';
import { PropertyPanelService } from '../../../services';
import { takeUntil } from 'rxjs/operators';
import { ContextMenuAction } from '../../../models/context-menu/context-menu';
import { Clipboard } from '@angular/cdk/clipboard';
import { LocalStorageKey } from '@app/app.constants';

@Component({
    selector: 'widget-context-menu',
    templateUrl: './widget-context-menu.component.html',
    styleUrls: ['./widget-context-menu.component.scss'],
})
export class WidgetContextMenuComponent implements OnInit {
    private destroyed$: Subject<boolean> = new Subject();

    private _widgetCommonAction: IWidgetCommonAction;

    public contextMenuActions: Array<ContextMenuAction>;

    @Input() set widgetCommonAction(data: IWidgetCommonAction) {
        this._widgetCommonAction = data;
        if (data) {
            data.getDisplayFields$()
                .pipe(takeUntil(this.destroyed$))
                .subscribe((orgFieldFilters) => {
                    this.displayFields = orgFieldFilters;
                    this.checkAllChecked();
                });
            data.getContextMenu$()
                .pipe(takeUntil(this.destroyed$))
                .subscribe((contextMenu) => {
                    if (contextMenu) {
                        this.contextMenuActions = contextMenu;
                        // this.contextMenu.menuItems.reset([contextMenu.menuItems.toArray(), ...this._orgMenuItems.toArray()])
                    }
                });
        }
    }

    get widgetCommonAction() {
        return this._widgetCommonAction;
    }

    @Input() isMaximized: boolean;
    @Input() isSelectingText: boolean;
    @Input() textField: any;

    @ViewChild('basicMenu') contextMenu: ContextMenuComponent;

    @Output() onSaveSetting: EventEmitter<FilterData> = new EventEmitter();
    @Output() onMaximizeWidget = new EventEmitter<any>(); //Toggle: true: maximize, false: restore

    public displayFields: Array<FieldFilter> = [];
    public allChecked: boolean;
    public settingChanged: boolean;

    constructor(
        public changeDetectorRef: ChangeDetectorRef,
        public propertyPanelService: PropertyPanelService,
        public clipboard: Clipboard,
    ) {}

    private checkAllChecked() {
        const someNotChecked = this.displayFields.some((p) => !p.selected);
        this.allChecked = someNotChecked ? false : true;
    }

    public ngOnInit() {}

    private _orgMenuItems;
    public ngAfterViewInit() {
        this._orgMenuItems = this.contextMenu.menuItems;
    }

    public ngOnDestroy() {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    public reloadData() {
        this.widgetCommonAction.resetWidget();
    }

    public print() {
        this.widgetCommonAction.printWidget();
    }

    public openSeparateWindow() {
        this.widgetCommonAction.openNewWindow();
    }

    public openInsideFullScreen() {
        this.isMaximized = !this.isMaximized;
        this.onMaximizeWidget.emit({
            isMaximized: this.isMaximized,
        });
    }

    public enterNextRow() {}

    public enterNextColumn() {}

    public allCheckChanged(event) {
        this.settingChanged = true;
        this.displayFields.forEach((p) => {
            p.selected = this.allChecked;
        });
    }

    public fieldCheckChanged() {
        this.checkAllChecked();
        this.settingChanged = true;
    }

    public saveSetting() {
        if (this.settingChanged) {
            this.widgetCommonAction.filterDisplayFields(this.displayFields);
            this.onSaveSetting.emit(
                new FilterData({
                    fieldFilters: this.displayFields,
                }),
            );
            this.settingChanged = false;
        }
    }

    public copy() {
        const queryOpts = { name: 'clipboard-read' as PermissionName };
        navigator.permissions.query(queryOpts).then((result) => {
            const data = window.getSelection().toString();
            if (result?.state === 'granted') {
                this.clipboard.copy(data);
                localStorage.setItem(LocalStorageKey.LocalStorageContextMenuClipBoard, '');
            } else if (result?.state == 'prompt') {
                this.clipboard.copy(data);
                localStorage.setItem(LocalStorageKey.LocalStorageContextMenuClipBoard, data);
            } else localStorage.setItem(LocalStorageKey.LocalStorageContextMenuClipBoard, data);
        });
    }

    public paste() {
        const queryOpts = { name: 'clipboard-read' as PermissionName };
        navigator.permissions.query(queryOpts).then((result) => {
            if (result?.state === 'granted' || result?.state == 'prompt')
                navigator['clipboard']
                    .readText()
                    .then((data) => this.pasteDataToField(data))
                    .catch((reason) =>
                        this.pasteDataToField(localStorage.getItem(LocalStorageKey.LocalStorageContextMenuClipBoard)),
                    );
            else this.pasteDataToField(localStorage.getItem(LocalStorageKey.LocalStorageContextMenuClipBoard));
        });
    }

    private pasteDataToField(data) {
        const selectionElement = document.getSelection()?.focusNode?.['lastElementChild'];
        const indexSelectionStart = selectionElement?.selectionStart;
        const indexSelectionEnd = selectionElement?.selectionEnd;
        const currentText = this.textField.target.value;
        const newValue = `${currentText.substring(0, indexSelectionStart)}${data}${currentText.substring(
            indexSelectionEnd,
        )}`;
        this.textField.target.value = newValue;
    }
}
