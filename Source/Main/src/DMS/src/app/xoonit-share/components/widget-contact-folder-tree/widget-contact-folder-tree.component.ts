import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IconNames } from '@app/app-icon-registry.service';
import { DocumentTreeTypeDisplayName, LocalStorageKey, MenuModuleId } from '@app/app.constants';
import { Module } from '@app/models';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { ContactDetailMoldel } from '@app/models/contact-document.model';
import { GetDocumentFilesByFolderAction } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { GlobalSearchService } from '@app/services';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    CustomAction,
    GlobalSearchActions,
    ModuleActions,
} from '@app/state-management/store/actions';
import { GetDocumentTreeOptions } from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { DocumentHelper, Uti } from '@app/utilities';
import { TreeNode } from '@circlon/angular-tree-component';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { XnDocumentTreeComponent } from '@xn-control/xn-document-tree';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'widget-contact-folder-tree',
    templateUrl: './widget-contact-folder-tree.component.html',
    styleUrls: ['./widget-contact-folder-tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetContactFolderTreeComponent extends BaseComponent implements OnInit, OnDestroy {
    public static IconNamesEnum = IconNames;
    docTreeList: DocumentTreeModel[] = [];
    @ViewChild('xnDocumentTree') xnDocumentTree: XnDocumentTreeComponent;

    contact: ContactDetailMoldel;
    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private store: Store<AppState>,
        protected action$: Actions,
        private administrationDocumentActions: AdministrationDocumentActions,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private globalServ: GlobalSearchService,
        private moduleActions: ModuleActions,
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

    subscribeAction() {
        this.action$
            .pipe(
                ofType(GlobalSearchActions.ROW_DOUBLE_CLICK),
                filter((action: CustomAction) => this.isValidPayloadContactDetail(action)),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.callActionGetDocTree(action.payload.data as ContactDetailMoldel);
            });
        this.administrationDocumentSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_DOCUMENT_TREE)
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                let tree = action.payload as any[];
                this.docTreeList = DocumentHelper.mapToDocumentNode(
                    tree,
                    DocumentTreeTypeDisplayName.TREE_FOLDER,
                    true,
                );
                this.cdRef.detectChanges();
            });
    }

    public onClickOnNode($event: { event: Event; node: TreeNode }) {
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
        // this.xnDocumentTree.selectDocumentFolder($event.node.data as DocumentTreeModel);
        // this.cdRef.detectChanges();
    }

    public onDblClickOnNode($event: { event: Event; node: TreeNode }) {
        const folder = $event.node.data as DocumentTreeModel;
        if (!folder?.quantity) return;
        this._filterGlobalSearch(folder);

        // if currently, has selected a node, but want to select other node to search on global search
        if (this.xnDocumentTree.selectedNode && $event.node !== this.xnDocumentTree.selectedNode) {
            this.xnDocumentTree.selectOtherNodeButKeepSelectedNode($event.node);
        }
    }

    private _filterGlobalSearch(folder: DocumentTreeModel) {
        const module = new Module({
            // idSettingsGUI: MenuModuleId.contact,
            idSettingsGUI: ModuleList.AttachmentGlobalSearch.idSettingsGUI,
            moduleName: ModuleList.AttachmentGlobalSearch.moduleName,
            searchKeyword: '',
            isCanSearch: true,
            searchIndexKey: 'attachments',
            filter: {
                fieldsName: ['idDocumentTree', 'contacts.idPerson'],
                fieldsValue: [folder.idDocument.toString(), this.contact.id?.toString()],
            },
        });
        module['titleSecondary'] = folder.name;
        module['tabClass'] = 'attachment-tab';
        this.store.dispatch(this.moduleActions.searchKeywordModule(module));
        const browserTabId = Uti.defineBrowserTabId();
        localStorage.setItem(
            LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSCaptureSearchModule, browserTabId),
            JSON.stringify({...module, browserTabId, timestamp: new Date().getTime()}),
        );
    }

    private initAction() {
        const actions = JSON.parse(
            window.localStorage.getItem(
                LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSStepKey, Uti.defineBrowserTabId()),
            ),
        ) as CustomAction[];
        if (actions && this.isValidPayloadContactDetail(actions[0])) {
            this.callActionGetDocTree(actions[0].payload.data as ContactDetailMoldel);
        }
    }

    private isValidPayloadContactDetail(action: CustomAction) {
        return (
            action.payload &&
            action.payload.selectedModule &&
            (action.payload.selectedModule.idSettingsGUI === ModuleList.Contact.idSettingsGUI ||
                action.payload.selectedModule.idSettingsGUI === ModuleList.AttachmentGlobalSearch.idSettingsGUI)
        );
    }

    public callActionGetDocTree(data?: ContactDetailMoldel) {
        if(data) this.contact = data;
        
        this.store.dispatch(
            this.administrationDocumentActions.getDocumentTree({
                shouldGetDocumentQuantity: true,
                idPerson: this.contact.idPerson,
            } as GetDocumentTreeOptions),
        );
    }
}
