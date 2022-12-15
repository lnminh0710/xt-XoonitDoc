import { BaseComponent } from '@app/pages/private/base';
import {
    OnInit,
    Component,
    OnDestroy,
    ViewChild,
    EventEmitter,
    Output,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    Input,
    ElementRef,
    TemplateRef,
    ViewContainerRef,
    ContentChild,
    ChangeDetectorRef,
    NgZone,
    Renderer2,
} from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '@app/state-management/store';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AdministrationDocumentSelectors, AppGlobalSelectors } from '@app/state-management/store/reducer';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
} from '@app/state-management/store/actions/administration-document';
import { UserService, ModalService, BaseService } from '@app/services';
import {
    DocumentTreeModel,
    DocumentTreeModeEnum,
} from '@app/models/administration-document/document-tree.payload.model';
import { ITreeOptions, TreeNode, TreeComponent, TreeModel } from '@circlon/angular-tree-component';
import { CustomAction, NotificationPopupActions } from '@app/state-management/store/actions';
import { MessageModel, GlobalSettingModel } from '@app/models';
import { MessageModal, TreeFolderStructModeEnum, Configuration, ServiceUrl } from '@app/app.constants';
import { ToasterService } from 'angular2-toaster';
import {
    Overlay,
    OverlayRef,
    PositionStrategy,
    GlobalPositionStrategy,
    FlexibleConnectedPositionStrategy,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subscription, Observable, fromEvent, Subscriber, of, Subject, BehaviorSubject } from 'rxjs';
import PerfectScrollbar from 'perfect-scrollbar';
import { isNumber } from 'lodash-es';
import { MatInput } from '../light-material-ui/input';
import { takeUntil, filter, take } from 'rxjs/operators';
import { MatDialog } from '@xn-control/light-material-ui/dialog';
import { XnDocumentTreeNodeDialogComponent } from '@xn-control/xn-document-tree-node-dialog/xn-document-tree-node-dialog.component';
import { DocumentTreeNodeDialogModel } from '@xn-control/xn-document-tree-node-dialog/models/document-tree-node-dialog.model';
import { NodeDialogDataModel } from '@xn-control/xn-document-tree-node-dialog/models/node-dialog-data.model';
import {
    StructureTreeSettingsStateModel,
    TreeNodeState,
} from '@app/state-management/store/models/app-global/state/structure-tree-settings.state.model';
import { XnDocumentTreeService } from './services/xn-document-tree.service';
import { isNullOrUndefined } from 'util';
import { TreeConstants } from './services/tree-constants.const';
import { StructureTreeConfig } from './models/structure-tree-config.model';

@Component({
    selector: 'xn-document-tree',
    templateUrl: './xn-document-tree.component.html',
    styleUrls: ['./xn-document-tree.component.scss'],
})
export class XnDocumentTreeComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    //#region Input() properties
    @Input() shouldGetDocumentQuantity: boolean;

    private _modeTree: TreeFolderStructModeEnum = TreeFolderStructModeEnum.VIEW_FOLDER;
    @Input() set modeTree(data: TreeFolderStructModeEnum) {
        this.switchModeTree(data);
    }
    get modeTree(): TreeFolderStructModeEnum {
        return this._modeTree;
    }

    @Input() config = new StructureTreeConfig({
        afterInitTree: (treeModel: TreeModel) => {},
    });

    private _dataTree: DocumentTreeModel[];
    @Input() get dataTree(): DocumentTreeModel[] {
        return this._dataTree;
    }
    set dataTree(data: DocumentTreeModel[]) {
        this.nodes = data as any[];

        if (data && data.length) {
            data.forEach((folder) => {
                folder.icon =
                    folder.isReadOnly || folder.isIndexingTree ? folder.icon : TreeConstants.DEFAULT_ROOT_FOLDER_ICON;
            });
        }

        if (this.treeComponent) {
            this.treeComponent.treeModel.update();
        }

        this._dataTree = data;
    }
    //#endregion

    //#region Output() properties
    @Output() selectedPathFolder = new EventEmitter<string[]>();
    @Output() onDblClickOnNode = new EventEmitter<{ event: Event; node: TreeNode }>();
    @Output() onClickOnNode = new EventEmitter<{ event: Event; node: TreeNode }>();
    @Output() okActionFolder = new EventEmitter<{ event: Event; node: TreeNode; value: string }>();
    @Output() cancelActionFolder = new EventEmitter<{ event: Event; node: TreeNode }>();

    @Output() onRightClickOnTree = new EventEmitter<{ event: Event; treeComponent: TreeComponent }>();
    @Output() onRightClickOnNode = new EventEmitter<{ event: Event; node: TreeNode; treeComponent: TreeComponent }>();

    @Output() onDropOnNode = new EventEmitter<{ event: Event; node: TreeNode; treeComponent: TreeComponent }>();
    @Output() expandCollapse = new EventEmitter<{ node: TreeNode }>();

    //#endregion

    @ViewChild('treeComponent') treeComponent: TreeComponent;
    @ViewChild('nodeMenu') nodeMenu: TemplateRef<any>;
    @ViewChild('treeMenu') treeMenu: TemplateRef<any>;
    @ViewChild('overlayNodeChildren', { read: TemplateRef }) overlayNodeChildrenTemplate: TemplateRef<any>;
    @ViewChild(MatInput) matInput: MatInput;

    @ContentChild('rightClickMenuOnNode') templateRefContextMenuOnNode: TemplateRef<any>;
    @ContentChild('rightClickMenuOnTree') templateRefContextMenuOnTree: TemplateRef<any>;

    private closeContextMenuSubscription: Subscription | null;
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
    private _treeViewport: HTMLElement;
    private _initializedTreeSubject = new Subject<boolean>();
    private preventSingleClick: boolean;
    private timerEmitSingleClick: any;
    private _ps: PerfectScrollbar;
    private _disposeOverlayChildrenNode = new Subject<boolean>();
    private _curNodesState: TreeNodeState[] = [];

    public _pathFolder: string[] = [];

    public ModeTreeEnumeration = TreeFolderStructModeEnum;
    public DocumentTreeModeEnumeration = DocumentTreeModeEnum;
    public nodes: TreeNode[];
    public options: ITreeOptions;
    public selectedNode: TreeNode;
    public temporarySelectingNode: TreeNode;
    public rootSelectedNode: TreeNode;
    public overlayRef: OverlayRef | null;
    public structureTreeSettings: StructureTreeSettingsStateModel;
    public changeSizeOverlayRefFitAngularTree = new BehaviorSubject<{ width?: number; height?: number }>({});

    public get initializedTree$() {
        return this._initializedTreeSubject.asObservable();
    }

    public readonly overlayChildrenNodePanelClass = 'overlay-node-children';

    constructor(
        protected router: Router,
        private ngZone: NgZone,
        private renderer2: Renderer2,
        private toastrService: ToasterService,
        public xnDocumentTreeService: XnDocumentTreeService,
        private overlay: Overlay,
        private viewContainerRef: ViewContainerRef,
        private store: Store<AppState>,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private matDialog: MatDialog,
        private cdRef: ChangeDetectorRef,
        private notificationPopupAction: NotificationPopupActions,
    ) {
        super(router);
        this.setTreeOptions();
    }

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        // (ps as any).initialize(this._treeViewport);
        this._listenDocumentClick();
    }

    ngOnChanges(changes: SimpleChanges): void {}

    ngOnDestroy(): void {
        super.onDestroy();
        this._disposeOverlayChildrenNode.complete();
        this.changeSizeOverlayRefFitAngularTree.complete();
    }

    public updateTree() {
        this.treeComponent.treeModel.update();
    }

    public initialized($event: { eventName: string; treeModel: TreeModel }) {
        this._setScrollbarAndTreeViewport('tree-viewport');

        this.xnDocumentTreeService.structureSettingsChanged$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((settings) => {
                this.structureTreeSettings = settings;
                this._initializedTreeSubject.next(true);
            });

        // react from event tree initialized done
        this.initializedTree$
            .pipe(
                filter((initializedTree) => initializedTree),
                take(1),
            )
            .subscribe(() => {
                this._listenXnDocumentTreeHeaderEvent();
                this._applySettingsFirstLoad();
            });

        this.config && this.config.afterInitTree($event.treeModel);
    }

    private _listenXnDocumentTreeHeaderEvent() {
        // subscribe event collapsing/expanding all folders on the tree of xn-document-tree-header
        this.xnDocumentTreeService.getToggleCollapseFolderTree$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((toggleCollapseFolder) => {
                // is Collapsing the tree, we don't let user expand/collapse all folders
                if (this.structureTreeSettings.isCollapsedTree) return;

                // when we collapse a folder has expanded. so the tree will collapse the current rootSelectedNode
                // to avoid that we need to set this rootSelectedNode to null
                this.rootSelectedNode = null;

                if (!toggleCollapseFolder) {
                    this.expandAllFolders();
                } else {
                    this.collapseAllFolders();
                }
            });
    }

    private _applySettingsFirstLoad() {
        let nodeStates = this.structureTreeSettings.nodesState;
        // this is for new user when there is no node state setting on the tree
        if (!nodeStates || !nodeStates.length) {
            nodeStates = this.xnDocumentTreeService.initialRootNodesState(this._dataTree);
            this.structureTreeSettings.nodesState = nodeStates;
            return;
        }

        // apply nodes state setting to set visible/hidden of nodes
        // ! just run one times when the tree is initialized
        this._applyNodeStateSettings(this.structureTreeSettings);

        // sorting by user setting on the tree
        this._dataTree = this.treeComponent.treeModel.nodes?.sort((a: TreeNodeState, b: TreeNodeState) => {
            return a.order - b.order;
        });
        this.updateTree();
    }

    private _applyNodeStateSettings(structureTreeSettings: StructureTreeSettingsStateModel) {
        // check previousNodesState here to avoid apply again value visible to a node again
        // there one place set this._curNodesState when toggle visible/invisible a node
        if (this._curNodesState === structureTreeSettings.nodesState) {
            return;
        }

        /**
         * when structureTreeSettings.nodesState reference changes
         * !xn-document-tree-header change reference when toggle show active folders only
         * !on first load xn-document-tree
         */
        this._curNodesState = structureTreeSettings.nodesState;

        if (!this._curNodesState || !this._curNodesState.length) return;

        for (let i = 0; i < this._curNodesState.length; i++) {
            const nodeState = this._curNodesState[i];
            const rootNode = this.getNodeBy({ data: { idDocument: nodeState.idDocument } });
            if (rootNode) {
                const rootNodeData = rootNode.data as DocumentTreeModel;
                rootNodeData.visible = nodeState.visible;
                rootNodeData.order = nodeState.order;

                if (structureTreeSettings && structureTreeSettings.activeFoldersOnly && !rootNodeData.visible) {
                    this.hideNode(rootNode);
                }

                this._loopRecursivelySetVisibilityNode(rootNode, nodeState.children);
            }
        }
    }

    public initializedTreeRootOverlay($event: { eventName: string; treeModel: TreeModel }) {
        this._setScrollbarAndTreeViewport(`.${this.overlayChildrenNodePanelClass} tree-viewport`);
        const firstRoot = $event.treeModel.getFirstRoot() as TreeNode;

        // get hiddenNodeIds from instance this.treeComponent.treeModel
        // copy list hidden nodes to new instance treeModel on overlay popup
        const hiddenNodeIds = this.treeComponent.treeModel.hiddenNodeIds;
        $event.treeModel.setHiddenNodeIds(Object.keys(hiddenNodeIds));

        // append all children nodes
        $event.treeModel.setExpandedNode(firstRoot, true);
        const angularTreeComponentElem = document.querySelector(
            `.${this.overlayChildrenNodePanelClass} tree-viewport .angular-tree-component`,
        );
        if (!angularTreeComponentElem) return;

        this.changeSizeOverlayRefFitAngularTree.next({
            width: angularTreeComponentElem.clientWidth,
            height: angularTreeComponentElem.clientHeight,
        });
    }

    public isShowFolderName(node: TreeNode) {
        const data = node.data as DocumentTreeModel;
        return (
            data.idDocument && (data.mode === DocumentTreeModeEnum.VIEW || data.mode === DocumentTreeModeEnum.DELETE)
        );
    }

    public isShowInputFolderName(node: TreeNode) {
        const data = node.data as DocumentTreeModel;
        return !data.idDocument || data.mode === DocumentTreeModeEnum.RENAME;
    }

    public clickOnExpander(node: TreeNode, $event: MouseEvent = null) {
        if ($event) $event.stopPropagation();

        const newRootSelectedNode = this._collapseCurrentRootNodeIfOpenOtherRoot(this.rootSelectedNode, node);
        this.rootSelectedNode = newRootSelectedNode !== null ? newRootSelectedNode : this.rootSelectedNode;

        this.toggleNodeExpanded(node);
    }

    public toggleNodeExpanded(node: TreeNode) {
        if (!node.hasChildren) return;

        // if the tree just show active folder only but node's children are hidden at all
        if (this.structureTreeSettings.activeFoldersOnly && (node.data as DocumentTreeModel).isHiddenAllChildren)
            return;

        node.mouseAction('expanderClick', null);
        this.expandCollapse.emit({ node });
        if (this._ps) this._ps.update();
    }

    public clickOnNode(
        $event: MouseEvent,
        node: TreeNode,
        angularTreeComponentTemplate: {
            loadingTemplate: TemplateRef<any>;
            treeNodeFullTemplate: TemplateRef<any>;
            treeNodeTemplate: TemplateRef<any>;
            treeNodeWrapperTemplate: TemplateRef<any>;
        },
    ) {
        $event.stopPropagation();
        // save currentTarget to set it again into $event in timeout scope
        const currentTarget = $event.currentTarget;

        const newRootSelectedNode = this._collapseCurrentRootNodeIfOpenOtherRoot(this.rootSelectedNode, node);
        this.rootSelectedNode = newRootSelectedNode !== null ? newRootSelectedNode : this.rootSelectedNode;

        this.preventSingleClick = false;
        this.timerEmitSingleClick = setTimeout(() => {
            if (this.preventSingleClick) return;

            // if tree is NOT collaped. We do allow open children nodes
            if (!this.structureTreeSettings.isCollapsedTree) {
                this.closeContextMenu();
                this.toggleNodeExpanded(node);
            } else {
                // case is Collapsed. We open it on overlay-sdk
                this.openOverlayChildrenNodes(
                    currentTarget as Element,
                    node,
                    angularTreeComponentTemplate.treeNodeFullTemplate,
                );
            }

            this.onClickOnNode.emit({ event: $event, node: node });
        }, 200);
    }

    // dbl click event on tree node
    public dbClickOnNode($event: Event, node: TreeNode) {
        $event.stopPropagation();

        this.preventSingleClick = true;
        clearTimeout(this.timerEmitSingleClick);
        this.store.dispatch(this.notificationPopupAction.closeTreeNotification());
        this.onDblClickOnNode.emit({ event: $event, node: node });
    }

    public rightClickOnTree($event: MouseEvent) {
        if (this.isRightClickOnNode) {
            this.isRightClickOnNode = false;
            return;
        }
        //$event.stopPropagation();
        if (this.isViewFolderMode()) return;
        //$event.preventDefault();

        /*
        if (!this.templateRefContextMenuOnTree) return;

        $event.preventDefault();
        this.closeContextMenu();

        const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
            .position()
            .flexibleConnectedTo({
                x: $event.x,
                y: $event.y,
            })
            .withPositions([
                {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                },
                {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'bottom',
                },
            ]);
        this.openContextMenu($event, this.treeMenu, positionStrategy, {
            treeComponent: this.treeComponent,
        });
        */
        this.onRightClickOnTree.emit({ event: $event, treeComponent: this.treeComponent });
    }

    private isRightClickOnNode = false;

    public rightClickOnNode($event: MouseEvent, node: TreeNode) {
        this.isRightClickOnNode = true;
        //$event.stopPropagation();
        if (this.isViewFolderMode()) return;
        //$event.preventDefault();

        //if (!this.templateRefContextMenuOnNode) return;

        //$event.preventDefault();
        //this.closeContextMenu();

        //// const positionStrategy = this.getPositionStrategyOnNode($event);
        //const positionStrategy = this.overlay
        //    .position()
        //    .flexibleConnectedTo({
        //        x: $event.x,
        //        y: $event.y,
        //    })
        //    .withPositions([
        //        {
        //            originX: 'end',
        //            originY: 'bottom',
        //            overlayX: 'start',
        //            overlayY: 'top',
        //        },
        //        {
        //            originX: 'end',
        //            originY: 'bottom',
        //            overlayX: 'start',
        //            overlayY: 'bottom',
        //        },
        //    ]);

        //this.openContextMenu($event, this.nodeMenu, positionStrategy, {
        //    treeNode: node,
        //    treeComponent: this.treeComponent,
        //});
        this.onRightClickOnNode.emit({ event: $event, node: node, treeComponent: this.treeComponent });
    }

    public okActionFolderName($event: Event, node: TreeNode) {
        const element = $event.target as HTMLElement;
        const input = element
            .closest('.node-creation-wrapper')
            .getElementsByClassName('input-folder-name')[0] as HTMLInputElement;
        this.okActionFolder.emit({ event: $event, node: node, value: input.value.trim() });
    }

    public cancelActionFolderName($event: Event, node: TreeNode) {
        this.cancelActionFolder.emit({ event: $event, node: node });
    }

    public getNodeByData(data: any | number): TreeNode {
        if (!data) return null;

        const predicate = { data: { idDocument: -1 } };

        if (data instanceof Object && data.hasOwnProperty('idDocument')) {
            predicate.data.idDocument = data.idDocument;
        } else if (isNumber(data)) {
            predicate.data.idDocument = data as number;
        } else {
            return null;
        }

        return this.getNodeBy(predicate) as TreeNode;
    }
    public selectDocumentFolder(data: any | number, isExpandRoot = false): DocumentTreeModel {
        const found = this.getNodeByData(data);

        if (!found) return null;

        this.toggleHighlightNodePath(this.selectedNode);
        this.selectedNode = Object.assign({}, found);
        this.toggleHighlightNodePath(this.selectedNode);

        const path = found.path;
        if (isExpandRoot && path?.length) {
            this.treeComponent.treeModel.collapseAll();
            setTimeout(() => {
                for (let index = 0; index < path.length; index++) {
                    if (index === path.length - 1) break;
                    const parentNode = this.treeComponent.treeModel.getNodeById(path[index]) as TreeNode;
                    if (parentNode.isExpanded) continue;
                    this.toggleNodeExpanded(parentNode);
                }
            }, 0);
        }
        return this.selectedNode.data as DocumentTreeModel;
    }

    public toggleHighlightNodePath(node: TreeNode) {
        if (!node || !node.data) return;

        let toggleHighlight: boolean;
        let parent = node.parent;
        let parentData = parent.data as DocumentTreeModel;

        const selectedData = node.data as DocumentTreeModel;
        selectedData.highlightPathName = !selectedData.highlightPathName;
        selectedData.highlightPathLine = !selectedData.highlightPathLine;
        toggleHighlight = selectedData.highlightPathName;

        let lastParentId = selectedData.idDocument;

        // let highlightAdjacentParent = true;
        if (!selectedData.hasChildren) {
            // when selected node is a leaf to highlightNodeBefore (to css highlight-path-line) of it's parent
            // highlightAdjacentParent = false;
            parentData.highlightNodeBefore = toggleHighlight;
        } else {
            // but it has children then set highlightNodeBefore to NULL of selected node.
            // because it causes bug UI when expand its children if css highlight-path-line when highlightNodeBefore = true
            selectedData.highlightNodeBefore = toggleHighlight;
        }

        while (parent && !parent.data.virtual) {
            parentData = parent.data;
            parentData.highlightPathName = toggleHighlight;

            if (!parentData?.children?.length) break;
            // loop all children of parentData until meet last parentId
            for (let i = 0; i < parentData.children.length; i++) {
                const child = parentData.children[i];
                child.highlightPathLine = toggleHighlight;

                if (child.idDocument === lastParentId) {
                    // when we loop until the child we left in the last loop.
                    if (!parentData.idDocumentParent || (parentData.idDocumentParent && child.hasChildren)) {
                        // parentData has idDocumentParent NULL (means root folder) -> this parentData is the last loop
                        // OR parentData has idDocumentParent -> in loop n and has children
                        // we disable highlightNodeBefore to not highlight-path-line for that node and its children line
                        child.highlightNodeBefore = null;
                    }
                    break;
                }

                // this child node of parent (in loop n) has children
                if (child.hasChildren) {
                    // toggleHighlight because when it expand children, we will css highlight-path-line for the line from child node to its children height
                    child.highlightNodeBefore = toggleHighlight;
                } else {
                    child.highlightNodeBefore = null;
                }
            }

            // save lastParentId to break loop
            lastParentId = parentData.idDocument;
            parent = parent.parent;
        }
    }

    public getPathFolder(node: TreeNode): string[] {
        if (!node) return [];

        let path: string;
        let parent = node.parent;
        const folder = node.data as DocumentTreeModel;

        const pathFolder = [];
        pathFolder.push(folder.name);
        while (parent && !parent.data.virtual) {
            path = (parent.data as DocumentTreeModel).name;
            pathFolder.splice(0, 0, path);
            parent = parent.parent;
        }
        return pathFolder;
    }

    public getPathSelectedFolder(): string {
        if (!this.selectedNode) return '';

        const path = this.getPathFolder(this.selectedNode);
        return this.parsePath(path);
    }

    public parsePath(path: string[]) {
        return path.join(Configuration.SEPARATOR_PATH);
    }

    public collapseAllFolders() {
        this.treeComponent?.treeModel?.collapseAll();
    }

    public expandAllFolders() {
        this.treeComponent?.treeModel?.expandAll();
    }

    public collapseTree() {
        if (!this.structureTreeSettings) {
            this.structureTreeSettings = this.xnDocumentTreeService.structureTreeSettings;
        }
        this.structureTreeSettings.isCollapsedTree = true;
        this.collapseAllFolders();
    }
    public expandTree() {
        if (!this.structureTreeSettings) {
            this.structureTreeSettings = this.xnDocumentTreeService.structureTreeSettings;
        }
        this.structureTreeSettings.isCollapsedTree = false;
    }

    public hideNode(data: DocumentTreeModel | TreeNode, startNode: TreeNode = null): TreeNode {
        if (data instanceof TreeNode) {
            data.hide();
            return data;
        }

        const found = this.getNodeBy({ data: data }, startNode) as TreeNode;
        if (!found) return;

        found.hide();
        return found;
    }

    public showNode(data: DocumentTreeModel | TreeNode) {
        if (data instanceof TreeNode) {
            data.show();
            return;
        }

        const found = this.getNodeBy({ data: data });
        if (!found) return;

        found.show();
    }

    public toggleCollapseTree(settings: StructureTreeSettingsStateModel) {
        if (!settings.isCollapsedTree) {
            this.expandTree();
        } else {
            this.collapseTree();
        }
    }

    public clearSelectedNode() {
        if (!this.selectedNode) {
            return;
        }

        const node = this.selectedNode;
        let parent = node.parent;
        let toggleHighlight: boolean;
        let selectedData = node.data as DocumentTreeModel;
        selectedData.highlightPathName = !selectedData.highlightPathName;
        toggleHighlight = selectedData.highlightPathName;

        while (parent && !parent.data.virtual) {
            selectedData = parent.data as DocumentTreeModel;
            selectedData.highlightPathName = toggleHighlight;
            parent = parent.parent;
        }
        this.selectedNode = null;
    }

    public focusOnInputNode() {
        setTimeout(() => {
            if (!this.matInput) return;
            this.matInput.focus();
        }, 200);
    }

    public getAllChildrenFolders(folder: DocumentTreeModel): number[] {
        const ids = [folder.idDocument];
        if (!this._hasFolderChildren(folder)) {
            return ids;
        }

        for (let i = 0; i < folder.children.length; i++) {
            const child = folder.children[i];
            if (this._hasFolderChildren(child)) {
                ids.push(...this.getAllChildrenFolders(child));
            } else {
                ids.push(child.idDocument);
            }
        }

        return ids;
    }

    public showXnDocumentTreeNodeDialog(
        node: TreeNode,
        mode: DocumentTreeModeEnum,
    ): Observable<DocumentTreeNodeDialogModel> {
        return Observable.create((observer: Subscriber<DocumentTreeNodeDialogModel>) => {
            this.matDialog
                .open(XnDocumentTreeNodeDialogComponent, {
                    data: <NodeDialogDataModel>{
                        node: node,
                        mode: mode,
                    },
                    width: '379px', // design width 379px
                    // height: `${275}px`, // design height 233px + 2px offset height mat-dialog-title
                    maxWidth: '100%',
                    maxHeight: '75vh',
                    disableClose: true,
                    backdropClass: 'white',
                })
                .beforeClosed()
                .pipe(take(1))
                .subscribe((model: DocumentTreeNodeDialogModel) => {
                    if (!model) return;

                    if (this.validateFolderNameBeforeClosedDialog(node, model.name, mode) === false) {
                        return;
                    }
                    observer.next(model);
                });
        });
    }

    public validateFolderNameBeforeClosedDialog(node: TreeNode, name: string, mode: DocumentTreeModeEnum) {
        if (this.validateRulesFolderName(name) === false) {
            this.toastrService.pop(
                MessageModal.MessageType.warning,
                'System',
                `The folder name "${name}" can't contain any the following characters: \\ / : * ? " < > |`,
            );
            return false;
        }

        let _node = node;

        if (mode === DocumentTreeModeEnum.RENAME) {
            _node = node.parent;
        }

        if (this.checkDuplicatedName(_node, name) === false) {
            this.toastrService.pop(MessageModal.MessageType.warning, 'System', `The folder name "${name}" has existed`);
            return false;
        }

        return true;
    }

    public validateRulesFolderName(name: string): boolean {
        if (!name || !name.length) return false;

        if (name.search(/[\\/:*?"<>|]/g) >= 0) return false;

        return true;
    }

    public checkDuplicatedName(node: TreeNode, name: string) {
        if (node) {
            const found = node.children?.find((n) => (n.data as DocumentTreeModel).name === name);
            if (found) {
                return false;
            }
        }

        return true;
    }

    public showVisibleNodes() {
        if (!this.treeComponent || !this.treeComponent.treeModel || !this.treeComponent.treeModel.nodes) {
            return;
        }

        let rootData: DocumentTreeModel;
        this.treeComponent.treeModel.virtualRoot.children.forEach((rootNode) => {
            rootData = rootNode.data;

            if (!rootData.visible) {
                this.hideNode(rootNode);
            }

            this.iterateNodeChildren(rootNode, (parentNode, childNode) => {
                // if child node invisible then hide it
                if (!(childNode.data as DocumentTreeModel).visible) {
                    this.hideNode(childNode, parentNode);
                } else {
                    // if child node visible but it's parent is invisible then hide it
                    if (!(parentNode.data as DocumentTreeModel).visible) {
                        this.hideNode(childNode, parentNode);
                    }
                }
            });
        });
    }

    public showAllNodes() {
        if (!this.treeComponent || !this.treeComponent.treeModel || !this.treeComponent.treeModel.nodes) {
            return;
        }

        this.treeComponent.treeModel.filterNodes((node) => {
            return true;
        }, false);
    }

    public toggleVisibleNodes(structureTreeSettings: StructureTreeSettingsStateModel) {
        if (structureTreeSettings.activeFoldersOnly) {
            this._applyNodeStateSettings(structureTreeSettings);
            // this.showVisibleNodes();
        } else {
            this.showAllNodes();
        }
    }

    public toggleVisibleItsNodeChildren(node: TreeNode, isVisible: boolean) {
        if (!node) return;

        const nodesState = this._initializeNodesStateSettingFromNode(node, isVisible);
        this._saveVisibileNodesSetting(nodesState);

        return nodesState;
    }

    public getNodeBy(predicate: { data: any }, startNode: DocumentTreeModel | TreeNode = null): TreeNode {
        if (!this.treeComponent) return null;
        return this.treeComponent.treeModel.getNodeBy(predicate, startNode) as TreeNode;
    }

    public getNodeInstance(folder: DocumentTreeModel) {
        const found = this.getNodeBy({ data: folder }) as TreeNode;
        return found;
    }

    private iterateNodeChildren(root: TreeNode, callbackFound?: (parent: TreeNode, child: TreeNode) => void): number[] {
        if (!root) return;
        const ids = [];
        if (!root.hasChildren) {
            return ids;
        }

        for (let i = 0; i < root.children.length; i++) {
            const child = root.children[i];
            callbackFound && callbackFound(root, child);

            ids.push(child.id, ...this.iterateNodeChildren(child, callbackFound));
        }

        return ids;
    }

    public selectOtherNodeButKeepSelectedNode(data: DocumentTreeModel | TreeNode) {
        let node: TreeNode;

        if (data instanceof TreeNode) {
            node = data;
        } else {
            node = this.getNodeInstance(data);
        }

        this.temporarySelectingNode = node;
    }

    public clearTemporarySelectingNode() {
        this.temporarySelectingNode = null;
    }

    private _hasFolderChildren(folder: DocumentTreeModel) {
        if (!folder || !folder.children || !folder.children.length) return false;

        return true;
    }

    private switchModeTree(modeTree: TreeFolderStructModeEnum) {
        if (!this._modeTree || this._modeTree === modeTree) return;

        this._modeTree = modeTree;
    }

    private openContextMenu(
        $event: Event,
        templateRef: TemplateRef<any>,
        positionStrategy: PositionStrategy,
        context?: any,
    ) {
        this.overlayRef = this.overlay.create({
            positionStrategy: positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.close(),
        });

        this.overlayRef.attach(new TemplatePortal(templateRef, this.viewContainerRef, { $implicit: context }));

        this.closeContextMenuSubscription = fromEvent<MouseEvent>(document, 'click')
            .pipe(
                filter((event) => {
                    return !!this.overlayRef && !this.overlayRef.overlayElement.contains(event.target as HTMLElement);
                }),
                take(1),
            )
            .subscribe((_) => this.closeContextMenu());
    }

    public closeContextMenu() {
        this.closeContextMenuSubscription && this.closeContextMenuSubscription.unsubscribe();

        if (this.overlayRef) {
            // this.toggleHightlightNodePath(this.selectedNode);
            // this.selectedNode = null;
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }

    public openOverlayChildrenNodes(target: Element, node: TreeNode, treeNodeFullTemplate: TemplateRef<any>) {
        // close context menu if has any
        this.closeContextMenu();
        // was collapsed and clicked on a node on overlay-cdk to open its children node
        if (this.isDescendantOfRoot(node, this.rootSelectedNode)) {
            this.toggleNodeExpanded(node);
            return;
        } else {
            // is case different root node
            // close others overlay children node
            this._disposeOverlayChildrenNode.next(true);
            this.changeSizeOverlayRefFitAngularTree.next({});
        }

        this.rootSelectedNode = node;

        const data = node.data as DocumentTreeModel;
        if (!data.hasChildren || (!data.children && data.children.length)) return;

        const positionStrategy = this._getPositionStrategyOnTreeCollapsed(target);
        const overlayFromTopClassName = 'overlay-from-top';
        let overlayRef = this.overlay.create({
            positionStrategy: positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.close(),
            hasBackdrop: false,
            panelClass: [this.overlayChildrenNodePanelClass, overlayFromTopClassName],
            minWidth: 316,
            maxHeight: window.screen.height / 2, // contraint maxHeight because when open overlay from bottom -> top. The overlayRef will expand large height to top
        });

        overlayRef.attach(
            new TemplatePortal(this.overlayNodeChildrenTemplate, this.viewContainerRef, {
                $implicit: {
                    nodes: [node.data],
                    templates: treeNodeFullTemplate,
                    treeSettings: this.structureTreeSettings,
                },
            }),
        );

        this._disposeOverlayChildrenNode
            .asObservable()
            .pipe(take(1))
            .subscribe((_) => {
                overlayRef.dispose();
                overlayRef = null;
            });

        this.changeSizeOverlayRefFitAngularTree
            .asObservable()
            .pipe(
                filter((angularTreeSize) => !!angularTreeSize.height),
                takeUntil(this._disposeOverlayChildrenNode.asObservable()),
            )
            .subscribe((angularTreeSize) => {
                if (overlayRef.overlayElement.clientHeight >= angularTreeSize.height) return;

                const _positionStrategy = this._getPositionStrategyOnTreeCollapsed(target, true);

                const cdkOverlayElem = document.querySelector(`.${this.overlayChildrenNodePanelClass}`);
                // because there is no space for open overlay top -> bottom height. we remove overlayFromTopClassName to make overlay render bottom -> top
                this.renderer2.removeClass(cdkOverlayElem, overlayFromTopClassName);

                overlayRef.updatePositionStrategy(_positionStrategy);
                overlayRef.updatePosition();
                this.cdRef.markForCheck();
            });
    }

    public isDescendantOfRoot(node: TreeNode, rootNode: TreeNode) {
        if (!node) return false;
        // in case is null or root tree so this node has data virtual = true
        if (!rootNode || rootNode.data.virtual) return false;

        if (rootNode.data === node.data) {
            if (rootNode === node) {
                // is case select root node on COLLAPSE tree
                return false;
            } else {
                // is case select root node on OVERLAY tree
                return true;
            }
        }

        while (node.parent && !node.parent.data.virtual) {
            // recursive up to root folder (not root tree)
            node = node.parent;
        }

        if (this._isChildOf(rootNode, node)) {
            return true;
        }

        return false;
    }

    public getRootTopNode(node: TreeNode) {
        while (node && node.parent && !node.parent.data.virtual) {
            node = node.parent;
        }

        return node;
    }

    private _listenDocumentClick() {
        fromEvent<MouseEvent>(document, 'click')
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((_) => {
                this._disposeOverlayChildrenNode.next(true);
            });
    }

    private setTreeOptions() {
        this.options = {};
    }

    private isViewFolderMode() {
        return this.modeTree === TreeFolderStructModeEnum.VIEW_FOLDER;
    }

    private _loopRecursivelyToggleVisibleNodeChildren(rootNode: TreeNode, nodesState: TreeNodeState[]) {
        if (!rootNode.hasChildren) {
            return;
        }

        let hiddenNodeNumber = 0;

        for (let i = 0; i < rootNode.children.length; i++) {
            const child = rootNode.children[i];

            nodesState.push({
                idDocument: (child.data as DocumentTreeModel).idDocument,
                visible: (child.data as DocumentTreeModel).visible,
                order: (child.data as DocumentTreeModel).order,
                children: [],
            });

            const hidden = this._hideNodeIfInvisibleOrItsParentIsAlso(rootNode, child);
            if (hidden) {
                hiddenNodeNumber++;
            }
            this._loopRecursivelyToggleVisibleNodeChildren(child, nodesState[nodesState.length - 1].children);
        }

        // if all it's children are hidden then set data for rootNode isHiddenAllChildren = true and vice versa
        // if isHiddenAllChildren = true then hiding node-expander div toggle on root node because there are no children to show
        if (hiddenNodeNumber === rootNode.children.length) {
            (rootNode.data as DocumentTreeModel).isHiddenAllChildren = true;
            rootNode.collapse();
        } else {
            (rootNode.data as DocumentTreeModel).isHiddenAllChildren = false;
        }
    }

    private _loopRecursivelySetVisibilityNode(rootNode: TreeNode, nodesState: TreeNodeState[]) {
        if (!rootNode.hasChildren) {
            return;
        }
        let hiddenNodeNumber = 0;

        for (let i = 0; i < rootNode.children.length; i++) {
            const child = rootNode.children[i];
            const nodeState = nodesState[i];
            if (!nodeState) continue;

            if ((child.data as DocumentTreeModel).idDocument === nodeState.idDocument) {
                (child.data as DocumentTreeModel).visible = nodeState.visible;
            }

            const hidden = this._hideNodeIfInvisibleOrItsParentIsAlso(rootNode, child);
            if (hidden) {
                hiddenNodeNumber++;
            }
            this._loopRecursivelySetVisibilityNode(child, nodeState.children);
        }

        // if all it's children are hidden then set data for rootNode isHiddenAllChildren = true and vice versa
        // if isHiddenAllChildren = true then hiding node-expander div toggle on root node because there are no children to show
        (rootNode.data as DocumentTreeModel).isHiddenAllChildren =
            hiddenNodeNumber === rootNode.children.length ? true : false;
    }

    private _hideNodeIfInvisibleOrItsParentIsAlso(rootNode: TreeNode, child: TreeNode): boolean {
        if (this.xnDocumentTreeService.structureTreeSettings.activeFoldersOnly) {
            // hide this child node when if itself is invisile or it's parent is invisible
            if (
                (child.data as DocumentTreeModel).visible === false ||
                (rootNode.data as DocumentTreeModel).visible === false
            ) {
                this.hideNode(child, rootNode);
                return true;
            }
        }

        return false;
    }

    private _saveVisibileNodesSetting(nodesState: TreeNodeState[]) {
        this.xnDocumentTreeService.structureTreeSettings.nodesState =
            this.xnDocumentTreeService.structureTreeSettings.nodesState || [];
        const structureTreeSettings = this.xnDocumentTreeService.structureTreeSettings;

        for (let i = 0; i < nodesState.length; i++) {
            const nodeState = nodesState[i];
            const foundRootIndex = structureTreeSettings.nodesState.findIndex(
                (n) => n.idDocument === nodeState.idDocument,
            );
            if (foundRootIndex === -1) {
                structureTreeSettings.nodesState.push(nodeState);
                continue;
            }

            structureTreeSettings.nodesState[foundRootIndex] = nodeState;
        }

        // save previousNodesState here to avoid subscriber structureTreeSettings$ to apply again value visible to a node again
        this._curNodesState = structureTreeSettings.nodesState;
        this.xnDocumentTreeService.saveStructureTreeSettings(structureTreeSettings);
    }

    private _initializeNodesStateSettingFromNode(node: TreeNode, isVisible: boolean): TreeNodeState[] {
        const rootTopNode = this.getRootTopNode(node);
        const data = node.data as DocumentTreeModel;

        const rootTopNodeData = rootTopNode.data as DocumentTreeModel;
        rootTopNode.data.visible = isNullOrUndefined(rootTopNodeData.visible) ? true : rootTopNode.data.visible;
        data.visible = isVisible;

        if (this.structureTreeSettings.activeFoldersOnly && !rootTopNodeData.visible) {
            this.hideNode(rootTopNode);
        }

        const nodesState: TreeNodeState[] = [
            {
                idDocument: rootTopNodeData.idDocument,
                visible: rootTopNodeData.visible,
                children: [],
                order: rootTopNodeData.order,
            },
        ];
        this._loopRecursivelyToggleVisibleNodeChildren(rootTopNode, nodesState[0].children);
        return nodesState;
    }

    private _getPositionStrategyOnTreeCollapsed(target: Element, invert: boolean = false): PositionStrategy {
        let offsetTop = 0;

        if (!invert) {
            // plus 24 get to top 24px for fitting arrow left popup that point to center of icon folder
            offsetTop = (target.clientHeight / 2 + 24) * -1;
        } else {
            // offset to top -14px for arrow left popup point to center of icon folder WHEN collapse
            offsetTop = -14;
        }

        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(new ElementRef(target))
            .withPositions([
                {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                },
                {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'bottom',
                },
            ])
            .withDefaultOffsetY(offsetTop)
            .withDefaultOffsetX(12);
        return positionStrategy;
    }

    private _setScrollbarAndTreeViewport(selector: string) {
        this._treeViewport = document.querySelector(selector) as HTMLElement;
        if (!this._treeViewport) return;
        this._treeViewport.style.position = 'relative';
        this._ps = new PerfectScrollbar(this._treeViewport);
    }

    private _isChildOf(parent: TreeNode, child: TreeNode) {
        if ((parent.data as DocumentTreeModel).idDocument === (child.data as DocumentTreeModel).idDocument) {
            return true;
        }

        if ((parent.data as DocumentTreeModel).idDocument === (child.data as DocumentTreeModel).idDocumentParent) {
            return true;
        }

        return false;
    }

    private _collapseCurrentRootNodeIfOpenOtherRoot(currentRootNode: TreeNode, newRootNode: TreeNode) {
        // if the tree is not collapsed AND this is root folder (idDocumentParent = NULL) AND new node has children
        if (
            !this.structureTreeSettings.isCollapsedTree &&
            !(newRootNode.data as DocumentTreeModel).idDocumentParent &&
            newRootNode.hasChildren
        ) {
            // if choose another root folder
            if (currentRootNode !== newRootNode) {
                currentRootNode?.collapse();
            }

            this._collapseOtherRootNodesExcept(newRootNode);
            return newRootNode;
        }

        return null;
    }

    private _collapseOtherRootNodesExcept(rootNode: TreeNode) {
        if (!this.xnDocumentTreeService.isCollapsedFolder && rootNode.isCollapsed) {
            this.treeComponent.treeModel.virtualRoot.children.forEach((node) => {
                if (rootNode !== node) {
                    node.collapse();
                }
            });
        }
    }

    public onDragOver(event: any) {
        var dragSupported = event.dataTransfer.length;
        if (dragSupported) {
            event.dataTransfer.dropEffect = 'move';
        }
        event.preventDefault();
    }

    public onDrop(event: any, node: TreeNode) {
        var jsonData = event.dataTransfer.getData('application/json');
        console.log(`EXTERNAL Zone`);
        console.log(jsonData);

        this.onDropOnNode.emit({ event: jsonData, node: node, treeComponent: this.treeComponent });
        event.preventDefault();
    }
}
