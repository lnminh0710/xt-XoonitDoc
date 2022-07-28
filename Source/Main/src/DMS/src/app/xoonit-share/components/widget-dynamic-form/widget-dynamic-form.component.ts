import { Component, Injector, OnInit, Input, ContentChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import {
    HideMyDMFormUIAction,
    ShowMyDMFormUIAction,
} from '@widget/components/widget-mydm-form/actions/widget-mydm-form.actions';
import {
    IWidgetIsAbleToSave,
    FormStatus,
} from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import { WidgetDynamicFormSelectors } from './widget-dynamic-form.state/widget-dynamic-form.selectors';
import { takeUntil } from 'rxjs/operators';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { AdministrationDocumentSelectors, DynamicFormStoreSelectors } from '@app/state-management/store/reducer';
import {
    DynamicFormStoreActionNames,
    DynamicFormStoreSuccessAction,
} from '@app/state-management/store/actions/dynamic-form-store';
import { CommonWidgetDynamicFormGroupContainerV2 } from '@app/xoonit-share/processing-form-v2/common-widget-dynamic-form-group-container.component';
import { DynamicFormGroupComponent } from '../dynamic-form-group/dynamic-form-group.component';
import { DmsDashboardHandlerService } from '@app/pages/private/modules/mydm/services/dms-dashboard-handler.service';
import { WidgetDetail } from '../../../models';
import { DocumentService } from '../../../services';
import { CommonFormComponent } from './components/common-form/common-form.component';
import { FocusControlEvent } from '../../../shared/components/xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { defaultLanguage } from '../../../app.resource';

@Component({
    selector: 'widget-dynamic-form',
    styleUrls: ['widget-dynamic-form.component.scss'],
    templateUrl: 'widget-dynamic-form.component.html',
})
export class WidgetDynamicFormComponent
    extends CommonWidgetDynamicFormGroupContainerV2
    implements OnInit, IWidgetIsAbleToSave {
    @Input() headerTitle: string;
    @Input() widgetDetail: WidgetDetail;
    @ContentChild('customTemplate') customTemplateRef: TemplateRef<any>;

    private _methodName: string;
    @Input() set methodName(data: string) {
        this._methodName = data;
    }

    get methodName(): string {
        if (this._methodName) {
            return this._methodName;
        }
        if (this.widgetDetail?.request) {
            let obj = JSON.parse(this.widgetDetail?.request);
            return obj?.methodName;
        }
        return '';
    }

    private _object: string;
    @Input() set object(data: string) {
        this._object = data;
    }

    get object(): string {
        if (this._object) {
            return this._object;
        }
        if (this.widgetDetail?.request) {
            let obj = JSON.parse(this.widgetDetail?.request);
            return obj?.object;
        }
        return '';
    }

    private _idDocumentContainerScans: number;
    @Input() set idDocumentContainerScans(data: number) {
        this._idDocumentContainerScans = data;
        this.getFormGroupSettings(this._idDocumentContainerScans, null);
    }

    get idDocumentContainerScans() {
        return this._idDocumentContainerScans;
    }

    private _idMainDocument: number;
    @Input() set idMainDocument(data: number) {
        this._idMainDocument = data;
        this.getFormGroupSettings(null, this._idMainDocument);
    }

    get idMainDocument() {
        return this._idMainDocument;
    }

    private _dynamicFormGroupDef: DynamicFormGroupDefinition;
    @Input() set dynamicFormGroupDef(data: DynamicFormGroupDefinition) {
        this._dynamicFormGroupDef = data;
        this.setDynamicFormGroupDefinition(data);
    }

    get dynamicFormGroupDef() {
        return this._dynamicFormGroupDef;
    }

    @Output() dataChanged = new EventEmitter<any>();
    @Output() formInitialized = new EventEmitter<any>();
    @Output() formListInitialized = new EventEmitter<any>();
    @Output() onControlClick = new EventEmitter<FocusControlEvent>();
    @Output() onControlIconClick = new EventEmitter<FocusControlEvent>();

    constructor(
        protected router: Router,
        protected injector: Injector,
        protected widgetOctopusFormSelectors: WidgetDynamicFormSelectors,
        protected administrationSelectors: AdministrationDocumentSelectors,
        protected octopusStore: DynamicFormStoreSelectors,
        private dmsDashboardHandlerService: DmsDashboardHandlerService,
        protected documentService: DocumentService,
    ) {
        super(router, injector, documentService);
        this._registerSubscriptions();
    }

    ngOnInit() {
        this.store.dispatch(new AppInjectWigetInstanceIsAbleToSaveAction(this));
    }

    protected setDynamicFormGroupComponent(): DynamicFormGroupComponent {
        return this.dynamicFormGroupComp;
    }

    protected setDynamicFormGroupDefinition(dynamicFormGroupDef: DynamicFormGroupDefinition) {
        this.formGroupDef = dynamicFormGroupDef;
        this._commonFormComps = [];
        this._cdRef.detectChanges();
    }

    private _registerSubscriptions() {
        // if this widget is rendered in module Processing
        // then the request getFormGroupSettings is invoked by super class CommonWidgetDynamicFormGroupContainer
        // therefore we subscribe action GET_FORM_GROUP_SETTINGS in derived class WidgetOctopusFormComponent
        //this.octopusStore
        //    .actionSuccessOfSubtype$(DynamicFormStoreActionNames.GET_FORM_GROUP_SETTINGS)
        //    .pipe(takeUntil(this.getUnsubscriberNotifier()))
        //    .subscribe((action: DynamicFormStoreSuccessAction) => {
        //        const payload = action.payload as DynamicFormGroupDefinition;
        //        this.formGroupDef = payload;
        //        this._commonFormComps = [];
        //        this._cdRef.detectChanges();
        //    });
    }

    public didFormFieldViewInitialized($event: CommonFormComponent) {
        if (!$event.formGroupConfigDef) return;
        this._commonFormComps.push($event);
        this.formInitialized.emit($event);
    }

    public didFormFieldViewListInitialized($event: Array<CommonFormComponent>) {
        this._commonFormComps = this._commonFormComps.concat($event);
        this.formListInitialized.emit($event);
    }

    protected showMyDMForm(action: ShowMyDMFormUIAction) {}

    protected hideMyDMForm(action: HideMyDMFormUIAction) {}

    public dataFormChanged(data) {
        this.dataChanged.emit(data);
    }

    public onClickChanged($event: FocusControlEvent) {
        this.onControlClick.emit($event);
    }

    public onIconClickChanged($event: FocusControlEvent) {
        this.onControlIconClick.emit($event);
    }

    //#region implement interface IWidgetIsAbleToSave
    public validateForm(): FormStatus {
        if (!this._commonFormComps || !this._commonFormComps.length) return null;
        let formStatus: FormStatus = {
            formTitle: '',
            isValid: true,
        };
        const length = this._commonFormComps.length;
        let valid = true;

        for (let i = 0; i < length; i++) {
            const contactInfoComp = this._commonFormComps[i];

            valid = contactInfoComp.validateDataBeforeSaving();
            if (!valid) {
                formStatus = {
                    isValid: false,
                    formTitle: contactInfoComp.formTitle,
                    errorMessages: [defaultLanguage.COMMON_LABEL__There_are_some_fields_are_invalid],
                };
                break;
            }
        }
        return formStatus;
    }

    public validateBeforeSave(): boolean {
        if (!this._commonFormComps || !this._commonFormComps.length) return false;

        const length = this._commonFormComps.length;
        let valid = true;

        for (let i = 0; i < length; i++) {
            const contactInfoComp = this._commonFormComps[i];

            valid = contactInfoComp.validateDataBeforeSaving();
            if (!valid) {
                break;
            }
        }
        return valid;
    }

    public clear() {
        this.clearDataForm();
    }

    public reset() {
        this.resetDataForm();
    }

    public getDataSave(withDBInfo?: boolean): { [key: string]: any } {
        if (!this._commonFormComps || !this._commonFormComps.length) return null;

        let data = {};

        for (let i = 0; i < this._commonFormComps.length; i++) {
            const contactInfoComp = this._commonFormComps[i];
            data = {
                ...data,
                ...contactInfoComp.getDataForSaving(),
            };
        }
        if (withDBInfo) {
            data['SpObject'] = this.formGroupDef.object;
            data['SpMethodName'] = this.formGroupDef.methodName;
        }
        return data;
    }
    public isAllDisplayFieldsEmpty(): boolean {
        if (!this._commonFormComps || !this._commonFormComps.length) return null;

        let isEmpty = true;
        for (let i = 0; i < this._commonFormComps.length; i++) {
            const contactInfoComp = this._commonFormComps[i];
            isEmpty = contactInfoComp.isAllDisplayFieldsEmpty();
            if (!isEmpty) break;
        }
        return isEmpty;
    }
    //#endregion
}
