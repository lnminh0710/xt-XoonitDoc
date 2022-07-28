import { Component, OnInit, HostListener, OnDestroy, SimpleChanges, OnChanges, ChangeDetectorRef, AfterViewChecked, ContentChild, ViewChild, forwardRef, Input, Output, EventEmitter, ElementRef, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, Renderer2, ViewChildren, HostBinding, QueryList } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NG_VALIDATORS, Validator, FormControl } from '@angular/forms';
import { DropdownSettings } from './multiselect.interface';
import { Item, Badge, Search } from './menu-item';
import { DataService } from './multiselect.service';
import { Subscription } from 'rxjs';
import { Subject } from "rxjs/Subject";
import { RemoveHtmlPipe } from './clickOutside';
import { ChangeEvent } from './virtual-scroll';
import { ListFilterPipe } from './list-filter';
import { InputTypeNumber } from '@app/models/input-numeric-type.enum';
import { Uti } from '@app/utilities';
import isNil from 'lodash-es/isNil';

export const DROPDOWN_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AngularMultiSelect),
    multi: true
};
export const DROPDOWN_CONTROL_VALIDATION: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => AngularMultiSelect),
    multi: true,
}
const noop = () => {
};

@Component({
    selector: 'xn-combo-box',
    templateUrl: './multiselect.component.html',
    styleUrls: ['./multiselect.component.scss', './default.theme.scss'],
    providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR, DROPDOWN_CONTROL_VALIDATION],
})
export class AngularMultiSelect implements OnInit, ControlValueAccessor, OnChanges, Validator, AfterViewChecked, OnDestroy {

    @Input()
    data: Array<any> = [];

    @Input()
    set itemsSource(arr: Array<any>) {
        this.data = arr;
        this.selectedItems = [];
        if (this.selectedValue) {
            if (!this.selectedItems || !this.selectedItems.length) {
                this.selectedValue = this.selectedValue;
            }
        }
        this.renderSelectedText();
    }

    get itemsSource() {
        return this.data;
    }

    @Input()
    set displayMemberPath(displayMemberPath: string) {
        this.defaultSettings = Object.assign(this.defaultSettings, {
            labelKey: displayMemberPath
        });
    }

    @Input()
    set selectedValuePath(selectedValuePath: string) {
        this.defaultSettings = Object.assign(this.defaultSettings, {
            primaryKey: selectedValuePath
        });
    }

    private _settings: DropdownSettings;
    @Input() set settings(setting: DropdownSettings) {
        this._settings = setting;
        this._settings = Object.assign(this.defaultSettings, this._settings);
    }

    get settings() {
        if (!this._settings) {
            this._settings = this.defaultSettings;
        }
        return this._settings;
    }

    @Input()
    loading: boolean;

    @Input()
    controlId: string;

    @Input()
    addToBody: boolean;

    @Input()
    isRequired: boolean;

    @Input()
    placeholder: string;

    @Input()
    autoExpandSelection: boolean = false;

    @Input()
    showDropdownWhenFocus: boolean;

    @Input()
    appendToBody: boolean = true;

    @Input()
    isNumberic: boolean = false;

    @Input()
    typeNumber: InputTypeNumber = InputTypeNumber.Integer; // 2 type: integer, decimal

    @Input() numberFormat = ''; // 2 type: N: has separator, F: don't have

    private _selectedValue;
    @Input() set selectedValue(selectedValue) {
        if ((!isNil(this.selectedValue) || !isNil(selectedValue)) && this.selectedValue != selectedValue) {
            this._selectedValue = selectedValue;
            this.selectedItems = [];
            if (selectedValue != null && selectedValue != undefined && this.data && this.data.length) {
                const item = this.data.find(p => p[this.defaultSettings.primaryKey] == selectedValue);
                if (item) {
                    this._selectedItem = item;
                    this.selectedItems = [item];
                }
            }
            // Update form group before emitting event to get the latest value
            this.updateChangeCallback();
            this.emitEventEmitter();
            if (!this.isCustomSearch) {
                this.renderSelectedText();
            }
            else {
                this.isCustomSearch = false;
            }
        }
    }

    get selectedValue() {
        if (this.settings && this.settings.singleSelection) {
            return (this.selectedItems && this.selectedItems.length) ? this.selectedItems[0][this.defaultSettings.primaryKey] : null;
        }
        return null;
    }

    private _selectedIndex;
    @Input() set selectedIndex(selectedIndex) {
        this._selectedIndex = selectedIndex;
        if (selectedIndex != null && selectedIndex != undefined && this.data && this.data.length) {
            const item = this.data[selectedIndex];
            if (item) {
                this.selectedItems = [item];
                // this.setValueTextInput(item[this.defaultSettings.labelKey]);
            }
            else {
                this.selectedItems = [];
                if (this.textInput) {
                    this.renderer2.setProperty(this.textInput.nativeElement, 'value', '');
                }
            }
            this.updateChangeCallback();
            this.emitEventEmitter();
            this.renderSelectedText();
        }
    }

    get selectedIndex() {
        return this._selectedIndex;
    }

    private _selectedItem;
    @Input() set selectedItem(item) {
        this._selectedItem = item;
        if (item) {
            this.selectedValue = item[this.defaultSettings.primaryKey];
        }
    }

    get selectedItem() {
        if (this.settings.singleSelection) {
            return (this.selectedItems && this.selectedItems.length) ? this.selectedItems[0] : null;
        }
        return this.selectedItems;
    }

    private _text: string;
    @Input() set text(val) {
        this._text = val;
        this.renderSelectedText();
    }

    get text() {
        try {
            if (this.settings.singleSelection) {
                if (this.selectedItems && this.selectedItems.length) {
                    let defaultText = '' + this.selectedItems[0][this.defaultSettings.labelKey];
                    try {
                        if (this.itemFormatter) {
                            defaultText = '' + this.itemFormatter(this.selectedIndex, this.selectedItems[0]);
                        }
                    } catch { }
                    return defaultText;
                }
                else if (this.textInput) {
                    return this.textInput.nativeElement.value;
                }
            }
            return '';
        }
        catch {
        }
        return '';
    }

    @Input() isEditable: boolean;

    @Input() itemFormatter: Function;

    @Input() isContentHtml: boolean = true;

    @Input() maxDropDownWidth: number;
    @Input() maxDropDownHeight: number;
    @Input() isDisabled: boolean;
    @Input() dropDownCssClass: string;

    @Output('selectedIndexChanged')
    onSelect: EventEmitter<any> = new EventEmitter<any>();

    @Output('onDeSelect')
    onDeSelect: EventEmitter<any> = new EventEmitter<any>();

    @Output('onSelectAll')
    onSelectAll: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

    @Output('onDeSelectAll')
    onDeSelectAll: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

    @Output('onOpen')
    onOpen: EventEmitter<any> = new EventEmitter<any>();

    @Output('onClose')
    onClose: EventEmitter<any> = new EventEmitter<any>();

    @Output('onScrollToEnd')
    onScrollToEnd: EventEmitter<any> = new EventEmitter<any>();

    @Output('onFilterSelectAll')
    onFilterSelectAll: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

    @Output('onFilterDeSelectAll')
    onFilterDeSelectAll: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

    @Output('onAddFilterNewItem')
    onAddFilterNewItem: EventEmitter<any> = new EventEmitter<any>();

    @Output('onGroupSelect')
    onGroupSelect: EventEmitter<any> = new EventEmitter<any>();

    @Output('onGroupDeSelect')
    onGroupDeSelect: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    selectedValueChange: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    textChange: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    initialized: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    lostFocus: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    gotFocus: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    isDroppedDownChanged: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    isDroppedDownChanging: EventEmitter<any> = new EventEmitter<any>();

    @HostBinding('class.wj-state-collapsed') get collapsed() {
        return this.collapseStatus;
    }
    @HostBinding('class.wj-state-focused') get focused() {
        return this.focusStatus;
    }

    @ContentChild(Item) itemTempl: Item;
    @ContentChild(Badge) badgeTempl: Badge;
    @ContentChild(Search) searchTempl: Search;

    @ViewChild('searchInput') searchInput: ElementRef;
    @ViewChild('selectedList') selectedListElem: ElementRef;
    @ViewChild('dropdownList') dropdownListElem: ElementRef;
    @ViewChildren('itemList') itemList: QueryList<ElementRef>;
    @ViewChild('textInput') textInput: ElementRef;

    @HostListener('document:keyup.escape', ['$event'])
    onEscapeDown(event: KeyboardEvent) {
        if (this.settings.escapeToClose) {
            this.closeDropdown();
        }
    }

    filterPipe: ListFilterPipe;
    public selectedItems: Array<any> = [];
    public isActive: boolean = false;
    public isSelectAll: boolean = false;
    public isFilterSelectAll: boolean = false;
    public isInfiniteFilterSelectAll: boolean = false;
    public groupedData: Array<any>;
    filter: any;
    public chunkArray: any[];
    public scrollTop: any;
    public chunkIndex: any[] = [];
    public cachedItems: any[] = [];
    public groupCachedItems: any[] = [];
    public totalRows: any;
    public itemHeight: any = 41.6;
    public screenItemsLen: any;
    public cachedItemsLen: any;
    public totalHeight: any;
    public scroller: any;
    public maxBuffer: any;
    public lastScrolled: any;
    public lastRepaintY: any;
    public selectedListHeight: any;
    public filterLength: any = 0;
    public infiniteFilterLength: any = 0;
    public viewPortItems: any;
    public item: any;
    public dropdownListYOffset: number = 0;
    public collapseStatus: boolean = true;
    public focusStatus: boolean;
    public ignoreClickOutside: boolean;

    // TODO:
    private _isDroppedDown: boolean;
    set isDroppedDown(status) {
        if (status) {
            this.openDropdown();
        }
        else {
            this.closeDropdown();
        }
    }

    get isDroppedDown() {
        return this._isDroppedDown;
    }

    public isInitialized;
    public isFirstTimeRender = true;

    subscription: Subscription;
    defaultSettings: DropdownSettings = {
        singleSelection: true,
        text: 'Select',
        enableCheckAll: true,
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        filterSelectAllText: 'Select all filtered results',
        filterUnSelectAllText: 'UnSelect all filtered results',
        enableSearchFilter: false,
        searchBy: [],
        maxHeight: 300,
        badgeShowLimit: 999999999999,
        classes: '',
        disabled: false,
        searchPlaceholderText: 'Search',
        showCheckbox: false,
        noDataLabel: 'No Data Available',
        searchAutofocus: true,
        lazyLoading: false,
        labelKey: 'itemName',
        primaryKey: 'id',
        position: 'bottom',
        autoPosition: true,
        enableFilterSelectAll: true,
        selectGroup: false,
        addNewItemOnFilter: false,
        addNewButtonText: "Add",
        escapeToClose: true
    }
    public parseError: boolean;
    public filteredList: any = [];

    public get hostElement() {
        if (this._elementRef) {
            return this._elementRef.nativeElement;
        }
        return null;
    }

    private filterChanged: Subject<string> = new Subject();
    private defaultHeightForItem = 25;

    constructor(
        public _elementRef: ElementRef,
        private cdr: ChangeDetectorRef,
        private ds: DataService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        private renderer2: Renderer2,
        private removeHtmlPipe: RemoveHtmlPipe
    ) {
    }

    ngOnInit() {
        this.cachedItems = this.cloneArray(this.data);
        if (this.settings.position == 'top') {
            setTimeout(() => {
                this.selectedListHeight = { val: 0 };
                this.selectedListHeight.val = this.selectedListElem.nativeElement.clientHeight;
            });
        }
        this.subscription = this.ds.getData().subscribe(data => {
            if (data) {
                var len = 0;
                data.forEach((obj: any, i: any) => {
                    if (!obj.hasOwnProperty('grpTitle')) {
                        len++;
                    }
                });
                this.filterLength = len;
                this.onFilterChange(data);
            }

        });

        this.filterChanged.debounceTime(250).subscribe(filterValue => {
            this.cdr.detectChanges();
        });

        setTimeout(() => {
            this.calculateDropdownDirection();
        });
        // this.gotFocus.emit(true);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data && !changes.data.firstChange) {
            if (this.settings.groupBy) {
                this.groupedData = this.transformData(this.data, this.settings.groupBy);
                if (this.data.length == 0) {
                    this.selectedItems = [];
                }
            }
            this.cachedItems = this.cloneArray(this.data);
            this.isFirstTimeRender = true;
            this.resetIsFirstTimeRender();
        }
        if (changes.settings && !changes.settings.firstChange) {
            this.settings = Object.assign(this.defaultSettings, this.settings);
        }
        if (changes.loading) {
            //console.log(this.loading);
        }
    }

    ngDoCheck() {
        if (this.selectedItems) {
            if (this.selectedItems.length == 0 || this.data.length == 0 || this.selectedItems.length < this.data.length) {
                this.isSelectAll = false;
            }
        }
    }

    ngAfterViewInit() {
        this.isInitialized = true;
        this.initialized.emit();
        if (this.settings.lazyLoading) {
            // this._elementRef.nativeElement.getElementsByClassName("lazyContainer")[0].addEventListener('scroll', this.onScroll.bind(this));
        }
        if (this.autoExpandSelection) {
            this.openDropdown();
        }
        this.resetIsFirstTimeRender();
    }

    ngAfterViewChecked() {
        if (this.selectedListElem.nativeElement.clientHeight && this.settings.position == 'top' && this.selectedListHeight) {
            this.selectedListHeight.val = this.selectedListElem.nativeElement.clientHeight;
            this.cdr.detectChanges();
        }
    }

    private isClickOnItem: boolean;

    onItemClick(evt: Event, item: any, index: number) {
        evt.stopPropagation();
        if (this.settings.disabled) {
            return false;
        }
        this.isClickOnItem = true;

        let found = this.isSelected(item);
        let limit = this.selectedItems.length < this.settings.limitSelection ? true : false;

        if (!found) {
            if (this.settings.limitSelection) {
                if (limit) {
                    this.addSelected(item, true);
                    // this.onSelect.emit(item);
                }
            }
            else {
                this.addSelected(item, true);
                // this.onSelect.emit(item);
            }
        }
        else {
            if (!this.settings.singleSelection) {
                this.removeSelected(item);
                this.onDeSelect.emit(item);
            }
            this.closeDropdown();
            this.updateChangeCallback();
            this.emitEventEmitter();
        }
        if (this.isSelectAll || this.data.length > this.selectedItems.length) {
            this.isSelectAll = false;
        }
        if (this.data.length == this.selectedItems.length) {
            this.isSelectAll = true;
        }
        if (this.settings.groupBy) {
            this.updateGroupInfo(item);
        }
        this.renderSelectedText();
    }

    public validate(c: FormControl): any {
        return null;
    }

    private onTouchedCallback: (_: any) => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    writeValue(value: any) {
        if (value !== undefined && value !== null && value !== '') {
            if (this.settings.singleSelection) {
                try {
                    if (this.selectedValue != value) {
                        this.selectedValue = value;
                    }
                }
                catch (e) {
                    // console.error(e.body.msg);
                }
            }
            else {
                if (this.settings.limitSelection) {
                    this.selectedItems = value.slice(0, this.settings.limitSelection);
                }
                else {
                    this.selectedItems = value;
                }
                if (this.selectedItems.length === this.data.length && this.data.length > 0) {
                    this.isSelectAll = true;
                }
                if (this.settings.groupBy) {
                    this.groupedData = this.transformData(this.data, this.settings.groupBy);
                    this.groupCachedItems = this.cloneArray(this.groupedData);
                }
            }
        } else {
            this.selectedItems = [];
            this.selectedIndex = -1;
        }
    }

    //From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    trackByFn(index: number, item: any) {
        return item[this.settings.primaryKey];
    }

    isSelected(clickedItem: any) {
        let found = false;
        this.selectedItems && this.selectedItems.forEach(item => {
            if (clickedItem[this.settings.primaryKey] === item[this.settings.primaryKey]) {
                found = true;
            }
        });
        return found;
    }

    addSelected(item: any, isCloseDropdown?: boolean) {
        if (this.settings.singleSelection) {
            if (isCloseDropdown) {
                this.closeDropdown();
            }
            this.selectedValue = item[this.settings.primaryKey];

            //#nthuy
            this.focusTextInput(0);
        }
        else
            this.selectedItems.push(item);

        this.updateChangeCallback();
    }

    removeSelected(clickedItem: any) {
        this.selectedItems && this.selectedItems.forEach(item => {
            if (clickedItem[this.settings.primaryKey] === item[this.settings.primaryKey]) {
                this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
            }
        });
        this.renderSelectedText();
        this.updateChangeCallback();
        this.selectedValueChange.emit(this.selectedValue);
        this.textChange.emit(this.text);
    }

    removeAllSelected() {
        this.selectedItems = [];
        this.updateChangeCallback();
        this.selectedValue = '';

    }

    toggleDropdown(evt: any) {
        if (this.settings.disabled) {
            return false;
        }
        if (!this.isActive) {
            this.openDropdown();
        }
        else {
            this.closeDropdown();
        }
        if (evt) {
            evt.preventDefault();
        }
    }

    public focus() {
        this.focusTextInput();
    }

    private focusTextInput(timeOut?) {
        if (timeOut != null && timeOut != undefined) {
            setTimeout(() => {
                this.textInput.nativeElement.focus();
            }, timeOut);
        }
        else {
            this.textInput.nativeElement.focus();
        }
    }

    //#nthuy
    private appendDropdownToBody() {
        let displayLength = 0;
        let displayHeight = 0;
        // Min height need to show dropdown
        if (this.data) {
            displayLength = this.data.length > 12 ? 12 : this.data.length;
            displayHeight = displayLength * this.defaultHeightForItem;
        }
        const domRect = this._elementRef.nativeElement.getBoundingClientRect();
        const isOverScreen = domRect.top + domRect.height + displayHeight > window.innerHeight;
        let top;
        if (!isOverScreen) {
            top = domRect.top + domRect.height;
        }
        else {
            top = domRect.top - displayHeight - 5;
        }
        this.setPositionForDropdown(top, domRect.left, domRect.width);
    }

    private setPositionForDropdown(top, left, width) {
        this.renderer2.setStyle(this.dropdownListElem.nativeElement, 'position', 'absolute');
        this.renderer2.setStyle(this.dropdownListElem.nativeElement, 'top', top + 'px');
        this.renderer2.setStyle(this.dropdownListElem.nativeElement, 'left', left + 'px');
        this.renderer2.setStyle(this.dropdownListElem.nativeElement, 'width', width + 'px');
        this.renderer2.appendChild(document.body, this.dropdownListElem.nativeElement);
    }

    public cancel: boolean;
    public openDropdown() {
        let isHidden = this.isHiddenComponent();
        if (this.settings.disabled || this.isActive || isHidden || this.isDisabled) {
            return false;
        }
        this.collapseStatus = false;
        this.isActive = true;
        // Occurs before the drop down is shown or hidden.
        this.isDroppedDownChanging.emit(this.isActive);
        if (this.isActive) {
            if (this.settings.searchAutofocus && this.searchInput && this.settings.enableSearchFilter && !this.searchTempl) {
                setTimeout(() => {
                    this.searchInput.nativeElement.focus();
                }, 0);
            }
            this.calculateDropdownDirection();
            if (this.appendToBody) {
                this.appendDropdownToBody();
            }
            this.focus();
            this.onOpen.emit(true);
            this._isDroppedDown = true;
            // Occurs after the drop down is shown or hidden.
            this.isDroppedDownChanged.emit(this.isActive);

            setTimeout(() => {
                this.scrollToView();
            });
        }
    }

    public closeDropdown() {
        this.isActive = false;
        this.collapseStatus = true;
        // Occurs before the drop down is shown or hidden.
        this.isDroppedDownChanging.emit(this.isActive);
        if (!this.isActive) {
            if (this.searchInput && this.settings.lazyLoading) {
                this.searchInput.nativeElement.value = "";
            }
            if (this.searchInput) {
                this.searchInput.nativeElement.value = "";
            }
            this.filter = "";
            this._isDroppedDown = false;
            this.onClose.emit(false);
            // Occurs after the drop down is shown or hidden.
            this.isDroppedDownChanged.emit(this.isActive);
        }
        if (this.isHiddenComponent()) {
            if (this.dropdownListElem && this.dropdownListElem.nativeElement) {
                this.dropdownListElem.nativeElement.remove();
            }
        }
    }


    private scrollToView() {
        if (this.itemList && this.itemList.length) {
            const item = this.itemList.find(p => (p.nativeElement.className && p.nativeElement.className.includes('selected-item')));
            if (item) {
                item.nativeElement.scrollIntoView({ block: 'nearest', inline: 'start' });
            }
        }
    }

    public closeDropdownOnClickOut(event) {
        if (this.ignoreClickOutside) {
            return;
        }
        // Outside
        if (event && event['value'] === true) {
            if (!this.isClickInsideSpecialCase(event.target)) {
                if (this.searchInput && this.settings.lazyLoading) {
                    this.searchInput.nativeElement.value = "";
                }
                if (this.searchInput) {
                    this.searchInput.nativeElement.value = "";
                }
                this.filter = "";
                this.closeDropdown();
                if (this.focusStatus == false) {
                    this.lostFocus.emit(true);
                }
                this.focusStatus = null;
            }
        }
        // Inside
        else {
            // this.collapseStatus = false;
        }
    }

    /**
     * isClickInsideSpecialCase
     */
    private isClickInsideSpecialCase(target) {
        let iRet: boolean = false;
        const selectorArray = [
            '.c-input',
            // '.c-text-input'
        ];
        for (let i = 0; i < selectorArray.length; i++) {
            let node = $(target).closest(selectorArray[i]);
            if (node && node.length > 0) {
                iRet = true;
                break;
            }
        }
        return iRet;
    }

    toggleSelectAll() {
        if (!this.isSelectAll) {
            this.selectedItems = [];
            if (this.settings.groupBy) {
                this.groupedData.forEach((obj) => {
                    obj.selected = true;
                })
                this.groupCachedItems.forEach((obj) => {
                    obj.selected = true;
                })
            }
            this.selectedItems = this.data.slice();
            this.isSelectAll = true;
            this.updateChangeCallback();

            this.onSelectAll.emit(this.selectedItems);
        }
        else {
            if (this.settings.groupBy) {
                this.groupedData.forEach((obj) => {
                    obj.selected = false;
                });
                this.groupCachedItems.forEach((obj) => {
                    obj.selected = false;
                })
            }
            this.selectedItems = [];
            this.isSelectAll = false;
            this.updateChangeCallback();

            this.onDeSelectAll.emit(this.selectedItems);
        }
    }
    filterList() {
        // this.filterChanged.next(this.filter);
    }

    filterGroupedList() {
        if (this.filter == "" || this.filter == null) {
            this.clearSearch();
            return;
        }
        this.groupedData = this.cloneArray(this.groupCachedItems);
        this.groupedData = this.groupedData.filter(obj => {
            var arr = obj.list.filter(t => {
                return t.itemName.toLowerCase().indexOf(this.filter.toLowerCase()) > -1;
            });
            obj.list = arr;
            return arr.some(cat => {
                return cat.itemName.toLowerCase().indexOf(this.filter.toLowerCase()) > -1;
            }
            )
        });
        //console.log(this.groupedData);
    }

    toggleFilterSelectAll() {
        if (!this.isFilterSelectAll) {
            let added = [];
            if (this.settings.groupBy) {
                this.groupedData.forEach((item: any) => {
                    if (item.list) {
                        item.list.forEach((el: any) => {
                            if (!this.isSelected(el)) {
                                this.addSelected(el);
                                added.push(el);
                            }
                        });
                    }
                    this.updateGroupInfo(item);

                });

            }
            else {
                this.ds.getFilteredData().forEach((item: any) => {
                    if (!this.isSelected(item)) {
                        this.addSelected(item);
                        added.push(item);
                    }

                });
            }

            this.isFilterSelectAll = true;
            this.onFilterSelectAll.emit(added);
        }
        else {
            let removed = [];
            if (this.settings.groupBy) {
                this.groupedData.forEach((item: any) => {
                    if (item.list) {
                        item.list.forEach((el: any) => {
                            if (this.isSelected(el)) {
                                this.removeSelected(el);
                                removed.push(el);
                            }
                        });
                    }
                });
            }
            else {
                this.ds.getFilteredData().forEach((item: any) => {
                    if (this.isSelected(item)) {
                        this.removeSelected(item);
                        removed.push(item);
                    }

                });
            }
            this.isFilterSelectAll = false;
            this.onFilterDeSelectAll.emit(removed);
        }
    }

    toggleInfiniteFilterSelectAll() {
        if (!this.isInfiniteFilterSelectAll) {
            this.data.forEach((item: any) => {
                if (!this.isSelected(item)) {
                    this.addSelected(item);
                }

            });
            this.isInfiniteFilterSelectAll = true;
        }
        else {
            this.data.forEach((item: any) => {
                if (this.isSelected(item)) {
                    this.removeSelected(item);
                }

            });
            this.isInfiniteFilterSelectAll = false;
        }
    }

    clearSearch() {
        if (this.settings.groupBy) {
            this.groupedData = [];
            this.groupedData = this.cloneArray(this.groupCachedItems);
        }
        this.filter = "";
        this.isFilterSelectAll = false;

    }

    onFilterChange(data: any) {
        if (this.filter && this.filter == "" || data.length == 0) {
            this.isFilterSelectAll = false;
        }
        let cnt = 0;
        data.forEach((item: any) => {

            if (!item.hasOwnProperty('grpTitle') && this.isSelected(item)) {
                cnt++;
            }
        });

        if (cnt > 0 && this.filterLength == cnt) {
            this.isFilterSelectAll = true;
        }
        else if (cnt > 0 && this.filterLength != cnt) {
            this.isFilterSelectAll = false;
        }
        this.cdr.detectChanges();
    }

    cloneArray(arr: any) {
        var i, copy;

        if (Array.isArray(arr)) {
            return JSON.parse(JSON.stringify(arr));
        } else if (typeof arr === 'object') {
            throw 'Cannot clone array containing an object!';
        } else {
            return arr;
        }
    }

    updateGroupInfo(item: any) {
        var key = this.settings.groupBy;
        this.groupedData.forEach((obj: any) => {
            var cnt = 0;
            if (obj.grpTitle && (item[key] == obj[key])) {
                if (obj.list) {
                    obj.list.forEach((el: any) => {
                        if (this.isSelected(el)) {
                            cnt++;
                        }
                    });
                }
            }
            if (obj.list && (cnt === obj.list.length) && (item[key] == obj[key])) {
                obj.selected = true;
            }
            else if (obj.list && (cnt != obj.list.length) && (item[key] == obj[key])) {
                obj.selected = false;
            }
        });
        this.groupCachedItems.forEach((obj: any) => {
            var cnt = 0;
            if (obj.grpTitle && (item[key] == obj[key])) {
                if (obj.list) {
                    obj.list.forEach((el: any) => {
                        if (this.isSelected(el)) {
                            cnt++;
                        }
                    });
                }
            }
            if (obj.list && (cnt === obj.list.length) && (item[key] == obj[key])) {
                obj.selected = true;
            }
            else if (obj.list && (cnt != obj.list.length) && (item[key] == obj[key])) {
                obj.selected = false;
            }
        });
    }

    transformData(arr: Array<any>, field: any): Array<any> {
        const groupedObj: any = arr.reduce((prev: any, cur: any) => {
            if (!prev[cur[field]]) {
                prev[cur[field]] = [cur];
            } else {
                prev[cur[field]].push(cur);
            }
            return prev;
        }, {});
        const tempArr: any = [];
        Object.keys(groupedObj).map((x: any) => {
            var obj: any = {};
            obj["grpTitle"] = true;
            obj[this.settings.labelKey] = x;
            obj[this.settings.groupBy] = x;
            obj['selected'] = false;
            obj['list'] = [];
            var cnt = 0;
            groupedObj[x].forEach((item: any) => {
                item['list'] = [];
                obj.list.push(item);
                if (this.isSelected(item)) {
                    cnt++;
                }
            });
            if (cnt == obj.list.length) {
                obj.selected = true;
            }
            else {
                obj.selected = false;
            }
            tempArr.push(obj);
        });
        return tempArr;
    }

    public filterInfiniteList(evt: any) {
        var filteredElems: Array<any> = [];
        if (this.settings.groupBy) {
            this.groupedData = this.groupCachedItems.slice();
        }
        else {
            this.data = this.cachedItems.slice();
        }

        if ((evt.target.value != null || evt.target.value != '') && !this.settings.groupBy) {
            if (this.settings.searchBy.length > 0) {
                for (var t = 0; t < this.settings.searchBy.length; t++) {

                    this.data.filter((el: any) => {
                        if (el[this.settings.searchBy[t].toString()].toString().toLowerCase().indexOf(evt.target.value.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                        }
                    });
                }

            }
            else {
                this.data.filter(function (el: any) {
                    for (var prop in el) {
                        if (el[prop].toString().toLowerCase().indexOf(evt.target.value.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                            break;
                        }
                    }
                });
            }
            this.data = [];
            this.data = filteredElems;
            this.infiniteFilterLength = this.data.length;
        }
        if (evt.target.value.toString() != '' && this.settings.groupBy) {
            this.groupedData.filter(function (el: any) {
                if (el.hasOwnProperty('grpTitle')) {
                    filteredElems.push(el);
                }
                else {
                    for (var prop in el) {
                        if (el[prop].toString().toLowerCase().indexOf(evt.target.value.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                            break;
                        }
                    }
                }
            });
            this.groupedData = [];
            this.groupedData = filteredElems;
            this.infiniteFilterLength = this.groupedData.length;
        }
        else if (evt.target.value.toString() == '' && this.cachedItems.length > 0) {
            this.data = [];
            this.data = this.cachedItems;
            this.infiniteFilterLength = 0;
        }
    }

    resetInfiniteSearch() {
        this.filter = "";
        this.isInfiniteFilterSelectAll = false;
        this.data = [];
        this.data = this.cachedItems;
        this.groupedData = this.groupCachedItems;
        this.infiniteFilterLength = 0;
    }

    onScrollEnd(e: ChangeEvent) {
        this.onScrollToEnd.emit(e);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.isActive = false;
        //#nthuy
        if (this.dropdownListElem && this.dropdownListElem.nativeElement) {
            this.dropdownListElem.nativeElement.remove();
        }
    }
    selectGroup(item: any) {
        if (item.selected) {
            item.selected = false;
            item.list.forEach((obj: any) => {
                this.removeSelected(obj);
            });
            this.updateGroupInfo(item);
            this.onGroupSelect.emit(item);
        }
        else {
            item.selected = true;
            item.list.forEach((obj: any) => {
                if (!this.isSelected(obj)) {
                    this.addSelected(obj);
                }

            });
            this.updateGroupInfo(item);
            this.onGroupDeSelect.emit(item);
        }


    }
    addFilterNewItem() {
        this.onAddFilterNewItem.emit(this.filter);
        this.filterPipe = new ListFilterPipe(this.ds);
        this.filterPipe.transform(this.data, this.filter, this.settings.searchBy);
    }
    calculateDropdownDirection() {
        let shouldOpenTowardsTop = this.settings.position == 'top';
        if (this.settings.autoPosition && this.dropdownListElem) {
            const dropdownHeight = this.dropdownListElem.nativeElement.clientHeight;
            const viewportHeight = document.documentElement.clientHeight;
            const selectedListBounds = this.selectedListElem.nativeElement.getBoundingClientRect();

            const spaceOnTop: number = selectedListBounds.top;
            const spaceOnBottom: number = viewportHeight - selectedListBounds.top;
            if (spaceOnBottom < spaceOnTop && dropdownHeight < spaceOnTop) {
                this.openTowardsTop(true);
            }
            else {
                this.openTowardsTop(false);
            }
        }
    }
    openTowardsTop(value: boolean) {
        if (value && this.selectedListElem.nativeElement.clientHeight) {
            this.dropdownListYOffset = 15 + this.selectedListElem.nativeElement.clientHeight;
        } else {
            this.dropdownListYOffset = 0;
        }
    }

    private moveSelectedItem(mode: string) {
        let rowIdx = 0;
        const filterData: Array<any> = this.data;
        if (!filterData || !filterData.length) {
            return;
        }
        if (this.settings.singleSelection) {
            if (this.selectedItems.length) {
                const selectedItem = this.selectedItems[0];
                let index = filterData.findIndex(p => p == selectedItem);
                let step = mode == 'down' ? 1 : -1;
                rowIdx = index + step;
                rowIdx = rowIdx > (filterData.length - 1) ? 0 : rowIdx;
                rowIdx = rowIdx < 0 ? (filterData.length - 1) : rowIdx;
            }
        }
        let itemList = this.itemList.toArray();
        if (itemList && itemList[rowIdx]) {
            itemList[rowIdx].nativeElement.scrollIntoView({ block: 'nearest', inline: 'start' });
        }
        this.isCustomSearch = false;
        this.addSelected(filterData[rowIdx]);
        // this.onSelect.emit(filterData[rowIdx]);
    }

    //#nthuy
    focusDown($event) {
        $event.preventDefault();
        this.moveSelectedItem('down');
    }

    //#nthuy
    focusUp($event) {
        $event.preventDefault();
        this.moveSelectedItem('up');
    }

    //#nthuy
    focusBackSpace($event, value: string, selectionStart: number) {
        // prevent delete string
        $event.preventDefault();
        this.textInput.nativeElement.setSelectionRange(selectionStart - 1, value.length);
        if (selectionStart == 0) {
            this.removeAllSelected();
        }
        setTimeout(() => {
            this.textInput.nativeElement.focus();
        });
    }

    enterTextInput(evt: any) {
        if (this.isActive) {
            //console.log('enterTextInput');
            this.toggleDropdown(null);
        }
    }

    private replaceAt(value: string, index, replacement) {
        return value.substr(0, index) + replacement + value.substr(index + replacement.length);
    }

    private isValidSearchCharacter(e) {
        // let allowedCode = [32, 44, 45, 46, 95];
        var k = (e.charCode) ? e.charCode : ((e.keyCode) ? e.keyCode : ((e.which) ? e.which : 0));

        // Verify that the key entered is not a special key
        if (k == 20 /* Caps lock */
            // || k == 8 /* Backspace */
            // || k == 46 /* Delete */
            || k == 13 /* Enter */
            || k == 16 /* Shift */
            || k == 9 /* Tab */
            || k == 27 /* Escape Key */
            || k == 17 /* Control Key */
            || k == 91 /* Windows Command Key */
            || k == 19 /* Pause Break */
            || k == 18 /* Alt Key */
            || k == 93 /* Right Click Point Key */
            || (k >= 35 && k <= 40) /* Home, End, Arrow Keys */
            || k == 45 /* Insert Key */
            || (k >= 33 && k <= 34) /*Page Down, Page Up */
            || (k >= 112 && k <= 123) /* F1 - F12 */
            || (k >= 144 && k <= 145)) { /* Num Lock, Scroll Lock */
            return false;
        }
        return true;
    }

    private isAllowAddText(e): boolean {
        if (this.isNumberic) {
            if (this.isValidInteger(e)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            if (Uti.allowControlKey(e)) {
                return true;
            }

            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
        return true;
    }

    private isValidInteger(e): boolean {
        return (this.typeNumber == InputTypeNumber.Integer && e.key == '.');
    }

    private isCustomSearch: boolean;

    //#nthuy
    // Use keydown to avoid flashing when auto search
    onSearchChange($event, value: string) {
        if (!this.isAllowAddText($event)) return;

        let selectionStart = $event.target.selectionStart;
        let selectionEnd = $event.target.selectionEnd;
        let isValid = this.isValidSearchCharacter($event);
        if (!isValid) {
            return;
        }
        // prevent
        $event.preventDefault();
        let isBackspaceOrDelete = $event.keyCode == 8 || $event.keyCode == 46;
        let key = $event.key;
        let currentPosVal = isBackspaceOrDelete ? '' : key;
        if (value) {
            /* Backspace */
            if (isBackspaceOrDelete) {
                if (selectionStart == selectionEnd) {
                    value = value.substr(0, selectionStart - 1) + value.substr(selectionEnd);
                }
                else {
                    value = value.substr(0, selectionStart) + value.substr(selectionEnd);
                }
                currentPosVal = value; // value.substring(0, selectionStart-1);
            }
            else {
                value = this.replaceAt(value, selectionStart, key);
                currentPosVal = value.substring(0, selectionStart + 1);
            }
        }
        let firstPos;
        let endPos;
        let searchList;
        if (!isBackspaceOrDelete) {
            searchList = this.data.filter((item: any) => this.applyFilter(item, currentPosVal, []));
        }
        if (searchList && searchList.length) {
            this.addSelected(searchList[0]);
            this.renderCustomText(searchList[0][this.settings.labelKey]);
            firstPos = selectionStart;
            endPos = ('' + searchList[0][this.settings.labelKey]).length;
            this.textInput.nativeElement.setSelectionRange(currentPosVal.length, endPos);
        }
        else {
            this.isCustomSearch = true;
            this.renderCustomText(currentPosVal);
            this.selectedItems = [];
            if (isBackspaceOrDelete) {
                if (selectionStart == selectionEnd) {
                    this.textInput.nativeElement.setSelectionRange(selectionStart - 1, selectionStart - 1);
                }
                else {
                    this.textInput.nativeElement.setSelectionRange(selectionStart, selectionStart);
                }
            }
            this.updateChangeCallback();
            this.emitEventEmitter();
        }
        setTimeout(() => {
            this.scrollToView();
        })
    }
    //#nthuy
    applyFilter(item: any, filter: any, searchBy: any): boolean {
        let found = false;
        if (filter && item[this.settings.labelKey]) {
            if (item[this.settings.labelKey].toString().toLowerCase().indexOf(filter.toLowerCase()) == 0) {
                found = true;
            }
        }
        return found;
    }

    public updateChangeCallback() {
        if (this.settings.singleSelection) {
            if (this.selectedItems && this.selectedItems.length) {
                const key = this.selectedItems[0][this.settings.primaryKey];
                this.onChangeCallback(key);
                this.onTouchedCallback(key);
            }
            else {
                this.onChangeCallback(null);
                this.onTouchedCallback(null);
            }
        }
        else {
            if (this.selectedItems && this.selectedItems.length) {
                const keys = this.selectedItems.map(p => p[this.settings.primaryKey]);
                this.onChangeCallback(keys);
                this.onTouchedCallback(keys);
            }
        }
    }

    public onIsDroppedDownChanged() {
        this.isDroppedDownChanged.emit(this.isActive);
    }

    public refresh() {

    }

    public focusText($event) {
        //console.log('focusText');
        if (this.isClickOnItem) {
            this.isClickOnItem = null;
            return;
        }
        if (this.showDropdownWhenFocus) {
            this.openDropdown();
        }
        this.focusStatus = true;
        this.gotFocus.emit(true);
    }

    private moveOutOffDropdown: boolean;

    public lostFocusText($event) {
        this.focusStatus = false;
        // this.moveOutOffDropdown = true;
    }

    public tab() {
        this.closeDropdown();
    }

    private renderSelectedText(retryTime = 2) {
        if (this.textInput) {
            const element = this.textInput.nativeElement;
            this.renderer2.setProperty(element, 'value', this.removeHtmlPipe.transform(this.text));
        }
        else {
            if (retryTime) {
                setTimeout(() => {
                    this.renderSelectedText(--retryTime);
                });
            }
        }
    }

    private renderCustomText(value) {
        if (this.textInput) {
            const element = this.textInput.nativeElement;
            this.renderer2.setProperty(element, 'value', this.removeHtmlPipe.transform(value));
        }
    }

    private emitEventEmitter(retryTimes = 2) {
        if ((this._elementRef && this._elementRef.nativeElement) && this.isInitialized) {
            //console.log('emitEventEmitter: ' + this.text);
            this.setCurrentSelectedIndex();
            this.onSelect.emit(this.selectedItem);
            this.textChange.emit(this.text);
            this.selectedValueChange.emit(this.selectedValue);
        }
        else {
            if (retryTimes) {
                setTimeout(() => {
                    this.emitEventEmitter(--retryTimes);
                });
            }
        }
    }

    private setCurrentSelectedIndex() {
        if (!this.selectedItem || !this.selectedItem['idValue']) {
            this._selectedIndex = -1;
            return;
        }
        for (let i = 0; i < this.data.length; i++) {
            if (this.selectedItem['idValue'] === this.data[i]['idValue']) {
                this._selectedIndex = i;
                return;
            }
        }
    }

    private isHiddenComponent() {
        if (this._elementRef) {
            const element = this._elementRef.nativeElement;
            if (element.offsetParent === null) {
                // element is not visible
                return true;
            }
        }
        return false;
    }

    private resetIsFirstTimeRender() {
        setTimeout(() => {
            this.isFirstTimeRender = false;
        }, 500);
    }

}
