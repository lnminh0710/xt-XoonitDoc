import {
    Component,
    OnInit,
    ElementRef,
    ChangeDetectorRef,
    ViewChild,
    SimpleChanges,
    ChangeDetectionStrategy,
    Injector,
    OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FileManagerActions, FileManagerActionNames } from '@app/state-management/store/actions/file-manager/file-manager.action';
import { FileManagerSelectors } from '@app/state-management/store/reducer/file-manager/file-manager.selectors';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { BaseViewer } from '../base-viewer';
import { FileViewerType } from '@app/app.constants';
import { CustomAction } from '@app/state-management/store/actions';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { GetFileByUrlForWidgetViewerIdAction, DocumentManagementActionNames } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerComponent extends BaseViewer implements OnInit, OnDestroy {
    @ViewChild('imgViewer') imgViewerRef: ElementRef;

    private imageSubscription: Subscription;

    constructor(
        protected router: Router,
        protected documentManagementSelectors: DocumentManagementSelectors,
        protected store: Store<AppState>,
        private cdRef: ChangeDetectorRef,
    ) {
        super(router, store)
        this.subscribeOnAttachViewRef();
    }

    ngOnInit() {
        this.cdRef.detach();
    }

    ngOnDestroy(): void {
        this.unsubscribeOnDetachViewRef();
    }

    public updatePath(path: string): void {
        
    }

    public subscribeOnAttachViewRef() {
        this.imageSubscription = this.documentManagementSelectors.actionSuccessOfSubtype$(DocumentManagementActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID)
            .pipe(
                filter((action: GetFileByUrlForWidgetViewerIdAction) => action.payload.idWidget === this.uniqueViewerId)
            )
            .subscribe((action: CustomAction) => {
                const blob = action.payload.file as Blob;
                const fileReader = new FileReader();

                fileReader.onload = (data: any) => {
                    this.imgViewerRef.nativeElement.src = data.target.result as string;
                    this.cdRef.detectChanges();
                };

                fileReader.readAsDataURL(blob);

            });
    }

    public setSupportedFileTypesAsKey() {
        return [
            FileViewerType[FileViewerType.JPG],
            FileViewerType[FileViewerType.PNG],
            FileViewerType[FileViewerType.TIFF],
        ];
    }

    public isExtensionTheSameGroupType(fileType: FileViewerType) {
        switch(fileType) {
            case FileViewerType.JPG:
            case FileViewerType.PNG:
            case FileViewerType.TIFF:
                return true;
            default:
                return false;
        }
    }

    public disposeContentOnDetach() {
        super.disposeContentOnDetach();
        (this.imgViewerRef.nativeElement as HTMLImageElement).src = '';
    }
}
