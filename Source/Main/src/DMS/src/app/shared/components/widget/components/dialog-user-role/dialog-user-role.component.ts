import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { ControlGridModel, ApiResultResponse} from '@app/models';
import { UserProfileService, AppErrorHandler, ModalService } from '@app/services';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { Uti } from '@app/utilities';
import { ColHeaderKey } from '../../../xn-control/xn-ag-grid/shared/ag-grid-constant';

@Component({
    selector: 'dialog-user-role',
    styleUrls: ['./dialog-user-role.component.scss'],
    templateUrl: './dialog-user-role.component.html'
})
export class DialogUserRoleComponent implements OnInit, OnDestroy, AfterViewInit {
    private normalUserRoleID = 2;
    private callBackAfterClose: Function;
    private callBackAfterSuccessSaved: Function;
    public showDialog = false;
    public roleDatasource: ControlGridModel = new ControlGridModel();
    public selectedUsers: Array<any> = [];

    @Input() roleGridId: string;

    //@Output() onSave = new EventEmitter();
    //@Output() onClose = new EventEmitter();

    constructor(private userProfileService: UserProfileService,
        private modalService: ModalService,
        private toasterService: ToasterService,
        private appErrorHandler: AppErrorHandler) {
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {

    }

    ngAfterViewInit() {
       
    }
   
    /**
     * open
     * @param callBackAfterClose
     */
    public open(callBackAfterClose, callBackAfterSuccessSaved) {
        this.callBackAfterClose = callBackAfterClose;
        this.callBackAfterSuccessSaved = callBackAfterSuccessSaved;
        this.showDialog = true;
        this.buildDataForRole();
    }

    public save() {
        let idLogins, idLoginRoles;
        idLogins = this.selectedUsers.map(p => p['IdLogin']).join(',');
        const selectedRoles = this.roleDatasource.data.filter(p => p[ColHeaderKey.SelectAll]);
        if (selectedRoles && selectedRoles.length) {
            idLoginRoles = selectedRoles.map(p => p['IdLoginRoles']).join(',');
        }
        if (idLogins && idLoginRoles) {
            this.userProfileService.assignRoleToMultipleUser(idLogins, idLoginRoles).subscribe(res => {
                if (res && res.item && res.item.returnID) {
                    this.toasterService.pop('success', 'Success', 'Saved successfully');
                    if (this.callBackAfterSuccessSaved) {
                        this.callBackAfterSuccessSaved();
                    }
                }
                this.showDialog = false;
                if (this.callBackAfterClose) {
                    this.callBackAfterClose();
                }
            });
        }
    }

    public cancel() {
        const selectedRoles = this.roleDatasource.data.filter(p => p[ColHeaderKey.SelectAll]);
        if (selectedRoles && selectedRoles.length) {
            this.modalService.unsavedWarningMessageDefault({
                headerText: 'Saving Role',
                onModalSaveAndExit: () => {
                    this.save();
                },
                onModalExit: () => {
                    this.showDialog = false;
                    if (this.callBackAfterClose) {
                        this.callBackAfterClose();
                    }
                },
                onModalCancel: () => {
                }
            });
        }
    }

    public onRoleChanged(e) {

    }

    private buildDataForRole() {
        this.userProfileService.getAllUserRole()
            .subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.data || !response.item.data[0] || !response.item.data[0].length) {
                        return;
                    }

                    this.roleDatasource = {
                        data: response.item.data[0],
                        columns: this.createGridColumns()
                    };

                    let found = this.roleDatasource.data.find(role => role.IdLoginRoles == this.normalUserRoleID);
                    if (found) {
                        found[ColHeaderKey.SelectAll] = true;
                    }
                });
            });
    }

    private createGridColumns(): any {
        return [
            {
                'title': 'IdLoginRoles',
                'data': 'IdLoginRoles',
                'visible': false,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1',
                                Hidden: '1'
                            }
                        }
                    ]
                }
            },
            {
                'title': 'IsBlocked',
                'data': 'IsBlocked',
                'visible': false,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1',
                                Hidden: '1'
                            }
                        }
                    ]
                }
            },
            {
                'title': 'IsDeleted',
                'data': 'IsDeleted',
                'visible': false,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1',
                                Hidden: '1'
                            }
                        }
                    ]
                }
            },
            {
                'title': 'RoleName',
                'data': 'RoleName',
                'visible': true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1'
                            }
                        }
                    ]
                }
            },
            {
                'title': 'Description',
                'data': 'Description',
                'visible': true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1'
                            }
                        }
                    ]
                }
            },
            {
                'title': 'CreateDate',
                'data': 'CreateDate',
                'visible': true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1',
                                Hidden: '1'
                            }
                        }
                    ]
                }
            }
        ];
    }
}
