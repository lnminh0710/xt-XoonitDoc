import {
    Component,
    Input,
    Output,
    EventEmitter,
    ElementRef,
    ViewChild,
    OnInit,
    OnDestroy,
    AfterViewInit,
} from '@angular/core';
import { WidgetDetail, WidgetType } from '@app/models';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import { Uti } from '@app/utilities';
import { Dialog } from 'primeng/primeng';
import { WidgetTranslateComponent } from '../widget-translate/widget-translate.component';
import { ModalService, WidgetTemplateSettingService, AppErrorHandler, DatatableService } from '@app/services';
import { Configuration } from '@app/app.constants';
import { Subscription } from 'rxjs';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'widget-module-info-translation',
    templateUrl: './widget-module-info-translation.component.html',
})
export class WidgetModuleInfoTranslationComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public showDialog = false;
    public isResizable = true;
    public isDraggable = true;
    public isMaximized = false;
    private _data: WidgetDetail;
    private isUpdated = false;

    private preDialogW: string;
    private preDialogH: string;
    private preDialogLeft: string;
    private preDialogTop: string;
    private isDataDirty = false;
    private translationData = [];

    public dialogStyleClass = this.consts.popupResizeClassName;
    private _keyword: string;
    public isShowSaveOnlyButton = false;
    private widgetTemplateSettingServiceSubscription: Subscription;

    @ViewChild('pDialogTranslation') pDialogTranslation: Dialog;
    @ViewChild('translateWidget') translateWidget: WidgetTranslateComponent;

    // Used to decide form or table translate mode for combination widget
    @Input() combinationTranslateMode: string;
    @Input() translateTextGridId: string;

    @Input() set data(data: WidgetDetail) {
        if (!data) return;

        this._data = cloneDeep(data);
        setTimeout(() => {
            this.buildTranslationData(this._data);
        }, 200);
    }

    @Input() set keyword(_keyword: string) {
        if (!_keyword) return;

        setTimeout(() => {
            if (this.isTranslateDataTextOnly) {
                this._keyword = _keyword;
                this.isShowSaveOnlyButton = true;
            }
        }, 200);
    }

    @Input('originalTranslateSource') originalTranslateSource: Array<any>;

    @Input() set tableData(data: any) {
        if (!data) return;
        this.buildTranslateForTable({
            contentDetail: data,
        });
    }

    get keyword() {
        return this._keyword;
    }

    @Input() isTranslateDataTextOnly = false;
    @Input() tableId = null;
    @Input() enableApplyFor: boolean = true;
    @Input() isOrderDataEntry: boolean = false;

    @Output() onHide = new EventEmitter<any>();
    @Output() resetWidgetTranslation = new EventEmitter<any>();
    @Output() isCompletedRender: EventEmitter<any> = new EventEmitter();

    constructor(
        private element: ElementRef,
        private widgetTemplateSettingService: WidgetTemplateSettingService,
        private consts: Configuration,
        private modalService: ModalService,
        private datatableService: DatatableService,
        protected router: Router,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router);
    }

    public ngOnInit() {
        this.isUpdated = false;
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
        setTimeout(() => {
            this.isCompletedRender.emit(true);
        });
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private resetWidget($event: any) {
        this.resetWidgetTranslation.emit();
    }

    public save(saveOnly?: boolean, thenClose?: boolean) {
        this.translateWidget.gridComponent.stopEditing();
        setTimeout(() => {
            if (this.translateWidget) {
                let thenCloseCb: any;
                if (thenClose) {
                    thenCloseCb = () => {
                        this.close();
                    };
                }
                this.translateWidget.submit(saveOnly, thenCloseCb);
            }
        }, 200);
    }

    public close() {
        setTimeout(() => {
            //if (this.isDataDirty) {
            //    this.confirmWhenClose();
            //    return;
            //}
            this.closeDialog();
        }, 200);
    }

    private closeDialog() {
        this.showDialog = false;
        this.onHide.emit({ isUpdated: this.isUpdated, isHidden: true });
        this.isUpdated = false;
    }

    //private confirmWhenClose() {
    //    this.modalService.unsavedWarningMessageDefault({
    //        headerText: 'Saving Changes',
    //        onModalSaveAndExit: () => {
    //            this.save(this.isShowSaveOnlyButton);
    //            this.closeDialog();
    //        },
    //        onModalExit: () => { this.closeDialog(); }
    //    });
    //}

    public changeData($event: any) {
        this.isDataDirty = true;
    }

    public saveData($event: any) {
        this.isDataDirty = false;
        this.isUpdated = true;
    }

    public onShow(event) {
        if (this.pDialogTranslation) {
            this.pDialogTranslation.unbindDocumentEscapeListener();
        }
        this.bindResizeEvent();
    }

    private maximize() {
        if (this.translateWidget) this.translateWidget.resized();
        this.isMaximized = true;
        this.isResizable = false;
        this.isDraggable = false;
        this.dialogStyleClass = this.consts.popupResizeClassName + '  ' + this.consts.popupFullViewClassName;
        if (this.pDialogTranslation) {
            this.preDialogW = this.pDialogTranslation.containerViewChild.nativeElement.style.width;
            this.preDialogH = this.pDialogTranslation.containerViewChild.nativeElement.style.height;
            this.preDialogLeft = this.pDialogTranslation.containerViewChild.nativeElement.style.left;
            this.preDialogTop = this.pDialogTranslation.containerViewChild.nativeElement.style.top;

            this.pDialogTranslation.containerViewChild.nativeElement.style.width = $(document).width() + 'px';
            this.pDialogTranslation.containerViewChild.nativeElement.style.height = $(document).height() + 'px';
            this.pDialogTranslation.containerViewChild.nativeElement.style.top = '0px';
            this.pDialogTranslation.containerViewChild.nativeElement.style.left = '0px';
        }
    }

    private restore() {
        if (this.translateWidget) this.translateWidget.resized();
        this.isMaximized = false;
        this.isResizable = true;
        this.isDraggable = true;
        this.dialogStyleClass = this.consts.popupResizeClassName;
        if (this.pDialogTranslation) {
            this.pDialogTranslation.containerViewChild.nativeElement.style.width = this.preDialogW;
            this.pDialogTranslation.containerViewChild.nativeElement.style.height = this.preDialogH;
            this.pDialogTranslation.containerViewChild.nativeElement.style.top = this.preDialogTop;
            this.pDialogTranslation.containerViewChild.nativeElement.style.left = this.preDialogLeft;
        }
        setTimeout(() => {
            this.bindResizeEvent();
        }, 200);
    }

    private bindResizeEvent() {
        if (this.pDialogTranslation) {
            const resizeEle = $('div.ui-resizable-handle', $(this.pDialogTranslation.containerViewChild.nativeElement));
            if (resizeEle && resizeEle.length) {
                resizeEle.bind('mousemove', () => {
                    if (this.pDialogTranslation.resizing) {
                        setTimeout(() => {
                            if (this.translateWidget) this.translateWidget.resized();
                        }, 200);
                    }
                });
            }
        }
    }

    private buildTranslationData(data: WidgetDetail) {
        if (!data) return;

        switch (data.idRepWidgetType) {
            case WidgetType.FieldSet:
            case WidgetType.CombinationCreditCard: {
                if (!data || !data.contentDetail || !data.contentDetail.data || data.contentDetail.data.length < 2) {
                    return;
                }
                this.buildTranslateData(data, true);
                break;
            }
            case WidgetType.DataGrid:
            case WidgetType.EditableRoleTreeGrid:
            case WidgetType.EditableGrid: {
                if (
                    !data ||
                    !data.contentDetail ||
                    !data.contentDetail.columnSettings ||
                    isEmpty(data.contentDetail.columnSettings)
                ) {
                    return;
                }
                this.buildTranslateData(data, false);
                break;
            }
            case WidgetType.FileExplorer:
            case WidgetType.ToolFileTemplate:
            case WidgetType.FileExplorerWithLabel: {
                if (
                    !data ||
                    !data.contentDetail ||
                    !data.contentDetail.data ||
                    !data.contentDetail.data.length ||
                    !data.contentDetail.data[0].length ||
                    isEmpty(data.contentDetail.data[0][0])
                ) {
                    return;
                }
                this.buildDataForFileExplorer(data);
                this.buildTranslateData(data, false);
                break;
            }
            case WidgetType.Combination: {
                let isFormMode = this.combinationTranslateMode == 'form' ? true : false;
                this.buildTranslateData(data, isFormMode);
                break;
            }
            default:
                this.buildTranslateData(data, true);
                break;
        }
    }

    /**
     * buildTranslateData
     * @param data
     * @param isForm
     */
    private buildTranslateData(data: WidgetDetail, isForm: boolean) {
        if (!data || !data.contentDetail) {
            return;
        }

        if (this.isOrderDataEntry || (data.fieldsTranslating && data.idRepWidgetApp == 106)) {
            //Repository Name widget
            this.buildTranslateForForm(data);
        } else {
            this.widgetTemplateSettingServiceSubscription = this.widgetTemplateSettingService
                .getWidgetDetailByRequestString(
                    data,
                    data.widgetDataType.listenKeyRequest(this.ofModule.moduleNameTrim),
                    true,
                )
                .pipe(
                    finalize(() => {
                        setTimeout(() => {
                            this.isCompletedRender.emit(true);
                        }, 500);
                    }),
                )
                .subscribe((result) => {
                    this.appErrorHandler.executeAction(() => {
                        switch (data.idRepWidgetType) {
                            case WidgetType.Combination:
                                if (isForm) {
                                    this.buildTranslateForForm(result);
                                } else {
                                    if (
                                        result.contentDetail &&
                                        result.contentDetail.data &&
                                        result.contentDetail.data[2] &&
                                        result.contentDetail.data[2][0]
                                    ) {
                                        let data = {
                                            contentDetail: result.contentDetail.data[2][0],
                                        };
                                        this.buildTranslateForTable(data);
                                    }
                                }
                                break;
                            case WidgetType.FileExplorer:
                            case WidgetType.ToolFileTemplate:
                            case WidgetType.FileExplorerWithLabel: {
                                if (
                                    !data ||
                                    !data.contentDetail ||
                                    !data.contentDetail.data ||
                                    !data.contentDetail.data.length ||
                                    !data.contentDetail.data[0].length ||
                                    isEmpty(data.contentDetail.data[0][0])
                                ) {
                                    return;
                                }
                                this.buildDataForFileExplorer(result);
                                this.buildTranslateForTable(result);
                                break;
                            }
                            default:
                                if (isForm) {
                                    this.buildTranslateForForm(result);
                                    return;
                                }
                                this.buildTranslateForTable(result);
                                break;
                        }
                    });
                });
        }
    }

    private buildDataForFileExplorer(data: any): any {
        let contentDetail = this.datatableService.formatDataTableFromRawData(data.contentDetail.data);
        data.contentDetail = contentDetail;
    }

    private buildTranslateForTable(data: any) {
        const widgetData = data.contentDetail.columnSettings;
        const colectionData =
            data.contentDetail.collectionData && data.contentDetail.collectionData.length
                ? data.contentDetail.collectionData[0]
                : {};
        let i = 0;
        // tslint:disable-next-line:forin
        for (const itemName in widgetData) {
            const item = widgetData[itemName];
            const setting = item.Setting;
            if (setting && !!setting.length && setting[0].DisplayField && setting[0].DisplayField.Hidden === '1') {
                continue;
            }
            this.translationData.push({
                // this is temporaries ID
                id: i++,
                text: item.ColumnHeader,
                value: this.getValueForColumn(colectionData, itemName, setting),
                dataType: item.DataType,
                isActive: item.Selected,
                isGroupName: item.IsGroupName,
            });
        }

        this.translationData = cloneDeep(this.translationData);
    }

    private buildTranslateForForm(data) {
        const widgetData = data.contentDetail.data[1];
        let i = 0;
        for (const item of widgetData) {
            const setting = Uti.tryParseJson(item.Setting);
            if (setting && !!setting.length && setting[0].DisplayField && setting[0].DisplayField.Hidden === '1') {
                continue;
            }
            this.translationData.push({
                // TODO: this is temporaries ID
                id: i++,
                text: item.ColumnName,
                value: item.Value + '',
                dataType: item.DataType,
                isActive: item.Selected,
                isGroupName: item.IsGroupName,
            });
        }

        this.translationData = cloneDeep(this.translationData);
    }

    private getValueForColumn(colectionData: any, itemName: string, setting: any): any {
        if (!setting || !setting.length || !setting[0].ControlType || !setting[0].ControlType.Type) {
            return this.getItemValue(colectionData, itemName);
        }
        switch (setting[0].ControlType.Type) {
            case 'Combobox': {
                const data = Uti.tryParseJson(colectionData[itemName]);
                if (isEmpty(data)) return '';
                return data[0].value;
            }
            default: {
                return this.getItemValue(colectionData, itemName);
            }
        }
    }

    private getItemValue(colectionData: any, itemName: string): any {
        const valueType = typeof colectionData[itemName];
        switch (valueType) {
            case 'number':
            case 'boolean': {
                return colectionData[itemName].toString();
            }
            default: {
                return isEmpty(colectionData[itemName]) ? '' : colectionData[itemName].toString();
            }
        }
    }
}
