import { Component, Output, EventEmitter, ChangeDetectorRef, Input, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { DatatableService, PersonService, AppErrorHandler } from '@app/services';

import { CommunicationModel, CommunicationTypeModel, FormModel } from '@app/models';
import isString from 'lodash-es/isString';
import isNil from 'lodash-es/isNil';
import { Subscription } from 'rxjs';
import { Uti } from '@app/utilities';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { ColHeaderKey } from '@app/shared/components/xn-control/xn-ag-grid/shared/ag-grid-constant';

@Component({
    selector: 'xn-communication-table',
    styleUrls: ['./xn-communication-table.component.scss'],
    templateUrl: './xn-communication-table.component.html'
})
export class XnCommunicationTableComponent implements OnInit, OnDestroy {
    public communications: CommunicationModel[];
    public dataSourceTable = { data: [], columns: [] };
    private _hasError = false;

    @ViewChild(XnAgGridComponent)
    public xnAgGridComponent: XnAgGridComponent;

    @Output()
    outputData = new EventEmitter<any>();

    @Output()
    onHasError = new EventEmitter<boolean>();

    @Input()
    isWidgetInfo = false;

    @Input() gridId: string;

    @Input() set transferTranslate(data: any) {
        Uti.rebuildColumnHeaderForGrid(this.dataSourceTable, data);
    }

    @Input() set data(data: any) {
        this.buildDatatable(data);
        if (data && data.length) {
            setTimeout(() => {
                this.emitOutputData();
            });
            return;
        }
        this.emitOutputData();
    }

    constructor(
        private datatableService: DatatableService,
        private personService: PersonService,
        private appErrorHandler: AppErrorHandler) {
    }

    public ngOnInit() {
        this.loadCommunicationColumnSetting();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public autoSizeColumns() {
        // if (this.xnAgGridComponent)
        //     this.xnAgGridComponent.turnOnStarResizeMode();
    }

    private loadCommunicationColumnSetting() {
        this.personService.loadCommunication('0').subscribe((response) => {
            this.appErrorHandler.executeAction(() => {
                const tempDataSource = this.datatableService.buildEditableDataSource(response.data);
                this.dataSourceTable = {
                    data: this.dataSourceTable.data,
                    columns: tempDataSource.columns
                };
            });
        });
    }

    private buildDatatable(data?: any) {
        if (!this.dataSourceTable || !this.dataSourceTable.columns || !this.dataSourceTable.columns.length) return;
        this.dataSourceTable = {
            data: data,
            columns: this.dataSourceTable.columns
        };
    }

    public onTableEditSuccess(eventData) {
        setTimeout(() => {
            this.emitOutputData(true);
        });
    }

    public onDeletedRowsSuccess(event) {
        if (event) {
            setTimeout(() => {
                this.emitOutputData(true);
                this.xnAgGridComponent.isMarkedAsDelete = false;
            });
        }
    }

    private emitOutputData(isDirty?: boolean) {
        if (!this.getAddedData().length) return;

        if (this.isWidgetInfo)
            this.outputData.emit(this.buildOutputDataForDataEntryWidget(isDirty));
        else
            this.outputData.emit(this.mapToSaveData());
    }

    private buildOutputDataForDataEntryWidget(isDirty?: boolean) {
        return new FormModel({
            formValue: this.getAddedData(),
            mappedData: this.mapToSaveData(),
            isValid: !this._hasError,
            isDirty: isDirty
        })
    }

    private mapToSaveData(): any {
        return this.getAddedData().map(x => {
            if (!(!x.IdSharingCommunication && x.deleted)) {
                return {
                    CommunicationType: !isString(x.IdRepCommunicationType) ?
                        x.IdRepCommunicationType.key :
                        JSON.parse(x.IdRepCommunicationType).key,
                    CommunicationValue: x.CommValue1,
                    CommunicationNote: x.Notes || x.CommNotes,
                    IdSharingCommunication: x.IdSharingCommunication || null,
                    IsDeleted: x.IsDeleted ? '1' : null
                }
            }
        });
    }

    private getAddedData(): Array<any> {
        if (!this.xnAgGridComponent) return [];
        const updatedItems = this.xnAgGridComponent.getEditedItems();
        if (!updatedItems) return [];
        const addedItem = updatedItems.itemsAdded.filter(x => x.DT_RowId.indexOf('newrow') > -1 && !x.IsDeleted && !x[ColHeaderKey.Delete]);
        const editedItem = updatedItems.itemsEdited.filter(x => (!x.DT_RowId || x.DT_RowId.indexOf('newrow') < 0) && !x.IsDeleted && !x[ColHeaderKey.Delete]);
        const deletedItem = updatedItems.itemsRemoved.filter(x => (!x.DT_RowId || x.DT_RowId.indexOf('newrow') < 0));
        return [...addedItem, ...editedItem, ...deletedItem];
    }

    public hasValidationError(event) {
        this.onHasError.emit(event);
        this._hasError = event;
    }

    public onRowMarkedAsDeleteHandler(eventData) {
        if (!isNil(eventData)) {
            if (this.xnAgGridComponent) {
                if (!eventData.showCommandButtons) {
                    this.xnAgGridComponent.isMarkedAsDelete = false;
                } else {
                    this.xnAgGridComponent.isMarkedAsDelete = !eventData.disabledDeleteButton
                }
            }
        }
    }

}
