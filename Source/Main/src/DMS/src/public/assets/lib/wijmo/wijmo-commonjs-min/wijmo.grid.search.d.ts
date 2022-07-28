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
 * {@module wijmo.grid.search}
 * Extension that includes the {@link FlexGridSearch} control, which provides
 * full-text search/filter/highlight services for {@link FlexGrid} controls.
 */
/**
 *
 */
export declare var ___keepComment: any;
import { Control } from 'wijmo/wijmo';
import { FlexGrid } from 'wijmo/wijmo.grid';
/**
 * The {@link FlexGridSearch} control allows users to quickly search the
 * items displayed in a {@link FlexGrid}.
 *
 * The control filters the items and shows only the ones that contain
 * the text provided by the user. It also highlights the matches in
 * the target {@link FlexGrid} (except for template cells, which do
 * not support highlighing).
 *
 * The {@link FlexGridSearch} control may be used in conjunction with
 * the {@link FlexGridFilter} control, which provides column-specific
 * filtering.
 *
 * The example below shows how you can create a {@link FlexGridSearch}
 * control and connect it to a {@link FlexGrid}:
 *
 * <pre>
 * import { FlexGrid } from 'wijmo/wijmo.grid';
 * import { FlexGridSearch } from 'wijmo/wijmo.grid.search';
 *
 * // create FlexGrid
 * var grid = new FlexGrid('#gridElement');
 *
 * // create FlexGridSearch and connect it to the grid
 * var search = new FlexGridSearch('#searchElement', {
 *   grid: grid
 * });
 * </pre>
 */
export declare class FlexGridSearch extends Control {
    _tbx: HTMLInputElement;
    _btn: HTMLElement;
    private _g;
    private _view;
    private _delay;
    private _cssMatch;
    private _rxSearch;
    private _rxHighlight;
    private _toSearch;
    private _filterBnd;
    /**
     * Gets or sets the template used to instantiate {@link FlexGridSearch} controls.
     */
    static controlTemplate: string;
    /**
     * Initializes a new instance of the {@link FlexGridSearch} class.
     *
     * @param element The DOM element that hosts the control, or a selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the {@link FlexGrid} that is connected to this {@link GroupPanel}.
     *
     * Once a grid is connected to the panel, the panel displays the groups
     * defined in the grid's data source. Users can drag grid columns
     * into the panel to create new groups, drag groups within the panel to
     * re-arrange the groups, or delete items in the panel to remove the groups.
     */
    grid: FlexGrid;
    /**
     * Gets the HTML input element hosted by the control.
     *
     * Use this property in situations where you want to customize the
     * attributes of the input element.
     */
    readonly inputElement: HTMLInputElement;
    /**
     * Gets or sets the text to search for.
     *
     * The text may include multiple terms, separated by spaces.
     */
    text: string;
    /**
     * Gets or sets the delay, in milliseconds, between when a keystroke occurs
     * and when the search is performed.
     *
     * The default value for this property is <b>500</b> milliseconds.
     */
    delay: number;
    /**
     * Gets or sets the string shown as a hint when the control is empty.
     */
    placeholder: string;
    /**
     * Gets or sets the name of the CSS class used to highlight any parts
     * of the content that match the search terms.
     *
     * The default value for this property is <b>wj-state-match</b>.
     *
     * Highlighing is not supported in template cells.
     */
    cssMatch: string;
    private _formatItem;
    private _itemsSourceChanged;
    private _applySearch;
    private _filter;
    private _getItemText;
}
