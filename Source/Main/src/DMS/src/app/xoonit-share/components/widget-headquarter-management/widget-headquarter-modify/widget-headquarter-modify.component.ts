import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorMessageTypeEnum, MessageModal } from '@app/app.constants';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { BaseComponent } from '@app/pages/private/base';
import { CommonService } from '@app/services';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { PopupRef } from '../../global-popup/popup-ref';
import { get } from 'lodash-es';
import { HeadQuarterService } from '@app/services/form/headquarter.service';
import { ToasterService } from 'angular2-toaster';
import { OctopusCompanyEnum } from '@app/models/octopus-document.model';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

@Component({
    selector: 'widget-headquarter-modify',
    templateUrl: './widget-headquarter-modify.component.html',
    styleUrls: ['./widget-headquarter-modify.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetHeadquarterModifyComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;

    public formData: FormGroup;
    public dataFields = {
        HEAD_QUARTER: <ControlData>{
            controlName: 'B00SharingCompany_Company',
            displayName: 'Head quarter',
            isRequired: true,
            order: 0,
            defaultValue: '',
        },
        IMPORT_FOLDER: <ControlData>{
            controlName: 'B00SharingCompany_ImportFolder',
            displayName: 'Import folder',
            isRequired: true,
            order: 1,
            defaultValue: '',
            pattern: ValidatorPattern.FOLDER_NAME,
        },
        STREET: <ControlData>{
            controlName: 'B00SharingAddress_Street',
            displayName: 'Street',
            isRequired: false,
            order: 2,
            defaultValue: '',
        },
        STREET_ADDITION: <ControlData>{
            controlName: 'B00SharingAddress_StreetAddition1',
            displayName: 'Street addition',
            isRequired: false,
            order: 3,
            defaultValue: null,
        },
        ZIP: <ControlData>{
            controlName: 'B00SharingAddress_Zip',
            displayName: 'Zip',
            isRequired: false,
            order: 4,
            defaultValue: '',
        },
        PLACE: <ControlData>{
            controlName: 'B00SharingAddress_Place',
            displayName: 'Place',
            isRequired: false,
            order: 5,
            defaultValue: '',
        },
        AREA: <ControlData>{
            controlName: 'B00SharingAddress_Area',
            displayName: 'Area',
            isRequired: false,
            order: 6,
            defaultValue: null,
        },
        LANGUAGE: <ControlData>{
            controlName: 'B00SharingAddress_IdRepLanguage',
            displayName: 'Language',
            isRequired: false,
            order: 7,
            defaultValue: '1',
        },
        COUNTRY: <ControlData>{
            controlName: 'B00SharingAddress_IdRepIsoCountryCode',
            displayName: 'Country',
            isRequired: false,
            order: 8,
            defaultValue: '204',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        OFFICE_PHONE: <ControlData>{
            controlName: 'IdRepCommunicationType_1',
            displayName: 'Office phone',
            isRequired: false,
            order: 9,
            defaultValue: '',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        OFFICE_EMAIL: <ControlData>{
            controlName: 'IdRepCommunicationType_3',
            displayName: 'Office email',
            isRequired: false,
            pattern: ValidatorPattern.EMAIL,
            order: 10,
            defaultValue: '',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        WEB: <ControlData>{
            controlName: 'IdRepCommunicationType_4',
            displayName: 'Web',
            isRequired: false,
            order: 11,
            defaultValue: '',
        },
        TITLE: <ControlData>{
            controlName: 'B00SharingName_IdRepTitle',
            displayName: 'Title',
            isRequired: false,
            order: 12,
            defaultValue: null,
        },
        FIRST_NAME: <ControlData>{
            controlName: 'B00SharingName_FirstName',
            displayName: 'First name',
            isRequired: false,
            order: 13,
            defaultValue: '',
        },
        LAST_NAME: <ControlData>{
            controlName: 'B00SharingName_LastName',
            displayName: 'Last name',
            isRequired: false,
            order: 14,
            defaultValue: '',
        },
        POSITION: <ControlData>{
            controlName: 'B00SharingName_Position',
            displayName: 'Positiion',
            isRequired: false,
            order: 15,
            defaultValue: '',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        DIRECT_PHONE: <ControlData>{
            controlName: 'IdRepCommunicationType_7',
            displayName: 'Direct Phone',
            isRequired: false,
            order: 16,
            defaultValue: '',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        MOBILE_PHONE: <ControlData>{
            controlName: 'IdRepCommunicationType_2',
            displayName: 'Mobile Phone',
            isRequired: false,
            order: 17,
            defaultValue: '',
        },
        // if communication, will use format: IdRepCommunicationType_{id}
        EMAIL: <ControlData>{
            controlName: 'IdRepCommunicationType_8',
            displayName: 'Email',
            isRequired: false,
            pattern: ValidatorPattern.EMAIL,
            order: 18,
            defaultValue: '',
        },
        // hidden control
        ID_PERSON: <ControlData>{
            controlName: 'B00Person_IdPerson',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        ID_PERSION_TYPE_GW: <ControlData>{
            controlName: 'B00PersonTypeGw_IdPersonTypeGw',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        ID_SHARING_NAME: <ControlData>{
            controlName: 'B00SharingName_IdSharingName',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        ID_SHARING_ADDRESS: <ControlData>{
            controlName: 'B00SharingAddress_IdSharingAddress',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        ID_SHARING_COMPANY: <ControlData>{
            controlName: 'B00SharingCompany_IdSharingCompany',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        ID_SHARING_INTERFACE: <ControlData>{
            controlName: 'B00PersonInterface_IdPersonInterface',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        ID_SHARING_MASTER_DATA: <ControlData>{
            controlName: 'B00PersonMasterData_IdPersonMasterData',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        PERSON_NR: <ControlData>{
            controlName: 'B00Person_PersonNr',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        CREATE_DATE: <ControlData>{
            controlName: 'B00Person_CreateDate',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        UPDATE_DATE: <ControlData>{
            controlName: 'B00Person_UpdateDate',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        ID_REP_BOX: <ControlData>{
            controlName: 'B00SharingAddress_IdRepPoBox',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        PO_BOX_LABEL: <ControlData>{
            controlName: 'B00SharingAddress_PoboxLabel',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
        IS_ACTIVE: <ControlData>{
            controlName: 'B00Person_IsActive',
            displayName: '',
            isRequired: false,
            defaultValue: true,
        },
        ID_REP_PERSION_TYPE: <ControlData>{
            controlName: 'B00PersonTypeGw_IdRepPersonType',
            displayName: '',
            isRequired: false,
            defaultValue: '32',
        },
        ID_REP_ADDRESS_TYPE: <ControlData>{
            controlName: 'B00PersonInterface_IdRepAddressType',
            displayName: '',
            isRequired: false,
            defaultValue: '1',
        },
        MASTER_IS_ACTIVE: <ControlData>{
            controlName: 'B00PersonMasterData_DateOfBirth',
            displayName: '',
            isRequired: false,
            defaultValue: null,
        },
    };
    public controlDataList: ControlData[] = [];
    public isFocus = {};
    public isHover = {};

    public languageDefaultList = [];
    public countryCodeDefaultList = [];
    public titleDefaultList = [];

    public idKey = '';

    public isLoading = false;

    @ViewChild(PerfectScrollbarDirective, { static: false }) scrollArea?: PerfectScrollbarDirective;

    constructor(
        protected router: Router,
        private commonService: CommonService,
        public headQuarterService: HeadQuarterService,
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
        this._initFormData();
        this._onSubscribe();

        this.idKey = this.popupRef.params.data?.idKey;
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
    private _onSubscribe() {}
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
    private _getDataById() {
        this.headQuarterService
            .getById(this.idKey)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res: any) => {
                    const formValueData = Uti.convertJsonDataToFormDataWithCommunication(res);

                    if (this.formData && formValueData) {
                        this.formData.patchValue(formValueData);
                        this.cdr.detectChanges();
                    }
                },
                (err) => {},
            );
    }
    private _initFormData() {
        this._getLanguages();
        this._getCountryCodes();
        this._getTitles();
        for (const key in this.dataFields) {
            if (Object.prototype.hasOwnProperty.call(this.dataFields, key)) {
                const element = this.dataFields[key];
                this.controlDataList.push(element);
            }
        }

        const initForm = this.fb.group({});
        this.controlDataList.forEach((element: ControlData) => {
            // add to hover and focus
            this.isFocus[element.controlName] = false;
            this.isHover[element.controlName] = false;

            // new control and set validation
            const control = new FormControl(element.defaultValue);
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

        const headquarters = this.popupRef.params.data?.headquarters;
        if (headquarters?.length) {
            const headquarterName = this.formData.controls[this.dataFields.HEAD_QUARTER.controlName].value;
            const item = headquarters.find(
                (x) => x[OctopusCompanyEnum.companyName].toLowerCase().trim() === headquarterName.toLowerCase().trim(),
            );
            if (item && item[OctopusCompanyEnum.companyId] !== this.idKey) {
                this.toastrService.pop(
                    MessageModal.MessageType.error,
                    'System',
                    `Headquarter name is exist, please change!`,
                );
                return;
            }
        }

        this.isLoading = true;
        const submitData = Uti.convertFormDataToJsonDataWithCommunication(this.formData.value);
        if (!submitData) {
            this.toastrService.pop(MessageModal.MessageType.error, 'System', `Data has problem, please try again!`);
            this.isLoading = false;
            return;
        }
        this.headQuarterService
            .save(submitData)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res: any) => {
                    this.isLoading = false;
                    this.cdr.detectChanges();
                    if (!res?.isSuccess || res?.returnID === '-1') {
                        this.toastrService.pop(
                            MessageModal.MessageType.error,
                            'System',
                            `Save Fail, ${res?.userErrorMessage}!`,
                        );
                        return;
                    }
                    this.toastrService.pop(MessageModal.MessageType.success, 'System', res?.userErrorMessage);
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
