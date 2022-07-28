import { Injectable } from '@angular/core';
import { Module } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

export enum FileManagerActionNames {
  FILE_MANAGER_SUCCESS = '[File Manager] File Manager Success',
  FILE_MANAGER_FAILED = 'File Manager] File Manager Failed',
  GET_FILE_BY_URL = '[File Manager] Get File By Url',
  GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID = '[File Manager] GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID',
  OPEN_ITEM = '[File Manager] Open Item',
}

@Injectable()
export class FileManagerActions {
  static SELECT_ITEM = '[FileManager] select item';
  selectItem(data: any, module?: Module): CustomAction {
    return {
      type: FileManagerActions.SELECT_ITEM,
      payload: data,
      module: module,
    };
  }

  static CLICK_BUTTON = '[FileManager] Click toolbar button';
  clickButton(data: any, module?: Module): CustomAction {
    return {
      type: FileManagerActions.CLICK_BUTTON,
      payload: data,
      module: module,
    };
  }

  static OPEN_ITEM = '[FileManager] open file';
  openItem(data: any, module?: Module): CustomAction {
    return {
      type: FileManagerActions.OPEN_ITEM,
      payload: data,
      module: module,
    };
  }

  getFileByUrlAction(url: string): CustomAction {
    return {
      type: FileManagerActionNames.GET_FILE_BY_URL,
      payload: url,
    };
  }

  getFileByUrlForViewerIdAction(url: string, widgetViewerId: string): CustomAction {
    return {
      type: FileManagerActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID,
      payload: {
        url: url,
        widgetViewerId: widgetViewerId,
      },
    };
  }

  fileManagerSuccess(actionType: string, payload: any) {
    return {
      type: FileManagerActionNames.FILE_MANAGER_SUCCESS,
      subType: actionType,
      payload: payload,
    };
  }

  fileManagerFailed(actionType: string, payload: any) {
    return {
      type: FileManagerActionNames.FILE_MANAGER_FAILED,
      subType: actionType,
      payload: payload,
    };
  }
}
