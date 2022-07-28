/*!
    *
    * Wijmo Library 5.20201.680
    * http://wijmo.com/
    *
    * Copyright(c) GrapeCity, Inc.  All rights reserved.
    *
    * Licensed under the GrapeCity Commercial License.
    * sales@wijmo.com
    * wijmo.com/products/wijmo-5/license/
    *
    */
/**
* {@module wijmo.angular2.grid}
* Contains Angular 2 components for the <b>wijmo.grid</b> module.
*
* <b>wijmo.angular2.grid</b> is an external TypeScript module that can be imported to your code
* using its ambient module name. For example:
*
* <pre>&lt;p&gt;Here is a data bound FlexGrid control with four columns:&lt;/p&gt;
* &lt;wj-flex-grid [itemsSource]="data"&gt;
*   &lt;wj-flex-grid-column
*     [header]="'Country'"
*     [binding]="'country'"&gt;
*   &lt;/wj-flex-grid-column&gt;
*   &lt;wj-flex-grid-column
*     [header]="'Sales'"
*     [binding]="'sales'"&gt;
*   &lt;/wj-flex-grid-column&gt;
*   &lt;wj-flex-grid-column
*     [header]="'Expenses'"
*     [binding]="'expenses'"&gt;
*   &lt;/wj-flex-grid-column&gt;
*   &lt;wj-flex-grid-column
*     [header]="'Downloads'"
*     [binding]="'downloads'"&gt;
*   &lt;/wj-flex-grid-column&gt;
* &lt;/wj-flex-grid&gt;</pre>
*
*/
/**
 *
 */
export declare var ___keepComment: any;
import { EventEmitter, AfterViewInit, ElementRef, Injector, ViewContainerRef, TemplateRef, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IWjComponentMetadata, IWjComponentMeta } from 'wijmo/wijmo.angular2.directiveBase';
import * as ngCore from '@angular/core';
import * as wjcGrid from 'wijmo/wijmo.grid';
import * as wjcInteropGrid from 'wijmo/wijmo.interop.grid';
/**
 * Represents a cell template types enumeration.
 */
export import CellTemplateType = wjcInteropGrid.GridCellTemplateType;
declare var wjFlexGridMeta: IWjComponentMeta;
export { wjFlexGridMeta };
/**
 * Angular 2 component for the {@link wijmo.grid.FlexGrid} control.
 *
 * Use the <b>wj-flex-grid</b> component to add <b>FlexGrid</b> controls to your
 * Angular 2 applications. For details about Angular 2 markup syntax, see
 * <a href="/wijmo/docs/GettingStarted/Angular-Components">Angular 2 Markup</a>. For example:
 *
 * <pre>&lt;p&gt;Here is a data bound FlexGrid control with four columns:&lt;/p&gt;
 * &lt;wj-flex-grid [itemsSource]="data"&gt;
 *   &lt;wj-flex-grid-column
 *     [header]="'Country'"
 *     [binding]="'country'"&gt;
 *   &lt;/wj-flex-grid-column&gt;
 *   &lt;wj-flex-grid-column
 *     [header]="'Sales'"
 *     [binding]="'sales'"&gt;
 *   &lt;/wj-flex-grid-column&gt;
 *   &lt;wj-flex-grid-column
 *     [header]="'Expenses'"
 *     [binding]="'expenses'"&gt;
 *   &lt;/wj-flex-grid-column&gt;
 *   &lt;wj-flex-grid-column
 *     [header]="'Downloads'"
 *     [binding]="'downloads'"&gt;
 *   &lt;/wj-flex-grid-column&gt;
 * &lt;/wj-flex-grid&gt;</pre>
 *

 * The <b>WjFlexGrid</b> component is derived from the <b>FlexGrid</b> control and
 * inherits all its properties, events and methods.
 * The following properties are not available for binding in templates:
 * <b>scrollPosition</b>, <b>selection</b> and <b>columnLayout</b> properties.
 *
 * The <b>wj-flex-grid</b> component may contain the following child components:
 * {@link wijmo.angular2.grid.detail.WjFlexGridDetail}
 * , {@link wijmo.angular2.grid.filter.WjFlexGridFilter}
 * , {@link wijmo.angular2.grid.immutable.WjImmutabilityProvider}
 * , {@link wijmo.angular2.grid.WjFlexGridColumn}
 *  and {@link wijmo.angular2.grid.WjFlexGridCellTemplate}.
*/
export declare class WjFlexGrid extends wjcGrid.FlexGrid implements OnInit, OnDestroy, AfterViewInit {
    cdRef: ChangeDetectorRef;
    static readonly meta: IWjComponentMetadata;
    private _wjBehaviour;
    /**
     * Indicates whether the component has been initialized by Angular.
     * Changes its value from false to true right before triggering the <b>initialized</b> event.
     */
    isInitialized: boolean;
    /**
     * This event is triggered after the component has been initialized by Angular, that is
     * all bound properties have been assigned and child components (if any) have been initialized.
     */
    initialized: EventEmitter<any>;
    /**
     * Defines a name of a property represented by [(ngModel)] directive (if specified).
     * Default value is ''.
     */
    wjModelProperty: string;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>gotFocus</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>gotFocus</b> Wijmo event name.
     */
    gotFocusNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>lostFocus</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>lostFocus</b> Wijmo event name.
     */
    lostFocusNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>refreshing</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>refreshing</b> Wijmo event name.
     */
    refreshingNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>refreshed</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>refreshed</b> Wijmo event name.
     */
    refreshedNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>beginningEdit</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>beginningEdit</b> Wijmo event name.
     */
    beginningEditNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>cellEditEnded</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>cellEditEnded</b> Wijmo event name.
     */
    cellEditEndedNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>cellEditEnding</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>cellEditEnding</b> Wijmo event name.
     */
    cellEditEndingNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>prepareCellForEdit</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>prepareCellForEdit</b> Wijmo event name.
     */
    prepareCellForEditNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>formatItem</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>formatItem</b> Wijmo event name.
     */
    formatItemNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>resizingColumn</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>resizingColumn</b> Wijmo event name.
     */
    resizingColumnNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>resizedColumn</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>resizedColumn</b> Wijmo event name.
     */
    resizedColumnNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>autoSizingColumn</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>autoSizingColumn</b> Wijmo event name.
     */
    autoSizingColumnNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>autoSizedColumn</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>autoSizedColumn</b> Wijmo event name.
     */
    autoSizedColumnNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>draggingColumn</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>draggingColumn</b> Wijmo event name.
     */
    draggingColumnNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>draggingColumnOver</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>draggingColumnOver</b> Wijmo event name.
     */
    draggingColumnOverNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>draggedColumn</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>draggedColumn</b> Wijmo event name.
     */
    draggedColumnNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>sortingColumn</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>sortingColumn</b> Wijmo event name.
     */
    sortingColumnNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>sortedColumn</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>sortedColumn</b> Wijmo event name.
     */
    sortedColumnNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>pinningColumn</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>pinningColumn</b> Wijmo event name.
     */
    pinningColumnNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>pinnedColumn</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>pinnedColumn</b> Wijmo event name.
     */
    pinnedColumnNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>resizingRow</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>resizingRow</b> Wijmo event name.
     */
    resizingRowNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>resizedRow</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>resizedRow</b> Wijmo event name.
     */
    resizedRowNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>autoSizingRow</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>autoSizingRow</b> Wijmo event name.
     */
    autoSizingRowNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>autoSizedRow</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>autoSizedRow</b> Wijmo event name.
     */
    autoSizedRowNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>draggingRow</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>draggingRow</b> Wijmo event name.
     */
    draggingRowNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>draggingRowOver</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>draggingRowOver</b> Wijmo event name.
     */
    draggingRowOverNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>draggedRow</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>draggedRow</b> Wijmo event name.
     */
    draggedRowNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>deletingRow</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>deletingRow</b> Wijmo event name.
     */
    deletingRowNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>deletedRow</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>deletedRow</b> Wijmo event name.
     */
    deletedRowNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>loadingRows</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>loadingRows</b> Wijmo event name.
     */
    loadingRowsNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>loadedRows</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>loadedRows</b> Wijmo event name.
     */
    loadedRowsNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>rowEditStarting</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>rowEditStarting</b> Wijmo event name.
     */
    rowEditStartingNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>rowEditStarted</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>rowEditStarted</b> Wijmo event name.
     */
    rowEditStartedNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>rowEditEnding</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>rowEditEnding</b> Wijmo event name.
     */
    rowEditEndingNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>rowEditEnded</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>rowEditEnded</b> Wijmo event name.
     */
    rowEditEndedNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>rowAdded</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>rowAdded</b> Wijmo event name.
     */
    rowAddedNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>groupCollapsedChanged</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>groupCollapsedChanged</b> Wijmo event name.
     */
    groupCollapsedChangedNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>groupCollapsedChanging</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>groupCollapsedChanging</b> Wijmo event name.
     */
    groupCollapsedChangingNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>itemsSourceChanging</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>itemsSourceChanging</b> Wijmo event name.
     */
    itemsSourceChangingNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>itemsSourceChanged</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>itemsSourceChanged</b> Wijmo event name.
     */
    itemsSourceChangedNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>selectionChanging</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>selectionChanging</b> Wijmo event name.
     */
    selectionChangingNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>selectionChanged</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>selectionChanged</b> Wijmo event name.
     */
    selectionChangedNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>scrollPositionChanged</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>scrollPositionChanged</b> Wijmo event name.
     */
    scrollPositionChangedNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>updatingView</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>updatingView</b> Wijmo event name.
     */
    updatingViewNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>updatedView</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>updatedView</b> Wijmo event name.
     */
    updatedViewNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>updatingLayout</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>updatingLayout</b> Wijmo event name.
     */
    updatingLayoutNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>updatedLayout</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>updatedLayout</b> Wijmo event name.
     */
    updatedLayoutNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>pasting</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>pasting</b> Wijmo event name.
     */
    pastingNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>pasted</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>pasted</b> Wijmo event name.
     */
    pastedNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>pastingCell</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>pastingCell</b> Wijmo event name.
     */
    pastingCellNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>pastedCell</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>pastedCell</b> Wijmo event name.
     */
    pastedCellNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>copying</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>copying</b> Wijmo event name.
     */
    copyingNg: EventEmitter<any>;
    /**
     * Angular (EventEmitter) version of the Wijmo <b>copied</b> event for programmatic access.
     * Use this event name if you want to subscribe to the Angular version of the event in code.
     * In template bindings use the conventional <b>copied</b> Wijmo event name.
     */
    copiedNg: EventEmitter<any>;
    constructor(elRef: ElementRef, injector: Injector, parentCmp: any, cdRef: ChangeDetectorRef);
    /**
     * If you create a custom component inherited from a Wijmo component, you can override this
     * method and perform necessary initializations that you usually do in a class constructor.
     * This method is called in the last line of a Wijmo component constructor and allows you
     * to not declare your custom component's constructor at all, thus preventing you from a necessity
     * to maintain constructor parameters and keep them in synch with Wijmo component's constructor parameters.
     */
    created(): void;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    addEventListener(target: EventTarget, type: string, fn: any, capture?: boolean): void;
    _edtFocus: boolean;
    startEditing(fullEdit?: boolean, r?: number, c?: number, focus?: boolean, evt?: any): boolean;
    onCellEditEnding(e: wjcGrid.CellEditEndingEventArgs): boolean;
}
declare var wjFlexGridColumnMeta: IWjComponentMeta;
export { wjFlexGridColumnMeta };
/**
 * Angular 2 component for the {@link wijmo.grid.Column} control.
 *
 * The <b>wj-flex-grid-column</b> component must be
 * contained in a {@link wijmo.angular2.grid.WjFlexGrid} component.
 *
 * Use the <b>wj-flex-grid-column</b> component to add <b>Column</b> controls to your
 * Angular 2 applications. For details about Angular 2 markup syntax, see
 * <a href="/wijmo/docs/GettingStarted/Angular-Components">Angular 2 Markup</a>.
 *
* The <b>WjFlexGridColumn</b> component is derived from the <b>Column</b> control and
 * inherits all its properties, events and methods.
 *
 * The <b>wj-flex-grid-column</b> component may contain a {@link wijmo.angular2.grid.WjFlexGridCellTemplate} child directive.
*/
export declare class WjFlexGridColumn extends wjcGrid.Column implements OnInit, OnDestroy, AfterViewInit {
    cdRef: ChangeDetectorRef;
    static readonly meta: IWjComponentMetadata;
    private _wjBehaviour;
    /**
     * Indicates whether the component has been initialized by Angular.
     * Changes its value from false to true right before triggering the <b>initialized</b> event.
     */
    isInitialized: boolean;
    /**
     * This event is triggered after the component has been initialized by Angular, that is
     * all bound properties have been assigned and child components (if any) have been initialized.
     */
    initialized: EventEmitter<any>;
    /**
     * Gets or sets a name of a property that this component is assigned to.
     * Default value is 'columns'.
     */
    wjProperty: string;
    /**
     * Allows you to override the global <b>WjOptions.asyncBindings</b> setting for this specific component.
     * See the <b>WjOptions.</b>{@link WjOptions.asyncBindings} property description for details.
     */
    asyncBindings: boolean;
    isSelectedChangePC: EventEmitter<any>;
    constructor(elRef: ElementRef, injector: Injector, parentCmp: any, cdRef: ChangeDetectorRef);
    /**
     * If you create a custom component inherited from a Wijmo component, you can override this
     * method and perform necessary initializations that you usually do in a class constructor.
     * This method is called in the last line of a Wijmo component constructor and allows you
     * to not declare your custom component's constructor at all, thus preventing you from a necessity
     * to maintain constructor parameters and keep them in synch with Wijmo component's constructor parameters.
     */
    created(): void;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
}
/**
* Angular 2 directive for the {@link FlexGrid} cell templates.
*
* The <b>wjFlexGridCellTemplate</b> directive defines a template for a certain
* cell type in {@link FlexGrid}. The template should be defined on a <b>&lt;ng-template&gt;</b> element
* and must contain a <b>cellType</b> attribute that
* specifies the {@link wijmo.angular2.grid.CellTemplateType}. Depending on the template's cell type,
* the <b>&lt;ng-template&gt;</b> element with the <b>wjFlexGridCellTemplate</b> directive must be a child
* of either {@link wijmo.angular2.grid.WjFlexGrid}
* or {@link wijmo.angular2.grid.WjFlexGridColumn} components.
*
* Column-specific cell templates must be contained in <b>wj-flex-grid-column</b>
* components, and cells that are not column-specific (like row header or top left cells)
* must be contained in the <b>wj-flex-grid</b> component.
*
* The <b>&lt;ng-template&gt;</b> element with the <b>wjFlexGridCellTemplate</b> directive
* may contain an arbitrary HTML fragment with Angular 2 interpolation expressions and
* other components and directives.
*
* Bindings in HTML fragment can use the <b>cell</b> local template variable containing the cell context object,
* with <b>col</b>, <b>row</b>, and <b>item</b> properties that refer to the {@link Column},
* {@link Row}, and <b>Row.dataItem</b> objects pertaining to the cell.
*
* For cell types like <b>Group</b> and <b>CellEdit</b>, an additional <b>value</b>
* property containing an unformatted cell value is provided. For example, here is a
* {@link FlexGrid} control with templates for row header cells and, regular
* and column header cells of the Country column:
*
* ```typescript
* // component.ts
* import * as wjGrid from 'wijmo/wijmo.angular2.grid';
*
* @Component({
*     templateUrl: './component.html',
*     selector: 'my-cmp',
* })
* export class MyCmp {
*     data: any[];
* }
* ```
* ```html
* <!-- component.html -->
* <wj-flex-grid [itemsSource]="data">
*   <ng-template wjFlexGridCellTemplate [cellType]="'RowHeader'" let-cell="cell">
*     {{cell.row.index}}
*   </ng-template>
*   <ng-template wjFlexGridCellTemplate [cellType]="'RowHeaderEdit'">
*     ...
*   </ng-template>
*
*   <wj-flex-grid-column [header]="'Country'" [binding]="'country'">
*     <ng-template wjFlexGridCellTemplate [cellType]="'ColumnHeader'" let-cell="cell">
*       <img src="resources/globe.png" />
*         {{cell.col.header}}
*     </ng-template>
*     <ng-template wjFlexGridCellTemplate [cellType]="'Cell'" let-cell="cell">
*       <img src="resources/{{cell.item.country}}.png" />
*       {{cell.item.country}}
*     </ng-template>
*   </wj-flex-grid-column>
*   <wj-flex-grid-column [header]="'Sales'" [binding]="'sales'"></wj-flex-grid-column>
* </wj-flex-grid>
* ```
*
* The <b>cellType</b> attribute takes any of the following enumerated values:
*
* <b>Cell</b>
*
* Defines a regular (data) cell template. Must be a child of the {@link wijmo.angular2.grid.WjFlexGridColumn} component.
* For example, this cell template shows flags in the cells of Country column:
*
* ```html
* <wj-flex-grid-column [header]="'Country'" [binding]="'country'">
*   <ng-template wjFlexGridCellTemplate [cellType]="'Cell'" let-cell="cell">
*     <img src="resources/{{cell.item.country}}.png" />
*     {{cell.item.country}}
*   </ng-template>
* </wj-flex-grid-column>
* ```
*
* If <b>Group</b> template is not provided for a hierarchical {@link FlexGrid} (that is, one with the <b>childItemsPath</b> property
* specified), non-header cells in group rows of
* this {@link Column} also use this template.
*
* <b>CellEdit</b>
*
* Defines a template for a cell in edit mode. Must be a child of the {@link wijmo.angular2.grid.WjFlexGridColumn} component.
* This cell type has an additional <b>cell.value</b> property available for binding. It contains the
* original cell value before editing, and the updated value after editing.

* For example, here is a template that uses the Wijmo {@link InputNumber} control as an editor
* for the "Sales" column:
*
* ```html
* <wj-flex-grid-column [header]="'Sales'" [binding]="'sales'">
*   <ng-template wjFlexGridCellTemplate [cellType]="'CellEdit'">
*     <wj-input-number [(value)]="cell.value" [step]="1"></wj-input-number>
*   </ng-template>
* </wj-flex-grid-column>
* ```
*
* <b>ColumnHeader</b>
*
* Defines a template for a column header cell. Must be a child of the {@link wijmo.angular2.grid.WjFlexGridColumn} component.
* For example, this template adds an image to the header of the "Country" column:
*
* ```html
* <wj-flex-grid-column [header]="'Country'" [binding]="'country'">
*   <ng-template wjFlexGridCellTemplate [cellType]="'ColumnHeader'" let-cell="cell">
*     <img src="resources/globe.png" />
*       {{cell.col.header}}
*   </ng-template>
* </wj-flex-grid-column>
* ```
*
* <b>RowHeader</b>
*
* Defines a template for a row header cell. Must be a child of the {@link wijmo.angular2.grid.WjFlexGrid} component.
* For example, this template shows row indices in the row headers:
*
* ```html
* <wj-flex-grid [itemsSource]="data">
*   <ng-template wjFlexGridCellTemplate [cellType]="'RowHeader'" let-cell="cell">
*     {{cell.row.index + 1}}
*   </ng-template>
* </wj-flex-grid>
* ```
*
* Note that this template is applied to a row header cell, even if it is in a row that is
* in edit mode. In order to provide an edit-mode version of a row header cell with alternate
* content, define the <b>RowHeaderEdit</b> template.
*
* <b>RowHeaderEdit</b>
*
* Defines a template for a row header cell in edit mode. Must be a child of the
* {@link wijmo.angular2.grid.WjFlexGrid} component. For example, this template shows dots in the header
* of rows being edited:
*
* ```html
* <wj-flex-grid [itemsSource]="data">
*   <ng-template wjFlexGridCellTemplate [cellType]="'RowHeaderEdit'">
*     ...
*   </ng-template>
* </wj-flex-grid>
* ```
*
* Use the following <b>RowHeaderEdit</b> template to add the standard edit-mode indicator to cells where the <b>RowHeader</b> template
* applies:
*
* ```html
* <wj-flex-grid [itemsSource]="data">
*   <ng-template wjFlexGridCellTemplate [cellType]="'RowHeaderEdit'">
*     {{&amp;#x270e;}}
*   </ng-template>
* </wj-flex-grid>
* ```
*
* <b>TopLeft</b>
*
* Defines a template for the top left cell. Must be a child of the {@link wijmo.angular2.grid.WjFlexGrid} component.
* For example, this template shows a down/right glyph in the top-left cell of the grid:
*
* ```html
* <wj-flex-grid [itemsSource]="data">
*   <ng-template wjFlexGridCellTemplate [cellType]="'TopLeft'">
*     <span class="wj-glyph-down-right"></span>
*   </ng-template>
* </wj-flex-grid>
* ```
*
* <b>GroupHeader</b>
*
* Defines a template for a group header cell in a {@link GroupRow}, Must be a child of the {@link wijmo.angular2.grid.WjFlexGridColumn} component.
*
* The <b>cell.row</b> property contains an instance of the <b>GroupRow</b> class. If the grouping comes
* from {@link CollectionView}, the <b>cell.item</b> property references the {@link CollectionViewGroup} object.
*
* For example, this template uses a checkbox element as an expand/collapse toggle:
*
* ```html
* <wj-flex-grid-column [header]="'Country'" [binding]="'country'">
*   <ng-template wjFlexGridCellTemplate [cellType]="'GroupHeader'" let-cell="cell">
*     <input type="checkbox" [(ngModel)]="cell.row.isCollapsed"/>
*     {{cell.item.name}} ({{cell.item.items.length}} items)
*   </ng-template>
* </wj-flex-grid-column>
* ```
*
* <b>Group</b>
*
* Defines a template for a regular cell (not a group header) in a {@link GroupRow}. Must be a child of the
* {@link wijmo.angular2.grid.WjFlexGridColumn} component. This cell type has an additional <b>cell.value</b> property available for
* binding. In cases where columns have the <b>aggregate</b> property specified, it contains the unformatted
* aggregate value.
*
* For example, this template shows aggregate's value and kind for group row cells in the "Sales"
* column:
*
* ```html
* <wj-flex-grid-column [header]="'Sales'" [binding]="'sales'" [aggregate]="'Avg'">
*   <ng-template wjFlexGridCellTemplate [cellType]="'Group'" let-cell="cell">
*     Average: {{cell.value | number:'1.0-0'}}
*   </ng-template>
* </wj-flex-grid-column>
* ```
*
* <b>ColumnFooter</b>
*
* Defines a template for a regular cell in a <b>columnFooters</b> panel. Must be a child of the
* {@link wijmo.angular2.grid.WjFlexGridColumn} component. This cell type has an additional <b>cell.value</b>
* property available for binding that contains a cell value.
*
* For example, this template shows aggregate's value and kind for a footer cell in the "Sales"
* column:
*
* ```html
* <wj-flex-grid-column [header]="'Sales'" [binding]="'sales'" [aggregate]="'Avg'">
*   <ng-template wjFlexGridCellTemplate [cellType]="'ColumnFooter'" let-cell="cell">
*     Average: {{cell.value | number:'1.0-0'}}
*   </ng-template>
* </wj-flex-grid-column>
* ```
*
* <b>BottomLeft</b>
*
* Defines a template for the bottom left cells (at the intersection of the row header and column footer cells).
* Must be a child of the {@link wijmo.angular2.grid.WjFlexGrid} component.
* For example, this template shows a sigma glyph in the bottom-left cell of the grid:
*
* ```html
* <wj-flex-grid [itemsSource]="data">
*   <ng-template wjFlexGridCellTemplate [cellType]="'BottomLeft'">
*     &amp;#931;
*   </ng-template>
* </wj-flex-grid>
* ```
*
* <b>NewCellTemplate</b>
*
* Defines a cell in a new row template. Must be a child of the {@link wijmo.angular2.grid.WjFlexGridColumn} component.
* Note that the <b>cell.item</b> property is undefined for this type of a cell.
* For example, this cell template shows a placeholder in the Date column's cell in the "new row" item:
*
* ```html
* <wj-flex-grid-column [header]="'Date'" [binding]="'date'">
*   <ng-template wjFlexGridCellTemplate [cellType]="'NewCellTemplate'">
*     Enter a date here
*   </ng-template>
* </wj-flex-grid-column>
* ```
*/
export declare class WjFlexGridCellTemplate implements ngCore.OnInit, ngCore.OnDestroy {
    viewContainerRef: ViewContainerRef;
    templateRef: TemplateRef<any>;
    elRef: ElementRef;
    cdRef: ChangeDetectorRef;
    wjFlexGridCellTemplate: any;
    cellTypeStr: string;
    /**
    * Defines the <b>style.overflow</b> property value for cells.
    */
    cellOverflow: string;
    /**
    * Defines the type of cell to which the template is applied. String enum member
    * names can be used to specify the property value as well.
    */
    cellType: CellTemplateType;
    valuePaths: Object;
    /**
    * Gets or sets a value indicating whether the cell template will increase grid's default row height
    * to accomodate cells content. Defaults to true.
    */
    autoSizeRows: boolean;
    /**
    * For cell edit templates, indicates whether cell editing forcibly starts in full edit mode,
    * regardless of how the editing was initiated. In full edit mode pressing cursor keys don't finish editing.
    * Defaults to true.
    */
    forceFullEdit: boolean;
    grid: WjFlexGrid;
    column: WjFlexGridColumn;
    ownerControl: any;
    constructor(viewContainerRef: ViewContainerRef, templateRef: TemplateRef<any>, elRef: ElementRef, parentCmp: any, injector: Injector, cdRef: ChangeDetectorRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    _instantiateTemplate(parent: HTMLElement, dataContext: any): {
        viewRef: ngCore.EmbeddedViewRef<any>;
        rootElement: Element;
    };
    private _attachToControl;
}
export declare class WjGridModule {
}
