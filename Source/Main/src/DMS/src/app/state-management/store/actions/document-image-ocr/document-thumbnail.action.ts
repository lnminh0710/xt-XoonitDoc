import { Injectable } from '@angular/core';
import { Module } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class DocumentThumbnailActions {
    static DOCUMENT_THUMBNAIL_SELECT_ITEM = '[Document Image Thumbnail] Select document';
    selectDocument(data: any, module?: Module): CustomAction {
        return {
            type: DocumentThumbnailActions.DOCUMENT_THUMBNAIL_SELECT_ITEM,
            payload: data,
            module: module,
        };
    }

    static DOCUMENT_THUMBNAIL_SELECT_UNKNOWN_ITEM = '[Document Image Thumbnail] Select unknown document';
    selectUnknownDocument(data: any, module?: Module): CustomAction {
        return {
            type: DocumentThumbnailActions.DOCUMENT_THUMBNAIL_SELECT_UNKNOWN_ITEM,
            payload: data,
            module: module,
        };
    }

    static DOCUMENT_THUMBNAIL_ADD_ITEM = '[Document Image Thumbnail] Add document';
    addDocument(data: any, module?: Module): CustomAction {
        return {
            type: DocumentThumbnailActions.DOCUMENT_THUMBNAIL_ADD_ITEM,
            payload: data,
            module: module,
        };
    }

    static DOCUMENT_THUMBNAIL_NO_ITEM = '[Document Image Thumbnail] No item';
    noItem(module?: Module): CustomAction {
        return {
            type: DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM,
            module: module,
        };
    }

    static DOCUMENT_THUMBNAIL_PAUSE_REFRESH = '[Document Image Thumbnail] Pause refresh';
    pauseRefreshList(payload: boolean, module?: Module): CustomAction {
        return {
            type: DocumentThumbnailActions.DOCUMENT_THUMBNAIL_PAUSE_REFRESH,
            module: module,
            payload,
        };
    }

    static DOCUMENT_THUMBNAIL_REFRESH = '[Document Image Thumbnail] Refresh';
    reloadDocument(module?: Module): CustomAction {
        return {
            type: DocumentThumbnailActions.DOCUMENT_THUMBNAIL_REFRESH,
            module: module,
        };
    }
}
