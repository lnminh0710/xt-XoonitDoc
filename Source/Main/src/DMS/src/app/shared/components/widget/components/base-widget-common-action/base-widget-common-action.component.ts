import { OnInit, AfterViewInit, OnDestroy, ComponentRef, ComponentFactoryResolver, ViewContainerRef, ElementRef, Injector, Input, ViewChild, QueryList } from '@angular/core';
import { IWidgetCommonAction, FieldFilter, WidgetPropertyModel } from '../../../../../models';
import { BaseComponent } from '../../../../../pages/private/base';
import { Router } from '@angular/router';
import { PaperworkComponent } from '../paperwork';
import { Observable, BehaviorSubject } from 'rxjs';
import { PropertyPanelService } from '../../../../../services';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { ContextMenuAction } from '../../../../../models/context-menu/context-menu';

export abstract class BaseWidgetCommonAction extends BaseComponent implements IWidgetCommonAction, OnInit, AfterViewInit, OnDestroy {

    @Input() widgetProperties: WidgetPropertyModel[];


    @ViewChild(ContextMenuComponent) contextMenu: ContextMenuComponent;

    protected displayFieldsSubject = new BehaviorSubject<FieldFilter[]>([]);
    protected contextMenuSubject = new BehaviorSubject<Array<ContextMenuAction>>(null);

    protected componentFactoryResolver: ComponentFactoryResolver;
    protected propertyPanelService: PropertyPanelService;

    constructor(protected injector: Injector,
                protected containerRef: ViewContainerRef,
                protected router: Router) {
        super(router);
        this.componentFactoryResolver = injector.get(ComponentFactoryResolver);
        this.propertyPanelService = injector.get(PropertyPanelService);
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        super.onDestroy();
    }

    ngAfterViewInit() {

    }

    abstract resetWidget();

    abstract filterDisplayFields(displayFields: Array<FieldFilter>);

    //Optional
    public getCustomHTMLPrinting() {
        return '';
    }

    public printWidget() {
        const factory = this.componentFactoryResolver.resolveComponentFactory(PaperworkComponent);
        var componentRef: ComponentRef<PaperworkComponent> = this.containerRef.createComponent(factory);
        const paperworkComponent: PaperworkComponent = componentRef.instance;
        const customHTML = this.getCustomHTMLPrinting();
        const htmlPrinting = customHTML ? customHTML : this.containerRef.element.nativeElement;
        paperworkComponent.print_v2(htmlPrinting);
        componentRef.destroy();
    }

    public openNewWindow() {
        throw new Error("Method not implemented.");
    }

    public maximizeWidget(event: any) {
        throw new Error("Method not implemented.");
    }

    public enterNextRow() {
        throw new Error("Method not implemented.");
    }

    public enterNextColumn() {
        throw new Error("Method not implemented.");
    }

    public getDisplayFields$(): Observable<FieldFilter[]> {
        return this.displayFieldsSubject.asObservable();
    }

    public getContextMenu$(): Observable<Array<ContextMenuAction>> {
        return this.contextMenuSubject.asObservable();
    }

}
