import {
    Component,
    OnInit,
    ViewContainerRef,
    ChangeDetectorRef,
    AfterViewInit,
    OnDestroy,
    ViewChild,
    Optional,
    Host,
    SkipSelf,
    ChangeDetectionStrategy,
} from '@angular/core';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { ModalService, GlobalSearchService, SearchService } from '@app/services';
import { ToasterService } from 'angular2-toaster';
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
import { IDocumentManagementState } from '@app/pages/document-management/document-management.statemanagement/document-management.state';
import { DocumentHelper, Uti } from '@app/utilities';
import {
    TreeFolderStructModeEnum,
    DocumentTreeTypeDisplayName,
    DocumentMyDMType,
    MenuModuleId,
    MessageModal,
    LocalStorageKey,
} from '@app/app.constants';
import { TreeNode, TreeModel } from '@circlon/angular-tree-component';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import {
    GetDocumentFilesByFolderAction,
    DocumentManagementActionNames,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { XnDocumentTreeComponent } from '@app/shared/components/xn-control';
import { GetDocumentTreeOptions } from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';
import { filter, takeUntil } from 'rxjs/operators';
import {
    OpenContractFormAction,
    OpenInvoiceFormAction,
    OpenOtherDocumentsFormAction,
} from '../widget-mydm-form/actions/widget-mydm-form.actions';
import { DocumentManagementHandlerService } from '@app/pages/document-management/services/document-management-handler.service';

import {
    Module,
    MessageModalModel,
    ButtonList,
    MessageModalFooterModel,
    MessageModalBodyModel,
    MessageModalHeaderModel,
} from '@app/models';
import { GlobalSearchFilterModel } from '@app/models/global-search-filter.model';
import { IconNames } from '@app/app-icon-registry.service';
import { TranslateService } from '@ngx-translate/core';
import { SearchType } from '@xn-control/xn-ag-grid/shared/ag-grid-constant';
import { SaveStructureTreeSettingsGlobalAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import { StructureTreeConfig } from '@xn-control/xn-document-tree/models/structure-tree-config.model';

@Component({
    selector: 'widget-mydm-folder-tree',
    templateUrl: './widget-mydm-folder-tree.component.html',
    styleUrls: ['./widget-mydm-folder-tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetMyDmFolderTreeComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    private idTreeRoot: number;
    private _idDocumentTreeNotLoad: number;

    public docTreeList: DocumentTreeModel[] = [];
    public TreeFolderModeEnum = TreeFolderStructModeEnum;
    public IconNamesEnum = IconNames;
    public modeTree: TreeFolderStructModeEnum = TreeFolderStructModeEnum.VIEW_FOLDER;
    public iconChevronDownCicle = IconNames.APP_CHEVRON_DOWN_CIRCLE;
    public isCollapsed = true;
    public structureTreeConfig = new StructureTreeConfig({
        afterInitTree: this._afterInitTree.bind(this),
    });
    public hiddenTree = true;
    public idDocumentContainerScans: string;
    public folderChange = null;
    public isReload = false;

    @ViewChild('xnDocumentTree', { read: XnDocumentTreeComponent }) xnDocumentTree: XnDocumentTreeComponent;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private modalService: ModalService,
        private toastrService: ToasterService,
        private viewContainerRef: ViewContainerRef,
        private appStore: Store<AppState>,
        private administrationDocumentActions: AdministrationDocumentActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private documentSelectors: DocumentManagementSelectors,
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
        private translateService: TranslateService,
        private globalServ: GlobalSearchService,
        private toasterService: ToasterService,
        @SkipSelf() private documentManagementHandlerService: DocumentManagementHandlerService,
    ) {
        super(router);
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
                setTimeout(() => {
                    this.documentManagementHandlerService.didMydmFolderTreeComponentCreate(true);
                }, 300);
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

        this.documentSelectors.dataGlobalSearch$.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((data) => {
            if (this.idTreeRoot === data.idTreeRoot) {
                return;
            }

            this.idTreeRoot = data.idTreeRoot;
            this.filterDocTree(this.xnDocumentTree?.treeComponent?.treeModel);
        });
        this.administrationDocumentSelectors.detailedDocumentDataState$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((detailedDocumentDataState) => {
                if (!detailedDocumentDataState?.length) {
                    this.idDocumentContainerScans = '';
                    return;
                }

                this.idDocumentContainerScans = detailedDocumentDataState.find(
                    (x) => x['originalColumnName'] === 'IdDocumentContainerScans',
                )?.['value'];
            });

        this.administrationDocumentSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.CHANGE_DOCUMENT_TO_OTHER_TREE)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((_) => {
                this.xnDocumentTree.selectDocumentFolder(this.folderChange);
                this.cdRef.detectChanges();
                this.toasterService.pop(MessageModal.MessageType.success, 'System', `Change document successfully`);
                this.store.dispatch(
                    this.administrationDocumentActions.changeDocumentToOtherTreeSuccessAction(this.folderChange),
                );
                setTimeout(() => {
                    this.store.dispatch(this.moduleActions.refreshGlobalSearch());
                }, 1000);
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
        const folder = $event.node.data as DocumentTreeModel;
        if (!folder?.quantity) return;

        let nodeData = $event.node;

        let parentFolderName = '';
        if ((nodeData.data as DocumentTreeModel).idDocumentParent) {
            do {
                parentFolderName += `> ${(nodeData.parent.data as DocumentTreeModel).name} `;
                nodeData = nodeData.parent;
            } while (nodeData.data.idDocumentParent);
            parentFolderName = parentFolderName.substring(1).trim();
        }

        // if (this.modeTree === TreeFolderStructModeEnum.VIEW_FOLDER) {
        this._filterGlobalSearch(folder, parentFolderName);

        // if currently, has selected a node, but want to select other node to search on global search
        if (this.xnDocumentTree.selectedNode && $event.node !== this.xnDocumentTree.selectedNode) {
            this.xnDocumentTree.selectOtherNodeButKeepSelectedNode($event.node);
        }

        // TamTV - comment code, implement func: 1 click to show gs result
        // if (this.modeTree === TreeFolderStructModeEnum.SELECTABLE_FOLDER) return;

        // const folder = $event.node.data as DocumentTreeModel;
        // let path: string;
        // let parent = $event.node.parent;

        // const pathFolder = [];
        // pathFolder.push(folder.name);
        // while (parent && !parent.data.virtual) {
        //     path = (parent.data as DocumentTreeModel).name;
        //     pathFolder.splice(0, 0, path);
        //     parent = parent.parent;
        // }
        // folder.path = pathFolder.join('\\');

        // this.store.dispatch(new GetDocumentFilesByFolderAction(folder));
        // // this.dispatchToOpenFormBasedOnDocument(folder);
        // this.xnDocumentTree.selectDocumentFolder($event.node.data as DocumentTreeModel);
        // this.cdRef.detectChanges();
    }

    public onDblClickOnNode($event: { event: Event; node: TreeNode }) {
        this.folderChange = null;
        const folder = $event.node.data as DocumentTreeModel;
        let nodeData = $event.node;

        let parentFolderName = '';
        if ((nodeData.data as DocumentTreeModel).idDocumentParent) {
            do {
                parentFolderName += `> ${(nodeData.parent.data as DocumentTreeModel).name} `;
                nodeData = nodeData.parent;
            } while (nodeData.data.idDocumentParent);
            parentFolderName = parentFolderName.substring(1).trim();
        }

        let messages: string;

        this.translateService
            .get('WIDGET_MYDM_FOLDER_TREE__Notice_Change_Doc_Type')
            .subscribe((val) => (messages = val));

        const modal = new MessageModalModel({
            // type: MessageModal.MessageType.success,
            messageType: MessageModal.MessageType.warning,
            modalSize: MessageModal.ModalSize.small,
            showCloseButton: true,
            header: new MessageModalHeaderModel({
                text: 'Change document type',
                styleClass: 'header-center',
            }),
            body: new MessageModalBodyModel({
                content: 'Do you want to change document type?',
            }),
            footer: new MessageModalFooterModel({
                buttonList: [
                    new ButtonList({
                        buttonType: MessageModal.ButtonType.primary,
                        text: 'No',
                        customClass: 'btn-sm w-100',
                        callBackFunc: () => {
                            this.modalService.hideModal();
                        },
                    }),
                    new ButtonList({
                        buttonType: MessageModal.ButtonType.primary,
                        text: 'Yes',
                        customClass: 'btn-sm w-100',
                        callBackFunc: () => {
                            const path = this.xnDocumentTree.getPathFolder($event.node);
                            folder.path = this.xnDocumentTree.parsePath(path);
                            this.folderChange = folder;
                            this.folderChange.orginalPath = path;
                            this.folderChange.parentFolderName = parentFolderName;
                            const objSubmit = {
                                IdDocumentTree: folder.idDocument,
                                IdDocumentContainerScans: this.idDocumentContainerScans,
                            };
                            this.store.dispatch(
                                this.administrationDocumentActions.changeDocumentToOtherTreeAction(objSubmit),
                            );

                            this.modalService.hideModal();
                        },
                    }),
                ],
            }),
        });
        this.modalService.createModal(modal);
        this.modalService.showModal();
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

    private dispatchToOpenFormBasedOnDocument(document: DocumentTreeModel) {
        switch (document.idDocumentType) {
            case DocumentMyDMType.Contract:
                // this.store.dispatch(new OpenContractFormAction({
                //     folder: this.xnDocumentTree.selectedNode.data as DocumentTreeModel,
                //     documentContainerOcr: null,
                // }));
                break;

            case DocumentMyDMType.Invoice:
                // this.store.dispatch(new OpenInvoiceFormAction({
                //     folder: this.xnDocumentTree.selectedNode.data as DocumentTreeModel,
                //     documentContainerOcr: null,
                // }));
                break;

            case DocumentMyDMType.OtherDocuments:
                // this.store.dispatch(new OpenOtherDocumentsFormAction({
                //     folder: this.xnDocumentTree.selectedNode.data as DocumentTreeModel,
                //     documentContainerOcr: null,
                // }));
                break;

            default:
                return;
        }
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

    private _filterGlobalSearch(folder: DocumentTreeModel, parentName: string) {
        const filterName = parentName ? 'idDocumentTree' : 'idTreeRoot'; // if has parentName is child, if not is root
        let module = new Module();
        module.idSettingsGUI = MenuModuleId.allDocuments;
        module.isCanSearch = true;
        module.searchIndexKey = 'maindocument';
        module.moduleName = parentName;
        module['titleSecondary'] = folder.name;
        module.filter = {
            fieldsName: [filterName],
            fieldsValue: [folder.idDocument.toString()],
        };
        module['forceMainDocument'] = true;

        this.store.dispatch(this.moduleActions.searchKeywordModule(module));
        const browserTabId = Uti.defineBrowserTabId();
        localStorage.setItem(
            LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSCaptureSearchModule, browserTabId),
            JSON.stringify({ ...module, browserTabId, timestamp: new Date().getTime() }),
        );
    }

    private showNoticeUnderImplementation() {
        let okTextBtn: string;
        let messages: string;

        this.translateService.get('COMMON_LABEL__Ok').subscribe((val) => (okTextBtn = val));
        this.translateService
            .get('WIDGET_MYDM_FOLDER_TREE__Notice_Under_Implementation')
            .subscribe((val) => (messages = val));

        const modal = new MessageModalModel({
            // type: MessageModal.MessageType.success,
            messageType: MessageModal.MessageType.notice,
            modalSize: MessageModal.ModalSize.small,
            showCloseButton: false,
            header: new MessageModalHeaderModel({
                iconClass: 'fa-info-circle',
                text: 'Notice',
                styleClass: 'header-center',
            }),
            body: new MessageModalBodyModel({
                isHtmlContent: true,
                content: `<p class="font-size-16px ">${messages}</p>`,
            }),
            footer: new MessageModalFooterModel({
                buttonList: [
                    new ButtonList({
                        buttonType: MessageModal.ButtonType.primary,
                        text: okTextBtn,
                        customClass: 'btn-sm w-100',
                        callBackFunc: () => {
                            this.modalService.hideModal();
                        },
                    }),
                ],
            }),
        });
        this.modalService.createModal(modal);
        this.modalService.showModal();
    }
}
