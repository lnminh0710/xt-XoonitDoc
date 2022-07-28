import { Injectable } from '@angular/core';
import { Module } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class DocumentImageOCRActions {
    static CAPTURE_DATA = '[DocumentImageOCR] Update ocr data';
    captureData(data: any, module?: Module): CustomAction {
        return {
            type: DocumentImageOCRActions.CAPTURE_DATA,
            payload: data,
            module: module,
        };
    }

    static DELETE_RECT = '[DocumentImageOCR] Delete orc rect';
    deleteRect(data: any, module?: Module): CustomAction {
        return {
            type: DocumentImageOCRActions.DELETE_RECT,
            payload: data,
            module: module,
        };
    }

    static SAVE_DOCUMENT = '[DocumentImageOCR] Save document';
    saveDocument(data: any, module?: Module): CustomAction {
        return {
            type: DocumentImageOCRActions.SAVE_DOCUMENT,
            payload: data,
            module: module,
        };
    }

    static UPDATE_COORDINATE = '[DocumentImageOCR] update coordinates';
    updateCoordinate(data: any, module?: Module): CustomAction {
        return {
            type: DocumentImageOCRActions.UPDATE_COORDINATE,
            payload: data,
            module: module,
        };
    }

    static CHANGE_FIELD_FOCUSED = '[DocumentImageOCR] change field focus';
    changeFieldFocused(data: any, module?: Module): CustomAction {
        return {
            type: DocumentImageOCRActions.CHANGE_FIELD_FOCUSED,
            payload: data,
            module: module,
        };
    }

    static UPDATE_OCR_JSON = '[DocumentImageOCR] Update OCR Json';
    updateOCRJson(data: any, module?: Module): CustomAction {
        return {
            type: DocumentImageOCRActions.UPDATE_OCR_JSON,
            payload: data,
            module: module,
        };
    }
}
