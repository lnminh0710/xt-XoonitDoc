import {
    Component, Input, Output, EventEmitter, OnInit, OnDestroy,
    AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef
} from "@angular/core";

import {
    WidgetDetail,
    IDragDropCommunicationData,
    DragMode,
    LayoutPageInfoModel
} from '@app/models';

import { TranslateModeEnum, TranslateDataTypeEnum } from '@app/app.constants';
import { UUID } from 'angular2-uuid';
import { GlobalSettingService, AppErrorHandler, ModalService, WidgetTemplateSettingService } from '@app/services';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import { WidgetUtils } from '../../utils';
import { LayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription, of } from 'rxjs';
import * as commonReducer from '@app/state-management/store/reducer/xn-common';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { WidgetType } from '@app/models';
import { Uti } from '@app/utilities';
import { XnAgGridComponent } from "@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component";
import { map } from "rxjs/operators";

@Component({
    selector: 'widget-translation',
    templateUrl: './widget-translation.component.html',
    styleUrls: ['./widget-translation.component.scss']
})
export class WidgetTranslationComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {

    public isFormChanged = false;
    private layoutPageInfo: LayoutPageInfoModel[];
    private layoutPageInfoModelStateSubscription: Subscription;
    private getOriginalValueSubscription: Subscription;
    public originalValue: string;
    public originalField: string;
    private isConnectedTargetWidget: boolean;

    @ViewChild('translateTextGrid') public xnAgGridComponent: XnAgGridComponent;

    // Default : Readonly Mode
    @Input() editMode: boolean = false;
    @Input() globalProperties: any = {};
    @Input() gridStyle: any = {};
    @Input() translateTextGridId: string;

    // Default : Disable
    @Input() enableLanguageSelectionMode: boolean = false;

    @Input() set resizeInfo(resizeInfo: string) {
        if (this.xnAgGridComponent) {
            this.xnAgGridComponent.sizeColumnsToFit();
        }
    }

    @Output() updateTranslationWidget = new EventEmitter<IDragDropCommunicationData>();
    @Output() editingTranslateData = new EventEmitter<boolean>();
    @Output() startEditField = new EventEmitter<boolean>();
    @Output() cancelEdit = new EventEmitter<boolean>();
    @Output() isCompletedRender: EventEmitter<any> = new EventEmitter();

    private _translateCommunicationData: IDragDropCommunicationData;
    @Input() set translateCommunicationData(data: IDragDropCommunicationData) {
        if (data) {
            this._translateCommunicationData = cloneDeep(data);
            this.loadData();
        }
    }

    get translateCommunicationData() {
        return this._translateCommunicationData;
    }

    // If true , this form is displaying on Widget
    private _isActivated: boolean;
    @Input() set isActivated(status: boolean) {
        this._isActivated = status;
        if (!status) {
            this.ref.detach();
        }
        else {
            this.ref.reattach();
        }
    };

    get isActivated() {
        return this._isActivated;
    }

    public applyFor: TranslateModeEnum = TranslateModeEnum.All;

    public gridData: any = {
        data: [],
        columns: this.initColumnSetting()
    }

    public guid = UUID.UUID();
    public translateDataType = TranslateDataTypeEnum.Data;

    private gridDataModeAll: any = {
        data: [],
        columns: []
    };

    private gridDataModeWidgetOnly: any = {
        data: [],
        columns: []
    };

    private layoutPageInfoModelState: Observable<LayoutPageInfoModel[]>;

    constructor(private store: Store<AppState>,
        private _eref: ElementRef,
        private globalSettingService: GlobalSettingService,
        private appErrorHandler: AppErrorHandler,
        private widgetTemplateSettingService: WidgetTemplateSettingService,
        protected router: Router,
        private ref: ChangeDetectorRef
    ) {
        super(router);

        this.layoutPageInfoModelState = store.select(state => commonReducer.getCommonState(state, this.ofModule.moduleNameTrim).layoutPageInfo);
    }

    /**
     * loadData
     */
    private loadData() {
        this.reset();
        if (this._translateCommunicationData && this.layoutPageInfo && this.layoutPageInfo.length) {
            for (const item of this.layoutPageInfo) {
                for (const widgetBox of item.widgetboxesTitle) {
                    if (widgetBox.widgetDetail.id == this.translateCommunicationData.srcWidgetDetail.id) {
                        this.isConnectedTargetWidget = true;
                        // service for translate grid data
                        if (this._translateCommunicationData.srcWidgetDetail['gridSelectedRow']) {
                            widgetBox.widgetDetail['gridSelectedRow'] = this._translateCommunicationData.srcWidgetDetail['gridSelectedRow'];
                        }
                        this._translateCommunicationData.srcWidgetDetail = cloneDeep(widgetBox.widgetDetail);
                        break;
                    }
                }
            }

            if (this.isConnectedTargetWidget) {
                let srcWidgetDetail = this._translateCommunicationData.srcWidgetDetail;
                const listenKeyRequest = srcWidgetDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim);
                const valid = this.checkProperties(listenKeyRequest);
                if (valid) {
                    this.getOriginalValueSubscription = this.getOriginalValue().subscribe((data: any) => {
                        if (data) {
                            this.originalValue = data.value.orgValue;
                            this.originalField = data.value.orgField;
                            this.getDataTranslateFromService();
                            this.updateTranslationWidget.emit(this._translateCommunicationData);
                        }
                    });
                }
                else {
                    this.isConnectedTargetWidget = false;
                }
            }
        }
    }

    /**
     * reset
     */
    private reset() {
        this.isConnectedTargetWidget = false;
        this.originalValue = '';
        this.isFormChanged = false;
        this.editMode = false;
        this.resetGridData();
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
        this.layoutPageInfoModelStateSubscription = this.layoutPageInfoModelState.subscribe((layoutInfoState: LayoutPageInfoModel[]) => {
            this.appErrorHandler.executeAction(() => {
                this.layoutPageInfo = layoutInfoState;
                if (!this.isConnectedTargetWidget) {
                    this.loadData();
                }
            });
        });
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }


    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
    }

    /**
     * checkProperties
     * @param obj
     */
    private checkProperties(obj) {
        for (const key in obj) {
            if (obj[key])
                return true;
        }
        return false;
    }

    /**
     * getOriginalValue
     */
    private getOriginalValue(): Observable<any> {
        let srcWidgetDetail = this._translateCommunicationData.srcWidgetDetail;
        const listenKeyRequest = srcWidgetDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim);
        return this.widgetTemplateSettingService.getWidgetDetailByRequestString(srcWidgetDetail, listenKeyRequest, true).pipe(map(
            (result: WidgetDetail) => {
                if (!result) return;
                return this.appErrorHandler.executeAction(() => {
                    const _result = this.filterOriginalValue(result);
                    if (_result) {
                        return of({
                            orgValue: _result.Value,
                            orgField: _result.ColumnName
                        });
                    }
                    else {
                        return of({
                            orgValue: '',
                            orgField: ''
                        });
                    }
                });
            }
        ));
    }

    private filterOriginalValue(data: WidgetDetail): any {
        if (!data || !data.contentDetail) {
            return null;
        }
        switch (data.idRepWidgetType) {
            case WidgetType.FieldSet:
                const fieldSetDataArr: Array<any> = data.contentDetail.data[1];
                const fieldSetTranslateData = fieldSetDataArr.filter(p => p.OriginalColumnName == this.translateCommunicationData.fieldColumn);
                if (fieldSetTranslateData.length) {
                    return fieldSetTranslateData[0];
                }
            case WidgetType.DataGrid:
            case WidgetType.EditableGrid:
            case WidgetType.Combination:
            case WidgetType.TableWithFilter:
                if (!this.translateCommunicationData.srcWidgetDetail['gridSelectedRow'] ||
                    !this.translateCommunicationData.srcWidgetDetail['gridSelectedRow'].length) {
                    return null;
                }
                let result: any = {};
                for (let item in data.contentDetail.columnSettings) {
                    if (item === this.translateCommunicationData.fieldColumn) {
                        result.ColumnName = data.contentDetail.columnSettings[item].ColumnName;
                        break;
                    }
                }
                result.Value = this.getCellValueForTranslation();
                return result;
        }
        return null;
    }

    private getCellValueForTranslation(): string {
        if (!this.translateCommunicationData.srcWidgetDetail['gridSelectedRow'][0][this.translateCommunicationData.fieldColumn]) return '';
        if (typeof this.translateCommunicationData.srcWidgetDetail['gridSelectedRow'][0][this.translateCommunicationData.fieldColumn] === 'object') {
            return this.translateCommunicationData.srcWidgetDetail['gridSelectedRow'][0][this.translateCommunicationData.fieldColumn].value || '';
        }
        return this.translateCommunicationData.srcWidgetDetail['gridSelectedRow'][0][this.translateCommunicationData.fieldColumn].toString();
    }

    /**
     * initColumnSetting
     */
    private initColumnSetting() {
        const colSetting = [
            {
                title: 'IdTranslateLabelText',
                data: 'IdTranslateLabelText',
                setting: {
                    DataType: 'nvarchar',
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1'
                            }
                        }
                    ]
                }
            },
            {
                title: 'IdRepLanguage',
                data: 'IdRepLanguage',
                setting: {
                    DataType: 'nvarchar',
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1'
                            }
                        }
                    ]
                }
            },
            {
                title: 'Mode',
                data: 'Mode',
                setting: {
                    DataType: 'nvarchar',
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1'
                            }
                        }
                    ]
                }
            },
            {
                title: 'Language Name',
                data: 'LanguageName',
                setting: {
                    DataType: 'nvarchar',
                    Setting: [
                        {
                            DisplayField: {
                                Readonly: '1',
                                AutoSize: '1'
                            }
                        }
                    ]
                }
            },
            {
                title: 'Translate Text',
                data: 'TranslateText',
                setting: {
                    DataType: 'nvarchar',
                    Setting: [
                        {
                            DisplayField: {
                            }
                        }
                    ]
                }
            }
        ];
        return colSetting;
    }

    /**
     * reload
     */
    public reload() {
        this.editMode = false;
        if (!this.translateCommunicationData)
            return;
        this.getDataTranslateFromService();
    }

    /**
     * getDataTranslateFromService
     */
    private getDataTranslateFromService() {
        let originalValue = this.originalValue;
        let widgetCloneID = this.translateCommunicationData.srcWidgetDetail.id;
        let widgetMainID = '' + this.translateCommunicationData.srcWidgetDetail.idRepWidgetApp;
        if (widgetCloneID && widgetMainID) {

            let idTable = this.getIdtableForTranslation();

            this.globalSettingService.getTranslateLabelText(originalValue, widgetMainID, widgetCloneID, this.translateDataType + '', idTable, this.originalField, this.globalSettingService.getFieldTableName(this.originalField, this.translateCommunicationData.srcWidgetDetail))
                .subscribe((response) => {
                    this.appErrorHandler.executeAction(() => {
                        if (response && response.data && response.data.length >= 1) {
                            const dataIndex = 1;
                            if (response.data[dataIndex]) {
                                this.gridData = this.initData(response.data[dataIndex]);
                            }
                            const hasTranslatedTextModeWidgetOnly = !isNil(this.gridDataModeWidgetOnly.data.find((item) =>
                                !isNil(item.IdTranslateLabelText) &&
                                item.IdTranslateLabelText > 0));
                            if (hasTranslatedTextModeWidgetOnly) {
                                this.applyFor = TranslateModeEnum.WidgetOnly;
                                this.gridData = cloneDeep(this.gridDataModeWidgetOnly);
                            } else {
                                this.applyFor = TranslateModeEnum.All;
                                this.gridData = cloneDeep(this.gridDataModeAll);
                            }

                            if (this.xnAgGridComponent) {
                                this.xnAgGridComponent.refresh();
                            }

                            setTimeout(() => {
                                this.isCompletedRender.emit(true);
                            });
                        }
                    });
                })
        }
        else {
            this.resetGridData();
        }
    }

    private getIdtableForTranslation(): any {
        switch (this.translateCommunicationData.srcWidgetDetail.idRepWidgetType) {
            case WidgetType.FieldSet:
                if (this.translateCommunicationData.srcWidgetDetail.widgetDataType) {
                    const listenKeyRequest = this.translateCommunicationData.srcWidgetDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim);
                    if (listenKeyRequest) {
                        if (this.translateCommunicationData.srcWidgetDetail.widgetDataType.listenKey.main) {
                            const key = this.translateCommunicationData.srcWidgetDetail.widgetDataType.listenKey.main[0].key;
                            return listenKeyRequest[key];
                        }
                        return listenKeyRequest[Object.keys(listenKeyRequest)[0]];
                    }
                }
                break;
            case WidgetType.DataGrid:
            case WidgetType.EditableGrid:
            case WidgetType.Combination:
            case WidgetType.TableWithFilter:
                if (!this.translateCommunicationData.srcWidgetDetail['gridSelectedRow'] ||
                    !this.translateCommunicationData.srcWidgetDetail['gridSelectedRow'].length ||
                    !this.translateCommunicationData.srcWidgetDetail['gridSelectedRow'][0][this.translateCommunicationData.fieldColumn]) {
                    return null;
                }
                return this.translateCommunicationData.srcWidgetDetail['gridSelectedRow'][0][this.translateCommunicationData.srcWidgetDetail.widgetDataType.primaryKey.split(',')[0]] || null;
        }
        return null;
    }

    /**
     * resetGridData
     */
    private resetGridData() {
        if (this.gridDataModeAll) {
            this.gridDataModeAll.data = [];
        }
        if (this.gridDataModeWidgetOnly) {
            this.gridDataModeWidgetOnly.data = [];
        }

        if (!this.gridData) {
            this.gridData = {
                data: [],
                columns: this.initColumnSetting()
            }
        }
        else {
            this.gridData.data = [];
        }
    }

    /**
     * initData
     * @param data
     */
    private initData(data) {
        this.gridDataModeAll.data = [];
        this.gridDataModeWidgetOnly.data = [];
        (data as Array<any>).forEach((item) => {
            this.gridDataModeAll.data.push({
                IdTranslateLabelText: item.AllIdTranslateLabelText,
                IdRepLanguage: item.IdRepLanguage,
                LanguageName: item.DefaultValue,
                TranslateText: item.AllTranslateText,
                Mode: TranslateModeEnum.All
            });
            this.gridDataModeWidgetOnly.data.push({
                IdTranslateLabelText: item.OnlyThisWidgetIdTranslateLabelText,
                IdRepLanguage: item.IdRepLanguage,
                LanguageName: item.DefaultValue,
                TranslateText: item.OnlyThisWidgetTranslateText,
                Mode: TranslateModeEnum.WidgetOnly
            });
        });
        const cols = this.initColumnSetting();
        this.gridDataModeAll.columns = cols;
        this.gridDataModeWidgetOnly.columns = cols;
        return cloneDeep(this.applyFor === TranslateModeEnum.All ? this.gridDataModeAll : this.gridDataModeWidgetOnly);
    }

    /**
     * changeTranslateMode
     */
    changeTranslateMode() {
        switch (this.applyFor) {
            case TranslateModeEnum.All:
                this.gridData = cloneDeep(this.gridDataModeAll);
                break;
            case TranslateModeEnum.WidgetOnly:
                this.gridData = cloneDeep(this.gridDataModeWidgetOnly);
                break;
        }
    }

    /**
     * onTableEditStart
     * @param eventData
     */
    public onTableEditStart(eventData) {
        this.editMode = true;
        this.startEditField.emit(true);
    }

    /**
     * onTableEditEnd
     * @param eventData
     */
    public onTableEditEnd(eventData) {
        if (!this.isFormChanged) {
            this.editMode = false;
            this.cancelEdit.emit(true);
        }
    }

    /**
     * onTableEditSuccess
     * @param eventData
     */
    public onTableEditSuccess(eventData) {
        this.isFormChanged = true;
        this.editMode = true;
        this.editingTranslateData.emit(true);
    }

    /**
     * prepareDataFroSaving
     */
    private prepareDataFroSaving(): any {
        const result = [];
        const items: Array<any> = this.xnAgGridComponent ? this.xnAgGridComponent.itemsEdited : [];
        let editData = cloneDeep(items);
        (editData as Array<any>).forEach((item) => {
            const isDeleted = isEmpty(item.TranslateText);
            if (!(isDeleted && !item.IdTranslateLabelText)) {
                const isModeAll = item.Mode === TranslateModeEnum.All;
                const widgetCloneID = this.translateCommunicationData.srcWidgetDetail.id;
                const widgetMainID = '' + this.translateCommunicationData.srcWidgetDetail.idRepWidgetApp;
                const originalValue = this.originalValue;

                let idTable = this.getIdtableForTranslation();

                result.push({
                    'IdTranslateLabelText': item.IdTranslateLabelText > 0 ? item.IdTranslateLabelText : null,
                    'IdRepTranslateModuleType': this.translateDataType,
                    'IdRepLanguage': item.IdRepLanguage,
                    'TableName': this.globalSettingService.getFieldTableName(this.originalField, this.translateCommunicationData.srcWidgetDetail),
                    'WidgetMainID': isModeAll ? null : widgetMainID,
                    'WidgetCloneID': isModeAll ? null : widgetCloneID,
                    'OriginalText': originalValue,
                    'TranslatedText': item.TranslateText,
                    'IsDeleted': isDeleted ? '1' : null,
                    'IdTable': idTable,
                    'FieldName': this.originalField
                });
            }
        });

        return { 'Translations': result };
    }

    /**
     * submit
     */
    public submit(callback?: any) {
        const saveData = this.prepareDataFroSaving();
        if (!saveData || !saveData.Translations || !saveData.Translations.length) {
            this.isFormChanged = false;
            this.editMode = false;
            if (callback) {
                callback();
            }
            return;
        }
        this.globalSettingService.saveTranslateLabelText(saveData).subscribe(
            (response) => {
                this.appErrorHandler.executeAction(() => {
                    if (response && response.eventType === 'Successfully') {
                        this.saveSuccessCallBack();
                        if (callback) {
                            callback();
                        }
                    }
                });
            }
        );
    }

    /**
     * saveSuccessCallBack
     */
    private saveSuccessCallBack() {
        this.isFormChanged = false;
        this.editMode = false;
        this.reload();
    }
}
