import {
    Component, Input, Output, EventEmitter, OnInit, OnDestroy
} from '@angular/core';
import { Uti } from '@app/utilities/uti';
import { Subscription } from 'rxjs';
import {
    DatatableService,
    RuleService,
    AppErrorHandler
} from '@app/services';
import isEmpty from 'lodash-es/isEmpty';

@Component({
    selector: 'widget-profile-select',
    styleUrls: ['./widget-profile-select.component.scss'],
    templateUrl: './widget-profile-select.component.html'
})
export class WidgetProfileSelectComponent implements OnInit, OnDestroy {
    public dataSourceTable: any;
    public showDialog = false;
    private data: any;

    private selectedRow: any;
    private getProfileSubscription: Subscription;

    @Input() profileGridId: string;
    @Input() globalProperties: any[] = [];

    @Output() selectedData: EventEmitter<any> = new EventEmitter();

    constructor(
        private datatableService: DatatableService,
        private appErrorHandler: AppErrorHandler,
        private ruleService: RuleService
    ) {
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public onDeleteColumnClickHandler($event: any) {
        const deleteData = [
            {
                "IsDeleted": "1",
                "IdSelectionWidgetTemplate": $event.IdSelectionWidgetTemplate
            }
        ];
        this.getProfileSubscription = this.ruleService.saveBlackListProfile(deleteData)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response)) {                        
                        return;
                    }

                    this.getProfile(this.data.idSelectionWidget);
                });
            });
    }

    public open(data?: any) {
        this.showDialog = true;
        this.data = data;
        this.getProfile(data.idSelectionWidget)
    }

    public close() {
        this.showDialog = false;
    }

    public customerTableRowClick(data) {
        this.selectedRow = this.dataSourceTable.data.find(x => x.DT_RowId === Uti.getValueFromArrayByKey(data, 'DT_RowId'));
    }

    public onRowDoubleClick(data) {
        this.selectedRow = data;
        this.onSelect();
    }

    public onSelect() {
        if (isEmpty(this.selectedRow) || !this.selectedRow || !this.selectedRow.Description) {
            return;
        }
        this.selectedData.emit(this.selectedRow);
        this.close();
    }

    public onCancel() {
        this.close();
    }

    private getProfile(idSelectionWidget: any) {
        this.getProfileSubscription = this.ruleService.getTemplate(idSelectionWidget)
            .subscribe((response: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response)) {
                        return;
                    }
                    response = this.datatableService.formatDataTableFromRawData(response.item);
                    response = this.datatableService.buildDataSource(response);
                    response.columns.push({
                        title: '',
                        data: 'Delete',
                        visible: true,
                        readOnly: true
                    });
                    this.dataSourceTable = response;
                });
            });
    }
}
