import {
    Component,
    OnInit,
    ChangeDetectorRef,
    AfterViewInit,
    OnDestroy,
    ViewChild,
    ChangeDetectionStrategy,
} from '@angular/core';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { GlobalSearchService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
    CustomAction,
    ModuleActions,
} from '@app/state-management/store/actions';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentHelper } from '@app/utilities';
import { TreeFolderStructModeEnum, DocumentTreeTypeDisplayName, MenuModuleId } from '@app/app.constants';
import { TreeNode, TreeModel } from '@circlon/angular-tree-component';
import { GetDocumentFilesByFolderAction } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { XnDocumentTreeComponent } from '@app/shared/components/xn-control';
import { GetDocumentTreeOptions } from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';
import { filter, takeUntil } from 'rxjs/operators';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';

import { Module, SearchResultItemModel } from '@app/models';
import { IconNames } from '@app/app-icon-registry.service';
import { SaveStructureTreeSettingsGlobalAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import { StructureTreeConfig } from '@xn-control/xn-document-tree/models/structure-tree-config.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'widget-email-folder-tree_REMOVED',
    templateUrl: './widget-email-folder-tree_REMOVED.component.html',
    styleUrls: ['./widget-email-folder-tree_REMOVED.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetEmailFolderTreeComponent_REMOVED extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    private idTreeRoot: number;
    private _idDocumentTreeNotLoad: number;

    public docTreeList: DocumentTreeModel[] = [];
    public TreeFolderModeEnum = TreeFolderStructModeEnum;
    public modeTree: TreeFolderStructModeEnum = TreeFolderStructModeEnum.VIEW_FOLDER;
    public iconChevronDownCircle = IconNames.APP_CHEVRON_DOWN_CIRCLE;
    public isCollapsed = true;
    public structureTreeConfig = new StructureTreeConfig({
        afterInitTree: this._afterInitTree.bind(this),
    });
    public hiddenTree = true;
    public isReload = false;

    private _selectedSearchResultState$: Observable<SearchResultItemModel>;

    @ViewChild('xnDocumentTree', { read: XnDocumentTreeComponent }) xnDocumentTree: XnDocumentTreeComponent;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private administrationDocumentActions: AdministrationDocumentActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
        private globalSearchService: GlobalSearchService,
    ) {
        super(router);
        this._selectedSearchResultState$ = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this._registerSubscriptions();
    }

    ngOnInit(): void {
        this.getDocumentTree();
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngAfterViewInit(): void {}

    public getDocumentTree() {
        this.store.dispatch(
            this.administrationDocumentActions.getDocumentTree({
                shouldGetDocumentQuantity: true,
                idPerson: '',
                IsSearchForEmail: '1',
            } as GetDocumentTreeOptions),
        );

        this.store.dispatch(
            new SaveStructureTreeSettingsGlobalAction({
                nodesState: [],
                isCollapsedTree: false,
                activeFoldersOnly: false,
            }),
        );
    }
    public reload() {
        this.getDocumentTree();
        this.isReload = true;
    }

    private _afterInitTree(treeModel: TreeModel) {
        this.filterDocTree(treeModel);
        this.hiddenTree = false;

        if (this._idDocumentTreeNotLoad) {
            this._setHighlightDocumentTreeFolder(this._idDocumentTreeNotLoad);
        }

        this.cdRef.detectChanges();
    }

    private _registerSubscriptions() {
        this.administrationDocumentSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_DOCUMENT_TREE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const tree = action.payload as any[];
                this.docTreeList = DocumentHelper.mapToDocumentNode(tree, DocumentTreeTypeDisplayName.TREE_FOLDER);

                this.isCollapsed = false;
                this.cdRef.detectChanges();

                if (this.isReload) {
                    this._afterInitTree(this.xnDocumentTree.treeComponent.treeModel);
                    this.isReload = true;
                }
            });

        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.SET_HIGHLIGHT_AND_SAVE_DOCUMENT_INTO_FOLDER)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const idDocumentTree = action.payload as number;
                if (!idDocumentTree) return;

                if (!this.xnDocumentTree) {
                    this._idDocumentTreeNotLoad = idDocumentTree;
                    return;
                }

                this._setHighlightDocumentTreeFolder(idDocumentTree);
            });

        this._selectedSearchResultState$
            .pipe(
                filter((selectedSearchResultState) => !!selectedSearchResultState),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((selectedSearchResultState: SearchResultItemModel) => {
                const data = selectedSearchResultState as any;
                if (this.idTreeRoot === data.idTreeRoot) return;
                this.idTreeRoot = data.idTreeRoot;
                this.filterDocTree(this.xnDocumentTree?.treeComponent?.treeModel);
            });
    }
    private filterDocTree(treeModel: TreeModel) {
        if (!treeModel) return;

        treeModel.virtualRoot.children.forEach((node: TreeNode) => {
            if ((node.data as DocumentTreeModel).idDocument === this.idTreeRoot) {
                node.show();
                node.expandAll();
                return;
            }

            node.hide();
        });
    }
    public onClickOnNode($event: { event: Event; node: TreeNode }) {
        if (this.modeTree === TreeFolderStructModeEnum.SELECTABLE_FOLDER) return;
    }

    public onDblClickOnNode($event: { event: Event; node: TreeNode }) {
        const folder = $event.node.data as DocumentTreeModel;

        this._filterGlobalSearch(folder);
        let path: string;
        let parent = $event.node.parent;

        const pathFolder = [];
        pathFolder.push(folder.name);
        while (parent && !parent.data.virtual) {
            path = (parent.data as DocumentTreeModel).name;
            pathFolder.splice(0, 0, path);
            parent = parent.parent;
        }
        folder.path = pathFolder.join('\\');

        this.store.dispatch(new GetDocumentFilesByFolderAction(folder));
        this.xnDocumentTree.selectDocumentFolder($event.node.data as DocumentTreeModel);
        this.cdRef.detectChanges();

        // if currently, has selected a node, but want to select other node to search on global search
        if (this.xnDocumentTree.selectedNode && $event.node !== this.xnDocumentTree.selectedNode) {
            this.xnDocumentTree.selectOtherNodeButKeepSelectedNode($event.node);
        }
        this.xnDocumentTree.clearTemporarySelectingNode();
    }

    public toggleFolderTree($event) {
        if (!this.xnDocumentTree) return;

        if (this.isCollapsed) {
            this.xnDocumentTree.expandAllFolders();
        } else {
            this.xnDocumentTree.collapseAllFolders();
        }

        this.isCollapsed = !this.isCollapsed;
    }

    private _setHighlightDocumentTreeFolder(idDocumentTree: number) {
        const selectedFolder = this.xnDocumentTree.selectDocumentFolder(idDocumentTree);
        if (!selectedFolder) return;

        this.modeTree = TreeFolderStructModeEnum.SELECTABLE_FOLDER;

        selectedFolder.path = this.xnDocumentTree.getPathSelectedFolder();
        this.store.dispatch(this.administrationDocumentActions.saveDocumentIntoFolder(selectedFolder));
        this.xnDocumentTree.clearTemporarySelectingNode();
        this.cdRef.detectChanges();
    }

    private _filterGlobalSearch(folder: DocumentTreeModel) {
        let module: Module = ModuleList.EmailDetailGlobalSearch;
        module.isCanSearch = true;
        module.filter = {
            fieldsName: ['idDocumentTree'],
            fieldsValue: [folder.idDocument.toString()],
        };
        module['titleSecondary'] = folder.name;

        this.store.dispatch(this.moduleActions.searchKeywordModule(module));
    }
}
