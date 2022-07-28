import { Component, Input, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { FormTableDefinition, FormTableSettingColumnName } from '@app/models/common/form-table-definition.model';
import { DataGrid } from '../../../models/common/data-grid.model';
import { Uti } from '../../../utilities/uti';
import { DatatableService } from '../../../services';
import { XnAgGridComponent } from '../../../shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

@Component({
    selector: 'dynamic-form-table',
    templateUrl: 'dynamic-form-table.component.html',
    styleUrls: ['dynamic-form-table.component.scss']
})
export class DynamicFormTableComponent implements OnInit {

    public gridData: DataGrid;
    public enterDirection;
    public height: number;
    public showAddButton: boolean;

    private _formDefinition: FormTableDefinition;
    @Input() set formDefinition(data: FormTableDefinition) {
        this._formDefinition = data;
        this.showAddButton = data?.groupSetting?.addModule == '1' ? true : false;
        this.buildGridData(data);
    }

    get formDefinition() {
        return this._formDefinition;
    }

    @Input() showTitle = true;
    constructor(private dataTableService: DatatableService) { }

    @ViewChild(XnAgGridComponent) widgetAgGridComponent: XnAgGridComponent;

    ngOnInit() { }

    private buildGridData(tableDef: FormTableDefinition) {
        if (!tableDef.columns || !tableDef.columns.length) return;

        this.enterDirection = this.getEnterDirection(tableDef.columns[0].SettingColumnName[0]);
        this.gridData = {
            id: Uti.guid(),
            data: this.dataTableService.buildEditableDataSourceV2(
                tableDef.data,
                tableDef.columns[0].SettingColumnName,
                tableDef.columns[0].SettingColumnName[0]?.WidgetSetting?.WidgetTitle
            ),
            title: tableDef.columns[0].SettingColumnName[0]?.WidgetSetting?.WidgetTitle
        }
        this.height = (this.gridData?.data?.data?.length * 28) + 37;
    }

    private getEnterDirection(settingColumnName: FormTableSettingColumnName): boolean {
        try {
            // Default is true, if service don't return value so that is default
            // If service return 0 that is false
            return (settingColumnName.TableDirectionSetting.EnterDirection !== 0);
        } catch (e) {
            return true;
        }
    }

    public addNewRow(grid: XnAgGridComponent) {
        if (grid) {
            grid.addNewRow();
            const rowCount = grid.api.getDisplayedRowCount();
            this.height = (rowCount * 28) + 37;
        }
    }

}
