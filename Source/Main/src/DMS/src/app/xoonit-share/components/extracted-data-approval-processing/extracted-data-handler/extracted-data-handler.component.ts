import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ExtractedMasterDataWidgetType, TypeDataSet } from '@app/app.constants';
import { MasterExtractedData } from '@app/models/approval/master-extracted.model';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { BaseComponent } from '@app/pages/private/base';
import { DatatableService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { WidgetDynamicFormComponent } from '../../widget-dynamic-form/widget-dynamic-form.component';

@Component({
    selector: 'extracted-data-handler',
    templateUrl: './extracted-data-handler.component.html',
    styleUrls: ['./extracted-data-handler.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtractedDataHandlerComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() dataSource: any;
    @Input() globalProperties: any;
    @Output() rowSelected = new EventEmitter<MasterExtractedData>();
    @Output() clearData: EventEmitter<any> = new EventEmitter();

    public typeDataSet = '';
    public TYPE_DATA_SET = TypeDataSet;
    public WIDGET_TYPE = ExtractedMasterDataWidgetType;

    public dynamicFormGroupDefinition: DynamicFormGroupDefinition;

    public dataTableSource: any;

    public isShowClear: boolean;

    @ViewChild('wdDynamicForm') wdDynamicForm: WidgetDynamicFormComponent;

    constructor(
        protected router: Router,
        protected cdRef: ChangeDetectorRef,
        protected datatableService: DatatableService,
        protected translateService: TranslateService,
    ) {
        super(router);
    }
    ngOnInit(): void {
        if (!this.dataSource) return;

        this.typeDataSet = this.dataSource.typeDataSet;

        switch (this.typeDataSet) {
            case this.TYPE_DATA_SET.DYNAMIC_FORM:
                this.dynamicFormGroupDefinition = this.dataSource.data;
                break;
            case this.TYPE_DATA_SET.DATA_TABLE:
                const tableData = this.dataSource.data;
                this.dataTableSource = this.datatableService.buildEditableDataSource([tableData[0], tableData[1]]);
                break;
            default:
                break;
        }

        this.cdRef.detectChanges();
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }

    public selectItem(rowSelected) {
        if (!rowSelected) return;

        this.rowSelected.emit(<MasterExtractedData>{
            widgetType: this.dataSource.widgetType,
            data: rowSelected,
        });
    }

    public clearFormData() {
        this.wdDynamicForm.enableForm();
        this.wdDynamicForm.clear();
        this.isShowClear = false;
        this.clearData.emit(this.dataSource.widgetType);
    }

    public isValid(): boolean {
        return this.wdDynamicForm.validateBeforeSave();
    }

    public getDataSaveFunc(): any {
        return this.wdDynamicForm.getDataSave(true);
    }

    public onDataChanged(event: any) {
        const isEmpty = this.wdDynamicForm.isAllDisplayFieldsEmpty();
        if (isEmpty && this.isShowClear) this.clearFormData();
    }
}
