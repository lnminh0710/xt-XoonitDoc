import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer/administration-document';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
} from '@app/state-management/store/actions/administration-document';
import { ToasterService } from 'angular2-toaster';
import { first, switchMap, takeUntil } from 'rxjs/operators';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { Configuration } from '@app/app.constants';
import { Actions } from '@ngrx/effects';
import { CustomAction, GlobalSearchActions } from '@app/state-management/store/actions';
import { DocumentService } from '@app/services';
import { selectGSRowDbClick } from '@app/state-management/store/reducer/global-search/global-search.selector';
import { of } from 'rxjs';

@Component({
    selector: 'widget-document-path',
    templateUrl: './widget-document-path.component.html',
    styleUrls: ['./widget-document-path.component.scss'],
})
export class WidgetDocumentPathComponent extends BaseComponent implements OnInit, OnDestroy {
    public folder: DocumentTreeModel;
    public SEPARATOR_PATH = Configuration.SEPARATOR_PATH;

    public pathDirectArray = [];

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private store: Store<AppState>,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
        private toastService: ToasterService,
        private action$: Actions,
        private documentService: DocumentService,
    ) {
        super(router);
        this.registerSubscriptions();
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        super.onDestroy();
    }

    private registerSubscriptions() {
        this.administrationDocumentSelectors.folder$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((folder: DocumentTreeModel) => {
                this.folder = folder;
            });

        this.action$.subscribe((action: CustomAction) => {
            this.loadAttachmentFile(action);
        });

        this.action$.subscribe((action: CustomAction) => {
            if (
                action.type !== GlobalSearchActions.ROW_DOUBLE_CLICK ||
                !action.payload ||
                !action.payload.selectedModule ||
                (action.payload.selectedModule.idSettingsGUI !== ModuleList.Contact.idSettingsGUI &&
                    action.payload.selectedModule.subModuleName === ModuleList.AttachmentGlobalSearch.moduleName)
            )
                return;

            this.pathDirectArray = [];
        });
        if (this.ofModule?.idSettingsGUI === ModuleList.Contact.idSettingsGUI) {
            this.store
                .select(selectGSRowDbClick)
                .pipe(
                    first((action: CustomAction) => {
                        const selectedModule = action?.payload?.selectedModule;
                        if (selectedModule) {
                            return (
                                selectedModule.idSettingsGUI === ModuleList.AttachmentGlobalSearch.idSettingsGUI &&
                                selectedModule.subModuleName === ModuleList.AttachmentGlobalSearch.moduleName
                            );
                        }
                        return false;
                    }),
                    switchMap((action: CustomAction) => {
                        const result = action.payload.data;
                        return result.idDocumentContainerScans
                            ? this.documentService.getPathTreeDocument(result.idDocumentContainerScans)
                            : of(null);
                    }),
                    takeUntil(this.getUnsubscriberNotifier()),
                )
                .subscribe((result) => {
                    if (result != null && result.docPath)
                        this.pathDirectArray = result.docPath.split(this.SEPARATOR_PATH);
                });
        }
        this.administrationDocumentSelectors
            .actionOfType$(AdministrationDocumentActionNames.CHANGE_DOCUMENT_TO_OTHER_TREE_SUCCESS)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                const res = action.payload;
                if (!res) return;

                this.pathDirectArray = res.orginalPath;
                this.cdRef.detectChanges();
            });
    }

    private loadAttachmentFile(action: CustomAction) {
        if (
            action.type !== GlobalSearchActions.ROW_DOUBLE_CLICK ||
            !action.payload ||
            !action.payload.selectedModule ||
            action.payload.selectedModule.idSettingsGUI !== ModuleList.AttachmentGlobalSearch.idSettingsGUI ||
            action.payload.selectedModule.subModuleName !== ModuleList.AttachmentGlobalSearch.moduleName
        )
            return;
        const result = action.payload.data;
        if (!result.idDocumentContainerScans) {
            this.pathDirectArray = [];
            return;
        }

        this.documentService
            .getPathTreeDocument(result.idDocumentContainerScans)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((result) => {
                if (result != null && result.docPath) this.pathDirectArray = result.docPath.split(this.SEPARATOR_PATH);
            });
    }
}
