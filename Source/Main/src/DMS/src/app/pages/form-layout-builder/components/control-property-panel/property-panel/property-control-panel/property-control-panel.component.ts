import {
    Component,
    Input,
    Output,
    OnInit,
    OnDestroy,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ElementRef
} from '@angular/core';
import {
    Store,
    ReducerManagerDispatcher
} from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import {
    PropertyPanelActions,
    LayoutInfoActions
} from '@app/state-management/store/actions';
import {
    AppErrorHandler,
    PropertyPanelService,
    ModalService
} from '@app/services';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { Uti } from '@app/utilities';
import { ControlProperty } from '../../../../models/control-property';

@Component({
    selector: 'property-control-panel',
    styleUrls: ['./property-control-panel.component.scss'],
    templateUrl: './property-control-panel.component.html',
    //changeDetection: ChangeDetectionStrategy.OnPush    
})

export class PropertyControlPanelComponent extends BaseComponent implements OnInit, OnDestroy {
    private el: HTMLElement;

    @Input() properties: ControlProperty[] = [];   

    @Output() onClose = new EventEmitter<any>();
    @Output() onSave = new EventEmitter<any>();
    @Output() onChange = new EventEmitter<any>();
    @Output() onApply = new EventEmitter<any>();

    constructor(
        private store: Store<AppState>,
        private propertyPanelActions: PropertyPanelActions,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelService: PropertyPanelService,
        private modalService: ModalService,
        private changeDetectorRef: ChangeDetectorRef,
        private elementRef: ElementRef,
        private layoutInfoActions: LayoutInfoActions,
        private dispatcher: ReducerManagerDispatcher,
        protected router: Router
    ) {
        super(router);
        this.el = elementRef.nativeElement;
    }

    ngOnInit() {
        this.subscribe();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    onRouteChanged() {
        this.buildModuleFromRoute();
    }

    private subscribe() {
        
    }

    public savePanel() {

    }   

    public propertiesChange(event) {
        //const widgetPropertiesStateModel: WidgetPropertiesStateModel = new WidgetPropertiesStateModel({
        //    widgetData: this.parentData,
        //    widgetProperties: this.properties
        //});

        //this.onChange.emit(widgetPropertiesStateModel);
    }

    public propertiesApply(event) {
        // this.onApply.emit(this.parentData);
    }
}
