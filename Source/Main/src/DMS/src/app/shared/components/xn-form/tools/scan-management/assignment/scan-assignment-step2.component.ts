import {
    Component, Input, Output, ViewChild, OnInit, OnDestroy, EventEmitter, ChangeDetectorRef
} from '@angular/core';
import { ModalService, ToolsService, AppErrorHandler, DatatableService } from '@app/services';
import find from 'lodash-es/find';
import findIndex from 'lodash-es/findIndex';
import sumBy from 'lodash-es/sumBy';
import map from 'lodash-es/map';
import isNaN from 'lodash-es/isNaN';
import isNil from 'lodash-es/isNil';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { Subscription } from 'rxjs';
import { ControlGridModel, ScanAssignmentUserLanguageCountry } from '@app/models';
import { ScanAssignmentAssignPoolsToUsers, ScanAssignmentPool, ScanAssignmentUserLogin } from '@app/models/apimodel';
import { Uti } from '@app/utilities';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { GuidHelper } from '@app/utilities/guild.helper';
import { ColHeaderKey } from '../../../../xn-control/xn-ag-grid/shared/ag-grid-constant';

@Component({
    selector: 'app-scan-assignment-step2',
    styleUrls: ['./scan-assignment.component.scss'],
    templateUrl: './scan-assignment-step2.component.html'
})
export class ScanAssignmentStep2Component extends BaseComponent implements OnInit, OnDestroy {

    private DETERMINISTIC_QUEUE_MODE = 1;
    private RANDOM_QUEUE_MODE = 2;

    listComboBox: any;
    dataSourceTableForPoolsDetail: ControlGridModel = new ControlGridModel();
    dataSourceTableForUsers: ControlGridModel = new ControlGridModel();
    queueMode: number = 1;
    isShowStep2 = false;
    private selectedPoolItems: any = [];
    private selectedUserItems: any = [];
    private isTotalAssign: boolean = false;
    public _inputData: any = {};
    private invalidUserItem: any;
    private isSetQtyReadOnly: boolean = false;
    private selectedUsers: Array<ScanAssignmentUserLogin> = [];
    public selectedPools: Array<ScanAssignmentPool> = [];
    private totalPoolQuantity: number = 0;
    private totalUserQuantity: number = 0;
    private currentUserEditting: any = null;

    @ViewChild('wjgridPoolsDetailTable') wjgridPoolsDetailTable: XnAgGridComponent;
    @ViewChild('wjgridUsersTable') wjgridUsersTable: XnAgGridComponent;

    @Input() globalProperties: any;
    @Input() wjgridPoolsDetailTableId: string;
    @Input() wjgridUsersTableId: string;
    @Input() set dataStep1(data: any) {
        this._inputData = data || {};
        this.registerService();
        this.isTotalAssign = false;
    }

    @Output() outputData: EventEmitter<any> = new EventEmitter();
    @Output() saved: EventEmitter<boolean> = new EventEmitter();
    @Output() moveToNextStep: EventEmitter<boolean> = new EventEmitter();
    @Output() selectStep1AfterSave: EventEmitter<any> = new EventEmitter();

    constructor(
        private modalService: ModalService,
        private toolsService: ToolsService,
        private appErrorHandler: AppErrorHandler,
        private datatableService: DatatableService,
        private toasterService: ToasterService,
        private ref: ChangeDetectorRef,
        protected router: Router
    ) {
        super(router);
    }

    ngOnInit() {
    }

    ngOnDestroy() {

    }

    public changeAssignQueueMode(value) {
        this.queueMode = value;
        this.isSetQtyReadOnly = value === this.RANDOM_QUEUE_MODE;

        this.changeQuantitySettingInUserTable();
        this.reUpdateAvailableForPoolDetailGrid(value);
        this.calculateQuantityPerUser();
        this.reBuildSelectedPools(value);
    }

    private changeQuantitySettingInUserTable(): void {
        for (var i = this.dataSourceTableForUsers.columns.length - 1; i >= 0; i--) {
            if (this.dataSourceTableForUsers.columns[i].data == 'Qty') {
                this.dataSourceTableForUsers.columns[i].readOnly = this.isSetQtyReadOnly;
            }
        }
    }

    private reUpdateAvailableForPoolDetailGrid(value: any) {
        if (value != 2) return;
        // Update Available
        for (let i = 0; i < this.dataSourceTableForPoolsDetail.data.length; i++) {
            this.dataSourceTableForPoolsDetail.data[i]['Available'] = this.dataSourceTableForPoolsDetail.data[i]['Qty'];
        }
    }

    private createGridColumnsForPoolsDetail() {
        const result: any = [];
        result.push(this.makeColumn('Language', 'Language', true, '35', 'nvarchar', 'Language', false));
        result.push(this.makeColumn('Country', 'Country', true, '35', 'nvarchar', 'Country', false));
        result.push(this.makeColumn('Type', 'Type', true, '35', 'nvarchar', 'Type', false));
        result.push(this.makeColumn('Qty', 'Qty', true, '0', 'int', 'Qty', false, null, 'D'));

        return result;
    }

    private registerService() {
        const model = new ScanAssignmentUserLanguageCountry({
            IdPerson: this._inputData.idPerson || '',
            IdScansContainer: this._inputData.gridItemData ? this._inputData.gridItemData.IdScansContainer || '' : '',
            IdScansContainerDispatchers: this._inputData.gridItemData ? this._inputData.gridItemData.IdScansContainerDispatchers || '' : ''
        });
        this.toolsService.getScanAssignmentUserLanguageAndCountry(model)
            .subscribe((response) => {
                this.appErrorHandler.executeAction(() => {
                    if (!response) return;
                    this.resetCalculate();
                    response = this.datatableService.formatDataTableFromRawData(response.data);
                    this.dataSourceTableForPoolsDetail = this.datatableService.buildDataSource(response);
                    this.dataSourceTableForPoolsDetail.columns.splice(0, 0, this.makeColumn('UniqueId', 'UniqueId', false, '50', 'nvarchar', 'UniqueId', true));
                    this.dataSourceTableForPoolsDetail.columns.push(this.makeColumn('Available', 'Available', true, '0', 'int', 'Available', true));
                    for (let i = 0; i < this.dataSourceTableForPoolsDetail.data.length; i++) {
                        this.dataSourceTableForPoolsDetail.data[i]['UniqueId'] = GuidHelper.generateGUID();
                        this.dataSourceTableForPoolsDetail.data[i]['Available'] = this.dataSourceTableForPoolsDetail.data[i]['Qty'];
                    }
                    this.ref.detectChanges();
                });
            });

        this.toolsService.getScanAssignmentUsers()
            .subscribe((response) => {
                this.appErrorHandler.executeAction(() => {
                    if (!response) return;
                    response = this.datatableService.formatDataTableFromRawData(response.data);
                    response = this.datatableService.buildDataSource(response);
                    response.columns.push(this.makeColumn('Qty', 'Qty', true, '0', 'int', 'Qty', this.isSetQtyReadOnly, { ValidationRange: '1' }, null, 'D'));
                    response.columns.push(this.makeColumn('ValidationRangeFrom', 'ValidationRangeFrom', false, '0', 'int', 'ValidationRangeFrom', this.isSetQtyReadOnly));
                    response.columns.push(this.makeColumn('ValidationRangeTo', 'ValidationRangeTo', false, '0', 'int', 'ValidationRangeTo', this.isSetQtyReadOnly));
                    for (let i = 0; i < response.data.length; i++) {
                        response.data[i]['Qty'] = 0;
                        response.data[i]['ValidationRangeFrom'] = 0;
                        response.data[i]['ValidationRangeTo'] = 0;
                    }
                    this.dataSourceTableForUsers = response;
                    this.ref.detectChanges();
                });
            });
    }

    private calculateQuantityPerUser(): void {
        if (!this.isSetQtyReadOnly && this.selectedUsers.length > 0 && this.selectedPools.length > 0) {
            if (this.totalPoolQuantity >= this.selectedUsers.length) {

                // Re-calculate Quantity per User.

                const mod = this.totalPoolQuantity % this.selectedUsers.length;
                const qtyPerSelectedUser: number = this.totalPoolQuantity / this.selectedUsers.length;

                // Loop all and assign value
                for (let i = this.dataSourceTableForUsers.data.length - 1; i >= 0; i--) {
                    const existedItem = find(this.selectedUsers, { 'IdLogin': this.dataSourceTableForUsers.data[i].IdLogin });
                    if (existedItem) {
                        const index = findIndex(this.selectedUsers, { 'IdLogin': existedItem.IdLogin });
                        this.selectedUsers[index].Quantity = Math.floor(qtyPerSelectedUser);
                        this.selectedUsers[index].InvalidQuantity = false;
                        this.dataSourceTableForUsers.data[i].Qty = Math.floor(qtyPerSelectedUser);
                        this.dataSourceTableForUsers.data[i][ColHeaderKey.SelectAll] = true;
                    } else {
                        this.dataSourceTableForUsers.data[i].Qty = 0;
                        this.dataSourceTableForUsers.data[i][ColHeaderKey.SelectAll] = false;
                    }
                    this.dataSourceTableForUsers.data[i]['ValidationRangeTo'] = this.dataSourceTableForUsers.data[i].Qty;
                }

                if (mod > 0) {
                    for (let i = 0; i < mod; ++i) {
                        this.selectedUsers[i].Quantity += 1;
                        const index = findIndex(this.dataSourceTableForUsers.data, { 'IdLogin': this.selectedUsers[i].IdLogin });
                        this.dataSourceTableForUsers.data[index].Qty += 1;
                        this.dataSourceTableForUsers.data[index]['ValidationRangeTo'] = this.dataSourceTableForUsers.data[index].Qty;
                    }
                }

                // Update Available
                for (let i = 0; i < this.dataSourceTableForPoolsDetail.data.length; i++) {
                    this.dataSourceTableForPoolsDetail.data[i]['Available'] = 0;
                }

            } else {
                // Show Msg
                this.showWarningDialog();

                this.selectedUsers = [];
                let totalPoolQuantity = this.totalPoolQuantity;
                for (let i = 0; i < this.dataSourceTableForUsers.data.length; ++i) {
                    if (this.dataSourceTableForUsers.data[i][ColHeaderKey.SelectAll] === true) {
                        if (totalPoolQuantity > 0) {
                            this.dataSourceTableForUsers.data[i]['Qty'] = 1;
                            this.dataSourceTableForUsers.data[i]['ValidationRangeTo'] = 1;
                            totalPoolQuantity--;
                        } else {
                            this.dataSourceTableForUsers.data[i]['Qty'] = 0;
                            this.dataSourceTableForUsers.data[i]['ValidationRangeTo'] = 0;
                        }
                        this.selectedUsers.push(this.mapScanAssignmentUserLoginModel(this.dataSourceTableForUsers.data[i]));
                    } else {
                        this.dataSourceTableForUsers.data[i]['Qty'] = 0;
                        this.dataSourceTableForUsers.data[i]['ValidationRangeTo'] = 0;
                    }
                }
            }

        } else {
            if (this.selectedUsers.length == 0) {
                // Update Available
                for (let i = 0; i < this.dataSourceTableForPoolsDetail.data.length; i++) {
                    this.dataSourceTableForPoolsDetail.data[i]['Available'] = this.dataSourceTableForPoolsDetail.data[i]['Qty'];
                }
            }
            // if(this.selectedPools.length == 0) {
            for (let i = 0; i < this.dataSourceTableForUsers.data.length; ++i) {
                this.dataSourceTableForUsers.data[i]['ValidationRangeTo'] = 0;
                this.dataSourceTableForUsers.data[i]['Qty'] = 0;
                // this.dataSourceTableForUsers.data[i][ColHeaderKey.SelectAll] = false;
            }
            // }
        }
        this.wjgridUsersTable.refresh();
        this.wjgridPoolsDetailTable.refresh();
    }

    private updateAvailableValue() {
        this.totalUserQuantity = sumBy(this.selectedUsers, function (item, index) {
            if (item.Quantity > 0 && item.InvalidQuantity === false) {
                return item.Quantity;
            } else {
                return 0;
            }
        });

        if (this.totalUserQuantity > 0) {
            if (this.totalUserQuantity === this.totalPoolQuantity) {
                for (let i = 0; i < this.dataSourceTableForPoolsDetail.data.length; i++) {
                    this.dataSourceTableForPoolsDetail.data[i]['Available'] = 0;
                }
            }

            if (this.totalUserQuantity < this.totalPoolQuantity) {
                for (let i = 0; i < this.dataSourceTableForPoolsDetail.data.length; i++) {
                    if (this.dataSourceTableForPoolsDetail.data[i][ColHeaderKey.SelectAll]) {
                        if (this.totalUserQuantity >= this.dataSourceTableForPoolsDetail.data[i]['Qty']) {
                            this.totalUserQuantity -= this.dataSourceTableForPoolsDetail.data[i]['Qty'];
                            this.dataSourceTableForPoolsDetail.data[i]['Available'] = 0;
                        }
                        if (this.totalUserQuantity < this.dataSourceTableForPoolsDetail.data[i]['Qty']) {
                            this.dataSourceTableForPoolsDetail.data[i]['Available'] = this.dataSourceTableForPoolsDetail.data[i]['Qty'] - this.totalUserQuantity;
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < this.dataSourceTableForPoolsDetail.data.length; i++) {
                this.dataSourceTableForPoolsDetail.data[i]['Available'] = this.dataSourceTableForPoolsDetail.data[i]['Qty'];
            }
        }
    }

    private updateValidateRange() {
        const totalAvailableQuantity = sumBy(this.dataSourceTableForPoolsDetail.data, function (item, index) {
            if (item[ColHeaderKey.SelectAll]) {
                return item['Available'];
            } else {
                return 0;
            }
        }.bind(this));

        if (totalAvailableQuantity > 0) {
            if (this.totalPoolQuantity > this.selectedUsers.length) {
                for (let i = 0; i < this.selectedUsers.length; i++) {
                    const index = findIndex(this.dataSourceTableForUsers.data, { 'IdLogin': this.selectedUsers[i].IdLogin });
                    if (this.selectedUsers[i].InvalidQuantity === true) {
                        this.dataSourceTableForUsers.data[index]['ValidationRangeTo'] = totalAvailableQuantity;
                    } else {
                        this.dataSourceTableForUsers.data[index]['ValidationRangeTo'] = this.dataSourceTableForUsers.data[index]['Qty'] + totalAvailableQuantity;
                    }
                }
            }
        }

        if (totalAvailableQuantity == 0) {
            for (let i = 0; i < this.selectedUsers.length; i++) {
                if (this.selectedUsers[i].InvalidQuantity === true) {
                    const index = findIndex(this.dataSourceTableForUsers.data, { 'IdLogin': this.selectedUsers[i].IdLogin });
                    this.dataSourceTableForUsers.data[index]['ValidationRangeTo'] = 0;
                }
            }
        }
    }

    onChangeSelectedPoolItems(outputData) {
        this.selectedPools = map(outputData, (function (item, index) {
            return this.mapScanAssignmentPoolModel(item);
        }).bind(this));

        // Reset Available
        for (let i = 0; i < this.dataSourceTableForPoolsDetail.data.length; i++) {
            this.dataSourceTableForPoolsDetail.data[i]['Available'] = this.dataSourceTableForPoolsDetail.data[i]['Qty'];
        }

        this.totalPoolQuantity = sumBy(outputData, function (item, index) {
            return item['Qty'] > 0 && item[ColHeaderKey.SelectAll] === true ? item['Qty'] : 0;
        });

        this.calculateQuantityPerUser();
    }

    onChangeSelectedUserItems(outputData) {
        this.currentUserEditting = outputData;

        // Reset Quantity
        for (let i = 0; i < this.dataSourceTableForUsers.data.length; i++) {
            const foundItem = find(outputData, { 'IdLogin': this.dataSourceTableForUsers.data[i]['IdLogin'] });
            this.dataSourceTableForUsers.data[i]['Qty'] = foundItem ? foundItem['Qty'] : 0;
        }

        this.selectedUsers = map(outputData, (function (item, index) {
            return this.mapScanAssignmentUserLoginModel(item);
        }.bind(this)));

        this.calculateQuantityPerUser();
    }

    onTableForUsersEditSuccess(outputData) {

        let index = findIndex(this.dataSourceTableForUsers.data, { 'IdLogin': outputData.IdLogin });
        if (outputData.Qty > 0) this.dataSourceTableForUsers.data[index][ColHeaderKey.SelectAll] = true;

        this.totalUserQuantity = sumBy(this.dataSourceTableForUsers.data, function (item, index) {
            if (item[ColHeaderKey.SelectAll] === true) {
                return item['Qty'];
            } else {
                return 0;
            }
        });

        this.totalPoolQuantity = sumBy(this.dataSourceTableForPoolsDetail.data, function (item, index) {
            if (item[ColHeaderKey.SelectAll] === true) {
                return item['Qty'];
            } else {
                return 0;
            }
        }.bind(this));

        if (outputData.Qty > 0) {
            index = findIndex(this.selectedUsers, { 'IdLogin': outputData.IdLogin });
            // Exsited
            if (index >= 0) {
                this.selectedUsers[index].Quantity = outputData.Qty;
            } else {
                this.selectedUsers.push(this.mapScanAssignmentUserLoginModel(outputData));
                index = findIndex(this.selectedUsers, { 'IdLogin': outputData.IdLogin });
            }

            if (this.totalPoolQuantity < this.totalUserQuantity) {
                this.showWarningDialog();

                this.totalUserQuantity = sumBy(this.selectedUsers, function (item, index) {
                    if (item['InvalidQuantity'] === false) {
                        return item['Quantity'];
                    } else {
                        return 0;
                    }
                });

                if (this.totalPoolQuantity < this.totalUserQuantity) {
                    this.selectedUsers[index].Quantity = 0;
                    this.selectedUsers[index].InvalidQuantity = true;
                } else {
                    this.selectedUsers[index].InvalidQuantity = false;
                }

            } else {
                this.selectedUsers[index].InvalidQuantity = false;
                index = findIndex(this.dataSourceTableForUsers.data, { 'IdLogin': outputData.IdLogin });
                this.dataSourceTableForUsers.data[index]['ValidationRangeTo'] = outputData.Qty;
            }
        }

        if (this.selectedUsers.length > 0) {
            this.updateAvailableValue();
            this.updateValidateRange();
            this.wjgridUsersTable.refresh();
        }
    }

    handleDisplayStep2(isShown: boolean) {
        this.isShowStep2 = isShown;
    }

    public save(isNext?: boolean) {
        this.wjgridUsersTable.stopEditing();
        setTimeout(() => {
            // validation 
            if (this.selectedUsers.length == 0) {
                this.toasterService.pop('warning', 'Validation Failed', 'Please select at least one user item.');
                return;
            }
            if (this.selectedPools.length == 0) {
                this.toasterService.pop('warning', 'Validation Failed', 'Please select at least one pool detail item.');
                return;
            }
            if (!this.queueMode) {
                this.toasterService.pop('warning', 'Validation Failed', 'Please select queue mode.');
                return;
            }
            if (this.totalUserQuantity > this.totalPoolQuantity) {
                this.showWarningDialog();
                return;
            }
            const model = this.mapScanAssignmentAssignPoolsToUsersModel();
            this.checkTotalAssign(model);
            this.toolsService.scanAssignmentAssignPoolsToUsers(model).subscribe((response) => {
                this.appErrorHandler.executeAction(() => {
                    if (!response) return;
                    // Show Msgs
                    this.toasterService.pop('success', 'Success', 'Assigned is successful');
                    this.saved.emit(true);
                    if (isNext) {
                        this.saveAndNext();
                    }
                    this.selectedPools = [];
                    this.selectedUsers = [];
                    this.totalPoolQuantity = 0;
                    this.totalUserQuantity = 0;
                    if (this.isTotalAssign) {
                        this.selectStep1AfterSave.emit();
                        this.isTotalAssign = false;
                    }
                });
            });
        }, 200);
    }

    private reBuildSelectedPools(value: any) {
        if (!this.selectedPools || !this.selectedPools.length) return;
        for (let item of this.selectedPools) {
            item.IdRepAssignedMethods = value
        }
    }

    private mapScanAssignmentAssignPoolsToUsersModel(): ScanAssignmentAssignPoolsToUsers {
        const scanAssignmentPools = this.selectedPools;
        let scanAssignmentUserLogin = [];
        if (this.queueMode == 1) {
            scanAssignmentUserLogin = this.selectedUsers.filter((r) => r.Quantity > 0);
        } else {
            scanAssignmentUserLogin = this.selectedUsers;
        }
        
        return new ScanAssignmentAssignPoolsToUsers({
            ScanAssignmentPools: scanAssignmentPools,
            ScanAssignmentUserLogins: scanAssignmentUserLogin
        });
    };

    private checkTotalAssign(saveData: ScanAssignmentAssignPoolsToUsers) {
        if (!saveData || !saveData.ScanAssignmentUserLogins || !saveData.ScanAssignmentUserLogins.length) {
            this.isTotalAssign = false;
            return;
        }
        let saveTotal: number = 0;
        for (let item of saveData.ScanAssignmentUserLogins) {
            saveTotal += item.Quantity;
        }
        let currentTotal: number = 0;
        for (let item1 of this.dataSourceTableForPoolsDetail.data) {
            currentTotal += item1.Qty;
        }
        this.isTotalAssign = (saveTotal >= currentTotal);
    }

    private mapScanAssignmentPoolModel(data: any): ScanAssignmentPool {
        return new ScanAssignmentPool({
            IdCountrylanguage: data.IdCountrylanguage,
            IdRepAssignedMethods: this.queueMode,
            IdScansContainerAssignment: this._inputData.gridItemData ? this._inputData.gridItemData.IdScansContainer || '' : '',
            IdScansContainerDispatchers: this._inputData.gridItemData ? this._inputData.gridItemData.IdScansContainerDispatchers || '' : ''
        });
    };

    private mapScanAssignmentUserLoginModel(data: any): ScanAssignmentUserLogin {
        return new ScanAssignmentUserLogin({
            IdLogin: data.IdLogin,
            Quantity: isNaN(data.Qty) ? 0 : data.Qty,
            InvalidQuantity: false
        });
    };

    private resetCalculate() {
        this.selectedUsers = [];
        this.selectedPools = [];
        this.totalPoolQuantity = 0;
        this.totalUserQuantity = 0;
    }

    public saveAndNext() {
        this.isShowStep2 = false;
        this.moveToNextStep.emit(true);
    }

    private emptyValueUncheckedUserItems(oldCollection: any, newCollection: any) {
        if (!oldCollection || !oldCollection.length)
            return;
        oldCollection.forEach((item) => {
            if (!newCollection || !newCollection.length)
                item.Qty = null;
            else {
                const filteredItem = newCollection.find((_item) => _item.id == item.Id);
                if (!filteredItem)
                    item.Qty = null;
            }
        })
        this.wjgridUsersTable.refresh();
    }

    private showWarningDialog() {
        this.toasterService.pop('warning', 'Validation Failed', 'The total quantity is not enough to assign users.');
    }

    private applySuggestQtyValue() {
        if (!this.invalidUserItem)
            return;
        this.selectedUserItems.forEach((_item) => {
            if (_item.Id !== this.invalidUserItem.item.Id)
                _item.Qty = 0;
            else
                _item.Qty = this.invalidUserItem.suggestQty;
        });
        if (this.wjgridUsersTable)
            this.wjgridUsersTable.refresh();
        this.invalidUserItem = null;
    }

    private initFakeDataSourceTable() {
        this.dataSourceTableForPoolsDetail = {
            data: this.initFakeDataForPoolsDetail(),
            columns: this.createGridColumnsForPoolsDetail()
        };

        this.dataSourceTableForUsers = {
            data: this.initFakeDataForUsers(),
            columns: this.createGridColumnsForUsers(true)
        };
    }

    private initFakeDataForPoolsDetail() {
        return [
            {
                Language: 'English',
                Country: 'England',
                Type: '1',
                Qty: 100
            },
            {
                Language: 'Germany',
                Country: 'German',
                Type: '2',
                Qty: 50
            },
            {
                Language: 'English',
                Country: 'Vietnam',
                Type: '2',
                Qty: 50
            }
        ]
    }

    private createGridColumnsForUsers(isQtyReadOnly?: boolean) {
        const result: any = [];
        result.push(this.makeColumn('Id', 'Id', false, '35', 'nvarchar', 'Id', false));
        result.push(this.makeColumn('User', 'User', true, '35', 'nvarchar', 'User', false));
        if (!isNil(isQtyReadOnly) && !isQtyReadOnly)
            result.push(this.makeColumn('Qty', 'Qty', true, '0', 'int', 'Qty', true, null, 'D'));
        else
            result.push(this.makeColumn('Qty', 'Qty', true, '0', 'int', 'Qty', false, null, 'D'));

        return result;
    }

    private initFakeDataForUsers() {
        return [
            {
                Id: '1',
                User: 'DataIn Administrator',
                Qty: null
            },
            {
                Id: '2',
                User: 'Ornella Cammarota',
                Qty: null
            },
            {
                Id: '3',
                User: 'Pinuccia Sacndella',
                Qty: null
            },
            {
                Id: '4',
                User: 'Vesna Medd',
                Qty: null
            }
        ]
    }

    private makeColumn(data: any, columnName: string, visible: boolean, dataLength: string, dataType: string, originalColumnName: string, isEdited?: boolean, validation?: any, className?: string, format?: string): any {
        return {
            title: data,
            data: columnName,
            visible: visible,
            format: format,
            setting: {
                DataLength: dataLength,
                DataType: dataType,
                OriginalColumnName: originalColumnName,
                Setting: [
                    {
                        ControlType: {
                            Type: dataType !== 'int' ? 'Textbox' : 'Numeric'
                        },
                        DisplayField: {
                            ReadOnly: isEdited ? '1' : '0',
                            Hidden: visible ? '0' : '1',
                        },
                        Validation: validation
                    }
                ]
            },
            className: className
        };
    }
}
