import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import {
    GetDocumentFilesByFolderAction,
    DocumentManagementActionNames,
    GetDocumentsByKeywordAction,
    DocumentManagementSuccessAction,
} from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';

import isBoolean from 'lodash-es/isBoolean';
import { Uti } from '@app/utilities';
import { filter, takeUntil } from 'rxjs/operators';
import { ColDef, GridOptions } from 'ag-grid-community';

@Component({
    selector: 'export-configuration',
    templateUrl: './export-configuration.component.html',
    styleUrls: ['./export-configuration.component.scss'],
})
export class ExportConfigurationComponent extends BaseComponent implements OnInit, OnDestroy {
    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private documentManagementSelectors: DocumentManagementSelectors,
        private store: Store<AppState>,
    ) {
        super(router);
    }

    public exportType: 'PDF' | 'EXCEL' | 'WALLET' = 'EXCEL';
    public columnDefs: ColDef[] = [
        {
            headerName: 'File Name',
            field: 'localFileName',
            editable: false,
            cellClass: 'export-configuration__table-cell',
            headerClass: 'export-configuration__table-header',
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: true,
        },
        {
            headerName: 'Group Name',
            field: 'groupName',
            editable: false,
            cellClass: 'export-configuration__table-cell',
        },
        {
            headerName: 'Created Date',
            field: 'createDate',
            editable: false,
            cellClass: 'export-configuration__table-cell',
        },
    ];

    public defaultColDef: any = {
        editable: false,
    };

    public gridOptions: GridOptions = {
        columnDefs: this.columnDefs,
        rowClass: 'export-configuration__table-row',
        suppressMovableColumns: true,
        suppressMenuHide: false,
        rowHeight: 60,
        headerHeight: 42,
        pivotHeaderHeight: 42,
        suppressContextMenu: true,
        defaultColDef: {
            sortable: true,
        },
    };

    public fileHistory: any = [];
    public gridApi: any;
    public disabledButton = true;

    public timeoutFilter: any;

    ///
    public files: {
        cloudMediaPath: string;
        createDate: string;
        groupName: string;
        id: number;
        idApplicationOwner: string;
        idDocumentTree: string;
        idMainDocument: string;
        isActive: boolean;
        isDeleted: boolean;
        mediaName: string;
        notes: string;
        rootName: string;
    }[] = [];

    public selectedFolder: DocumentTreeModel;
    public isLoading = false;

    ngOnInit() {
        this.files = [];
        this.subscribe();
    }

    ngOnDestroy(): void {
        Uti.unsubscribe(this);
    }

    public onGridReady(params) {
        this.gridApi = params.api;

        params.api.sizeColumnsToFit();
    }

    public onQuickFilterChanged(event: any) {
        this.gridApi.setQuickFilter(event.target.value);

        // if (this.timeoutFilter) clearTimeout(this.timeoutFilter);

        // this.timeoutFilter = setTimeout(() => {
        //   this.ref.detectChanges();
        // }, 300);
    }

    public onSelectionChanged() {
        this.disabledButton = !this.gridApi.getSelectedRows().length;
    }

    public export() {
        alert('Export ' + this.gridApi.getSelectedRows().length + ' document');
    }

    private subscribe() {
        this.documentManagementSelectors
            .actionOfType$(DocumentManagementActionNames.GET_DOCUMENT_FILES_BY_FOLDER)
            .pipe(
                filter((action: GetDocumentFilesByFolderAction) => !!action.payload),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: GetDocumentFilesByFolderAction) => {
                const folder = action.payload;
                if (this.selectedFolder && this.selectedFolder.idDocument === folder.idDocument) return;

                this.store.dispatch(
                    new GetDocumentsByKeywordAction({
                        fieldName: 'idDocumentTree',
                        folder: folder,
                        index: 'maindocument',
                        moduleId: ModuleList.Document.idSettingsGUI,
                        pageIndex: 0,
                        pageSize: 1000,
                        searchPattern: '*',
                        fieldNames: [],
                        fieldValues: [],
                    }),
                );
                this.selectedFolder = folder;

                this.isLoading = true;
                this.cdRef.detectChanges();
            });

        this.documentManagementSelectors
            .actionSuccessOfSubtype$(DocumentManagementActionNames.GET_DOCUMENTS_BY_KEYWORD)
            .pipe(
                filter((action: DocumentManagementSuccessAction) => !!action.payload),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: DocumentManagementSuccessAction) => {
                this.isLoading = false;
                this.files = (action.payload.results as any[]).map((data) => {
                    data.isActive = isBoolean(data.isActive)
                        ? data.isActive
                        : data.isActive.toLowerCase() === 'true'
                        ? true
                        : false;
                    data.isDeleted = isBoolean(data.isDeleted)
                        ? data.isDeleted
                        : data.isDeleted.toLowerCase() === 'true'
                        ? true
                        : false;
                    return data;
                });
                this.cdRef.detectChanges();
            });
    }
}
