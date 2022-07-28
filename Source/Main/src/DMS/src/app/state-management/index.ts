import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import {
    AdditionalInformationActions,
    ModuleActions,
    WidgetDetailActions,
    TabSummaryActions,
    WidgetTemplateActions,
    SearchResultActions,
    ParkedItemActions,
    LayoutInfoActions,
    ModuleSettingActions,
    XnCommonActions,
    ProcessDataActions,
    GridActions,
    PropertyPanelActions,
    TabButtonActions,
    BackofficeActions,
    ReturnRefundActions,
    WarehouseMovementActions,
    HotKeySettingActions,
    ModalActions,
    LayoutSettingActions,
    FilterActions,
    GlobalSearchActions,
    OrderProcessingActions,
    DocumentImageOCRActions,
    DocumentThumbnailActions,
    FileProcessPopUpActions,
    ScanningActions,
    AdministrationDocumentActions,
    FileManagerActions,
    CloudActions,
    BranchActions,
    PreissChildActions,
} from './store/actions';
import { AdministrationDocumentSelectors, DynamicFormStoreSelectors } from './store/reducer';
import { FileManagerSelectors } from './store/reducer/file-manager';
import { FileManagerService } from '@app/pages/private/modules/file-manager/services';
import { AppSelectors } from './store/reducer/app';
import { UserManagementSelectors } from '@app/pages/user-management/user-management.statemanagement/user-management.selectors';
import { UserManagementActions } from '@app/pages/user-management/user-management.statemanagement/user-management.actions';
import { InvoiceApprovalActions } from '@app/pages/invoice-approval/invoice-approval.statemanagement/invoice-approval.actions';
import { InvoiceApprovalSelectors } from '@app/pages/invoice-approval/invoice-approval.statemanagement/invoice-approval.selectors';
import { InvoiceApprovalProcessingActions } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';
import { InvoiceApprovalProcessingSelectors } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.selectors';
import { UserV2Actions } from '@app/pages/user-v2/user-v2.statemanagement/user-v2.actions';
import { UserV2Selectors } from '@app/pages/user-v2/user-v2.statemanagement/user-v2.selectors';

@NgModule({
    imports: [],
    declarations: [],
    providers: [],
})
export class StateManagementModule {
    constructor(@Optional() @SkipSelf() parentModule: StateManagementModule) {}

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: StateManagementModule,
            providers: [
                AdditionalInformationActions,
                ModuleActions,
                ParkedItemActions,
                WidgetDetailActions,
                TabSummaryActions,
                SearchResultActions,
                WidgetTemplateActions,
                LayoutInfoActions,
                ModuleSettingActions,
                XnCommonActions,
                ProcessDataActions,
                GridActions,
                PropertyPanelActions,
                TabButtonActions,
                BackofficeActions,
                ReturnRefundActions,
                WarehouseMovementActions,
                HotKeySettingActions,
                ModalActions,
                LayoutSettingActions,
                FilterActions,
                GlobalSearchActions,
                OrderProcessingActions,
                DocumentImageOCRActions,
                DocumentThumbnailActions,
                FileProcessPopUpActions,
                ScanningActions,
                // DocumentActions,
                AdministrationDocumentActions,
                UserManagementActions,
                UserV2Actions,
                InvoiceApprovalActions,
                InvoiceApprovalProcessingActions,

                AdministrationDocumentSelectors,
                FileManagerActions,
                FileManagerService,
                FileManagerSelectors,
                CloudActions,
                AppSelectors,
                UserManagementSelectors,
                InvoiceApprovalSelectors,
                InvoiceApprovalProcessingSelectors,
                DynamicFormStoreSelectors,
                UserV2Selectors,
                BranchActions,
                PreissChildActions,
            ],
        };
    }
}
