import {
    Component,
    Input,
    OnDestroy,
    EventEmitter,
    AfterViewInit,
    TemplateRef,
    ViewChild,
    Output,
    ViewContainerRef,
    EmbeddedViewRef,
    NgZone,
    ChangeDetectorRef,
} from '@angular/core';
import { ControlGridModel } from '@app/models';
import { XnAgGridComponent } from '@xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { BehaviorSubject, of, Subject, Subscription } from 'rxjs';
import { delay, first, pairwise, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'table-dropdown',
    styleUrls: ['./table-dropdown.component.scss'],
    templateUrl: './table-dropdown.component.html',
})
export class TableDropdownComponent implements AfterViewInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    private selectedItem: { key: string; value: any }[] = [];
    public readonly header: number = 36;
    public onReadyGrid: boolean;

    public topPos: number = 0;
    public leftPos: number = 0;
    public numberOfRows: number = 0;
    public isReverseY: boolean;
    public isReverseX: boolean;

    private rowLength$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    private readonly numberOfRows$: Subscription = this.rowLength$
        .pipe(
            pairwise(),
            switchMap(([prev, next]) => {
                const newObs = of(next);
                return next >= prev ? newObs : newObs.pipe(delay(500));
            }),
            takeUntil(this.destroy$),
        )
        .subscribe((val) => {
            this.numberOfRows = val;
            this.cdRef.detectChanges();
        });

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

    private _hideDropdown: boolean;
    @Input() set hideDropdown(isHide: boolean) {
        this._hideDropdown = isHide;
        if (isHide) {
            this.rowSelected = null;
        }
    }

    get hideDropdown(): boolean {
        return this._hideDropdown;
    }

    @Input() guid: string;

    private _dataSource: ControlGridModel;
    @Input() set dataSource(data: ControlGridModel) {
        const length = data?.data?.length;
        this._dataSource = data;
        this.rowLength$.next(length || 0);
        this.ngZone.onStable.pipe(first()).subscribe(() => {
            this.rowSelected = 0;
        });
    }
    get dataSource(): ControlGridModel {
        return this._dataSource;
    }

    @Input() rowHeight: number = 32;
    @Input() hightlightKeywords: string = '';
    @Input() maxHeight: number = 400;
    @Input() width: number = 400;
    @Input() top: number = 55;
    @Input() x: number = 10;
    @Input() forceHiddenDropdown: boolean;
    @Input() cssClass: string = '';
    @Input() forceHeight: number;
    @Input() closeWhenClickOutside: boolean = true;
    @Input() globalProperties: any;

    @Output() closeDropdown: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('table') templateRef: TemplateRef<any>;
    @ViewChild('agGrid') agGrid: XnAgGridComponent;

    private embeddedViewRef: EmbeddedViewRef<any>;

    constructor(private viewContainerRef: ViewContainerRef, private ngZone: NgZone, private cdRef: ChangeDetectorRef) {}

    ngAfterViewInit() {
        this.embeddedViewRef = this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.embeddedViewRef.detectChanges();
        for (const node of this.embeddedViewRef.rootNodes) {
            document.body.appendChild(node);
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.embeddedViewRef.destroy();
    }

    gridOnReady(event) {
        // this.onReadyGrid = true;
        // this.agGrid?.columnApi?.autoSizeAllColumns();
        try {
            const agBodyViewport = this.agGrid.agGridViewContainerRef.element.nativeElement.getElementsByClassName(
                'ag-body-viewport',
            )[0];
            const agBodyContainer = agBodyViewport.getElementsByClassName('ag-center-cols-container')[0];
            agBodyContainer.style.width = '100%';
            // agBodyViewport.style.overflowY = 'auto';
            // agBodyContainer.style.maxHeight = `${this.maxHeight}px`;
        } catch (err) {
            console.log(err);
        }
    }

    selectRow(event) {
        this.selectedItem = event;
    }

    choose(event?) {
        this.hideDropdown = true;
        this.rowSelected = null;
        this.closeDropdown.emit(event || this.selectedItem);
    }

    clickOutside() {
        if (this.closeWhenClickOutside) {
            this.hideDropdown = true;
        }
    }
}
