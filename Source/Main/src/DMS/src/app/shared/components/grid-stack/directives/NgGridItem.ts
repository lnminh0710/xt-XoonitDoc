import { NgGrid } from './NgGrid';
import { NgGridItemConfig, NgGridItemEvent, NgGridItemPosition, NgGridItemSize, NgGridRawPosition, NgGridItemDimensions } from '../interfaces/INgGrid';
import { Component, Directive, ElementRef, Renderer2, EventEmitter, Host, ViewEncapsulation, Type, ComponentRef, KeyValueDiffer, KeyValueDiffers, OnInit, OnDestroy, DoCheck, ViewContainerRef, Output } from '@angular/core';

@Directive({
    selector: '[ngGridItem]',
    inputs: ['config: ngGridItem'],
    exportAs: 'gridItem'
})
export class NgGridItem implements OnInit, OnDestroy {
    //	Event Emitters
    @Output() public onItemChange: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>(false);
    @Output() public onDragStart: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onDrag: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onDragStop: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onDragAny: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onResizeStart: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onResize: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onResizeStop: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onResizeAny: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onChangeStart: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onChange: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onChangeStop: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public onChangeAny: EventEmitter<NgGridItemEvent> = new EventEmitter<NgGridItemEvent>();
    @Output() public ngGridItemChange: EventEmitter<NgGridItemConfig> = new EventEmitter<NgGridItemConfig>();

    //	Default config
    private static CONST_DEFAULT_CONFIG: NgGridItemConfig = {
        col: 1,
        row: 1,
        sizex: 1,
        sizey: 1,
        dragHandle: null,
        resizeHandle: null,
        fixed: false,
        draggable: true,
        resizable: true,
        borderSize: 25,
        //minWidth: 50,
        //minHeight: 50
    };

    public isFixed: boolean = false;
    public isDraggable: boolean = true;
    public isResizable: boolean = true;
    public minWidth: number = 0;
    public minHeight: number = 0;

    //	Private variables
    private _payload: any;
    private _currentPosition: NgGridItemPosition = { col: 1, row: 1 };
    private _size: NgGridItemSize = { x: 1, y: 1 };
    public _config = NgGridItem.CONST_DEFAULT_CONFIG;
    private _dragHandle: string;
    private _resizeHandle: string;
    private _borderSize: number;
    private _elemWidth: number;
    private _elemHeight: number;
    private _elemLeft: number;
    private _elemTop: number;
    private _added: boolean = false;
    private _differ: KeyValueDiffer<any, any>;
    private _cascadeMode: string;
    private _maxCols: number = 0;
    private _minCols: number = 0;
    private _maxRows: number = 0;
    private _minRows: number = 0;

    private _leftPercentage: number;
    private _topPercentage: number;
    private _widthPercentage: number;
    private _heightPercentage: number;
    private _initializedGridItem: boolean = false;
    private _resizeDirections: string[] = NgGrid.CONST_DEFAULT_RESIZE_DIRECTIONS;

    //	[ng-grid-item] handler
    set config(v: NgGridItemConfig) {
        const defaults = NgGridItem.CONST_DEFAULT_CONFIG;
        this._initializedGridItem = false;
        for (let x in defaults)
            if (v[x] == null)
                v[x] = defaults[x];

        this.setConfig(v, 'init_config');

        if (this._differ == null && v != null) {
            this._differ = this._differs.find(this._config).create();
        }

        if (!this._added) {
            this._added = true;
            this._ngGrid.addItem(this);

            let isUpdatedPercentage: boolean = false;

            if (!this._topPercentage || !this._leftPercentage) {
                this.updateTopLeftPercentage();
                isUpdatedPercentage = true;
            }

            if (!this._widthPercentage || !this._heightPercentage) {
                this.updateWidthHeightPercentage();
                isUpdatedPercentage = true;
            }

            if (isUpdatedPercentage) {
                const event: NgGridItemEvent = this.getEventOutput();
                this.onChangeStop.emit(event);
            }
        }

        this._recalculateDimensions();
        this._recalculatePosition();
        this._initializedGridItem = true;
    }

    get config(): NgGridItemConfig {
        return this._config;
    }

    get sizex(): number {
        return this._size.x;
    }

    get sizey(): number {
        return this._size.y;
    }

    get col(): number {
        return this._currentPosition.col;
    }

    get row(): number {
        return this._currentPosition.row;
    }

    get currentCol(): number {
        return this._currentPosition.col;
    }

    get currentRow(): number {
        return this._currentPosition.row;
    }

    //	Constructor
    constructor(private _differs: KeyValueDiffers, private _ngEl: ElementRef, private _renderer: Renderer2, private _ngGrid: NgGrid, public containerRef: ViewContainerRef) { }


    public onResizeStartEvent(): void {
        const event: NgGridItemEvent = this.getEventOutput();
        this.onResizeStart.emit(event);
        this.onResizeAny.emit(event);
        this.onChangeStart.emit(event);
        this.onChangeAny.emit(event);
    }
    public onResizeEvent(): void {
        const event: NgGridItemEvent = this.getEventOutput();
        this.onResize.emit(event);
        this.onResizeAny.emit(event);
        this.onChange.emit(event);
        this.onChangeAny.emit(event);
    }
    public onResizeStopEvent(): void {
        const event: NgGridItemEvent = this.getEventOutput();
        this.onResizeStop.emit(event);
        this.onResizeAny.emit(event);
        this.onChangeStop.emit(event);
        this.onChangeAny.emit(event);

        /*
		this._config.sizex = this._size.x;
        this._config.sizey = this._size.y;        
        this._config.widthPercentage = this._widthPercentage;
        this._config.heightPercentage = this._heightPercentage;
        this._config.leftPercentage = this._leftPercentage;
        this._config.topPercentage = this._topPercentage;
        */
        this.syncConfig();
        this.ngGridItemChange.emit(this._config);
    }
    public onDragStartEvent(): void {
        const event: NgGridItemEvent = this.getEventOutput();
        this.onDragStart.emit(event);
        this.onDragAny.emit(event);
        this.onChangeStart.emit(event);
        this.onChangeAny.emit(event);
    }
    public onDragEvent(): void {
        const event: NgGridItemEvent = this.getEventOutput();
        this.onDrag.emit(event);
        this.onDragAny.emit(event);
        this.onChange.emit(event);
        this.onChangeAny.emit(event);
    }
    public onDragStopEvent(): void {
        const event: NgGridItemEvent = this.getEventOutput();
        this.onDragStop.emit(event);
        this.onDragAny.emit(event);
        this.onChangeStop.emit(event);
        this.onChangeAny.emit(event);
        this.syncConfig();
        this.ngGridItemChange.emit(this._config);
    }

    public onCascadeEvent(): void {
        if (this._ngGrid.designMode) {
            this.onChangeStop.emit(this.getEventOutput());
        }
        this.syncConfig();
        this.ngGridItemChange.emit(this._config);
    }

    public ngOnInit(): void {
        this._renderer.addClass(this._ngEl.nativeElement, 'grid-item');
        if (this._ngGrid.autoStyle) this._renderer.setStyle(this._ngEl.nativeElement, 'position', 'absolute');
        this._recalculateDimensions();
        this._recalculatePosition();

        if (!this._added) {
            this._added = true;
            this._ngGrid.addItem(this);
        }
    }

    /**
     * syncConfig
     */
    public syncConfig() {
        this._config.sizex = this._size.x;
        this._config.sizey = this._size.y;
        this._config.col = this._currentPosition.col;
        this._config.row = this._currentPosition.row;
        this._config.leftPercentage = this._leftPercentage;
        this._config.topPercentage = this._topPercentage;
        this._config.widthPercentage = this._widthPercentage;
        this._config.heightPercentage = this._heightPercentage;
    }

    //	Public methods
    public canDrag(e: any): boolean {
        if (!this.isDraggable) return false;

        if (e && e.target || (e.target.className && e.target.className.baseVal) || e.target.dx.baseVal || e.target.dy.baseVal) {
            return false;
        }

        if (e && e.target && e.target.className && e.target.className.indexOf('grd-stack-ignore-icon') > 0) {
            return false;
        }

        if (this._dragHandle) {
            return this.findHandle(this._dragHandle, e.target);
        }

        return true;
    }

    public findHandle(handleSelector: string, startElement: HTMLElement): boolean {
        try {
            let targetElem: any = startElement;

            while (targetElem && targetElem != this._ngEl.nativeElement) {
                if (this.elementMatches(targetElem, handleSelector)) return true;

                targetElem = targetElem.parentElement;
            }
        } catch (err) { }

        return false;
    }

    /**
     * isBottomWidget
     */
    public isBottomWidget() {
        if (this.row + this.sizey - 1 == this._ngGrid.getContainerRow()) {
            return true;
        }
        return false;
    }

    public canResize(e: any): string {
        if (!this.isResizable) return null;

        if (this._resizeHandle) {
            return this.findHandle(this._resizeHandle, e.target) ? 'both' : null;
        }

        if (e && e.target && e.target.className && e.target.className.indexOf('grd-stack-ignore-icon') > 0) {
            return null;
        }

        if (this._borderSize <= 0)
            return null;

        const mousePos: NgGridRawPosition = this._getMousePosition(e);

        //console.log('mousePos.left:' + mousePos.left);
        //console.log('_elemWidth:' + this._elemWidth);

        // Check if this widget is from bottom or right
        //if (this.isBottomWidget()) {
        //    return null;
        //}

        /*
		if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize
            && mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {            
			return 'both';
        } else if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize) {            
			return 'width';
        } else if (mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {           
			return 'height';
		}
        */

        for (let direction of this._resizeDirections) {
            if (this.canResizeInDirection(direction, mousePos)) {
                return direction;
            }
        }

        return null;
    }

    private canResizeInDirection(direction: string, mousePos: NgGridRawPosition): boolean {
        switch (direction) {
            case "bottomright":
                return mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize
                    && mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize;	// tslint:disable-line:indent
            case "bottomleft":
                return mousePos.left < this._borderSize && mousePos.top < this._elemHeight
                    && mousePos.top > this._elemHeight - this._borderSize;	// tslint:disable-line:indent
            case "topright":
                return mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize
                    && mousePos.top < this._borderSize;	// tslint:disable-line:indent
            case "topleft":
                return mousePos.left < this._borderSize && mousePos.top < this._borderSize;
            case "right":
                return mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize;
            case "left":
                return mousePos.left < this._borderSize;
            case "bottom":
                return mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize;
            case "top":
                return mousePos.top < this._borderSize;
            default:
                return false;
        }
    }

    /**
    * Check if this item is right edge of container
    */
    public isRightEdge() {
        if (this.col + this.sizex >= this._ngGrid.getContainerColumns()) {
            return true;
        }
        return false;
    }

    /**
     *Check if this item is left edge of container
     */
    public isLeftEdge() {
        if (this.col <= 1) {
            return true;
        }
        return false;
    }

    /**
    * Check if this item is bottom edge of container
    */
    public isBottomEdge() {
        if (this.row + this.sizey >= this._ngGrid.getContainerRow()) {
            return true;
        }
        return false;
    }

    /**
     * getNewItemPosition
     * @param e
     */
    public getNewItemPosition(e: any) {
        const mousePos: NgGridRawPosition = this._getMousePosition(e);
        const leftPercentage = Math.round((mousePos.left / this._elemWidth) * 100);
        const topPercentage = Math.round((mousePos.top / this._elemHeight) * 100);

        if (this.isBottomEdge() && topPercentage >= 95) {
            return 'bottom-edge';
        }

        if (this.isRightEdge() && leftPercentage >= 95) {
            return 'right-edge';
        }

        if (this.isLeftEdge() && leftPercentage <= 5) {
            return 'left-edge';
        }

        if (leftPercentage < 25) {
            return 'left';

        }
        if (leftPercentage > 75) {
            return 'right';
        }
        if (leftPercentage >= 25 && leftPercentage <= 75 && topPercentage < 50) {
            return 'top';
        }
        return 'bottom';
    }

    /*
	public onMouseMove(e: any): void {
		if (this._ngGrid.autoStyle) {
			if (this._ngGrid.resizeEnable && !this._resizeHandle && this.isResizable) {
				const mousePos: NgGridRawPosition = this._getMousePosition(e);

                // Mouse at the corner
				if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize
                    && mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
                    this._renderer.setStyle(this._ngEl.nativeElement, 'cursor', 'nwse-resize');
                }
                // Mouse at the right
                else if (mousePos.left < this._elemWidth && mousePos.left > this._elemWidth - this._borderSize) {
					this._renderer.setStyle(this._ngEl.nativeElement, 'cursor', 'ew-resize');
                }
                // Mouse at the bottom
                else if (mousePos.top < this._elemHeight && mousePos.top > this._elemHeight - this._borderSize) {
                    this._renderer.setStyle(this._ngEl.nativeElement, 'cursor', 'ns-resize');
                }
                else if (this._ngGrid.dragEnable && this.canDrag(e)) {
					this._renderer.setStyle(this._ngEl.nativeElement, 'cursor', 'move');
                }
                else {
					this._renderer.setStyle(this._ngEl.nativeElement, 'cursor', 'default');
				}
			} else if (this._ngGrid.resizeEnable && this.canResize(e)) {
				this._renderer.setStyle(this._ngEl.nativeElement, 'cursor', 'nwse-resize');
			} else if (this._ngGrid.dragEnable && this.canDrag(e)) {
				this._renderer.setStyle(this._ngEl.nativeElement, 'cursor', 'move');
			} else {
				this._renderer.setStyle(this._ngEl.nativeElement, 'cursor', 'default');
			}
		}
	}
    */

    public onMouseMove(e: any): void {
        if (this._ngGrid.autoStyle) {
            if (this._ngGrid.resizeEnable) {
                const resizeDirection = this.canResize(e);

                let cursor: string = "default";
                switch (resizeDirection) {
                    case "bottomright":
                    case "topleft":
                        cursor = "nwse-resize";
                        break;
                    case "topright":
                    case "bottomleft":
                        cursor = "nesw-resize";
                        break;
                    case "top":
                    case "bottom":
                        cursor = "ns-resize";
                        break;
                    case "left":
                    case "right":
                        cursor = "ew-resize";
                        break;
                    default:
                        if (this._ngGrid.dragEnable && this.canDrag(e)) {
                            cursor = "move";
                        }
                        break;
                }

                this._renderer.setStyle(this._ngEl.nativeElement, "cursor", cursor);
            } else if (this._ngGrid.dragEnable && this.canDrag(e)) {
                this._renderer.setStyle(this._ngEl.nativeElement, "cursor", "move");
            } else {
                this._renderer.setStyle(this._ngEl.nativeElement, "cursor", "default");
            }
        }
    }

    public ngOnDestroy(): void {
        if (this._added) this._ngGrid.removeItem(this);
    }

    //	Getters
    public getElement(): ElementRef {
        return this._ngEl;
    }

    public getDragHandle(): string {
        return this._dragHandle;
    }

    public getResizeHandle(): string {
        return this._resizeHandle;
    }

    public getDimensions(): NgGridItemDimensions {
        return { 'width': this._elemWidth, 'height': this._elemHeight };
    }

    public getSize(): NgGridItemSize {
        return this._size;
    }

    public getPosition(): NgGridRawPosition {
        return { 'left': this._elemLeft, 'top': this._elemTop };
    }

    public getGridPosition(): NgGridItemPosition {
        return this._currentPosition;
    }

    /**
     * caculatePositionFromPercentage
     * @param leftPercentage
     * @param topPercentage
     */
    public caculatePositionFromPercentage(leftPercentage: number, topPercentage: number) {
        let maxWidth = this._ngGrid.getCurrentMaxWidth();
        let designHeight = this._ngGrid.getCurrentDesignHeight();
        let maxHeight = designHeight + (designHeight * this._ngGrid.design_size_diff_percentage);

        /*
        console.log('designHeight:' + designHeight);
        console.log('design_size_diff_percentage:' + this._ngGrid.design_size_diff_percentage);
        console.log('maxWidth:' + maxWidth);
        console.log('maxHeight:' + maxHeight);
        */
        // console.log('maxWidth:' + maxWidth);
        let left = Math.round(maxWidth * leftPercentage);
        let top = Math.round(maxHeight * topPercentage);

        if (left && isFinite(left)) {
            this._currentPosition.col = this._getColFromPosiotionX(left);
        }

        if (top && isFinite(top)) {
            this._currentPosition.row = this._getRowFromPosiotionY(top);
        }
    }

    /**
     * caculateSizeFromPercentage
     * @param widthPercentage
     * @param heightPercentage
     */
    public caculateSizeFromPercentage(widthPercentage: number, heightPercentage: number, callStack: string) {
        let maxWidth = this._ngGrid.getCurrentMaxWidth();
        let designHeight = this._ngGrid.getCurrentDesignHeight();
        let maxHeight = designHeight + (designHeight * this._ngGrid.design_size_diff_percentage);

        let width = maxWidth * widthPercentage;
        let height = maxHeight * heightPercentage;

        // 
        if (width) {
            // if (callStack === 'init_config')
            {
                this._size.x = this._caculateSizeXFromPixel(width);
            }
        }
        // Only set Size Y at first time when initing grid
        // if (height && !this._initializedGridItem)
        if (height) {
            this._size.y = this._caculateSizeYFromPixel(height);
        }
    }

    //	Setters
    public setConfig(config: NgGridItemConfig, callStack: string = ''): void {
        this._config = config;

        this._payload = config.payload;

        //
        this._currentPosition.col = config.col ? config.col : NgGridItem.CONST_DEFAULT_CONFIG.col;
        this._currentPosition.row = config.row ? config.row : NgGridItem.CONST_DEFAULT_CONFIG.row;

        // In case adding new item , we need to re-caculate following max col, max row
        const dims = this._ngGrid.calcSize({
            x: config.sizex,
            y: config.sizey
        });

        this._size.x = dims.x;
        this._size.y = dims.y;

        //this._size.x = config.sizex ? config.sizex : NgGridItem.CONST_DEFAULT_CONFIG.sizex;
        //this._size.y = config.sizey ? config.sizey : NgGridItem.CONST_DEFAULT_CONFIG.sizey;
        /*
        console.log('_payload: ' + this._payload + ' _leftPercentage:' + this._leftPercentage);
        console.log('_payload: ' + this._payload + ' _topPercentage:' + this._topPercentage);
        console.log('_payload: ' + this._payload + ' _widthPercentage:' + this._widthPercentage);
        console.log('_payload: ' + this._payload + ' _heightPercentage:' + this._heightPercentage);
        */

        if (config.leftPercentage && config.topPercentage) {
            if (callStack == 'reCaculate' || (!this._leftPercentage && !this._topPercentage) || (!this._initializedGridItem)) {
                this.caculatePositionFromPercentage(config.leftPercentage, config.topPercentage);
            }
        }

        if (config.widthPercentage && config.heightPercentage) {
            if (callStack == 'reCaculate' || (!this._widthPercentage && !this._heightPercentage) || (!this._initializedGridItem)) {
                this.caculateSizeFromPercentage(config.widthPercentage, config.heightPercentage, callStack);
            }
        }

        //
        this._dragHandle = config.dragHandle;
        this._resizeHandle = config.resizeHandle;
        this._borderSize = config.borderSize;
        this.isDraggable = config.draggable ? true : false;
        this.isResizable = config.resizable ? true : false;
        this.isFixed = config.fixed ? true : false;

        this._maxCols = !isNaN(config.maxCols) && isFinite(config.maxCols) ? config.maxCols : 0;
        this._minCols = !isNaN(config.minCols) && isFinite(config.minCols) ? config.minCols : 0;
        this._maxRows = !isNaN(config.maxRows) && isFinite(config.maxRows) ? config.maxRows : 0;
        this._minRows = !isNaN(config.minRows) && isFinite(config.minRows) ? config.minRows : 0;

        this.minWidth = 50;  //!isNaN(config.minWidth) && isFinite(config.minWidth) ? config.minWidth : 0;
        this.minHeight = 50; //!isNaN(config.minHeight) && isFinite(config.minHeight) ? config.minHeight : 0;

        if (this._minCols > 0 && this._maxCols > 0 && this._minCols > this._maxCols) this._minCols = 0;
        if (this._minRows > 0 && this._maxRows > 0 && this._minRows > this._maxRows) this._minRows = 0;

        if (this._added) {
            this._ngGrid.updateItem(this, callStack);
        }

        this._size = this.fixResize(this._size);

        if (!this._leftPercentage) {
            this._leftPercentage = config.leftPercentage;
        }

        if (!this._topPercentage) {
            this._topPercentage = config.topPercentage;
        }

        if (!this._widthPercentage) {
            this._widthPercentage = config.widthPercentage;
        }

        if (!this._heightPercentage) {
            this._heightPercentage = config.heightPercentage;
        }

        this._recalculatePosition();
        this._recalculateDimensions();
    }

    public reCaculate() {
        this._added = false;
        this.setConfig(this._config, 'reCaculate');
        if (!this._added) {
            this._added = true;
            this._ngGrid.addItem(this);
        }
    }

    public ngDoCheck(): boolean {
        if (this._differ != null) {
            const changes: any = this._differ.diff(this._config);

            if (changes != null) {
                this._applyChanges(changes);

                return true;
            }
        }

        return false;
    }

    public setSize(newSize: NgGridItemSize, update: boolean = true): void {
        newSize = this.fixResize(newSize);
        this._size = newSize;
        if (update) this._recalculateDimensions();

        this.onItemChange.emit(this.getEventOutput());
    }

    public setGridPosition(gridPosition: NgGridItemPosition, update: boolean = true): void {
        this._currentPosition = gridPosition;
        if (update) this._recalculatePosition();

        this.onItemChange.emit(this.getEventOutput());
    }

    public getEventOutput(): NgGridItemEvent {
        return <NgGridItemEvent>{
            payload: this._payload,
            col: this._currentPosition.col,
            row: this._currentPosition.row,
            sizex: this._size.x,
            sizey: this._size.y,
            width: this._elemWidth,
            height: this._elemHeight,
            left: this._elemLeft,
            top: this._elemTop,
            leftPercentage: this._leftPercentage,
            topPercentage: this._topPercentage,
            heightPercentage: this._heightPercentage,
            widthPercentage: this._widthPercentage
        };
    }

    public setPosition(x: number, y: number): void {
        switch (this._cascadeMode) {
            case 'up':
            case 'left':
            default:
                //this._renderer.setStyle(this._ngEl.nativeElement, 'left', x + 'px');
                //this._renderer.setStyle(this._ngEl.nativeElement, 'top', y + 'px');

                // Desgin Mode
                if (this._ngGrid.designMode) {
                    this._renderer.setStyle(this._ngEl.nativeElement, 'left', x + 'px');
                    this._renderer.setStyle(this._ngEl.nativeElement, 'top', y + 'px');
                }
                // View Mode
                else {
                    const posPercentage = this.updatePosPercentageForViewMode();
                    if (this.col == 1) {
                        this._renderer.setStyle(this._ngEl.nativeElement, 'left', '5px');
                    }
                    else {
                        let leftValue = 'calc(' + posPercentage.leftPercentageViewMode * 100 + '% + 5px)';
                        this._renderer.setStyle(this._ngEl.nativeElement, 'left', leftValue);
                    }

                    if (this.row == 1) {
                        this._renderer.setStyle(this._ngEl.nativeElement, 'top', '5px');
                    }
                    else {
                        let topValue = 'calc(' + posPercentage.topPercentageViewMode * 100 + '% + 5px)';
                        this._renderer.setStyle(this._ngEl.nativeElement, 'top', topValue);
                    }
                }
                break;
            case 'right':
                this._renderer.setStyle(this._ngEl.nativeElement, 'right', x + 'px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'top', y + 'px');
                break;
            case 'down':
                this._renderer.setStyle(this._ngEl.nativeElement, 'left', x + 'px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'bottom', y + 'px');
                break;
        }

        this._elemLeft = x;
        this._elemTop = y;

        //if (!this._leftPercentage) {
        //    this._leftPercentage = Math.round((x / this._ngGrid.getCurrentMaxWidth()) * 1000) / 1000;
        //}

        //if (!this._topPercentage) {
        //    this._topPercentage = Math.round((y / this._ngGrid.getCurrentHeight()) * 1000) / 1000;
        //}            
    }

    /**
     * updateTopLeftPercentage
     */
    public updateTopLeftPercentage() {
        if (this._ngGrid.getCurrentMaxWidth()) {
            this._leftPercentage = Math.round((this._elemLeft / this._ngGrid.getCurrentMaxWidth()) * 100000) / 100000;
        }
        if (this._ngGrid.getCurrentMaxHeight()) {
            this._topPercentage = Math.round((this._elemTop / this._ngGrid.getCurrentMaxHeight()) * 100000) / 100000;
        }
        // this._topPercentage = Math.round((this._elemTop / this._ngGrid.getCurrentHeight()) * 100000) / 100000;
    }

    /*
    public setPosition(x: number, y: number): void {
        switch (this._cascadeMode) {
            case 'up':
            case 'left':
            default:
                this._renderer.setStyle(this._ngEl.nativeElement, 'transform', 'translate(' + x + 'px, ' + y + 'px)');

                break;
            case 'right':
                this._renderer.setStyle(this._ngEl.nativeElement, 'transform', 'translate(' + -x + 'px, ' + y + 'px)');

                break;
            case 'down':
                this._renderer.setStyle(this._ngEl.nativeElement, 'transform', 'translate(' + x + 'px, ' + -y + 'px)');

                break;
        }

        this._elemLeft = x;
        this._elemTop = y;
    }
    */

    public setCascadeMode(cascade: string): void {
        this._cascadeMode = cascade;
        switch (cascade) {
            case 'up':
            case 'left':
            case 'up-left':
            default:
                //this._renderer.setStyle(this._ngEl.nativeElement, 'transform', 'translate(' + this._elemLeft + 'px, ' + this._elemTop + 'px)');
                this._renderer.setStyle(this._ngEl.nativeElement, 'left', this._elemLeft + 'px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'top', this._elemTop + 'px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'right', null);
                this._renderer.setStyle(this._ngEl.nativeElement, 'bottom', null);
                break;
            case 'right':
                this._renderer.setStyle(this._ngEl.nativeElement, 'right', this._elemLeft + 'px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'top', this._elemTop + 'px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'left', null);
                this._renderer.setStyle(this._ngEl.nativeElement, 'bottom', null);
                break;
            case 'down':
                this._renderer.setStyle(this._ngEl.nativeElement, 'left', this._elemLeft + 'px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'bottom', this._elemTop + 'px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'right', null);
                this._renderer.setStyle(this._ngEl.nativeElement, 'top', null);
                break;
        }
    }


    /*
    public setCascadeMode(cascade: string): void {
        this._cascadeMode = cascade;
        switch (cascade) {
            case 'up':
            case 'left':
            default:
                //this._renderer.setStyle(this._ngEl.nativeElement, 'transform', 'translate(' + this._elemLeft + 'px, ' + this._elemTop + 'px)');
                this._renderer.setStyle(this._ngEl.nativeElement, 'left', '0px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'top', '0px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'right', null);
                this._renderer.setStyle(this._ngEl.nativeElement, 'bottom', null);
                break;
            case 'right':
                this._renderer.setStyle(this._ngEl.nativeElement, 'right', '0px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'top', '0px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'left', null);
                this._renderer.setStyle(this._ngEl.nativeElement, 'bottom', null);
                break;
            case 'down':
                this._renderer.setStyle(this._ngEl.nativeElement, 'left', '0px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'bottom','0px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'right', null);
                this._renderer.setStyle(this._ngEl.nativeElement, 'top', null);
                break;
        }
    }
    */

    public setDimensions(w: number, h: number): void {
        if (w < this.minWidth) w = this.minWidth;
        if (h < this.minHeight) h = this.minHeight;

        //this._renderer.setStyle(this._ngEl.nativeElement, 'width', w + 'px');
        //this._renderer.setStyle(this._ngEl.nativeElement, 'height', h + 'px');

        if (this._ngGrid.designMode) {
            this._renderer.setStyle(this._ngEl.nativeElement, 'width', w + 'px');
            this._renderer.setStyle(this._ngEl.nativeElement, 'height', h + 'px');
        }
        else {
            const percentageViewMode = this.updateSizePercentageForViewMode();
            let widthPercentage = 'calc(' + percentageViewMode.widthPercentageViewMode * 100 + '% - 10px)';
            let heightPercentage = 'calc(' + percentageViewMode.heightPercentageViewMode * 100 + '% - 10px)';
            this._renderer.setStyle(this._ngEl.nativeElement, 'width', widthPercentage);
            this._renderer.setStyle(this._ngEl.nativeElement, 'height', heightPercentage);
        }

        this._elemWidth = w;
        this._elemHeight = h;

        //if (!this._widthPercentage) {
        //    this._widthPercentage = Math.round((w / this._ngGrid.getCurrentMaxWidth()) * 100) / 100;
        //}

        //if (!this._heightPercentage) {
        //    this._heightPercentage = Math.round((h / this._ngGrid.getCurrentHeight()) * 100) / 100;
        //}        
    }

    private updateSizePercentageForViewMode() {
        let widthPercentageViewMode = this._widthPercentage;
        let heightPercentageViewMode = this._heightPercentage;
        try {
            let maxWidth = this._ngGrid.getCurrentMaxWidth();
            let designHeight = this._ngGrid.getCurrentDesignHeight();
            let maxHeight = designHeight;

            let width = maxWidth * this._widthPercentage;
            let height = maxHeight * this._heightPercentage;
            let widthMargin = this._ngGrid.marginLeft + width + this._ngGrid.marginRight;
            let heightMargin = this._ngGrid.marginTop + height + this._ngGrid.marginBottom;
            // Right Edge
            if (this.col + this.sizex >= this._ngGrid.getContainerColumns() - 2) {                
                let left = this.col == 1 ? 5 : Math.round(maxWidth * this._leftPercentage);
                // Check and add padding to fit page if missing px.
                widthMargin = widthMargin + Math.max((maxWidth - (left + (widthMargin - this._ngGrid.marginLeft))), 0);
            }
            widthPercentageViewMode = Math.round((widthMargin / maxWidth) * 100000) / 100000;
            if (widthPercentageViewMode > 1) {
                widthPercentageViewMode = 1;
            }

            // Bottom Edge
            if (this.row + this.sizey >= this._ngGrid.getContainerRow() - 2) {
                let top = this.row == 1 ? 5 : Math.round(maxHeight * this._topPercentage);
                // Check and add padding to fit page if missing px.
                heightMargin = heightMargin + Math.max((maxHeight - (top + (heightMargin - this._ngGrid.marginTop))), 0);
            }

            heightPercentageViewMode = Math.round((heightMargin / maxHeight) * 100000) / 100000;
            if (heightPercentageViewMode > 1) {
                heightPercentageViewMode = 1;
            }
        }
        catch {
        }
        return {
            widthPercentageViewMode,
            heightPercentageViewMode
        }
    }

    private updatePosPercentageForViewMode() {
        let leftPercentageViewMode = this._leftPercentage;
        let topPercentageViewMode = this._topPercentage;
        try {
            let maxWidth = this._ngGrid.getCurrentMaxWidth();
            let designHeight = this._ngGrid.getCurrentDesignHeight();
            let maxHeight = designHeight + (designHeight * this._ngGrid.design_size_diff_percentage);
            let left = Math.round(maxWidth * this._leftPercentage);
            let top = Math.round(maxHeight * this._topPercentage);
            if (left && isFinite(left)) {
                leftPercentageViewMode = Math.round(((left - this._ngGrid.marginLeft) / this._ngGrid.getCurrentMaxWidth()) * 100000) / 100000;
            }
            if (top && isFinite(top)) {
                topPercentageViewMode = Math.round(((top - this._ngGrid.marginTop) / this._ngGrid.getCurrentMaxHeight()) * 100000) / 100000;
            }
            if (leftPercentageViewMode < 0) {
                leftPercentageViewMode = 0;
            }
            if (topPercentageViewMode < 0) {
                topPercentageViewMode = 0;
            }
        }
        catch{ }
        return {
            leftPercentageViewMode,
            topPercentageViewMode
        }
    }

    /**
     * updateWidthHeightPercentage
     */
    public updateWidthHeightPercentage() {
        if (this._ngGrid.getCurrentMaxWidth()) {
            this._widthPercentage = Math.round((this._elemWidth / this._ngGrid.getCurrentMaxWidth()) * 100000) / 100000;
            if (this._widthPercentage > 1) {
                this._widthPercentage = 1;
            }
        }
        if (this._ngGrid.getCurrentMaxHeight()) {
            this._heightPercentage = Math.round((this._elemHeight / this._ngGrid.getCurrentMaxHeight()) * 100000) / 100000;
            if (this._heightPercentage > 1) {
                this._heightPercentage = 1;
            }
        }
        // this._heightPercentage = Math.round((this._elemHeight / this._ngGrid.getCurrentHeight()) * 100000) / 100000;
    }


    public startMoving(): void {
        this._renderer.addClass(this._ngEl.nativeElement, 'moving');
        const style: any = window.getComputedStyle(this._ngEl.nativeElement);
        if (this._ngGrid.autoStyle) this._renderer.setStyle(this._ngEl.nativeElement, 'z-index', (parseInt(style.getPropertyValue('z-index')) + 1).toString());
    }

    public stopMoving(): void {
        this._renderer.removeClass(this._ngEl.nativeElement, 'moving');
        const style: any = window.getComputedStyle(this._ngEl.nativeElement);
        if (this._ngGrid.autoStyle) this._renderer.setStyle(this._ngEl.nativeElement, 'z-index', (parseInt(style.getPropertyValue('z-index')) - 1).toString());
    }

    public updateZIndex() {
        this._renderer.setStyle(this._ngEl.nativeElement, 'z-index', (this._ngGrid.maxZIndex + 1).toString());
        this._ngGrid.maxZIndex += 1;
    }

    public recalculateSelf(): void {
        this._recalculatePosition();
        this._recalculateDimensions();
    }

    /**
     * Check if width >= min width
     * @param newSize
     */
    public isMeetWithMinWidth(newSize: NgGridItemSize) {
        const itemWidth = (newSize.x * this._ngGrid.colWidth) + ((this._ngGrid.marginLeft + this._ngGrid.marginRight) * (newSize.x - 1));
        if (itemWidth < this.minWidth) {
            return false;
        }
        return true;
    }

    /**
     * Check if height >= min height
     * @param newSize
     */
    public isMeetWithMinHeight(newSize: NgGridItemSize) {
        const itemHeight = (newSize.y * this._ngGrid.rowHeight) + ((this._ngGrid.marginTop + this._ngGrid.marginBottom) * (newSize.y - 1));
        if (itemHeight < this.minHeight) {
            return false;
        }
        return true;
    }

    public fixResize(newSize: NgGridItemSize): NgGridItemSize {
        if (this._maxCols > 0 && newSize.x > this._maxCols) newSize.x = this._maxCols;
        if (this._maxRows > 0 && newSize.y > this._maxRows) newSize.y = this._maxRows;

        if (this._minCols > 0 && newSize.x < this._minCols) newSize.x = this._minCols;
        if (this._minRows > 0 && newSize.y < this._minRows) newSize.y = this._minRows;

        const itemWidth = (newSize.x * this._ngGrid.colWidth) + ((this._ngGrid.marginLeft + this._ngGrid.marginRight) * (newSize.x - 1));
        if (itemWidth < this.minWidth) newSize.x = Math.ceil((this.minWidth + this._ngGrid.marginRight + this._ngGrid.marginLeft) / (this._ngGrid.colWidth + this._ngGrid.marginRight + this._ngGrid.marginLeft));

        const itemHeight = (newSize.y * this._ngGrid.rowHeight) + ((this._ngGrid.marginTop + this._ngGrid.marginBottom) * (newSize.y - 1));
        if (itemHeight < this.minHeight) newSize.y = Math.ceil((this.minHeight + this._ngGrid.marginBottom + this._ngGrid.marginTop) / (this._ngGrid.rowHeight + this._ngGrid.marginBottom + this._ngGrid.marginTop));

        return newSize;
    }

    //	Private methods
    private elementMatches(element: any, selector: string): boolean {
        if (!element) return false;
        if (element.matches) return element.matches(selector);
        if (element.oMatchesSelector) return element.oMatchesSelector(selector);
        if (element.msMatchesSelector) return element.msMatchesSelector(selector);
        if (element.mozMatchesSelector) return element.mozMatchesSelector(selector);
        if (element.webkitMatchesSelector) return element.webkitMatchesSelector(selector);

        if (!element.document || !element.ownerDocument) return false;

        const matches: any = (element.document || element.ownerDocument).querySelectorAll(selector);
        let i: number = matches.length;
        while (--i >= 0 && matches.item(i) !== element) { }
        return i > -1;
    }

    public _recalculatePosition(): void {
        let x: number = (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._currentPosition.col - 1) + this._ngGrid.marginLeft;
        let y: number = (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._currentPosition.row - 1) + this._ngGrid.marginTop;

        if (!x) {
            x = 1;
        }

        if (!y) {
            y = 1;
        }

        this.setPosition(x, y);
    }

    public _recalculateDimensions(callStack?: string): void {

        if (this._size.x < this._ngGrid.minCols)
            this._size.x = this._ngGrid.minCols;
        if (this._size.y < this._ngGrid.minRows)
            this._size.y = this._ngGrid.minRows;

        const newWidth: number = (this._ngGrid.colWidth * this._size.x) + ((this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._size.x - 1));
        const newHeight: number = (this._ngGrid.rowHeight * this._size.y) + ((this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._size.y - 1));

        const w: number = Math.max(this.minWidth, this._ngGrid.minWidth, newWidth);
        const h: number = Math.max(this.minHeight, this._ngGrid.minHeight, newHeight);

        this.setDimensions(w, h);
    }


    /**
     * _getColFromPosiotionX
     */
    private _getColFromPosiotionX(x: number) {
        // let col = (x + this._ngGrid.colWidth + this._ngGrid.marginRight) / (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight);
        let col = Math.max(1, Math.round(x / (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight)) + 1);
        return col;
    }

    /**
     * _getRowFromPosiotionY
     */
    private _getRowFromPosiotionY(y: number) {
        // let row = (y + this._ngGrid.rowHeight + this._ngGrid.marginBottom) / (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom);
        let row = Math.max(1, Math.round(y / (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom)) + 1);
        return row;
    }

    /**
     * _caculateSizeXFromPixel
     */
    private _caculateSizeXFromPixel(width: number): number {
        // return Math.floor((width + this._ngGrid.marginRight + this._ngGrid.marginLeft) / (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight));
        width += this._ngGrid.marginLeft + this._ngGrid.marginRight;
        let size_x = Math.max(this._ngGrid.minCols, Math.round((width) / (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight)));
        let max_cols = this._ngGrid.getContainerColumns();
        if ((this._currentPosition.col - 1) + size_x > max_cols) {
            let padding = (this._currentPosition.col - 1) + size_x - max_cols;
            size_x -= (padding);
        }
        return size_x;
    }

    /**
     * _caculateSizeYFromPixel
     * @param height
     */
    private _caculateSizeYFromPixel(height: number): number {
        // return Math.floor((height + this._ngGrid.marginTop + this._ngGrid.marginBottom) / (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom));
        height += this._ngGrid.marginTop + this._ngGrid.marginBottom;
        return Math.max(this._ngGrid.minRows, Math.round((height) / (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom)));
    }

    /**
     * _getMousePosition
     * Get top, left from this current widget
     * @param e
     */
    private _getMousePosition(e: any): NgGridRawPosition {
        if (e.originalEvent && e.originalEvent.touches) {
            const oe: any = e.originalEvent;
            e = oe.touches.length ? oe.touches[0] : (oe.changedTouches.length ? oe.changedTouches[0] : e);
        } else if (e.touches) {
            e = e.touches.length ? e.touches[0] : (e.changedTouches.length ? e.changedTouches[0] : e);
        }


        const refPos: NgGridRawPosition = this._ngEl.nativeElement.getBoundingClientRect();
        // Get top, left of mouse in this current widget
        return {
            left: e.clientX - refPos.left,
            top: e.clientY - refPos.top
        };
    }

    private _applyChanges(changes: any): void {
        //console.log('_applyChanges');
        if (this._ngGrid.isDragging || this._ngGrid.isResizing) {
            //console.log('_applyChanges stop');
            return;
        }
        changes.forEachAddedItem((record: any) => {
            this._config[record.key] = record.currentValue;
        });
        changes.forEachChangedItem((record: any) => {
            this._config[record.key] = record.currentValue;
        });
        changes.forEachRemovedItem((record: any) => {
            delete this._config[record.key];
        });

        this.setConfig(this._config, '_applyChanges');
    }
}
