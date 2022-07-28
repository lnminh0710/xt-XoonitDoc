import {
    Component,
    OnInit,
    OnDestroy,
    OnChanges,
    ChangeDetectorRef,
    SimpleChanges,
    ElementRef,
    ViewChild,
    ChangeDetectionStrategy
} from '@angular/core';
import { FileViewerType } from '@app/app.constants';
import { BaseViewer } from '../base-viewer';
import { Router } from '@angular/router';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { GetFileByUrlForWidgetViewerIdAction, DocumentManagementActionNames } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { CustomAction } from '@app/state-management/store/actions';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'video-viewer',
    templateUrl: './video-viewer.component.html',
    styleUrls: ['./video-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoViewerComponent extends BaseViewer implements OnInit, OnDestroy, OnChanges {

    @ViewChild('videoViewer') videoViewerRef: ElementRef;

    private videoSubscription: Subscription;
    public typeAudio: string;

    constructor(
        protected router: Router,
        protected documentManagementSelectors: DocumentManagementSelectors,
        protected store: Store<AppState>,
        private cdRef: ChangeDetectorRef,
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

    public updatePath(path: string): void {
        
    }

    public subscribeOnAttachViewRef() {
        this.videoSubscription = this.documentManagementSelectors.actionSuccessOfSubtype$(DocumentManagementActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID)
            .pipe(
                filter((action: GetFileByUrlForWidgetViewerIdAction) => action.payload.idWidget === this.uniqueViewerId)
            )
            .subscribe((action: CustomAction) => {
                const win = window as any;
                const winUrl = win.URL || win.webkitURL;
                const blob = action.payload.file as Blob;
                const video = this.videoViewerRef.nativeElement as HTMLVideoElement;
                const objUrl = winUrl.createObjectURL(blob);

                video.preload = 'metadata';
                video.onloadedmetadata = (event: Event) => {
                    winUrl.revokeObjectURL(objUrl);
                }

                this.typeAudio = blob.type;
                video.src = objUrl;
                video.play();
                this.cdRef.detectChanges();
            });
    }

    public setSupportedFileTypesAsKey() {
        return [
            FileViewerType[FileViewerType.MP4],
        ];
    }

    public isExtensionTheSameGroupType(fileType: FileViewerType) {
        switch(fileType) {
            case FileViewerType.MP4:
                return true;
            default:
                return false;
        }
    }

    public disposeContentOnDetach() {
        (this.videoViewerRef.nativeElement as HTMLVideoElement).pause();
        (this.videoViewerRef.nativeElement as HTMLVideoElement).src = '';
        (this.videoViewerRef.nativeElement as HTMLVideoElement).load();
    }
}
