import {
    Component, Input, Output, EventEmitter, OnInit, OnDestroy,
    AfterViewInit, ElementRef, ViewChild
} from "@angular/core";

import {
    WidgetDetail,
    IDragDropCommunicationData,
    DragMode,
    LayoutPageInfoModel,
    ApiResultResponse
} from '@app/models';

import { TranslateModeEnum, TranslateDataTypeEnum } from '@app/app.constants';
import { UUID } from 'angular2-uuid';
import {
    GlobalSettingService, AppErrorHandler,
    ModalService, WidgetTemplateSettingService, ArticleService
} from '@app/services';
import isNil from 'lodash-es/isNil';
import cloneDeep from 'lodash-es/cloneDeep';
import isEmpty from 'lodash-es/isEmpty';
//import { WijmoGridComponent } from '@app/shared/components/wijmo';
import { WidgetUtils } from '../../utils';
import { LayoutInfoState } from '@app/state-management/store/reducer/layout-info';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import { Uti } from '@app/utilities';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';

@Component({
    selector: 'widget-article-translation',
    templateUrl: './widget-article-translation.component.html',
    styleUrls: ['./widget-article-translation.component.scss']
})
export class WidgetArticleTranslationComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {

    public isTableEdited = false;
    public originalValue: string;

    //@ViewChild('translateTextGrid') public wijmoGridComponent: WijmoGridComponent;

    // Default : Readonly Mode
    @Input() editMode: boolean = false;

    // Default : Disable
    @Input() enableLanguageSelectionMode: boolean = false;

    @Input() set resizeInfo(resizeInfo: string) {
        //if (this.wijmoGridComponent) {
        //    this.wijmoGridComponent.turnOnStarResizeMode();
        //}
    }

    private _idArticle;
    private widgetDetail: WidgetDetail;
    private originalField: string = 'ArticleNameShort';
    private tableName: string = 'B00ArticleName';

    @Input()
    set data(widgetDetail: WidgetDetail) {
        if (widgetDetail && widgetDetail.widgetDataType &&
            widgetDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim)) {
            this.widgetDetail = widgetDetail;
            this.idArticle = widgetDetail.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim)['IdArticle'];
            //this.loadData();
        }
    }

    @Input()
    set idArticle(id) {
        this._idArticle = id;
        this.loadData();
    }

    get idArticle() {
        return this._idArticle;
    }

    @Input()
    translatedDataGrid: any;

    @Output()
    updateTranslationWidget = new EventEmitter<IDragDropCommunicationData>();

    @Output()
    editingTranslateData = new EventEmitter<boolean>();

    @Output()
    startEditField = new EventEmitter<boolean>();

    @Output()
    cancelEdit = new EventEmitter<boolean>();

    @Output()
    onEdittedTranslateData = new EventEmitter<any>();

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

    constructor(private store: Store<AppState>,
        private _eref: ElementRef,
        private globalSettingService: GlobalSettingService,
        private appErrorHandler: AppErrorHandler,
        private widgetTemplateSettingService: WidgetTemplateSettingService,
        private articleService: ArticleService,
        protected router: Router) {
        super(router);
        this.loadData();
    }

    /**
     * loadData
     */
    private loadData() {
        this.reset();
        if (this.idArticle) {
            this.getOriginalValue().then((data: any) => {
                this.originalValue = data.orgValue;
                if (data.orgValue) {
                    this.getDataTranslateFromService();
                }
            });
        }
    }

    /**
     * reset
     */
    private reset() {
        this.originalValue = '';
        this.resetGridData();
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {

    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {

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
    private getOriginalValue() {
        return new Promise<any>((resolve, reject) => {
            this.articleService.getArticleById(this.idArticle, '-1').subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    let orgValue = '';
                    if (Uti.isResquestSuccess(response)) {
                        const item = response.item;
                        if (item && item.articleNameShort) {
                            orgValue = item.articleNameShort.value
                        }
                    }
                    resolve({
                        orgValue: orgValue
                    });
                })
            });
        });
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
        //if (!this.translateCommunicationData)
        //    return;
        this.getDataTranslateFromService();
    }

    /**
     * getDataTranslateFromService
     */
    private getDataTranslateFromService() {
        let originalValue = this.originalValue;
        //let widgetCloneID = this.widgetDetail.id;
        //let widgetMainID = '' + this.widgetDetail.idRepWidgetApp;
        if (originalValue) {
            this.globalSettingService.getTranslateLabelText(originalValue, '', '', this.translateDataType + '', this.idArticle, this.originalField, this.tableName).subscribe(
                (response) => {
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

                            //if (this.wijmoGridComponent) {
                            //    this.wijmoGridComponent.refresh();
                            //}
                        }
                    });
                })
        }
        else {
            this.resetGridData();
        }
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
            let allTranslateText = item.AllTranslateText;
            let onlyThisWidgetTranslateText = item.OnlyThisWidgetTranslateText;
            if (this.translatedDataGrid && this.translatedDataGrid.data &&
                this.translatedDataGrid.data.length) {
                const translatedItem = this.translatedDataGrid.data.find(p => p.IdRepLanguage == item.IdRepLanguage);
                if (translatedItem) {
                    allTranslateText = translatedItem.ArticleNameShort;
                    onlyThisWidgetTranslateText = translatedItem.ArticleNameShort;
                }
            }
            this.gridDataModeAll.data.push({
                IdTranslateLabelText: item.AllIdTranslateLabelText,
                IdRepLanguage: item.IdRepLanguage,
                LanguageName: item.DefaultValue,
                TranslateText: allTranslateText,
                Mode: TranslateModeEnum.All
            });
            this.gridDataModeWidgetOnly.data.push({
                IdTranslateLabelText: item.OnlyThisWidgetIdTranslateLabelText,
                IdRepLanguage: item.IdRepLanguage,
                LanguageName: item.DefaultValue,
                TranslateText: onlyThisWidgetTranslateText,
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
        if (!this.isTableEdited) {
            this.editMode = false;
            this.cancelEdit.emit(true);
        }
    }

    /**
     * onTableEditSuccess
     * @param eventData
     */
    public onTableEditSuccess(eventData) {
        this.isTableEdited = true;
        this.editMode = true;
        this.editingTranslateData.emit(true);
    }

    /**
     * getItemsEdited
     */
    public getItemsEdited() {
        //if (this.wijmoGridComponent) {
        //    return this.wijmoGridComponent.flex.itemsSource.itemsEdited;
        //}
        return null;
    }

    /**
     * prepareDataForSaving
     */
    private prepareDataForSaving(): any {
        const result = [];
        const items: Array<any> = [];// this.wijmoGridComponent && this.wijmoGridComponent.flex.itemsSource.itemsEdited;
        let editData = cloneDeep(items);
        (editData as Array<any>).forEach((item) => {
            const isDeleted = isEmpty(item.TranslateText);
            if (!(isDeleted && !item.IdTranslateLabelText)) {
                // const isModeAll = item.Mode === TranslateModeEnum.All;
                // const widgetCloneID = this.widgetDetail.id;
                // const widgetMainID = '' + this.widgetDetail.idRepWidgetApp;
                const originalValue = this.originalValue;
                let idTable = this.idArticle;
                result.push({
                    'IdTranslateLabelText': item.IdTranslateLabelText > 0 ? item.IdTranslateLabelText : null,
                    'IdRepTranslateModuleType': this.translateDataType,
                    'IdRepLanguage': item.IdRepLanguage,
                    'WidgetMainID': null,
                    'WidgetCloneID': null,
                    'OriginalText': originalValue,
                    'TranslatedText': item.TranslateText,
                    'IsDeleted': isDeleted ? '1' : null,
                    'IdTable': idTable,
                    'FieldName': this.originalField,
                    'TableName': this.tableName
                });
            }
        });

        return { 'Translations': result };
    }

    /**
     * submit
     */
    public submit(callback?: any) {
        const saveData = this.prepareDataForSaving();
        if (!saveData || !saveData.Translations || !saveData.Translations.length) {
            this.isTableEdited = false;
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
        this.isTableEdited = false;
        this.editMode = false;
        this.reload();
    }
}
