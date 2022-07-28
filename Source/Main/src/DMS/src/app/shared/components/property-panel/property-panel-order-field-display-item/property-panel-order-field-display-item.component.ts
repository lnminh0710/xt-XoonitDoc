import {
    Component, Input, Output, EventEmitter, OnInit,
    OnDestroy, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ViewContainerRef, AfterViewInit, HostListener
} from '@angular/core';
import { Uti } from '@app/utilities';
import { WidgetTemplateSettingService, AppErrorHandler, ModalService } from '@app/services';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '@app/state-management/store';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { WidgetDetailActions } from '@app/state-management/store/actions/widget-content-detail';
import { ScrollUtils, DomHandler } from '@app/services';
import * as autoScroll from 'dom-autoscroller';

@Component({
    selector: 'property-panel-order-field-display-item',
    styleUrls: ['./property-panel-order-field-display-item.component.scss'],
    templateUrl: './property-panel-order-field-display-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyPanelOrderFieldDisplayItemComponent implements OnInit, OnDestroy, AfterViewInit {
    private beforeIndex = 0;
    perfectScrollbarConfig: any;
    private stop = false;
    private dragElement: any;
    private dragContainer: any;
    private containerOffset: any;
    public fields: any;
    public isMouseEnter = true;

    private _scrollUtils: ScrollUtils;
    private get scrollUtils() {
        if (!this._scrollUtils) {
            this._scrollUtils = new ScrollUtils(this.scrollBodyContainer, this.domHandler);
        }
        return this._scrollUtils;
    }

    private isDragging: boolean = false;
    // private shiftIsPressed: boolean = false;

    private onDraggingSubscription: Subscription;
    private onDragendSubscription: Subscription;
    private onClonedSubscription: Subscription;
    private onDropSubscription: Subscription;
    private onOverSubscription: Subscription;

    // Used for drag & drop multiple items
    private hasMultiple: boolean;
    private selectedItems: any;
    private mirrorContainer: any;

    // public showUpIconScroll: boolean;
    // public showDownIconScroll: boolean;
    public autoScrollUtil;

    @Input() set data(data: any) {
        this.fields = data;
        this.changeDetectorRef.markForCheck();
    }

    @Output() isDirty = new EventEmitter<any>();
    @ViewChild('fieldBody', { read: ViewContainerRef }) fieldBodyRef: any;

    constructor(
        private _eref: ElementRef,
        private dragulaService: DragulaService,
        private changeDetectorRef: ChangeDetectorRef,
        private domHandler: DomHandler
    ) {
       
    }

    ngOnInit() {
        this.initDragulaEvents();
    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public containerMousedown() {
        if (this.autoScrollUtil) {
            this.autoScrollUtil.destroy();
            this.autoScrollUtil = null;
        }
        this.autoScrollUtil = autoScroll([
            this.fieldBodyRef.element.nativeElement,
        ], {
                margin: 10,
                maxSpeed: 6,
                scrollWhenOutside: true,
                autoScroll: function () {
                    // Only scroll when the pointer is down.
                    return this.down;
                }
           });
    }

    /**
     * scrollBodyContainer of widget
     */
    private get scrollBodyContainer() {
        return this.fieldBodyRef.element.nativeElement;
    }

    

    private initDragulaEvents() {
        this.onDraggingSubscription = this.dragulaService.drag.subscribe(this.onDragging.bind(this));
        this.onDragendSubscription = this.dragulaService.dragend.subscribe(this.onDragend.bind(this));
        this.onClonedSubscription = this.dragulaService.cloned.subscribe(this.onCloned.bind(this));
        this.onDropSubscription = this.dragulaService.drop.subscribe(this.onDrop.bind(this));
        this.onOverSubscription = this.dragulaService.over.subscribe(this.onOver.bind(this));
        // this.dragulaService.out.subscribe(this.onDragOut.bind(this));
        this.initPerfectScroll();
    }

    private initPerfectScroll() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        };
    }
    

    /**
     * onCloned
     * @param args
     */
    private onCloned(args: any) {

        const [clone, original, type] = args;

        // Grab the mirror container dragula creates by default
        this.mirrorContainer = $('.gu-mirror').first();
        let mirrorContainer = this.mirrorContainer;

        // multi selected items will have this class, but we don't want it on the ones in the mirror
        mirrorContainer.removeClass('selected-item');        

        this.selectedItems = $(this.domHandler.find(this._eref.nativeElement, '.selected-item'));
        let selectedItems = this.selectedItems;

        // Check if we have multiple items selected
        this.hasMultiple = selectedItems.length > 1 || (selectedItems.length == 1 && !$(original).hasClass('selected-item'));

        //
        if (this.hasMultiple) {
            // edge case: if they started dragging from an unselected item, adds the selected item class
            $('.gu-transit').addClass('selected-item');            

            // clear the mirror container, we're going to fill it with clones of our items
            mirrorContainer.empty();

            // clone the selected items into the mirror container
            selectedItems.each(function (index) {
                let item = $(this);

                // clone the item
                let mirror = item.clone(true);

                // remove the state classes if necessary
                mirror.removeClass('selected-item gu-transit');

                // add the clone to mirror container
                mirrorContainer.append(mirror);
                mirrorContainer.css('background-color', 'transparent');

                //add drag state class to item
                item.addClass('gu-transit');
                // item.removeClass('selected-item');
            });
        }
    }

    /**
     * onOver
     * @param args
     */
    private onOver(args: any) {
        let that = this;
        this.selectedItems.each(function (index) {
            // the item
            let item = $(this);
            for (let i = 0; i < that.fields.length; i++) {
                if (that.fields[i].IdSysWidgetFieldsOrderBy == item[0].id) {
                    if (that.fields[i].isDragging) {
                        item.css('display', 'block');
                    }
                    else {
                        item.css('display', 'none');
                    }
                }
            }
        });
    }

    /**
     * onDrop
     * @param args
     */
    private onDrop(args: any) {
        let [bag, el, target, source, sibling] = args;
        // convert to jquery
        target = $(target);

        // Check if we dropping multiple items
        if (this.hasMultiple) {
            // get the default, single dropped item
            let droppedItem = target.find('.gu-transit.div-dragging').first();

            //
            let dragIds: Array<string> = [];
            let insertedId = null;
            let previousSibling;

            if (droppedItem && droppedItem[0]) {
                previousSibling = droppedItem.prev();
                if (previousSibling && previousSibling[0]) {
                    insertedId = previousSibling[0].id;
                }
            }

            this.mirrorContainer.children().each(function (index) {
                // the item
                var item = $(this);
                dragIds.push(item[0].id);
            });

            if (dragIds.length) {
                const fieldDragItems: Array<any> = this.fields.filter(p => dragIds.find(d => d == p.IdSysWidgetFieldsOrderBy) != null);
                const fieldPosNeedToInsert = this.fields.find(p => p.IdSysWidgetFieldsOrderBy == insertedId);

                fieldDragItems.forEach(dragItem => {
                    let index = this.fields.indexOf(dragItem);
                    if (index > -1) {
                        this.fields.splice(index, 1);
                    }
                });

                // Need to find the postion for inserting
                let pos = 0;
                if (fieldPosNeedToInsert) {
                    pos = this.fields.indexOf(fieldPosNeedToInsert);
                    this.fields.splice.apply(this.fields, [pos + 1, 0].concat(fieldDragItems));
                }
                else {
                    this.fields.splice.apply(this.fields, [pos, 0].concat(fieldDragItems));
                }
            }
            // clear flag
            this.hasMultiple = false;
        }
    }

    /**
     * onDragend
     * @param args
     */
    private onDragend(args: any) {
        this.isDragging = false;
        this.stop = true;
        const [bagName, el, target, source] = args;
        this.setOpacityForScroll('');

        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i].IdSysWidgetFieldsOrderBy == el.id && this.beforeIndex !== i) {
                this.fields[i].isDragged = true;
                this.isDirty.emit();
            }
            this.fields[i].isDragging = false;
            this.fields[i].isSelected = false;
        }
        this.beforeIndex = -1;

        if (this.autoScrollUtil) {
            this.autoScrollUtil.destroy();
            this.autoScrollUtil = null;
        }

        if (this.selectedItems && this.selectedItems.length > 1) {
            let that = this;
            this.selectedItems.each(function (index) {
                let item = $(this);
                item.css('display', '');
                // item.removeClass('selected-item');
                item.removeClass("gu-transit");
                for (let i = 0; i < that.fields.length; i++) {
                    if (that.fields[i].IdSysWidgetFieldsOrderBy == item[0].id) {
                        that.fields[i].isDragged = true;
                    }
                    that.fields[i].isDragging = false;
                    that.fields[i].isSelected = false;
                }
                this.beforeIndex = -1;
            });
            this.isDirty.emit();
        }
        this.selectedItems = null;
        this.changeDetectorRef.markForCheck();
    }

    private onDragOut(args: any) {
        var drake = this.dragulaService.find('order-fields-display-item-bag').drake;
        drake.end();

        this.onDragend(args);
    }

    private onDragging(args: any) {
        this.isDragging = true;
        const [bagName, el, target, source] = args;
        this.setOpacityForScroll(1);
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i].IdSysWidgetFieldsOrderBy == el.id) {
                this.fields[i].isDragging = true;
                this.beforeIndex = i;
            }
            else {
                this.fields[i].isDragging = false;
            }
        }
        this.dragElement = $(el);
        this.stop = false;
        // this.setScrollPosition();

        // this.updateScrollIconStatus();

        this.changeDetectorRef.markForCheck();
    }

    private setOpacityForScroll(opacityValue: any) {
        const elementWrapper = this._eref.nativeElement.querySelector('.pl__of__display-item');
        const elementList = this._eref.nativeElement.querySelector('.drad-and-drop-body');
        if (elementList.offsetHeight <= elementWrapper.offsetHeight) return;

        var scroll = this._eref.nativeElement.querySelector('.ps-scrollbar-y-rail');
        if (scroll) {
            scroll.style.display = 'block';
            scroll.style.opacity = opacityValue;
            setTimeout(() => {
                scroll.style.height = '160px';
                scroll.firstElementChild.style.height = '150px';
            }, 100);
        }
    }
    private setScrollPosition() {
        if (this.stop) return;
        this.dragContainer = document.querySelector('.pl__of__display-item');
        this.containerOffset = $('.pl__of__display-item');

        if ((this.dragElement.offset().top - 60) <= this.containerOffset.offset().top) {
            this.dragContainer.scrollTop -= 31;
        }
        if ((this.dragElement.offset().top + 80) >= (this.containerOffset.offset().top + this.containerOffset.height())) {
            this.dragContainer.scrollTop += 31;
        }

        setTimeout(() => {
            this.setScrollPosition();
        }, 300);
    }

    private itemClicked(event: any) {
        for (const item of this.fields) {
            item.isActive = (event.IdSysWidgetFieldsOrderBy === item.IdSysWidgetFieldsOrderBy);
        }

        this.changeDetectorRef.markForCheck();
    }

    public itemsTrackBy(index, item) {
        return item ? item.FieldName : undefined;
    }


    ///**
    // * updateScrollIconStatus
    // **/
    //private updateScrollIconStatus() {
    //    // this.showUpIconScroll = this.scrollUtils.canScrollUpTop && this.isDragging;
    //    // this.showDownIconScroll = this.scrollUtils.canScrollDownBottom && this.isDragging;
    //}

    ///**
    // * onKeydownHandler
    // * @param event
    // */
    //@HostListener('document:keydown', ['$event'])
    //onKeydownHandler(event: KeyboardEvent) {
    //    if (event.shiftKey)
    //        this.shiftIsPressed = true;
    //}


    ///**
    // * onKeyupHandler
    // * @param event
    // */
    //@HostListener('document:keyup', ['$event'])
    //onKeyupHandler(event: KeyboardEvent) {
    //    this.shiftIsPressed = false;
    //}

    //public itemClick(fieldItem) {
    //    if (this.shiftIsPressed) {
    //        $(fieldItem).toggleClass('selected-item');
    //    }
    //}

}
