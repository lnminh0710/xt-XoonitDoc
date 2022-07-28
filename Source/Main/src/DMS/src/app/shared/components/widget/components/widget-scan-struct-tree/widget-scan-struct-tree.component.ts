import {
    Component,
    OnInit,
    ChangeDetectorRef,
    AfterViewInit,
    OnDestroy,
    ViewChild,
    Input,
    Injector,
    ViewContainerRef,
} from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
    CustomAction,
    LayoutInfoActions,
} from '@app/state-management/store/actions';
import { AdministrationDocumentSelectors, AppGlobalSelectors } from '@app/state-management/store/reducer';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { DocumentHelper } from '@app/utilities';
import { TreeFolderStructModeEnum, DocumentTreeTypeDisplayName } from '@app/app.constants';
import { TreeNode } from '@circlon/angular-tree-component';
import { GetDocumentFilesByFolderAction } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { GetDocumentTreeOptions } from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';
import {
    ClearSelectedFolderAction,
    SelectFolderToImportAction,
} from '@app/pages/import-upload/import-upload.statemanagement/import-upload.actions';
import { takeUntil } from 'rxjs/operators';
import { BaseWidgetStructureTreeComponent } from '@xn-control/xn-document-tree/components/base-widget-structure-tree/base-widget-structure-tree.component';
import { IconNames } from '@app/app-icon-registry.service';
import { ScanningProcess } from '../../../../../pages/private/modules/scanning/services';
import { FolerTreeChange } from '@app/state-management/store/actions/app/app.actions';
import { FieldFilter } from '../../../../../models';

@Component({
    selector: 'widget-scan-struct-tree',
    templateUrl: './widget-scan-struct-tree.component.html',
    styleUrls: ['./widget-scan-struct-tree.component.scss'],
})
export class WidgetScanStructTreeComponent
    extends BaseWidgetStructureTreeComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    resetWidget() {
        throw new Error('Method not implemented.');
    }
    filterDisplayFields(displayFields: FieldFilter[]) {
        throw new Error('Method not implemented.');
    }

    public docTreeList: DocumentTreeModel[] = [];
    public TreeFolderModeEnum = TreeFolderStructModeEnum;
    public isCollapsed = true;
    public IconNamesEnum = IconNames;

    constructor(
        protected router: Router,
        protected injector: Injector,
        private cdRef: ChangeDetectorRef,
        private layoutInfoActions: LayoutInfoActions,
        private administrationDocumentActions: AdministrationDocumentActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private appGlobalSelectors: AppGlobalSelectors,
        private scanningProcess: ScanningProcess,
        private store: Store<AppState>,
        protected containerRef: ViewContainerRef,
    ) {
        super(router, injector, containerRef);

        this.administrationDocumentSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_DOCUMENT_TREE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const tree = action.payload as any[];
                this.docTreeList = DocumentHelper.mapToDocumentNode(tree, DocumentTreeTypeDisplayName.TREE_FOLDER);
                this._listenStructureTreeSettingsChanged();
                this.cdRef.detectChanges();
            });
    }

    ngOnInit(): void {
        this.scanningProcess.TabIDScanningStructTree = this.tabID;
        this.store.dispatch(
            this.administrationDocumentActions.getDocumentTree({
                shouldGetDocumentQuantity: true,
                idPerson: '',
            } as GetDocumentTreeOptions),
        );
    }

    ngOnDestroy(): void {
        this.store.dispatch(new ClearSelectedFolderAction());
        super.onDestroy();
    }

    public onClickOnNode($event: { event: Event; node: TreeNode }) {
        // const folder = $event.node.data as DocumentTreeModel;
        // this.store.dispatch(new GetDocumentFilesByFolderAction(folder));
        // this.xnDocumentTree.selectDocumentFolder($event.node.data as DocumentTreeModel);
    }
    public onDblClickOnNode($event: { event: Event; node: TreeNode }) {
        const folder = $event.node.data as DocumentTreeModel;
        this.store.dispatch(new GetDocumentFilesByFolderAction(folder));

        this.xnDocumentTree.selectDocumentFolder($event.node.data as DocumentTreeModel);
        folder.path = this.xnDocumentTree.getPathSelectedFolder();
        this.store.dispatch(
            new SelectFolderToImportAction({
                folder,
            }),
        );
        this.store.dispatch(new FolerTreeChange({ folder }));
        this.cdRef.detectChanges();
    }
    public toggleFolderTree() {
        if (!this.xnDocumentTree) return;

        if (this.isCollapsed) {
            this.xnDocumentTree.expandAllFolders();
        } else {
            this.xnDocumentTree.collapseAllFolders();
        }

        this.isCollapsed = !this.isCollapsed;
    }

    private _listenStructureTreeSettingsChanged() {
        this.listenStructureTreeSettingsChanges()
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((structureTreeSettings) => {
                if (structureTreeSettings.isCollapsedTree) {
                    this.store.dispatch(
                        this.layoutInfoActions.setSplitAreasSize(
                            this.tabID,
                            { hideSplitter: true, sizes: [4.8, 95.2] },
                            this.ofModule,
                        ),
                    );
                } else {
                    this.store.dispatch(
                        this.layoutInfoActions.setSplitAreasSize(
                            this.tabID,
                            { hideSplitter: false, sizes: null },
                            this.ofModule,
                        ),
                    );
                }
            });
    }
}
