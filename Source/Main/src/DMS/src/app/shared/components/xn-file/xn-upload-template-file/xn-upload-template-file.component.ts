
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    ViewChild,
    EventEmitter,
    ChangeDetectorRef,
    ElementRef
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import {
    CampaignService,
    AppErrorHandler,
    DownloadFileService,
    CommonService,
    ModalService,
    UserService,
    DatatableService
} from '@app/services';
import {
    FileUploadComponent
} from '../file-upload';
import {
    ApiResultResponse,
    MessageModel,
    User,
    ControlGridModel,
    ControlGridColumnModel
} from '@app/models';
import {
    ComboBoxTypeConstant,
    Configuration,
    UploadFileMode,
    MessageModal
} from '@app/app.constants';
import { WjComboBox } from 'wijmo/wijmo.angular2.input';
import { Uti } from '@app/utilities';
import cloneDeep from 'lodash-es/cloneDeep';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import { XnFileUti } from '../xn-file.uti';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

@Component({
    selector: 'xn-upload-template-file',
    styleUrls: ['./xn-upload-template-file.component.scss'],
    templateUrl: './xn-upload-template-file.component.html'
})
export class XnUploadTemplateFileComponent extends BaseComponent implements OnInit, OnDestroy {
    public countryCheckListData: Array<any>;
    public templates: Array<any> = [];
    public templateFileMenus: Array<any> = [];
    public showDialog = false;
    public showDialogTemplateName = false;
    public isDisableUploadButton = true;
    public templateFileName: string = '';
    public sqlTemplate: string = '';
    public templateTile = '';
    public templateName = '';
    public templateNameSavingMode = '';
    public submitTemplateName = false;
    public uploadFileMode = UploadFileMode.Printing;
    public printingUploadTemplateFolderName = (new Configuration()).printingUploadTemplateFolderName;
    public columnViewMode = false;
    public user: User = new User();
    public sqlColumnsDataSourceTable: ControlGridModel = new ControlGridModel();

    /******************************************************************************************************************************************/
    /* FOR WIDGET */
    public isOnEditting = false;
    /******************************************************************************************************************************************/

    private _cachedData: Array<TemplateCachedModel> = [];
    private _fileExtention: any = [];
    private _countriesOutput: any = [];
    private _isDirtyTemplateName = false;
    private _preventTemplateChange = false;
    private _sQLQueryColumnName: string = '';
    private _REG_GET_FIELDS = new RegExp('(?<=select\\s*)[\\s\\S]*(?=\\s*from)', 'gi');
    // private _REG_REPLACE_SQL = new RegExp('\\,\\s?(?![^\\(]*\\))');
    // private _REG_REPLACE_FIELD = new RegExp('\\.\\s?(?![^\\(]*\\))');

    @Input() allowEdit;
    @Input() gridId: string;
    // If true , this form is displaying on Widget
    private _isActivated: boolean;
    @Input() set isActivated(status: boolean) {
        this._isActivated = status;
        if (!status) {
            this._changeDetectorRef.detach();
        }
        else {
            this._changeDetectorRef.reattach();
        }
    };

    get isActivated() {
        return this._isActivated;
    }

    @ViewChild('fileUpload') fileUpload: FileUploadComponent;
    @ViewChild('templateCtr') templateCtr: WjComboBox;
    @ViewChild(XnAgGridComponent) xnAgGridComponent: XnAgGridComponent;

    @Output() outputDataAction = new EventEmitter<any>();
    @Output() onSavingDataCompletedAction = new EventEmitter<any>();

    constructor(
        private _campaignService: CampaignService,
        private _appErrorHandler: AppErrorHandler,
        private _commonService: CommonService,
        private _downloadFileService: DownloadFileService,
        private _modalService: ModalService,
        private _toasterService: ToasterService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _datatableService: DatatableService,
        private _elementRef: ElementRef,
        router ? : Router) {
        super(router);
    }
    public ngOnInit() {
        this.getUser();
        this.buildEmptyGrid();
        this.loadTreeViewFileExtention();
        this.getCountries();
        this.createFileTemplateMenu();
    }
    public ngOnDestroy() {
        Uti.unsubscribe(this);
        $('#txt-template-name-for-upload-file', this._elementRef.nativeElement).unbind('keyup');
        if (this.countryCheckListData) {
            this.countryCheckListData.length = 0;
        }
        if (this.templates) {
            this.templates.length = 0;
        }
        if (this.templateFileMenus) {
            this.templateFileMenus.length = 0;
        }
        if (this._cachedData) {
            this._cachedData.length = 0;
        }
    }
    public uploadFileClick() {
        this.showDialog = true;
    }
    public close() {
        this.showDialog = false;
        if (this.fileUpload) this.fileUpload.clearItem();
    }
    public onCompleteUploadItem(event) {
        const response = event.response;
        if (!response || !response.fileName) return;
        this.close();
        this.saveDocumentTemplate(response);
    }
    public changeTemplate() {
        if (this._preventTemplateChange) {
            this._preventTemplateChange = false;
            return;
        }
        if (!this.templateCtr) return;
        this.setDisableUploadButton();
        if (!this.templateCtr.selectedValue) return;
        this.getDocumentTemplateCountries(this.templateCtr.selectedValue);
    }
    public outputDataCountryHandler($event: any) {
        this._countriesOutput = $event;
        this.outputEditingAction();
        this.updateCurrentCountriesToCached();
        this.setDisableUploadButton();
    }
    public dropdownItemClickedHandler($event: any) {
        switch ($event.TabName) {
            case 'New Template':
                this.newTemplate();
                this.registerEnterForTemplateName();
                break;
            case 'Rename Template':
                if (!this.templateCtr || !this.templateCtr.selectedItem) {
                    this._modalService.warningText('Please select a template to Rename.');
                    return;
                }
                this.renameTemplate();
                this.registerEnterForTemplateName();
                break;
            case 'Delete Template':
                if (!this.templateCtr || !this.templateCtr.selectedItem) {
                    this._modalService.warningText('Please select a template to Delete.');
                    return;
                }
                this.deleteTemplate();
                break;
        }
    }
    public closeDialogTemplateName () {
        if (this._isDirtyTemplateName) {
            this._modalService.confirmMessageHtmlContent(new MessageModel({
                headerText: 'Saving Data',
                messageType: MessageModal.MessageType.confirm,
                message: [{ key: '<p>'}, { key: 'Modal_Message___DoYouWantToSaveChangeData' }, { key: '<p>' }],
                buttonType1: MessageModal.ButtonType.primary,
                callBack1: () => {
                    this.saveTemplateName(this.templateNameSavingMode);
                },
                callBack2: () => {
                    this.closeTemplateNamePopup();
                },
            }));
        } else {
            this.closeTemplateNamePopup();
        }
    }
    public templateNameChanged() {
        this._isDirtyTemplateName = true;
    }
    public sqlTemplateChanged($event) {
        if (Uti.isNotCharacterKey($event.keyCode)) {
            return;
        }
        if (!this.templateCtr || !this.templateCtr.selectedValue) return;
        this.outputEditingAction();
        this.pushDataToCached(this.sqlTemplate, 'sqlTemplate');
        this.updateIsEditingForCachedData();
        this.updateDataForSqlQueryColumnNameWhenChangeTextbox();
    }
    public resetData() {
        this._cachedData.length = 0;
        this.resetCountryCheckListData();
        this.sqlTemplate = '';
        this._sQLQueryColumnName = '';
        this.resetGridData();
        this.sqlColumnsDataSourceTable = new ControlGridModel();
        this.detectChanges();
        this.getTemplateData();
    }

    public saveTemplateName(mode: string) {
        this.submitTemplateName = true;;
        if (mode !== 'Delete' && !this.templateName.trim()) {
            this.focusOnTemplateName();
            return;
        }
        this._campaignService.saveAppSystemColumnNameTemplate(this.buildSavingDataForTemplateName(mode))
            .subscribe((response: ApiResultResponse) => {
                this._appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response)) {
                        return;
                    }
                    this.handleWhenSavingTemplateNameSuccess(response, mode);
                    this.closeTemplateNamePopup();
                    this._toasterService.pop('success', 'Success', 'Data is saved successfully');
                    this.detectChanges();
                });
            });
    }
    public submit() {
        if (this.xnAgGridComponent) {
            this.xnAgGridComponent.stopEditing();
        }
        setTimeout(() => {
            const data = this.prepareSavingData();
            if (!data || !data.length) {
                this.onSavingDataCompletedAction.emit(true);
                return;
            }
            this._campaignService.saveDocumentTemplateSampleDataFile(data)
                .subscribe(() => {
                this._appErrorHandler.executeAction(() => {
                    this.requesetTreeMediaData(this.templateCtr.selectedValue);
                    this.resetEditing();
                    this.onSavingDataCompletedAction.emit(true);
                    this._toasterService.pop('success', 'Success', 'Data is saved successfully');
                });
            });
        }, 200);
    }
    public columnViewModeChanged() {
        if (!this.columnViewMode) return;
        this.buildSqlColumnDataGrid();
    }
    public reloadSqlTemplateColumnsNameClick() {
        this._modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Confirmation',
            message: [{ key: '<p>'}, { key: 'Modal_Message___DoYouWantToSQLQuery' }, { key: '<p>' }],
            callBack1: () => {
                // const sqlTemp = this.sqlTemplate.match(this._REG_GET_FIELDS);
                // this._sQLQueryColumnName = (sqlTemp && sqlTemp.length) ? sqlTemp[0] : '';
                // this.pushDataToCached([this._sQLQueryColumnName, false]
                //     ,['sQLQueryColumnName', 'isChangeFromColumnViewMode']
                //     ,true);
                // this.buildSqlColumnDataGrid();
                this.updateDataForSqlQueryColumnName();
                this.outputEditingAction();
                this.updateIsEditingForCachedData();
            }
        }));
    }
    public onRowEditEndedHandle() {
        this.updateSQLQueryColumnName();
        this.outputEditingAction();
        this.updateIsEditingForCachedData();
    }
    public dragSplitterEnd(event) {
    }
    public onTableEditStartHandle() {
        this.outputDataAction.emit();
    }
    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private outputEditingAction() {
        if (!this.allowEdit) return;
        this.outputDataAction.emit();
    }
    private buildDataGridWhenChangeTemplate() {
        setTimeout(() => {
            this.columnViewModeChanged();
        });
    }
    private updateSQLQueryColumnName() {
        setTimeout(() => {
            const currentItem = this._cachedData.find(x => x.templateId == this.templateCtr.selectedValue);
            if (!currentItem || !currentItem.templateId) {
                return;
            }
            let sQLQueryColumnName = '';
            for (let i = 0; i < this.sqlColumnsDataSourceTable.data.length; i++) {                
                const item = this.sqlColumnsDataSourceTable.data[i];
                if (!item.DataFieldHidden) continue;
                sQLQueryColumnName += item.DataFieldHidden + (item.TemplateField ? (' AS ' + item.TemplateField) : '');
                if (i < this.sqlColumnsDataSourceTable.data.length - 1) {
                    sQLQueryColumnName += ', ';
                }
            }
            currentItem.sQLQueryColumnName = sQLQueryColumnName;
            currentItem.isChangeFromColumnViewMode = true;
        });
    }
    private buildEmptyGrid () {
        this.sqlColumnsDataSourceTable = new ControlGridModel({
            columns: this.createGridColumns(),
            data: []
        })
    }
    private resetGridData() {
        this.sqlColumnsDataSourceTable.columns.length = 0;
        this.sqlColumnsDataSourceTable.data.length = 0;
    }
    private createGridColumns(): Array<ControlGridColumnModel> {
        return [
            new ControlGridColumnModel({
                title: 'Data Field Hidden',
                data: 'DataFieldHidden',
                visible: false,
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
            }),
            new ControlGridColumnModel({
                title: 'Data Field',
                data: 'DataField'
            }),
            new ControlGridColumnModel({
                title: 'Template Field',
                data: 'TemplateField',
                readOnly: false
            })
        ];
    }
    private checkChangeFromColumnViewMode() {
        const currentItem = this._cachedData.find(x => x.templateId === this.templateCtr.selectedValue);
        if (!currentItem || !currentItem.templateId) {
            this.resetGridData();
            this.sqlColumnsDataSourceTable = new ControlGridModel({
                columns: this.createGridColumns(),
                data: []
            });
            return true;
        }
        return currentItem.isChangeFromColumnViewMode;
    }
    private buildSqlColumnDataGrid() {
        if (this.checkChangeFromColumnViewMode()) {
            let currentData = cloneDeep(this.sqlColumnsDataSourceTable.data);
            this.resetGridData();
            this.sqlColumnsDataSourceTable = new ControlGridModel({
                columns: this.createGridColumns(),
                data: currentData
            });
            return;
        }
        this.resetGridData();
        if (!this._sQLQueryColumnName) {
            if (!this.sqlTemplate) {
                this.sqlColumnsDataSourceTable = new ControlGridModel({
                    columns: this.createGridColumns(),
                    data: []
                });
                return;
            }
            this.sqlColumnsDataSourceTable = new ControlGridModel({
                columns: this.createGridColumns(),
                data: this._datatableService.appendRowIdForGridData(this.builDataSourceFromSqlText(this.sqlTemplate))
            });
            return;
        }
        this.sqlColumnsDataSourceTable = new ControlGridModel({
            columns: this.createGridColumns(),
            data: this._datatableService.appendRowIdForGridData(this.builDataSourceFromSqlText(this._sQLQueryColumnName, true))
        });
    }
    private builDataSourceFromSqlText(sqlText: string, isOnlyFields?: boolean): Array<any> {
        const sqlVariables = XnFileUti.builDataSourceFromSqlText(sqlText, isOnlyFields);
        this.pushDataToCached(sqlVariables, 'sqlVariables');
        return sqlVariables;
    }
    // private builDataSourceFromSqlText(sqlText: string, isOnlyFields?: boolean): Array<any> {
    //     if (!sqlText
    //         || !(sqlText.trim())) {
    //         return [];
    //     }
    //     let sqlVariables: any = '';
    //     if (!isOnlyFields) {
    //         sqlVariables = sqlText.match(this._REG_GET_FIELDS);
    //         sqlVariables = (sqlVariables && sqlVariables.length) ? sqlVariables[0] : '';
    //     } else {
    //         sqlVariables = sqlText;
    //     }
    //     this.pushDataToCached(sqlVariables, 'sqlVariables');
    //     return this.parseVariablesStringToColumns(sqlVariables);
    // }
    // private parseVariablesStringToColumns(sqlVariables: string): Array<any> {
    //     if (!sqlVariables
    //         || !(sqlVariables.trim())) {
    //         return [];
    //     }
    //     const sqlVariableArr = sqlVariables.replace(/\n/g, "").split(this._REG_REPLACE_SQL);
    //     let result = [];
    //     for (let item of sqlVariableArr) {
    //         const col = this.parseSQLVariableItemToObject(item);
    //         if (!col) continue;
    //         result.push(col);
    //     }
    //     return result;
    // }
    // private parseSQLVariableItemToObject(sqlVariableItem: string): any {
    //     if (!sqlVariableItem
    //         || !(sqlVariableItem.trim())) {
    //         return null;
    //     }
    //     const asIndex = sqlVariableItem.toLowerCase().indexOf(' as ');
    //     if (asIndex < 0) {
    //         return {
    //             DataFieldHidden: sqlVariableItem,
    //             DataField: this.getRightDataField(sqlVariableItem),
    //             TemplateField: ''
    //         };
    //     }
    //     const dataField = (sqlVariableItem.substring(0, asIndex));
    //     let templateField = (sqlVariableItem.substring(asIndex + 3, sqlVariableItem.length));
    //     if (!dataField
    //         || !(dataField.trim())) {
    //         return null;
    //     }
    //     templateField = templateField ? templateField.trim() : '';
    //     return {
    //         DataFieldHidden: dataField,
    //         DataField: templateField ? templateField : this.getRightDataField(dataField),
    //         TemplateField: templateField
    //     };
    // }
    // private getRightDataField(dataField: string) {
    //     if (!dataField
    //         || !(dataField.trim())) {
    //         return '';
    //     }
    //     const dataFieldArr = dataField.trim().split(this._REG_REPLACE_FIELD);
    //     return dataFieldArr[dataFieldArr.length - 1];
    // }
    private getUser() {
        this._userService.currentUser.subscribe((user: User) => {
            this._appErrorHandler.executeAction(() => {
                if (user) {
                    this.user = user || new User();
                }
            });
        });
    }
    private setDisableUploadButton() {
        let currentItem = this._cachedData.find(x => x.templateId == this.templateCtr.selectedValue);
        if (!currentItem || !currentItem.templateId) return;
        this.isDisableUploadButton = !this.templateCtr.selectedValue || !this.hasActiveCountries(currentItem.currentCountries);
    }
    private isDirty(): boolean {
        for (let item of this._cachedData) {
            if (!item.isEditing) continue;
            return true;
        }
        return false;
    }
    private updateDataForSqlQueryColumnNameWhenChangeTextbox() {
        this.pushDataToCached(false, 'isChangeFromColumnViewMode');
        this.updateDataForSqlQueryColumnName();
    }
    private updateDataForSqlQueryColumnName() {
        const sqlTemp = this.sqlTemplate.match(this._REG_GET_FIELDS);
        this._sQLQueryColumnName = (sqlTemp && sqlTemp.length) ? sqlTemp[0] : '';
        this.pushDataToCached([this._sQLQueryColumnName, false]
            ,['sQLQueryColumnName', 'isChangeFromColumnViewMode']
            ,true);
        this.buildSqlColumnDataGrid();
    }
    private updateIsEditingForCachedData() {
        let currentItem = this._cachedData.find(x => x.templateId == this.templateCtr.selectedValue);
        if (!currentItem || !currentItem.templateId) return;
        currentItem.isEditing = this.hasActiveCountries(currentItem.currentCountries);
    }
    private hasActiveCountries(countries: Array<any>): boolean {
        for (let item of countries) {
            if (!item.isActive) continue;
            return true;
        }
        return false;
    }
    private loadTreeViewFileExtention() {
        this._commonService.getListComboBox(ComboBoxTypeConstant.treeMediaType).subscribe((response: ApiResultResponse) => {
            this._appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response) || !response.item.treeMediaType) {
                    return;
                }
                this._fileExtention = response.item.treeMediaType;
            });
        });
    }
    private updateCurrentCountriesToCached() {
        if (!this.templateCtr || !this.templateCtr.selectedValue) return;
        const currentItem = this._cachedData.find(x => x.templateId == this.templateCtr.selectedValue);
        if (!currentItem || !currentItem.templateId) return;
        if (currentItem.currentCountries.length)
            currentItem.currentCountries.length = 0;
        currentItem.currentCountries = cloneDeep(this._countriesOutput);
        this.updateIsEditingForCachedData();
    }
    private prepareSavingData(): Array<any> {
        const savingData: Array<any> = [];
        for (let item of this._cachedData) {
            if (!item.isEditing) continue;
            savingData.push(this.buildDocumentTemplateSavingData(item));
        }
        return savingData;
    }
    private registerEnterForTemplateName() {
        setTimeout(() => {
            Uti.registerKeyPressForControl(
                $('#txt-template-name-for-upload-file', this._elementRef.nativeElement),
                () => {this.saveTemplateName(this.templateNameSavingMode)},
                13);
        });
    }
    private getDocumentTemplateCountries(templateId: any) {
        if (this.getDataFromCached(templateId)) return;
        this._campaignService.getDocumentTemplateCountries(templateId)
            .subscribe((response: ApiResultResponse) => {
                this._appErrorHandler.executeAction(() => {
                    this.resetCountryCheckListData();
                    this.pushDataToCached(this.countryCheckListData, 'currentCountries');
                    if (!Uti.isResquestSuccess(response)
                        || !response.item.data
                        || !response.item.data[0]
                        || !response.item.data[0].length
                        || !response.item.data[0][0]) {
                        this.templateFileName = '';
                        this.sqlTemplate = '';
                        this._sQLQueryColumnName = '';
                        this.pushDataToCached([], 'originalCountries');
                        this.setDisableUploadButton();
                        this.buildDataGridWhenChangeTemplate();
                        return;
                    }
                    this.setTemplateFileName(response.item.data[0][0]);
                    this.makeCachedDataFromService(response.item.data[0][0]);
                    this.setDisableUploadButton();
                    this.buildDataGridWhenChangeTemplate();
                });
            });
    }
    private requesetTreeMediaData(templateId: any) {
        this._campaignService.getDocumentTemplateCountries(templateId)
        .subscribe((response: ApiResultResponse) => {
            this._appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response)
                        || !response.item.data
                        || !response.item.data[0]
                        || !response.item.data[0].length
                        || !response.item.data[0][0]) {
                    this.pushDataToCached(['', '', '', '', '', null]
                        ,['fileName', 'originalFileName', 'mediaRelativePath', 'sQLQueryColumnName', 'sqlTemplate', 'idSharingTreeMedia']
                        ,true);
                    return;
                }
                this.makeCachedDataFromService(response.item.data[0][0]);
            });
        });
    }
    private makeCachedDataFromService(templateData: any) {
        let countries = Uti.tryParseJson(templateData.Countries || '{}');
        if (!countries.JsCountries || !countries.JsCountries.length) {
            countries = [];
        } else {
            countries = countries.JsCountries;
        }
        this.sqlTemplate = isEmpty(templateData.SQLQuery) ? '' : templateData.SQLQuery;
        this._sQLQueryColumnName = isEmpty(templateData.SQLQueryColumnName) ? '' : templateData.SQLQueryColumnName;
        this.pushDataToCached([countries, this.templateFileName, this._sQLQueryColumnName, this.sqlTemplate, templateData.IdSharingTreeMedia]
                                ,['originalCountries', 'originalFileName', 'sQLQueryColumnName', 'sqlTemplate', 'idSharingTreeMedia']
                                ,true);

        this.makeCountriesCached(templateData, countries);
    }
    private makeCountriesCached(templateData: any, originalCountries: Array<any>) {
        const tempCountries = cloneDeep(this.countryCheckListData);
        if (!tempCountries || !tempCountries.length) {
            tempCountries.length = 0;
            return;
        }
        const originaleCountriesObject = Uti.mapArrayToObjectWithSelfPropertyName(originalCountries, 'IdCountrylanguage');
        if (isEmpty(originaleCountriesObject)) {
            tempCountries.length = 0;
            return;
        }
        for (let item of tempCountries) {
            item.isActive = false;
            if (originaleCountriesObject[item.idValue]) {
                item.isActive = true;
            }
        }
        this.pushDataToCached(tempCountries, 'currentCountries');
        this.countryCheckListData.length = 0;
        this.countryCheckListData = cloneDeep(tempCountries);
        // destroy array
        tempCountries.length = 0;
    }
    private resetCountryCheckListData() {
        let temp = cloneDeep(this.countryCheckListData);
        for (let item of temp) {
            item.isActive = false;
        }
        this.countryCheckListData.length = 0;
        this.countryCheckListData = temp;
    }
    private pushDataToCached(data: any, propertyName: any, isMultiple?: boolean) {
        const currentItem = this._cachedData.find(x => x.templateId == this.templateCtr.selectedValue);
        if (!isMultiple) {
            this.setDataForCurrentCachedItem(this.templateCtr.selectedValue, currentItem, data, propertyName);
            return;
        }
        for (let i = 0; i < propertyName.length; i++) {
            this.setDataForCurrentCachedItem(this.templateCtr.selectedValue, currentItem, data[i], propertyName[i]);
        }
    }
    private setDataForCurrentCachedItem(templateId: any, currentItem: any, data: any, propertyName: string) {
        if (currentItem && currentItem.templateId) {
            currentItem[propertyName] = cloneDeep(data);
            return;
        }
        const newData = new TemplateCachedModel();
        newData.templateId = templateId;
        if (newData[propertyName] && newData[propertyName].length) {
            newData[propertyName].length = 0;
        }
        newData[propertyName] = cloneDeep(data);
        this._cachedData.push(newData);
    }
    private setTemplateFileName(data: any) {
        this.templateFileName = isEmpty(data.MediaOriginalName) ? '' :data.MediaOriginalName;
        this.detectChanges();
    }
    private getDataFromCached(templateId: any): boolean {
        const currentItem = this._cachedData.find(x => x.templateId == templateId);
        if (currentItem && currentItem.templateId) {
            this.templateFileName = currentItem.originalFileName;
            this.countryCheckListData.length = 0;
            this.sqlTemplate = currentItem.sqlTemplate;
            this._sQLQueryColumnName = currentItem.sQLQueryColumnName;
            this.countryCheckListData = cloneDeep(currentItem.currentCountries);
            this.buildDataGridWhenChangeTemplate();
            this.detectChanges();
            return true;
        }
        return false;
    }
    private getTemplateData() {
        this._commonService.getListComboBox(ComboBoxTypeConstant.repAppSystemColumnNameTemplate)
            .subscribe((response: ApiResultResponse) => {
                this._appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.repAppSystemColumnNameTemplate) {
                        this.templates = [];
                        this.detectChanges();
                        return;
                    }
                    this.templates.length = 0;
                    this.templates = response.item.repAppSystemColumnNameTemplate;
                });
            });
    }
    private saveDocumentTemplate(response: any) {
        this.templateFileName = response.originalFileName;
        this.pushDataToCached([this.templateFileName, response.fileName, response.path, response.size],
            ['originalFileName', 'fileName', 'mediaRelativePath', 'mediaSize']
            ,true);
        this.updateIsEditingForCachedData();
    }
    private updateTemplateFileNameToCached(response: any) {
        this.templateFileName = response.originalFileName;
        const currentItem = this._cachedData.find(x => x.templateId == this.templateCtr.selectedValue);
        if (!currentItem && !currentItem.templateId) return;
        currentItem.originalFileName = this.templateFileName;
    }
    private buildDocumentTemplateSavingData(data: TemplateCachedModel) {
        const idRepTreeMediaType = this.getIdRepTreeMediaType(data.fileName);
        let result: any = {
            IdRepAppSystemColumnNameTemplate: data.templateId,
            IdRepTreeMediaType: idRepTreeMediaType,
            IdSharingTreeGroups: 1, // hard code from rocco
            SQLQuery: data.sqlTemplate,
            SQLQueryColumnName: data.sQLQueryColumnName,
            MediaName: data.fileName,
            MediaOriginalName: data.originalFileName,
            MediaRelativePath: data.mediaRelativePath,
            MediaSize: data.mediaSize
        };
        if (data.idSharingTreeMedia) {
            result.IdSharingTreeMedia = data.idSharingTreeMedia
        }
        let countries: any = this.makeCountriesJson(data.currentCountries, data.originalCountries);
        if (countries && !isEmpty(countries)) {
            result.JSONTextCountries = JSON.stringify(countries);
        }
        return result;
    }
    private makeCountriesJson(countriesData: any, originalCountries: any) {
        let checkedCountries: Array<any> = countriesData.filter(x => x.isActive).map(x => {
            return {
                IdCountrylanguage: x.idValue
            };
        });
        setTimeout(() => {
            checkedCountries.length = 0;
        }, 1000);
        let resutl = [
            ...this.getDeleteCountries(checkedCountries, originalCountries),
            ...this.getAddCountries(checkedCountries, originalCountries),
            ...this.getUpdateCountries(checkedCountries, originalCountries)];
        if (!resutl || !resutl.length) {
            return {};
        }
        return {
            JsCountries: resutl
        };
    }
    private getDeleteCountries(checkedCountries: Array<any>, originalCountries: Array<any>): Array<any> {
        let deleteCountries = Uti.getItemsDontExistItems(originalCountries, checkedCountries, 'IdCountrylanguage');
        if (!deleteCountries || !deleteCountries.length) {
            return []
        }
        let result = deleteCountries.map(x => {
            return {
                IdRepAppSystemColumnNameTemplateGw: x.IdRepAppSystemColumnNameTemplateGw,
                IsDeleted: 1
            };
        });
        deleteCountries.length = 0;
        return result;
    }
    private getAddCountries(checkedCountries: Array<any>, originalCountries: Array<any>): Array<any> {
        let addCountries = Uti.getItemsDontExistItems(checkedCountries, originalCountries, 'IdCountrylanguage');
        if (!addCountries || !addCountries.length) {
            return []
        }
        let result = addCountries.map(x => {
            return {
                IdCountrylanguage: x.IdCountrylanguage,
                IsActive: 1
            };
        });
        addCountries.length = 0;
        return result;
    }
    private getUpdateCountries(checkedCountries: Array<any>, originalCountries: Array<any>): Array<any> {
        let updateCountries = Uti.getItemsExistItems(originalCountries, checkedCountries, 'IdCountrylanguage');
        if (!updateCountries || !updateCountries.length) {
            return []
        }
        let result = updateCountries.map(x => {
            return {
                IdRepAppSystemColumnNameTemplateGw: x.IdRepAppSystemColumnNameTemplateGw,
                IdCountrylanguage: x.IdCountrylanguage,
                IsActive: 1
            };
        });
        updateCountries.length = 0;
        return result;
    }
    private getIdRepTreeMediaType(fileName): any {
        if (!fileName || !this._fileExtention || !this._fileExtention.length) return '';
        const arr = fileName.split('.');
        if (!arr || !arr.length) return '-1';
        const ext = arr[arr.length - 1];
        const extItem = this._fileExtention.find(x => x.textValue.toLowerCase() === ext.toLowerCase());
        if (!extItem) return '-1';
        return extItem.idValue;
    }
    private getCountries() {
        this._campaignService.getCampaignWizardCountry()
            .subscribe(response => {
                this._appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.countryCode) {
                        this.countryCheckListData.length = 0;
                        return;
                    }
                    this.countryCheckListData = cloneDeep(response.item.countryCode);
                    this.detectChanges();
                    this.getTemplateData();
                });
            });
    }
    private createFileTemplateMenu() {
        this.templateFileMenus = [
            {
                Visible: false,
                TabName: 'New Template',
                Icon: 'plus',
                ClassName: ''
            },
            {
                Visible: false,
                TabName: 'Rename Template',
                Icon: 'pencile',
                ClassName: ''
            },
            {
                Visible: false,
                TabName: 'Delete Template',
                Icon: 'trash',
                ClassName: ''
            }
        ];
    }
    private newTemplate() {
        this.templateTile = 'New Template';
        this.showDialogTemplateName = true;
        this.templateName = '';
        this.templateNameSavingMode = 'New';
        this.focusOnTemplateName();
    }
    private renameTemplate() {
        this.templateTile = 'Edit Template';
        this.showDialogTemplateName = true;
        this.templateNameSavingMode = 'Edit';
        if (this.templateCtr) {
            this.templateName = this.templateCtr.text;
        }
        else {
            this.templateName = '';
        }
        this.focusOnTemplateName();
    }
    private focusOnTemplateName() {
        setTimeout(() => {
            $('#txt-template-name-for-upload-file', this._elementRef.nativeElement).focus();
        });
    }
    private deleteTemplate() {
        this._modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Delete Template',
            messageType: MessageModal.MessageType.error,
            message: [{ key: '<p>'}, { key: 'Modal_Message___DoYouWantToDeleteTemplate' }, { key: '<p>' }],
            buttonType1: MessageModal.ButtonType.danger,
            callBack1: () => {
                this.saveTemplateName('Delete');
            }
        }));
    }
    private handleWhenSavingTemplateNameSuccess(response: any, mode: string) {
        let temp: Array<any> = [];
        switch (mode) {
            case 'New':
                this.makeTemplateDataWhenAddNew(response);
                break;
            case 'Edit':
                this.makeTemplateDataWhenAddEdit();
                break;
            case 'Delete':
                this.makeTemplateDataWhenAddDelete();
        }
    }
    private makeTemplateDataWhenAddNew(savedResponse: any) {
        let temp = cloneDeep(this.templates);
        if (!savedResponse || !savedResponse.item || !savedResponse.item.returnID) {
            return;
        }
        temp.push({
            idValue: savedResponse.item.returnID + '',
            textValue: this.templateName
        });
        this.templates.length = 0;
        this.templates = temp;
        this._preventTemplateChange = true;
        setTimeout(() => {
            this.templateCtr.selectedIndex = this.templates.length - 1;
        });
    }
    private makeTemplateDataWhenAddEdit() {
        let temp = cloneDeep(this.templates);
        const currentItem = temp.find(x => x.idValue == this.templateCtr.selectedValue);
        if (!currentItem || !currentItem.idValue) return;
        currentItem.textValue = this.templateName;
        const currentIndex = Uti.getIndexOfItemInArray(temp, this.templateCtr.selectedItem, 'idValue');
        this.templates.length = 0;
        this.templates = temp;
        this._preventTemplateChange = true;
        setTimeout(() => {
            this.templateCtr.selectedIndex = currentIndex;
        });
    }
    private makeTemplateDataWhenAddDelete() {
        let temp = cloneDeep(this.templates);
        Uti.removeItemInArray(temp, this.templateCtr.selectedItem, 'idValue');
        this.templates.length = 0;
        this.templates = temp;
    }
    private buildSavingDataForTemplateName(mode: string) {
        let result = {};
        switch (mode) {
            case 'New':
                return result = {
                    SQLQuery: this.sqlTemplate,
                    SQLQueryColumnName: this._sQLQueryColumnName,
                    DefaultValue: this.templateName,
                    IsBlocked: 0,
                    IsDeleted: 0
                };
            case 'Edit':
                return result = {
                    IdRepAppSystemColumnNameTemplate: this.templateCtr.selectedValue,
                    SQLQuery: this.sqlTemplate,
                    SQLQueryColumnName: this._sQLQueryColumnName,
                    DefaultValue: this.templateName,
                    IsBlocked: 0,
                    IsDeleted: 0
                };
            case 'Delete':
                return result = {
                    IdRepAppSystemColumnNameTemplate: this.templateCtr.selectedValue,
                    IsDeleted: 1
                };
        }
    }
    private closeTemplateNamePopup() {
        this.templateName = '';
        this.templateNameSavingMode = '';
        this._isDirtyTemplateName = this.submitTemplateName = this.showDialogTemplateName = false;
    }
    private resetEditing() {
        for (let item of this._cachedData) {
            if (item.templateId == this.templateCtr.selectedValue) {
                item.isEditing = false;
                item.isChangeFromColumnViewMode = false;
                return;
            }
        }
    }
    private detectChanges() {
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        });
    }
}

class TemplateCachedModel {
    public templateId: any = null;
    public originalCountries: Array<any> = [];
    public currentCountries: Array<any> = [];
    public isEditing: boolean = false;
    public originalFileName: string = '';
    public fileName: string = '';
    public mediaRelativePath: string = '';
    public mediaSize: string = '';
    public sqlTemplate: string = '';
    public sQLQueryColumnName : string = '';
    public idSharingTreeMedia: any = null;
    public sqlVariables: string = '';
    public isChangeFromColumnViewMode: boolean = false;

    public constructor(init?: Partial<TemplateCachedModel>) {
        Object.assign(this, init);
    }
}
