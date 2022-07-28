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
 * {@module wijmo.grid.transposed}
 * Extension that includes the {@link TransposedGrid} control,
 * which provides extends the {@link FlexGrid} control to display
 * data using a transposed layout.
 *
 * In transposed layouts, data items are shown as columns and their
 * properties as rows. This the opposite of regular grid layouts,
 * where data items are shown as rows and their properties as columns.
 */
/**
 *
 */
export declare var ___keepComment: any;
import { EventArgs, ICollectionView, IBindingInfo, ObservableArray, NotifyCollectionChangedEventArgs } from 'wijmo/wijmo';
import { FlexGrid, Column, ColumnCollection, CellRangeEventArgs } from 'wijmo/wijmo.grid';
/**
 * Extends the {@link FlexGrid} control to display data using a transposed
 * layout, where columns represent data items and rows represent item
 * properties.
 *
 * Features based on regular (non-transposed) data sources only apply to the
 * original data source, so you can sort, filter, group, or paginate items before
 * assigning them to the {@link TransposedGrid}, but if you later change those
 * parameters, the grid will not be automatically updated.
 *
 * Also, some regular {@link FlexGrid} features are not available in the
 * {@link TransposedGrid} because they don't make sense with transposed data
 * sources.
 *
 * For example, adding or removing rows in a transposed grid would mean adding
 * or removing properties to the data items. For this reason, the {@link allowAddNew}
 * and {@link allowDelete} properties are disabled.
 *
 * Also, the {@link autoGenerateColumns} property has no effect on the
 * {@link TransposedGrid}, which has an {@link autoGenerateRows} property instead.
 */
export declare class TransposedGrid extends FlexGrid {
    protected _view: ICollectionView;
    protected _keyPrefix: string;
    protected _autoGenRows: boolean;
    protected _toRowInfo: any;
    _rowInfo: ColumnCollection;
    /**
     * Initializes a new instance of the {@link TransposedGrid} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets a value that determines whether the grid should generate
     * rows automatically based on the {@link itemsSource}.
     *
     * The default value for this property is <b>true</b>.
     */
    autoGenerateRows: boolean;
    refresh(fullUpdate?: boolean): void;
    allowAddNew: boolean;
    allowDelete: boolean;
    onRowEditEnded(e: CellRangeEventArgs): void;
    protected _getCollectionView(value: any): ICollectionView;
    _getColumnTypes(arr: any[]): IBindingInfo[];
    _copy(key: string, value: any): boolean;
    onLoadedRows(e?: EventArgs): void;
    _rowInfoChanged(): void;
    _sourceViewChanged(sender: ICollectionView, e: NotifyCollectionChangedEventArgs): void;
    _transposeItemsSource(arr: any[]): ObservableArray;
    _supportsProxies(): boolean;
    _createProxy(arr: any[], rowInfo: any, proxyKeys: string[]): any;
    _createTransposedObject(arr: any[], rowInfo: any, keyPrefix: string): {
        _arr: any[];
        _rowInfo: any;
    };
    _getRowInfo(arr: any[]): any[];
}
/**
 * This class is for internal use only.
 */
export declare class TransposedGridRow extends Column {
}
