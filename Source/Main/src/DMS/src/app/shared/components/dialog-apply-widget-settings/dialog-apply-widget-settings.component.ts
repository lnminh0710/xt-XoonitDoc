import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Observable, ConnectableObservable } from 'rxjs';
import { AppErrorHandler, UserProfileService, DatatableService, ModalService, CommonService } from '../../../services';
import { Module, User, ApiResultResponse } from '../../../models';
import { ModuleList } from '../../../pages/private/base';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { XnAgGridComponent } from '../xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { ComboBoxTypeConstant } from '../../../app.constants';
import { Uti } from '../../../utilities';

@Component({
    selector: 'dialog-apply-widget-settings',
    styleUrls: ['./dialog-apply-widget-settings.component.scss'],
    templateUrl: './dialog-apply-widget-settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DialogApplyWidgetSettingsComponent implements OnInit, OnDestroy {

    public showDialog = false;
    public modules: Module[] = [];
    public moduleComboFocused = false;
    public userDatasource: any;
    public selectedModule: any;
    public showLoading = false;
    private stopNow = false;

    @Input() userGridId: string;
    @Input() currentUser: User;

    @Output() onApply = new EventEmitter<any>();
    @Output() onClose = new EventEmitter<any>();

    @ViewChild('userGrid') userGrid: XnAgGridComponent;

    constructor(
        private appErrorHandler: AppErrorHandler,
        private userProfileService: UserProfileService,
        private datatableService: DatatableService,
        private changeDetectorRef: ChangeDetectorRef,
        private toasterService: ToasterService,
        private commonService: CommonService,
    ) {
    }

    ngOnInit() {
        this.getModuleList();
        this.getUserList();
    }

    ngOnDestroy() {

    }

    private getModuleList() {

        this.commonService.getListComboBox('' + ComboBoxTypeConstant.mainMenu)
            .subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.mainMenu) {
                        return;
                    }
                    (response.item.mainMenu as Array<any>).forEach(item => {
                        this.modules.push({
                            idSettingsGUI: item.idValue,
                            moduleName: item.textValue
                        })
                    });
                });
            });

        //this.modules = [];
        //let objectKeys = Object.keys(ModuleList);
        //for (let i = 0; i < objectKeys.length; i++) {
        //    if (objectKeys[i] !== 'BackOffice'
        //        && objectKeys[i] !== 'Statistic'
        //        && objectKeys[i] !== 'Tools'
        //        && objectKeys[i] !== 'TracksSetup') {
        //        if (objectKeys[i] === 'Base') {
        //            this.modules.push({
        //                idSettingsGUI: -1,
        //                moduleName: 'All Modules'
        //            });
        //        } else {
        //            this.modules.push({
        //                idSettingsGUI: ModuleList[objectKeys[i]].idSettingsGUI,
        //                moduleName: ModuleList[objectKeys[i]].moduleName
        //            });
        //        }
        //    }
        //}
    }

    public open() {
        this.showDialog = true;
        this.stopNow = false;
        this.changeDetectorRef.markForCheck();
    }

    public apply() {
        let selectedUsers: any[] = this.userGrid.getCurrentNodeItems().filter(x => x.select);
        if (!this.selectedModule || !selectedUsers.length) {
            this.toasterService.pop('warning', 'Validation Failed', 'Must select at least a module and an user');
            return;
        }

        this.showLoading = true;
        let totalCalls = selectedUsers.length;
        let current = 0;

        let callSaveUserWidgetLayout = (current, totals) => {
            if (current <= totals - 1) {
                this.userProfileService.saveUserWidgetLayout(selectedUsers[current].IdLogin, this.selectedModule.idSettingsGUI)
                    .subscribe((data: any) => {
                        selectedUsers[current].status = true;
                        selectedUsers[current].select = false;

                        this.userGrid.updateRowData([selectedUsers[current]]);

                        if (this.stopNow) {
                            this.stopNow = false;
                            this.showLoading = false;
                            this.changeDetectorRef.markForCheck();
                            return;
                        }

                        current += 1;
                        callSaveUserWidgetLayout(current, totalCalls);
                        this.changeDetectorRef.markForCheck();
                    }, (error) => {
                        this.stopNow = false;
                        this.showLoading = false;
                        this.toasterService.pop('error', 'Failed', 'Apply widget settings is not successful');
                        this.changeDetectorRef.markForCheck();
                    });
            } else {
                this.showLoading = false;
                this.stopNow = false;
                this.toasterService.pop('success', 'Success', 'Apply widget settings successfully');
                this.changeDetectorRef.markForCheck();
            }
        }

        callSaveUserWidgetLayout(current, totalCalls);
    }

    public cancel() {
        if (this.showLoading) {
            this.stopNow = true;
        } else {
            this.stopNow = false;
            this.showDialog = false;
            this.onClose.emit();
        }
        this.changeDetectorRef.markForCheck();
    }

    public onModuleComboChanged() {
        if (this.moduleComboFocused) {
            if (this.userGrid.getCurrentNodeItems().length) {
                this.userGrid.getCurrentNodeItems().forEach((user) => {
                    user.status = false;
                    this.userGrid.updateRowData([user]);
                });
            }
        }
    }

    private getUserList() {
        this.userProfileService.getUserList().subscribe((data: any) => {
            this.appErrorHandler.executeAction(() => {
                if (!data || !data.contentDetail) {
                    return;
                }

                let dataSource = this.datatableService.buildDataSource(data.contentDetail);
                dataSource = this.processDataSource(dataSource);

                if (dataSource.data.length) {
                    let currentLoggedInUserIdx = dataSource.data.findIndex(x => x.IdLogin == this.currentUser.id);
                    if (currentLoggedInUserIdx !== -1) {
                        dataSource.data.splice(currentLoggedInUserIdx, 1);
                    }
                }

                this.userDatasource = dataSource;

                this.changeDetectorRef.markForCheck();
            });
        });
    }

    private processDataSource(dataSource: any) {
        for (let i = 0; i < dataSource.columns.length; i++) {
            if (dataSource.columns[i].data !== 'LoginName'
                && dataSource.columns[i].data !== 'FirstName'
                && dataSource.columns[i].data !== 'LastName'
                && dataSource.columns[i].data !== 'Email') {
                if (dataSource.columns[i].setting.Setting && dataSource.columns[i].setting.Setting.length) {
                    if (dataSource.columns[i].setting.Setting[0].hasOwnProperty('DisplayField')) {
                        dataSource.columns[i].setting.Setting[0].DisplayField.Hidden = '1';
                        dataSource.columns[i].setting.Setting[0].DisplayField.ReadOnly = '1';
                    } else {
                        dataSource.columns[i].setting.Setting[0].DisplayField = {
                            Hidden: '1',
                            ReadOnly: '1'
                        };
                    }

                } else {
                    dataSource.columns[i].setting.Setting.push({
                        DisplayField: {
                            Hidden: '1',
                            ReadOnly: '1'
                        }
                    });
                }
            }
        }

        dataSource.columns.splice(0, 0, {
            data: 'select',
            title: 'Select',
            visible: true,
            setting: {
                Setting: [{
                    ControlType: {
                        Type: 'Checkbox'
                    }
                }]
            }
        });

        dataSource.columns.push({
            data: 'status',
            title: 'Status',
            visible: true,
            setting: {
                Setting: [{
                    ControlType: {
                        Type: 'Checkbox'
                    },
                    DisplayField: {
                        ReadOnly: '1'
                    }
                }]
            }
        });

        return dataSource;
    }
}
