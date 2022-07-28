import { Component, Input, EventEmitter, Output, ElementRef, OnInit, OnDestroy } from '@angular/core';
import {
    FilterModeEnum, WidgetFormTypeEnum, OrderDataEntryWidgetLayoutModeEnum,
    AccessRightWidgetCommandButtonEnum
} from '@app/app.constants';
import { FilterMode, FieldFilter, ColumnLayoutSetting, RowSetting, WidgetFormType, Module, OrderDataEntryProperties, GroupFieldFilter } from '@app/models';
import isNil from 'lodash-es/isNil';
import cloneDeep from 'lodash-es/cloneDeep';
import { Uti } from '@app/utilities';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import {
    AppErrorHandler,
    PropertyPanelService
} from '@app/services';

@Component({
    selector: 'filter-menu',
    styleUrls: ['./filter-menu.component.scss'],
    templateUrl: './filter-menu.component.html'
})
export class FilterMenuComponent implements OnInit, OnDestroy {
    @Input() accessRight: any = {};
    @Input() filterModes: FilterMode[] = [];
    @Input() isTableField: boolean = false;
    @Input() isHidden: boolean = false;
    @Input() isSubDisplay: boolean;
    @Input() menuWidgetStatus: any;
    @Input() columnLayoutsetting: ColumnLayoutSetting = null;
    @Input() rowSetting: RowSetting = null;
    @Input() isShowProperties: boolean = true;
    @Input() isShowWidgetSetting: boolean = true;
    @Input() isShowToolPanelSetting: boolean = true;
    @Input() isShowOrderDataEntryPaymentSetting = false;
    @Input() isShowODEGridProperties = false;
    @Input() orderDataEntryWidgetLayoutMode: OrderDataEntryWidgetLayoutModeEnum;
    @Input() orderDataEntryProperties: OrderDataEntryProperties;
    @Input() widgetType: any = null;
    @Input() currentModule: Module;
    @Input() set fieldFilters(data: FieldFilter[]) {
        this._fieldFilters = data;
        this.copyFieldFilters = cloneDeep(data);
    }
    get fieldFilters() {
        return this._fieldFilters;
    }

    private _groupFieldFilters: Array<GroupFieldFilter>;
    @Input() set groupFieldFilters(data: Array<GroupFieldFilter>) {
        this._groupFieldFilters = data;
    }

    get groupFieldFilters() {
        return this._groupFieldFilters;
    }

    @Input() set widgetFormTypes(_widgetFormTypes: WidgetFormType[]) {
        this.filterWidgetFormTypes = _widgetFormTypes;
        if (_widgetFormTypes && _widgetFormTypes.length) {
            this.selectedWidgetFormType = _widgetFormTypes.find((item) => item.selected).widgetFormType;
        }
    }

    @Input() set position(parent: any) {
        this.initData();
        if (parent && parent.parent && parent.parent.length) {
            this.parentElement = parent.parent;
        }
    }
    @Input() widgetProperties: any;
    @Input() globalProperties: any;
    @Input() gridLayoutSettings: any;

    @Output()
    onChangeDisplayMode = new EventEmitter<FilterMode>();

    @Output()
    onChangeFieldFilter = new EventEmitter<any>();

    @Output()
    onChangeWidgetFormType = new EventEmitter<WidgetFormTypeEnum>();

    @Output()
    onChangeColumnLayoutsetting = new EventEmitter<ColumnLayoutSetting>();

    @Output()
    onChangeRowSetting = new EventEmitter<RowSetting>();

    @Output()
    onChangeODEProperties = new EventEmitter<any>();

    @Output()
    onPropertiesItemClick = new EventEmitter<any>();

    @Output()
    onSettingMenuChanged = new EventEmitter<boolean>();

    private _isMenuChanged: boolean;
    public set isMenuChanged(status: boolean) {
        this._isMenuChanged = status;
        this.onSettingMenuChanged.emit(status);
    }

    public get isMenuChanged() {
        return this._isMenuChanged;
    }

    public randomNumb = Uti.guid();
    public isShowAllWithoutFilterMode: boolean = false;
    public filterWidgetFormTypes: WidgetFormType[];
    public copyFieldFilters: FieldFilter[];
    public menuDataSettingName = 'widget-data-setting-' + Math.round(Math.random() * 1000000000);

    private parentElement: any;
    private perfectScrollbarConfig: any = {};
    private isSelectedAllField: boolean = false;
    private _previousODEWidgetLayoutMode: number;
    private _previousODEProperties: OrderDataEntryProperties;
    private selectedWidgetFormType: WidgetFormTypeEnum = WidgetFormTypeEnum.List;
    private seletedDisplayMode: FilterMode;
    private _fieldFilters: FieldFilter[];
    constructor(
        private _eref: ElementRef,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelService: PropertyPanelService,
        private dispatcher: ReducerManagerDispatcher,
        private store: Store<AppState>
    ) {
    }

    ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: true,
            suppressScrollY: false
        }
        this.initData();
        this.convertTextLengthToPixels();
        this.isMenuChanged = false;
    }

    private initData() {
        if (this.filterModes && this.filterModes.length &&
            this.filterModes.find((item) => item.selected && item.mode === FilterModeEnum.ShowAllWithoutFilter)) {
            this.isShowAllWithoutFilterMode = true;
        }
        this.copyFieldFilters = cloneDeep(this.fieldFilters);
        if (this.copyFieldFilters) {
            if (this.isSubDisplay)
                this.copyFieldFilters = this.copyFieldFilters.filter((item) => item.isTableField == this.isTableField);
            else
                this.copyFieldFilters = this.copyFieldFilters.filter((item) => isNil(item.isTableField) || !item.isTableField);
            if (this.fieldFilters && this.fieldFilters.length &&
                !this.copyFieldFilters.find((item) => !item.selected)) {
                this.isSelectedAllField = true;
            }
        }
        if (this.filterModes) {
            const filteredItem = this.filterModes.find((item) => item.selected && item.mode != FilterModeEnum.ShowAllWithoutFilter);
            if (filteredItem)
                this.seletedDisplayMode = filteredItem;
        }
        this._previousODEWidgetLayoutMode = this.orderDataEntryWidgetLayoutMode;
        this._previousODEProperties = this.orderDataEntryProperties;
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public handleMouseOverSubmenu($event) {
        setTimeout(() => {
            // current menu
            const currentMenuEle = $event.target;
            let parentOfCurrentMenuWidth = 0;
            let parentsOfCurrentMenuTotalWidth = 0;
            const calcTotalWidthOfMenuParents = (currentMenuEle) => {
                const parentOfCurrentMenuEle = $(currentMenuEle).parent().closest('ul.sub-menu');
                if (parentOfCurrentMenuEle.length && !parentOfCurrentMenuEle.hasClass('filter-menu-top')) {
                    if (parentOfCurrentMenuWidth <= 0) {
                        parentOfCurrentMenuWidth += parentOfCurrentMenuEle.width();
                    }
                    parentsOfCurrentMenuTotalWidth += parentOfCurrentMenuEle.width();
                    calcTotalWidthOfMenuParents(parentOfCurrentMenuEle);
                }
            };
            calcTotalWidthOfMenuParents(currentMenuEle);
            const currentOpenChildMenu = $('ul.sub-menu', currentMenuEle).first();

            // parent menu and container
            const widgetContainerEle = this.parentElement.closest("widget-container");
            let topParentMenuWidth = $("ul.filter-menu-top", this._eref.nativeElement).width();
            const menuIconWidth = 25;
            const menuIconHeight = 50;
            const positionLeftOfMenuIcon = this.parentElement.position().left + $(this.parentElement).width() - menuIconWidth;
            let positionTopOfMenuIcon = this.parentElement.position().top + menuIconHeight;
            const pageEle = widgetContainerEle.closest("div");
            const pageWidth = pageEle.get(0).scrollWidth;
            const pageHeight = pageEle.get(0).scrollHeight;
            // check if under combination menu
            if (this._eref.nativeElement.attributes['name']) {
                const parentOfTopParentMenu = $(this._eref.nativeElement).closest('ul.widget-toolbar-combination-menu');
                const menuItemHeight = 30;
                if (parentOfTopParentMenu.length) {
                    topParentMenuWidth += parentOfTopParentMenu.width();
                    if (this._eref.nativeElement.attributes['name'].name.indexOf('second') >= 0) {
                        positionTopOfMenuIcon += menuItemHeight;
                    }
                }
            }

            // set left position of menu
            const currentOpenChildMenuWidth = currentOpenChildMenu.width();
            const totalWidthWillDisplayOnLeft = positionLeftOfMenuIcon + topParentMenuWidth + parentsOfCurrentMenuTotalWidth + currentOpenChildMenuWidth;
            let positionOfOpenChildMenu = 1 + (parentOfCurrentMenuWidth > 0 ? parentOfCurrentMenuWidth : topParentMenuWidth);
            if (totalWidthWillDisplayOnLeft > pageWidth) {
                positionOfOpenChildMenu = -currentOpenChildMenuWidth - 3;
            }
            currentOpenChildMenu.css('left', (positionOfOpenChildMenu) + 'px');

            // set top position of menu (only case missing space at the bottom)
            let parentOfCurrentMenuTop = 0;
            if ($(currentMenuEle).attr('data-index')) {
                const index = parseInt($(currentMenuEle).attr('data-index'));
                const menuItemHeight = 30;
                if (index > 1) {
                    parentOfCurrentMenuTop += (index - 1) * menuItemHeight;
                } else {
                    parentOfCurrentMenuTop += 5;
                }
            }
            setTimeout(() => {
                const currentOpenChildMenuHeight = currentOpenChildMenu.height();
                const totalHeightWillDisplayOnTop = positionTopOfMenuIcon + parentOfCurrentMenuTop + currentOpenChildMenuHeight;
                if (totalHeightWillDisplayOnTop > pageHeight) {
                    const newTopPosition = (pageHeight - totalHeightWillDisplayOnTop);
                    currentOpenChildMenu.css('top', (newTopPosition) + 'px');
                } else {
                    currentOpenChildMenu.css('top', 0);
                }
            }, 300);

        }, 200)
    }

    changeDisplayMode(evt) {
        this.isShowAllWithoutFilterMode = evt.source.value == FilterModeEnum.ShowAllWithoutFilter + '';
        let newFilterMode = new FilterMode({ value: evt.source.value, isSub: this.isSubDisplay })
        this.onChangeDisplayMode.emit(newFilterMode);
        if (!this.isShowAllWithoutFilterMode && (!this.seletedDisplayMode || this.seletedDisplayMode.mode != evt.source.value)) {
            this.isMenuChanged = true;
            this.seletedDisplayMode = this.filterModes.find((item) => item.selected);
        }
        this.refocusOnMenuStatus();
    }

    applyFilter() {
        if (this.copyFieldFilters) {
            this.onChangeFieldFilter.emit({
                fieldFilters: this.copyFieldFilters,
                columnLayoutsetting: this.columnLayoutsetting,
                rowSetting: this.rowSetting,
                widgetFormType: this.selectedWidgetFormType,
                orderDataEntryWidgetLayoutMode: this.orderDataEntryWidgetLayoutMode,
                orderDataEntryProperties: this.orderDataEntryProperties,
            });
            setTimeout(() => {
                this.isMenuChanged = false;
            });
        }
        this.refocusOnMenuStatus();
    }

    selectAllFieldsByGroup(name) {
        if (this.groupFieldFilters) {
            let groupField = this.groupFieldFilters.find(p => p.name == name);
            if (groupField) {
                groupField.fieldFilters.forEach((item) => {
                    if (item.isEditable)
                        item.selected = groupField.isSelectedAllField;
                });
            }
        }
    }

    selectAllFields() {
        this.copyFieldFilters.forEach((item) => {
            if (item.isEditable)
                item.selected = this.isSelectedAllField;
        });
        this.isMenuChanged = true;
        this.refocusOnMenuStatus();
    }

    selectField(value) {
        let filterItem = this.copyFieldFilters.find((item) => item.fieldName === value)
        // uncheck "all fields" ckb in case one/more other ckbs are selected
        if (filterItem && this.isSelectedAllField)
            this.isSelectedAllField = filterItem.selected;
        else {
            filterItem = this.copyFieldFilters.find((item) => !item.selected)
            // check "all fields" ckb in case all other ckbs are selected
            if (!filterItem)
                this.isSelectedAllField = true;
        }
        this.isMenuChanged = true;
        this.refocusOnMenuStatus();
    }

    selectFieldByGroup(groupName, fieldName) {
        if (this.groupFieldFilters) {
            let groupField = this.groupFieldFilters.find(p => p.name == groupName);
            if (groupField) {
                let filterItem = groupField.fieldFilters.find((item) => item.fieldName === fieldName);
                // uncheck "all fields" ckb in case one/more other ckbs are selected
                if (filterItem && groupField.isSelectedAllField)
                    groupField.isSelectedAllField = filterItem.selected;
                else {
                    filterItem = groupField.fieldFilters.find((item) => !item.selected);
                    // check "all fields" ckb in case all other ckbs are selected
                    if (!filterItem)
                        groupField.isSelectedAllField = true;
                }
                this.isMenuChanged = true;
                this.refocusOnMenuStatus();
            }
        }
    }

    public selectColumnLayoutsetting() {
        setTimeout(() => {
            this.onChangeColumnLayoutsetting.emit(this.columnLayoutsetting);
        })
        this.isMenuChanged = true;
        this.refocusOnMenuStatus();
    }

    public selectRowSetting() {
        setTimeout(() => {
            this.onChangeRowSetting.emit(this.rowSetting);
        })
        this.isMenuChanged = true;
        this.refocusOnMenuStatus();
    }

    public changeODEProperties() {
        setTimeout(() => {
            this.onChangeODEProperties.emit(this.orderDataEntryProperties);
        })
        this.isMenuChanged = true;
        this.refocusOnMenuStatus();
    }

    public selectWidgetFormType(event) {
        if (!this.filterWidgetFormTypes)
            return;
        let selectedItem = this.filterWidgetFormTypes.find((item) => item.selected);
        if (selectedItem) {
            selectedItem.selected = false;
        }
        let curSelectedItem = this.filterWidgetFormTypes.find((item) => item.widgetFormType == event);
        if (curSelectedItem) {
            curSelectedItem.selected = true;
            this.selectedWidgetFormType = curSelectedItem.widgetFormType;
            this.onChangeWidgetFormType.emit(this.selectedWidgetFormType);
        }
        this.isMenuChanged = true;
        this.refocusOnMenuStatus();
    }

    public showPropertiesPanel() {
        this.onPropertiesItemClick.emit(true);
    }

    public selectWidgetLayoutPaymentType(event) {
        this.isMenuChanged = event != this._previousODEWidgetLayoutMode;
        if (this.isMenuChanged) {
            this._previousODEWidgetLayoutMode = event;
        }
        this.refocusOnMenuStatus();
    }

    private refocusOnMenuStatus(event?) {
        if (this.menuWidgetStatus)
            this.menuWidgetStatus.focus();
    }

    private minWidthDisplayFieldsMenu = 137;
    private convertTextLengthToPixels() {
        if (!this.copyFieldFilters)
            return;

        this.copyFieldFilters.forEach((item) => {
            if (!item.isHidden && item.fieldDisplayName)
                this.minWidthDisplayFieldsMenu = Math.max(this.minWidthDisplayFieldsMenu, item.fieldDisplayName.length * 7 + 27);
        });
    }

    public filterModesTrackBy(index, item) {
        return item ? item.mode : undefined;
    }

    public filterWidgetFormTypesTrackBy(index, item) {
        return item ? item.widgetFormType : undefined;
    }

    public copyFieldFiltersTrackBy(index, item) {
        return item ? item.fieldDisplayName : undefined;
    }

    public onColumnsLayoutSettingsChanged() {
        const widgetAutoSaveLayout = this.propertyPanelService.getItemRecursive(this.widgetProperties, 'AutoSaveLayout');
        const globalAutoSaveLayout = this.propertyPanelService.getItemRecursive(this.globalProperties, 'AutoSaveLayout');

        if (widgetAutoSaveLayout && typeof widgetAutoSaveLayout.value === 'boolean') {
            if (widgetAutoSaveLayout.value) {
                this.applyFilter();
                return;
            }
            this.isMenuChanged = true;
            return;
        }
        if (globalAutoSaveLayout && typeof globalAutoSaveLayout.value === 'boolean') {
            if (globalAutoSaveLayout.value) {
                this.applyFilter();
                return;
            }
            this.isMenuChanged = true;
            return;
        }
        this.isMenuChanged = true;
    }
    public getAccessRight(buttonName: string) {
        if (this.accessRight && this.accessRight['orderDataEntry']) return true;

        if (!this.accessRight || !this.accessRight[AccessRightWidgetCommandButtonEnum[buttonName]]) return false;

        return this.accessRight[AccessRightWidgetCommandButtonEnum[buttonName]]['read'];
    }
}
