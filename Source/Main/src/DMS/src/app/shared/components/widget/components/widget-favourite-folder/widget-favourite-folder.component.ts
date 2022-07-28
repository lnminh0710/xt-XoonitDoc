import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, AfterContentInit, ViewChild } from "@angular/core";
import { BaseComponent, ModuleList } from "@app/pages/private/base";
import { Router } from "@angular/router";
import { TreeFolderStructModeEnum, DocumentTreeTypeDisplayName, MessageModal, LocalStorageKey } from "@app/app.constants";
import { AdministrationDocumentActions, AdministrationDocumentActionNames, CustomAction, GlobalSearchActions } from "@app/state-management/store/actions";
import { AdministrationDocumentSelectors } from "@app/state-management/store/reducer";
import { AppState } from "@app/state-management/store";
import { Store } from "@ngrx/store";
import { DocumentHelper, Uti } from "@app/utilities";
import { DocumentTreeModel, DocumentTreeModeEnum } from "@app/models/administration-document/document-tree.payload.model";
import { TreeComponent, TreeNode } from '@circlon/angular-tree-component';
import { ToasterService } from "angular2-toaster";
import { ModalService } from "@app/services";
import { MessageModel } from "@app/models";
import { FavouriteContactModel } from "@app/models/favourite-contact.model";
import { GlobalSearchFilterModel } from "@app/models/global-search-filter.model";
import { Actions, ofType } from "@ngrx/effects";
import { ContactDetailMoldel } from "@app/models/contact-document.model";
import { XnDocumentTreeComponent } from "@app/shared/components/xn-control";
import { takeUntil, filter } from "rxjs/operators";

@Component({
    selector: 'widget-favourite-folder',
    templateUrl: './widget-favourite-folder.component.html',
    styleUrls: ['./widget-favourite-folder.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetFavouriteFolderComponent extends BaseComponent implements OnInit, OnDestroy, AfterContentInit {

    @ViewChild('xnDocumentTree') xnDocumentTree: XnDocumentTreeComponent;
    public MODE_TREE_ENUM = TreeFolderStructModeEnum;
    public docTreeList: DocumentTreeModel[] = [];
    private currentPersonId = '';

    private _mappingAction:
        Map<
            DocumentTreeModeEnum,
            {
                callbackConfirmOk: (node: TreeNode) => void,
                callbackConfirmCancel?: (node: TreeNode) => void
            }>
        = new Map<DocumentTreeModeEnum, { callbackConfirmOk: (node: TreeNode) => void, callbackConfirmCancel?: (node: TreeNode) => void }>();

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private store: Store<AppState>,
        protected action$: Actions,
        private administrationDocumentActions: AdministrationDocumentActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private toastrService: ToasterService,
        private modalService: ModalService,
    ) {
        super(router);
        this.subscribeAction();
    }

    ngOnInit(): void {
        this.initAction();
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngAfterContentInit(): void {
        this.registerFolderModeActions();
    }

    private subscribeAction() {
        this.administrationDocumentSelectors.actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_FAVOURITE_FOLDER)
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((action: CustomAction) => {
                let tree = action.payload as any[];
                this.docTreeList = DocumentHelper.mapToDocumentNode(tree, DocumentTreeTypeDisplayName.FAVOURITE);
                this.cdRef.detectChanges();
            });

        this.administrationDocumentSelectors.actionSuccessOfSubtype$(AdministrationDocumentActionNames.CREATE_NEW_FAVOURITE_FOLDER)
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((action: CustomAction) => {
                const result = action.payload;
                const doc = this.docTreeList.find(x => !x.idDocument);
                this.toastrService.pop(MessageModal.MessageType.success, 'System', `Create new folder "${doc.name}" successfully`);
                doc.idDocument = result.returnID
                doc.mode = DocumentTreeModeEnum.VIEW;
                doc.quantity = 0;
                this.cdRef.detectChanges();
            });

        this.action$
            .pipe(
                ofType(GlobalSearchActions.ROW_DOUBLE_CLICK),
                filter((action: CustomAction) => this.isValidPayloadContactDetail(action)),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const data = action.payload.data as ContactDetailMoldel;
                this.currentPersonId = data.idPerson;
            });

        this.administrationDocumentSelectors.actionSuccessOfSubtype$(AdministrationDocumentActionNames.ADD_CONTACT_TO_MY_FAVOURITE)
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe((action: CustomAction) => {
                if (!action && !action.payload) return;
                const typeToastMsg = action.payload.returnID !== "" && parseInt(action.payload.returnID) > 0 ? MessageModal.MessageType.success : MessageModal.MessageType.warning;
                this.toastrService.pop(typeToastMsg, 'System', action.payload.userErrorMessage);
            });
    }

    public dblClickOnNode($event: { event: Event, node: TreeNode }) {
        const data = $event.node.data as DocumentTreeModel
        if (!data) return;

        const filterData = {
            fieldsName: ['idRepMyFavorites'],
            fieldsValue: [data.idDocument.toString()]
        } as GlobalSearchFilterModel;
        this.store.dispatch(this.administrationDocumentActions.globalSearchFilterByFolder(filterData));
    }

    public newFolder($event: { event: Event, treeComponent: TreeComponent }) {
        this.xnDocumentTree.closeContextMenu();
        if (!$event.treeComponent.treeModel.nodes) $event.treeComponent.treeModel.nodes = [];

        const newData = DocumentHelper.mapData({}, DocumentTreeTypeDisplayName.TREE_FOLDER);
        newData.mode = DocumentTreeModeEnum.CREATE_NEW;
        $event.treeComponent.treeModel.nodes.push(newData);
        $event.treeComponent.treeModel.update();
    }

    public okActionFolderName($event: { event: Event, node: TreeNode, value: string }) {
        if (!$event.value.length) {
            this.toastrService.pop(MessageModal.MessageType.warning, 'System', 'Please enter a folder name');
            return;
        }

        const node = $event.node;
        const data = node.data as DocumentTreeModel;

        this.confirmToSaveFolder(
            data,
            () => { // click OK
                if (!this._mappingAction.get(data.mode).callbackConfirmOk) return;

                data.name = $event.value;
                this._mappingAction.get(data.mode).callbackConfirmOk(node);
            },
            () => { // click Cancel
                if (!this._mappingAction.get(data.mode).callbackConfirmCancel) return;

                this._mappingAction.get(data.mode).callbackConfirmCancel(node);
            });
    }

    public cancelActionFolderName($event: { event: Event, node: TreeNode }) {
        const node = $event.node;
        const data = $event.node.data as DocumentTreeModel;

        if (!this._mappingAction.get(data.mode).callbackConfirmCancel) return;

        this._mappingAction.get(data.mode).callbackConfirmCancel(node);
    }

    private registerFolderModeActions() {

        this._mappingAction.set(DocumentTreeModeEnum.CREATE_NEW, {
            callbackConfirmOk: (node: TreeNode) => {
                const parent = node.parent;
                const data = node.data as DocumentTreeModel;
                data.order = parent.children.length;
                this.store.dispatch(this.administrationDocumentActions.createNewFavouriteFolder(data));
            },
            callbackConfirmCancel: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;
                const parentNode = node.parent;
                const index = parentNode.data.children.findIndex((n: DocumentTreeModel) => n === data);
                parentNode.data.children.splice(index, 1);
                this.xnDocumentTree.updateTree();
            }
        });
    }

    private confirmToSaveFolder(
        folder: DocumentTreeModel,
        callbackOk: () => void,
        callbackCancel?: () => void): void {

        this.modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Confirmation',
            messageType: MessageModal.MessageType.confirm,
            message: [ { key: '<p>' }, { key: 'Modal_Message__AreYouSureTo' }, { key: folder.mode }, { key: 'Modal_Message__ThisFolder' }, { key: '</p>' }],
            buttonType1: MessageModal.ButtonType.danger,
            callBack1: () => { // button Ok clicked
                callbackOk();
            },
            callBack2: () => { // button Cancel clicked
                callbackCancel && callbackCancel();
            }
        }));
    }

    addContactToFavouriteFolder($event: { $event: Event, node: TreeNode }) {
        this.xnDocumentTree.closeContextMenu();

        if (!this.currentPersonId) {
            this.toastrService.pop(MessageModal.MessageType.warning, 'Warning', `Please select contact!`);
            return;
        }

        const data = {
            idRepMyFavorites: $event.node.data.idDocument,
            idPerson: this.currentPersonId,
        } as FavouriteContactModel;
        this.store.dispatch(this.administrationDocumentActions.addContactToMyFavourite(data));
    }

    initAction() {
        this.store.dispatch(this.administrationDocumentActions.getFavouriteFolder());
        const actions = JSON.parse(window.localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()))) as CustomAction[];
        if (actions && this.isValidPayloadContactDetail(actions[0])) {
            const data = actions[0].payload.data as ContactDetailMoldel;
            this.currentPersonId = data.idPerson;
        }
    }
    private isValidPayloadContactDetail(action: CustomAction) {
        return action.payload
            && action.payload.selectedModule
            && action.payload.selectedModule.idSettingsGUI === ModuleList.Contact.idSettingsGUI;
    }
}
