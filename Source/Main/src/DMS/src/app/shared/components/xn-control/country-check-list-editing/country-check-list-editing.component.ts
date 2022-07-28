
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    ElementRef,
    ChangeDetectorRef,
    ViewChild,
    EventEmitter
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import { CommonService,
    AppErrorHandler,
    ModalService } from '@app/services';
import { ComboBoxTypeConstant,
    MessageModal,
    KeyCode } from '@app/app.constants';
import { ApiResultResponse,
    MessageModel } from '@app/models';
import { Uti, CustomValidators } from '@app/utilities';
import cloneDeep from 'lodash-es/cloneDeep';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { WjComboBox } from 'wijmo/wijmo.angular2.input';
import { XnCountryCheckListComponent } from '@app/shared/components/xn-control/';

@Component({
    selector: 'country-check-list-editing',
    styleUrls: ['./country-check-list-editing.component.scss'],
    templateUrl: './country-check-list-editing.component.html'
})
export class CountryCheckListEditingComponent extends BaseComponent implements OnInit, OnDestroy {
    public countryCheckListData: Array<any> = [];
    public countriesGroup: Array<CountryGroup> = [];
    public showDialog: boolean = false;
    public showDialogSelectGroupName: boolean = false;
    public groupName: string = '';
    public submitAddGroupName: boolean = false;
    public submitUpdateCountryGroup: boolean = false;
    public disabledAdd: boolean = true;
    public disabledUpdate: boolean = true;
    public disabledDelete: boolean = true;
    public groupsSelected: Array<any> = [];

    private _edittingCountryGroup: CountryGroup;
    private _countriesRawData: Array<any> = [];
    private _isDirtyGroupName: boolean = false;
    private _isDirtySelectedGroupName: boolean = false;
    private _isSelectedGroupNameFocused: boolean = false;
    private _currentCheckedCountriesData: Array<any> = [];

    @ViewChild('groupSelectedControl') groupSelectedControl: WjComboBox;
    @ViewChild('countryCheckList') countryCheckList: XnCountryCheckListComponent;

    @Output() outputData: EventEmitter<any> = new EventEmitter();

    constructor(
        private _comService: CommonService,
        private _appErrorHandler: AppErrorHandler,
        private _elementRef: ElementRef,
        private _modalService: ModalService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _toasterService: ToasterService,
        router ? : Router) {
        super(router);
        this.getDropdownlistData();
        this.getCountriesGroupData();
    }
    public ngOnInit() {
    }

    public ngOnDestroy() {
    }

    public countryGroupChecked(group: CountryGroup) {
        const checkList = this.countriesGroup.filter(x => x.checked);
        this.disabledUpdate = this.disabledDelete = !(checkList && checkList.length);

        this.countryCheckList.setActive(group.countryIds, group.checked, true);
    }

    public countryGroupDoubleClick(group: CountryGroup) {
        group.editing = true;
        setTimeout(() => {
            $('#group-name-editing-' + group.id, this._elementRef.nativeElement).focus();
        });
    }

    public updateGroupName(group: CountryGroup) {
        if (!group.dirty) return;
        //TODO: call to save data here
        group.originalText = group.text;
        group.dirty = false;
        group.editing = false;
    }

    public cancelUpdateGroupName(group: CountryGroup) {
        if (group.dirty) {
            this._modalService.unsavedWarningMessage({
                headerText: 'Saving Data',
                message: [{ key: '<p>'}, { key: 'Modal_Message__DoYouWantToSaveTheseChanges' }, { key: '<p>' }],
                onModalSaveAndExit: this.updateGroupName.bind(this),
                onModalExit: this.unEditingGroupName.bind(this)
            });
        } else {
            this.unEditingGroupName(group);
        }
    }

    public groupNameKeyup($event: any, group: CountryGroup) {
        if (($event.which === KeyCode.Enter && $event.keyCode === KeyCode.Enter)) {
            this.updateGroupName(group);
        }
        if (($event.which === KeyCode.Escape && $event.keyCode === KeyCode.Escape)) {
            this.cancelUpdateGroupName(group);
        }
        if (!Uti.isNotCharacterKey($event.keyCode)) {
            group.dirty = true;
        }
    }

    public addGroup() {
        this.groupName = '';
        this.showDialog = true;
    }

    public updateGroup() {
        const checkedItem = this.countriesGroup.filter(x => x.checked);
        if (checkedItem && checkedItem.length > 1) {
            this.buildDataForGroupsSelected();
            this.showDialogSelectGroupName = true;
        } else if (checkedItem && checkedItem.length === 1){
            this._edittingCountryGroup = checkedItem[0];
            this.saveCountryGroup({}, 'Update');
        }
    }

    public deleteGroup() {
        this._modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Delete Group',
            messageType: MessageModal.MessageType.error,
            message: [{ key: '<p>'}, { key: 'Modal_Message___DoYouWantToDeleteTheseGroups' }, { key: '<p>' }],
            buttonType1: MessageModal.ButtonType.danger,
            callBack1: () => {
                this.saveDeleteGroups();
            }
        }));
    }

    public close() {
        if (this._isDirtyGroupName) {

            this._modalService.unsavedWarningMessage({
                headerText: 'Saving Data',
                message: [{ key: '<p>'}, { key: 'Modal_Message__DoYouWantToSaveTheseChanges' }, { key: '<p>' }],
                onModalSaveAndExit: () => {
                    // TODO: will make right new data when has service
                    this.saveCountryGroup({}, 'New');
                },
                onModalExit: this.closePopup.bind(this)
            });
        } else {
            this.closePopup();
        }
    }

    public createGroupName() {
        this.submitAddGroupName = true;
        if (!this.groupName) return;

        // TODO: will make right new data when has service
        this.saveCountryGroup({}, 'New');
    }

    public groupNameChanged() {
        this._isDirtyGroupName = true;
    }

    public getDataForCountryCheckList(data: any) {
        this._currentCheckedCountriesData = data.filter(x => x.isActive);
        this.disabledAdd = !(this._currentCheckedCountriesData && this._currentCheckedCountriesData.length);
        this.outputData.emit(this._currentCheckedCountriesData);
    }

    public onGroupSelectedChanged() {
        if (this._isSelectedGroupNameFocused) {
            this._isDirtySelectedGroupName = true;
        }
        this._edittingCountryGroup = this.countriesGroup.find(x => x.id == this.groupSelectedControl.selectedValue);
    }

    public closeSelectGroupPopup() {
        if (this._isDirtySelectedGroupName) {
            this._modalService.unsavedWarningMessage({
                headerText: 'Saving Data',
                message: [{ key: '<p>'}, { key: 'Modal_Message__DoYouWantToSaveTheseChanges' }, { key: '<p>' }],
                onModalSaveAndExit: () => {
                    // TODO: will make right update data when has service
                    this.saveCountryGroup({}, 'Update');
                    this.closeSelectedGroupPopup();
                },
                onModalExit: this.closeSelectedGroupPopup.bind(this)
            });
        } else {
            this.closeSelectedGroupPopup();
        }
    }

    public updateCountryGroup() {
        if (!this.groupSelectedControl.selectedValue) return;
        this.submitUpdateCountryGroup = true;
        // TODO: will make right update data when has service
        this.saveCountryGroup({}, 'Update');
    }

    public onGroupSelectedKeyup($event: any) {
        if ($event.keyCode !== KeyCode.Enter) return;
        this.updateCountryGroup();
    }

    public onGroupSelectedGotFocus() {
        this.groupSelectedControl.isDroppedDown = true;
        this._isSelectedGroupNameFocused = true;
    }

    public groupLableClicked(group: CountryGroup) {
        group.checked = !group.checked;
        this.countryGroupChecked(group);
    }

    public groupNamePopupKeyup($event) {
        if (($event.which === KeyCode.Enter && $event.keyCode === KeyCode.Enter)) {
            this.createGroupName()
        }
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private closePopup() {
        this.submitAddGroupName = this.showDialog = false;
        this.groupName = '';
    }

    private closeSelectedGroupPopup() {
        this.showDialogSelectGroupName = false;
        this.groupsSelected.length = 0;
        this.submitUpdateCountryGroup = false;
        this._isSelectedGroupNameFocused = false;
    }

    private unEditingGroupName(group: CountryGroup) {
        group.editing = false;
        group.dirty = false;
        group.text = group.originalText;
        this._changeDetectorRef.detectChanges();
    }

    private getDropdownlistData() {
        this._comService.getListComboBox(ComboBoxTypeConstant.countryCode+'')
            .subscribe((response: ApiResultResponse) => {
                this._appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.countryCode) {
                        this._countriesRawData = [];
                        this.countryCheckListData = [];
                        return;
                    }
                    this._countriesRawData = response.item.countryCode;
                    this.countryCheckListData = cloneDeep(this._countriesRawData);
                });
            });
    }

    private getCountriesGroupData() {
        this.countriesGroup = F.createGroupNameList();

        // TODO: unREM when have service
        // this._comService.getCountryGroup()
        //     .subscribe((response: ApiResultResponse) => {
        //         this._appErrorHandler.executeAction(() => {
        //             if (!Uti.isResquestSuccess(response)) {
        //                 this.countriesGroup = [];
        //                 return;
        //             }
        //             this.countriesGroup = response.item;
        //         });
        //     });
    }

    private saveDeleteGroups() {
        const deleteGroups = this.countriesGroup.filter(x => x.checked).map(x => {
            return {
                'Id': x.id,
                'IsDeleted': 1
            }
        });
        this.saveCountryGroup(deleteGroups, 'Delete');

        // TODO: will remove this line when have service, push in service success
        this.uncheckDeletedCountries();
        this.countriesGroup = this.countriesGroup.filter(x => !x.checked);
        this._toasterService.pop('success', 'Success', 'Data is saved successfully');
    }

    private uncheckDeletedCountries() {
        const checkedCountries = this.countriesGroup.filter(x => x.checked);
        let idList: Array<any> = [];
        for (let item of checkedCountries) {
            idList = [...idList, ...item.countryIds];
        }

        this.countryCheckList.setActive(idList, false, true);
    }

    private saveCountryGroup(savingData: any, mode: string) {
        switch (mode) {
            case 'New':
                this.countriesGroup.push(new CountryGroup({
                    id: Uti.getTempId2(),
                    text: this.groupName,
                    checked: true,
                    originalText: this.groupName,
                    countryIds: this._currentCheckedCountriesData.map(x => {return x.idValue;})
                }));
                this.closePopup();
                break;
            case 'Update':
                this._edittingCountryGroup.countryIds = this._currentCheckedCountriesData.map(x => {return x.idValue;});
                this.closeSelectedGroupPopup();
        }
        this._toasterService.pop('success', 'Success', 'Data is saved successfully');
        // this._comService.saveCountryGroup(savingData)
        //     .subscribe((response: ApiResultResponse) => {
        //         this._appErrorHandler.executeAction(() => {
        //             if (!Uti.isResquestSuccess(response)) {
        //                 this.countriesGroup = [];
        //                 return;
        //             }
        //             this.countriesGroup = response.item;
        //             if (mode === 'Delete') {
        //                 this.countriesGroup = this.countriesGroup.filter(x => !x.checked);
        //             }
        //         });
        //     });
    }

    private buildDataForGroupsSelected() {
        this.groupsSelected = this.countriesGroup.filter(x => x.checked);
    }

    private focusOnTemplateName() {
        setTimeout(() => {
            $('#txt-template-name-for-upload-file', this._elementRef.nativeElement).focus();
        });
    }
}

class CountryGroup {
    public id: number = null;
    public text: string = '';
    public originalText: string = '';
    public countryIds: Array<any> = [];
    public checked: boolean = false;
    public editing: boolean = false;
    public dirty: boolean = false;

    public constructor(init?: Partial<CountryGroup>) {
        Object.assign(this, init);
    }
}
class F {
    public static createGroupNameList(): Array<CountryGroup> {
        return [
            new CountryGroup({
                id: 1,
                text: 'Country Group 1',
                originalText: 'Country Group 1',
                countryIds: ['151', '14', '13', '21']
            }),
            new CountryGroup({
                id: 2,
                text: 'Country Group 2',
                originalText: 'Country Group 2',
                countryIds: ['204', '241', '73']
            }),
            new CountryGroup({
                id: 3,
                text: 'Country Group 3',
                originalText: 'Country Group 3',
                countryIds: ['151', '241', '73', '21']
            })
        ];
    }
}