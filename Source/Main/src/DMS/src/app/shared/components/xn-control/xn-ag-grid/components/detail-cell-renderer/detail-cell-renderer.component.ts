import { Component, AfterViewInit, ViewChild, ViewContainerRef, TemplateRef, ElementRef } from "@angular/core";
import { Subscription } from "rxjs";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { Uti } from "@app/utilities";

@Component({
    selector: 'detail-cell-renderer',
    templateUrl: './detail-cell-renderer.html',
    styleUrls: ['./detail-cell-renderer.scss']
})
export class DetailCellRenderer implements ICellRendererAngularComp, AfterViewInit {   
    public params: any;
    public template: TemplateRef<any>;
    public templateContext: { $implicit: any, params: any, data: any, columns: any, renderCallback: Function, dispatchData: Function };
    private changeColumnLayoutSubscribtion: Subscription;

    agInit(params: any): void {
        this.params = params;
        this.template = params.context.componentParent.rowDetailTemplateRef;
        this.templateContext = {
            $implicit: !params['customParam'] ? params.value : params['customParam'],
            params: params,
            data: params.data,
            columns: params.columnApi.getAllColumns(),
            renderCallback: this.renderCallback.bind(this),
            dispatchData: this.dispatchData.bind(this)
        };

        this.changeColumnLayoutSubscribtion = params.context.componentParent.changeColumnLayout.subscribe(data => {
            if (data) {
                this.templateContext.columns = params.columnApi.getAllColumns();
            }
        });
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }

    constructor(private elementRef: ElementRef) {

    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public renderCallback() {
        this.updateHeight();
    }

    public dispatchData(item) {
        this.params.context.componentParent.rowClick.emit(item);
    }

    private updateHeight() {
        let height = this.elementRef.nativeElement.offsetHeight;
        // this.params.context.componentParent.detailRowHeight = height;
        if (height) {
            this.params.node.setRowHeight(height);
            this.params.api.resetRowHeights();
            setTimeout(() => {
                this.params.api.ensureIndexVisible(this.params.node.rowIndex -1, 'top');
            });            
        }
    }

    ngAfterViewInit() {
    }
}
