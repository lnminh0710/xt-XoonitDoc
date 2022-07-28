import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit,
    ChangeDetectionStrategy,
    Injector,
    NgZone,
    ChangeDetectorRef,
    OnDestroy,
    SimpleChanges,
    OnChanges
} from '@angular/core';
import { WjFlexSheet } from 'wijmo/wijmo.angular2.grid.sheet';
import { BaseViewer } from '../base-viewer';
import { Router } from '@angular/router';
import { FileManagerActions, FileManagerActionNames } from '@app/state-management/store/actions/file-manager/file-manager.action';
import { FileManagerSelectors } from '@app/state-management/store/reducer/file-manager/file-manager.selectors';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { FileViewerType } from '@app/app.constants';
import { CustomAction } from '@app/state-management/store/actions';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { GetFileByUrlForWidgetViewerIdAction, DocumentManagementActionNames } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { filter } from 'rxjs/operators';


@Component({
    selector: 'spreadsheet-viewer',
    templateUrl: './spreadsheet-viewer.component.html',
    styleUrls: ['./spreadsheet-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpreadsheetViewerComponent extends BaseViewer implements OnInit, AfterViewInit, OnDestroy, OnChanges {

    private flexSheet: any;
    private fileSubscription: Subscription;

    @ViewChild('spreadsheet') spreadsheetRef: ElementRef;

    constructor(
        protected router: Router,
        protected documentManagementSelectors: DocumentManagementSelectors,
        protected store: Store<AppState>,
        private cdRef: ChangeDetectorRef,
        private injector: Injector,
    ) {
        super(router, store)
        this.subscribeOnAttachViewRef();
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    ngOnInit() {
        this.cdRef.detach();
    }

    ngOnDestroy(): void {
        this.unsubscribeOnDetachViewRef();
    }

    ngAfterViewInit(): void {
        this.newFlexSheet();
    }

    public updatePath(path: string): void {
        
    }

    public subscribeOnAttachViewRef() {
        this.fileSubscription = this.documentManagementSelectors.actionSuccessOfSubtype$(DocumentManagementActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID)
            .pipe(
                filter((action: GetFileByUrlForWidgetViewerIdAction) => action.payload.idWidget === this.uniqueViewerId),
            )
            .subscribe((action: CustomAction) => {
                const blob = this.blob = action.payload.file as Blob;
                const fileReader = new FileReader();

                fileReader.onload = (event: any) => {
                    const data = event.target.result as ArrayBuffer;
                    this.flexSheet.loadAsync(data, workbook => {
                        this.cdRef.detectChanges();
                    })
                };
                fileReader.readAsArrayBuffer(blob);
            });
    }

    public setSupportedFileTypesAsKey() {
        return [
            FileViewerType[FileViewerType.XLSX]
        ];
    }

    public isExtensionTheSameGroupType(fileType: FileViewerType) {
        switch (fileType) {
            case FileViewerType.XLSX:
                return true;
            default:
                return false;
        }
    }

    public disposeContentOnDetach() {
        if (!this.flexSheet) return;
        this.flexSheet.clear();
    }

    private newFlexSheet() {
        if (this.flexSheet) return;
        this.flexSheet = new WjFlexSheet(this.spreadsheetRef, this.injector, this);
    }
}
