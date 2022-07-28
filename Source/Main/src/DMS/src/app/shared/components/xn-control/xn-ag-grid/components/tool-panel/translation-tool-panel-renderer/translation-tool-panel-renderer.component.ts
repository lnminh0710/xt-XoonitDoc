import { Component, ViewEncapsulation, ViewChild, ElementRef} from "@angular/core";
import { ICellRendererAngularComp, ICellEditorAngularComp, IHeaderAngularComp } from "ag-grid-angular";
import { IToolPanel, IToolPanelParams } from "ag-grid-community";
import { XnAgGridComponent } from '../../../pages/ag-grid-container/xn-ag-grid.component';
import { WidgetDetail } from '@app/models';

@Component({
    selector: 'translation-tool-panel-renderer',
    templateUrl: './translation-tool-panel-renderer.html',
    styleUrls: ['./translation-tool-panel-renderer.scss']
})
export class TranslationToolPanelRenderer implements IToolPanel {

    private targetCommunicatedWidgetDetail: WidgetDetail;
    private params: IToolPanelParams;
    public translateData: any;
    public componentParent: XnAgGridComponent;
    public columnDefs;
    public dragDataTransferCallback: any = this.connectWidgetSuccessCallback.bind(this);

    constructor() {
    }


    agInit(params: IToolPanelParams): void {
        this.params = params;
        this.componentParent = params['componentParent'];
        if (this.componentParent) {
            this.columnDefs = this.componentParent.gridOptions.columnDefs;
        }
        this.translateData = this.getDefaultTranslateData();
        this.params.api.removeEventListener("selectionChanged", this.selectionChanged.bind(this));
        this.params.api.addEventListener('selectionChanged', this.selectionChanged.bind(this));

        this.params.api.removeEventListener("cellFocused", this.onCellFocused.bind(this));
        this.params.api.addEventListener('cellFocused', this.onCellFocused.bind(this));

        this.params.api.removeEventListener("modelUpdated", this.modelUpdated.bind(this));
        this.params.api.addEventListener('modelUpdated', this.modelUpdated.bind(this));
    } 

    /**
     * selectionChanged
     * @param params
     */
    public selectionChanged(params) {
        let selectedNodes = params.api.getSelectedNodes();
        if (selectedNodes.length) {
            const selectedNode = selectedNodes[0];
            this.translateData = this.getDefaultTranslateData();
            if (this.translateData) {
                this.translateData.gridSelectedRow = [selectedNode.data];
            }
        }
    }

    /**
     * onCellFocused
     * @param params
     */
    public onCellFocused(params) {
        if (!params.column || !this.targetCommunicatedWidgetDetail) {
            return;
        }
        let row = params.api.getDisplayedRowAtIndex(params.rowIndex);
        let colDef = params.column.colDef;
        if (this.componentParent) {
            const dragDropCommunicationData = {
                fieldColumn: colDef.field,
                fieldText: colDef.headerName,
                fieldValue: colDef.field,
                srcWidgetDetail: {
                    id: this.componentParent.translateData.id,
                    idRepWidgetApp: this.componentParent.translateData.idRepWidgetApp,
                    idRepWidgetType: this.componentParent.translateData.idRepWidgetType
                },
                mode: 'translate'
            };
            if (row) {
                dragDropCommunicationData.srcWidgetDetail['gridSelectedRow'] = [row.data];
            }
            if (this.targetCommunicatedWidgetDetail) {
                this.targetCommunicatedWidgetDetail.extensionData = dragDropCommunicationData;
            }
        }
    }

    /**
     * getDefaultTranslateData
     **/
    private getDefaultTranslateData() {
        const translateData = this.componentParent.translateData;
        if (translateData) {
            return {
                id: translateData.id,
                idRepWidgetApp: translateData.idRepWidgetApp,
                idRepWidgetType: translateData.idRepWidgetType
            }
        }
        return null;
    }


    /**
     * modelUpdated
     **/
    public modelUpdated() {
        if (this.componentParent && this.componentParent.gridOptions) {
            this.columnDefs = this.componentParent.gridOptions.columnDefs;
        }
    }

    public refresh() {

    }

    public getDraggableData(colDef) {
        return {
            zone: 'widget',
            data: {
                fieldColumn: colDef.field,
                fieldText: colDef.headerName,
                fieldValue: colDef.field,
                srcWidgetDetail: this.componentParent.translateData,
                mode: 'translate'
            }
        };
    }

    /**
     * connectWidgetSuccessCallback
     * @param data
     */
    public connectWidgetSuccessCallback(data: WidgetDetail) {
        this.targetCommunicatedWidgetDetail = data;
    }

}
