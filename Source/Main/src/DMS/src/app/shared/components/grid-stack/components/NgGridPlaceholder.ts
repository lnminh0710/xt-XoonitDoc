import { NgGrid } from '../directives/NgGrid';
import { NgGridItem } from '../directives/NgGridItem';
import { NgGridItemPosition, NgGridItemSize } from '../interfaces/INgGrid';
import { Component, Directive, ElementRef, Renderer2, EventEmitter, Host, ViewEncapsulation, Type, ComponentRef, KeyValueDiffer, KeyValueDiffers, OnInit, OnDestroy, DoCheck, ViewContainerRef, Output } from '@angular/core';

@Component({
	selector: 'ng-grid-placeholder',
	template: ''
})
export class NgGridPlaceholder implements OnInit {
	private _size: NgGridItemSize;
	private _position: NgGridItemPosition;
	private _ngGrid: NgGrid;
    private _cascadeMode: string;
    private _currentItem: NgGridItem;
    private _collisionItems: Array<NgGridItem>;
    private _positionMode: string;
    private _isError: boolean;

    constructor(private _ngEl: ElementRef, private _renderer: Renderer2) { }

	public registerGrid(ngGrid: NgGrid) {
		this._ngGrid = ngGrid;
	}

	public ngOnInit(): void {
		this._renderer.addClass(this._ngEl.nativeElement, 'grid-placeholder');
		if (this._ngGrid.autoStyle) this._renderer.setStyle(this._ngEl.nativeElement, 'position', 'absolute');
	}

    public getSize(): NgGridItemSize {
        return this._size;
    }

    public getGridPosition(): NgGridItemPosition {
        return this._position;
    }

    public getCurrentItem() {
        return {
            item: this._currentItem,
            positionMode: this._positionMode
        }
    }

    public getCollisionItems() {
        return {
            collisionItems: this._collisionItems,
            positionMode: this._positionMode
        }
    }

    public setCurrentItem(item: NgGridItem, positionMode:string) {
        this._currentItem = item;
        this._positionMode = positionMode;
    }

    public setCollisionItems(items: Array<NgGridItem>, positionMode: string) {
        this._collisionItems = items;
        this._positionMode = positionMode;
    }

	public setSize(newSize: NgGridItemSize): void {
		this._size = newSize;
		this._recalculateDimensions();
	}

	public setGridPosition(newPosition: NgGridItemPosition): void {
		this._position = newPosition;
		this._recalculatePosition();
    }

    public setZIndex(value) {
        this._renderer.setStyle(this._ngEl.nativeElement, 'z-index', value);
    }

    public setBackgroundColor(value) {
        this._renderer.setStyle(this._ngEl.nativeElement, 'background-color', value);
    }

	public setCascadeMode(cascade: string): void {
		this._cascadeMode = cascade;
		switch (cascade) {
			case 'up':
            case 'left':
            case 'up-left':
			default:
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
				this._renderer.setStyle(this._ngEl.nativeElement, 'bottom', '0px');
				this._renderer.setStyle(this._ngEl.nativeElement, 'right', null);
				this._renderer.setStyle(this._ngEl.nativeElement, 'top', null);
				break;
		}
	}

    /**
     *getMinWidthCollisionItem
     * */
    public getMinWidthCollisionItem() {
        if (this._collisionItems) {
            const minWidthItem = this._collisionItems.reduce(function (prev, curr) {
                return prev.sizex < curr.sizex ? prev : curr;
            });
            return minWidthItem;
        }
        return null;
    }

    /**
     * getMinHeightCollisionItem
     * */
    public getMinHeightCollisionItem() {
        if (this._collisionItems) {
            const minHeightItem = this._collisionItems.reduce(function (prev, curr) {
                return prev.sizey < curr.sizey ? prev : curr;
            });
            return minHeightItem;
        }
        return null;
    }

	//	Private methods
	private _setDimensions(w: number, h: number): void {
		this._renderer.setStyle(this._ngEl.nativeElement, 'width', w + 'px');
		this._renderer.setStyle(this._ngEl.nativeElement, 'height', h + 'px');
	}

	private _setPosition(x: number, y: number): void {
		switch (this._cascadeMode) {
			case 'up':
			case 'left':
			default:
				// this._renderer.setStyle(this._ngEl.nativeElement, 'transform', 'translate(' + x + 'px, ' + y + 'px)');
                this._renderer.setStyle(this._ngEl.nativeElement, 'left', x + 'px');
                this._renderer.setStyle(this._ngEl.nativeElement, 'top', y + 'px');
				break;
			case 'right':
				this._renderer.setStyle(this._ngEl.nativeElement, 'transform', 'translate(' + -x + 'px, ' + y + 'px)');
				break;
			case 'down':
				this._renderer.setStyle(this._ngEl.nativeElement, 'transform', 'translate(' + x + 'px, ' + -y + 'px)');
				break;
		}
    }

    public getErrorStatus() {
        return this._isError;
    }

    public setError() {
        if (!this._isError) {
            this._isError = true;
            this._renderer.selectRootElement(this._ngEl.nativeElement).insertAdjacentHTML('beforeend', '<div class="grid-placeholder__warning" style="display: flex;align-items: center;justify-content: center;height: 100%;"><i class="fa fa-ban grid-placeholder__warning" style="font-size:large;color: #b73131;"></i></div>');
        }
    }

    public clearError() {
        this._isError = false;
        const childElements = this._ngEl.nativeElement.children;
        for (let child of childElements) {
            this._ngEl.nativeElement.removeChild(child);
        }
    }

	private _recalculatePosition(): void {
		const x: number = (this._ngGrid.colWidth + this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._position.col - 1) + this._ngGrid.marginLeft;
		const y: number = (this._ngGrid.rowHeight + this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._position.row - 1) + this._ngGrid.marginTop;
		this._setPosition(x, y);
	}

	private _recalculateDimensions(): void {
		const w: number = (this._ngGrid.colWidth * this._size.x) + ((this._ngGrid.marginLeft + this._ngGrid.marginRight) * (this._size.x - 1));
		const h: number = (this._ngGrid.rowHeight * this._size.y) + ((this._ngGrid.marginTop + this._ngGrid.marginBottom) * (this._size.y - 1));
		this._setDimensions(w, h);
	}
}
