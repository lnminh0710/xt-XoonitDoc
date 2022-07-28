import { Component, OnInit, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import {
    IMaterialControlConfig,
    IRadiosMaterialControlConfig,
    IInputMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@xn-control/light-material-ui/dialog';
import {
    DocumentTreeModel,
    DocumentTreeModeEnum,
} from '@app/models/administration-document/document-tree.payload.model';
import { TranslateService } from '@ngx-translate/core';
import { XnDynamicMaterialHelperService } from '@xn-control/xn-dynamic-material-control/services/xn-dynamic-matertial-helper.service';
import { Uti } from '@app/utilities';
import { DocumentTreeNodeDialogModel } from './models/document-tree-node-dialog.model';
import { NodeDialogDataModel } from './models/node-dialog-data.model';
import { TreeNode } from '@circlon/angular-tree-component';
import { IconNames } from '@app/app-icon-registry.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KeyCode } from '@app/app.constants';

class RadioData {
    value: string;
    name: string;
}

enum FormControlName {
    FOLDER_NAME = 'folderName',
    PARENT_FOLDER = 'parentFolder',
    POSITION_FOLDER = 'positionFolder',
}

@Component({
    selector: 'xn-document-tree-node-dialog',
    templateUrl: 'xn-document-tree-node-dialog.component.html',
    styleUrls: ['xn-document-tree-node-dialog.component.scss'],
})
export class XnDocumentTreeNodeDialogComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly ROOT_FOLDER_VALUE = 'root';
    private readonly SUBFOLDER_VALUE = 'subfolder';
    private readonly TOP_VALUE = 'top';
    private readonly BOTTOM_VALUE = 'bottom';

    private _onDestroy = new ReplaySubject<boolean>();

    private _parentFolderConfig: IRadiosMaterialControlConfig;
    private _positionFolderConfig: IRadiosMaterialControlConfig;
    private _folderNameConfig: IInputMaterialControlConfig;

    public formGroup: FormGroup;
    public controlConfigs: IMaterialControlConfig[];
    public folder: DocumentTreeModel;

    public DocumentTreeModeEnum = DocumentTreeModeEnum;

    public iconFolder = IconNames.APP_FOLDER_WHITE_BLUE;

    constructor(
        public dialogRef: MatDialogRef<XnDocumentTreeNodeDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public matDialogData: NodeDialogDataModel,
        private fb: FormBuilder,
        private translateService: TranslateService,
        private dynamicMaterialHelper: XnDynamicMaterialHelperService,
    ) {
        this._initializeForm();
    }

    ngOnInit() {
        this._registerListeners();
    }

    ngOnDestroy(): void {
        this._onDestroy.next(true);
    }

    ngAfterViewInit(): void {
        switch (this.matDialogData.mode) {
            case DocumentTreeModeEnum.CREATE_NEW:
                this._parentFolderConfig.disableRadioButton(this.SUBFOLDER_VALUE);
                break;
            case DocumentTreeModeEnum.ADD_SUB_FOLDER:
                this._parentFolderConfig.disableRadioButton(this.ROOT_FOLDER_VALUE);
                this._positionFolderConfig.disableRadioGroup();
                break;
            case DocumentTreeModeEnum.DELETE:
                break;
            case DocumentTreeModeEnum.RENAME:
                this._parentFolderConfig.disableRadioGroup();
                this._positionFolderConfig.disableRadioGroup();
                break;
            case DocumentTreeModeEnum.VIEW:
                break;
            default:
                break;
        }
    }

    public cancelClicked($event) {
        this.dialogRef.close();
    }

    public okClicked($event) {
        this.formGroup.markAllAsTouched();
        this.formGroup.markAsDirty();

        if (!this._validateForm()) {
            return;
        }

        // switch (this.matDialogData.mode) {
        //     case DocumentTreeModeEnum.CREATE_NEW:
        //         break;
        //     case DocumentTreeModeEnum.ADD_SUB_FOLDER:
        //         break;
        //     case DocumentTreeModeEnum.DELETE:
        //         break;
        //     case DocumentTreeModeEnum.RENAME:
        //         break;
        //     case DocumentTreeModeEnum.VIEW:
        //         break;
        //     default:
        //         break;
        // }

        const nodeDialog = new DocumentTreeNodeDialogModel({
            name: this.formGroup.controls.folderName.value,
            isRoot: this.formGroup.controls.parentFolder.value === this.ROOT_FOLDER_VALUE ? true : false,
            position: this.formGroup.controls.positionFolder.value === this.TOP_VALUE ? 'top' : 'bottom',
        });

        this.dialogRef.close(nodeDialog);
        this.formGroup.reset();
        this.folder = null;
    }

    public onCtrlKeyDown($event: KeyboardEvent) {
        switch ($event.keyCode) {
            case KeyCode.Enter:
                this.okClicked(null);
                break;

            default:
                break;
        }
    }

    private _initializeForm() {
        this._createForm();
    }

    private _registerListeners() {
        this.dialogRef
            .keydownEvents()
            .pipe(takeUntil(this._onDestroy.asObservable()))
            .subscribe((event: KeyboardEvent) => {
                switch (event.keyCode) {
                    case KeyCode.Escape:
                        this.dialogRef.close();
                        break;

                    default:
                        break;
                }
            });
    }

    private _createForm() {
        let defaultValueParentFolder = '';
        let defaultValuePositionFolder = '';
        let defaultFolderName = '';
        switch (this.matDialogData.mode) {
            case DocumentTreeModeEnum.CREATE_NEW:
                defaultValueParentFolder = this.ROOT_FOLDER_VALUE;
                defaultValuePositionFolder = this.TOP_VALUE;
                break;

            case DocumentTreeModeEnum.ADD_SUB_FOLDER:
                defaultValueParentFolder = this.SUBFOLDER_VALUE;
                defaultValuePositionFolder = '';
                break;

            case DocumentTreeModeEnum.RENAME:
                defaultFolderName = (this.matDialogData.node.data as DocumentTreeModel).name;
                break;

            default:
                break;
        }

        this.formGroup = this.fb.group({
            [`${FormControlName.FOLDER_NAME}`]: new FormControl(defaultFolderName, [Validators.required, Validators.maxLength(60)]),
            [`${FormControlName.PARENT_FOLDER}`]: new FormControl(defaultValueParentFolder, []),
            [`${FormControlName.POSITION_FOLDER}`]: new FormControl(defaultValuePositionFolder, []),
        });

        const { folderNameTxt, rootFolderTxt, subFolderTxt, topTxt, bottomTxt } = this._getTranslateText();
        const parentFolderName = (this.matDialogData.node.data as DocumentTreeModel)?.name || '';

        const parentFolderData: RadioData[] = [
            { value: this.ROOT_FOLDER_VALUE, name: rootFolderTxt },
            { value: this.SUBFOLDER_VALUE, name: `${subFolderTxt} ${parentFolderName}` },
        ];
        const positionFolderData: RadioData[] = [
            { value: this.TOP_VALUE, name: topTxt },
            { value: this.BOTTOM_VALUE, name: bottomTxt },
        ];

        this._createDynamicControlConfig(folderNameTxt, parentFolderData, positionFolderData);
    }

    private _createDynamicControlConfig(
        folderNameTxt: string,
        parentFolderData: RadioData[],
        positionFolderData: RadioData[],
    ) {
        this._folderNameConfig = this._createInputMaterialControlConfig('folderName', folderNameTxt, 1);

        this._parentFolderConfig = this._createRadiosMaterialControlConfig(
            FormControlName.PARENT_FOLDER,
            'Parent Folder',
            2,
            '{ "float": "left", "width": "70%" }',
            (ctrlConfig) => {
                ctrlConfig.radioOptions = parentFolderData;
                ctrlConfig.displayMemberOpt = () => Uti.nameOf(parentFolderData[0], (o) => o.name);
                ctrlConfig.valueMemberOpt = () => Uti.nameOf(parentFolderData[0], (o) => o.value);
            },
        );

        this._positionFolderConfig = this._createRadiosMaterialControlConfig(
            FormControlName.POSITION_FOLDER,
            'Position Folder',
            3,
            '{ "float": "right" }',
            (ctrlConfig) => {
                ctrlConfig.radioOptions = positionFolderData;
                ctrlConfig.displayMemberOpt = () => Uti.nameOf(positionFolderData[0], (o) => o.name);
                ctrlConfig.valueMemberOpt = () => Uti.nameOf(positionFolderData[0], (o) => o.value);
            },
        );

        this.controlConfigs = [this._folderNameConfig, this._parentFolderConfig, this._positionFolderConfig];
    }

    private _getTranslateText() {
        let folderNameTxt: string;
        let rootFolderTxt: string;
        let subFolderTxt: string;
        let topTxt: string;
        let bottomTxt: string;

        this.translateService
            .get('XN_DOCUMENT_TREE_NODE_DIALOG__Folder_Name')
            .subscribe((val: string) => (folderNameTxt = val));
        this.translateService
            .get('XN_DOCUMENT_TREE_NODE_DIALOG__Root_folder')
            .subscribe((val: string) => (rootFolderTxt = val));
        this.translateService
            .get('XN_DOCUMENT_TREE_NODE_DIALOG__Subfolder')
            .subscribe((val: string) => (subFolderTxt = val));
        this.translateService.get('COMMON_LABEL__Top').subscribe((val: string) => (topTxt = val));
        this.translateService.get('COMMON_LABEL__Bottom').subscribe((val: string) => (bottomTxt = val));

        return {
            folderNameTxt,
            rootFolderTxt,
            subFolderTxt,
            topTxt,
            bottomTxt,
        };
    }

    private _validateForm() {
        this.formGroup.markAllAsTouched();
        this.formGroup.markAsDirty();
        if (this.formGroup.invalid) {
            return false;
        }
        return true;
    }

    private _createInputMaterialControlConfig(fieldName: string, columnName: string, orderBy: number) {
        const controlConfig = this.dynamicMaterialHelper.createInputMaterialControlConfig(
            fieldName,
            columnName,
            orderBy,
            {
                Validators: {
                    MaxLength: '60',
                },
            },
        );
        return controlConfig;
    }

    private _createRadiosMaterialControlConfig(
        fieldName: string,
        columnName: string,
        orderBy: number,
        customStyle: string,
        setOptions: (radiosCtrl: IRadiosMaterialControlConfig) => void,
    ) {
        const controlConfig = this.dynamicMaterialHelper.createRadiosButtonMaterialControlConfig(
            fieldName,
            columnName,
            orderBy,
            setOptions,
            {
                CustomStyle: customStyle,
            },
            true,
        );
        controlConfig.class = 'my-3';
        return controlConfig;
    }
}
