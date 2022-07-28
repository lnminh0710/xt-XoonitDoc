import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { IconNames } from '@app/app-icon-registry.service';
import { MessageModal } from '@app/app.constants';
import { OctopusCompanyEnum } from '@app/models/octopus-document.model';
import { BaseComponent } from '@app/pages/private/base';
import { CommonService, HeadQuarterService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { BranchActions } from '@app/state-management/store/actions';
import { Uti } from '@app/utilities';
import { Store } from '@ngrx/store';
import { _ } from 'ag-grid-community';
import { ToasterService } from 'angular2-toaster';
import { get, includes, lowerCase } from 'lodash-es';
import { take } from 'rxjs/operators';
import { HeaderConfirmationRef } from '../global-popup/components/header-popup/header-confirmation-ref';
import { PopupCloseEvent } from '../global-popup/popup-ref';
import { PopupService } from '../global-popup/services/popup.service';
import { WidgetHeadquarterModifyComponent } from './widget-headquarter-modify/widget-headquarter-modify.component';

@Component({
    selector: 'widget-headquarter-management',
    templateUrl: './widget-headquarter-management.component.html',
    styleUrls: ['./widget-headquarter-management.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetHeadquarterManagementComponent extends BaseComponent implements OnInit, OnDestroy {
    public COMPANY_ENUM = OctopusCompanyEnum;
    public IconNamesEnum = IconNames;
    public listCompany = [];

    public idDelete: string;
    public nameDelete: string;

    public idSelected: string;
    public searchText = '';
    public originalList = [];

    @ViewChild('confirmDelete') confirmDelete: TemplateRef<any>;

    constructor(
        protected router: Router,
        private cdr: ChangeDetectorRef,
        private commonService: CommonService,
        public headQuarterService: HeadQuarterService,
        public popupService: PopupService,
        private toastrService: ToasterService,
        private store: Store<AppState>,
        private brandAction: BranchActions,
    ) {
        super(router);
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }
    ngOnInit() {
        this.getListCompany();
    }

    public search(value) {
        if (value === this.searchText) return;
        this.searchText = value;
        if (!value) {
            this.listCompany = this.originalList;
            return;
        }

        this.listCompany = this.originalList.filter((_o) => includes(lowerCase(_o.textValue), lowerCase(value)));
    }
    public getListCompany() {
        this.listCompany = [];
        this.originalList = [];
        this.commonService
            .getListComboBox('GetCompany', '', true)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res) => {
                    this.listCompany = get(res, 'item.getCompany') || [];
                    this.originalList = this.listCompany;
                    this.cdr.detectChanges();
                },
                (err) => {},
            );
    }
    public showDialogModify(idKey?: string) {
        const currentWidth = window.screen.width;
        const title = idKey ? 'Update Headquarter' : 'Add new Headquarter';
        const popupRef = this.popupService.open({
            content: WidgetHeadquarterModifyComponent,
            hasBackdrop: true,
            header: {
                title: title,
                iconClose: true,
            },
            disableCloseOutside: true,
            width: (currentWidth * 50) / 100,
            data: {
                idKey,
                headquarters: this.originalList,
            },
        });
        popupRef.afterClosed$.pipe(take(1)).subscribe(({ type, data }: PopupCloseEvent<any>) => {
            if (type === 'close' && data?.isSuccess) {
                this.getListCompany();
            }
        });
    }
    public showDialogConfirmDelete(idKey: string, name: string) {
        this.idDelete = '';
        this.nameDelete = '';
        if (!idKey || !name) return;

        this.idDelete = idKey;
        this.nameDelete = name;
        this.popupService.open({
            content: this.confirmDelete,
            width: 350,
            hasBackdrop: true,
            header: new HeaderConfirmationRef({ iconClose: true }),
            disableCloseOutside: true,
        });
    }

    public handleDelete(closePopup: (data?: any) => void) {
        this.headQuarterService
            .getById(this.idDelete)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res: any) => {
                    const formValueData = Uti.convertJsonDataToFormDataWithCommunication(res);
                    if (!formValueData) {
                        this.toastrService.pop(
                            MessageModal.MessageType.error,
                            `FAIL - Delete Headquarter: ${this.nameDelete}`,
                        );
                        return;
                    }

                    formValueData['B00Person_IsDeleted'] = '1';
                    this._callServiceDelete(formValueData, closePopup);
                },
                (err) => {},
            );
    }
    private _callServiceDelete(submitData: object, closePopup: (data?: any) => void) {
        this.headQuarterService
            .save(submitData)
            .takeUntil(super.getUnsubscriberNotifier())
            .subscribe(
                (res: any) => {
                    if (!res?.isSuccess || res?.returnID === '-1') {
                        this.toastrService.pop(
                            MessageModal.MessageType.error,
                            'System',
                            `Delete Fail, ${res?.userErrorMessage}!`,
                        );
                        return;
                    }
                    this.toastrService.pop(MessageModal.MessageType.success, 'System', res?.userErrorMessage);
                    closePopup();
                },
                (err) => {
                    this.toastrService.pop(MessageModal.MessageType.error, err);
                },
            );
    }
    public selectHeadquarter(object) {
        if (!object || !object[this.COMPANY_ENUM.companyId] || object[this.COMPANY_ENUM.companyId] === this.idSelected)
            return;

        this.idSelected = object[this.COMPANY_ENUM.companyId];
        this.store.dispatch(this.brandAction.loadBranches(object));
    }
}
