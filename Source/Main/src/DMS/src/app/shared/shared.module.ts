import { NgModule, ModuleWithProviders, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WIDGETS_COMPONENTS } from './components';
import { XnDropdownModule } from './directives/xn-dropdown';
import { XnImageLoaderModule } from './directives/xn-image-loader';
import { XnImageSpinnerModule } from './directives/xn-image-spinner';
import { XnContextMenuModule } from './directives/xn-context-menu';
import { XnOnlyNumberModule } from './directives/xn-only-number';
import { XnDragDropModule } from './directives/xn-dragable';
import { XnDetectScrollModule } from './directives/xn-scroll-event';
import { XnClickOutsideModule } from './directives/xn-click-outside';
import { XnTriggerClickInsideCboDirectiveModule } from './directives/xn-trigger-click-inside-cbo';
import { XnAppendStyleModule } from './directives/xn-append-style';
import { XnSelectFirstIfOnlyOneDirectiveModule } from './directives/xn-select-first-if-only-one';
import { XnWidgetSavingProcessModule } from './directives/xn-widget-saving-process';
import { XnWidgetMenuProcessModule } from './directives/xn-widget-menu-process';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ContextMenuModule } from 'ngx-contextmenu';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DragulaModule } from 'ng2-dragula';
import { DndModule } from 'ng2-dnd';
import { ResizableModule } from 'angular-resizable-element';
import * as primengModule from 'primeng/primeng';
import { AngularSplitModule } from 'angular-split';
import { NgGridModule } from './components/grid-stack';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { FileUploadModule } from './components/xn-file';
import { WjCoreModule } from 'wijmo/wijmo.angular2.core';
import { WjGridModule } from 'wijmo/wijmo.angular2.grid';
import { WjInputModule, WjAutoComplete } from 'wijmo/wijmo.angular2.input';
import { WjGridFilterModule } from 'wijmo/wijmo.angular2.grid.filter';
import { WjGridDetailModule } from 'wijmo/wijmo.angular2.grid.detail';
import { WjNavModule } from 'wijmo/wijmo.angular2.nav';
import { TextMaskModule } from 'angular2-text-mask';
import * as widget from './components/widget';
//import * as customerHistory from './components/customer-history';
import { QuillModule } from 'ngx-quill';
import { NgxMyDatePickerModule } from '@app/shared/components/xn-control/xn-date-picker/ngx-my-date-picker/ngx-my-date-picker.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { XnAgGridModule } from '@app/shared/components/xn-control/xn-ag-grid';
import { XnDatePickerModule } from '@app/shared/components/xn-control/xn-date-picker';
import { XnInputDebounceModule } from './components/xn-control/xn-input-debounce/xn-input-debounce.module';
import { XnPagerModule } from '@app/shared/components/xn-pager';
import { AgGridModule } from 'ag-grid-angular';
import { TemplateHeaderCellRenderer } from '@app/shared/components/xn-control/xn-ag-grid/components/header-cell-renderer/template-header-cell-renderer/template-header-cell-renderer.component';
import { TemplateCellRenderer } from '@app/shared/components/xn-control/xn-ag-grid/components/template-cell-renderer/template-cell-renderer.component';
import { TemplateEditCellRenderer } from '@app/shared/components/xn-control/xn-ag-grid/components/template-edit-cell-renderer/template-edit-cell-renderer.component';

// import { MaterialModule } from './components/xn-control/light-material-ui/material.module';
import { GlobalSearchModule } from './components/global-search/global-search.module';
import { CustomerModule } from '@app/pages/private/modules/customer';
import { ArticleModule } from '@app/pages/private/modules/article';
import { FileManagerModule } from '@app/pages/private/modules/file-manager';
import { FormManagementModule } from '@app/pages/private/modules/form-management';
import { ImageControlModule } from '@app/pages/private/modules/image-control';
import { ScanningModule } from '@app/pages/private/modules/scanning';
import { MyDMModule } from '@app/pages/private/modules/mydm';

import { XnGalleriaModule } from './components/xn-control/xn-galleria/xn-galleria.module';
import { PipesModule } from '@app/pipes/pipes.module';
import { XnOrderProcessingProcesssModule } from './directives/xn-order-processing-process';
import { XnFormFocusDirectiveModule } from '@app/shared/directives/xn-form-focus';
//import { SendEmailDialogModule } from './components/send-email-dialog/send-email-dialog.module';
import { WidgetPdfModule } from './components/widget/components/widget-pdf';
import { WidgetChartModule } from './components/widget/components/widget-chart/widget-chart.module';
import { XnWjDropdownHelperModule } from './directives/xn-wj-dropdown-helper/xn-wj-dropdown-helper.module';

// dms
import { XnFolderManagementModule } from './directives/xn-folder-management';
import { XnDocumentOcrModule } from './directives/xn-document-ocr';
import { XnControlFocusModule } from './directives/xn-control-focus';
import { WidgetViewerModule } from './components/widget/components/widget-viewer/widget-viewer.module';
import { APP_SERVICES, BranchService, PreissChildService } from '@app/services';
import {
    ModuleActions,
    ModalActions,
    ModuleSettingActions,
    ProcessDataActions,
    GlobalSearchActions,
    TabButtonActions,
    OrderProcessingActions,
    ParkedItemActions,
    SearchResultActions,
    XnCommonActions,
    LayoutInfoActions,
    PropertyPanelActions,
    AdditionalInformationActions,
    LayoutSettingActions,
    WidgetTemplateActions,
    TabSummaryActions,
    HotKeySettingActions,
    AdministrationDocumentActions,
    FileManagerActions,
    GridActions,
    WidgetDetailActions,
    BackofficeActions,
    FilterActions,
    DocumentThumbnailActions,
    ScanningActions,
    CloudActions,
    DocumentActions,
    NotificationPopupActions,
} from '@app/state-management/store/actions';
import { ToasterService, ToasterModule } from 'angular2-toaster';
import { PrivateLoadResolve } from '@app/pages/private/private-load.resolve';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { MatNativeDateModule } from './components/xn-control/light-material-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import * as translate from './components/translation';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CapturedDocumentDetailComponent } from '@app/pages/private/dms-dashboard/components/captured-document-detail';
import { XnEnterBreakDownDirectiveModule } from './directives/xn-enter-break-down';
import { MatCheckboxModule } from './components/xn-control/light-material-ui/checkbox';
import { MatSlideToggleModule } from '@xn-control/light-material-ui/slide-toggle';
import { MatRadioModule } from '@xn-control/light-material-ui/radio';
import { MatCardModule } from '@xn-control/light-material-ui/card';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatSelectModule } from '@xn-control/light-material-ui/select';
import { MatDatepickerModule } from '@xn-control/light-material-ui/datepicker';
import { MatAutocompleteModule } from '@xn-control/light-material-ui/autocomplete';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatTooltipModule } from '@xn-control/light-material-ui/tooltip';
import { WidgetMyDmFormModule, WidgetContactDetailModule } from './components/widget';
import { XnTranslationModule } from './components/translation/xn-translation.module';
import { XnErrorMessageModule } from '@app/xoonit-share/components/xn-error-message/xn-error-message.module';
import { XnDocumentTreeModule } from '@xn-control/xn-document-tree/xn-document-tree.module';
import { WidgetCaptureFolderTreeModule } from '@widget/components/widget-capture-folder-tree/widget-capture-folder-tree.module';
import { WidgetScanningHistoryModule } from '@app/xoonit-share/components/widget-scanning-history/widget-scanning-history.module';
import { DialogUserProfileComponent } from './components/dialog-user-profile';
import { WidgetUserManagementModule } from '@app/xoonit-share/components/widget-user-management/widget-user-management.module';
import { XnUserAvatarModule } from '@app/xoonit-share/components/xn-user-avatar/xn-user-avatar.module';
import { WidgetContactFolderTreeModule } from '@app/xoonit-share/components/widget-contact-folder-tree/widget-contact-folder-tree.module';
import { WidgetAttachmentViewerModule } from '@widget/components/widget-attachment-viewer/widget-attachment-viewer.module';
import { WidgetEmailFolderTreeModule } from '@widget/components/widget-email-folder-tree/widget-email-folder-tree.module';
import { WidgetInvoiceApprovalConfirmModule } from '@widget/components/widget-invoice-approval-confirm/widget-invoice-approval-confirm.module';
import { WidgetPositionDetailModule } from '@app/xoonit-share/components/widget-position-detail/widget-position-detail.module';
import { XnDecimalNumberModule } from './directives/xn-decimal-number';
import { WidgetDynamicFormModule } from '@app/xoonit-share/components/widget-dynamic-form/widget-dynamic-form.module';
import { DynamicFormFieldModule } from '../xoonit-share/components/dynamic-form-field/dynamic-form-field.module';
import { DynamicFormGroupModule } from '../xoonit-share/components/dynamic-form-group/dynamic-form-group.module';
import { XnFocusErrorModule } from './directives/xn-focus-error';
import { XnEnterFormModule } from './directives/xn-enter-form';
import { WidgetConfirmIsTodoModule } from '@app/xoonit-share/components/widget-confirm-isTodo/widget-confirm-isTodo.module';
import { WidgetInvoiceInfoModule } from '@app/xoonit-share/components/widget-invoice-info-approval/widget-invoice-info-approval.module';
import { WidgetSupplierInfoModule } from '@app/xoonit-share/components/widget-supplier-info-approval/widget-supplier-info-approval.module';
import { XnSearchTableModule } from '@app/xoonit-share/components/xn-search-table/xn-search-table.module';
import { ResourceTranslationDirectiveModule } from './components/translation';
import { WidgetUserManagementV2Module } from '@app/xoonit-share/components/widget-user-management-v2/widget-user-management-v2.module';
import { WidgetUserSelectionModule } from '@app/xoonit-share/components/widget-user-selection/widget-user-selection.module';
import { WidgetRoleModule } from '@app/xoonit-share/components/widget-role/widget-role.module';
import { WidgetRoleGroupModule } from '@app/xoonit-share/components/widget-role-group/widget-role-group.module';
import { WidgetUserGroupModule } from '@app/xoonit-share/components/widget-user-group/widget-user-group.module';
import { AngularMultiSelectModule } from '@xn-control/xn-dropdown';
import { NotificationModule } from './components/notification/notification.module';
import { WidgetIndexingFolderTreeModule } from '@widget/components/widget-indexing-folder-tree/widget-indexing-folder-tree.module';
import { WidgetDocumentViewerModule } from '@widget/components/widget-document-viewer/widget-document-viewer.module';
import { WidgetHeadquaterManagementModule } from '@app/xoonit-share/components/widget-headquarter-management/widget-headquarter-management.module';
import { WidgetBranchModifyModule } from '@app/xoonit-share/components/widget-branch-modify/widget-branch-modify.module';
import { QRCodeCustomModule } from './components/qr-code/qr-code.module';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { WidgetEmailListModule } from '@app/xoonit-share/components/widget-email-list/widget-email-list.module';
import { WidgetMemberPermissionDialogModule } from '@app/xoonit-share/components/widget-member-permission-dialog/widget-member-permission-dialog.module';
import { WidgetPriceTagModule } from '@widget/components/widget-price-tag/widget-price-tag.module';
import { WidgetMemberPermissionConfigModule } from '@app/xoonit-share/components/widget-member-permission-config/widget-member-permission-config.module';
import { WidgetImageGalleryModule } from '@widget/components/widget-image-gallery/widget-image-gallery.module';
import { WidgetUploaModule } from '@app/xoonit-share/components/widget-upload/widget-upload.module';
@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        ClipboardModule,
        XnDropdownModule,
        XnContextMenuModule,
        XnImageLoaderModule,
        XnImageSpinnerModule,
        XnOnlyNumberModule,
        XnEnterBreakDownDirectiveModule,
        XnDragDropModule,
        XnDetectScrollModule,
        XnClickOutsideModule,
        XnTriggerClickInsideCboDirectiveModule,
        XnAppendStyleModule,
        XnSelectFirstIfOnlyOneDirectiveModule,
        XnWidgetSavingProcessModule,
        XnWidgetMenuProcessModule,
        XnOrderProcessingProcesssModule,
        XnFolderManagementModule,
        XnDocumentOcrModule,
        XnFormFocusDirectiveModule,
        XnWjDropdownHelperModule,
        DragulaModule,
        XnControlFocusModule,
        PerfectScrollbarModule,
        TabsModule,
        BsDropdownModule,
        TooltipModule,
        ModalModule,
        CollapseModule,
        PopoverModule,
        ResizableModule,
        DndModule,
        AngularSplitModule,
        NgGridModule,
        primengModule.DialogModule,
        SlimLoadingBarModule,
        FileUploadModule,
        WjCoreModule,
        WjGridModule,
        WjInputModule,
        WjGridFilterModule,
        WjGridDetailModule,
        WjNavModule,
        TextMaskModule,
        QuillModule,
        NgxMyDatePickerModule,
        /* MaterialModule */
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatSelectModule,
        MatRadioModule,
        MatCardModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        MatNativeDateModule,
        MatIconModule,
        MatTooltipModule,
        /* End Material Module */
        XnDatePickerModule,
        XnAgGridModule,
        XnInputDebounceModule,
        XnPagerModule,
        AgGridModule.withComponents([TemplateHeaderCellRenderer, TemplateCellRenderer, TemplateEditCellRenderer]),
        XnGalleriaModule,
        PipesModule,
        GlobalSearchModule,
        ProgressbarModule,
        CustomerModule,
        ArticleModule,
        //dms
        FileManagerModule,
        FormManagementModule,
        ImageControlModule,
        ScanningModule,
        MyDMModule,
        // end dms
        widget.InlineEditModule,
        //SendEmailDialogModule,
        WidgetPdfModule,
        WidgetChartModule,
        WidgetViewerModule.withComponents([
            widget.TextViewerComponent,
            widget.SpreadsheetViewerComponent,
            widget.AudioViewerComponent,
            widget.VideoViewerComponent,
            widget.RarViewerComponent,
            widget.ZipViewerComponent,
            widget.WidgetPdfViewerComponent,
            widget.ImageViewerComponent,
        ]),
        WidgetMyDmFormModule,
        WidgetContactDetailModule,
        TranslateModule,
        InfiniteScrollModule,
        XnTranslationModule,
        XnErrorMessageModule,
        XnDocumentTreeModule,
        WidgetCaptureFolderTreeModule,
        WidgetEmailFolderTreeModule,
        WidgetScanningHistoryModule,
        WidgetUserManagementModule,
        WidgetUserManagementV2Module,
        XnUserAvatarModule,
        WidgetContactFolderTreeModule,
        WidgetAttachmentViewerModule,
        WidgetPositionDetailModule,
        WidgetInvoiceApprovalConfirmModule,
        WidgetUserSelectionModule,
        XnDecimalNumberModule,
        DynamicFormFieldModule,
        DynamicFormGroupModule,
        WidgetDynamicFormModule,
        OverlayModule,
        PortalModule,
        XnFocusErrorModule,
        XnEnterFormModule,
        ContextMenuModule.forRoot(),
        WidgetConfirmIsTodoModule,
        WidgetInvoiceInfoModule,
        WidgetSupplierInfoModule,
        WidgetUserGroupModule,
        XnSearchTableModule,
        ResourceTranslationDirectiveModule,
        WidgetRoleGroupModule,
        WidgetRoleModule,
        AngularMultiSelectModule,
        NotificationModule,
        WidgetIndexingFolderTreeModule,
        WidgetDocumentViewerModule,
        WidgetHeadquaterManagementModule,
        WidgetBranchModifyModule,
        QRCodeCustomModule,
        WidgetEmailListModule,
        WidgetMemberPermissionDialogModule,
        WidgetPriceTagModule,
        WidgetImageGalleryModule,
        WidgetMemberPermissionConfigModule,
        WidgetUploaModule,
    ],
    declarations: [...WIDGETS_COMPONENTS],
    entryComponents: [
        widget.PaperworkComponent,
        widget.DialogUserRoleComponent,
        widget.DialogDeleteCancelComponent,
        DialogUserProfileComponent,
    ],

    exports: [
        CommonModule,
        ...WIDGETS_COMPONENTS,
        XnDropdownModule,
        XnContextMenuModule,
        XnImageLoaderModule,
        XnImageSpinnerModule,
        XnOnlyNumberModule,
        XnEnterBreakDownDirectiveModule,
        XnDragDropModule,
        XnClickOutsideModule,
        XnSelectFirstIfOnlyOneDirectiveModule,
        XnWidgetSavingProcessModule,
        XnWidgetMenuProcessModule,
        XnOrderProcessingProcesssModule,
        XnFolderManagementModule,
        XnControlFocusModule,
        XnDocumentOcrModule,
        TranslateModule,
        ToasterModule,
        InfiniteScrollModule,
        GlobalSearchModule,
        CapturedDocumentDetailComponent,
        XnDecimalNumberModule,
        XnFocusErrorModule,
        XnEnterFormModule,
        XnTranslationModule,
        ResourceTranslationDirectiveModule,
    ],
    providers: [DatePipe, MatNativeDateModule, BranchService, PreissChildService],
})
export class XnSharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: XnSharedModule,
            providers: [
                PrivateLoadResolve,
                ...APP_SERVICES,
                ToasterService,
                ModuleActions,
                ModalActions,
                TabSummaryActions,
                HotKeySettingActions,
                ModuleSettingActions,
                ProcessDataActions,
                GlobalSearchActions,
                TabButtonActions,
                OrderProcessingActions,
                ParkedItemActions,
                SearchResultActions,
                XnCommonActions,
                LayoutInfoActions,
                ModalActions,
                PropertyPanelActions,
                AdditionalInformationActions,
                LayoutSettingActions,
                WidgetTemplateActions,
                WidgetDetailActions,
                GridActions,
                BackofficeActions,
                FilterActions,
                AdministrationDocumentActions,
                AdministrationDocumentSelectors,
                FileManagerActions,
                DocumentThumbnailActions,
                ScanningActions,
                CloudActions,
                DocumentActions,
                NotificationPopupActions,
            ],
        };
    }
}
