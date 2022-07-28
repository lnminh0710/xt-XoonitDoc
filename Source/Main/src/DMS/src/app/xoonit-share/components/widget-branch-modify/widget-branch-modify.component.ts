import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    AfterViewInit,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorMessageTypeEnum, MessageModal } from '@app/app.constants';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { BaseComponent } from '@app/pages/private/base';
import { BranchService, CommonService, HeadQuarterService } from '@app/services';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { ToasterService } from 'angular2-toaster';
import { PopupRef } from '../global-popup/popup-ref';
import { get } from 'lodash-es';
import { OctopusCompanyEnum } from '@app/models/octopus-document.model';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

@Component({
    selector: 'widget-branch-modify',
    templateUrl: './widget-branch-modify.component.html',
    styleUrls: ['./widget-branch-modify.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetBranchModifyComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;

    public formData: FormGroup;
    public dataFields = {
        BRANCH_NUMBER: <ControlData>{
            controlName: 'B09Branches_BranchNr',
            controlName_Temp: 'BranchNr',
            displayName: 'Branch Number',
            isRequired: true,
            order: 1,
            defaultValue: '',
        },
        BRANCH_NAME: <ControlData>{
            controlName: 'B09Branches_BranchName',
            controlName_Temp: 'BranchName',
            displayName: 'Branch Name',
            isRequired: true,
            order: 2,
            defaultValue: '',
        },
        BRANCH_ADDITION: <ControlData>{
            controlName: 'B09Branches_BranchNameAdd',
            controlName_Temp: 'BranchNameAdd',
            displayName: 'Branch Addtion',
            isRequired: false,
            order: 3,
            defaultValue: '',
        },
        RAYON: <ControlData>{
            controlName: 'B09Branches_Rayon',
            controlName_Temp: 'Rayon',
            displayName: 'Rayon',
            isRequired: false,
            order: 4,
            defaultValue: null,
        },
        IS_ADDRESS_SAME_HQ: <ControlData>{
            controlName: 'B09Branches_IsAddressSameHQ',
            controlName_Temp: 'IsAddressSameHQ',
            displayName: 'Same Address with Headquarter',
            isRequired: false,
            order: 5,
            defaultValue: false,
        },
        STREET: <ControlData>{
            controlName: 'B00SharingAddress_Street',
            controlName_Temp: 'Street',
            displayName: 'Street',
            isRequired: false,
            order: 6,
            defaultValue: '',
        },
        STREET_ADDITION: <ControlData>{
            controlName: 'B00SharingAddress_StreetAddition1',
            controlName_Temp: 'StreetAddition1',
            displayName: 'Street Addition',
            isRequired: false,
            order: 7,
            defaultValue: null,
        },
        ZIP: <ControlData>{
            controlName: 'B00SharingAddress_Zip',
            displayName: 'Zip',
            controlName_Temp: 'Zip',
            isRequired: false,
            order: 8,
            defaultValue: '',
        },
        PLACE: <ControlData>{
            controlName: 'B00SharingAddress_Place',
            displayName: 'Place',
            controlName_Temp: 'Place',
            isRequired: false,
            order: 9,
            defaultValue: '',
        },
        AREA: <ControlData>{
            controlName: 'B00SharingAddress_Area',
            displayName: 'Area',
            controlName_Temp: 'Area',
            isRequired: false,
            order: 10,
            defaultValue: null,
        },
        LANGUAGE: <ControlData>{
            controlName: 'B00SharingAddress_IdRepLanguage',
            controlName_Temp: 'IdRepLanguage',
            displayName: 'Language',
            isRequired: false,
            order: 11,
            defaultValue: '1',
        },
        COUNTRY: <ControlData>{
            controlName: 'B00SharingAddress_IdRepIsoCountryCode',
            controlName_Temp: 'Addr_IdRepIsoCountryCode',
            displayName: 'Country',
            isRequired: false,
            order: 12,
            defaultValue: '204',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        OFFICE_PHONE: <ControlData>{
            controlName: 'IdRepCommunicationType_1',
            controlName_Temp: 'OfficePhone',
            displayName: 'Office phone',
            isRequired: false,
            order: 13,
            defaultValue: '',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        OFFICE_EMAIL: <ControlData>{
            controlName: 'IdRepCommunicationType_3',
            controlName_Temp: 'OfficeEmail',
            displayName: 'Office email',
            isRequired: false,
            pattern: ValidatorPattern.EMAIL,
            order: 14,
            defaultValue: '',
        },
        TITLE: <ControlData>{
            controlName: 'B00SharingName_IdRepTitle',
            controlName_Temp: 'IdRepTitle',
            displayName: 'Title',
            isRequired: false,
            order: 15,
            defaultValue: null,
        },
        FIRST_NAME: <ControlData>{
            controlName: 'B00SharingName_FirstName',
            controlName_Temp: 'FirstName',
            displayName: 'First name',
            isRequired: false,
            order: 16,
            defaultValue: '',
        },
        LAST_NAME: <ControlData>{
            controlName: 'B00SharingName_LastName',
            controlName_Temp: 'LastName',
            displayName: 'Last name',
            isRequired: false,
            order: 17,
            defaultValue: '',
        },
        POSITION: <ControlData>{
            controlName: 'B09CollateBranchesName_IdRepEmployeePosition',
            controlName_Temp: 'IdRepEmployeePosition',
            displayName: 'Positiion',
            isRequired: false,
            order: 18,
            defaultValue: '',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        DIRECT_PHONE: <ControlData>{
            controlName: 'IdRepCommunicationType_7',
            controlName_Temp: 'DirectPhone',
            displayName: 'Direct Phone',
            isRequired: false,
            order: 19,
            defaultValue: '',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        MOBILE_PHONE: <ControlData>{
            controlName: 'IdRepCommunicationType_2',
            controlName_Temp: 'MobilePhone',
            displayName: 'Mobile Phone',
            isRequired: false,
            order: 20,
            defaultValue: '',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        EMAIL: <ControlData>{
            controlName: 'IdRepCommunicationType_8',
            controlName_Temp: 'Email',
            displayName: 'Email',
            isRequired: false,
            pattern: ValidatorPattern.EMAIL,
            order: 21,
            defaultValue: '',
        },
        NOTE: <ControlData>{
            controlName: 'B09Branches_Notes',
            controlName_Temp: 'Notes',
            displayName: 'Note',
            isRequired: false,
            order: 22,
            defaultValue: '',
        },

        // hidden control
        B09Branches_IdBranches: <ControlData>{
            controlName: 'B09Branches_IdBranches ',
            controlName_Temp: 'ID',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09Branches_IdRepLanguage: <ControlData>{
            controlName: 'B09Branches_IdRepLanguage',
            controlName_Temp: 'Addr_IdRepLanguage',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09Branches_IdPersonHeadCompany: <ControlData>{
            controlName: 'B09Branches_IdPersonHeadCompany',
            controlName_Temp: 'IdPersonHeadCompany',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09Branches_IsActive: <ControlData>{
            controlName: 'B09Branches_IsActive',
            controlName_Temp: 'IsActive',
            displayName: '',
            isRequired: false,
            defaultValue: '1',
        },
        B09Branches_IsDeleted: <ControlData>{
            controlName: 'B09Branches_IsDeleted',
            controlName_Temp: 'IsDeleted',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09Branches_ID: <ControlData>{
            controlName: 'B09Branches_ID',
            controlName_Temp: 'IdBranches',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09Branches_IdSharingAddress: <ControlData>{
            controlName: 'B09Branches_IdSharingAddress',
            controlName_Temp: 'Addr_IdSharingAddress',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09Branches_IdRepNLCode: <ControlData>{
            controlName: 'B09Branches_IdRepNLCode',
            controlName_Temp: 'IdRepNLCode',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09Branches_IdRepRegionCode: <ControlData>{
            controlName: 'B09Branches_IdRepRegionCode',
            controlName_Temp: 'IdRepRegionCode',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09Branches_IdRepStoreType: <ControlData>{
            controlName: 'B09Branches_IdRepStoreType',
            controlName_Temp: 'IdRepStoreType',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09Branches_IdRepCantons: <ControlData>{
            controlName: 'B09Branches_IdRepCantons',
            controlName_Temp: 'IdRepCantons',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09Branches_IdRepSalesChannel: <ControlData>{
            controlName: 'B09Branches_IdRepSalesChannel',
            controlName_Temp: 'IdRepSalesChannel',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B00SharingAddress_IdSharingAddress: <ControlData>{
            controlName: 'B00SharingAddress_IdSharingAddress',
            controlName_Temp: 'IdSharingAddress',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B00SharingAddress_StreetAddition1: <ControlData>{
            controlName: 'B00SharingAddress_StreetAddition',
            controlName_Temp: 'StreetAddition2',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B00SharingAddress_IdRepPoBox: <ControlData>{
            controlName: 'B00SharingAddress_IdRepPoBox',
            controlName_Temp: 'IdRepPoBox',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B00SharingAddress_PoboxLabel: <ControlData>{
            controlName: 'B00SharingAddress_PoboxLabel',
            controlName_Temp: 'PoboxLabel',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        ID_SHARING_NAME: <ControlData>{
            controlName: 'B00SharingName_IdSharingName',
            controlName_Temp: 'IdSharingName',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        B09CollateBranchesName_IdCollateBranchesName: <ControlData>{
            controlName: 'B09CollateBranchesName_IdCollateBranchesName',
            controlName_Temp: 'IdCollateBranchesName',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
    };
    public controlDataList: ControlData[] = [];
    public controlDataBelongFieldIsAddressSameHQ: ControlData[] = [
        this.dataFields.STREET,
        this.dataFields.STREET_ADDITION,
        this.dataFields.ZIP,
        this.dataFields.PLACE,
        this.dataFields.AREA,
        this.dataFields.LANGUAGE,
        this.dataFields.COUNTRY,
        this.dataFields.OFFICE_PHONE,
        this.dataFields.OFFICE_EMAIL,
        this.dataFields.B09Branches_IdRepLanguage,
        this.dataFields.B00SharingAddress_IdSharingAddress,
        this.dataFields.B09Branches_IdSharingAddress,
    ];
    public isFocus = {};
    public isHover = {};

    public languageDefaultList = [];
    public countryCodeDefaultList = [];
    public titleDefaultList = [];
    public positionDefaultList = [];

    public idKey = '';
    public headquarterId = '';
    public headquarterData: any;

    public isLoading = false;

    @ViewChild(PerfectScrollbarDirective, { static: false }) scrollArea?: PerfectScrollbarDirective;

    constructor(
        protected router: Router,
        private commonService: CommonService,
        public headQuarterService: HeadQuarterService,
        private branchService: BranchService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
        public popupRef: PopupRef,
        private toastrService: ToasterService,
    ) {
        super(router);
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }
    ngOnInit() {
        this.idKey = this.popupRef.params.data?.idKey;
        this.headquarterId = this.popupRef.params.data?.idHeadquarter;

        this._initFormData();
        this._onSubscribe();

        if (this.idKey) {
            this._getDataById();
        }
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.scrollArea.update();
            this.cdr.detectChanges();
        }, 200);
    }

    //#region Private: init and subscribe
    private _onSubscribe() {
        this.formData?.controls[this.dataFields.LANGUAGE.controlName].valueChanges.subscribe((value) => {
            this.formData.controls[this.dataFields.B09Branches_IdRepLanguage.controlName].setValue(value);
        });
        this.formData?.controls[this.dataFields.IS_ADDRESS_SAME_HQ.controlName].valueChanges.subscribe((value) => {
            for (let index = 0; index < this.controlDataBelongFieldIsAddressSameHQ.length; index++) {
                const element = this.controlDataBelongFieldIsAddressSameHQ[index];
                element.isReadOnly = value;

                if (!this.headquarterData) continue;
                if (value) {
                    this.formData.controls[element.controlName].setValue(this.headquarterData[element.controlName]);
                    if (element.controlName === 'B09Branches_IdSharingAddress') {
                        this.formData.controls[element.controlName].setValue(
                            this.headquarterData[this.dataFields.B00SharingAddress_IdSharingAddress.controlName],
                        );
                    }
                    if (element.controlName === 'B09Branches_IdRepLanguage') {
                        this.formData.controls[element.controlName].setValue(
                            this.headquarterData[this.dataFields.LANGUAGE.controlName],
                        );
                    }
                } else {
                    const defaultValue = this._getDefaultValue(element.defaultValue, element.controlName);
                    this.formData.controls[element.controlName].setValue(defaultValue);
                }
            }
        });
        this.formData?.controls[this.dataFields.FIRST_NAME.controlName].valueChanges.subscribe((value) => {
            const lastname = this.formData?.controls[this.dataFields.LAST_NAME.controlName]?.value;
            this._addValidatorForPostion(value, lastname);
        });
        this.formData?.controls[this.dataFields.LAST_NAME.controlName].valueChanges.subscribe((value) => {
            const firstname = this.formData?.controls[this.dataFields.FIRST_NAME.controlName]?.value;
            this._addValidatorForPostion(firstname, value);
        });
    }
    private _addValidatorForPostion(firstname: string, lastname: string) {
        if (firstname || lastname) {
            // re-render ui
            this.dataFields.POSITION.isRequired = true;
            // set to form
            this.formData?.controls[this.dataFields.POSITION.controlName].setValidators([Validators.required]);
            this.formData?.controls[this.dataFields.POSITION.controlName].updateValueAndValidity();
            this.formData?.controls[this.dataFields.POSITION.controlName].markAsDirty();
        } else if (!firstname && !lastname) {
            // re-render ui
            this.dataFields.POSITION.isRequired = false;
            // set to form
            this.formData?.controls[this.dataFields.POSITION.controlName].setValidators(null);
            this.formData?.controls[this.dataFields.POSITION.controlName].updateValueAndValidity();
        }
        this.cdr.detectChanges();
    }
    private _getDefaultValue(defaultValue: any, controlName: string) {
        if (controlName === 'B09Branches_IdPersonHeadCompany') defaultValue = this.headquarterId;
        if (controlName === 'B09Branches_IdRepLanguage') defaultValue = this.dataFields.LANGUAGE.defaultValue;

        return defaultValue;
    }
    private _getLanguages() {
        this.languageDefaultList = [];
        this.commonService
            .getListComboBox('language', '', false)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res) => {
                    this.languageDefaultList = get(res, 'item.language') || [];
                    this.cdr.detectChanges();
                },
                (err) => {},
            );
    }
    private _getCountryCodes() {
        this.countryCodeDefaultList = [];
        this.commonService
            .getListComboBox('countryCode', '', false)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res) => {
                    this.countryCodeDefaultList = get(res, 'item.countryCode') || [];
                    this.cdr.detectChanges();
                },
                (err) => {},
            );
    }
    private _getTitles() {
        this.titleDefaultList = [];
        this.commonService
            .getListComboBox('title', '', false)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res) => {
                    this.titleDefaultList = get(res, 'item.title') || [];
                    this.cdr.detectChanges();
                },
                (err) => {},
            );
    }
    private _getPositions() {
        this.positionDefaultList = [];
        this.commonService
            .getListComboBox('employeePosition', '', false)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res) => {
                    this.positionDefaultList = get(res, 'item.employeePosition') || [];
                    this.cdr.detectChanges();
                },
                (err) => {},
            );
    }
    private _getDataById() {
        const branchItem = this.popupRef.params.data?.branchItem;
        const formValueData = Uti.convertJsonDataToFormDataWithControlTempAndCommunication(
            branchItem,
            this.controlDataList,
        );
        if (this.formData && formValueData) {
            this.formData.patchValue(formValueData);
            this.cdr.detectChanges();
        }
    }
    private _getHeadquarterById() {
        this.headQuarterService
            .getById(this.headquarterId)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res: any) => {
                    this.headquarterData = Uti.convertJsonDataToFormDataWithCommunication(res);
                    this.cdr.detectChanges();
                },
                (err) => {},
            );
    }
    private _initFormData() {
        for (const key in this.dataFields) {
            if (Object.prototype.hasOwnProperty.call(this.dataFields, key)) {
                const element = this.dataFields[key];
                this.controlDataList.push(element);
            }
        }
        this._getHeadquarterById();
        this._getLanguages();
        this._getCountryCodes();
        this._getTitles();
        this._getPositions();

        const initForm = this.fb.group({});
        this.controlDataList.forEach((element: ControlData) => {
            // add to hover and focus
            this.isFocus[element.controlName] = false;
            this.isHover[element.controlName] = false;

            // new control and set validation
            const defaultValue = this._getDefaultValue(element.defaultValue, element.controlName);
            const control = new FormControl(defaultValue);
            const validatorList = [];
            if (element.isRequired) {
                validatorList.push(Validators.required);
            }
            if (element.pattern) {
                validatorList.push(Validators.pattern(element.pattern));
            }
            control.setValidators(validatorList);
            initForm.addControl(element.controlName, control);
        });
        this.formData = initForm;
        this.cdr.detectChanges();
    }
    //#endregion

    //#region Handle form
    public changeValueHover(controlName: string, value: boolean) {
        if (!controlName) return;

        this.isHover[controlName] = value;
    }
    public changeValueFocus(controlName: string, value: boolean) {
        if (!controlName) return;

        this.isFocus[controlName] = value;
    }
    public clearText(controlName: string) {
        if (!controlName) return;

        this.formData.controls[controlName].setValue('');
    }
    public closeDialog(isSuccess: boolean = false) {
        this.popupRef.close({ isSuccess });

        this.cdr.detectChanges();
    }
    public submit() {
        if (!this.formData.valid) {
            this.toastrService.pop(MessageModal.MessageType.error, 'System', `Form Data is invalid!`);
            return;
        }

        this.isLoading = true;
        const submitData = Uti.convertFormDataToJsonDataWithCommunication(this.formData.value, 'JSONComms');
        if (!submitData) {
            this.toastrService.pop(MessageModal.MessageType.error, 'System', `Data has problem, please try again!`);
            this.isLoading = false;
            return;
        }
        this.branchService
            .updateBranch(submitData)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res) => {
                    this.isLoading = false;
                    this.cdr.detectChanges();
                    if (!res?.item?.isSuccess || res?.item?.returnID === '-1') {
                        this.toastrService.pop(
                            MessageModal.MessageType.error,
                            'System',
                            `Save Fail, ${res?.item?.userErrorMessage}!`,
                        );
                        return;
                    }

                    this.toastrService.pop(MessageModal.MessageType.success, 'System', res?.item?.userErrorMessage);
                    this.closeDialog(true);
                },
                (err) => {
                    this.isLoading = false;
                    this.cdr.detectChanges();
                    this.toastrService.pop(MessageModal.MessageType.error, err);
                },
            );
    }
    //#endregion
}
