import { Component, Input, Output, Provider, forwardRef, EventEmitter, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Dialog } from 'primeng/primeng';
import { ModalService } from '@app/services';
import { Module, WidgetDetail } from '@app/models';
import { WidgetModuleComponent } from '../widget-info';
import cloneDeep from 'lodash-es/cloneDeep';

@Component({
    selector: 'widget-edit-dialog',
    styleUrls: ['./widget-edit-dialog.component.scss'],
    templateUrl: './widget-edit-dialog.component.html'
})
export class WidgetEditDialogComponent implements OnInit, OnDestroy {

    public showDialog = false;
    private isResizable = true;
    private isDraggable = true;
    private isMaximized = false;
    private dialogW: number = 560;
    private dialogH: number = 630;
    private preDialogW: string;
    private preDialogH: string;
    private preDialogLeft: string;
    private preDialogTop: string;
    private isDataDirty = false;
    public willReloadWidget = false;
    public contentStyle: any = {};

    private dialogStyleClass = 'widget-edit-dialog';

    private _widgetData: any = {};

    private closeDialogAfterSave: boolean;

    get widgetData() {
        return this._widgetData;
    }

    @ViewChild('pEditDialog') pEditDialog: Dialog;
    @ViewChild(WidgetModuleComponent) widgetModuleComponent: WidgetModuleComponent;

    @Input() set widgetData(data: any) {
        if (data)
            this._widgetData = cloneDeep(data);
    }

    @Input() widgetStates: any;
    @Input() currentModule: Module;
    @Input() activeSubModule: Module;

    @Output() onHide = new EventEmitter<any>();
    @Output() onChangeFieldFilter = new EventEmitter<any>();
    @Output() onSaveSuccessWidget = new EventEmitter<any>();

    constructor(private element: ElementRef,
        private modalService: ModalService
    ) {
    }

    public ngOnInit() {
    }

    public ngAfterViewInit() {
        if (this.widgetModuleComponent) {
            this.widgetModuleComponent.editWidget();
        }
    }

    public ngOnDestroy() {
        const resizeEle = $('div.ui-resizable-handle', $(this.pEditDialog.containerViewChild.nativeElement));
        if (resizeEle && resizeEle.length) {
            resizeEle.unbind('mousemove');
            resizeEle.unbind('mouseup');
        }
    }

    private bindResizeEvent() {
        if (this.pEditDialog) {
            const resizeEle = $('div.ui-resizable-handle', $(this.pEditDialog.containerViewChild.nativeElement));
            if (resizeEle && resizeEle.length) {
                resizeEle.bind('mousemove', () => {
                    if (this.pEditDialog.resizing) {
                        setTimeout(() => {
                            this.widgetModuleComponent.resizedLocal = 'stop-' + (new Date()).getTime();
                            this.widgetModuleComponent.onResizeStop();
                        }, 200);
                    }
                });

                resizeEle.bind('mouseup', () => {
                    this.calculateContentHeight();
                });
            }
        }
    }

    private save() {
        if (this.widgetModuleComponent) {
            this.widgetModuleComponent.saveWidget(null);
        }
    }

    public close() {
        if (this.isDataDirty) {
            this.confirmWhenClose();
            return;
        }
        this.closeDialog();
    }

    private closeDialog() {
        this.onHide.emit({
            widgetData: this.widgetData,
            willReloadWidget: this.willReloadWidget
        });
    }

    private confirmWhenClose() {
        this.modalService.unsavedWarningMessageDefault({
            headerText: 'Saving Changes',
            onModalSaveAndExit: () => { this.closeDialogAfterSave = true; this.save(); },
            onModalExit: () => { this.closeDialog(); }
        });
    }

    public onShow(event) {
        if (this.pEditDialog) {
            this.pEditDialog.unbindDocumentEscapeListener();
        }
        this.bindResizeEvent();
        this.calculateContentHeight();
    }

    private calculateContentHeight() {
        let widgetEditDialogElm = $('.widget-edit-dialog');
        if (widgetEditDialogElm.length) {
            let dialogHeaderElm = widgetEditDialogElm.find('.ui-dialog-titlebar');
            let dialogFooterElm = widgetEditDialogElm.find('.ui-dialog-footer');
            this.contentStyle = {
                height: (widgetEditDialogElm.get(0).clientHeight || 0) - (dialogHeaderElm.get(0).clientHeight || 0) - (dialogFooterElm.get(0).clientHeight || 0) - 25 + 'px'
            }
        }
    }

    public maximize() {
        this.isMaximized = true;
        this.isResizable = false;
        this.isDraggable = false;
        this.dialogStyleClass = 'widget-edit-dialog widget-edit-dialog-full-view';
        if (this.pEditDialog) {
            this.preDialogW = this.pEditDialog.containerViewChild.nativeElement.style.width;
            this.preDialogH = this.pEditDialog.containerViewChild.nativeElement.style.height;
            this.preDialogLeft = this.pEditDialog.containerViewChild.nativeElement.style.left;
            this.preDialogTop = this.pEditDialog.containerViewChild.nativeElement.style.top;

            this.pEditDialog.containerViewChild.nativeElement.style.width = $(document).width() + 'px';
            this.pEditDialog.containerViewChild.nativeElement.style.height = $(document).height() + 'px';
            this.pEditDialog.containerViewChild.nativeElement.style.top = '0px';
            this.pEditDialog.containerViewChild.nativeElement.style.left = '0px';

            this.calculateContentHeight();
        }
    }

    public restore() {
        this.isMaximized = false;
        this.isResizable = true;
        this.isDraggable = true;
        this.dialogStyleClass = 'widget-edit-dialog';
        if (this.pEditDialog) {
            this.pEditDialog.containerViewChild.nativeElement.style.width = this.preDialogW;
            this.pEditDialog.containerViewChild.nativeElement.style.height = this.preDialogH;
            this.pEditDialog.containerViewChild.nativeElement.style.top = this.preDialogTop;
            this.pEditDialog.containerViewChild.nativeElement.style.left = this.preDialogLeft;

            this.calculateContentHeight();
        }
    }

    private changeFieldFilter(event) {
        this.onChangeFieldFilter.emit(event);
    }

    private onOpenTranslateWidget(event) {
        if (event)
            this.dialogStyleClass = 'widget-edit-dialog widget-edit-dialog-backward';
        else
            this.dialogStyleClass = 'widget-edit-dialog';
    }

    private saveSuccessWidget(event) {
        this.willReloadWidget = true;
        this.isDataDirty = false;
        this.onSaveSuccessWidget.emit(event);
        if (this.closeDialogAfterSave) {
            this.closeDialog();
        }
    }

    onEditingWidget(widgetDetail: WidgetDetail) {
        this.isDataDirty = true;
    }

    onResetWidget() {
        this.isDataDirty = false;
    }
}
