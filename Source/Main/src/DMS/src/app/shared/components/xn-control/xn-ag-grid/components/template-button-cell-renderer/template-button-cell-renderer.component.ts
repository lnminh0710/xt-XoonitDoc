import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { ColHeaderKey } from '../../shared/ag-grid-constant';
import { Uti } from '@app/utilities';

@Component({
    selector: 'template-button-cell-renderer',
    templateUrl: './template-button-cell-renderer.html',
    styleUrls: ['./template-button-cell-renderer.scss'],
})
export class TemplateButtonCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {
    public mode: string;
    public loginActived?: string;
    public title?: string;
    public isActive?: string;

    public isShowDelCustom = false;
    public isShowButtonCustom = true;

    constructor(private store: Store<AppState>) {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    /**
     * getCustomParam
     * @param params
     */
    protected getCustomParam(params: any) {
        if (params) {
            this.mode = params.mode;
        }
        const obj = Uti.parseJsonString(this.value);
        if (obj) {
            this.mode = obj.mode;

            this.loginActived = obj.loginActived;
            this.title = obj.title;
            this.isActive = obj.isActive;

            this.isShowDelCustom = obj.isShowDel === '1' ? true : false;
            this.isShowButtonCustom = obj.isShowButton === '1' ? true : false;
        }
    }

    /**
     * btnClick
     **/
    public btnClick(eventData?: any) {
        switch (this.mode) {
            case 'Add':
                this.componentParent.rowDoubleClicked.emit(this.params.data);
                break;
            case 'Delete':
                if (this.componentParent.redRowOnDelete) {
                    this.componentParent.setDeleteCheckboxStatus(
                        this.params.data,
                        !this.params.data[ColHeaderKey.Delete],
                        (item) => {
                            this.componentParent.updateRowData([item]);
                            this.componentParent.deleteRows();
                        },
                    );
                }
                this.componentParent.deleteClick.emit(this.params.data);
                break;
            case 'Archive':
                this.componentParent.archiveClick.emit(this.params.data);
                break;
            case 'SendLetter':
                this.componentParent.sendLetterClick.emit(this.params.data);
                break;
            case 'Unblock':
                this.componentParent.unblockClick.emit(this.params.data);
                break;
            case 'StartStop':
                this.value = this.value == '1' ? '0' : '1';
                this.params.data['StartStop'] = this.value;
                this.componentParent.startStopClick.emit(this.params.data);
                break;
            case 'Run':
                this.componentParent.runClick.emit(this.params.data);
                break;
            case 'Download':
                this.componentParent.downloadClick.emit(this.params.data);
                break;
            case 'Setting':
                this.componentParent.settingClick.emit(this.params.data);
                break;
            case 'PDF':
                this.componentParent.pdfClick.emit(this.params.data);
                break;
            case 'EditRow':
                this.componentParent.editRowClick.emit(this.params.data);
                break;
            case 'Edit':
            case 'FilterExtended':
                this.componentParent.editClick.emit(this.params.data);
                break;
            case 'rowColCheckAll':
                switch (eventData) {
                    case 'horizontal':
                        let allTrue =
                            this.params.data.RMDelete &&
                            this.params.data.RMEdit &&
                            this.params.data.RMExport &&
                            this.params.data.RMNew &&
                            this.params.data.RMRead;
                        if (allTrue) {
                            this.params.data.RMDelete = this.params.data.RMDelete != -1 ? 0 : this.params.data.RMDelete;
                            this.params.data.RMEdit = this.params.data.RMEdit != -1 ? 0 : this.params.data.RMEdit;
                            this.params.data.RMExport = this.params.data.RMExport != -1 ? 0 : this.params.data.RMExport;
                            this.params.data.RMNew = this.params.data.RMNew != -1 ? 0 : this.params.data.RMNew;
                            this.params.data.RMRead = this.params.data.RMRead != -1 ? false : this.params.data.RMRead;
                        } else {
                            this.params.data.RMDelete = this.params.data.RMDelete != -1 ? 1 : this.params.data.RMDelete;
                            this.params.data.RMEdit = this.params.data.RMEdit != -1 ? 1 : this.params.data.RMEdit;
                            this.params.data.RMExport = this.params.data.RMExport != -1 ? 1 : this.params.data.RMExport;
                            this.params.data.RMNew = this.params.data.RMNew != -1 ? 1 : this.params.data.RMNew;
                            this.params.data.RMRead = this.params.data.RMRead != -1 ? true : this.params.data.RMRead;
                        }

                        this.componentParent.updateRowData([this.params.data]);
                        this.componentParent.refresh();
                        break;

                    case 'vertical':
                        this.updateRowColCheckAllRecursive(this.params.data.children, this.params.data);
                        this.componentParent.refresh();
                        break;
                }
            case 'loginActived':
                this.componentParent.resendEmailActivationClick.emit(this.params.data);
                break;
            case 'userStatus':
                if (eventData === 'forceActive') this.componentParent.forceActiveClick.emit(this.params.data);
                else this.componentParent.editClick.emit(this.params.data);
                break;
            case 'addDeleteAction':
                if (eventData === 'delete') {
                    this.componentParent.deleteClick.emit(this.params.data);
                } else if (eventData === 'add') {
                    this.componentParent.addRowClick.emit(this.params.data);
                }
                break;
        }
    }

    public actionGroupClick(mode: string) {
        switch (mode) {
            case 'edit':
                this.componentParent.editUser.emit(this.params.data);
                break;
            case 'delete':
                this.componentParent.deleteUser.emit(this.params.data);
                break;
            case 'reset':
                this.componentParent.resetPass.emit(this.params.data);
                break;
            case 'more':
                this.componentParent.moreAction.emit(this.params.data);
                break;
            default:
                break;
        }
    }

    private updateRowColCheckAllRecursive(children, parentData) {
        for (let i = 0; i < children.length; i++) {
            children[i].RMDelete =
                children[i].RMDelete != -1 && parentData.RMDelete != -1 ? parentData.RMDelete : children[i].RMDelete;
            children[i].RMEdit =
                children[i].RMEdit != -1 && parentData.RMEdit != -1 ? parentData.RMEdit : children[i].RMEdit;
            children[i].RMExport =
                children[i].RMExport != -1 && parentData.RMExport != -1 ? parentData.RMExport : children[i].RMExport;
            children[i].RMNew =
                children[i].RMNew != -1 && parentData.RMNew != -1 ? parentData.RMNew : children[i].RMNew;
            children[i].RMRead =
                children[i].RMRead != -1 && parentData.RMRead != -1 ? parentData.RMRead : children[i].RMRead;
            this.componentParent.updateRowData([children[i]]);

            this.updateRowColCheckAllRecursive(children[i].children, parentData);
        }
    }
}
