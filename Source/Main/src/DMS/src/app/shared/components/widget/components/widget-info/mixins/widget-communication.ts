import { ViewChild } from '@angular/core';
import {
    WidgetDetail,
    IDragDropCommunicationData,
    DragMode,
    WidgetType,
    MessageModel,
    Module,
    WidgetPropertyModel,
    WidgetState
} from '@app/models';
import { MessageModal } from '@app/app.constants';
import { WidgetUtils } from '../../../utils';
import { WidgetTranslationComponent } from '../../widget-translation';
import {
    ModalService
} from '@app/services';
import { Constructor } from './constructor';
import { WidgetDetailInfo } from './widget-base-mixin';

export interface CommunicationServiceInjector {
    widgetUtils: WidgetUtils;
    modalService: ModalService;
}

export function MixinWidgetCommunication<T extends Constructor<CommunicationServiceInjector>>(base: T) {
    abstract class AbstractWidgetCommunicationBase extends base implements WidgetDetailInfo {
        
        public linkableWidget: boolean;
        public linkedSuccessWidget: boolean;
        public linkedWidgetCoverDisplay: boolean;
        public supportLinkedWidgetCoverDisplay: boolean;
        public supportLinkWidget: boolean;

        constructor(...args: any[]) {
            super(...args);
        }

        // Implement interface WidgetDetailInfo Widget
        abstract get widgetStatesInfo(): Array<WidgetState>;
        abstract get dataInfo(): WidgetDetail;
        abstract get moduleInfo(): Module;
        abstract get showInDialogStatus(): boolean;
        abstract get widgetEditedStatus(): boolean;
        abstract get propertiesInfo(): WidgetPropertyModel[];

        protected abstract removeLinkWidgetSuccess();
        protected abstract linkWidgetClicked();
        protected abstract isWidgetTranslationInEditMode(): boolean;
        protected abstract detach();
        protected abstract reattach();
        protected abstract connectWidgetSuccessCallback(data: WidgetDetail);

        /**
         * onDragOverWidget
         * @param data
         */
        public onDragOverWidget(dragDropCommunicationData: IDragDropCommunicationData, data: WidgetDetail) {
            if (dragDropCommunicationData.srcWidgetDetail.id == data.id) {
                return;
            }
            let isValid: boolean;
            switch (dragDropCommunicationData.mode) {
                case DragMode.Default:
                    isValid = this.widgetUtils.isValidWidgetToConnectOfChild(dragDropCommunicationData.srcWidgetDetail, data);
                    if (!isValid) {
                        isValid = this.widgetUtils.isValidTableWidgetToConnect(dragDropCommunicationData.srcWidgetDetail, data);
                    }
                    break;
                case DragMode.Translate:
                    isValid = this.isValidTranslateWidgetToConnect(dragDropCommunicationData.srcWidgetDetail, data);
                    break;
            }
            if (isValid) {
                this.linkableWidget = true;
            }
        }        

        /**
         * isValidTranslateWidgetToConnect
         * @param srcWidgetDetail
         */
        private isValidTranslateWidgetToConnect(srcWidgetDetail: WidgetDetail, data: WidgetDetail) {
            let isValid = false;
            if ((srcWidgetDetail.idRepWidgetType == WidgetType.FieldSet ||
                srcWidgetDetail.idRepWidgetType == WidgetType.FieldSetReadonly ||
                this.isValidTranslateGridWidget(srcWidgetDetail)) &&
                data.idRepWidgetType == WidgetType.Translation) {
                if (this.isWidgetTranslationInEditMode()) {
                    isValid = true;
                }
            }
            return isValid;
        }

        private isValidTranslateGridWidget(srcWidgetDetail: WidgetDetail) {
            if (srcWidgetDetail.idRepWidgetType == WidgetType.DataGrid ||
                srcWidgetDetail.idRepWidgetType == WidgetType.EditableGrid ||
                srcWidgetDetail.idRepWidgetType == WidgetType.Combination ||
                srcWidgetDetail.idRepWidgetType == WidgetType.TableWithFilter) {
                if (!srcWidgetDetail['gridSelectedRow'] ||
                    !srcWidgetDetail['gridSelectedRow'].length) {
                    this.modalService.warningText('You must select at least one row.');
                    return false;
                }
                return true;
            }
            return false;
        }

        /**
         * onConnectWidget (onDrop)
         * 
         * @param data
         */
        public onConnectWidget(dropResultData: any, data: WidgetDetail) {
            this.linkableWidget = false;
            this.linkedWidgetCoverDisplay = false;
            this.supportLinkedWidgetCoverDisplay = false;
            const dragDropCommunicationData: IDragDropCommunicationData = dropResultData.data;
            let srcWidgetDetail = dragDropCommunicationData.srcWidgetDetail;
            if (srcWidgetDetail.id == data.id) {
                return;
            }
            let isValid: boolean;
            if (dragDropCommunicationData.mode == DragMode.Default) {
                isValid = this.widgetUtils.isValidWidgetToConnectOfChild(srcWidgetDetail, data);
                if (isValid) {
                    let isMain = !!(data.widgetDataType && data.widgetDataType.isPrimaryKeyForMain);
                    this.widgetUtils.buildListenKeyConfigForWidgetDetail(srcWidgetDetail, isMain);
                    if (!isMain) {
                        srcWidgetDetail.widgetDataType.parentWidgetIds = [];
                        srcWidgetDetail.widgetDataType.parentWidgetIds.push(data.id);
                    }
                    if (dropResultData.callBack) {
                        dropResultData.callBack(srcWidgetDetail);
                    }
                    this.linkedSuccessWidget = true;
                }
                else {
                    isValid = this.widgetUtils.isValidWidgetToConnectOfParent(srcWidgetDetail, data);
                    if (isValid) {
                        this.widgetUtils.buildListenKeyConfigForWidgetDetail(data, false);
                        data.widgetDataType.parentWidgetIds = [];
                        data.widgetDataType.parentWidgetIds.push(srcWidgetDetail.id);
                        if (dropResultData.callBack) {
                            dropResultData.callBack(data);
                        }
                        this.linkedSuccessWidget = true;
                        this.connectWidgetSuccessCallback(data);
                    }
                    else {
                        isValid = this.widgetUtils.isValidTableWidgetToConnect(dragDropCommunicationData.srcWidgetDetail, data);
                        if (isValid) {
                            srcWidgetDetail.syncWidgetIds = srcWidgetDetail.syncWidgetIds || [];
                            data.syncWidgetIds = data.syncWidgetIds || [];
                            const iRet = srcWidgetDetail.syncWidgetIds.filter(p => p == data.id);
                            if (!iRet.length) {
                                srcWidgetDetail.syncWidgetIds.push(data.id);
                                data.syncWidgetIds.push(srcWidgetDetail.id);
                                if (dropResultData.callBack) {
                                    dropResultData.callBack(srcWidgetDetail);
                                }
                            }
                            this.linkedSuccessWidget = true;
                        } else {
                            isValid = this.widgetUtils.isValidChartWidgetToConnectTable(dragDropCommunicationData.srcWidgetDetail, data);
                            if (isValid) {
                                srcWidgetDetail.syncWidgetIds = [data.id];
                                srcWidgetDetail.contentDetail = { ...data.contentDetail };
                                if (dropResultData.callBack) {
                                    dropResultData.callBack(srcWidgetDetail);
                                }
                                this.linkedSuccessWidget = true;
                            }
                        }
                    }
                }
            }
            else if (dragDropCommunicationData.mode == DragMode.Translate) {
                isValid = this.isValidTranslateWidgetToConnect(srcWidgetDetail, data);
                if (isValid) {
                    dragDropCommunicationData.srcWidgetDetail = new WidgetDetail({
                        id: srcWidgetDetail.id,
                        idRepWidgetApp: srcWidgetDetail.idRepWidgetApp,
                        idRepWidgetType: srcWidgetDetail.idRepWidgetType
                    });
                    // service for translate grid data
                    if (srcWidgetDetail['gridSelectedRow']) {
                        dragDropCommunicationData.srcWidgetDetail['gridSelectedRow'] = srcWidgetDetail['gridSelectedRow'];
                    }
                    data.extensionData = dragDropCommunicationData;
                    if (dropResultData.callBack) {
                        dropResultData.callBack(data);
                    }
                }
            }
            // 
            this.reattach();
        }

        /**
        * onDragLeaveWidget
        */
        public onDragLeaveWidget(event) {
            this.linkableWidget = false;
        }          

        /**
         * removeLinkWidget
         * @param event
         */
        public removeLinkWidget(event) {
            this.modalService.confirmMessageHtmlContent(new MessageModel({
                messageType: MessageModal.MessageType.error,
                headerText: 'Remove Connection',
                message: [ { key: '<p>' }, { key: 'Modal_Message__RemoveConnectionFromThisWidget' }, { key: '</p>' }],
                buttonType1: MessageModal.ButtonType.danger,
                callBack1: () => {
                    this.linkedSuccessWidget = false;
                    this.removeLinkWidgetSuccess();
                }
            }));
        }

        public linkWidget(event) {
            this.linkWidgetClicked();
        }
    };
    return AbstractWidgetCommunicationBase;
}
