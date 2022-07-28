import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { BaseViewer } from '../base-viewer';
import { Subscription } from 'rxjs';
import { FileViewerType } from '@app/app.constants';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { DocumentManagementActionNames, GetFileByUrlForWidgetViewerIdAction } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { filter } from 'rxjs/operators';
import { CustomAction } from '@app/state-management/store/actions';

@Component({
    selector: 'audio-viewer',
    templateUrl: './audio-viewer.component.html',
    styleUrls: ['./audio-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerComponent extends BaseViewer implements OnInit, OnDestroy, OnChanges {

    @ViewChild('audioViewer') audioViewerRef: ElementRef;

    private audioSubscription: Subscription;
    public typeAudio: string;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        protected documentManagementSelectors: DocumentManagementSelectors,
        protected cdRef: ChangeDetectorRef,
    ) {
        super(router, store);
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
        this.audioSubscription = this.documentManagementSelectors.actionSuccessOfSubtype$(DocumentManagementActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID)
            .pipe(
                filter((action: GetFileByUrlForWidgetViewerIdAction) => action.payload.idWidget === this.uniqueViewerId)
            )
            .subscribe((action: CustomAction) => {
                const win = window as any;
                const winUrl = win.URL || win.webkitURL;
                const blob = action.payload.file as Blob;
                const audio = this.audioViewerRef.nativeElement as HTMLAudioElement;
                const objUrl = winUrl.createObjectURL(blob);

                audio.preload = 'metadata';
                audio.onloadedmetadata = (event: Event) => {
                    winUrl.revokeObjectURL(objUrl);
                }

                this.typeAudio = blob.type;
                audio.src = objUrl;
                audio.play();
                this.cdRef.detectChanges();
            });
    }

    public setSupportedFileTypesAsKey() {
        return [
            FileViewerType[FileViewerType.MP3],
            FileViewerType[FileViewerType.WAV],
        ];
    }

    public isExtensionTheSameGroupType(fileType: FileViewerType) {
        switch (fileType) {
            case FileViewerType.MP3:
            case FileViewerType.WAV:
                return true;
            default:
                return false;
        }
    }

    public disposeContentOnDetach() {
        super.disposeContentOnDetach();
        (this.audioViewerRef.nativeElement as HTMLAudioElement).pause();
        (this.audioViewerRef.nativeElement as HTMLAudioElement).src = '';
        (this.audioViewerRef.nativeElement as HTMLAudioElement).load();
    }
}
