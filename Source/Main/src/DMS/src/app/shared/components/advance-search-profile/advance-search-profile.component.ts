import { Component, OnInit, Input, Output, OnDestroy, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { Uti } from '@app/utilities';
import { ModalService, GlobalSettingService, UserService, AppErrorHandler } from '@app/services';
import {
  MessageModel,
  GlobalSettingModel,
    User,
    MessageModalModel,
    MessageModalHeaderModel,
    MessageModalBodyModel,
    MessageModalFooterModel,
    ButtonList,
} from '@app/models';
import { ConfirmNewProfileComponent } from './confirm-new-profile';
import { GlobalSettingConstant, MessageModal } from '@app/app.constants';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { ActivatedRoute, Params } from '@angular/router';
import cloneDeep from 'lodash-es/cloneDeep';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

@Component({
    selector: 'advance-search-profile',
    styleUrls: ['./advance-search-profile.component.scss'],
    templateUrl: './advance-search-profile.component.html',
})
export class AdvanceSearchProfileComponent extends BaseComponent implements OnInit, OnDestroy {
    private EMPTY_CONDITION = [{ condition: 'And', field: '', operator: '', value: '' }];

    public profileListData: any = {
        columns: this.createColumnForGrid(),
        data: [],
    };
    public selectedProfile: any = {};
    public hasProfileNameError = false;
    public isDisableDelete = true;
    public isDisableUpdate = true;
    public isDisableSaveNewProfile = true;

    private currentUser: User;
    private currentIdSettingsGlobal: any;
    private moduleId: any = -1;
    private isSaveAs = false;
    private isCreating = false;
    private isDirty = false;
    private isClickingNewItem = false;
    private nextSelectItem: any = {};
    private _reselectPreviousItem = false;

    @ViewChild('confirmNewProfile') confirmNewProfile: ConfirmNewProfileComponent;
    @ViewChild(XnAgGridComponent) public xnAgGridComponent: XnAgGridComponent;

    @Input() formData: any;

    @Output() onExposeDataAction: EventEmitter<any> = new EventEmitter();
    @Output() onNewAction: EventEmitter<any> = new EventEmitter();
    @Output() onConfirmNoAction: EventEmitter<any> = new EventEmitter();

    constructor(
        private _modalService: ModalService,
    private _globalSettingService: GlobalSettingService,
    private _appErrorHandler: AppErrorHandler,
    private _globalSettingConstant: GlobalSettingConstant,
    private _userService: UserService,
    private _toasterService: ToasterService,
    private _elementRef: ElementRef,
    private _route: ActivatedRoute,
        router?: Router,
    ) {
        super(router);
    }

  public ngOnInit() {
    this.moduleId = this._route.snapshot.queryParams['moduleId'];
    this.getProfileData();
    this._userService.currentUser.subscribe((user: User) => {
      this._appErrorHandler.executeAction(() => {
        this.currentUser = user;
      });
    });
  }

  public ngOnDestroy() {}

    public profileListRowClick(item: any) {
        if (this._reselectPreviousItem) {
            this._reselectPreviousItem = false;
            return;
        }
        if (this.isDirty) {
            this.isClickingNewItem = true;
            this.nextSelectItem = Uti.mapArrayToObject(item);
            this._modalService.unsavedWarningMessageDefault({
                headerText: 'Save Data',
                onModalSaveAndExit: this.callSaveDataWhenClickingNewItem.bind(this),
                onModalExit: this.callExitClickingNewItem.bind(this),
                onModalCancel: this.callCancelClickingNewItem.bind(this),
            });
            return;
        }
        this.selectGridItem(Uti.mapArrayToObject(item));
    }

    public onCellEditingStarted(item: any) {
        this.selectedProfile = cloneDeep(item);
    }

    public onCellEditingStopped(item: any) {
        if (this.selectedProfile.globalName === item.data.globalName) return;
        this.selectedProfile = item.data;
        this.saveEdittingProfile();
    }

    public onClickNewSearch() {
        this.isDirty = false;
        this.selectedProfile = {};
        this.xnAgGridComponent.selectRowIndex(-1);
        this.isDisableUpdate = this.isDisableSaveNewProfile = this.isDisableDelete = true;
    }

    public callSaveWhenClickNew() {
        this.isCreating = true;
        this.callSavingProfile(!this.selectedProfile || !this.selectedProfile.idSettingsGlobal);
    }

  public onClickDelete() {
    this._modalService.confirmDeleteMessageHtmlContent({
      headerText: 'Delete Profile',
      message: [{ key: '<p>' }, { key: 'Modal_Message__Do_You_Want_To_Delete_Selected_Profile' }, { key: '</p>' }],
      callBack1: () => {
        this.deleteProfile();
      },
        });
    }

    public onSaveHandler(profile: any) {
        this.saveProfileData(this.makeSavingData(profile));
    }

    public onCloseHandler() {
        if (!this.selectedProfile || !this.selectedProfile.idSettingsGlobal) {
            // when creating new item then unselect grid item
            this.xnAgGridComponent.selectRowIndex(-1);
        }
        // this.callCreateNewProfile();
    }

    public callSavingProfile(isSaveAs?: boolean) {
        this.isSaveAs = isSaveAs;
        if (!isSaveAs) {
            this.confirmSaveExistedItem();
            return;
        }
        this.confirmNewProfile.show();
    }

    public onDirtyHandler() {
        this.isDirty = true;
        this.isDisableSaveNewProfile = false;
        if (this.selectedProfile.idLogin != this.currentUser?.id) {
            return;
        }
        if (this.selectedProfile && this.selectedProfile.idSettingsGlobal) {
            this.isDisableUpdate = false;
        }
    }

    public cellValueChangedHandler(data: any) {
        this.selectedProfile = data;
        this.saveEdittingProfile();
    }

    public isEditingOnOtherUserProfile() {
        if (!this.selectedProfile || !this.selectedProfile.idLogin) return false;
        return this.selectedProfile.idLogin != this.currentUser?.id;
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private getProfileData() {
        this._globalSettingService.getAdvanceSearchProfile(this.moduleId).subscribe((resutl: any) => {
            this._appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(resutl)) {
                    this.profileListData = {
                        columns: this.createColumnForGrid(),
                        data: [],
                    };
                    return;
                }
                this.profileListData = {
                    columns: this.createColumnForGrid(),
                    data: this.makeDataForGrid(resutl.item[0]),
                };

                // Make selected right item
                this.selectDefaultItem();
            });
        });
    }

    private relectNextRow() {
        if (this.isClickingNewItem && this.nextSelectItem) {
            // this.selectGridItem(this.nextSelectItem);
            setTimeout(() => {
                this.selectRightItemWithId(this.nextSelectItem.idSettingsGlobal);
            }, 700);
            this.isClickingNewItem = false;
            return true;
        }
        return false;
    }

    private selectGridItem(item: any) {
        this.selectedProfile = item;
        this.nextSelectItem = {};
        this.makeIsDisableSave(this.selectedProfile);
        this.setSelectedForProfile(this.selectedProfile);
    }

    private callCreateNewProfile() {
        if (this.isCreating) {
            this.currentIdSettingsGlobal = null;
            this.isCreating = false;
            this.onNewAction.emit();
            return true;
        }
        return false;
    }

    private selectDefaultItem() {
        if (this.callCreateNewProfile()) {
            return;
        }
        if (this.relectNextRow()) {
            return;
        }
        setTimeout(() => {
            if (!this.profileListData.data || !this.profileListData.data.length) return;
            if (!this.currentIdSettingsGlobal) {
                this.xnAgGridComponent.selectRowIndex(0);
                return;
            }
            this.selectRightItemWithId(this.currentIdSettingsGlobal);
        }, 700);
    }

    private selectRightItemWithId(idSettingsGlobal: any) {
        for (let i = 0; i < this.profileListData.data.length; i++) {
            const _idSettingsGlobal = this.profileListData.data[i].idSettingsGlobal;
            if (_idSettingsGlobal !== idSettingsGlobal) continue;
            this.xnAgGridComponent.selectRowIndex(-1);
            setTimeout(() => {
                this.xnAgGridComponent.selectRowIndex(i);
            });
            this.currentIdSettingsGlobal = null;
            break;
        }
    }

    private saveEdittingProfile() {
        if (!this.selectedProfile) return;
        this.makeDataForEdit();
        this.saveProfileData(this.selectedProfile);
    }

    private makeDataForEdit() {
        this.selectedProfile.description = this.selectedProfile.isGlobal ? '1' : '0';
        this.selectedProfile.idSettingsGUI = this.moduleId;
    }

    private makeSavingData(profile: any) {
        if (this.isSaveAs) {
            return this.makeNewData(profile);
        }
        this.selectedProfile.jsonSettings = this.makeJsonForSaving(profile.isSaveWithValue);
        this.makeDataForEdit();
        return this.selectedProfile;
    }

    private makeNewData(profile: any) {
        return new GlobalSettingModel({
            globalName: profile.profileName,
            description: profile.isGlobal ? '1' : '0', // use for global or private
            jsonSettings: this.makeJsonForSaving(profile.isSaveWithValue),
            globalType: this._globalSettingConstant.searchProfile,
            isActive: true,
            idSettingsGUI: this.moduleId, // use Description column to store module Id
            idLogin: this.currentUser?.id,
        });
    }

    private makeJsonForSaving(isSaveWithValue: boolean) {
        if (this.formData && this.formData.length) {
            this.formData.forEach((formItem) => {
                if (formItem.dataType === 'date') {
                    formItem.value = Uti.parseDateToDBString(formItem.value);
                }
            });
        }
        if (isSaveWithValue) {
            return JSON.stringify(this.formData);
        }
        let result = cloneDeep(this.formData);
        for (let item of result) {
            item.value = '';
        }
        return JSON.stringify(result);
    }

    private saveProfileData(currentData: any) {
        this._globalSettingService.saveGlobalSetting(currentData).subscribe(
            (result) => this.saveProfileDataSuccess(result),
            (error) => this.serviceError(error),
        );
    }

    private saveProfileDataSuccess(result: any) {
        this.currentIdSettingsGlobal = result.returnValue;
        this._toasterService.pop('success', 'Success', 'Saving data is successful');

        // Re-get data for grid
        this.getProfileData();

        // Handle some flags
        this.isDirty = false;
        this._modalService.hideModal();

        if (!this.confirmNewProfile) return;
        this.confirmNewProfile.close(this.isCreating || this.isClickingNewItem);
    }

    private serviceError(error) {
        this._toasterService.pop('error', 'Error', 'Saving data is fail');
        console.log(error);
    }

    private setSelectedForProfile(item: any) {
        this.onExposeDataAction.emit(this.selectedProfile);
    }

    private deleteProfile() {
        this._globalSettingService.deleteGlobalSettingById(this.selectedProfile.idSettingsGlobal).subscribe(
            (result) => this.deleteProfileDataSuccess(result),
            (error) => this.serviceError(error),
        );
    }

    private deleteProfileDataSuccess(result) {
        this._toasterService.pop('success', 'Success', 'Deleting data is successful');
        this.profileListData = {
            columns: this.profileListData.columns,
            data: this.profileListData.data.filter((x) => x.idSettingsGlobal !== this.selectedProfile.idSettingsGlobal),
        };
        if (this.profileListData.data.length > 1) {
            this.xnAgGridComponent.selectRowIndex(0);
        } else {
            this.isDisableDelete = true;
        }
        this.selectedProfile = {};
        this.selectDefaultItem();
    }

    private makeIsDisableSave(selectedProfile: any) {
        // Set disable for Update button waiting user edit form
        this.isDisableUpdate = this.isDisableDelete = true;
        this.isDisableSaveNewProfile = false;
        if (selectedProfile.idLogin == this.currentUser?.id) {
            this.isDisableDelete = false;
            return;
        }
        // When profile was created by other then do not update and delete
        this.isDisableUpdate = this.isDisableDelete = selectedProfile.description == '1';
    }

    private makeDataForGrid(rawData: Array<any>) {
        return rawData.map((x) => {
            return {
                idSettingsGlobal: x.IdSettingsGlobal,
                description: x.Description,
                jsonSettings: x.JsonSettings,
                globalType: x.GlobalType,
                idLogin: x.IdLogin,
                globalName: x.GlobalName,
                loginName: x.LoginName,
                isGlobal: x.Description == '1',
                IsActive: this.makeIsActiveData(x),
            };
        });
    }

    private makeIsActiveData(itemData: any) {
        if (itemData.IdLogin == this.currentUser?.id) return true;
        return !(itemData.Description == '1');
    }

    private callSaveDataWhenClickingNewItem() {
        this.callSavingProfile(!this.selectedProfile || !this.selectedProfile.idSettingsGlobal);
    }

    private callExitClickingNewItem() {
        this.isClickingNewItem = this.isDirty = false;
        if (this.nextSelectItem && this.nextSelectItem.idSettingsGlobal) {
            this.selectRightItemWithId(this.nextSelectItem.idSettingsGlobal);
        }
        this.nextSelectItem = {};
        this.onConfirmNoAction.emit();
    }

    private callCancelClickingNewItem() {
        // reselect previous item
        if (!this.selectedProfile || !this.selectedProfile.idSettingsGlobal) {
            // when creating new item then unselect grid item
            this.xnAgGridComponent.selectRowIndex(-1);
            return;
        }
        this._reselectPreviousItem = true;
        this.selectRightItemWithId(this.selectedProfile.idSettingsGlobal);
    }

    private confirmSaveExistedItem() {
        this._modalService.showMessage(
            new MessageModalModel({
                customClass: 'dialog-saving-existed-profile-item',
                messageType: MessageModal.MessageType.warning,
                modalSize: MessageModal.ModalSize.middle,
                showCloseButton: false,
                header: new MessageModalHeaderModel({
                    text: 'Save profile',
        }),
        body: new MessageModalBodyModel({
          isHtmlContent: true,
          content: [{ key: '<p>' }, { key: 'Modal_Message__Do_You_Want_To_Save_Profile_With' }, { key: '</p>' }],
        }),
        footer: new MessageModalFooterModel({
          buttonList: [
                        new ButtonList({
                            buttonType: MessageModal.ButtonType.warning,
                            text: 'Save with value',
                            customClass: '',
                            callBackFunc: () => {
                                this.onSaveHandler({
                                    isSaveWithValue: true,
                                });
                            },
                        }),
                        new ButtonList({
                            buttonType: MessageModal.ButtonType.warning,
                            text: 'Save without value',
                            customClass: '',
                            callBackFunc: () => {
                                this.onSaveHandler({
                                    isSaveWithValue: false,
                                });
                            },
                        }),
                        new ButtonList({
                            buttonType: MessageModal.ButtonType.default,
                            text: "Don't save",
                            customClass: '',
                            callBackFunc: () => {
                                this._modalService.hideModal();
                                this.isDirty = false;
                                this.selectGridItem(this.nextSelectItem);
                            },
                        }),
                    ],
                }),
            }),
        );
    }

    private createColumnForGrid() {
        return [
            {
                title: 'idSettingsGlobal',
                data: 'idSettingsGlobal',
                visible: false,
                readOnly: true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1',
                            },
                        },
                    ],
                },
            },
            {
                title: 'description',
                data: 'description',
                visible: false,
                readOnly: true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1',
                            },
                        },
                    ],
                },
            },
            {
                title: 'jsonSettings',
                data: 'jsonSettings',
                visible: false,
                readOnly: true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1',
                            },
                        },
                    ],
                },
            },
            {
                title: 'globalType',
                data: 'globalType',
                visible: false,
                readOnly: true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1',
                            },
                        },
                    ],
                },
            },
            {
                title: 'idLogin',
                data: 'idLogin',
                visible: false,
                readOnly: true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1',
                            },
                        },
                    ],
                },
            },
            {
                title: 'IsActive',
                data: 'IsActive',
                visible: false,
                readOnly: true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1',
                            },
                            ControlType: {
                                Type: 'Checkbox',
                            },
                        },
                    ],
                },
            },
            {
                title: 'Profile',
                data: 'globalName',
                visible: true,
                readOnly: false,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                Width: 120,
                                ReadOnly: '0',
                            },
                            ControlType: {
                                Type: 'Textbox',
                            },
                        },
                    ],
                    width: 120,
                },
            },
            {
                title: 'LoginName',
                data: 'loginName',
                visible: true,
                readOnly: true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1',
                            },
                        },
                    ],
                    width: 120,
                },
            },
            {
                title: 'Global',
                data: 'isGlobal',
                visible: true,
                readOnly: false,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                Width: 80,
                            },
                            ControlType: {
                                Type: 'Checkbox',
                            },
                        },
                    ],
                    width: 80,
                },
            },
        ];
    }
}
