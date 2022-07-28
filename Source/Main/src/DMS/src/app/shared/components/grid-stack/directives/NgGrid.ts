import {
    Component,
    Directive,
    ElementRef,
    Renderer2,
    EventEmitter,
    ComponentFactoryResolver,
    Host,
    ViewEncapsulation,
    Type,
    ComponentRef,
    KeyValueDiffer,
    KeyValueDiffers,
    OnInit,
    OnDestroy,
    DoCheck,
    ViewContainerRef,
    Output,
    HostListener,
} from '@angular/core';
import {
    NgGridConfig,
    NgGridItemEvent,
    NgGridItemPosition,
    NgGridItemSize,
    NgGridRawPosition,
    NgGridItemDimensions,
    NgGridItemConfig,
} from '../interfaces/INgGrid';
import { NgGridItem } from './NgGridItem';
import { NgGridPlaceholder } from '../components/NgGridPlaceholder';
// import * as _ from 'lodash';

@Directive({
    selector: '[ngGrid]',
    inputs: ['config: ngGrid'],
    host: {
        //'(mousedown)': 'mouseDownEventHandler($event)',
        //'(mousemove)': 'mouseMoveEventHandler($event)',
        //'(mouseup)': 'mouseUpEventHandler($event)',
        '(touchstart)': 'mouseDownEventHandler($event)',
        '(touchmove)': 'mouseMoveEventHandler($event)',
        '(touchend)': 'mouseUpEventHandler($event)',
        '(window:resize)': 'resizeEventHandler($event)',
        //'(document:mousemove)': 'mouseMoveEventHandler($event)',
        //'(document:mouseup)': 'mouseUpEventHandler($event)'
    },
})
export class NgGrid implements OnInit, DoCheck, OnDestroy {
    public static CONST_DEFAULT_RESIZE_DIRECTIONS: string[] = [
        'bottomright',
        //"bottomleft",
        //"topright",
        //"topleft",
        'right',
        'left',
        'bottom',
        'top',
    ];

    //	Event Emitters
    @Output() public onDragStart: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
    @Output() public onDrag: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
    @Output() public onDragStop: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
    @Output() public onResizeStart: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
    @Output() public onResize: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
    @Output() public onResizeStop: EventEmitter<NgGridItem> = new EventEmitter<NgGridItem>();
    @Output() public onItemChange: EventEmitter<Array<NgGridItemEvent>> = new EventEmitter<Array<NgGridItemEvent>>();
    @Output() public onRefresh: EventEmitter<any> = new EventEmitter<any>();
    @Output() public onInitializedGrid: EventEmitter<any> = new EventEmitter<any>();

    //	Public variables
    public colWidth: number = 250;
    public rowHeight: number = 250;
    public minCols: number = 1;
    public minRows: number = 1;
    public marginTop: number = 10;
    public marginRight: number = 10;
    public marginBottom: number = 10;
    public marginLeft: number = 10;
    public isDragging: boolean = false;
    public isResizing: boolean = false;
    public autoStyle: boolean = true;
    public resizeEnable: boolean = true;
    public dragEnable: boolean = true;
    public cascade: string = 'up-left';
    public minWidth: number = 100;
    public minHeight: number = 100;
    public maxZIndex = 2;

    //	Private variables
    private _items: Array<NgGridItem> = [];
    private _draggingItem: NgGridItem = null;
    private _resizingItem: NgGridItem = null;
    private _resizeDirection: string = null;
    private _itemGrid: { [key: number]: { [key: number]: NgGridItem } } = {}; //{ 1: { 1: null } };
    private _containerWidth: number;
    private _containerHeight: number;
    private _maxCols: number = 0;
    private _maxRows: number = 0;
    private _visibleCols: number = 0;
    private _visibleRows: number = 0;
    private _setWidth: number = 250;
    private _setHeight: number = 250;
    private _posOffset: NgGridRawPosition = null;
    private _adding: boolean = false;
    private _placeholderRef: ComponentRef<NgGridPlaceholder> = null;
    private _placeholderRefForNewWidget: ComponentRef<NgGridPlaceholder> = null;
    private _placeholderRefForDraggingWidget: ComponentRef<NgGridPlaceholder> = null;
    private _fixToGrid: boolean = false;
    private _autoResize: boolean = false;
    private _differ: KeyValueDiffer<any, any>;
    private _destroyed: boolean = false;
    private _maintainRatio: boolean = false;
    private _aspectRatio: number;
    private _preferNew: boolean = false;
    private _zoomOnDrag: boolean = false;
    private _limitToScreen: boolean = false;
    private _curMaxRow: number = 0;
    private _curMaxCol: number = 0;
    private _dragReady: boolean = false;
    private _resizeReady: boolean = false;
    private _container_height: number = 0;
    public designMode: boolean = false;
    public design_size_diff_percentage: number;

    //	Default config
    private static CONST_DEFAULT_CONFIG: NgGridConfig = {
        margins: [10],
        draggable: true,
        resizable: true,
        max_cols: 0,
        max_rows: 0,
        visible_cols: 0,
        visible_rows: 0,
        col_width: 250,
        row_height: 250,
        cascade: 'up-left',
        min_width: 100,
        min_height: 100,
        fix_to_grid: false,
        auto_style: true,
        auto_resize: false,
        maintain_ratio: false,
        prefer_new: false,
        zoom_on_drag: false,
        design_mode: false,
    };

    private _config = NgGrid.CONST_DEFAULT_CONFIG;

    //	[ng-grid] attribute handler
    set config(v: NgGridConfig) {
        this.setConfig(v);
        if (this._differ == null && v != null) {
            this._differ = this._differs.find(this._config).create();
        }
    }

    @HostListener('document:mousemove.out-zone', ['$event'])
    onMouseMove($event) {
        this.mouseMoveEventHandler($event);
    }

    @HostListener('document:mouseup.out-zone', ['$event'])
    onMouseUp($event) {
        this.mouseUpEventHandler($event);
    }

    @HostListener('mousedown.out-zone', ['$event'])
    onMouseDown($event) {
        this.mouseDownEventHandler($event);
    }

    @HostListener('dblclick.out-zone', ['$event'])
    onDblclick($event) {
        this.dbClickEventHandler($event);
    }

    //	Constructor
    constructor(
        private _differs: KeyValueDiffers,
        private _ngEl: ElementRef,
        private _renderer: Renderer2,
        private componentFactoryResolver: ComponentFactoryResolver,
        private _containerRef: ViewContainerRef,
    ) {}

    //	Public methods
    public ngOnInit(): void {
        this._renderer.addClass(this._ngEl.nativeElement, 'grid');
        if (this.autoStyle) this._renderer.setStyle(this._ngEl.nativeElement, 'position', 'relative');
        this.setConfig(this._config);
    }

    public ngOnDestroy(): void {
        this._destroyed = true;
    }

    public setConfig(config: NgGridConfig): void {
        this._config = config;

        var maxColRowChanged = false;
        for (var x in config) {
            var val = config[x];
            var intVal = !val ? 0 : parseInt(val);

            switch (x) {
                case 'margins':
                    this.setMargins(val);
                    break;
                case 'col_width':
                    this.colWidth = Math.max(intVal, 1);
                    break;
                case 'row_height':
                    this.rowHeight = Math.max(intVal, 1);
                    break;
                case 'auto_style':
                    this.autoStyle = val ? true : false;
                    break;
                case 'auto_resize':
                    this._autoResize = val ? true : false;
                    break;
                case 'draggable':
                    this.dragEnable = val ? true : false;
                    break;
                case 'resizable':
                    this.resizeEnable = val ? true : false;
                    break;
                case 'max_rows':
                    maxColRowChanged = maxColRowChanged || this._maxRows != intVal;
                    this._maxRows = intVal < 0 ? 0 : intVal;
                    break;
                case 'max_cols':
                    maxColRowChanged = maxColRowChanged || this._maxCols != intVal;
                    this._maxCols = intVal < 0 ? 0 : intVal;
                    break;
                case 'visible_rows':
                    this._visibleRows = Math.max(intVal, 0);
                    break;
                case 'visible_cols':
                    this._visibleCols = Math.max(intVal, 0);
                    break;
                case 'min_rows':
                    this.minRows = Math.max(intVal, 1);
                    break;
                case 'min_cols':
                    this.minCols = Math.max(intVal, 1);
                    break;
                case 'min_height':
                    this.minHeight = Math.max(intVal, 1);
                    break;
                case 'min_width':
                    this.minWidth = Math.max(intVal, 1);
                    break;
                case 'zoom_on_drag':
                    this._zoomOnDrag = val ? true : false;
                    break;
                case 'cascade':
                    if (this.cascade != val) {
                        this.cascade = val;
                        this._cascadeGrid();
                    }
                    break;
                case 'fix_to_grid':
                    this._fixToGrid = val ? true : false;
                    break;
                case 'maintain_ratio':
                    this._maintainRatio = val ? true : false;
                    break;
                case 'prefer_new':
                    this._preferNew = val ? true : false;
                    break;
                case 'limit_to_screen':
                    this._limitToScreen = !this._autoResize && !!val;

                    if (this._limitToScreen) {
                        this._maxCols = this._getContainerColumns();
                        this._maxRows = this._getContainerRows();
                    }
                    break;
                case 'container_height':
                    this._container_height = intVal;
                    break;
                case 'design_mode':
                    this.designMode = val ? true : false;
                    break;

                case 'design_size_diff_percentage':
                    this.design_size_diff_percentage = val ? val : 0;
                    break;
            }
        }

        if (this._maintainRatio) {
            if (this.colWidth && this.rowHeight) {
                this._aspectRatio = this.colWidth / this.rowHeight;
            } else {
                this._maintainRatio = false;
            }
        }
        this._initConfig(maxColRowChanged);
        setTimeout(() => {
            this._initConfig(maxColRowChanged);
            this.onInitializedGrid.emit(true);
        }, 500);
    }

    private _initConfig(maxColRowChanged) {
        if (this._limitToScreen) {
            this._maxCols = this._getContainerColumns();
            this._maxRows = this._getContainerRows();
        }

        /*
        if (maxColRowChanged) {
            if (this._maxCols > 0 && this._maxRows > 0) {	//	Can't have both, prioritise on cascade
                switch (this.cascade) {
                    case 'left':
                    case 'right':
                        this._maxCols = 0;
                        break;
                    case 'up':
                    case 'down':
                    default:
                        this._maxRows = 0;
                        break;
                }
            }
        }
        */

        let orgMaxWidth: number = this._ngEl.nativeElement.getBoundingClientRect().width;

        if (this.lastMaxWidth && orgMaxWidth != this.lastMaxWidth) {
            this.triggerResize();
        } else {
            this.updatePositionsAfterMaxChange();
        }
        this.lastMaxWidth = orgMaxWidth;

        this._calculateColWidth();
        this._calculateRowHeight();

        var maxWidth = this._maxCols * this.colWidth;
        var maxHeight = this._maxRows * this.rowHeight;

        if (maxWidth > 0 && this.minWidth > maxWidth) this.minWidth = 0.75 * this.colWidth;
        if (maxHeight > 0 && this.minHeight > maxHeight) this.minHeight = 0.75 * this.rowHeight;

        if (this.minWidth > this.colWidth)
            this.minCols = Math.max(this.minCols, Math.ceil(this.minWidth / this.colWidth));
        if (this.minHeight > this.rowHeight)
            this.minRows = Math.max(this.minRows, Math.ceil(this.minHeight / this.rowHeight));

        if (this._maxCols > 0 && this.minCols > this._maxCols) this.minCols = 1;
        if (this._maxRows > 0 && this.minRows > this._maxRows) this.minRows = 1;

        this._updateRatio();

        for (let item of this._items) {
            this._removeFromGrid(item);
            item.setCascadeMode(this.cascade);
        }

        for (let item of this._items) {
            item.recalculateSelf();
            this._addToGrid(item);
        }

        this._cascadeGrid();
        this._filterGrid();
        this._updateSize();
    }

    public getItemPosition(index: number): NgGridItemPosition {
        return this._items[index].getGridPosition();
    }

    public getItemSize(index: number): NgGridItemSize {
        return this._items[index].getSize();
    }

    public ngDoCheck(): boolean {
        if (this._differ != null) {
            var changes = this._differ.diff(this._config);

            if (changes != null) {
                this._applyChanges(changes);

                return true;
            }
        }

        return false;
    }

    public setMargins(margins: Array<string>): void {
        this.marginTop = Math.max(parseInt(margins[0]), 0);
        this.marginRight = margins.length >= 2 ? Math.max(parseInt(margins[1]), 0) : this.marginTop;
        this.marginBottom = margins.length >= 3 ? Math.max(parseInt(margins[2]), 0) : this.marginTop;
        this.marginBottom = margins.length >= 3 ? Math.max(parseInt(margins[2]), 0) : this.marginTop;
        this.marginLeft = margins.length >= 4 ? Math.max(parseInt(margins[3]), 0) : this.marginRight;
    }

    public enableDrag(): void {
        this.dragEnable = true;
    }

    public disableDrag(): void {
        this.dragEnable = false;
    }

    public enableResize(): void {
        this.resizeEnable = true;
    }

    public disableResize(): void {
        this.resizeEnable = false;
    }

    public addItem(ngItem: NgGridItem): void {
        ngItem.setCascadeMode(this.cascade);

        if (!this._preferNew) {
            // this._fixGridCollisions(ngItem.getGridPosition(), ngItem.getSize(), ngItem);
            let newPos = this._fixGridPosition(ngItem.getGridPosition(), ngItem.getSize(), ngItem);
            ngItem.setGridPosition(newPos);
            ngItem.setSize(ngItem.getSize());
        }

        let rs = this._items.filter((p) => p.config.payload == ngItem.config.payload);
        if (!rs.length) {
            this._items.push(ngItem);
        }

        this._addToGrid(ngItem);

        this._updateSize();
        this._cascadeGrid();
        // this._expandAllWidgetItems();
        ngItem.recalculateSelf();
        ngItem.onCascadeEvent();

        this._items.forEach((item) => {
            // item.syncConfig();
            item.onCascadeEvent();
        });

        //setTimeout(() => {
        //    this.calculateForAllItemsIncaseOutsideBoundX();
        //    this._emitOnItemChange();
        //});

        this._emitOnItemChange();
    }

    public removeItem(ngItem: NgGridItem): void {
        this._removeFromGrid(ngItem);

        for (let x: number = 0; x < this._items.length; x++) {
            if (this._items[x] == ngItem) {
                this._items.splice(x, 1);
            }
        }

        if (this._destroyed) return;

        this._cascadeGrid();
        this._updateSize();
        //this._fixGridForAllItemsInVertical();
        //this._fixGridForAllItemsInHorizontal();
        this._cascadeGrid();
        this._expandAllWidgetItems();
        this._items.forEach((item: NgGridItem) => {
            item.recalculateSelf();
            item.onCascadeEvent();
        });
        this._emitOnItemChange();
    }

    public updateItem(ngItem: NgGridItem, callStack: string = ''): void {
        this._removeFromGrid(ngItem);

        //TODO:
        /*
        if (callStack == 'reCaculate' || callStack == '_applyChanges') {
            var newPos = this._fixGridPosition(ngItem.getGridPosition(), ngItem.getSize());
            ngItem.setGridPosition(newPos);
        }
        */

        this._addToGrid(ngItem);

        if (callStack == '_applyChanges') {
            this._cascadeGrid();
        }

        this._updateSize();
        ngItem.onCascadeEvent();
    }

    public calculateForAllItemsIncaseOutsideBoundX() {
        // TODO: Handle for min width
        this._items.forEach((item) => {
            let pos = item.getGridPosition();
            let dims = item.getSize();
            const isBoundX = this._isWithinBoundsX(pos, dims, item);
            if (!isBoundX) {
                let step = pos.col + dims.x - 1 - this._maxCols;
                this.moveLeft(item, step);
            }
        });
        this._cascadeGrid();
    }

    public triggerCascade(): void {
        this._cascadeGrid(null, null);
    }

    public triggerResize(): void {
        //this._maxCols = this.getContainerColumns();
        //this._maxRows = this._getContainerRows();
        //this._expandAllWidgetItems();
        // this.resizeEventHandler_2(null);
        this.resizeEventHandler(null);
    }

    public lastMaxWidth: number = 0;

    /**
     * getCurrentMaxWidth
     * Issue: If container is hidden , can not get width
     */
    public getCurrentMaxWidth() {
        let maxWidth: number = this._ngEl.nativeElement.getBoundingClientRect().width;
        // console.log('maxWidth:' + maxWidth);
        return maxWidth;
    }

    /**
     * getCurrentDesignHeight: Design height
     * Issue: If container is hidden , can not get height
     */
    public getCurrentDesignHeight() {
        // this._container_height = this._ngEl.nativeElement.parentNode.parentNode.clientHeight;
        this._container_height = this._ngEl.nativeElement.clientHeight;
        /*
        // console.log('container_height:' + this._container_height);
        if (!this._container_height) {
            this._container_height = this._ngEl.nativeElement.parentNode.parentNode.clientHeight;
            // console.log('container_height_fixed:' + this._container_height);
        }
        */
        return this._container_height;
    }

    /**
     * getCurrentMaxHeight: include scroll height
     */
    public getCurrentMaxHeight() {
        let maxRow: number = this._getMaxRow();
        let maxHeight = maxRow * (this.rowHeight + this.marginTop + this.marginBottom);
        if (maxHeight < this.getCurrentDesignHeight()) {
            maxHeight = this.getCurrentDesignHeight();
        }
        return maxHeight;
    }

    /**
     * getDesignSizeUpdatePercentage
     */
    public getDesignSizeUpdatePercentage() {
        let iRet = 0;
        let designHeight = this.getCurrentDesignHeight();
        let maxHeight = this.getCurrentMaxHeight();
        // console.log('getDesignSizeUpdatePercentage_designHeight' + designHeight);
        // console.log('getDesignSizeUpdatePercentage_maxHeight' + maxHeight);
        if (maxHeight > designHeight) {
            let diff = maxHeight - designHeight;
            iRet = diff / designHeight;
        }
        // If not number, reset to 0
        if (!isFinite(iRet)) {
            iRet = 0;
        }
        return iRet;
    }

    public resizeEventHandler(e: any): void {
        if (!this.designMode) {
            return;
        }

        // NTH:
        let maxWidth: number = this.getCurrentMaxWidth();
        // console.log('maxWidth:' + maxWidth);
        if (!maxWidth) {
            return;
        }

        this._calculateColWidth();
        this._calculateRowHeight();
        this._updateRatio();

        // let sortItems = this.getAllItemsSortByColRow();

        this._maxCols = Math.round(maxWidth / (this.colWidth + this.marginLeft + this.marginRight));
        this._maxRows = this._getContainerRows();

        let sort_by = function (fields) {
            var n_fields = fields.length;

            return function (A, B) {
                var a, b, field, key, primer, reverse, result;
                for (var i = 0, l = n_fields; i < l; i++) {
                    result = 0;
                    field = fields[i];

                    key = typeof field === 'string' ? field : field.name;

                    a = A[key];
                    b = B[key];

                    if (typeof field.primer !== 'undefined') {
                        a = field.primer(a);
                        b = field.primer(b);
                    }

                    reverse = field.reverse ? -1 : 1;

                    if (a < b) result = reverse * -1;
                    if (a > b) result = reverse * 1;
                    if (result !== 0) break;
                }
                return result;
            };
        };

        this._items.forEach(item => {
            delete item['sortStatus'];
        });

        let sortItems = this._items.sort(
            sort_by([
                {
                    name: 'col',
                    primer: parseInt,
                },
                {
                    name: 'row',
                    primer: parseInt,
                },
            ]),
        );

        let rs = [];
        sortItems.forEach(sortItem => {
            let item = this.getNextValidGridItem(sortItems);
            if (item) {
                rs.push(item);
            }
        });


        this._items.forEach((item) => {
            this._removeFromGrid(item);
        });

        rs.forEach((item) => {
            item.reCaculate();
        });

        this._expandAllWidgetItems();

        this._updateSize();
    }

    public getNextValidGridItem(items: Array<NgGridItem>) {
        let target;
        for (let i = 0; i < items.length; i++) {
            if (!items[i]['sortStatus']) {
                let itemSrc = items[i];
                let isValid = true;
                for (let j = 0; j < items.length; j++) {
                    if (i == j) {
                        continue;
                    }
                    let itemCpr = items[j];

                    let itemCprRowStart = itemCpr.row;
                    let itemCprColStart = itemCpr.col;
                    let itemCprRowEnd = itemCprRowStart + itemCpr.sizey;
                    let itemCprColEnd = itemCpr.col + itemCpr.sizex;

                    let itemSrcRowStart = itemSrc.row;
                    let itemSrcColStart = itemSrc.col;
                    let itemSrcColEnd = itemSrc.col + itemSrc.sizex;

                    // Check if upper widget has intersect
                    if ((itemCprRowEnd == itemSrcRowStart) &&
                        (
                            (itemSrcColStart <= itemCprColStart && itemSrcColEnd >= itemCprColStart)
                            ||
                            (itemSrcColStart >= itemCprColStart && itemSrcColStart <= itemCprColEnd)
                        )) {
                        if (!itemCpr['sortStatus']) {
                            isValid = false;
                        }
                        break;
                    }
                }
                if (isValid) {
                    itemSrc['sortStatus'] = true;
                    target = itemSrc;
                    break;
                }
            }
        }
        return target;
    }

    public resizeEventHandler_2(e: any): void {
        let maxWidth: number = this.getCurrentMaxWidth();
        if (!maxWidth) {
            return;
        }

        this._calculateColWidth();
        this._calculateRowHeight();
        this._updateRatio();

        this._maxCols = Math.round(maxWidth / (this.colWidth + this.marginLeft + this.marginRight));
        this._maxRows = this._getContainerRows();

        this._items.forEach((item) => {
            let pos = item.getGridPosition();
            let dims = item.getSize();
            const isBoundX = this._isWithinBoundsX(pos, dims, item);
            if (!isBoundX) {
                let step = pos.col + dims.x - 1 - (this._maxCols + 1);
                this.moveLeft(item, step);
            }
        });
    }

    /**
     * moveLeft
     * @param item
     */
    private moveLeft(item: NgGridItem, step: number) {
        let pos = item.getGridPosition();
        let dims = item.getSize();

        if (this.canMoveToLeft(pos, dims, step)) {
            this._removeFromGrid(item);
            item.setGridPosition({
                row: item.row,
                col: item.col - step,
            });
            this._addToGrid(item, false);
            this._updateSize();
            item.recalculateSelf();
            item.onCascadeEvent();
        } else {
            const validWidth = item.isMeetWithMinWidth({
                x: item.sizex - step,
                y: item.sizey,
            });

            if (validWidth) {
                this._removeFromGrid(item);
                item.setSize({
                    x: item.sizex - step,
                    y: item.sizey,
                });
                this._addToGrid(item, false);
            } else {
                let preItems: Array<NgGridItem> = this.getPreItemsFromLeft(pos, dims, step);
                if (preItems && preItems.length) {
                    preItems.forEach((preItem) => {
                        let preItemStep = preItem.col + preItem.sizex - (item.col - step);
                        this.moveLeft(preItem, preItemStep);
                    });
                }
            }
        }
    }

    private _itemMouseClicked: NgGridItem;
    private _itemMouseDirectionClicked: string;

    /**
     * canMoveToLeft
     * @param pos
     * @param dims
     */
    private canMoveToLeft(pos: NgGridItemPosition, dims: NgGridItemSize, step: number): boolean {
        for (let i: number = 0; i < dims.y; i++) {
            if (this._itemGrid[pos.row + i][pos.col - step] != null) {
                return false;
            }
            if (pos.col - step < 1) {
                return false;
            }
        }
        return true;
    }

    /**
     * getPreItemsFromLeft
     * @param pos
     * @param dims
     */
    private getPreItemsFromLeft(pos: NgGridItemPosition, dims: NgGridItemSize, step: number) {
        let items: Array<NgGridItem> = [];
        for (let i: number = 0; i < dims.y; i++) {
            if (this._itemGrid[pos.row + i][pos.col - step] != null) {
                if (items.indexOf(this._itemGrid[pos.row + i][pos.col - step]) < 0) {
                    items.push(this._itemGrid[pos.row + i][pos.col - step]);
                }
            }
        }
        return items;
    }

    /**
     * _canExpandAtRight
     * @param pos
     * @param dims
     */
    private _canExpandAtRight(pos: NgGridItemPosition, dims: NgGridItemSize) {
        const lastCol = pos.col + dims.x - 1;
        const nextCol = lastCol + 1;
        if (nextCol > this._maxCols) {
            return false;
        }
        if (this._itemGrid[pos.row]) {
            for (let i: number = 0; i < dims.y; i++) {
                if (this._itemGrid[pos.row + i]) {
                    // If the next row have other existing widget , return false
                    if (this._itemGrid[pos.row + i][nextCol] != null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Check if can expand to the below row of the current item
     * @param pos
     * @param dims
     */
    private _canExpandAtBottom(pos: NgGridItemPosition, dims: NgGridItemSize): boolean {
        const lastRow = pos.row + dims.y - 1;
        const nextRow = lastRow + 1;
        if (nextRow > this._maxRows) {
            return false;
        }
        let canExpand: boolean = true;
        if (this._itemGrid[nextRow]) {
            for (let c: number = 0; c < dims.x; c++) {
                // If the next row have other existing widget , return false
                if (this._itemGrid[nextRow][pos.col + c] != null) {
                    canExpand = false;
                    break;
                }
            }
        }
        return canExpand;
    }

    /**
     * Check if expand to the edge of bottom
     * @param pos
     * @param dims
     */
    private _canExpandAtBottomEdge(pos: NgGridItemPosition, dims: NgGridItemSize): boolean {
        const lastRow = pos.row + dims.y - 1;
        const nextRow = lastRow + 1;
        if (nextRow >= this._maxRows) {
            return false;
        }
        let canExpand: boolean = true;
        for (let r = nextRow; r <= this._maxRows; r++) {
            for (let c: number = 0; c < dims.x; c++) {
                if (this._itemGrid[r]) {
                    // If the next row have other existing widget , return false
                    if (this._itemGrid[r][pos.col + c] != null) {
                        canExpand = false;
                        break;
                    }
                }
            }
        }
        return canExpand;
    }

    /**
     * _expandWidgetItemAtBottom
     * expand widget follow bottom direction
     * If found the valid pos, it expand to that pos and recursive to find the next pos to expand.
     * @param item
     */
    private _expandWidgetItemAtBottom(item: NgGridItem) {
        // This item is widget need to expand
        if (item != null) {
            let pos = item.getGridPosition();
            let size = item.getSize();
            // Check if can expand to the below row of the current item
            let canExpand = this._canExpandAtBottom(pos, size);

            // This widget can not expand anymore, so do nothing.
            if (!canExpand) {
                return;
            }

            let endRow = item.row + size.y - 1;
            // From endrow of expend widget, we need to loop next rows to find target widget.
            let targetItems: Array<NgGridItem> = [];
            // Loop row
            for (let r: number = endRow + 1; r <= this._curMaxRow; r++) {
                if (this._itemGrid[r] == undefined) continue;
                // If found the target widgets, then break
                if (targetItems.length) {
                    break;
                }
                //Loop each col on this row to find target widget.
                for (let c: number = 1; c <= this._curMaxCol; c++) {
                    if (this._itemGrid[r] == undefined) break;
                    // Find valid target widget
                    if (this._itemGrid[r][c] != null) {
                        const destItem: NgGridItem = this._itemGrid[r][c];
                        // Col will increase some steps to find ohter target widgets
                        c += destItem.sizex - 1;
                        targetItems.push(destItem);
                    }
                }
            }
            // Expand to below widget item
            if (targetItems.length) {
                this._removeFromGrid(item);
                // Find the next valid widget to expand
                // Find min value of (sizey + row) in targetItems list
                let targetItem = targetItems.reduce(function (prev, curr) {
                    return prev.sizey + prev.row < curr.sizey + curr.row ? prev : curr;
                });

                // Check if targetItem is left or right of current item
                const isLeft = targetItem.col + targetItem.sizex - 1 < item.col;
                const isRight = targetItem.col > item.col + item.sizex - 1;

                if (isLeft || isRight) {
                    let paddingRow = targetItem.row + targetItem.sizey - 1 - endRow;
                    item.setSize({
                        x: size.x,
                        y: size.y + paddingRow,
                    });
                } else {
                    let paddingRow = targetItem.row - endRow - 1;
                    item.setSize({
                        x: size.x,
                        y: size.y + paddingRow,
                    });
                }
                this._addToGrid(item);
                this._expandWidgetItemAtBottom(item);
            }
            // Expand to bottom edge
            else {
                this._removeFromGrid(item);
                const dims = this._fixSizeToBoundsY(pos, size, true);
                item.setSize({
                    x: size.x,
                    y: dims.y,
                });
                this._addToGrid(item);
            }
        }
    }

    /**
     * _expandWidgetItemAtBottomEnhance
     * expand widget follow bottom direction
     * If found the last valid pos, it will expand to that pos without recursive
     * @param item
     */
    private _expandWidgetItemAtBottomEnhance(item: NgGridItem) {
        // This item is widget need to expand
        if (item != null) {
            let pos = item.getGridPosition();
            let size = item.getSize();
            // Check if can expand to the below row of the current item
            let canExpand = this._canExpandAtBottom(pos, size);

            // This widget can not expand anymore, so do nothing.
            if (!canExpand) {
                return;
            }

            let endRow = item.row + size.y - 1;
            // From endrow of expend widget, we need to loop next rows to find target widget.
            let targetItems: Array<NgGridItem> = [];
            const startCol = item.col;
            const endCol = item.col + item.sizex - 1;

            // Loop row
            for (let r: number = endRow + 1; r <= this._curMaxRow; r++) {
                if (this._itemGrid[r] == undefined) continue;
                // If found the target widgets, then break
                if (targetItems.length) {
                    break;
                }
                //Loop each col on this row to find target widget.
                for (let c: number = startCol; c <= endCol; c++) {
                    if (this._itemGrid[r] == undefined) break;
                    // Find valid target widget
                    if (this._itemGrid[r][c] != null) {
                        const destItem: NgGridItem = this._itemGrid[r][c];
                        targetItems.push(destItem);
                    }
                }
            }
            // Expand to below widget item
            if (targetItems.length) {
                this._removeFromGrid(item);
                const targetItem = targetItems[0];
                let paddingRow = targetItem.row - endRow - 1;
                item.setSize({
                    x: size.x,
                    y: size.y + paddingRow,
                });
                this._addToGrid(item);
            }
            // Expand to bottom edge
            else {
                this._removeFromGrid(item);
                const dims = this._fixSizeToBoundsY(pos, size, true);
                item.setSize({
                    x: size.x,
                    y: dims.y,
                });
                this._addToGrid(item);
            }
        }
    }

    /**
     * _expandWidgetItemAtRight
     *  expand widget follow right direction
     * If found the valid pos, it expand to that pos and recursive to find the next pos to expand.
     * @param item
     */
    private _expandWidgetItemAtRight(item: NgGridItem) {
        // This item is widget need to expand
        if (item != null) {
            let pos = item.getGridPosition();
            let size = item.getSize();
            let canExpand = this._canExpandAtRight(pos, size);

            // This widget can not expand anymore, so do nothing.
            if (!canExpand) {
                return;
            }

            let endCol = item.col + size.x - 1;
            // From endcol of expend widget, we need to loop next rows to find target widget.
            let targetItems: Array<NgGridItem> = [];
            // Loop col
            for (let c: number = endCol + 1; c <= this._curMaxCol; c++) {
                // If found the target widgets, then break
                if (targetItems.length) {
                    break;
                }
                //Loop each row on this col to find target widget.
                for (let r: number = 1; r <= this._curMaxRow; r++) {
                    if (this._itemGrid[r] == undefined) break;
                    // Find valid target widget
                    if (this._itemGrid[r][c] != null) {
                        const destItem: NgGridItem = this._itemGrid[r][c];
                        // Col will increase some steps to find ohter target widgets
                        r += destItem.sizey - 1;
                        targetItems.push(destItem);
                    }
                }
            }
            // Expand to below widget item
            if (targetItems.length) {
                this._removeFromGrid(item);
                // Find the next valid widget to expand
                // Find min value of (sizex + col) in targetItems list
                let targetItem = targetItems.reduce(function (prev, curr) {
                    return prev.sizex + prev.col < curr.sizex + curr.col ? prev : curr;
                });

                // Check if targetItem is upper or below of current item
                const isUpper = targetItem.row + targetItem.sizey - 1 < item.row;
                const isBelow = targetItem.row > item.row + item.sizey - 1;
                if (isUpper || isBelow) {
                    let paddingCol = targetItem.col + targetItem.sizex - 1 - endCol;
                    item.setSize({
                        x: size.x + paddingCol,
                        y: size.y,
                    });
                } else {
                    let paddingCol = targetItem.col - endCol - 1;
                    item.setSize({
                        x: size.x + paddingCol,
                        y: size.y,
                    });
                }
                this._addToGrid(item);
                this._expandWidgetItemAtRight(item);
            }
            // Expand to right edge
            else {
                this._removeFromGrid(item);
                const dims = this._fixSizeToBoundsX(pos, size, item, true);
                item.setSize({
                    x: dims.x,
                    y: size.y,
                });
                this._addToGrid(item);
            }
        }
    }

    /**
     * _expandWidgetItemAtRightEnhance
     * expand widget follow right direction
     * If found the last valid pos, it will expand to that pos without recursive
     * @param item
     */
    private _expandWidgetItemAtRightEnhance(item: NgGridItem) {
        // This item is widget need to expand
        if (item != null) {
            let pos = item.getGridPosition();
            let size = item.getSize();
            let canExpand = this._canExpandAtRight(pos, size);

            // This widget can not expand anymore, so do nothing.
            if (!canExpand) {
                return;
            }

            let endCol = item.col + size.x - 1;
            // From endcol of expend widget, we need to loop next rows to find target widget.
            let targetItems: Array<NgGridItem> = [];

            const startRow = item.row;
            const endRow = item.row + item.sizey - 1;
            // Loop col
            for (let c: number = endCol + 1; c <= this._curMaxCol; c++) {
                // If found the target widgets, then break
                if (targetItems.length) {
                    break;
                }

                //Loop each row on this col to find target widget.
                for (let r: number = startRow; r <= endRow; r++) {
                    if (this._itemGrid[r] == undefined) break;
                    // Find valid target widget
                    if (this._itemGrid[r][c] != null) {
                        const destItem: NgGridItem = this._itemGrid[r][c];
                        targetItems.push(destItem);
                    }
                }
            }
            // Expand to below widget item
            if (targetItems.length) {
                this._removeFromGrid(item);
                let targetItem = targetItems[0];
                let paddingCol = targetItem.col - endCol - 1;
                item.setSize({
                    x: size.x + paddingCol,
                    y: size.y,
                });
                this._addToGrid(item);
            }
            // Expand to right edge
            else {
                this._removeFromGrid(item);
                const dims = this._fixSizeToBoundsX(pos, size, item, true);
                item.setSize({
                    x: dims.x,
                    y: size.y,
                });
                this._addToGrid(item);
            }
        }
    }

    /**
     *  Auto expand widget if valid
     * _expandAllWidgetItems
     */
    private _expandAllWidgetItems() {
        this._items.forEach((item) => {
            if (item != this._resizingItem) {
                this._expandWidgetItemAtBottomEnhance(item);
                this._expandWidgetItemAtRightEnhance(item);
                item.onCascadeEvent();
            }
        });
        if (this._resizingItem) {
            this._expandWidgetItemAtBottomEnhance(this._resizingItem);
            this._expandWidgetItemAtRightEnhance(this._resizingItem);
            this._resizingItem.onCascadeEvent();
        }
    }

    /**
     * dbClickEventHandler
     * @param e
     */
    public dbClickEventHandler(e: MouseEvent): void {
        let mousePos = this._getMousePosition(e);
        let item = this._getItemFromPosition(mousePos);
        this._expandWidgetItemAtBottomEnhance(item);
        this._expandWidgetItemAtRightEnhance(item);
    }

    public mouseDownEventHandler(e: MouseEvent): void {
        if (!this.designMode) return;

        var mousePos = this._getMousePosition(e);
        var item = this._getItemFromPosition(mousePos);

        if (item != null) {
            let direction: string = item.canResize(e);
            if (this.resizeEnable && direction) {
                this._resizeReady = true;
                this._itemMouseClicked = item;
                this._itemMouseDirectionClicked = direction;
                e.preventDefault();
            } else if (this.dragEnable && item.canDrag(e)) {
                this._dragReady = true;
                e.preventDefault();
            }
        }
    }

    public mouseUpEventHandler(e: any): void {
        if (this.isDragging) {
            this._dragStop(e);
        } else if (this.isResizing) {
            this._resizeStop(e);
        } else if (this._dragReady || this._resizeReady) {
            this._dragReady = false;
            this._resizeReady = false;
            this._itemMouseClicked = null;
            this._itemMouseDirectionClicked = null;
        }
    }

    public mouseMoveEventHandler(e: any): void {
        //console.log('clientX:' + e.clientX);
        //console.log('clientY:' + e.clientY);
        if (this._resizeReady) {
            this._resizeStart(e);
            e.preventDefault();
            return;
        } else if (this._dragReady) {
            this._dragStart(e);
            e.preventDefault();
            return;
        }

        if (this.isDragging) {
            this._drag(e);
        } else if (this.isResizing) {
            this._resize(e);
        } else {
            var mousePos = this._getMousePosition(e);
            var item = this._getItemFromPosition(mousePos);

            if (item) {
                item.onMouseMove(e);
            }
        }
    }

    //	Private methods
    private updatePositionsAfterMaxChange(): void {
        for (let item of this._items) {
            var pos = item.getGridPosition();
            var dims = item.getSize();

            if (
                !this._hasGridCollision(pos, dims) &&
                this._isWithinBounds(pos, dims, item) &&
                dims.x <= this._maxCols &&
                dims.y <= this._maxRows
            ) {
                continue;
            }

            this._removeFromGrid(item);

            if (this._maxCols > 0 && dims.x > this._maxCols) {
                dims.x = this._maxCols;
                item.setSize(dims);
            } else if (this._maxRows > 0 && dims.y > this._maxRows) {
                dims.y = this._maxRows;
                item.setSize(dims);
            }

            if (this._hasGridCollision(pos, dims) || !this._isWithinBounds(pos, dims, item)) {
                var newPosition = this._fixGridPosition(pos, dims, item);
                item.setGridPosition(newPosition);
            }

            this._addToGrid(item);
        }
    }

    private _calculateColWidth(): void {
        if (this._autoResize) {
            if (this._maxCols > 0 || this._visibleCols > 0) {
                var maxCols = this._maxCols > 0 ? this._maxCols : this._visibleCols;
                var maxWidth: number = this._ngEl.nativeElement.getBoundingClientRect().width;

                var colWidth: number = Math.floor(maxWidth / maxCols);
                colWidth -= this.marginLeft + this.marginRight;
                if (colWidth > 0) this.colWidth = colWidth;
            }
        }

        if (this.colWidth < this.minWidth || this.minCols > this._config.min_cols) {
            this.minCols = Math.max(this._config.min_cols, Math.ceil(this.minWidth / this.colWidth));
        }
    }

    private _calculateRowHeight(): void {
        if (this._autoResize) {
            if (this._maxRows > 0 || this._visibleRows > 0) {
                var maxRows = this._maxRows > 0 ? this._maxRows : this._visibleRows;
                var maxHeight: number = window.innerHeight - this.marginTop - this.marginBottom;

                var rowHeight: number = Math.max(Math.floor(maxHeight / maxRows), this.minHeight);
                rowHeight -= this.marginTop + this.marginBottom;
                if (rowHeight > 0) this.rowHeight = rowHeight;
            }
        }

        if (this.rowHeight < this.minHeight || this.minRows > this._config.min_rows) {
            this.minRows = Math.max(this._config.min_rows, Math.ceil(this.minHeight / this.rowHeight));
        }
    }

    private _updateRatio(): void {
        if (this._autoResize && this._maintainRatio) {
            if (this._maxCols > 0 && this._visibleRows <= 0) {
                this.rowHeight = this.colWidth / this._aspectRatio;
            } else if (this._maxRows > 0 && this._visibleCols <= 0) {
                this.colWidth = this._aspectRatio * this.rowHeight;
            } else if (this._maxCols == 0 && this._maxRows == 0) {
                if (this._visibleCols > 0) {
                    this.rowHeight = this.colWidth / this._aspectRatio;
                } else if (this._visibleRows > 0) {
                    this.colWidth = this._aspectRatio * this.rowHeight;
                }
            }
        }
    }

    private _applyChanges(changes: any): void {
        changes.forEachAddedItem((record: any) => {
            this._config[record.key] = record.currentValue;
        });
        changes.forEachChangedItem((record: any) => {
            this._config[record.key] = record.currentValue;
        });
        changes.forEachRemovedItem((record: any) => {
            delete this._config[record.key];
        });

        this.setConfig(this._config);
    }

    private _resizeStart(e: any): void {
        if (this.resizeEnable) {
            var mousePos = this._getMousePosition(e);

            var item = this._getItemFromPosition(mousePos);
            if (!item) {
                // console.log('NULL ITEM THEN RE-ASSIGN ');
                item = this._itemMouseClicked;
            }

            if (item) {
                item.startMoving();
                this._resizingItem = item;
                this._resizeDirection = item.canResize(e);
                // console.log('_resizeDirection:' + this._resizeDirection);

                if (!this._resizeDirection && this._itemMouseDirectionClicked) {
                    this._resizeDirection = this._itemMouseDirectionClicked;
                    // console.log('_resizeDirection Fixed:' + this._resizeDirection);
                }

                this._removeFromGrid(item);
                // this._createPlaceholder(item);
                this.isResizing = true;
                this._resizeReady = false;
                this._itemMouseClicked = null;
                this._itemMouseDirectionClicked = null;
                this.onResizeStart.emit(item);
                item.onResizeStartEvent();
            }
        }
    }

    private _dragStart(e: any): void {
        if (this.dragEnable) {
            var mousePos = this._getMousePosition(e);
            var item = this._getItemFromPosition(mousePos);

            if (item) {
                var itemPos = item.getPosition();
                var pOffset = { left: mousePos.left - itemPos.left, top: mousePos.top - itemPos.top };

                item.startMoving();
                this._draggingItem = item;
                this._posOffset = pOffset;
                // this._removeFromGrid(item);
                this._createPlaceholder(item);
                this._createPlaceholderForDraggingWidget(item);
                this.isDragging = true;
                this._dragReady = false;

                this.onDragStart.emit(item);
                item.onDragStartEvent();

                if (this._zoomOnDrag) {
                    this._zoomOut();
                }
            }
        }
    }

    private _drag(e: any): void {
        if (this.isDragging) {
            if (window.getSelection) {
                if (window.getSelection().empty) {
                    window.getSelection().empty();
                } else if (window.getSelection().removeAllRanges) {
                    window.getSelection().removeAllRanges();
                }
            } else if ((<any>document).selection) {
                (<any>document).selection.empty();
            }

            var mousePos = this._getMousePosition(e);
            var item = this._getItemFromPosition(mousePos);
            if (item) {
                this._placeholderRefForDraggingWidget.instance.setCurrentItem(item, null);
                this._placeholderRefForDraggingWidget.instance.setGridPosition({
                    row: item.row,
                    col: item.col,
                });
                this._placeholderRefForDraggingWidget.instance.setSize({
                    x: item.sizex,
                    y: item.sizey,
                });
            }
            this.onDrag.emit(this._draggingItem);
            this._draggingItem.onDragEvent();
        }
    }

    private _zoomOut(): void {
        this._renderer.setStyle(this._ngEl.nativeElement, 'transform', 'scale(0.5, 0.5)');
    }

    private _resetZoom(): void {
        this._renderer.setStyle(this._ngEl.nativeElement, 'transform', '');
    }

    /*
	private _drag(e: any): void {
		if (this.isDragging) {
			if (window.getSelection) {
				if (window.getSelection().empty) {
					window.getSelection().empty();
				} else if (window.getSelection().removeAllRanges) {
					window.getSelection().removeAllRanges();
				}
			} else if ((<any>document).selection) {
				(<any>document).selection.empty();
			}

			var mousePos = this._getMousePosition(e);
			var newL = (mousePos.left - this._posOffset.left);
			var newT = (mousePos.top - this._posOffset.top);

			var itemPos = this._draggingItem.getGridPosition();
			var gridPos = this._calculateGridPosition(newL, newT);
			var dims = this._draggingItem.getSize();

            gridPos = this._fixPosToBoundsX(gridPos, dims, this._draggingItem);

			if (!this._isWithinBoundsY(gridPos, dims)) {
				gridPos = this._fixPosToBoundsY(gridPos, dims);
			}

			if (gridPos.col != itemPos.col || gridPos.row != itemPos.row) {
                this._draggingItem.setGridPosition(gridPos, this._fixToGrid);

                // NTH
                //var newPos = this._fixGridPositionForPlaceHolder({ row: 1, col: gridPos.col }, dims, this._draggingItem);
                //this._placeholderRef.instance.setGridPosition(newPos);

				if (['up', 'down', 'left', 'right', 'up-left'].indexOf(this.cascade) >= 0) {
					this._fixGridCollisions(gridPos, dims, false, false);
					this._cascadeGrid(gridPos, dims);
                }

                //newPos = this._fixGridPositionForPlaceHolder({ row: 1, col: gridPos.col }, dims, this._draggingItem);
                //this._placeholderRef.instance.setGridPosition(newPos);
			}

			if (!this._fixToGrid) {
				this._draggingItem.setPosition(newL, newT);
			}

			this.onDrag.emit(this._draggingItem);
			this._draggingItem.onDragEvent();
		}
	}
    */

    /**
     * dragOverNewWidget
     * @param $event
     */
    public dragOverNewWidget(e: any) {
        let collisionsItems: Array<NgGridItem>;
        let mousePos = this._getMousePosition(e);
        let item = this._getItemFromPosition(mousePos);
        if (item) {
            const positionMode = item.getNewItemPosition(e);
            if (!this._placeholderRefForNewWidget) {
                this._createPlaceholderForNewWidget(item);
            }
            this._placeholderRefForNewWidget.instance.setCurrentItem(item, positionMode);
            let pos: NgGridItemPosition;
            let size: NgGridItemSize;
            let minWidthItem;
            switch (positionMode) {
                case 'left':
                    pos = {
                        row: item.row,
                        col: item.col,
                    };
                    size = {
                        x: Math.round(item.sizex / 2),
                        y: item.sizey,
                    };
                    this._placeholderRefForNewWidget.instance.setGridPosition(pos);
                    this._placeholderRefForNewWidget.instance.setSize(size);
                    break;

                case 'left-edge':
                    pos = {
                        row: 1,
                        col: 1,
                    };
                    size = {
                        x: Math.round(item.sizex / 2),
                        y: this._maxRows,
                    };

                    collisionsItems = this._getCollisions(pos, size);
                    collisionsItems = collisionsItems.filter((p) => p.isLeftEdge());
                    this._placeholderRefForNewWidget.instance.setCollisionItems(collisionsItems, positionMode);
                    minWidthItem = this._placeholderRefForNewWidget.instance.getMinWidthCollisionItem();

                    pos = {
                        row: 1,
                        col: 1,
                    };
                    size = {
                        x: Math.round(minWidthItem.sizex / 2),
                        y: this._maxRows,
                    };
                    this._placeholderRefForNewWidget.instance.setGridPosition(pos);
                    this._placeholderRefForNewWidget.instance.setSize(size);
                    break;

                case 'right':
                    pos = {
                        row: item.row,
                        col: item.col + Math.round(item.sizex / 2),
                    };
                    size = {
                        x: item.col + item.sizex - pos.col,
                        y: item.sizey,
                    };

                    this._placeholderRefForNewWidget.instance.setGridPosition(pos);
                    this._placeholderRefForNewWidget.instance.setSize(size);
                    break;
                case 'right-edge':
                    pos = {
                        row: 1,
                        col: item.col + Math.round(item.sizex / 2),
                    };
                    size = {
                        x: item.col + item.sizex - pos.col,
                        y: this._maxRows,
                    };

                    collisionsItems = this._getCollisions(pos, size);
                    collisionsItems = collisionsItems.filter((p) => p.isRightEdge());
                    this._placeholderRefForNewWidget.instance.setCollisionItems(collisionsItems, positionMode);
                    minWidthItem = this._placeholderRefForNewWidget.instance.getMinWidthCollisionItem();

                    pos = {
                        row: 1,
                        col: minWidthItem.col + Math.round(minWidthItem.sizex / 2),
                    };
                    size = {
                        x: minWidthItem.col + minWidthItem.sizex - pos.col,
                        y: this._maxRows,
                    };
                    this._placeholderRefForNewWidget.instance.setGridPosition(pos);
                    this._placeholderRefForNewWidget.instance.setSize(size);
                    break;
                case 'top':
                    pos = {
                        row: item.row,
                        col: item.col,
                    };
                    size = {
                        x: item.sizex,
                        y: Math.round(item.sizey / 2),
                    };
                    this._placeholderRefForNewWidget.instance.setGridPosition(pos);
                    this._placeholderRefForNewWidget.instance.setSize(size);
                    break;
                case 'bottom':
                    pos = {
                        row: item.row + Math.round(item.sizey / 2),
                        col: item.col,
                    };
                    size = {
                        x: item.sizex,
                        y: item.row + item.sizey - pos.row,
                    };
                    this._placeholderRefForNewWidget.instance.setGridPosition(pos);
                    this._placeholderRefForNewWidget.instance.setSize(size);
                    break;
                case 'bottom-edge':
                    pos = {
                        row: item.row + Math.round(item.sizey / 2),
                        col: 1,
                    };
                    size = {
                        x: this._maxCols,
                        y: item.row + item.sizey - pos.row,
                    };

                    collisionsItems = this._getCollisions(pos, size);
                    collisionsItems = collisionsItems.filter((p) => p.isBottomEdge());
                    this._placeholderRefForNewWidget.instance.setCollisionItems(collisionsItems, positionMode);
                    const minHeightItem = this._placeholderRefForNewWidget.instance.getMinHeightCollisionItem();

                    pos = {
                        row: minHeightItem.row + Math.round(minHeightItem.sizey / 2),
                        col: 1,
                    };
                    size = {
                        x: this._maxCols,
                        y: minHeightItem.row + minHeightItem.sizey - pos.row,
                    };

                    this._placeholderRefForNewWidget.instance.setGridPosition(pos);
                    this._placeholderRefForNewWidget.instance.setSize(size);
                    break;
            }

            if (size) {
                const newItemWidth = size.x * this.colWidth + (this.marginLeft + this.marginRight) * (size.x - 1);
                const newItemHeight = size.y * this.rowHeight + (this.marginTop + this.marginBottom) * (size.y - 1);

                // Invalid case
                if (newItemWidth < item.minWidth || newItemHeight < item.minHeight) {
                    this._placeholderRefForNewWidget.instance.setBackgroundColor('rgba(191, 160, 160, 0.3)');
                    this._placeholderRefForNewWidget.instance.setError();
                }
                // valid case
                else {
                    this._placeholderRefForNewWidget.instance.setBackgroundColor('rgba(192, 220, 198, 0.3)');
                    this._placeholderRefForNewWidget.instance.clearError();
                }
            }
        } else {
            if (!this._items || !this._items.length) {
                if (!this._placeholderRefForNewWidget) {
                    this._createPlaceholderForNewWidget(null);
                    this._placeholderRefForNewWidget.instance.setZIndex('-1');
                }
            }
        }
    }

    /**
     * dropStopNewWidget
     */
    public dropStopNewWidget() {
        if (this._placeholderRefForNewWidget) {
            const isError = this._placeholderRefForNewWidget.instance.getErrorStatus();
            if (isError) {
                this.destroyPlaceholderRefForNewWidget();
                return null;
            }
            let collision;
            // Size & Pos for new widget (placeholder when dragging on widget container)
            const size: NgGridItemSize = this._placeholderRefForNewWidget.instance.getSize();
            const pos: NgGridItemPosition = this._placeholderRefForNewWidget.instance.getGridPosition();

            // Current widget need to split for new widget
            const currentItem = this._placeholderRefForNewWidget.instance.getCurrentItem();
            if (currentItem && currentItem.item) {
                let item = currentItem.item;
                // We need to re-calculate pos & size current widget based on pos & size of new widget
                switch (currentItem.positionMode) {
                    case 'left': // Split current widget in horizontal - new widget is at left and current widget is at right
                        this.removeFromGrid(item);
                        item.setGridPosition({
                            row: item.row,
                            col: item.col + size.x,
                        });
                        item.setSize({
                            x: item.sizex - size.x,
                            y: item.sizey,
                        });
                        this.addToGrid(item);
                        break;

                    case 'left-edge': // Create new widget at left edge of this container
                        collision = this._placeholderRefForNewWidget.instance.getCollisionItems();
                        if (collision && collision.collisionItems) {
                            collision.collisionItems.forEach((item: NgGridItem) => {
                                this.removeFromGrid(item);
                                item.setGridPosition({
                                    row: item.row,
                                    col: item.col + size.x,
                                });
                                item.setSize({
                                    x: item.sizex - size.x,
                                    y: item.sizey,
                                });
                                this.addToGrid(item);
                            });
                        }
                        break;

                    case 'right': // Split current widget in horizontal - new widget is at right and current widget is at left
                        this.removeFromGrid(item);
                        item.setGridPosition({
                            row: item.row,
                            col: item.col,
                        });
                        item.setSize({
                            x: item.sizex - size.x, // width of current item - width of new widget
                            y: item.sizey, // Keep the current height because we are splitting current widget in horizontal
                        });
                        this.addToGrid(item);
                        break;

                    case 'right-edge': // Create new widget at right edge of this container
                        collision = this._placeholderRefForNewWidget.instance.getCollisionItems();
                        if (collision && collision.collisionItems) {
                            collision.collisionItems.forEach((item) => {
                                this.removeFromGrid(item);
                                item.setGridPosition({
                                    row: item.row,
                                    col: item.col,
                                });
                                item.setSize({
                                    x: item.sizex - size.x, // width of current item - width of new widget
                                    y: item.sizey, // Keep the current height because we are splitting current widget in horizontal
                                });
                                this.addToGrid(item);
                            });
                        }
                        break;

                    case 'top': // Split current widget in vertical - new widget is at top and current widget is at bottom
                        this.removeFromGrid(item);
                        item.setGridPosition({
                            row: item.row + size.y,
                            col: item.col,
                        });
                        item.setSize({
                            x: item.sizex,
                            y: item.sizey - size.y,
                        });
                        this.addToGrid(item);
                        break;

                    case 'bottom': // Split current widget in vertical - new widget is at bottom and current widget is at top
                        this.removeFromGrid(item);
                        item.setGridPosition({
                            row: item.row,
                            col: item.col,
                        });
                        item.setSize({
                            x: item.sizex,
                            y: item.sizey - size.y,
                        });
                        this.addToGrid(item);
                        break;

                    case 'bottom-edge': // Create new widget at bottom edge of this container
                        collision = this._placeholderRefForNewWidget.instance.getCollisionItems();
                        if (collision && collision.collisionItems) {
                            collision.collisionItems.forEach((item) => {
                                this.removeFromGrid(item);
                                item.setGridPosition({
                                    row: item.row,
                                    col: item.col,
                                });
                                item.setSize({
                                    x: item.sizex,
                                    y: item.sizey - size.y,
                                });
                                this.addToGrid(item);
                            });
                        }
                        break;
                }
                // Don't use onCascadeEvent in this case because when drag new widget in to this, it split the current
                // widget into 2 part (1 for current and 1 for new widget) - onCascadeEvent will trigger run detection
                // changes of this config again and redraw the current widget while the new widget has not been added yet
                // So we only need to update sizex-y, row-col, top-left, width-height percentage at  this time
                // but in config still keep old value to prevent re-draw widget.
                // We will sync new value to config after adding new widget successfully.
                // item.onCascadeEvent();

                item.updateTopLeftPercentage();
                item.updateWidthHeightPercentage();
                if (collision && collision.collisionItems) {
                    collision.collisionItems.forEach((collisionItem) => {
                        collisionItem.updateTopLeftPercentage();
                        collisionItem.updateWidthHeightPercentage();
                    });
                }
            }

            this.destroyPlaceholderRefForNewWidget();

            return {
                size,
                pos,
            };
        }
        return null;
    }

    /**
     * destroyPlaceholderRefForNewWidget
     */
    public destroyPlaceholderRefForNewWidget() {
        if (this._placeholderRefForNewWidget) {
            this._placeholderRefForNewWidget.destroy();
            this._placeholderRefForNewWidget = null;
        }
    }

    /**
     * _fixRightWidgetsToBoundsX
     */
    //private _fixRightWidgetsToBoundsX() {
    //    //let rightEdgeItems = this._findWidgetsAtRightEdge();
    //    //rightEdgeItems.forEach(rightItem => {
    //    //    this._removeFromGrid(rightItem);
    //    //    const newDims = this._fixSizeToBoundsX(rightItem.getGridPosition(), rightItem.getSize(), rightItem, true);
    //    //    rightItem.setSize(newDims);
    //    //    this._addToGrid(rightItem);
    //    //});
    //    this._expandAllWidgetItems();
    //}

    /**
     * _fixBottomWidgetsToBoundsY
     */
    //private _fixBottomWidgetsToBoundsY() {
    //    //let bottomEdgeItems = this._findWidgetsAtBottomEdge();
    //    //bottomEdgeItems.forEach(bottomItem => {
    //    //    this._removeFromGrid(bottomItem);
    //    //    const newDims = this._fixSizeToBoundsY(bottomItem.getGridPosition(), bottomItem.getSize(), true);
    //    //    bottomItem.setSize(newDims);
    //    //    this._addToGrid(bottomItem);
    //    //});
    //    this._expandAllWidgetItems();
    //}

    private _resize(e: any): void {
        if (this.isResizing) {
            if (window.getSelection) {
                if (window.getSelection().empty) {
                    window.getSelection().empty();
                } else if (window.getSelection().removeAllRanges) {
                    window.getSelection().removeAllRanges();
                }
            } else if ((<any>document).selection) {
                (<any>document).selection.empty();
            }

            const mousePos = this._getMousePosition(e);
            const itemPos = this._resizingItem.getPosition();
            const itemDims = this._resizingItem.getDimensions();
            const endCorner = {
                left: itemPos.left + itemDims.width,
                top: itemPos.top + itemDims.height,
            };

            const resizeTop = this._resizeDirection.includes('top');
            const resizeBottom = this._resizeDirection.includes('bottom');
            const resizeLeft = this._resizeDirection.includes('left');
            const resizeRight = this._resizeDirection.includes('right');

            //	Calculate new width and height based upon resize direction
            let newW = resizeRight
                ? mousePos.left - itemPos.left + 1
                : resizeLeft
                ? endCorner.left - mousePos.left + 1
                : itemDims.width;
            let newH = resizeBottom
                ? mousePos.top - itemPos.top + 1
                : resizeTop
                ? endCorner.top - mousePos.top + 1
                : itemDims.height;

            //var newW = this._resizeDirection == 'height' ? itemDims.width : (mousePos.left - itemPos.left + 10);
            //var newH = this._resizeDirection == 'width' ? itemDims.height : (mousePos.top - itemPos.top + 10);

            if (newW < this.minWidth) newW = this.minWidth;
            if (newH < this.minHeight) newH = this.minHeight;
            if (newW < this._resizingItem.minWidth) newW = this._resizingItem.minWidth;
            if (newH < this._resizingItem.minHeight) newH = this._resizingItem.minHeight;

            let newX = itemPos.left;
            let newY = itemPos.top;

            if (resizeLeft) newX = endCorner.left - newW;
            if (resizeTop) newY = endCorner.top - newH;

            var calcSize = this._calculateGridSize(newW, newH);
            var itemSize = this._resizingItem.getSize();
            var iGridPos = this._resizingItem.getGridPosition();
            const bottomRightCorner = {
                col: iGridPos.col + itemSize.x,
                row: iGridPos.row + itemSize.y,
            };
            const targetPos: NgGridItemPosition = Object.assign({}, iGridPos);

            if (this._resizeDirection.includes('top')) targetPos.row = bottomRightCorner.row - calcSize.y;
            if (this._resizeDirection.includes('left')) targetPos.col = bottomRightCorner.col - calcSize.x;

            if (!this._isWithinBoundsX(targetPos, calcSize, this._resizingItem)) {
                calcSize = this._fixSizeToBoundsX(targetPos, calcSize, this._resizingItem);
            }

            if (!this._isWithinBoundsY(targetPos, calcSize)) calcSize = this._fixSizeToBoundsY(targetPos, calcSize);

            calcSize = this._resizingItem.fixResize(calcSize);

            let canResize = this._canResize(targetPos, calcSize, this._resizingItem);
            if (canResize) {
                if (calcSize.x != itemSize.x || calcSize.y != itemSize.y) {
                    this._resizingItem.setGridPosition(targetPos, this._fixToGrid);
                    this._resizingItem.setSize(calcSize, this._fixToGrid);

                    // this._placeholderRef.instance.setSize(calcSize);

                    // NTH
                    //var newPos = this._fixGridPositionForPlaceHolder({ row: 1, col: iGridPos.col }, calcSize, this._resizingItem);
                    //this._placeholderRef.instance.setGridPosition(newPos);

                    if (['up', 'down', 'left', 'right', 'up-left'].indexOf(this.cascade) >= 0) {
                        this._fixGridCollisions(targetPos, calcSize, this._resizingItem);
                        this._cascadeGrid(targetPos, calcSize);
                    }

                    // newPos = this._fixGridPositionForPlaceHolder({ row: 1, col: iGridPos.col }, calcSize, this._resizingItem);
                    // this._placeholderRef.instance.setGridPosition(newPos);
                }
            }

            if (!this._fixToGrid) {
                this._resizingItem.setDimensions(newW, newH);
                this._resizingItem.setPosition(newX, newY);
            }

            // var bigGrid = this._maxGridSize(itemPos.left + newW + (2 * e.movementX), itemPos.top + newH + (2 * e.movementY));

            // if (this._resizeDirection == 'height') bigGrid.x = iGridPos.col + itemSize.x;
            // if (this._resizeDirection == 'width') bigGrid.y = iGridPos.row + itemSize.y;

            this.onResize.emit(this._resizingItem);
            this._resizingItem.onResizeEvent();
        }
    }

    /**
     * setDesignMode
     * @param status
     */
    public setDesignMode(status) {
        this._config.resizable = status;
        this._config.draggable = status;
        this._config.design_mode = status;

        // View Mode
        if (!status) {
            this._config.design_size_diff_percentage = this.getDesignSizeUpdatePercentage();
        }
    }

    /**
     * triggerResizeStopEventForAllItems
     */
    public triggerResizeStopEventForAllItems() {
        this.design_size_diff_percentage = this.getDesignSizeUpdatePercentage();
        this._items.forEach((item) => {
            item.updateTopLeftPercentage();
            item.updateWidthHeightPercentage();
            item.onResizeStopEvent();
        });
    }

    /**
     * triggerDragStopEventForAllItems
     */
    public triggerDragStopEventForAllItems() {
        this.design_size_diff_percentage = this.getDesignSizeUpdatePercentage();
        this._items.forEach((item) => {
            item.updateTopLeftPercentage();
            item.updateWidthHeightPercentage();
            item.onDragStopEvent();
        });
    }

    /**
     * _dragStop
     * @param e
     */
    private _dragStop(e: any): void {
        try {
            if (this.isDragging) {
                this.isDragging = false;

                if (!this._placeholderRef || !this._placeholderRefForDraggingWidget) {
                    return;
                }

                // Current widget need to swap
                const currentItem = this._placeholderRefForDraggingWidget.instance.getCurrentItem();
                const targetItem = currentItem.item;

                if (!targetItem || !this._draggingItem) {
                    return;
                }

                if (targetItem === this._draggingItem) {
                    return;
                }

                let fromItemPos = this._draggingItem.getGridPosition();
                let fromItemSize = this._draggingItem.getSize();

                let targetItemPos = targetItem.getGridPosition();
                let targetItemSize = targetItem.getSize();

                this.removeFromGrid(targetItem);
                this.removeFromGrid(this._draggingItem);

                this._draggingItem.setGridPosition({
                    row: targetItemPos.row,
                    col: targetItemPos.col,
                });

                this._draggingItem.setSize({
                    x: targetItemSize.x,
                    y: targetItemSize.y,
                });

                this._addToGrid(this._draggingItem);

                targetItem.setGridPosition({
                    row: fromItemPos.row,
                    col: fromItemPos.col,
                });

                targetItem.setSize({
                    x: fromItemSize.x,
                    y: fromItemSize.y,
                });

                this._addToGrid(targetItem);

                //this._draggingItem.setGridPosition(itemPos);
                //this._addToGrid(this._draggingItem);
                //this._updateSize();
                //this._cascadeGrid();
                //this._expandAllWidgetItems();
                //this._updateSize();
                //this._filterGrid();

                this.triggerDragStopEventForAllItems();

                this._draggingItem.stopMoving();
                this.onDragStop.emit(this._draggingItem);
                this._draggingItem = null;
                this._posOffset = null;
                this._placeholderRef.destroy();
                this._placeholderRefForDraggingWidget.destroy();

                this._emitOnItemChange();

                if (this._zoomOnDrag) {
                    this._resetZoom();
                }
            }
        } finally {
            if (this._placeholderRef) {
                this._placeholderRef.destroy();
            }
            if (this._placeholderRefForDraggingWidget) {
                this._placeholderRefForDraggingWidget.destroy();
            }
        }
    }

    /**
     * _dragStop
     * @param e
     */
    /*
	private _dragStop(e: any): void {
		if (this.isDragging) {
			this.isDragging = false;

			var itemPos = this._draggingItem.getGridPosition();

            this._draggingItem.setGridPosition(itemPos);
            // this._draggingItem.updateTopLeftPercentage();
            this._addToGrid(this._draggingItem);            
            this._updateSize();
            this._cascadeGrid();
            this._expandAllWidgetItems();
			this._updateSize();
			this._filterGrid();

            this.triggerDragStopEventForAllItems();

			this._draggingItem.stopMoving();
			// this._draggingItem.onDragStopEvent();
			this.onDragStop.emit(this._draggingItem);
			this._draggingItem = null;
			this._posOffset = null;
            this._placeholderRef.destroy();
            this._placeholderRefForDraggingWidget.destroy();

			this._emitOnItemChange();

			if (this._zoomOnDrag) {
				this._resetZoom();
			}
		}
    }
    */

    private _resizeStop(e: any): void {
        if (this.isResizing) {
            this.isResizing = false;

            var itemDims = this._resizingItem.getSize();

            this._resizingItem.setSize(itemDims);
            this._addToGrid(this._resizingItem);
            this._updateSize();
            // this._cascadeGrid();
            this._expandAllWidgetItems();
            this._updateSize();
            this._filterGrid();

            this.triggerResizeStopEventForAllItems();

            this._resizingItem.stopMoving();
            //this._resizingItem.onResizeStopEvent();
            this.onResizeStop.emit(this._resizingItem);
            this._resizingItem = null;
            this._resizeDirection = null;

            // this._placeholderRef.destroy();

            this._emitOnItemChange();

            // TODO: Handle for min width
            /*
            this._items.forEach(item => {
                let pos = item.getGridPosition();
                let dims = item.getSize();
                const isBoundX = this._isWithinBoundsX(pos, dims, item);
                if (!isBoundX) {
                    let step = (pos.col + dims.x - 1) - (this._maxCols);
                    this.moveLeft(item, step);
                }
            });
            */
            this._cascadeGrid();
            this._expandAllWidgetItems();
            this.triggerResizeStopEventForAllItems();
        }
    }

    private _maxGridSize(w: number, h: number): NgGridItemSize {
        var sizex = Math.ceil(w / (this.colWidth + this.marginLeft + this.marginRight));
        var sizey = Math.ceil(h / (this.rowHeight + this.marginTop + this.marginBottom));
        return { x: sizex, y: sizey };
    }

    private _calculateGridSize(width: number, height: number): NgGridItemSize {
        width += this.marginLeft + this.marginRight;
        height += this.marginTop + this.marginBottom;

        var sizex = Math.max(this.minCols, Math.round(width / (this.colWidth + this.marginLeft + this.marginRight)));
        var sizey = Math.max(this.minRows, Math.round(height / (this.rowHeight + this.marginTop + this.marginBottom)));

        if (!this._isWithinBoundsX({ col: 1, row: 1 }, { x: sizex, y: sizey }, null)) sizex = this._maxCols;
        if (!this._isWithinBoundsY({ col: 1, row: 1 }, { x: sizex, y: sizey })) sizey = this._maxRows;

        return { x: sizex, y: sizey };
    }

    private _calculateGridPosition(left: number, top: number): NgGridItemPosition {
        var col = Math.max(1, Math.round(left / (this.colWidth + this.marginLeft + this.marginRight)) + 1);
        var row = Math.max(1, Math.round(top / (this.rowHeight + this.marginTop + this.marginBottom)) + 1);

        if (!this._isWithinBoundsX({ col: col, row: row }, { x: 1, y: 1 }, null)) col = this._maxCols;
        if (!this._isWithinBoundsY({ col: col, row: row }, { x: 1, y: 1 })) row = this._maxRows;

        return { col: col, row: row };
    }

    public _hasGridCollision(pos: NgGridItemPosition, dims: NgGridItemSize): boolean {
        var positions = this._getCollisions(pos, dims);

        if (positions == null || positions.length == 0) return false;

        return positions.some((v: NgGridItem) => {
            return !(v === null);
        });
    }

    private _getCollisions(pos: NgGridItemPosition, dims: NgGridItemSize): Array<NgGridItem> {
        const returns: Array<NgGridItem> = [];

        if (!pos.col) {
            pos.col = 1;
        }
        if (!pos.row) {
            pos.row = 1;
        }

        for (let j: number = 0; j < dims.y; j++) {
            if (this._itemGrid[pos.row + j] != null) {
                for (let i: number = 0; i < dims.x; i++) {
                    if (this._itemGrid[pos.row + j][pos.col + i] != null) {
                        const item: NgGridItem = this._itemGrid[pos.row + j][pos.col + i];

                        if (returns.indexOf(item) < 0) returns.push(item);

                        const itemPos: NgGridItemPosition = item.getGridPosition();
                        const itemDims: NgGridItemSize = item.getSize();

                        i = itemPos.col + itemDims.x - pos.col;
                    }
                }
            }
        }

        return returns;
    }

    /**
     * _canResize
     * @param pos
     * @param dims
     * @param item
     */
    private _canResize(pos: NgGridItemPosition, dims: NgGridItemSize, item: NgGridItem) {
        if (pos.row <= 0 || pos.col <= 0) {
            return false;
        }
        let isValid: boolean = true;
        if (this._hasGridCollision(pos, dims)) {
            const collisions: Array<NgGridItem> = this._getCollisions(pos, dims);
            let directionMode = this._getDirectionModeFromCollision(item, collisions[0]);

            collisions.forEach((collision) => {
                const itemCollisionPos: NgGridItemPosition = collision.getGridPosition();
                const itemCollisionDims: NgGridItemSize = collision.getSize();
                let padding: number;
                let newSizex: number;
                let newSizey: number;
                let newItemWidth: number;
                let isMeetMinWidthOfItem: boolean;
                let isMeetMinHeightOfItem: boolean;
                switch (directionMode) {
                    case 'top':
                        padding = itemCollisionPos.row + itemCollisionDims.y - 1 - pos.row;
                        newSizey = itemCollisionDims.y - (padding + 1);
                        isMeetMinHeightOfItem = collision.isMeetWithMinHeight({
                            x: itemCollisionDims.x,
                            y: newSizey,
                        });
                        if (!isMeetMinHeightOfItem || newSizey <= this.minHeight) {
                            isValid = false;
                        }
                        break;
                    case 'bottom':
                        padding = pos.row + dims.y - itemCollisionPos.row;
                        newSizey = itemCollisionDims.y - padding;
                        isMeetMinHeightOfItem = collision.isMeetWithMinHeight({
                            x: itemCollisionDims.x,
                            y: newSizey,
                        });
                        if (!isMeetMinHeightOfItem || newSizey <= this.minHeight) {
                            isValid = false;
                        }
                        break;
                    case 'left': // Impact from left
                        padding = itemCollisionPos.col + itemCollisionDims.x - pos.col;
                        newSizex = itemCollisionDims.x - padding;
                        isMeetMinWidthOfItem = collision.isMeetWithMinWidth({
                            x: newSizex,
                            y: itemCollisionDims.y,
                        });

                        if (!isMeetMinWidthOfItem || newSizex <= this.minWidth) {
                            isValid = false;
                        }
                        break;
                    case 'right':
                        padding = pos.col + dims.x - itemCollisionPos.col;
                        // itemPos.col = pos.col + dims.x;
                        newSizex = itemCollisionDims.x - padding;

                        isMeetMinWidthOfItem = collision.isMeetWithMinWidth({
                            x: newSizex,
                            y: itemCollisionDims.y,
                        });

                        if (!isMeetMinWidthOfItem || newSizex <= this.minWidth) {
                            isValid = false;
                        }
                        break;

                    default:
                        break;
                }
            });
        }
        return isValid;
    }

    /**
     * _getDirectionModeFromCollision
     * @param item
     * @param collision
     */
    private _getDirectionModeFromCollision(item: NgGridItem, collision: NgGridItem) {
        if (this.isResizing) {
            if (this._resizeDirection == 'right') {
                return 'right';
            } else if (this._resizeDirection == 'bottom') {
                return 'bottom';
            } else if (this._resizeDirection == 'left') {
                return 'left';
            } else if (this._resizeDirection == 'top') {
                return 'top';
            }
        }

        // In resize case , col & row from config is original value before resizing
        // So we need get from config to compare with collision
        const rightColItem = item.config.col + item.config.sizex - 1;
        const bottomRowItem = item.config.row + item.config.sizey - 1;

        // Impact from right of item
        if (rightColItem < collision.col) {
            return 'right';
        }
        // Impact from bottom of item
        else if (bottomRowItem < collision.row) {
            return 'bottom';
        }
        // Impact from left of item
        else if (item.config.col > collision.col + collision.sizex - 1) {
            return 'left';
        } else if (item.config.row > collision.row + collision.sizey - 1) {
            return 'top';
        }
        return 'left';
    }

    private _fixGridCollisions(
        pos: NgGridItemPosition,
        dims: NgGridItemSize,
        item: NgGridItem,
        fixSizeYIfInvalid: boolean = true,
        fixSizeXIfInvalid: boolean = true,
    ): void {
        let retries = 100;
        while (this._hasGridCollision(pos, dims) && retries-- > 0) {
            const collisions: Array<NgGridItem> = this._getCollisions(pos, dims);

            this._removeFromGrid(collisions[0]);

            let directionMode = this._getDirectionModeFromCollision(item, collisions[0]);

            const itemCollisionPos: NgGridItemPosition = collisions[0].getGridPosition();
            const itemCollisionDims: NgGridItemSize = collisions[0].getSize();
            let padding: number;

            switch (directionMode) {
                case 'top':
                    padding = itemCollisionPos.row + itemCollisionDims.y - 1 - pos.row;
                    itemCollisionDims.y = itemCollisionDims.y - (padding + 1);
                    if (!this._isWithinBoundsY(itemCollisionPos, itemCollisionDims) && fixSizeYIfInvalid) {
                        const newDims: NgGridItemSize = this._fixSizeToBoundsY(itemCollisionPos, itemCollisionDims);
                        itemCollisionDims.x = newDims.x;
                        itemCollisionDims.y = newDims.y;
                    }
                    break;

                case 'bottom':
                    padding = pos.row + dims.y - itemCollisionPos.row;
                    itemCollisionPos.row = pos.row + dims.y;
                    itemCollisionDims.y = itemCollisionDims.y - padding;
                    if (!this._isWithinBoundsY(itemCollisionPos, itemCollisionDims) && fixSizeYIfInvalid) {
                        const newDims: NgGridItemSize = this._fixSizeToBoundsY(itemCollisionPos, itemCollisionDims);
                        itemCollisionDims.x = newDims.x;
                        itemCollisionDims.y = newDims.y;
                    }
                    break;

                case 'left':
                    padding = itemCollisionPos.col + itemCollisionDims.x - 1 - pos.col;
                    itemCollisionDims.x = itemCollisionDims.x - (padding + 1);
                    if (
                        !this._isWithinBoundsX(itemCollisionPos, itemCollisionDims, collisions[0]) &&
                        fixSizeXIfInvalid
                    ) {
                        const newDims: NgGridItemSize = this._fixSizeToBoundsX(
                            itemCollisionPos,
                            itemCollisionDims,
                            null,
                        );
                        itemCollisionDims.x = newDims.x;
                        itemCollisionDims.y = newDims.y;
                    }
                    break;

                case 'right':
                    padding = pos.col + dims.x - itemCollisionPos.col;
                    itemCollisionPos.col = pos.col + dims.x;
                    itemCollisionDims.x = itemCollisionDims.x - padding;
                    if (
                        !this._isWithinBoundsX(itemCollisionPos, itemCollisionDims, collisions[0]) &&
                        fixSizeXIfInvalid
                    ) {
                        const newDims: NgGridItemSize = this._fixSizeToBoundsX(
                            itemCollisionPos,
                            itemCollisionDims,
                            null,
                        );
                        itemCollisionDims.x = newDims.x;
                        itemCollisionDims.y = newDims.y;
                    }
                    break;

                default:
                    break;
            }

            collisions[0].setGridPosition(itemCollisionPos);
            collisions[0].setSize(itemCollisionDims);

            this._fixGridCollisions(itemCollisionPos, itemCollisionDims, item, fixSizeYIfInvalid, fixSizeXIfInvalid);
            this._addToGrid(collisions[0]);
            collisions[0].onCascadeEvent();
        }
    }

    /*
    private _fixGridCollisions(pos: NgGridItemPosition, dims: NgGridItemSize, fixSizeYIfInvalid: boolean = true, fixSizeXIfInvalid: boolean = true): void {
		while (this._hasGridCollision(pos, dims)) {
			const collisions: Array<NgGridItem> = this._getCollisions(pos, dims);

			this._removeFromGrid(collisions[0]);

            let cascade = this._getCascadeModeFromCollision(pos, dims, collisions[0]);

			const itemPos: NgGridItemPosition = collisions[0].getGridPosition();
            const itemDims: NgGridItemSize = collisions[0].getSize();

			switch (cascade) {
				case 'up':
				case 'down':
				default:
					const oldRow: number = itemPos.row;
					itemPos.row = pos.row + dims.y;

                    if (!this._isWithinBoundsY(itemPos, itemDims) && fixSizeYIfInvalid) {
                        const newDims: NgGridItemSize = this._fixSizeToBoundsY(itemPos, itemDims);
                        itemDims.x = newDims.x;
                        itemDims.y = newDims.y;
						//itemPos.col = pos.col + dims.x;
						//itemPos.row = oldRow;
					}
					break;
				case 'left':
				case 'right':
					const oldCol: number = itemPos.col;
					itemPos.col = pos.col + dims.x;

                    if (!this._isWithinBoundsX(itemPos, itemDims, collisions[0]) && fixSizeXIfInvalid) {
                        const newDims: NgGridItemSize = this._fixSizeToBoundsX(itemPos, itemDims, null);
                        itemDims.x = newDims.x;
                        itemDims.y = newDims.y;

						//itemPos.col = oldCol;
						//itemPos.row = pos.row + dims.y;
					}
					break;
			}

            collisions[0].setGridPosition(itemPos);
            collisions[0].setSize(itemDims);

            this._fixGridCollisions(itemPos, itemDims, fixSizeYIfInvalid, fixSizeXIfInvalid);
			this._addToGrid(collisions[0]);
			collisions[0].onCascadeEvent();
		}
    }
    */

    /**
     * cascadeGrid
     * @param pos
     * @param dims
     */
    public cascadeGrid(pos?: NgGridItemPosition, dims?: NgGridItemSize, cascadeMode: string = null): void {
        this._cascadeGrid(pos, dims, cascadeMode);
    }

    /**
     * _cascadeGridForUp
     * @param pos
     * @param dims
     */
    private _cascadeGridForUp(pos?: NgGridItemPosition, dims?: NgGridItemSize) {
        const lowRow: Array<number> = [0];

        for (let i: number = 1; i <= this._curMaxCol; i++) lowRow[i] = 1;

        for (let r: number = 1; r <= this._curMaxRow; r++) {
            if (this._itemGrid[r] == undefined) continue;

            for (let c: number = 1; c <= this._curMaxCol; c++) {
                if (this._itemGrid[r] == undefined) break;
                if (r < lowRow[c]) continue;

                if (this._itemGrid[r][c] != null) {
                    const item: NgGridItem = this._itemGrid[r][c];
                    if (item.isFixed) continue;

                    const itemDims: NgGridItemSize = item.getSize();
                    const itemPos: NgGridItemPosition = item.getGridPosition();

                    if (itemPos.col != c || itemPos.row != r) continue; //	If this is not the element's start

                    let lowest: number = lowRow[c];

                    for (let i: number = 1; i < itemDims.x; i++) {
                        let tmpLowest = Math.max(lowRow[c + i], lowest);
                        // Fix NaN isuse
                        if (tmpLowest) {
                            lowest = tmpLowest;
                        }
                    }

                    if (pos && c + itemDims.x > pos.col && c < pos.col + dims.x) {
                        //	If our element is in one of the item's columns
                        if (
                            (r >= pos.row && r < pos.row + dims.y) || //	If this row is occupied by our element
                            (itemDims.y > pos.row - lowest && //	Or the item can't fit above our element
                                r >= pos.row + dims.y &&
                                lowest < pos.row + dims.y)
                        ) {
                            //		And this row is below our element, but we haven't caught it
                            lowest = Math.max(lowest, pos.row + dims.y); //	Set the lowest row to be below it
                        }
                    }

                    const newPos: NgGridItemPosition = { col: c, row: lowest };

                    if (lowest != itemPos.row && this._isWithinBoundsY(newPos, itemDims)) {
                        //	If the item is not already on this row move it up
                        this._removeFromGrid(item);

                        item.setGridPosition(newPos);

                        item.onCascadeEvent();
                        this._addToGrid(item);
                    }

                    for (let i: number = 0; i < itemDims.x; i++) {
                        lowRow[c + i] = lowest + itemDims.y; //	Update the lowest row to be below the item
                    }
                }
            }
        }
    }

    ///**
    // * _cascadeGridForLeft
    // * @param pos
    // * @param dims
    // */
    //private _cascadeGridForLeft(pos?: NgGridItemPosition, dims?: NgGridItemSize) {
    //    const lowCol: Array<number> = [0];

    //    for (let i: number = 1; i <= this._curMaxRow; i++)
    //        lowCol[i] = 1;

    //    for (let r: number = 1; r <= this._curMaxRow; r++) {
    //        if (this._itemGrid[r] == undefined) continue;

    //        for (let c: number = 1; c <= this._curMaxCol; c++) {
    //            if (this._itemGrid[r] == undefined) break;
    //            if (c < lowCol[r]) continue;

    //            if (this._itemGrid[r][c] != null) {
    //                const item: NgGridItem = this._itemGrid[r][c];
    //                const itemDims: NgGridItemSize = item.getSize();
    //                const itemPos: NgGridItemPosition = item.getGridPosition();

    //                if (itemPos.col != c || itemPos.row != r) continue;	//	If this is not the element's start

    //                let lowest: number = lowCol[r];

    //                for (let i: number = 1; i < itemDims.y; i++) {
    //                    let tmpLowest = Math.max(lowCol[(r + i)], lowest);
    //                    // Fix NaN isuse
    //                    if (tmpLowest) {
    //                        lowest = tmpLowest;
    //                    }
    //                }

    //                if (pos && (r + itemDims.y) > pos.row && r < (pos.row + dims.y)) {          //	If our element is in one of the item's rows
    //                    if ((c >= pos.col && c < (pos.col + dims.x)) ||                         //	If this col is occupied by our element
    //                        ((itemDims.x > (pos.col - lowest)) &&                               //	Or the item can't fit above our element
    //                            (c >= (pos.col + dims.x) && lowest < (pos.col + dims.x)))) {    //		And this col is below our element, but we haven't caught it
    //                        lowest = Math.max(lowest, pos.col + dims.x);                        //	Set the lowest col to be below it
    //                    }
    //                }

    //                const newPos: NgGridItemPosition = { col: lowest, row: r };

    //                if (lowest != itemPos.col && this._isWithinBoundsX(newPos, itemDims, item)) {	//	If the item is not already on this col move it up
    //                    this._removeFromGrid(item);

    //                    item.setGridPosition(newPos);

    //                    item.onCascadeEvent();
    //                    this._addToGrid(item);
    //                }

    //                for (let i: number = 0; i < itemDims.y; i++) {
    //                    lowCol[r + i] = lowest + itemDims.x;	//	Update the lowest col to be below the item
    //                }
    //            }
    //        }
    //    }
    //}

    /**
     * _cascadeGridForLeft
     * @param pos
     * @param dims
     */
    private _cascadeGridForLeft(pos?: NgGridItemPosition, dims?: NgGridItemSize) {
        const lowCol: Array<number> = [0];

        for (let i: number = 1; i <= this._curMaxRow; i++) lowCol[i] = 1;

        for (let c: number = 1; c <= this._curMaxCol; c++) {
            // if (this._itemGrid[r] == undefined) continue;

            for (let r: number = 1; r <= this._curMaxRow; r++) {
                if (this._itemGrid[r] == undefined) break;
                if (c < lowCol[r]) continue;

                if (this._itemGrid[r][c] != null) {
                    const item: NgGridItem = this._itemGrid[r][c];
                    const itemDims: NgGridItemSize = item.getSize();
                    const itemPos: NgGridItemPosition = item.getGridPosition();

                    if (itemPos.col != c || itemPos.row != r) continue; //	If this is not the element's start

                    let lowest: number = lowCol[r];

                    for (let i: number = 1; i < itemDims.y; i++) {
                        let tmpLowest = Math.max(lowCol[r + i], lowest);
                        // Fix NaN isuse
                        if (tmpLowest) {
                            lowest = tmpLowest;
                        }
                    }

                    if (pos && r + itemDims.y > pos.row && r < pos.row + dims.y) {
                        //	If our element is in one of the item's rows
                        if (
                            (c >= pos.col && c < pos.col + dims.x) || //	If this col is occupied by our element
                            (itemDims.x > pos.col - lowest && //	Or the item can't fit above our element
                                c >= pos.col + dims.x &&
                                lowest < pos.col + dims.x)
                        ) {
                            //		And this col is below our element, but we haven't caught it
                            lowest = Math.max(lowest, pos.col + dims.x); //	Set the lowest col to be below it
                        }
                    }

                    const newPos: NgGridItemPosition = { col: lowest, row: r };

                    if (lowest != itemPos.col && this._isWithinBoundsX(newPos, itemDims, item)) {
                        //	If the item is not already on this col move it up
                        this._removeFromGrid(item);

                        item.setGridPosition(newPos);

                        item.onCascadeEvent();
                        this._addToGrid(item);
                    }

                    for (let i: number = 0; i < itemDims.y; i++) {
                        lowCol[r + i] = lowest + itemDims.x; //	Update the lowest col to be below the item
                    }
                }
            }
        }
    }

    /**
     * _cascadeGrid
     * @param pos
     * @param dims
     * @param cascadeMode
     */
    private _cascadeGrid(pos?: NgGridItemPosition, dims?: NgGridItemSize, cascadeMode: string = null): void {
        if (this._destroyed) return;
        if (pos && !dims) throw new Error('Cannot cascade with only position and not dimensions');

        if (this.isDragging && this._draggingItem && !pos && !dims) {
            pos = this._draggingItem.getGridPosition();
            dims = this._draggingItem.getSize();
        } else if (this.isResizing && this._resizingItem && !pos && !dims) {
            pos = this._resizingItem.getGridPosition();
            dims = this._resizingItem.getSize();
        }

        let cascade = cascadeMode ? cascadeMode : this.cascade;
        switch (cascade) {
            case 'up':
            case 'down':
                this._cascadeGridForUp(pos, dims);
            case 'left':
            case 'right':
                this._cascadeGridForLeft(pos, dims);
                break;
            case 'up-left':
                this._cascadeGridForUp(pos, dims);
                this._cascadeGridForLeft(pos, dims);
                break;
            default:
                break;
        }
    }

    /**
     * _getItemCountInVertical
     */
    private _getItemCountInVertical() {
        let count = 0;
        for (let r = 1; r < this._maxRows; r++) {
            for (let c = 1; c < this._maxCols; c++) {
                if (this._itemGrid[r] && this._itemGrid[r][c]) {
                    const item = this._itemGrid[r][c];
                    count += 1;
                    r += item.sizey;
                    break;
                }
            }
        }
        return count;
    }

    /**
     * _getItemCountHorizontal
     */
    private _getItemCountHorizontal() {
        let count = 0;
        for (let c = 1; c < this._maxCols; c++) {
            for (let r = 1; r < this._maxRows; r++) {
                if (this._itemGrid[r] && this._itemGrid[r][c]) {
                    const item = this._itemGrid[r][c];
                    count += 1;
                    c += item.sizex;
                    break;
                }
            }
        }
        return count;
    }

    /**
     * _fixGridForAllItemsInHorizontal
     */
    private _fixGridForAllItemsInHorizontal() {
        const count = this._getItemCountHorizontal();
        const sizex = Math.floor(this._maxCols / count);

        let targetItem;
        if (this._items && this._items.length) {
            this._items.forEach((item) => {
                if (item.row == 1) {
                    this.removeFromGrid(item);
                    item.setSize(
                        {
                            x: sizex,
                            y: item.sizey,
                        },
                        true,
                    );
                    this._addToGrid(item);
                }
            });
        }
    }

    /**
     * _fixGridForAllItemsInVertical
     */
    private _fixGridForAllItemsInVertical() {
        const count = this._getItemCountInVertical();
        const sizey = Math.floor(this._maxRows / count);

        let targetItem;
        if (this._items && this._items.length) {
            this._items.forEach((item) => {
                if (item.col == 1) {
                    this.removeFromGrid(item);
                    item.setSize(
                        {
                            x: item.sizex,
                            y: sizey,
                        },
                        true,
                    );
                    this._addToGrid(item);
                }
            });
        }
    }

    /**
     * _findWidgetsAtBottomEdge
     */
    private _findWidgetsAtBottomEdge(): Array<NgGridItem> {
        let items = this._items.filter((p) => p.sizey + p.row >= this._maxRows);
        return items;
    }

    /**
     * _findWidgetsAtRightEdge
     */
    private _findWidgetsAtRightEdge(): Array<NgGridItem> {
        let items = this._items.filter((p) => p.sizex + p.col >= this._maxCols);
        return items;
    }

    /**
     * _fixGridForAddingNewItemHonrizontal
     * @param newItem
     */
    //private _fixGridForAddingNewItemHonrizontal(newItem: NgGridItem) {
    //    const count = this._getItemCountHorizontal() + 1;
    //    const sizex = Math.floor(this._maxCols / count); // this._maxCols;
    //    const sizey = this._maxRows; //Math.floor(this._maxRows / count);

    //    let targetItem;
    //    if (this._items && this._items.length) {
    //        let targetItems = this._items.filter(p => p.row == 1);

    //        targetItems.forEach(item => {
    //            this.removeFromGrid(item);
    //        });

    //        targetItems.forEach(item => {
    //            item.setSize({
    //                x: sizex,
    //                y: item.sizey
    //            }, true);
    //            this._addToGrid(item);
    //        });
    //        this._cascadeGridForLeft();
    //        // Find the last widget from right.
    //        targetItem = targetItems.reduce(function (prev, curr) {
    //            return (prev.sizex + prev.col) > (curr.sizex + curr.col) ? prev : curr;
    //        });
    //    }

    //    newItem.setSize({
    //        x: sizex,
    //        y: sizey
    //    });

    //    newItem.setGridPosition({
    //        row: newItem.row,
    //        col: targetItem ? targetItem.col + targetItem.sizex : newItem.col
    //    });

    //    let pos = newItem.getGridPosition();
    //    let dims = newItem.getSize();
    //    if (this._hasGridCollision(pos, dims)) {
    //        const collisions: Array<NgGridItem> = this._getCollisions(pos, dims);
    //        this._removeFromGrid(collisions[0]);

    //        const itemPos: NgGridItemPosition = collisions[0].getGridPosition();
    //        const itemDims: NgGridItemSize = collisions[0].getSize();
    //        const padding = (itemPos.col + itemDims.x - 1) - (newItem.col);
    //        itemDims.x -= padding + 1;
    //        collisions[0].setSize(itemDims);

    //        this._addToGrid(collisions[0]);
    //        collisions[0].onCascadeEvent();
    //    }
    //}

    /*
    private _fixGridForAddingNewItemHonrizontal(newItem: NgGridItem) {
        const count = this._getItemCountHorizontal() + 1;
        const sizex = Math.floor(this._maxCols / count); // this._maxCols;
        const sizey = this._maxRows; //Math.floor(this._maxRows / count);

        let targetItem;
        if (this._items && this._items.length) {
            let targetItems = this._items

            targetItems.forEach(item => {
                this.removeFromGrid(item);
            });

            targetItems.forEach(item => {
                item.setSize({
                    x: sizex,
                    y: item.sizey
                }, true);
                this._addToGrid(item);
            });
            this._cascadeGridForLeft();
            // Find the last widget from right.
            targetItem = targetItems.reduce(function (prev, curr) {
                return (prev.sizex + prev.col) > (curr.sizex + curr.col) ? prev : curr;
            });
        }

        newItem.setSize({
            x: sizex,
            y: sizey
        });

        newItem.setGridPosition({
            row: newItem.row,
            col: targetItem ? targetItem.col + targetItem.sizex : newItem.col
        });

        //let pos = newItem.getGridPosition();
        //let dims = newItem.getSize();
        //if (this._hasGridCollision(pos, dims)) {
        //    const collisions: Array<NgGridItem> = this._getCollisions(pos, dims);
        //    this._removeFromGrid(collisions[0]);

        //    const itemPos: NgGridItemPosition = collisions[0].getGridPosition();
        //    const itemDims: NgGridItemSize = collisions[0].getSize();
        //    const padding = (itemPos.col + itemDims.x - 1) - (newItem.col);
        //    itemDims.x -= padding + 1;
        //    collisions[0].setSize(itemDims);

        //    this._addToGrid(collisions[0]);
        //    collisions[0].onCascadeEvent();
        //}
    }
    */

    /**
     * _fixGridForAddingNewItemVertical
     * @param newItem
     */
    /*
    private _fixGridForAddingNewItemVertical(newItem: NgGridItem) {
        const count = this._getItemCountInVertical() + 1;
        const sizex = this._maxCols;
        const sizey = Math.floor(this._maxRows / count);

        let targetItem;
        if (this._items && this._items.length) {
            //let targetItems = this._items.filter(p => p.col == 1);
            let targetItems = this._items;
            targetItems.forEach(item => {
                this.removeFromGrid(item);
            });           

            targetItems.forEach(item => {
                item.setSize({
                    x: item.sizex,
                    y: sizey
                }, true);
                this._addToGrid(item);
            });
            this._cascadeGridForUp();

            // Find the last widget from bottom.
            targetItem = targetItems.reduce(function (prev, curr) {
                return (prev.sizey + prev.row) > (curr.sizey + curr.row) ? prev : curr;
            });
        }

        newItem.setSize({
            x: sizex,
            y: sizey
        });

        newItem.setGridPosition({
            row: targetItem ? targetItem.row + targetItem.sizey : newItem.row,
            col: newItem.col
        });

        //let pos = newItem.getGridPosition();
        //let dims = newItem.getSize();
        //if (this._hasGridCollision(pos, dims)) {
        //    const collisions: Array<NgGridItem> = this._getCollisions(pos, dims);
        //    this._removeFromGrid(collisions[0]);

        //    const itemPos: NgGridItemPosition = collisions[0].getGridPosition();
        //    const itemDims: NgGridItemSize = collisions[0].getSize();
        //    const padding = (itemPos.row + itemDims.y - 1) - (newItem.row);
        //    itemDims.y -= padding + 1;
        //    collisions[0].setSize(itemDims);

        //    this._addToGrid(collisions[0]);
        //    collisions[0].onCascadeEvent();
        //}
    }
    */

    /**
     * _getDirectionModeWhenAddingNewItem
     */
    private _getDirectionModeWhenAddingNewItem(newItem: NgGridItem, collision: NgGridItem) {
        let directionMode;
        let magicPadding = 2;
        if (collision.row + collision.sizey - 1 - magicPadding < newItem.row) {
            directionMode = 'top';
        } else if (collision.col + collision.sizex - 1 - magicPadding < newItem.col) {
            directionMode = 'left';
        } else if (newItem.row + newItem.sizey - 1 - magicPadding < collision.row) {
            directionMode = 'bottom';
        }
        return directionMode;
    }

    /**
     *  Useful in case resizing container
     * _fixGridPosition
     */

    private _fixGridPosition(pos: NgGridItemPosition, dims: NgGridItemSize, item: NgGridItem): NgGridItemPosition {
        let retries = 100;
        while ((this._hasGridCollision(pos, dims) || !this._isWithinBounds(pos, dims, item)) && retries-- > 0) {
            if (this._hasGridCollision(pos, dims)) {
                const collisions: NgGridItem[] = this._getCollisions(pos, dims);
                let directionMode = this._getDirectionModeWhenAddingNewItem(item, collisions[0]);
                switch (directionMode) {
                    case 'top':
                        // pos.row = Math.max.apply(null, collisions.map((item: NgGridItem) => item.row + item.sizey));
                        pos.row = collisions[0].row + collisions[0].sizey;
                        break;
                    case 'bottom':
                        const padding = item.row + item.sizey - 1 - collisions[0].row + 1;
                        if (dims.y - padding > 0) {
                            dims.y -= padding;
                        }
                        break;
                    case 'left':
                    default:
                        // pos.col = Math.max.apply(null, collisions.map((item: NgGridItem) => item.col + item.sizex));
                        pos.col = collisions[0].col + collisions[0].sizex;
                        break;
                }
            }

            if (!this._isWithinBoundsY(pos, dims)) {
                // pos.col++;
                // pos.row = 1;
                if (pos.row > this._maxRows) {
                    break;
                }
                dims = this._fixSizeToBoundsY(pos, dims);
            }

            if (!this._isWithinBoundsX(pos, dims, item)) {
                //pos.row++;
                //pos.col = 1;
                if (pos.col > this._maxCols) {
                    break;
                }
                dims = this._fixSizeToBoundsX(pos, dims, item);

                //pos.col -= 1;
                // dims = this._fixSizeToBoundsX(pos, dims, item);
            }
        }
        return pos;
    }

    public _isWithinBoundsX(pos: NgGridItemPosition, dims: NgGridItemSize, item: NgGridItem) {
        // console.log('_maxCols:' + this._maxCols);
        // return (this._maxCols == 0 || pos.col == 1 || (pos.col + dims.x - 1) <= this._maxCols);
        return this._maxCols == 0 || pos.col + dims.x - 1 <= this._maxCols;
    }

    private _fixPosToBoundsX(pos: NgGridItemPosition, dims: NgGridItemSize, item: NgGridItem): NgGridItemPosition {
        if (!this._isWithinBoundsX(pos, dims, item)) {
            pos.col = Math.max(this._maxCols - (dims.x - 1), 1);
            //pos.row ++;
        }
        return pos;
    }

    private _fixSizeToBoundsX(
        pos: NgGridItemPosition,
        dims: NgGridItemSize,
        item: NgGridItem,
        autoScale: boolean = false,
    ): NgGridItemSize {
        if (!this._isWithinBoundsX(pos, dims, item) || autoScale) {
            dims.x = Math.max(this._maxCols - (pos.col - 1), 1);
            //dims.y++;
        }
        return dims;
    }

    private _isWithinBoundsY(pos: NgGridItemPosition, dims: NgGridItemSize) {
        // return (this._maxRows == 0 || pos.row == 1 || (pos.row + dims.y - 1) <= this._maxRows);
        return this._maxRows == 0 || pos.row + dims.y - 1 <= this._maxRows;
    }

    private _fixPosToBoundsY(pos: NgGridItemPosition, dims: NgGridItemSize): NgGridItemPosition {
        if (!this._isWithinBoundsY(pos, dims)) {
            pos.row = Math.max(this._maxRows - (dims.y - 1), 1);
            // pos.col++;
        }
        return pos;
    }

    private _fixSizeToBoundsY(
        pos: NgGridItemPosition,
        dims: NgGridItemSize,
        autoScale: boolean = false,
    ): NgGridItemSize {
        if (!this._isWithinBoundsY(pos, dims) || autoScale) {
            //console.log('this._maxRows:' + this._maxRows);
            dims.y = Math.max(this._maxRows - (pos.row - 1), 1);
            // dims.x++;
        }
        return dims;
    }

    public _isWithinBounds(pos: NgGridItemPosition, dims: NgGridItemSize, item: NgGridItem) {
        return this._isWithinBoundsX(pos, dims, item) && this._isWithinBoundsY(pos, dims);
    }

    private _fixPosToBounds(pos: NgGridItemPosition, dims: NgGridItemSize, item: NgGridItem): NgGridItemPosition {
        return this._fixPosToBoundsX(this._fixPosToBoundsY(pos, dims), dims, item);
    }

    private _fixSizeToBounds(pos: NgGridItemPosition, dims: NgGridItemSize, item: NgGridItem): NgGridItemSize {
        return this._fixSizeToBoundsX(pos, this._fixSizeToBoundsY(pos, dims), item);
    }

    /**
     * addToGrid
     * @param item
     */
    public addToGrid(item: NgGridItem, autoFix: boolean = true): void {
        this._addToGrid(item, autoFix);
    }

    private _addToGrid(item: NgGridItem, autoFix: boolean = true): void {
        let pos: NgGridItemPosition = item.getGridPosition();
        const dims: NgGridItemSize = item.getSize();

        if (autoFix) {
            if (this._hasGridCollision(pos, dims)) {
                this._fixGridCollisions(pos, dims, item);
                pos = item.getGridPosition();
            }
        }

        for (let j: number = 0; j < dims.y; j++) {
            if (this._itemGrid[pos.row + j] == null) this._itemGrid[pos.row + j] = {};

            for (let i: number = 0; i < dims.x; i++) {
                this._itemGrid[pos.row + j][pos.col + i] = item;
            }
        }
    }

    /**
     * removeFromGrid
     * @param item
     */
    public removeFromGrid(item: NgGridItem): void {
        this._removeFromGrid(item);
    }

    private _removeFromGrid(item: NgGridItem): void {
        for (let y in this._itemGrid)
            for (let x in this._itemGrid[y]) if (this._itemGrid[y][x] == item) delete this._itemGrid[y][x];
    }

    /**
     * filterGrid
     */
    public filterGrid(): void {
        this._filterGrid();
    }

    private _filterGrid(): void {
        for (let y in this._itemGrid) {
            for (let x in this._itemGrid[y]) {
                const item: NgGridItem = this._itemGrid[y][x];
                const withinRow = <any>y < item.row + item.sizey && <any>y >= item.row;
                const withinCol = <any>x < item.col + item.sizex && <any>x >= item.col;

                if (this._items.indexOf(this._itemGrid[y][x]) < 0 || !withinRow || !withinCol) {
                    delete this._itemGrid[y][x];
                }
            }

            if (Object.keys(this._itemGrid[y]).length == 0) {
                delete this._itemGrid[y];
            }
        }
    }

    private _updateSize(): void {
        if (this._destroyed) return;
        let maxCol: number = this._getMaxCol();
        let maxRow: number = this._getMaxRow();

        if (maxCol != this._curMaxCol || maxRow != this._curMaxRow) {
            this._curMaxCol = maxCol;
            this._curMaxRow = maxRow;
        }

        this._renderer.setStyle(this._ngEl.nativeElement, 'width', '100%'); //(maxCol * (this.colWidth + this.marginLeft + this.marginRight))+'px');
        this._renderer.setStyle(this._ngEl.nativeElement, 'height', '100%');
        // this._renderer.setStyle(this._ngEl.nativeElement, 'height', (maxRow * (this.rowHeight + this.marginTop + this.marginBottom)) + 'px');

        /*
        if (this.designMode) {            
            //console.log('design_size_percentage in edit mode:' + this.design_size_diff_percentage);
            this._renderer.setStyle(this._ngEl.nativeElement, 'height', (maxRow * (this.rowHeight + this.marginTop + this.marginBottom)) + 'px');
        }
        else {
            let designHeight = this.getCurrentDesignHeight();
            //console.log('design_size_percentage in view mode:' + this.design_size_diff_percentage);
            let maxHeight = designHeight + (designHeight * this.design_size_diff_percentage);
            this._renderer.setStyle(this._ngEl.nativeElement, 'height', maxHeight + 'px');
        }
        */
    }

    private _getMaxRow(): number {
        return Math.max.apply(
            null,
            this._items.map((item: NgGridItem) => item.row + item.sizey - 1),
        );
    }

    private _getMaxCol(): number {
        return Math.max.apply(
            null,
            this._items.map((item: NgGridItem) => item.col + item.sizex - 1),
        );
    }

    private _getMousePosition(e: any): NgGridRawPosition {
        if (((<any>window).TouchEvent && e instanceof TouchEvent) || e.touches || e.changedTouches) {
            e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
        }

        const refPos: any = this._ngEl.nativeElement.getBoundingClientRect();

        let left: number = e.clientX - refPos.left;
        let top: number = e.clientY - refPos.top;

        if (this.cascade == 'down') top = refPos.top + refPos.height - e.clientY;
        if (this.cascade == 'right') left = refPos.left + refPos.width - e.clientX;

        if (this.isDragging && this._zoomOnDrag) {
            left *= 2;
            top *= 2;
        }

        return {
            left: left,
            top: top,
        };
    }

    private _getAbsoluteMousePosition(e: any): NgGridRawPosition {
        if (((<any>window).TouchEvent && e instanceof TouchEvent) || e.touches || e.changedTouches) {
            e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
        }

        return {
            left: e.clientX,
            top: e.clientY,
        };
    }

    /**
     * getContainerColumns
     */
    public getContainerColumns(): number {
        return this._getContainerColumns();
    }

    private _getContainerColumns(): number {
        const maxWidth: number = this._ngEl.nativeElement.getBoundingClientRect().width;
        return Math.round(maxWidth / (this.colWidth + this.marginLeft + this.marginRight));
    }

    /**
     * getContainerRow
     */
    public getContainerRow(): number {
        return this._getContainerRows();
    }

    private _getContainerRows(): number {
        // const maxHeight: number = window.innerHeight - this.marginTop - this.marginBottom;
        const maxHeight: number = this._ngEl.nativeElement.getBoundingClientRect().height;
        return Math.round(maxHeight / (this.rowHeight + this.marginTop + this.marginBottom));
    }

    private _getItemFromPosition(position: NgGridRawPosition): NgGridItem {
        for (let item of this._items) {
            const size: NgGridItemDimensions = item.getDimensions();
            const pos: NgGridRawPosition = item.getPosition();

            //if (position.left > (pos.left + this.marginLeft) && position.left < (pos.left + this.marginLeft + size.width) &&
            //	position.top > (pos.top + this.marginTop) && position.top < (pos.top + this.marginTop + size.height)) {
            //	return item;
            // }

            if (
                position.left >= pos.left &&
                position.left < pos.left + this.marginLeft + size.width &&
                position.top >= pos.top &&
                position.top < pos.top + this.marginTop + size.height
            ) {
                return item;
            }
        }
        return null;
    }

    /**
     * _fixGridPositionForPlaceHolder
     * @param pos
     * @param dims
     */
    private _fixGridPositionForPlaceHolder(
        pos: NgGridItemPosition,
        dims: NgGridItemSize,
        item: NgGridItem,
    ): NgGridItemPosition {
        while (this._hasGridCollision(pos, dims) || !this._isWithinBounds(pos, dims, item)) {
            if (this._hasGridCollision(pos, dims)) {
                const collisions: NgGridItem[] = this._getCollisions(pos, dims);

                switch (this.cascade) {
                    case 'up':
                        pos.row = Math.max.apply(
                            null,
                            collisions.map((item: NgGridItem) => item.row + item.sizey),
                        );
                        break;
                    default:
                        break;
                }
            }
            if (!this._isWithinBoundsY(pos, dims)) {
                pos.col++;
                pos.row = 1;
                if (pos.row + dims.y - 1 > this._maxRows) {
                    dims = this._fixSizeToBoundsY(pos, dims);
                }
            }
            if (!this._isWithinBoundsX(pos, dims, item)) {
                pos.row++;
                pos.col = 1;
                if (pos.col + dims.x - 1 > this._maxCols) {
                    dims = this._fixSizeToBoundsX(pos, dims, item);
                }
            }
        }
        return pos;
    }

    private _createPlaceholder(item: NgGridItem): void {
        this._createPlaceholder_2(item, (componentRef: ComponentRef<NgGridPlaceholder>) => {
            this._placeholderRef = componentRef;
            const placeholder: NgGridPlaceholder = componentRef.instance;
            placeholder.setZIndex('999');
        });
    }

    private _createPlaceholder_2(item: NgGridItem, callBack: any): void {
        let pos: NgGridItemPosition;
        let dims: NgGridItemSize;
        let componentRef: ComponentRef<NgGridPlaceholder>;
        if (item) {
            pos = item.getGridPosition();
            dims = item.getSize();
            const factory = this.componentFactoryResolver.resolveComponentFactory(NgGridPlaceholder);
            componentRef = item.containerRef.createComponent(factory);
        } else {
            pos = {
                row: 1,
                col: 1,
            };
            dims = {
                x: this._maxCols,
                y: this._maxRows,
            };
            const factory = this.componentFactoryResolver.resolveComponentFactory(NgGridPlaceholder);
            componentRef = this._containerRef.createComponent(factory);
        }
        callBack(componentRef);
        const placeholder: NgGridPlaceholder = componentRef.instance;
        placeholder.registerGrid(this);
        placeholder.setCascadeMode(this.cascade);
        placeholder.setGridPosition({ col: pos.col, row: pos.row });
        placeholder.setSize({ x: dims.x, y: dims.y });
    }

    private _createPlaceholderForNewWidget(item: NgGridItem): void {
        this._createPlaceholder_2(item, (componentRef: ComponentRef<NgGridPlaceholder>) => {
            this._placeholderRefForNewWidget = componentRef;
            const placeholder: NgGridPlaceholder = componentRef.instance;
            placeholder.setBackgroundColor('rgba(192, 220, 198, 0.3)');
            placeholder.setZIndex('999');
        });
    }

    private _createPlaceholderForDraggingWidget(item: NgGridItem): void {
        this._createPlaceholder_2(item, (componentRef: ComponentRef<NgGridPlaceholder>) => {
            this._placeholderRefForDraggingWidget = componentRef;
            const placeholder: NgGridPlaceholder = componentRef.instance;
            placeholder.setZIndex('999');
            placeholder.setBackgroundColor('rgba(192, 220, 198, 0.3)');
        });
    }

    private _emitOnItemChange() {
        this.onItemChange.emit(this._items.map((item: NgGridItem) => item.getEventOutput()));
    }

    /**
     * In case adding new item , we need to re-caculate following max col, max row
     * @param dims
     */
    public calcSize(dims: NgGridItemSize): NgGridItemSize {
        this._maxCols = this._getContainerColumns();
        this._maxRows = this._getContainerRows();
        if (!dims.x || !dims.y) {
            dims = {
                x: this._maxCols,
                y: this._maxRows,
            };
        }
        return dims;
    }
}
