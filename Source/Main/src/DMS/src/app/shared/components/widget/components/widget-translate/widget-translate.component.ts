import { WidgetTranslateFakeDate } from './widget-translate-fake-data';
import { Uti } from '@app/utilities';
import { WidgetType } from '@app/models';
import {
    Component, OnInit, Input, Output, OnChanges, SimpleChanges,
    EventEmitter, ViewChild, OnDestroy, ElementRef
} from '@angular/core';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { GlobalSettingService, AppErrorHandler, ModalService } from '@app/services';
import { TranslateModeEnum, TranslateDataTypeEnum } from '@app/app.constants';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import { Subscription } from 'rxjs';
import { Configuration } from '@app/app.constants';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';

@Component({
    selector: 'widget-translate',
    styleUrls: ['./widget-translate.component.scss'],
    templateUrl: './widget-translate.component.html'
})
export class WidgetTranslateComponent extends BaseComponent implements OnInit, OnDestroy {
    private perfectScrollbarConfig: any = {};
    private tempDataEditing = [];
    private editingId: any;
    public editingText = '';
    private itemDirty = false;
    private callbackAfterSubmiting: any;
    public translateDataType = TranslateDataTypeEnum.Label;
    private fieldName = '';
    private currentItemHeight = 31;
    private classContainerClass = '.container-left-content';
    private widgetDataLocal: any;
    public translateData: any;

    public gridData: any = {
        data: [],
        columns: this.initColumnSetting()
    }
    public applyFor: TranslateModeEnum = TranslateModeEnum.All;
    private currentTranslateMode: TranslateModeEnum = TranslateModeEnum.All;
    // private labelData: any;
    private widgetMainID: string;
    private widgetCloneID: string
    private gridDataModeAll: any = {
        data: [],
        columns: []
    };
    private gridDataModeWidgetOnly: any = {
        data: [],
        columns: []
    };
    private editedData: any = [];
    private isSupportedTranslateValue = false;

    @Input() translateTextGridId: string;
    @Input() enableApplyFor: boolean = true;

    @Input() set widgetData(data: any) {
        this.widgetDataLocal = data;

        if (data && data.idRepWidgetApp && data.id) {
            this.widgetMainID = data.idRepWidgetApp;
            this.widgetCloneID = data.id;
        }
        if (data && data.widgetDataType
            && data.widgetDataType.filterKey
            && data.widgetDataType.listenKeyRequest) {
            this.tableId = data.widgetDataType.listenKeyRequest[data.widgetDataType.filterKey];
        }

        this.isSupportedTranslateValue = data && (data.idRepWidgetType === WidgetType.FieldSet ||
            data.idRepWidgetType === WidgetType.FieldSetReadonly ||
            data.idRepWidgetType === WidgetType.Combination ||
            data.idRepWidgetType === WidgetType.CombinationCreditCard)
    }
    @Input() set data(data: any) {
        this.translateData = data;

        for (let i = 0; i < data.length; i++) {
            if (data[i].isActive) {
                this.translateTextClicked(data[i].id, data[i].text, 1, data[i]);
                return;
            }
        }
    }
    @Input() isTranslateDataTextOnly = false;
    @Input() set keyword(_keyword) {
        if (_keyword) {
            this.editingText = _keyword;
            this.translateDataType = TranslateDataTypeEnum.Data;
            // set field name for widget title that is fixed.
            this.fieldName = this.configuration.widgetTitleTranslateFieldName;
            this.getDataTranslateFromService();
        }
    }
    @Input() tableId = null;

    @Output() outputData = new EventEmitter<any>();
    @Output() saveData = new EventEmitter<any>();
    @Output() resetWidgetTranslation = new EventEmitter<any>();

    @ViewChild('translateTextGrid') gridComponent: XnAgGridComponent;

    constructor(private _eref: ElementRef,
        private modalService: ModalService,
        private toasterService: ToasterService,
        private appErrorHandler: AppErrorHandler,
        private configuration: Configuration,
        private globalSettingService: GlobalSettingService,
        protected router: Router
    ) {
        super(router);
    }

    public ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        }
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public submit(saveOnly?: boolean, thenCloseCb?: any) {
        const saveData = this.prepareDataFroSaving();
        if (!saveData || !saveData.Translations || !saveData.Translations.length) {
            this.itemDirty = false;
            if (thenCloseCb) {
                thenCloseCb();
            } else {
                this.callClickNextItem();
            }
            return;
        }

        this.globalSettingService.saveTranslateLabelText(saveData).subscribe(
            (response) => {
                this.appErrorHandler.executeAction(() => {
                    if (response && response.eventType === 'Successfully') {
                        this.saveCallBack(saveOnly, thenCloseCb);
                    }
                });
            }
        );
    }

    resized() {
        if (this.gridComponent)
            this.gridComponent.refresh();
    }

    private saveCallBack(saveOnly?: boolean, thenCloseCb?: any) {
        // after save sucess call to reset form dirty
        this.itemDirty = false;
        this.saveData.emit();
        // show save sucess message
        this.toasterService.pop('success', 'Success', 'Translation text saved successfully');
        if (!saveOnly) {
            // after save sucess call move next item
            this.callClickNextItem();
        } else if (thenCloseCb) {
            thenCloseCb();
        }
        this.editedData = [];

        if (this.callbackAfterSubmiting) {
            this.callbackAfterSubmiting();
            this.callbackAfterSubmiting = null;
        }
    }

    prepareDataFroSaving(): any {
        const result = [];
        const isCurrentModeAll = this.applyFor === TranslateModeEnum.All;
        let editData = cloneDeep(this.editedData);
        if (isCurrentModeAll) {
            editData = this.mergeUniqueRecords(editData, this.gridDataModeWidgetOnly.data);
        }
        (editData as Array<any>).forEach((item) => {
            const isDeleted = isEmpty(item.TranslateText);
            if (!(isDeleted &&
                (isNil(item.IdTranslateLabelText) ||
                    item.IdTranslateLabelText <= 0))) {
                const isModeAll = item.Mode === TranslateModeEnum.All;
                if (isModeAll === isCurrentModeAll ||
                    (isCurrentModeAll && item.IdTranslateLabelText > 0)) {
                    result.push({
                        'IdTranslateLabelText': item.IdTranslateLabelText > 0 ? item.IdTranslateLabelText : null,
                        'IdRepTranslateModuleType': this.translateDataType,
                        'IdRepLanguage': item.IdRepLanguage,
                        'TableName': this.globalSettingService.getFieldTableName(this.fieldName, this.widgetDataLocal),
                        'WidgetMainID': isModeAll ? null : this.widgetMainID,
                        'WidgetCloneID': isModeAll ? null : this.widgetCloneID,
                        'OriginalText': this.editingText,
                        'TranslatedText': item.TranslateText,
                        'IsDeleted': isDeleted || (!isModeAll && isCurrentModeAll && item.IdTranslateLabelText > 0) ? '1' : null,
                        'IdTable': this.tableId,
                        'FieldName': this.fieldName
                    });
                }
            }
        });

        return { 'Translations': result };
    }

    private translateTextClicked(textId: any, text: any, translateDataType?: TranslateDataTypeEnum, item?: any) {
        setTimeout(() => {
            if (this.editingId === textId && text === this.editingText && translateDataType === this.translateDataType)
                return;
            if (this.itemDirty) {
                this.confirmWhenClose(textId, text);
                return;
            }
            this.editingId = textId;
            this.editingText = text;
            this.translateDataType = translateDataType;
            if (item)
                this.fieldName = item.text;
            this.setActiveForLink();
            this.updateScroll();
            this.getDataTranslateFromService();
        }, 50);
    }

    private callClickNextItem() {
        switch (this.translateDataType) {
            case TranslateDataTypeEnum.Label:
                this.processNextItemForLabelType();
                break;

            case TranslateDataTypeEnum.Data:
                this.processNextItemForDataType();
                break;
        }
    }

    private processNextItemForLabelType() {
        for (let i = 0; i < this.translateData.length; i++) {
            if (this.translateData[i].id === this.editingId) {
                // reach end of data length, must move to first item
                if (i === (this.translateData.length - 1)) {
                    this.translateTextClicked(this.translateData[0].id, this.translateData[0].text, this.translateDataType, this.translateData[0]);
                    return;
                }
                // move next item
                this.translateTextClicked(this.translateData[i + 1].id, this.translateData[i + 1].text, this.translateDataType, this.translateData[i + 1]);
                return;
            }
        }
    }

    private processNextItemForDataType() {
        const filteredData = this.translateData.filter((item) => item.dataType == 'nvarchar' && !isNil(item.value) && item.value != '');
        if (filteredData && filteredData.length) {
            for (let i = 0; i < filteredData.length; i++) {
                if (filteredData[i].id === this.editingId) {
                    // reach end of data length, must move to first item
                    if (i === (filteredData.length - 1)) {
                        this.translateTextClicked(filteredData[0].id, filteredData[0].value, this.translateDataType, filteredData[0]);
                        return;
                    }
                    // move next item
                    this.translateTextClicked(filteredData[i + 1].id, filteredData[i + 1].value, this.translateDataType, filteredData[i + 1]);
                    return;
                }
            }
        }
    }

    private findNextValidItemForDataType(index: number): any {
        if (index < 0 || !this.translateData || !this.translateData.length)
            return null;

        const filteredItem = this.translateData.find((item, _index) => _index > index && item.dataType == 'nvarchar' && !isNil(item.value) && item.value != '');
        if (filteredItem)
            return filteredItem;
        else
            return this.translateData.find((item) => item.dataType == 'nvarchar' && !isNil(item.value) && item.value != '');
    }

    private setActiveForLink() {
        for (const item of this.translateData) {
            item.isActive = (this.editingId === item.id);
        }
    }

    private updateScroll() {
        const currentItem = this.translateData.find(x => x.id === this.editingId);
        if (!currentItem || currentItem.id === undefined) return;
        const currentElement = $(this.classContainerClass + ' #' + currentItem.id);
        const scrollContainer = document.querySelector(this.classContainerClass);
        const scrollContainerOffset = $(this.classContainerClass);
        if (!currentElement.offset() || !scrollContainerOffset.offset()) return;

        if ((currentElement.offset().top - (this.currentItemHeight * 2)) <= scrollContainerOffset.offset().top) {
            if (scrollContainer.scrollTop === 0) return;
            scrollContainer.scrollTop -= scrollContainer.scrollTop;
            setTimeout(() => { this.updateScroll(); }, 50);
        }
        if ((currentElement.offset().top + (this.currentItemHeight * 2)) >= (scrollContainerOffset.offset().top + scrollContainerOffset.height())) {
            const currentScrollTop = scrollContainer.scrollTop;
            scrollContainer.scrollTop += this.currentItemHeight;
            if (currentScrollTop === scrollContainer.scrollTop) return;
            setTimeout(() => { this.updateScroll(); }, 200);
        }
    }

    public onTableEditSuccess($event: any) {
        this.removeEditingData();
        this.addToEditingData();
        this.itemDirty = true;
        this.outputData.emit(true);
        if (this.gridComponent) {
            this.editedData = this.mergeUniqueRecords(this.editedData, [$event]);
        }
    }

    private addToEditingData() {
        this.tempDataEditing.push({
            textId: this.editingId,
            data: this.gridData.data
        });
    }

    private removeEditingData() {
        const currentEditingData: any = {};
        if (!Uti.isExistItemInArray(this.tempDataEditing, this.editingId, 'textId', currentEditingData)) return;
        Uti.removeItemInArray(this.tempDataEditing, currentEditingData.data, 'textId');
    }

    private getDataTranslateFromService() {
        if (this.editingText) {
            this.globalSettingService.getTranslateLabelText(this.editingText,
                this.widgetMainID,
                this.widgetCloneID,
                this.translateDataType + '',
                this.tableId,
                this.fieldName,
                this.globalSettingService.getFieldTableName(this.fieldName, this.widgetDataLocal)
            ).subscribe(
                (response) => {
                    this.appErrorHandler.executeAction(() => {
                        if (response && response.data && response.data.length > 1) {
                            this.currentTranslateMode = this.applyFor;
                            this.gridData = this.initData(response.data[1]);
                            const hasTranslatedTextModeWidgetOnly = !isNil(this.gridDataModeWidgetOnly.data.find((item) =>
                                !isNil(item.IdTranslateLabelText) &&
                                item.IdTranslateLabelText > 0));
                            if (hasTranslatedTextModeWidgetOnly) {
                                this.applyFor = TranslateModeEnum.WidgetOnly;
                                this.currentTranslateMode = TranslateModeEnum.WidgetOnly;
                                this.gridData = cloneDeep(this.gridDataModeWidgetOnly);
                            } else {
                                this.applyFor = TranslateModeEnum.All;
                                this.currentTranslateMode = TranslateModeEnum.All;
                                this.gridData = cloneDeep(this.gridDataModeAll);
                            }

                            if (this.gridComponent)
                                this.gridComponent.refresh();
                        }
                    });
                })
        }
    }

    changeTranslateMode(event) {
        setTimeout(() => {
            if (this.gridData && this.gridData.data && this.gridData.data.length) {
                if (this.currentTranslateMode === TranslateModeEnum.All) {
                    this.gridDataModeAll = cloneDeep(this.gridData);
                } else {
                    this.gridDataModeWidgetOnly = cloneDeep(this.gridData);
                }
                this.currentTranslateMode = this.applyFor;
                let changedData = [];
                if (this.applyFor === TranslateModeEnum.All && this.gridDataModeAll) {
                    changedData = cloneDeep(this.gridDataModeAll);
                } else if (this.applyFor === TranslateModeEnum.WidgetOnly && this.gridDataModeWidgetOnly) {
                    changedData = cloneDeep(this.gridDataModeWidgetOnly);
                }
                this.gridData = changedData;
            } else {
                this.getDataTranslateFromService();
            }
        }, 50);
    }

    changeTranslateDataType(value) {
        if (!this.translateData || !this.translateData.length)
            return;
        const index = this.translateData.findIndex((item) => item.id === this.editingId);
        let filteredItem = this.translateData[index];
        if (filteredItem) {
            if (value === TranslateDataTypeEnum.Label) {
                this.translateTextClicked(filteredItem.id, filteredItem.text, value, filteredItem);
            } else if (value === TranslateDataTypeEnum.Data) {
                if (filteredItem.dataType == 'nvarchar' && !isNil(filteredItem.value) &&
                    filteredItem.value.length) {
                    this.translateTextClicked(filteredItem.id, filteredItem.value, value, filteredItem);
                } else {
                    filteredItem = this.findNextValidItemForDataType(index);
                    if (filteredItem)
                        this.translateTextClicked(filteredItem.id, filteredItem.value, value, filteredItem);
                }
            }
        }
    }

    private mergeUniqueRecords(oldData: any, newData: any): any {
        const filteredOldData = (oldData as Array<any>).filter((item) => {
            return isNil((newData as Array<any>).find((i) => i.IdRepLanguage === item.IdRepLanguage && i.Mode === item.Mode))
        });
        return [...(filteredOldData as Array<any>), ...(newData as Array<any>)];
    }

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
                                Readonly: '1'
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
                    Setting: []
                }
            }
        ];
        return colSetting;
    }

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

    private confirmWhenClose(textId: any, text: any) {
        this.modalService.unsavedWarningMessageDefault({
            headerText: 'Saving Changes',
            onModalSaveAndExit: () => {
                this.itemDirty = false;

                this.callbackAfterSubmiting = () => {
                    this.translateTextClicked(textId, text, this.translateDataType);
                };

                this.submit();
                //setTimeout(() => {
                //    this.translateTextClicked(textId, text, this.translateDataType);
                //}, 100);
            },
            onModalExit: () => {
                this.itemDirty = false;
                this.translateTextClicked(textId, text, this.translateDataType);
            }
        });
    }

    public itemsTrackBy(index, item) {
        return item ? item.id : undefined;
    }
}
