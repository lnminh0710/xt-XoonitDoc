import { Injectable, forwardRef, Inject } from '@angular/core';
import { WidgetMenuStatusModel, WidgetMenuStatusPropertyModel, WidgetMenuStatusClassModel, WidgetType, WidgetDetail } from '@app/models';
import { AccessRightWidgetCommandButtonEnum, RepWidgetAppIdEnum } from '@app/app.constants';

@Injectable()
export class MenuStatusService {
    constructor() {
    }

    public createMenuSettings(): WidgetMenuStatusModel {
        return new WidgetMenuStatusModel({
            enable: true
        });
    }

    public buildMenuStatusSettings(menuSettings: WidgetMenuStatusModel, data: WidgetDetail, isSwitchedFromGridToForm: boolean, editMode: boolean) {
        let idRepWidgetType: number = data.idRepWidgetType;
        let idRepWidgetApp: number = data.idRepWidgetApp;

        let switchToEditSetting: boolean;
        let switchToEditSettingInImageOcr: boolean;
        if (data && data.widgetDataType && data.widgetDataType.editFormSetting) {
            switchToEditSetting = data.widgetDataType.editFormSetting.swithToEdit;
            switchToEditSettingInImageOcr = switchToEditSetting && data.widgetDataType.editFormSetting.key === 'ImageOcrData';
        }

        //AccessRight
        const hasRightEdit = menuSettings.getAccessRight('edit');
        const hasRightDelete = menuSettings.getAccessRight('delete');

        const hasRightSettingButton = menuSettings.getAccessRightForCommandButton('SettingButton');
        const hasRightToolbarButton = menuSettings.getAccessRightForCommandButton('ToolbarButton');
        const hasRightToolbarButton_TranslateButton = menuSettings.getAccessRightForCommandButton('ToolbarButton__TranslateButton');
        const hasRightToolbarButton_PrintButton = menuSettings.getAccessRightForCommandButton('ToolbarButton__PrintButton');
        const hasRightToolbarButton_EditTemplateButton = menuSettings.getAccessRightForCommandButton('ToolbarButton__EditTemplateButton');

        //btnSetting1
        if (hasRightSettingButton && !isSwitchedFromGridToForm && idRepWidgetApp != RepWidgetAppIdEnum.RepositoryDetail &&
            idRepWidgetType >= WidgetType.DataGrid && idRepWidgetType <= WidgetType.EditableTable)
            menuSettings.btnSetting1.enable = true;
        else
            menuSettings.btnSetting1.enable = false;

        //btnSetting2
        if (hasRightSettingButton &&
            idRepWidgetApp != RepWidgetAppIdEnum.RepositoryDetail &&
            idRepWidgetType != WidgetType.CustomerCommunication &&
            (isSwitchedFromGridToForm || idRepWidgetType <= WidgetType.FieldSet || idRepWidgetType > WidgetType.Combination))
            menuSettings.btnSetting2.enable = true;
        else
            menuSettings.btnSetting2.enable = false;

        //btnSetting3
        if (hasRightSettingButton && idRepWidgetApp != RepWidgetAppIdEnum.RepositoryDetail && idRepWidgetType == WidgetType.Combination)
            menuSettings.btnSetting3.enable = true;
        else
            menuSettings.btnSetting3.enable = false;

        const isSupportWidgetSetting = this.isSupportWidgetSetting(idRepWidgetType);
        const isShowToogleButton = this.isShowToogleButton(idRepWidgetType);
        //btnToolbar
        menuSettings.btnToolbar.enable = hasRightToolbarButton && (isSupportWidgetSetting || isShowToogleButton);
        //btnRefresh
        menuSettings.btnRefresh.enable = isSupportWidgetSetting || isShowToogleButton;


        //btnToggleToolButtons
        menuSettings.btnToggleToolButtons.enable = true;
        //btnResetWidget
        menuSettings.btnResetWidget.enable = true;
        menuSettings.btnSettingForEditMode = idRepWidgetType === WidgetType.DocumentProcessing;
        menuSettings.btnSaveWidgetForm.enable = idRepWidgetType === WidgetType.FieldSet || idRepWidgetType === WidgetType.Combination ||
            idRepWidgetType === WidgetType.CombinationCreditCard || idRepWidgetType === WidgetType.Translation || idRepWidgetType === WidgetType.DocumentProcessing;

        menuSettings.btnSaveWidgetTable.enable = idRepWidgetType === WidgetType.EditableGrid || idRepWidgetType === WidgetType.EditableRoleTreeGrid;

        if (switchToEditSetting) {
            menuSettings.btnResetWidget.enable = false;
            menuSettings.btnSettingForEditMode = true;
            menuSettings.btnSaveWidgetForm.enable = false;
            menuSettings.btnSaveWidgetTable.enable = false;
        }

        //btnEditForm
        menuSettings.btnEditForm.enable = hasRightEdit;

        //btnEditEditableTable
        menuSettings.btnEditEditableTable.enable = hasRightEdit;
        //btnEditWidgetOptions
        menuSettings.btnEditWidgetOptions.enable = idRepWidgetType !== WidgetType.EditableRoleTreeGrid;

        //btnEditCountryWidget
        menuSettings.btnEditCountryWidget.enable = hasRightEdit;

        //btnEditTreeViewWidget
        menuSettings.btnEditTreeViewWidget.enable = hasRightEdit;

        //btnUploadFileWidget
        menuSettings.btnUploadFileWidget.enable = hasRightEdit;

        //btnDeleteFileWidget
        menuSettings.btnDeleteFileWidget.enable = hasRightDelete;

        //btnSaveCountryWidget
        menuSettings.btnSaveCountryWidget.enable = hasRightEdit || hasRightDelete;

        //btnWidgetTranslation
        menuSettings.btnWidgetTranslation.enable = hasRightToolbarButton_TranslateButton &&
            (
                (idRepWidgetType >= WidgetType.FieldSet && idRepWidgetType <= WidgetType.EditableTable) ||
                idRepWidgetType == WidgetType.FileExplorer ||
                idRepWidgetType == WidgetType.EditableRoleTreeGrid ||
                idRepWidgetType == WidgetType.FileExplorerWithLabel ||
                idRepWidgetType == WidgetType.CombinationCreditCard
            );

        //btnAddRowForEditableTableWidget
        menuSettings.btnAddRowForEditableTableWidget.enable = hasRightEdit;

        //btnPrintWidget
        menuSettings.btnPrintWidget.enable = hasRightToolbarButton_PrintButton;

        //btnArticleNameTranslation
        menuSettings.btnArticleNameTranslation.enable = hasRightToolbarButton_TranslateButton;

        //btnGoToNextcolumnOrRow
        menuSettings.btnGoToNextcolumnOrRow.enable = idRepWidgetType === WidgetType.DataGrid || idRepWidgetType === WidgetType.EditableGrid ||
            idRepWidgetType === WidgetType.EditableTable || idRepWidgetType === WidgetType.TableWithFilter;

        //btnEditTemplate
        menuSettings.btnEditTemplate.enable = hasRightToolbarButton_EditTemplateButton &&
            (idRepWidgetApp == RepWidgetAppIdEnum.MailingParameters || idRepWidgetApp == RepWidgetAppIdEnum.ProductParameter || idRepWidgetApp == RepWidgetAppIdEnum.GlobalParameter ||
                idRepWidgetApp == RepWidgetAppIdEnum.PostShippingCosts || idRepWidgetApp == RepWidgetAppIdEnum.PrinterControl);

        //btnTableFieldsTranslate
        menuSettings.btnTableFieldsTranslate.enable = idRepWidgetType >= WidgetType.FieldSet && idRepWidgetType <= WidgetType.EditableTable;

        //txtFilterTable
        menuSettings.txtFilterTable.enable = idRepWidgetType === WidgetType.DataGrid || idRepWidgetType === WidgetType.EditableGrid ||
            idRepWidgetType === WidgetType.TableWithFilter || idRepWidgetType === WidgetType.EditableRoleTreeGrid;

        //btnSaveSettings
        menuSettings.btnSaveSettings.enable = idRepWidgetApp != RepWidgetAppIdEnum.RepositoryDetail;

        //btnOpenUserRoleDialog
        menuSettings.btnOpenUserRoleDialog.enable = idRepWidgetApp == RepWidgetAppIdEnum.UserList;

        //btnOpenTranslateWidget
        menuSettings.btnOpenTranslateWidget.enable = hasRightToolbarButton_TranslateButton && idRepWidgetType == WidgetType.Combination;

        //Process for widget CustomerCommunication
        if (idRepWidgetType == WidgetType.CustomerCommunication) {
            menuSettings.btnSetting1.enable = false;
            menuSettings.btnToolbar.enable = false;
            menuSettings.btnRefresh.enable = true;
        }
        else if (idRepWidgetType == WidgetType.CustomerLogo) {
            menuSettings.btnSetting1.enable = false;
            menuSettings.btnToolbar.enable = false;
            menuSettings.btnRefresh.enable = false;
        }

        //Box Search Article
        if (idRepWidgetApp == RepWidgetAppIdEnum.ArticleOrderDetail) {
            menuSettings.boxSearchArticle.enable = true;
            menuSettings.btnAddRowForEditableTableWidget.enable = false;
        }

        if (switchToEditSettingInImageOcr) {
            menuSettings.btnSettingForEditMode = false;
            menuSettings.btnToolbar.enable = false;
            menuSettings.btnSetting2.enable = true;
            menuSettings.btnEditForm.enable = false;
        }
    }

    private isSupportWidgetSetting(idRepWidgetType: number) {
        switch (idRepWidgetType) {
            case WidgetType.CustomerHistory:
            case WidgetType.OrderDataEntry:
            case WidgetType.FileExplorer:
            case WidgetType.ToolFileTemplate:
            case WidgetType.FileExplorerWithLabel:
                return false;
        }
        return true;
    }

    private isShowToogleButton(idRepWidgetType: number) {
        switch (idRepWidgetType) {
            case WidgetType.FileExplorer:
            case WidgetType.ToolFileTemplate:
            case WidgetType.FileExplorerWithLabel:
            case WidgetType.FileTemplate:
                return true;
        }
        return false;
    }
}
