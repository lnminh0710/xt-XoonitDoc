import { ActionReducerMap } from '@ngrx/store';

// reducers
import * as fromModule from './reducer/main-module';
import * as fromParkedItem from './reducer/parked-item';
import * as fromWidgetContentDetail from './reducer/widget-content-detail';
import * as fromTabSummary from './reducer/tab-summary';
import * as fromSearchResult from './reducer/search-result';
import * as fromWidgetTemplateSetting from './reducer/widget-template';
import * as fromLayoutSetting from './reducer/layout-setting';
import * as fromLayoutInfo from './reducer/layout-info';
import * as fromModuleSetting from './reducer/module-setting';
import * as additionalInformation from './reducer/additional-information';
import * as fromXnCommon from './reducer/xn-common';
import * as fromProcessData from './reducer/process-data';
import * as fromGrid from './reducer/grid';
import * as propertyPanelState from './reducer/property-panel';
import * as tabButtonState from './reducer/tab-button';
import * as backofficeState from './reducer/backoffice';
import * as returnRefundState from './reducer/return-refund';
import * as warehouseMovementState from './reducer/warehouse-movement';
import * as hotKeySettingtState from './reducer/hot-key-setting';
import * as modalState from './reducer/modal';
import * as fromGlobalSearch from './reducer/global-search';
import * as orderProcessing from './reducer/order-processing';
import * as document from './reducer/document';
import * as administrationDocument from './reducer/administration-document';
import * as fileManager from './reducer/file-manager';
import * as appGlobal from './reducer/app-global';
import * as app from './reducer/app';
import * as dynamicForm from './reducer/dynamic-form-store';
import * as invoiceApprovalProcessingState from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.state';
import * as invoiceApprovalProcessingReducer from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.reducer';
import * as imageOCR from './reducer/image-ocr';

export interface AppState {
    app: app.IAppState;
    additionalInformation: additionalInformation.AdditionalInformationState;
    mainModule: fromModule.ModuleState;
    parkedItems: fromParkedItem.ParkedItemState;
    widgetContentDetail: fromWidgetContentDetail.WidgetDetailState;
    tabSummary: fromTabSummary.TabSummaryState;
    searchResult: fromSearchResult.SearchResultState;
    widgetTemplateSetting: fromWidgetTemplateSetting.WidgetTemplateSettingState;
    layoutSetting: fromLayoutSetting.LayoutSettingState;
    layoutInfo: fromLayoutInfo.LayoutInfoState;
    moduleSetting: fromModuleSetting.ModuleSettingState;
    xnCommonState: fromXnCommon.CommonState;
    processDataState: fromProcessData.ProcessDataState;
    grid: fromGrid.GridState;
    propertyPanelState: propertyPanelState.PropertyPanelState;
    tabButtonState: tabButtonState.TabButtonState;
    backofficeState: backofficeState.BackofficeState;
    returnRefundState: returnRefundState.ReturnRefundState;
    warehouseMovementState: warehouseMovementState.WarehouseMovementState;
    hotKeySettingtState: hotKeySettingtState.HotKeySettingState;
    modalState: modalState.ModalState;
    globalSearchState: fromGlobalSearch.GlobalSearchState;
    orderProcessingState: orderProcessing.OrderProcessingState;
    documentState: document.DocumentState;
    administrationDocumentState: administrationDocument.AdministrationDocumentState;
    fileManager: fileManager.FileManagerState;
    appGlobalState: appGlobal.AppGlobalState;
    dynamicFormState: dynamicForm.DynamicFormStoreState;
    invoiceApprovalProcessingState: invoiceApprovalProcessingState.InvoiceApprovalProcessingState;
    imageOCR: imageOCR.ImageOCRState;
}

export const reducers: ActionReducerMap<AppState> = {
    app: app.appRootReducer,
    additionalInformation: additionalInformation.additionalInformationReducer,
    mainModule: fromModule.mainModuleReducer,
    parkedItems: fromParkedItem.parkedItemReducer,
    widgetContentDetail: fromWidgetContentDetail.widgetDetailReducer,
    tabSummary: fromTabSummary.tabSummaryReducer,
    searchResult: fromSearchResult.searchResultReducer,
    widgetTemplateSetting: fromWidgetTemplateSetting.widgetTemplateSettingReducer,
    layoutSetting: fromLayoutSetting.layoutSettingReducer,
    layoutInfo: fromLayoutInfo.layoutInfoReducer,
    moduleSetting: fromModuleSetting.moduleSettingReducer,
    xnCommonState: fromXnCommon.xnCommonReducer,
    processDataState: fromProcessData.processDataReducer,
    grid: fromGrid.gridReducer,
    propertyPanelState: propertyPanelState.propertyPanelReducer,
    tabButtonState: tabButtonState.tabButtonReducer,
    backofficeState: backofficeState.backofficeReducer,
    returnRefundState: returnRefundState.returnRefundReducer,
    warehouseMovementState: warehouseMovementState.warehouseMovementReducer,
    hotKeySettingtState: hotKeySettingtState.hotKeySettingReducer,
    modalState: modalState.modalReducer,
    globalSearchState: fromGlobalSearch.globalSearchStateReducer,
    orderProcessingState: orderProcessing.orderProcessingReducer,
    documentState: document.documentReducer,
    administrationDocumentState: administrationDocument.administrationDocumentReducer,
    fileManager: fileManager.fileManagerReducer,
    appGlobalState: appGlobal.appGlobalStateReducer,
    dynamicFormState: dynamicForm.dynamicFormStoreReducer,
    invoiceApprovalProcessingState: invoiceApprovalProcessingReducer.invoiceApprovalProcessingReducer,
    imageOCR: imageOCR.ImageOCRStateReducer,
};
