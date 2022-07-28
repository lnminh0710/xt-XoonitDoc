import { AccessRightWidgetCommandButtonEnum } from "@app/app.constants";

export class WidgetMenuStatusModel {
    public accessRight: any = {};
    public enable: boolean = false;
    public style: any = {};
    public class: WidgetMenuStatusClassModel = new WidgetMenuStatusClassModel();
    //Buttons
    public btnSettingForEditMode: boolean = false;
    public btnSetting1: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnSetting2: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnSetting3: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();

    public btnToolbar: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnRefresh: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnToggleToolButtons: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnEditForm: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnEditEditableTable: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnEditWidgetOptions: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();    
    public btnEditCountryWidget: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnEditTreeViewWidget: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnUploadFileWidget: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnDeleteFileWidget: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnSaveCountryWidget: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnWidgetTranslation: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnAddRowForEditableTableWidget: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnPrintWidget: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnArticleNameTranslation: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnGoToNextcolumnOrRow: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnEditTemplate: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnTableFieldsTranslate: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnSaveSettings: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnOpenUserRoleDialog: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnOpenTranslateWidget: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnResetWidget: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnSaveWidgetForm: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();
    public btnSaveWidgetTable: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();

    //Textboxx/ Input
    public txtFilterTable: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();

    //Box Search Article
    public boxSearchArticle: WidgetMenuStatusPropertyModel = new WidgetMenuStatusPropertyModel();

    public constructor(init?: Partial<WidgetMenuStatusModel>) {
        Object.assign(this, init);
    }

    public getAccessRightForCommandButton(buttonName: string): boolean {
        if (this.accessRight && this.accessRight['orderDataEntry']) return true;

        if (!this.accessRight || !this.accessRight[AccessRightWidgetCommandButtonEnum[buttonName]]) return false;

        return this.accessRight[AccessRightWidgetCommandButtonEnum[buttonName]]['read'];
    }

    public getAccessRight(commandName: string): boolean {
        if (this.accessRight && this.accessRight['orderDataEntry']) return true;

        return this.accessRight[commandName];
    }
}

export class WidgetMenuStatusPropertyModel {
    public enable: boolean = false;
    public class: any = {};
    public style: any = {};
    public events: any = {};
    public data: any = {};

    public constructor(init?: Partial<WidgetMenuStatusPropertyModel>) {
        Object.assign(this, init);
    }
}

export class WidgetMenuStatusClassModel {
    public editTemplateMode: boolean = false;
    public showToolButtons: boolean = false;
    public visibilityHidden: boolean = false;

    public constructor(init?: Partial<WidgetMenuStatusClassModel>) {
        Object.assign(this, init);
    }
}
