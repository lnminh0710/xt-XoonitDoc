import {
    Directive,
    OnInit,
    ViewChild,
    ChangeDetectorRef,
    AfterViewInit,
    Input,
    ViewContainerRef,
    Injector,
} from '@angular/core';
import { Router } from '@angular/router';
import { TreeComponent, TreeNode } from '@circlon/angular-tree-component';
import {
    DocumentTreeModeEnum,
    DocumentTreeModel,
} from '@app/models/administration-document/document-tree.payload.model';
import { XnDocumentTreeComponent } from '@xn-control/xn-document-tree';
import { take, takeUntil, filter, tap } from 'rxjs/operators';
import { DocumentTreeNodeDialogModel } from '@xn-control/xn-document-tree-node-dialog/models/document-tree-node-dialog.model';
import {
    DocumentTreeTypeDisplayName,
    Configuration,
    MessageModal,
    TreeFolderStructModeEnum,
    MenuModuleId,
} from '@app/app.constants';
import { MessageModel } from '@app/models';
import { DocumentHelper } from '@app/utilities';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
    CustomAction,
    LayoutInfoActions,
} from '@app/state-management/store/actions';
import { ModalService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { ToasterService } from 'angular2-toaster';
import { XnDocumentTreeService } from '@xn-control/xn-document-tree/services/xn-document-tree.service';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { StructureTreeSettingsStateModel } from '@app/state-management/store/models/app-global/state/structure-tree-settings.state.model';
import { BaseWidgetCommonAction } from '../../../../widget/components/base-widget-common-action';

@Directive()
export abstract class BaseWidgetStructureTreeComponent extends BaseWidgetCommonAction implements OnInit, AfterViewInit {
    private _mappingAction: Map<
        DocumentTreeModeEnum,
        {
            callbackConfirmOk: (node: TreeNode) => void;
            callbackConfirmCancel?: (node: TreeNode) => void;
        }
    > = new Map<
        DocumentTreeModeEnum,
        { callbackConfirmOk: (node: TreeNode) => void; callbackConfirmCancel?: (node: TreeNode) => void }
    >();

    private _administrationActions: AdministrationDocumentActions;
    private _administrationSelectors: AdministrationDocumentSelectors;
    private _modalService: ModalService;
    private _store: Store<AppState>;
    private _cdRef: ChangeDetectorRef;
    private _toastrService: ToasterService;
    private _xnDocumentTreeService: XnDocumentTreeService;
    private _layoutInfoAction: LayoutInfoActions;

    public modeTree: TreeFolderStructModeEnum;
    public structureTreeSettings: StructureTreeSettingsStateModel;

    @Input() tabID: string;
    @Input() allowDesignEdit: boolean;
    @ViewChild(XnDocumentTreeComponent) xnDocumentTree: XnDocumentTreeComponent;

    constructor(protected router: Router, protected injector: Injector, protected containerRef: ViewContainerRef) {
        super(injector, containerRef, router);

        this._administrationActions = injector.get(AdministrationDocumentActions);
        this._administrationSelectors = injector.get(AdministrationDocumentSelectors);
        this._modalService = injector.get(ModalService);
        this._store = injector.get<Store<AppState>>(Store);
        this._cdRef = injector.get(ChangeDetectorRef);
        this._toastrService = injector.get(ToasterService);
        this._xnDocumentTreeService = injector.get(XnDocumentTreeService);
        this._layoutInfoAction = injector.get(LayoutInfoActions);
        this._registerCRUDNodeTreeSubscriptions();
        this._registerFolderModeActions();
        this._getStructureTreeSettings();
    }

    ngOnInit() {}

    ngAfterViewInit(): void {}

    // this function only run one times on first load
    private _getStructureTreeSettings() {
        this._xnDocumentTreeService.getStructureTreeSettings();
    }

    protected listenStructureTreeSettingsChanges() {
        return this._xnDocumentTreeService.structureSettingsChanged$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .pipe(
                tap((settings) => {
                    if (!settings) return;

                    // do common behavior when tree settings changes (such as show only active folders, collapse tree, ...)
                    this.structureTreeSettings = settings;

                    if (!this.xnDocumentTree) return;

                    this.xnDocumentTree.toggleVisibleNodes(settings);
                    this.xnDocumentTree.toggleCollapseTree(settings);
                }),
            );
    }

    private _registerCRUDNodeTreeSubscriptions() {
        this._administrationSelectors
            .actionOfType$(AdministrationDocumentActionNames.CHANGE_MODE_SELECTABLE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((_) => {
                this.modeTree = TreeFolderStructModeEnum.SELECTABLE_FOLDER;
            });

        this._administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.CREATE_NEW_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const newFolder = action.payload as DocumentTreeModel;
                this._toastrService.pop(
                    MessageModal.MessageType.success,
                    'System',
                    `Create new folder "${newFolder.name}" successfully`,
                );

                if (this.ofModule.idSettingsGUI === MenuModuleId.indexing) return;
                newFolder.mode = DocumentTreeModeEnum.VIEW;

                // if add new folder on root top position then reorder all root folders
                if (newFolder.order === 1) {
                    this._xnDocumentTreeService.structureTreeSettings.nodesState.splice(0, 0, {
                        idDocument: newFolder.idDocument,
                        visible: true,
                        children: [],
                        order: 1,
                    });
                    this._xnDocumentTreeService.reorderRootFolderPosition(
                        this.xnDocumentTree.treeComponent.treeModel.nodes,
                    );
                }

                this.xnDocumentTree.updateTree();
                this._cdRef.detectChanges();
            });

        this._administrationSelectors
            .actionFailedOfSubtype$(AdministrationDocumentActionNames.CREATE_NEW_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const newFolder = action.payload as DocumentTreeModel;
                if (
                    newFolder.order === 1 &&
                    this.xnDocumentTree.treeComponent.treeModel.nodes &&
                    this.xnDocumentTree.treeComponent.treeModel.nodes.length >= 1
                ) {
                    this.xnDocumentTree.treeComponent.treeModel.nodes.splice(0, 1);
                } else {
                    this.xnDocumentTree.treeComponent.treeModel.nodes.pop();
                }
                this._toastrService.pop(
                    MessageModal.MessageType.error,
                    'System',
                    `Create new folder "${newFolder.name}" failed`,
                );

                newFolder.mode = DocumentTreeModeEnum.VIEW;
                this.xnDocumentTree.updateTree();
                this._cdRef.detectChanges();
            });

        this._administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.ADD_NEWLY_SUB_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const documentFolder = action.payload as DocumentTreeModel;
                this._toastrService.pop(
                    MessageModal.MessageType.success,
                    'System',
                    `Add folder "${documentFolder.name}" successfully`,
                );
                documentFolder.mode = DocumentTreeModeEnum.VIEW;
                this.xnDocumentTree.updateTree();
                this._cdRef.detectChanges();
            });

        this._administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.RENAME_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const documentFolder = action.payload as DocumentTreeModel;
                this._toastrService.pop(
                    MessageModal.MessageType.success,
                    'System',
                    `Rename folder "${documentFolder.name}" successfully`,
                );
                documentFolder.mode = DocumentTreeModeEnum.VIEW;
                this._cdRef.detectChanges();
            });

        this._administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.DELETE_TREE_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const node = action.payload as TreeNode;
                this._toastrService.pop(
                    MessageModal.MessageType.success,
                    'System',
                    `Delete folder "${node.data.name}" successfully`,
                );

                const parentNode = node.parent;
                const index = parentNode.data.children.findIndex((n: DocumentTreeModel) => n === node.data);
                parentNode.data.children.splice(index, 1);
                if ((parentNode.data as DocumentTreeModel).children.length === 0) {
                    (parentNode.data as DocumentTreeModel).hasChildren = false;
                }

                this._xnDocumentTreeService.deleteNodesState([(node.data as DocumentTreeModel).idDocument]);

                this.xnDocumentTree.updateTree();
                this._cdRef.detectChanges();
            });
    }

    public newFolder($event: { event: Event; treeComponent: TreeComponent }) {
        this.xnDocumentTree.closeContextMenu();
        if (!$event.treeComponent.treeModel.nodes) $event.treeComponent.treeModel.nodes = [];

        let _dataDialog: DocumentTreeNodeDialogModel;

        this.xnDocumentTree
            .showXnDocumentTreeNodeDialog($event.treeComponent.treeModel.virtualRoot, DocumentTreeModeEnum.CREATE_NEW)
            .pipe(take(1))
            .subscribe((newNode: DocumentTreeNodeDialogModel) => {
                _dataDialog = newNode;

                const data = $event.treeComponent.treeModel.virtualRoot.data;
                const newData = DocumentHelper.mapData({}, DocumentTreeTypeDisplayName.TREE_FOLDER);
                newData.mode = DocumentTreeModeEnum.VIEW;
                newData.name = newNode.name;
                newData.order = newNode.position === 'top' ? 1 : $event.treeComponent.treeModel.nodes.length || 1;
                if (data.idDocumentParent) newData.idDocumentParent = data.idDocumentParent;
                if (data.idDocumentParentAfterCallApi)
                    newData.idDocumentParentAfterCallApi = data.idDocumentParentAfterCallApi;
                if (data.idDocumentType) newData.idDocumentType = data.idDocumentType;
                if (data.icon) newData.icon = data.icon;
                if (data.idLogin) newData.idLogin = data.idLogin;
                // newData.iconAsync$ = this._xnDocumentTreeService.getFolderIcon(newData);
                //permission
                newData.canShare = true;
                newData.canEdit = true;
                newData.canDelete = true;
                newData.canRead = true;

                // let rootFolders: DocumentTreeModel[];

                if (newNode.position === 'top') {
                    $event.treeComponent.treeModel.nodes.splice(0, 0, newData);
                    // rootFolders = this._cloneRootFolders($event.treeComponent.treeModel.nodes, true);
                } else {
                    $event.treeComponent.treeModel.nodes.push(newData);
                    // rootFolders = this._cloneRootFolders([newData], false);
                }

                this._store.dispatch(this._administrationActions.createNewTreeFolder(newData));
            });
    }

    public addSubfolder($event: { $event: Event; node: TreeNode }) {
        this.xnDocumentTree.closeContextMenu();

        if (!$event.node.data.children) $event.node.data.children = [];

        this.xnDocumentTree
            .showXnDocumentTreeNodeDialog($event.node, DocumentTreeModeEnum.ADD_SUB_FOLDER)
            .pipe(take(1))
            .subscribe((newNode: DocumentTreeNodeDialogModel) => {
                const parentData = $event.node.data as DocumentTreeModel;
                const newData = DocumentHelper.mapData({}, DocumentTreeTypeDisplayName.TREE_FOLDER);
                newData.idDocumentType = parentData.idDocumentType;
                newData.idDocumentParent =
                    parentData.isUser || parentData.isCompany
                        ? parentData.idDocumentParentAfterCallApi
                        : parentData.idDocument;
                newData.mode = DocumentTreeModeEnum.VIEW;
                newData.name = newNode.name;
                newData.order = parentData.children?.length || 1;
                if (parentData.idLogin) newData.idLogin = parentData.idLogin;
                //permission
                newData.canShare = parentData.canShare;
                newData.canEdit = parentData.canEdit;
                newData.canDelete = parentData.canDelete;
                newData.canRead = parentData.canRead;

                $event.node.data.children.push(newData);
                $event.node.data.hasChildren = true;
                $event.node.expand();
                this._store.dispatch(this._administrationActions.addNewlySubTreeFolder(newData));
            });
    }

    public renameFolder($event: { $event: Event; node: TreeNode }) {
        this.xnDocumentTree.closeContextMenu();
        const data = $event.node.data as DocumentTreeModel;
        data.mode = DocumentTreeModeEnum.RENAME;
        const path = this.xnDocumentTree.getPathFolder($event.node);
        data.path = path.join(Configuration.SEPARATOR_PATH);
        (data as any).oldFolderName = data.name;

        this.xnDocumentTree
            .showXnDocumentTreeNodeDialog($event.node, DocumentTreeModeEnum.RENAME)
            .pipe(take(1))
            .subscribe((nodeDialogModel: DocumentTreeNodeDialogModel) => {
                data.mode = DocumentTreeModeEnum.VIEW;
                data.name = nodeDialogModel.name;
                const payload = Object.assign({}, data) as DocumentTreeModel;
                payload.children = Object.assign([], payload.children) as DocumentTreeModel[];
                if (data.idDocumentParentAfterCallApi) payload.idDocumentParent = data.idDocumentParentAfterCallApi;
                this._store.dispatch(this._administrationActions.renameTreeFolder(payload));
                delete ($event.node.data as any).oldFolderName;
            });

        // this.xnDocumentTree.focusOnInputNode();
    }

    // toggle visible a folder node
    public toggleVisibleFolder($event: { event: boolean; node: TreeNode }) {
        const data = $event.node.data as DocumentTreeModel;
        data.visible = $event.event;
        const txt = data.visible ? 'Active' : 'Inactive';
        this._toastrService.pop(
            MessageModal.MessageType.success,
            'System',
            `${txt} folder "${data.name}" successfully`,
        );
        const node: TreeNode = this.xnDocumentTree.getNodeBy({ data });
        this.xnDocumentTree.toggleVisibleItsNodeChildren(node, data.visible);

        if (this._xnDocumentTreeService.structureTreeSettings.activeFoldersOnly && !data.visible) {
            this.xnDocumentTree.closeContextMenu();
        }

        this._cdRef.detectChanges();
    }

    public deleteFolder($event: { $event: Event; node: TreeNode }) {
        this.xnDocumentTree.closeContextMenu();
        const data = $event.node.data as DocumentTreeModel;
        if (data.idDocumentParentAfterCallApi) data.idDocumentParent = data.idDocumentParentAfterCallApi;
        data.mode = DocumentTreeModeEnum.DELETE;

        this.confirmToSaveFolder(
            data,
            () => {
                if (!this._mappingAction.get(data.mode).callbackConfirmOk) return;

                this._mappingAction.get(data.mode).callbackConfirmOk($event.node);
            },
            null,
        );
    }

    private _registerFolderModeActions() {
        this._mappingAction.set(DocumentTreeModeEnum.CREATE_NEW, {
            callbackConfirmOk: (node: TreeNode) => {
                const parent = node.parent;
                const data = node.data as DocumentTreeModel;
                data.order = parent.children.length;
                // this._store.dispatch(this._administrationActions.createNewTreeFolder(data));
            },
            callbackConfirmCancel: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;
                const parentNode = node.parent;
                const index = parentNode.data.children.findIndex((n: DocumentTreeModel) => n === data);
                parentNode.data.children.splice(index, 1);
                this.xnDocumentTree.updateTree();
            },
        });

        this._mappingAction.set(DocumentTreeModeEnum.ADD_SUB_FOLDER, {
            callbackConfirmOk: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;

                if (!node.parent) {
                    return;
                }
                const parentData = node.parent.data as DocumentTreeModel;

                data.idDocumentParent = parentData.idDocument;
                data.order = parentData.children.length;
                this._store.dispatch(this._administrationActions.addNewlySubTreeFolder(data));
            },
            callbackConfirmCancel: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;
                const parentNode = node.parent;
                const index = parentNode.data.children.findIndex((n: DocumentTreeModel) => n === data);
                parentNode.data.children.splice(index, 1);
                if (!parentNode.data.children.length) {
                    parentNode.data.hasChildren = false;
                }
                this.xnDocumentTree.updateTree();
            },
        });

        this._mappingAction.set(DocumentTreeModeEnum.DELETE, {
            callbackConfirmOk: (node: TreeNode) => {
                const pathFolder = this.xnDocumentTree.getPathFolder(node);

                // deleting choosen folder. So dispatch the action Select folder again
                // if (
                //     this.pathFolder.join(Configuration.SEPARATOR_PATH) === pathFolder.join(Configuration.SEPARATOR_PATH)
                // ) {
                //     this.modeTree = TreeFolderStructModeEnum.SELECTABLE_FOLDER;
                //     this.pathFolder = [];
                // }

                this._store.dispatch(this._administrationActions.deleteTreeFolder(node));
            },
            callbackConfirmCancel: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;
                data.mode = DocumentTreeModeEnum.VIEW;
            },
        });

        this._mappingAction.set(DocumentTreeModeEnum.RENAME, {
            callbackConfirmOk: (node: TreeNode) => {
                this._store.dispatch(this._administrationActions.renameTreeFolder(node.data as DocumentTreeModel));
                delete (node.data as any).oldFolderName;
            },
            callbackConfirmCancel: (node: TreeNode) => {
                const data = node.data as DocumentTreeModel;
                data.mode = DocumentTreeModeEnum.VIEW;
                delete (node.data as any).oldFolderName;
            },
        });
    }

    public okActionFolderName($event: { event: Event; node: TreeNode; value: string }) {
        if (!$event.value.length) {
            this._toastrService.pop(MessageModal.MessageType.warning, 'System', 'Please enter a folder name');
            return;
        }

        if (!this.checkRulesFolderName($event.value)) {
            this._toastrService.pop(
                MessageModal.MessageType.warning,
                'System',
                `The folder name "${$event.value}" can't contain any the following characters: \\ / : * ? " < > |`,
            );
            return;
        }

        const parentNode = $event.node.parent;

        if (parentNode) {
            const found = parentNode.children.find((n) => (n.data as DocumentTreeModel).name === $event.value);
            if (found) {
                this._toastrService.pop(
                    MessageModal.MessageType.warning,
                    'System',
                    `The folder name "${$event.value}" has existed`,
                );
                return;
            }
        }

        const node = $event.node;
        const data = node.data as DocumentTreeModel;

        if (!this._mappingAction.get(data.mode).callbackConfirmOk) return;

        data.name = $event.value;
        this._mappingAction.get(data.mode).callbackConfirmOk(node);
    }

    public cancelActionFolderName($event: { event: Event; node: TreeNode }) {
        const node = $event.node;
        const data = $event.node.data as DocumentTreeModel;

        if (!this._mappingAction.get(data.mode).callbackConfirmCancel) return;

        this._mappingAction.get(data.mode).callbackConfirmCancel(node);
    }

    private confirmToSaveFolder(folder: DocumentTreeModel, callbackOk: () => void, callbackCancel?: () => void): void {
        this._modalService.confirmMessageHtmlContent(
            new MessageModel({
                headerText: 'Confirmation',
                messageType: MessageModal.MessageType.confirm,
                message: [
                    { key: '<p>' },
                    { key: 'Modal_Message__AreYouSureTo' },
                    { key: folder.mode },
                    { key: 'Modal_Message__ThisFolder' },
                    { key: '</p>' },
                ],
                buttonType1: MessageModal.ButtonType.danger,
                callBack1: () => {
                    // button Ok clicked
                    callbackOk();
                },
                callBack2: () => {
                    // button Cancel clicked
                    callbackCancel && callbackCancel();
                },
            }),
        );
    }

    private checkRulesFolderName(name: string): boolean {
        if (!name || !name.length) return false;

        if (name.search(/[\\/:*?"<>|]/g) >= 0) return false;

        return true;
    }

    private _cloneRootFolders(rootFolders: DocumentTreeModel[], reorder: boolean) {
        let _newRoots: DocumentTreeModel[] = [];
        if (!rootFolders || !rootFolders.length) return _newRoots;

        _newRoots = rootFolders.map((root, index) => {
            const clonedFolder = Object.assign({}, root);
            delete clonedFolder.children;
            delete clonedFolder.iconAsync$;

            if (reorder) {
                clonedFolder.order = index + 1;
            }

            return clonedFolder;
        });

        return _newRoots;
    }
}
