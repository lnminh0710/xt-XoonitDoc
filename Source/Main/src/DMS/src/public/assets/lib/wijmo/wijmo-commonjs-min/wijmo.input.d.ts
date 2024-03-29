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
 * {@module wijmo.input}
 * Defines input controls for strings, numbers, dates, times, and colors.
 */
/**
 *
 */
export declare var ___keepComment: any;
import { Control, Event, EventArgs, CancelEventArgs, Binding, ICollectionView, CollectionViewGroup, _ClickRepeater, CollectionView, _MaskProvider, Rect, PopupPosition } from 'wijmo/wijmo';
import * as selfModule from 'wijmo/wijmo.input';
/**
 * The {@link InputNumber} control allows users to enter numbers.
 *
 * The control prevents users from accidentally entering invalid data and
 * formats the number as it is edited.
 *
 * Pressing the minus key reverses the sign of the value being edited,
 * regardless of cursor position.
 *
 * You may use the {@link min} and {@link max} properties to limit the range of
 * acceptable values, and the {@link step} property to provide spinner buttons
 * that increase or decrease the value with a click.
 *
 * For details about using the {@link min} and {@link max} properties, please see
 * the <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
 *
 * Use the {@link value} property to get or set the currently selected number.
 *
 * The example below creates several {@link InputNumber} controls and shows
 * the effect of using different formats.
 *
 * {@sample Input/InputNumber/Formatting/purejs Example}
 */
export declare class InputNumber extends Control {
    _tbx: HTMLInputElement;
    _btnUp: HTMLElement;
    _btnDn: HTMLElement;
    _value: number;
    _min: number;
    _max: number;
    _format: string;
    _step: number;
    _showBtn: boolean;
    _readOnly: boolean;
    _oldText: string;
    _oldValue: number;
    _composing: boolean;
    _chrDec: string;
    _chrCur: string;
    _chrNeg: string;
    _chrPls: string;
    _chrPct: string;
    _chrTho: string;
    _fmtSpc: string;
    _fmtPrc: number;
    _rxSym: RegExp;
    _rxNeg: RegExp;
    _delKey: boolean;
    _rptUp: _ClickRepeater;
    _rptDn: _ClickRepeater;
    /**
     * Gets or sets the template used to instantiate {@link InputNumber} controls.
     */
    static controlTemplate: string;
    /**
     * Initializes a new instance of the {@link InputNumber} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets the HTML input element hosted by the control.
     *
     * Use this property in situations where you want to customize the
     * attributes of the input element.
     */
    readonly inputElement: HTMLInputElement;
    /**
     * Gets or sets the "type" attribute of the HTML input element hosted by the control.
     *
     * By default, this property is set to "tel", a value that causes mobile devices to
     * show a numeric keypad that includes a negative sign and a decimal separator.
     *
     * Use this property to change the default setting if the default does not work well
     * for the current culture, device, or application. In those cases, try changing
     * the value to "number" or "text."
     *
     * Note that input elements with type "number" prevent selection in Chrome and
     * therefore that type is not recommended. For more details, see this link:
     * https://stackoverflow.com/questions/21177489/selectionstart-selectionend-on-input-type-number-no-longer-allowed-in-chrome
     */
    inputType: string;
    /**
     * Gets or sets the current value of the control.
     */
    value: number;
    /**
     * Gets or sets a value indicating whether the control value must be
     * a number or whether it can be set to null (by deleting the content
     * of the control).
     *
     * The default value for this property is <b>true</b>.
     */
    isRequired: boolean;
    /**
     * Gets or sets a value that indicates whether the user can modify
     * the control value using the mouse and keyboard.
     *
     * The default value for this property is <b>false</b>.
     */
    isReadOnly: boolean;
    /**
     * Gets or sets the smallest number that the user can enter.
     *
     * For details about using the {@link min} and {@link max} properties, please see the
     * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
     */
    min: number;
    /**
     * Gets or sets the largest number that the user can enter.
     *
     * For details about using the {@link min} and {@link max} properties, please see the
     * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
     */
    max: number;
    /**
     * Gets or sets the amount to add or subtract to the {@link value} property
     * when the user clicks the spinner buttons.
     */
    step: number;
    /**
     * Gets or sets the format used to display the number being edited (see {@link Globalize}).
     *
     * The format string is expressed as a .NET-style
     * <a href="https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-numeric-format-strings" target="_blank">
     * standard numeric format string</a>.
     */
    format: string;
    /**
     * Gets or sets the text shown in the control.
     */
    text: string;
    /**
     * Gets or sets the string shown as a hint when the control is empty.
     */
    placeholder: string;
    /**
     * Gets or sets a value indicating whether the control displays spinner buttons
     * to increment or decrement the value (the step property must be set to a
     * value other than zero).
     *
     * The default value for this property is <b>true</b>.
     */
    showSpinner: boolean;
    /**
     * Gets or sets a value that determines whether the spinner buttons
     * should act as repeat buttons, firing repeatedly as long as the
     * button remains pressed.
     *
     * The default value for this property is <b>true</b>.
     */
    repeatButtons: boolean;
    /**
     * Sets the focus to the control and selects all its content.
     */
    selectAll(): void;
    /**
     * Returns a value within the range defined by the {@link min} and {@link max}
     * properties.
     *
     * @param value Value to clamp.
     */
    clamp(value: number): number;
    /**
     * Occurs when the value of the {@link text} property changes.
     */
    readonly textChanged: Event<selfModule.InputNumber, EventArgs>;
    /**
     * Raises the {@link textChanged} event.
     */
    onTextChanged(e?: EventArgs): void;
    /**
     * Occurs when the value of the {@link value} property changes, either
     * as a result of user actions or by assignment in code.
     */
    readonly valueChanged: Event<any, EventArgs>;
    /**
     * Raises the {@link valueChanged} event.
     */
    onValueChanged(e?: EventArgs): void;
    dispose(): void;
    onGotFocus(e: EventArgs): void;
    onLostFocus(e?: EventArgs): void;
    refresh(fullUpdate?: boolean): void;
    private _updateSymbols;
    private _isNumeric;
    private _getInputRange;
    private _flipSign;
    private _getSelStartDigits;
    private _setSelStartDigits;
    private _increment;
    protected _updateBtn(): void;
    protected _setText(text: string): void;
    protected _keypress(e: KeyboardEvent): void;
    protected _keydown(e: KeyboardEvent): void;
    protected _input(): void;
    protected _clickSpinner(e: MouseEvent): void;
    protected _updateAria(): void;
}
/**
 * The {@link InputMask} control provides a way to govern what a user is allowed
 * to enter.
 *
 * The control prevents users from accidentally entering invalid data and
 * saves time by skipping over literals (such as slashes in dates) as the
 * user types.
 *
 * The mask used to validate the input is defined by the {@link InputMask.mask}
 * property, which may contain one or more of the following special
 * characters:
 *
 *  <dl class="dl-horizontal">
 *      <dt>0</dt>      <dd>Digit.</dd>
 *      <dt>9</dt>      <dd>Digit or space.</dd>
 *      <dt>#</dt>      <dd>Digit, sign, or space.</dd>
 *      <dt>L</dt>      <dd>Letter.</dd>
 *      <dt>l</dt>      <dd>Letter or space.</dd>
 *      <dt>A</dt>      <dd>Alphanumeric.</dd>
 *      <dt>a</dt>      <dd>Alphanumeric or space.</dd>
 *      <dt>.</dt>      <dd>Localized decimal point.</dd>
 *      <dt>,</dt>      <dd>Localized thousand separator.</dd>
 *      <dt>:</dt>      <dd>Localized time separator.</dd>
 *      <dt>/</dt>      <dd>Localized date separator.</dd>
 *      <dt>$</dt>      <dd>Localized currency symbol.</dd>
 *      <dt>&lt;</dt>   <dd>Converts characters that follow to lowercase.</dd>
 *      <dt>&gt;</dt>   <dd>Converts characters that follow to uppercase.</dd>
 *      <dt>|</dt>      <dd>Disables case conversion.</dd>
 *      <dt>\</dt>      <dd>Escapes any character, turning it into a literal.</dd>
 *      <dt>９ (\uff19)</dt>    <dd>DBCS Digit.</dd>
 *      <dt>Ｊ (\uff2a)</dt>    <dd>DBCS Hiragana.</dd>
 *      <dt>Ｇ (\uff27)</dt>    <dd>DBCS big Hiragana.</dd>
 *      <dt>Ｋ (\uff2b)</dt>    <dd>DBCS Katakana. </dd>
 *      <dt>Ｎ (\uff2e)</dt>    <dd>DBCS big Katakana.</dd>
 *      <dt>K</dt>              <dd>SBCS Katakana.</dd>
 *      <dt>N</dt>              <dd>SBCS big Katakana.</dd>
 *      <dt>Ｚ (\uff3a)</dt>    <dd>Any DBCS character.</dd>
 *      <dt>H</dt>              <dd>Any SBCS character.</dd>
 *      <dt>All others</dt>     <dd>Literals.</dd>
 *  </dl>
 *
 * The example below shows how you can use the {@link InputMask} control to
 * edit strings with custom formats:
 *
 * {@sample Input/InputMask/Overview Example}
 */
export declare class InputMask extends Control {
    _tbx: HTMLInputElement;
    _oldValue: string;
    _msk: _MaskProvider;
    /**
     * Gets or sets the template used to instantiate {@link InputMask} controls.
     */
    static controlTemplate: string;
    /**
     * Initializes a new instance of the {@link InputMask} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets the HTML input element hosted by the control.
     *
     * Use this property in situations where you want to customize the
     * attributes of the input element.
     */
    readonly inputElement: HTMLInputElement;
    /**
     * Gets or sets the "type" attribute of the HTML input element hosted
     * by the control.
     *
     * The default value for this property is <b>text</b>.
     */
    inputType: string;
    /**
     * Gets or sets the text currently shown in the control.
     */
    value: string;
    /**
     * Gets or sets the raw value of the control (excluding mask literals).
     *
     * The raw value of the control excludes prompt and literal characters.
     * For example, if the {@link mask} property is set to "AA-9999" and the
     * user enters the value "AB-1234", the {@link rawValue} property will
     * return "AB1234", excluding the hyphen that is part of the mask.
     */
    rawValue: string;
    /**
     * Gets or sets the mask used to validate the input as the user types.
     *
     * The mask is defined as a string with one or more of the masking
     * characters listed in the {@link InputMask} topic.
     */
    mask: string;
    /**
     * Gets or sets the symbol used to show input positions in the control.
     */
    promptChar: string;
    /**
     * Gets or sets the string shown as a hint when the control is empty.
     */
    placeholder: string;
    /**
     * Gets a value that indicates whether the mask has been completely filled.
     */
    readonly maskFull: boolean;
    /**
     * Gets or sets a value indicating whether the control value
     * must be a non-empty string.
     *
     * The default value for this property is <b>true</b>.
     */
    isRequired: boolean;
    /**
     * Gets or sets a value that indicates whether the user can modify
     * the control value using the mouse and keyboard.
     *
     * The default value for this property is <b>false</b>.
     */
    isReadOnly: boolean;
    /**
     * Sets the focus to the control and selects all its content.
     */
    selectAll(): void;
    /**
     * Occurs when the value of the {@link value} property changes, either
     * as a result of user actions or by assignment in code.
     */
    readonly valueChanged: Event<selfModule.InputMask, EventArgs>;
    /**
     * Raises the {@link valueChanged} event.
     */
    onValueChanged(e?: EventArgs): void;
    _updateState(): void;
    dispose(): void;
    refresh(fullUpdate?: boolean): void;
    onGotFocus(e: any): void;
}
/**
 * The {@link ColorPicker} control allows users to select a color by clicking
 * on panels to adjust color channels (hue, saturation, brightness, alpha).
 *
 * Use the {@link value} property to get or set the currently selected color.
 *
 * The control is used as a drop-down for the {@link InputColor} control.
 *
 * {@sample Input/InputColor/Overview/purejs Example}
 */
export declare class ColorPicker extends Control {
    _hsb: number[];
    _alpha: number;
    _value: string;
    _palette: string[];
    _eSB: HTMLElement;
    _eHue: HTMLElement;
    _eAlpha: HTMLElement;
    _cSB: HTMLElement;
    _cHue: HTMLElement;
    _cAlpha: HTMLElement;
    _ePal: HTMLElement;
    _ePreview: HTMLElement;
    _eText: HTMLElement;
    _htDown: Element;
    /**
     * Gets or sets the template used to instantiate {@link ColorPicker} controls.
     */
    static controlTemplate: string;
    static _tplCursor: string;
    /**
     * Initializes a new instance of the {@link ColorPicker} class.
     *
     * @param element The DOM element that hosts the control, or a selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets a value indicating whether the {@link ColorPicker} allows users
     * to edit the color's alpha channel (transparency).
     *
     * The default value for this property is <b>true</b>.
     */
    showAlphaChannel: boolean;
    /**
     * Gets or sets a value indicating whether the {@link ColorPicker} shows a string representation
     * of the current color.
     *
     * The default value for this property is <b>false</b>.
     */
    showColorString: boolean;
    /**
     * Gets or sets the currently selected color.
     *
     * This property defaults to 'white'.
     */
    value: string;
    /**
     * Gets or sets an array that contains the colors in the palette.
     *
     * The palette contains ten colors, represented by an array with
     * ten strings. The first two colors are usually white and black.
     */
    palette: string[];
    /**
     * Occurs when the value of the {@link value} property changes, either
     * as a result of user actions or by assignment in code.
     */
    readonly valueChanged: Event<selfModule.ColorPicker, EventArgs>;
    /**
     * Raises the {@link valueChanged} event.
     */
    onValueChanged(e?: EventArgs): void;
    protected _mouseDown(e: MouseEvent): void;
    protected _mouseMove(e: MouseEvent): void;
    protected _mouseUp(e: MouseEvent): void;
    private _updateColor;
    private _updatePalette;
    private _makePalEntry;
    private _updatePanels;
    private _getTargetPanel;
}
/**
 * The {@link CollectionViewNavigator} control provides a UI for navigating
 * through the data items or pages in a {@link CollectionView} object.
 *
 * Use the navigator's {@link cv} property to bind it to a {@link CollectionView},
 * and the {@link byPage} property to define whether the navigator should show
 * data items or pages.
 *
 * The navigator shows VCR-like buttons that allow users to select the
 * first/previous/next/last data item (or page) in the {@link CollectionView},
 * and some text showing the current index and total count.
 *
 * You may use the {@link headerFormat} property to customize the text displayed
 * by the navigator.
 */
export declare class CollectionViewNavigator extends Control {
    private _btnFirst;
    private _btnPrev;
    private _btnNext;
    private _btnLast;
    private _txtCurr;
    private _view;
    private _byPage;
    private _rptNext;
    private _rptPrev;
    private _fmt;
    /**
     * Gets or sets the template used to instantiate {@link  CollectionViewNavigator} controls.
     */
    static controlTemplate: string;
    /**
     * Initializes a new instance of the {@link CollectionViewNavigator} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the {@link CollectionView} controlled by this {@link CollectionViewNavigator}.
     */
    cv: CollectionView;
    /**
     * Gets or sets a value that determines whether this {@link CollectionViewNavigator} should
     * navigate items or pages.
     *
     * To navigate pages, the {@link CollectionView} associated with the navigator should
     * have it's {@link CollectionView.pageSize} property set to a value greater than zero.
     */
    byPage: boolean;
    /**
     * Gets or sets the format string used to display the current
     * total item/page values in the control header.
     *
     * The format string may contain the '{current}' and '{count}'
     * replacement strings, which are replaced with values that
     * depend on the value of the {@link byPage} property.
     *
     * The format string may also contain the following replacement
     * strings: '{currentItem}', '{itemCount}', '{currentPage}', and
     * '{pageCount}', which are replaced with values that do not
     * depend on the value of the {@link byPage} property.
     *
     * The default value for this property is the string
     * <b>"{current:n0} / {count:n0}"</b>.
     *
     * The control header element is an input element and contains
     * plain text (HTML is not supported).
     */
    headerFormat: string;
    /**
     * Gets or sets a value that determines whether the next/previous buttons
     * should act as repeat buttons, firing repeatedly as long as the button
     * remains pressed.
     *
     * The default value for this property is <b>true</b>.
     */
    repeatButtons: boolean;
    _update(): void;
    _currentChanged(): void;
    _collectionChanged(): void;
    _click(e: MouseEvent): void;
}
/**
 * Represents a method that formats an item for display in a
 * {@link ListBox} control.
 */
export interface IItemFormatter {
    /**
     * @param index Index of the item being formatted.
     * @param item Default text or HTML used to represent the item.
     * @returns Customized text or HTML used to represent the item.
     */
    (index: number, item: string): string;
}
/**
 * The {@link ListBox} control displays a list of items which may contain
 * plain text or HTML, and allows users to select items with the mouse
 * or the keyboard.
 *
 * Use the {@link ListBox.selectedIndex} property to determine which item
 * is currently selected.
 *
 * You can populate a {@link ListBox} using an array of strings or you can
 * use an array of objects, in which case the {@link ListBox.displayMemberPath}
 * property determines which object property is displayed on the list.
 *
 * To display items that contain HTML rather than plain text, set the
 * {@link ListBox.isContentHtml} property to true.
 *
 * The {@link ListBox} control supports the following keyboard commands:
 *
 * <table>
 *   <thead>
 *     <tr><th>Key Combination</th><th>Action</th></tr>
 *   </thead>
 *   <tbody>
 *     <tr><td>Up/Down</td><td>Select the previous/next item</td></tr>
 *     <tr><td>PageUp/Down</td><td>Select the item one page above or below the selection</td></tr>
 *     <tr><td>Home/End</td><td>Select the first/last items</td></tr>
 *     <tr><td>Space</td><td>Toggle the checkbox in the current item (see the {@link checkedMemberPath} property)</td></tr>
 *     <tr><td>Other characters</td><td>Search for items that contain the text typed (multi-character auto-search)</td></tr>
 *   </tbody>
 * </table>
 *
 * The example below creates a {@link ListBox} control and populates it using
 * a 'countries' array. The control updates its {@link ListBox.selectedIndex}
 * and {@link ListBox.selectedItem} properties as the user moves the selection.
 *
 * {@sample Input/ListBox/Overview/purejs Example}
 */
export declare class ListBox extends Control {
    _items: any;
    _cv: ICollectionView;
    _itemFormatter: IItemFormatter;
    _pathDisplay: Binding;
    _pathValue: Binding;
    _pathChecked: Binding;
    _html: boolean;
    _shGroups: boolean;
    _checkedItems: any[];
    _itemRole: string;
    _checking: boolean;
    _search: string;
    _caseSensitive: boolean;
    _toSearch: any;
    _bndDisplay: Binding;
    _fmtItemHandlers: number;
    _itemCount: number;
    /**
     * Initializes a new instance of the {@link ListBox} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the array or {@link ICollectionView} object that contains
     * the list items.
     */
    itemsSource: any;
    /**
     * Gets the {@link ICollectionView} object used as the item source.
     */
    readonly collectionView: ICollectionView;
    /**
     * Gets or sets a value that determines whether the {@link ListBox} should
     * include group header items to delimit data groups.
     *
     * Data groups are created by modifying the {@link ICollectionView.groupDescriptions}
     * property of the {@link ICollectionView} object used as an {@link itemsSource}.
     *
     * The {@link ListBox} only shows the first level of grouping.
     *
     * The default value for this property is <b>false</b>.
     */
    showGroups: boolean;
    /**
     * Gets or sets a value indicating whether items contain plain
     * text or HTML.
     *
     * The default value for this property is <b>false</b>.
     */
    isContentHtml: boolean;
    /**
     * Gets or sets a function used to customize the values shown on
     * the list.
     *
     * The function takes two arguments, the item index and the default
     * text or html, and returns the new text or html to display.
     *
     * If the formatting function needs a scope (i.e. a meaningful
     * 'this' value), then remember to set the filter using the 'bind'
     * function to specify the 'this' object. For example:
     *
     * ```typescript
     * listBox.itemFormatter = customItemFormatter.bind(this);
     * function customItemFormatter(index, content) {
     *     if (this.makeItemBold(index)) {
     *         content = '&lt;b&gt;' + content + '&lt;/b&gt;';
     *     }
     *     return content;
     * }
     * ```
     */
    itemFormatter: IItemFormatter;
    /**
     * Gets or sets the name of the property to use as the visual
     * representation of the items.
     */
    displayMemberPath: string;
    /**
     * Gets or sets the name of the property used to get the
     * {@link selectedValue} from the {@link selectedItem}.
     */
    selectedValuePath: string;
    /**
     * Gets or sets the name of the property used to control
     * check boxes placed next to each item.
     *
     * Use this property to create multi-select LisBoxes.
     *
     * When an item is checked or unchecked, the control raises the
     * {@link itemChecked} event.
     *
     * Use the {@link selectedItem} property to retrieve the item that
     * was checked or unchecked, or use the {@link checkedItems} property
     * to retrieve the list of items that are currently checked.
     */
    checkedMemberPath: string;
    /**
     * Gets or sets a value that determines whether searches performed
     * while the user types should case-sensitive.
     *
     * The default value for this property is <b>false</b>.
     */
    caseSensitiveSearch: boolean;
    /**
     * Gets or sets the value or the "role" attribute added to the
     * list items. The default value for this property is "option".
     */
    itemRole: string;
    /**
     * Gets the string displayed for the item at a given index.
     *
     * The string may be plain text or HTML, depending on the setting
     * of the {@link isContentHtml} property.
     *
     * @param index The index of the item in the {@link itemsSource}.
     */
    getDisplayValue(index: number): string;
    /**
     * Gets the text displayed for the item at a given index (as plain text).
     *
     * @param index The index of the item in the {@link itemsSource}.
     */
    getDisplayText(index: number): string;
    /**
     * Gets a value that determines whether the item at a given index is enabled.
     *
     * @param index The index of the item in the {@link itemsSource}.
     */
    isItemEnabled(index: number): boolean;
    /**
     * Gets or sets the index of the currently selected item.
     */
    selectedIndex: number;
    /**
     * Gets or sets the item that is currently selected.
     */
    selectedItem: any;
    /**
     * Gets or sets the value of the {@link selectedItem} obtained using
     * the {@link selectedValuePath}.
     */
    selectedValue: any;
    /**
     * Gets or sets the maximum height of the list (in pixels).
     */
    maxHeight: number;
    /**
     * Highlights the selected item and scrolls it into view.
     *
     * @param setFocus Whether to set the focus to the list after scrolling
     * the selected item into view.
     */
    showSelection(setFocus?: boolean): void;
    /**
     * Loads the list with items from the current {@link itemsSource}.
     */
    loadList(): void;
    /**
     * Gets the checked state of an item on the list.
     *
     * This method can be used with multi-select ListBoxes
     * (see the {@link checkedMemberPath} property).
     *
     * @param index Item index.
     */
    getItemChecked(index: number): boolean;
    /**
     * Sets the checked state of an item on the list.
     *
     * This method is applicable only on multi-select ListBoxes
     * (see the {@link checkedMemberPath} property).
     *
     * @param index Item index.
     * @param checked Item's new checked state.
     */
    setItemChecked(index: number, checked: boolean): void;
    /**
     * Toggles the checked state of an item on the list.
     * This method is applicable only to multi-select ListBoxes
     * (see the {@link checkedMemberPath} property).
     *
     * @param index Item index.
     */
    toggleItemChecked(index: number): void;
    /**
     * Gets or sets an array containing the items that are currently checked.
     */
    checkedItems: any[];
    /**
     * Gets the data index of an element within the list.
     *
     * @param e Element to search for.
     * @return The index of the element in the list, or -1 if
     * the element is not a member of the list.
     */
    indexOf(e: HTMLElement): number;
    /**
     * Occurs when the value of the {@link selectedIndex} property changes.
     */
    readonly selectedIndexChanged: Event<selfModule.ListBox, EventArgs>;
    /**
     * Raises the {@link selectedIndexChanged} event.
     */
    onSelectedIndexChanged(e?: EventArgs): void;
    /**
     * Occurs when the list of items changes.
     */
    readonly itemsChanged: Event<selfModule.ListBox, EventArgs>;
    /**
     * Raises the {@link itemsChanged} event.
     */
    onItemsChanged(e?: EventArgs): void;
    /**
     * Occurs before the list items are generated.
     */
    readonly loadingItems: Event<selfModule.ListBox, EventArgs>;
    /**
     * Raises the {@link loadingItems} event.
     */
    onLoadingItems(e?: EventArgs): void;
    /**
     * Occurs after the list items have been generated.
     */
    readonly loadedItems: Event<selfModule.ListBox, EventArgs>;
    /**
     * Raises the {@link loadedItems} event.
     */
    onLoadedItems(e?: EventArgs): void;
    /**
     * Occurs when the current item is checked or unchecked by the user.
     *
     * This event is raised when the {@link checkedMemberPath} is set to
     * the name of a property to add check boxes to each item in the control.
     *
     * Use the {@link selectedItem} property to retrieve the item that was
     * checked or unchecked.
     */
    readonly itemChecked: Event<selfModule.ListBox, EventArgs>;
    /**
     * Raises the {@link itemChecked} event.
     */
    onItemChecked(e?: EventArgs): void;
    /**
     * Occurs when the value of the {@link checkedItems} property changes.
     */
    readonly checkedItemsChanged: Event<selfModule.ListBox, EventArgs>;
    /**
     * Raises the {@link checkedItemsChanged} event.
     */
    onCheckedItemsChanged(e?: EventArgs): void;
    /**
     * Occurs when an element representing a list item has been created.
     *
     * This event can be used to format list items for display. It is similar
     * in purpose to the {@link itemFormatter} property, but has the advantage
     * of allowing multiple independent handlers.
     */
    readonly formatItem: Event<selfModule.ListBox, selfModule.FormatItemEventArgs>;
    /**
     * Raises the {@link formatItem} event.
     *
     * @param e {@link FormatItemEventArgs} that contains the event data.
     */
    onFormatItem(e: FormatItemEventArgs): void;
    /**
     * Refreshes the control.
     *
     * @param fullUpdate Whether to update the control layout as well as the content.
     */
    refresh(fullUpdate?: boolean): void;
    _getChild(index: number): HTMLElement;
    _getElementIndex(index: number): number;
    private _setItemChecked;
    private _cvCollectionChanged;
    private _cvCurrentChanged;
    private _populateList;
    _createItem(i: number): string;
    _getAriaSelected(isSelected: boolean, isChecked: boolean): boolean;
    _createHeaderItem(group: CollectionViewGroup): string;
    private _click;
    private _keydown;
    private _keypress;
    _selectNext(): boolean;
    _selectPrev(): boolean;
    _selectFirst(): boolean;
    _selectLast(): boolean;
    _selectNextPage(): boolean;
    _selectPrevPage(): boolean;
    private _findNext;
    private _getCheckbox;
    _initFromSelect(hostElement: HTMLElement): void;
}
/**
 * Provides arguments for the {@link ListBox.formatItem} event.
 */
export declare class FormatItemEventArgs extends EventArgs {
    _index: number;
    _data: any;
    _item: HTMLElement;
    /**
     * Initializes a new instance of the {@link FormatItemEventArgs} class.
     *
     * @param index Index of the item being formatted in the source {@link ICollectionView}, or -1 if the item is a group header.
     * @param data Data item being formatted, or a {@link CollectionViewGroup} object if the item is a group header.
     * @param item Element that represents the list item to be formatted.
     */
    constructor(index: number, data: any, item: HTMLElement);
    /**
     * Gets the index of the data item in the list.
     */
    readonly index: number;
    /**
     * Gets the data item being formatted.
     */
    readonly data: any;
    /**
     * Gets a reference to the element that represents the list item to be formatted.
     */
    readonly item: HTMLElement;
}
/**
 * The {@link MultiSelectListBox} control contains a {@link ListBox} with
 * a "Select All" button and a "Filter" input.
 *
 * The "Select All" and "Filter" elements can be shown or hidden using
 * the {@link showSelectAllCheckbox} and {@link showFilterInput} properties.
 *
 * The {@link MultiSelectListBox} control is used as a drop-down by the
 * {@link MultiSelect} control.
 */
export declare class MultiSelectListBox extends Control {
    _selectAll: HTMLElement;
    _filter: HTMLInputElement;
    _lbHost: HTMLElement;
    _lbx: ListBox;
    _cbSelectAll: HTMLInputElement;
    _spSelectAll: HTMLSpanElement;
    _selectAllLabel: string;
    _filterPlaceholder: string;
    _filterText: string;
    _checkOnFilter: boolean;
    _toSearch: any;
    static _DEF_CHECKED_PATH: string;
    /**
     * Gets or sets the template used to instantiate {@link MultiSelectListBox} controls.
     */
    static controlTemplate: string;
    /**
     * Initializes a new instance of the {@link MultiSelectListBox} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the array or {@link ICollectionView} object that contains
     * the list items.
     */
    itemsSource: any;
    /**
     * Gets or sets the name of the property to use as the visual
     * representation of the items.
     */
    displayMemberPath: string;
    /**
     * Gets or sets a value indicating whether items contain plain
     * text or HTML.
     *
     * The default value for this property is <b>false</b>.
     */
    isContentHtml: boolean;
    /**
     * Gets or sets a value that determines whether the {@link MultiSelectListBox} should
     * include group header items to delimit data groups.
     *
     * Data groups are created by modifying the {@link ICollectionView.groupDescriptions}
     * property of the {@link ICollectionView} object used as an {@link itemsSource}.
     *
     * The {@link MultiSelectListBox} only shows the first level of grouping.
     *
     * The default value for this property is <b>false</b>.
     */
    showGroups: boolean;
    /**
     * Gets or sets a value that determines whether the {@link MultiSelectListBox} should
     * automatically select all the filtered items when the filter text changes.
     *
     * The default value for this property is <b>true</b>.
     */
    checkOnFilter: boolean;
    /**
     * Gets a reference to the {@link ListBox} control hosted by this
     * {@link MultiSelectListBox}.
     */
    readonly listBox: ListBox;
    /**
     * Gets or sets whether the control should display a "filter" input
     * above the items to filter the items displayed.
     *
     * The default value for this property is <b>false</b>.
     */
    showFilterInput: boolean;
    /**
     * Gets or sets the string used as a placeholder for the filter input element.
     *
     * The default value for this property is null, which causes the control
     * to show a localized version of the string "Filter".
     */
    filterInputPlaceholder: string;
    /**
     * Gets or sets whether the control should display a "Select All" checkbox
     * above the items to select or de-select all items.
     *
     * The default value for this property is <b>false</b>.
     */
    showSelectAllCheckbox: boolean;
    /**
     * Gets or sets the string to be used as a label for the "Select All"
     * checkbox that is displayed when the {@link showSelectAllCheckbox}
     * property is set to true.
     *
     * The default value for this property is null, which causes the control
     * to show a localized version of the string "Select All".
     */
    selectAllLabel: string;
    /**
     * Gets or sets the name of the property used to control the checkboxes
     * placed next to each item.
     */
    checkedMemberPath: string;
    /**
     * Gets or sets an array containing the items that are currently checked.
     */
    checkedItems: any[];
    /**
     * Occurs when the value of the {@link checkedItems} property changes.
     */
    readonly checkedItemsChanged: Event<selfModule.MultiSelectListBox, EventArgs>;
    /**
     * Raises the {@link checkedItemsChanged} event.
     */
    onCheckedItemsChanged(e?: EventArgs): void;
    refresh(fullUpdate?: boolean): void;
    dispose(): void;
    _applyFilter(): void;
    _updateCheckAllCheckbox(): void;
}
/**
 * Specifies constants that define the date selection behavior.
 */
export declare enum DateSelectionMode {
    /** The user cannot change the current value using the mouse or keyboard. */
    None = 0,
    /** The user can select days. */
    Day = 1,
    /** The user can select months. */
    Month = 2
}
/**
 * Represents a method that formats a date on the {@link Calendar}
 * control.
 *
 * The method typically adds class names to the element to modify
 * its appearance.
 */
export interface IDateFormatter {
    /**
     * @param date The date value to be formatted.
     * @param element The HTMLElement that represents the date value.
     */
    (date: Date, element: HTMLElement): void;
}
/**
 * Represents a method that takes a date value as a parameter and
 * returns a boolean value that indicates the date is valid and
 * should be selectable by the user.
 */
export interface IDateValidator {
    /**
     * @param date The date value to be formatted.
     * @returns True if the date is valid and should be selectable by the user.
     */
    (date: Date): boolean;
}
/**
 * The {@link Calendar} control displays a one-month calendar and allows users
 * to select a date.
 *
 * You may use the {@link min} and {@link max} properties to restrict the range
 * of dates that the user can select.
 *
 * For details about using the {@link min} and {@link max} properties, please see the
 * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
 *
 * Use the {@link value} property to get or set the currently selected date.
 *
 * Use the {@link selectionMode} property to determine whether users should be
 * allowed to select days, months, or no values at all.
 *
 * The {@link Calendar} control supports the following keyboard commands:
 *
 * <table>
 *   <thead>
 *     <tr><th>Key Combination</th><th>Moves Selection To</th></tr>
 *   </thead>
 *   <tbody>
 *     <tr><td>Left</td><td>Previous day</td></tr>
 *     <tr><td>Right</td><td>Next day</td></tr>
 *     <tr><td>Up</td><td>Previous week</td></tr>
 *     <tr><td>Down</td><td>Next week</td></tr>
 *     <tr><td>PgUp</td><td>Previous month</td></tr>
 *     <tr><td>PgDn</td><td>Next month</td></tr>
 *     <tr><td>Alt + PgUp</td><td>Previous year</td></tr>
 *     <tr><td>Alt + PgDn</td><td>Next year</td></tr>
 *     <tr><td>Home</td><td>First valid day of the month</td></tr>
 *     <tr><td>End</td><td>Last valid day of the month</td></tr>
 *     <tr><td>Alt + End</td><td>Today's date</td></tr>
 *   </tbody>
 * </table>
 *
 *  The example below shows a
 * {@link Calendar} control that allows users to select the date with a
 * single click.
 *
 * {@sample Input/Calendar/Overview/purejs Example}
 */
export declare class Calendar extends Control {
    private _tbHdr;
    private _tbMth;
    private _tbYr;
    private _btnMth;
    private _spMth;
    private _btnPrv;
    private _btnTdy;
    private _btnNxt;
    private _lbYears;
    private _value;
    private _currMonth;
    private _firstDay;
    private _min;
    private _max;
    private _fdw;
    private _itemFormatter;
    private _itemValidator;
    private _readOnly;
    private _selMode;
    private _rptUp;
    private _rptDn;
    private _yrPicker;
    private _tmYrHidden;
    private _fmtYrMo;
    private _fmtYr;
    private _fmtDayHdr;
    private _fmtDay;
    private _fmtMonths;
    /**
     * Gets or sets the template used to instantiate {@link Calendar} controls.
     */
    static controlTemplate: string;
    /**
     * Initializes a new instance of the {@link Calendar} class.
     *
     * @param element The DOM element that hosts the control, or a selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the currently selected date.
     *
     * The default value for this property is the current date.
     */
    value: Date;
    /**
     * Gets or sets the earliest date that the user can select in the calendar.
     *
     * The default value for this property is <b>null</b>, which means no earliest
     * date is defined.
     *
     * For details about using the {@link min} and {@link max} properties, please see the
     * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
     */
    min: Date;
    /**
     * Gets or sets the latest date that the user can select in the calendar.
     *
     * The default value for this property is <b>null</b>, which means no latest
     * date is defined.
     *
     * For details about using the {@link min} and {@link max} properties, please see the
     * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
     */
    max: Date;
    /**
     * Gets or sets a value that indicates whether users can select
     * days, months, or no values at all.
     *
     * The default value for this property is <b>DateSelectionMode.Day</b>.
     */
    selectionMode: DateSelectionMode;
    /**
     * Gets or sets a value that indicates whether the user can modify
     * the control value using the mouse and keyboard.
     *
     * The default value for this property is <b>false</b>.
     */
    isReadOnly: boolean;
    /**
     * Gets or sets a value that determines whether the calendar buttons
     * should act as repeat buttons, firing repeatedly as the button
     * remains pressed.
     *
     * The default value for this property is <b>true</b>.
     */
    repeatButtons: boolean;
    /**
     * Gets or sets a value that determines whether the calendar should
     * display a list of years when the user clicks the header element
     * on the year calendar.
     *
     * The default value for this property is <b>true</b>.
     */
    showYearPicker: boolean;
    /**
     * Gets or sets a value that represents the first day of the week,
     * the one displayed in the first column of the calendar.
     *
     * Setting this property to null causes the calendar to use the default
     * for the current culture. In the English culture, the first day of the
     * week is Sunday (0); in most European cultures, the first day of the
     * week is Monday (1).
     */
    firstDayOfWeek: number;
    /**
     * Gets or sets the month displayed in the calendar.
     */
    displayMonth: Date;
    /**
     * Gets or sets the format used to display the month and year
     * above the calendar in month view.
     *
     * The default value for this property is <b>'y'</b>.
     */
    formatYearMonth: string;
    /**
     * Gets or sets the format used to display the headers
     * above the days in month view.
     *
     * The default value for this property is <b>'ddd'</b>.
     */
    formatDayHeaders: string;
    /**
     * Gets or sets the format used to display the days
     * in month view.
     *
     * The default value for this property is 'd ' (the space after the 'd'
     * prevents the format from being interpreted as 'd', the standard format
     * used to represent the short date pattern).
     */
    formatDays: string;
    /**
     * Gets or sets the format used to display the year
     * above the months in year view.
     *
     * The default value for this property is <b>'yyyy'</b>.
     */
    formatYear: string;
    /**
     * Gets or sets the format used to display the months
     * in year view.
     *
     * The default value for this property is <b>'MMM'</b>.
     */
    formatMonths: string;
    /**
     * Gets or sets a value indicating whether the control displays the header
     * area with the current month and navigation buttons.
     *
     * The default value for this property is <b>true</b>.
     */
    showHeader: boolean;
    /**
     * Gets or sets a value indicating whether the calendar displays
     * a month or a year.
     *
     * The default value for this property is <b>true</b>.
     */
    monthView: boolean;
    /**
     * Gets or sets a formatter function to customize dates in the calendar.
     *
     * The formatter function can add any content to any date. It allows
     * complete customization of the appearance and behavior of the calendar.
     *
     * If specified, the function takes two parameters:
     * <ul>
     *     <li>the date being formatted </li>
     *     <li>the HTML element that represents the date</li>
     * </ul>
     *
     * For example, the code below shows weekends with a yellow background:
     * <pre>
     * calendar.itemFormatter = function(date, element) {
     *   var day = date.getDay();
     *   element.style.backgroundColor = day == 0 || day == 6 ? 'yellow' : '';
     * }
     * </pre>
     */
    itemFormatter: IDateFormatter;
    /**
     * Gets or sets a validator function to determine whether dates are valid for selection.
     *
     * If specified, the validator function should take one parameter representing the
     * date to be tested, and should return false if the date is invalid and should not
     * be selectable.
     *
     * For example, the code below shows weekends in a disabled state and prevents users
     * from selecting those dates:
     * <pre>
     * calendar.itemValidator = function(date) {
     *   var weekday = date.getDay();
     *   return weekday != 0 && weekday != 6;
     * }
     * </pre>
     */
    itemValidator: IDateValidator;
    /**
     * Occurs when the value of the {@link value} property changes, either
     * as a result of user actions or by assignment in code.
     */
    readonly valueChanged: Event<selfModule.Calendar, EventArgs>;
    /**
     * Raises the {@link valueChanged} event.
     */
    onValueChanged(e?: EventArgs): void;
    /**
     * Occurs after the {@link displayMonth} property changes.
     */
    readonly displayMonthChanged: Event<selfModule.Calendar, EventArgs>;
    /**
     * Raises the {@link displayMonthChanged} event.
     */
    onDisplayMonthChanged(e?: EventArgs): void;
    /**
     * Occurs when an element representing a day in the calendar has been created.
     *
     * This event can be used to format calendar items for display. It is similar
     * in purpose to the {@link itemFormatter} property, but has the advantage
     * of allowing multiple independent handlers.
     *
     * For example, the code below uses the {@link formatItem} event to disable weekends
     * so they appear dimmed in the calendar:
     *
     * <pre>// disable Sundays and Saturdays
     * calendar.formatItem.addHandler(function (s, e) {
     *   var day = e.data.getDay();
     *   if (day == 0 || day == 6) {
     *     wijmo.addClass(e.item, 'wj-state-disabled');
     *   }
     * });</pre>
     */
    readonly formatItem: Event<selfModule.Calendar, selfModule.FormatItemEventArgs>;
    /**
     * Raises the {@link formatItem} event.
     *
     * @param e {@link FormatItemEventArgs} that contains the event data.
     */
    onFormatItem(e: FormatItemEventArgs): void;
    containsFocus(): boolean;
    dispose(): void;
    refresh(fullUpdate?: boolean): void;
    private _canChangeValue;
    private _valid;
    private _inValidRange;
    private _monthInValidRange;
    private _yearInValidRange;
    private _sameMonth;
    private _getValidDate;
    _clamp(value: Date): Date;
    private _createChildren;
    private _createYearPicker;
    private _createElement;
    private _click;
    private _getCellIndex;
    private _keydown;
    private _getMonth;
    private _monthMode;
    private _navigate;
}
/**
 * Specifies constants that define the action to perform when the
 * user clicks the input element in the control.
 */
export declare enum ClickAction {
    /** Selects the input element content. */
    Select = 0,
    /** Open the drop-down. */
    Open = 1,
    /** Toggle the drop-down. */
    Toggle = 2
}
/**
 * DropDown control (abstract).
 *
 * Contains an input element and a button used to show or hide the drop-down.
 *
 * Derived classes must override the _createDropDown method to create whatever
 * editor they want to show in the drop down area (a list of items, a calendar,
 * a color editor, etc).
 */
export declare class DropDown extends Control {
    _tbx: HTMLInputElement;
    _elRef: HTMLElement;
    _btn: HTMLElement;
    _dropDown: HTMLElement;
    _clickAction: selfModule.ClickAction;
    _showBtn: boolean;
    _autoExpand: boolean;
    _animate: boolean;
    _cssClass: string;
    _oldText: string;
    _minWidthDropdown: string;
    _setFocus: boolean;
    /**
     * Gets or sets the template used to instantiate {@link DropDown} controls.
     */
    static controlTemplate: string;
    /**
     * Initializes a new instance of the {@link DropDown} class.
     *
     * @param element The DOM element that hosts the control, or a selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the text shown on the control.
     */
    text: string;
    /**
     * Gets the HTML input element hosted by the control.
     *
     * Use this property in situations where you want to customize the
     * attributes of the input element.
     */
    readonly inputElement: HTMLInputElement;
    /**
     * Gets or sets the "type" attribute of the HTML input element hosted
     * by the control.
     *
     * The default value for this property is <b>text</b>.
     */
    inputType: string;
    /**
     * Gets or sets a value that indicates whether the user can modify
     * the control value using the mouse and keyboard.
     *
     * The default value for this property is <b>false</b>.
     */
    isReadOnly: boolean;
    /**
     * Gets or sets a value that determines whether the control value must be
     * set to a non-null value or whether it can be set to null
     * (by deleting the content of the control).
     *
     * This property defaults to true for most controls, including {@link ComboBox},
     * {@link InputDate}, {@link InputTime}, {@link InputDateTime}, and {@link InputColor}.
     * It defaults to false for the {@link AutoComplete} control.
     */
    isRequired: boolean;
    /**
     * Gets or sets the string shown as a hint when the control is empty.
     */
    placeholder: string;
    /**
     * Gets or sets a value that specifies the action to perform when the
     * user clicks the input element in the control.
     *
     * For most drop-down controls, this property is set to {@link ClickAction.Select}
     * by default. This setting allows users to select portions of the text with the mouse.
     *
     * For drop-down controls that display non-editable text (such as the {@link MultiSelect}),
     * this property is set to {@link ClickAction.Toggle} by default.
     */
    clickAction: ClickAction;
    /**
     * Gets or sets a value that indicates whether the drop down is currently
     * visible.
     *
     * The default value for this property is <b>false</b>.
     */
    isDroppedDown: boolean;
    /**
     * Gets the drop down element shown when the {@link isDroppedDown}
     * property is set to true.
     */
    readonly dropDown: HTMLElement;
    /**
     * Gets or sets a CSS class name to add to the control's drop-down element.
     *
     * This property is useful when styling the drop-down element, because it is
     * shown as a child of the document body rather than as a child of the control
     * itself, which prevents using CSS selectors based on the parent control.
     */
    dropDownCssClass: string;
    /**
     * Gets or sets a value that indicates whether the control should
     * display a drop-down button.
     *
     * The default value for this property is <b>true</b>.
     */
    showDropDownButton: boolean;
    /**
     * Gets or sets a value that indicates whether the control should
     * automatically expand the selection to whole words/numbers when
     * the control is clicked.
     *
     * The default value for this property is <b>true</b>.
     */
    autoExpandSelection: boolean;
    /**
     * Gets or sets a value that indicates whether the control should use a fade-in animation
     * when displaying the drop-down.
     *
     * The default value for this property is <b>false</b>.
     */
    isAnimated: boolean;
    /**
     * Sets the focus to the control and selects all its content.
     */
    selectAll(): void;
    /**
     * Occurs when the value of the {@link text} property changes.
     */
    readonly textChanged: Event<selfModule.DropDown, EventArgs>;
    /**
     * Raises the {@link textChanged} event.
     */
    onTextChanged(e?: EventArgs): void;
    /**
     * Occurs before the drop down is shown or hidden.
     */
    readonly isDroppedDownChanging: Event<selfModule.DropDown, CancelEventArgs>;
    /**
     * Raises the {@link isDroppedDownChanging} event.
     */
    onIsDroppedDownChanging(e: CancelEventArgs): boolean;
    /**
     * Occurs after the drop down is shown or hidden.
     */
    readonly isDroppedDownChanged: Event<selfModule.DropDown, EventArgs>;
    /**
     * Raises the {@link isDroppedDownChanged} event.
     */
    onIsDroppedDownChanged(e?: EventArgs): void;
    onGotFocus(e?: EventArgs): void;
    onLostFocus(e?: EventArgs): void;
    containsFocus(): boolean;
    dispose(): void;
    refresh(fullUpdate?: boolean): void;
    _handleResize(): void;
    protected _dropDownClick(e: MouseEvent): void;
    private _expandSelection;
    private _getCharType;
    protected _keydown(e: KeyboardEvent): void;
    protected _btnclick(e: MouseEvent): void;
    protected _setText(text: string, fullMatch: boolean): void;
    protected _updateBtn(): void;
    protected _createDropDown(): void;
    protected _commitText(): void;
    protected _updateDropDown(): void;
}
/**
 * Specifies actions that trigger showing and hiding {@link Popup} controls.
 *
 * The {@link PopupTrigger} actions are flags that may be combined using binary
 * operators. For example:
 *
 * ```typescript
 * let popup = new Popup('#popup', {
 *
 *     // set popup owner to 'show' button
 *     owner: '#btn-show'
 *
 *     // show the popup when clicking the button
 *     showTrigger: PopupTrigger.ClickOwner,
 *
 *     // hide the popup when clicking the button or when the mouse leaves the popup
 *     hideTrigger: PopupTrigger.ClickOwner | PopupTrigger.LeavePopup,
 * });
 * ```
 */
export declare enum PopupTrigger {
    /** No triggers; popups must be shown and hidden using code. */
    None = 0,
    /** When the user clicks the owner element. */
    ClickOwner = 1,
    /** When the user clicks the popup. */
    ClickPopup = 2,
    /** When the user clicks the owner element or the popup. */
    Click = 3,
    /** When the owner element loses focus. */
    BlurOwner = 4,
    /** When the popup loses focus. */
    BlurPopup = 8,
    /** When the owner element or the popup lose focus. */
    Blur = 12,
    /** When the owner element or the popup are clicked or lose focus. */
    ClickOrBlur = 15,
    /** When the mouse button is pressed over the owner element. */
    DownOwner = 16,
    /** When the mouse button is pressed over the popup. */
    DownPopup = 32,
    /** When the mouse button is pressed over the owner element or the popup. */
    Down = 48,
    /** When the mouse enters the owner element. */
    EnterOwner = 64,
    /** When the mouse enters the popup. */
    EnterPopup = 128,
    /** When the mouse enters the owner element or the popup. */
    Enter = 192,
    /** When the mouse leaves the owner element. */
    LeaveOwner = 256,
    /** When the mouse leaves the popup. */
    LeavePopup = 512,
    /** When the mouse leaves the owner element or the popup. */
    Leave = 768
}
declare enum _Edges {
    None = 0,
    Left = 1,
    Top = 2,
    Right = 4,
    Bottom = 8,
    LeftTop = 3,
    RightTop = 6,
    RightBottom = 12,
    LeftBottom = 9
}
/**
 * Class that shows an element as a popup.
 *
 * Popups may be have {@link owner} elements, in which case they behave
 * as rich tooltips that may be shown or hidden based on actions
 * specified by the {@link Popup.showTrigger} and {@link Popup.hideTrigger}
 * properties.
 *
 * Popups with no owner elements behave like dialogs. They are centered
 * on the screen and displayed using the {@link show} method.
 *
 * To close a {@link Popup}, call the {@link Popup.hide} method.
 *
 * Alternatively, any clickable elements within a {@link Popup} that have
 * the classes starting with the 'wj-hide' string will hide the {@link Popup}
 * when clicked and will set the {@link Popup.dialogResult} property to the
 * class name so the caller may take appropriate action.
 *
 * For example, the {@link Popup} below will be hidden when the user presses
 * the OK or Cancel buttons, and the {@link Popup.dialogResult} property will
 * be set to either 'wj-hide-cancel' or 'wj-hide-ok':
 *
 * ```html
 * <button id="btn-show-popup">
 *     Show Popup
 * </button>
 * <div id="thePopup" class="wj-dialog">
 *     <div class="wj-dialog-header">
 *         Welcome to the popup.
 *     </div>
 *     <div class="wj-dialog-body">
 *         Click one of the buttons below to close the popup.
 *     </div>
 *     <div class="wj-dialog-footer">
 *         <button class="wj-hide-ok">
 *             OK
 *         </button>
 *         <button class="wj-hide-cancel">
 *             Cancel
 *         </button>
 *     </div>
 * </div>
 * ```
 * ```typescript
 * new Popup('#thePopup', {
 *     owner: '#btn-show-popup',
 *     hidden: s => console.log('popup closed with result', s.dialogResult)
 * });
 * ```
 *
 * The example below shows how you can use the {@link Popup} control to implement
 * popups attached to owner elements and dialogs:
 *
 * {@sample Input/Popup/PopupsWithOwnerElements/purejs}
 */
export declare class Popup extends Control {
    static _DRAG_THRESHOLD: number;
    static _SZ_EDGE: number;
    static _SZ_MIN: number;
    static _evtHover: MouseEvent;
    protected _owner: HTMLElement;
    protected _modal: boolean;
    protected _position: PopupPosition;
    protected _showTrigger: selfModule.PopupTrigger;
    protected _hideTrigger: selfModule.PopupTrigger;
    protected _hideAnim: any[];
    protected _fadeIn: boolean;
    protected _fadeOut: boolean;
    protected _removeOnHide: boolean;
    protected _draggable: boolean;
    protected _resizable: boolean;
    protected _dragged: boolean;
    protected _resized: boolean;
    protected _ignoreClick: boolean;
    protected _bkDrop: HTMLDivElement;
    protected _result: any;
    protected _resultEnter: any;
    protected _callback: Function;
    protected _refreshing: boolean;
    protected _visible: boolean;
    protected _wasVisible: boolean;
    protected _composing: boolean;
    protected _ownerClickBnd: any;
    protected _ownerDownBnd: any;
    protected _ownerBlurBnd: any;
    protected _ownerEnterBnd: any;
    protected _ownerLeaveBnd: any;
    protected _toShow: any;
    protected _toHide: any;
    protected _edges: _Edges;
    protected _mousedownEvt: MouseEvent;
    protected _rcBounds: ClientRect;
    protected _mousedownBnd: any;
    protected _mousemoveBnd: any;
    protected _mousedragBnd: any;
    protected _mouseupBnd: any;
    protected _hideBnd: any;
    protected _oldFocus: HTMLElement;
    protected _lastShow: number;
    /**
     * Initializes a new instance of the {@link Popup} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the element that owns this {@link Popup}.
     *
     * If the {@link owner} is null, the {@link Popup} behaves like a dialog.
     * It is centered on the screen and must be shown using the
     * {@link show} method.
     */
    owner: HTMLElement;
    /**
     * Gets or sets the {@link PopupPosition} where the popup should be
     * displayed with respect to the owner element.
     *
     * The default value for this property is <b>PopupPosition.BelowLeft</b>.
     */
    position: PopupPosition;
    /**
     * Gets or sets the HTML element contained in this {@link Popup}.
     */
    content: HTMLElement;
    /**
     * Gets or sets the actions that show the {@link Popup}.
     *
     * By default, the {@link showTrigger} property is set to {@link PopupTrigger.ClickOwner},
     * which causes the popup to appear when the user clicks the owner element.
     *
     * If you set the {@link showTrigger} property to {@link PopupTrigger.None},
     * the popup will be shown only when the {@link show} method is called.
     */
    showTrigger: PopupTrigger;
    /**
     * Gets or sets the actions that hide the {@link Popup}.
     *
     * By default, the {@link hideTrigger} property is set to {@link PopupTrigger.Blur},
     * which hides the popup when it loses focus.
     *
     * If you set the {@link hideTrigger} property to {@link PopupTrigger.Click}, the
     * popup will be hidden when the user clicks the popup or its owner element.
     *
     * If you set the {@link hideTrigger} property to {@link PopupTrigger.Leave}, the
     * popup will be hidden a short interval after the mouse leaves the popup or its
     * owner element, unless the user moves the mouse back into the popup before the
     * interval elapses.
     *
     * If you set the {@link hideTrigger} property to {@link PopupTrigger.None}, the
     * popup will be hidden only when the {@link hide} method is called
     * (or when the user presses the Escape key).
     */
    hideTrigger: PopupTrigger;
    /**
     * Gets or sets a value that determines whether the {@link Popup} should
     * use a fade-in animation when it is shown.
     *
     * The default value for this property is <b>true</b>.
     */
    fadeIn: boolean;
    /**
     * Gets or sets a value that determines whether the {@link Popup} should
     * use a fade-out animation when it is hidden.
     *
     * The default value for this property is <b>true</b>.
     */
    fadeOut: boolean;
    /**
     * Gets or sets a value that determines whether the {@link Popup} element
     * should be removed from the DOM when the {@link Popup} is hidden, as
     * opposed to being hidden.
     *
     * The default value for this property is <b>true</b>.
     */
    removeOnHide: boolean;
    /**
     * Gets or sets a value that determines whether the {@link Popup} should
     * be displayed as a modal dialog.
     *
     * Modal dialogs show a dark backdrop that makes the {@link Popup} stand
     * out from other content on the page.
     *
     * If you want to make a dialog truly modal, also set the {@link Popup.hideTrigger}
     * property to {@link PopupTrigger.None}, so users won't be able to click the
     * backdrop to dismiss the dialog. In this case, the dialog will close only
     * when the {@link hide} method is called (or when the user presses the Escape key).
     *
     * The default value for this property is <b>false</b>.
     */
    modal: boolean;
    /**
     * Gets or sets a value that determines whether the popup can be dragged
     * with the mouse by its header.
     *
     * The header is identified by the '.wj-dialog-header' or '.modal-header'
     * CSS selectors.
     * If the dialog does not contain any elements with the 'wj-dialog-header'
     * or 'modal-header' classes, users will not be able to drag the popup.
     *
     * The default value for this property is <b>false</b>.
     */
    isDraggable: boolean;
    /**
     * Gets or sets a value that determines whether the popup can be resized
     * by dragging its edges with the mouse.
     *
     * You can limit the size of the popup by setting the host element's
     * max-width, min-width, max-height, and min-height CSS properties.
     *
     * The default value for this property is <b>false</b>.
     */
    isResizable: boolean;
    /**
     * Gets or sets a value used as a return value for the {@link Popup} after
     * it is hidden.
     *
     * This property is set to null when the {@link Popup} is displayed. It can be
     * set in response to button click events or in the call to the {@link hide}
     * method to provide a result value to callers.
     */
    dialogResult: any;
    /**
     * Gets or sets a value to be used as a {@link dialogResult} when the user presses
     * the Enter key while the {@link Popup} is visible.
     *
     * If the user presses Enter and the {@link dialogResultEnter} property is not null,
     * the popup checks whether all its child elements are in a valid state.
     * If so, the popup is closed and the {@link dialogResult} property is set to
     * the value of the {@link dialogResultEnter} property.
     */
    dialogResultEnter: any;
    /**
     * Gets a value that determines whether the {@link Popup} is currently visible.
     */
    readonly isVisible: boolean;
    /**
     * Shows the {@link Popup}.
     *
     * @param modal Whether to show the popup as a modal dialog. If provided, this
     * sets the value of the {@link modal} property.
     * @param handleResult Callback invoked when the popup is hidden. If provided,
     * this should be a function that receives the popup as a parameter.
     *
     * The <b>handleResult</b> callback allows callers to handle the result of modal
     * dialogs without attaching handlers to the {@link hidden} event. For example,
     * the code below shows a dialog used to edit the current item in a
     * {@link CollectionView}. The edits are committed or canceled depending on the
     * {@link Popup.dialogResult} value. For example:
     *
     * <pre>$scope.editCurrentItem = function () {
     *   $scope.data.editItem($scope.data.currentItem);
     *   $scope.itemEditor.show(true, function (e) {
     *     if (e.dialogResult == 'wj-hide-ok') {
     *       $scope.data.commitEdit();
     *     } else {
     *       $scope.data.cancelEdit();
     *     }
     *   });
     * }</pre>
     */
    show(modal?: boolean, handleResult?: Function): void;
    /**
     * Hides the {@link Popup}.
     *
     * @param dialogResult Optional value assigned to the {@link dialogResult} property
     * before closing the {@link Popup}.
     */
    hide(dialogResult?: any): void;
    /**
     * Occurs before the {@link Popup} is shown.
     */
    readonly showing: Event<selfModule.Popup, CancelEventArgs>;
    /**
     * Raises the {@link showing} event.
     *
     * @param e {@link CancelEventArgs} that contains the event data.
     * @return True if the event was not canceled.
     */
    onShowing(e: CancelEventArgs): boolean;
    /**
     * Occurs after the {@link Popup} has been shown.
     */
    readonly shown: Event<selfModule.Popup, EventArgs>;
    /**
     * Raises the {@link shown} event.
     */
    onShown(e?: EventArgs): void;
    /**
     * Occurs before the {@link Popup} is hidden.
     */
    readonly hiding: Event<selfModule.Popup, CancelEventArgs>;
    /**
     * Raises the {@link hiding} event.
     *
     * @param e {@link CancelEventArgs} that contains the event data.
     * @return True if the event was not canceled.
     */
    onHiding(e: CancelEventArgs): boolean;
    /**
     * Occurs after the {@link Popup} has been hidden.
     */
    readonly hidden: Event<selfModule.Popup, EventArgs>;
    /**
     * Raises the {@link hidden} event.
     */
    onHidden(e?: EventArgs): void;
    /**
     * Occurs when the {@link Popup} is about to be resized.
     *
     * See also the {@link isResizable} property.
     */
    readonly resizing: Event<selfModule.Popup, CancelEventArgs>;
    /**
     * Raises the {@link resizing} event.
     *
     * @param e {@link CancelEventArgs} that contains the event data.
     * @return True if the event was not canceled.
     */
    onResizing(e: CancelEventArgs): boolean;
    /**
     * Occurs after the {@link Popup} has been resized.
     *
     * See also the {@link isResizable} property.
     */
    readonly resized: Event<selfModule.Popup, EventArgs>;
    /**
     * Raises the {@link resized} event.
     */
    onResized(e?: EventArgs): void;
    /**
     * Occurs when the {@link Popup} is about to be dragged.
     *
     * See also the {@link isDraggable} property.
     */
    readonly dragging: Event<selfModule.Popup, CancelEventArgs>;
    /**
     * Raises the {@link dragging} event.
     *
     * @param e {@link CancelEventArgs} that contains the event data.
     * @return True if the event was not canceled.
     */
    onDragging(e: CancelEventArgs): boolean;
    /**
     * Occurs after the {@link Popup} has been dragged.
     *
     * See also the {@link isDraggable} property.
     */
    readonly dragged: Event<selfModule.Popup, EventArgs>;
    /**
     * Raises the {@link dragged} event.
     */
    onDragged(e?: EventArgs): void;
    /**
     * Occurs while the user resizes the {@link Popup}, between the
     * {@link resizing} and {@link resized} events.
     *
     * When the user drags the {@link Popup}, it raises the following events:
     * - {@link resizing} (once, cancelable)
     * - {@link sizeChanging} (several times while the user moves the mouse, cancelable)
     * - {@link sizeChanged} (several times while the user moves the mouse)
     * - {@link resized} (once, at the end of the resizing process)
     *
     * See also the {@link isResizable} property.
     */
    readonly sizeChanging: Event<selfModule.Popup, selfModule.PopupBoundsChangingEventArgs>;
    /**
     * Raises the {@link sizeChanging} event.
     *
     * @param e {@link PopupBoundsChangingEventArgs} that contains the event data.
     * @return True if the event was not canceled.
     */
    onSizeChanging(e: PopupBoundsChangingEventArgs): boolean;
    /**
     * Occurs while the user resizes the {@link Popup}, between the
     * {@link resizing} and {@link resized} events.
     *
     * When the user resizes the {@link Popup}, it raises the following events:
     * - {@link resizing} (once, cancelable)
     * - {@link sizeChanging} (several times while the user moves the mouse, cancelable)
     * - {@link sizeChanged} (several times while the user moves the mouse)
     * - {@link resized} (once, at the end of the resizing process)
     *
     * See also the {@link isResizable} property.
     */
    readonly sizeChanged: Event<selfModule.Popup, EventArgs>;
    /**
     *
     * @param e Raises the {@link sizeChanged} event.
     */
    onSizeChanged(e?: EventArgs): void;
    /**
     * Occurs while the user moves the {@link Popup}, between the
     * {@link dragging} and {@link dragged} events.
     *
     * When the user drags the {@link Popup}, it raises the following events:
     * - {@link dragging} (once, cancelable)
     * - {@link positionChanging} (several times while the user moves the mouse, cancelable)
     * - {@link positionChanged} (several times while the user moves the mouse)
     * - {@link dragged} (once, at the end of the resizing process)
     *
     * See also the {@link isDraggable} property.
     *
     * You can use the {@link positionChanging} event to cancel or to modify
     * the {@link Popup} bounds as the user drags the control.
     *
     * For example, the code keeps the popup in full view, preventing users
     * from dragging parts of the {@link Popup} off the screen:
     *
     * ```typescript
     * new Popup('#thePopup', {
     *     isDraggable: true,
     *     isResizable: true,
     *     hideTrigger: 'None',
     *
     *     // keep popup fully within the browser window
     *     positionChanging: (s: Popup, e: PopupBoundsChangingEventArgs) => {
     *         let bnd = e.bounds;
     *         bnd.left = Math.max(Math.min(bnd.left, innerWidth + scrollX - bnd.width), scrollX);
     *         bnd.top = Math.max(Math.min(bnd.top, innerHeight + scrollY - bnd.height), scrollY);
     *     }
     * });
     * ```
     */
    readonly positionChanging: Event<selfModule.Popup, selfModule.PopupBoundsChangingEventArgs>;
    /**
     * Raises the {@link positionChanging} event.
     *
     * @param e {@link PopupBoundsChangingEventArgs} that contains the event data.
     * @return True if the event was not canceled.
     */
    onPositionChanging(e: PopupBoundsChangingEventArgs): boolean;
    /**
     * Occurs while the user moves the {@link Popup}, between the
     * {@link dragging} and {@link dragged} events.
     *
     * When the user drags the {@link Popup}, it raises the following events:
     * - {@link dragging} (once, cancelable)
     * - {@link positionChanging} (several times while the user moves the mouse)
     * - {@link positionChanged} (several times while the user moves the mouse)
     * - {@link dragged} (once, at the end of the resizing process)
     *
     * See also the {@link isDraggable} property.
     */
    readonly positionChanged: Event<selfModule.Popup, EventArgs>;
    /**
     * Raises the {@link positionChanged} event.
     */
    onPositionChanged(e?: EventArgs): void;
    onLostFocus(e?: EventArgs): void;
    dispose(): void;
    refresh(fullUpdate?: boolean): void;
    protected _handleDragResize(on: boolean): void;
    protected _mousemove(e: MouseEvent): void;
    protected _mousedown(e: any): void;
    protected _mouseup(): void;
    protected _mousedrag(e: any): void;
    protected _getEdges(host: HTMLElement, e: MouseEvent): _Edges;
    protected _ownerClick(e: MouseEvent): void;
    protected _ownerDown(e: MouseEvent): void;
    protected _ownerBlur(e: UIEvent): void;
    protected _ownerEnter(e: MouseEvent): void;
    protected _ownerLeave(e: MouseEvent): void;
    protected _toggle(e: UIEvent, trigger: PopupTrigger): void;
    private _getHeaderElement;
    private _getClosestHeader;
    private _showBackdrop;
    protected _validateAndHide(result: any): void;
}
/**
 * Provides arguments for the {@link Popup} control's {@link sizeChanging} and
 * {@link positionChanging} events.
 */
export declare class PopupBoundsChangingEventArgs extends CancelEventArgs {
    _rc: Rect;
    /**
     * Initializes a new instance of the {@link PopupBoundsChangingEventArgs} class.
     */
    constructor(bounds: Rect);
    /**
     * Gets a {@link Rect} that represents the bounds of the {@link Popup} control.
     */
    readonly bounds: Rect;
}
/**
 * The {@link InputDate} control allows users to type in dates using any format
 * supported by the {@link Globalize} class, or to pick dates from a drop-down
 * that contains a {@link Calendar} control.
 *
 * Use the {@link min} and {@link max} properties to restrict the range of
 * values that the user can enter.
 *
 * For details about using the {@link min} and {@link max} properties, please see the
 * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
 *
 * Use the {@link value} property to gets or set the currently selected date.
 *
 * The example below shows a <b>Date</b> value
 * using an {@link InputDate} control.
 *
 * {@sample Input/InputDate/Overview/purejs Example}
 */
export declare class InputDate extends DropDown {
    private _calendar;
    private _value;
    private _format;
    private _calChanged;
    private _calChanging;
    private _msk;
    /**
     * Initializes a new instance of the {@link InputDate} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the current date.
     *
     * The default value for this property is the current date.
     */
    value: Date;
    /**
     * Gets or sets the text shown on the control.
     */
    text: string;
    /**
     * Gets or sets a value that indicates whether users can select
     * days, months, or no values at all.
     *
     * This property affects the behavior of the drop-down calendar,
     * but not the format used to display dates.
     * If you set {@link selectionMode} to 'Month', you should normally
     * set the {@link format} property to 'MMM yyyy' or some format that
     * does not include the day. For example:
     *
     * ```typescript
     * import { InputDate } from 'wijmo/wijmo.input';
     * var inputDate = new InputDate('#el, {
     *   selectionMode: 'Month',
     *   format: 'MMM yyyy'
     * });
     * ```
     *
     * The default value for this property is <b>DateSelectionMode.Day</b>.
     */
    selectionMode: DateSelectionMode;
    /**
     * Gets or sets the earliest date that the user can enter.
     *
     * The default value for this property is <b>null</b>, which means no earliest
     * date is defined.
     *
     * For details about using the {@link min} and {@link max} properties, please see the
     * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
     */
    min: Date;
    /**
     * Gets or sets the latest date that the user can enter.
     *
     * The default value for this property is <b>null</b>, which means no latest
     * date is defined.
     *
     * For details about using the {@link min} and {@link max} properties, please see the
     * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
     */
    max: Date;
    /**
     * Gets or sets a value that determines whether the calendar buttons
     * should act as repeat buttons, firing repeatedly as the button
     * remains pressed.
     *
     * The default value for this property is <b>true</b>.
     */
    repeatButtons: boolean;
    /**
     * Gets or sets a value that determines whether the drop-down
     * calendar should display a list of years when the user clicks
     * the header element on the year calendar.
     *
     * The default value for this property is <b>true</b>.
     */
    showYearPicker: boolean;
    /**
     * Gets or sets the format used to display the selected date.
     *
     * The format string is expressed as a .NET-style
     * <a href="https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings" target="_blank">
     * Date format string</a>.
     *
     * The default value for this property is <b>d</b>, the culture-dependent
     * short date pattern (e.g. 6/15/2020 in the US, 15/6/2020 in France, or
     * 2020/6/15 in Japan).
     */
    format: string;
    /**
     * Gets or sets a mask to use while editing.
     *
     * The mask format is the same one that the {@link wijmo.input.InputMask}
     * control uses.
     *
     * If specified, the mask must be compatible with the value of
     * the {@link format} property. For example, the mask '99/99/9999' can
     * be used for entering dates formatted as 'MM/dd/yyyy'.
     */
    mask: string;
    /**
     * Gets a reference to the {@link Calendar} control shown in the drop-down box.
     */
    readonly calendar: Calendar;
    /**
     * Gets the HTML input element hosted by the control.
     *
     * Use this property in situations where you want to customize the
     * attributes of the input element.
     */
    readonly inputElement: HTMLInputElement;
    /**
     * Gets or sets the "type" attribute of the HTML input element hosted by the control.
     *
     * By default, this property is set to <b>"tel"</b>, a value that causes mobile  devices
     * to show a numeric keypad that includes a negative sign and a decimal separator.
     *
     * Use this property to change the default setting if the default does not work well
     * for the current culture, device, or application. In those cases, try changing
     * the value to "number" or "text."
     *
     * Note that input elements with type "number" prevent selection in Chrome and therefore
     * is not recommended. For more details, see this link:
     * https://stackoverflow.com/questions/21177489/selectionstart-selectionend-on-input-type-number-no-longer-allowed-in-chrome
     */
    inputType: string;
    /**
     * Gets or sets a validator function to determine whether dates are valid for selection.
     *
     * If specified, the validator function should take one parameter representing the
     * date to be tested, and should return false if the date is invalid and should not
     * be selectable.
     *
     * For example, the code below prevents users from selecting dates that fall on
     * weekends:
     * <pre>
     * inputDate.itemValidator = function(date) {
     *   var weekday = date.getDay();
     *   return weekday != 0 && weekday != 6;
     * }
     * </pre>
     */
    itemValidator: IDateValidator;
    /**
     * Gets or sets a formatter function to customize dates in the drop-down calendar.
     *
     * The formatter function can add any content to any date. It allows
     * complete customization of the appearance and behavior of the calendar.
     *
     * If specified, the function takes two parameters:
     * <ul>
     *     <li>the date being formatted </li>
     *     <li>the HTML element that represents the date</li>
     * </ul>
     *
     * For example, the code below shows weekends with a yellow background:
     * <pre>
     * inputDate.itemFormatter = function(date, element) {
     *   var day = date.getDay();
     *   element.style.backgroundColor = day == 0 || day == 6 ? 'yellow' : '';
     * }
     * </pre>
     */
    itemFormatter: IDateFormatter;
    /**
     * Occurs when the value of the {@link value} property changes, either
     * as a result of user actions or by assignment in code.
     */
    readonly valueChanged: Event<selfModule.InputDate, EventArgs>;
    /**
     * Raises the {@link valueChanged} event.
     */
    onValueChanged(e?: EventArgs): void;
    refresh(fullUpdate?: boolean): void;
    onIsDroppedDownChanged(e?: EventArgs): void;
    protected _createDropDown(): void;
    protected _updateDropDown(): void;
    protected _keydown(e: KeyboardEvent): void;
    private _canChangeValue;
    protected _clamp(value: Date): Date;
    protected _commitText(): void;
    private _isValidDate;
}
/**
 * The {@link InputColor} control allows users to select colors by typing in
 * HTML-supported color strings, or to pick colors from a drop-down
 * that shows a {@link ColorPicker} control.
 *
 * Use the {@link value} property to get or set the currently selected color.
 *
 * {@sample Input/InputColor/Overview/purejs Example}
 */
export declare class InputColor extends DropDown {
    private _ePreview;
    private _colorPicker;
    private _value;
    /**
     * Initializes a new instance of the {@link InputColor} class.
     *
     * @param element The DOM element that hosts the control, or a selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the current color.
     */
    value: string;
    /**
     * Gets or sets the text shown on the control.
     */
    text: string;
    /**
     * Gets or sets a value indicating whether the {@link ColorPicker} allows users
     * to edit the color's alpha channel (transparency).
     *
     * The default value for this property is <b>true</b>.
     */
    showAlphaChannel: boolean;
    /**
     * Gets or sets an array that contains the colors in the palette.
     *
     * The palette contains ten colors, represented by an array with
     * ten strings. The first two colors are usually white and black.
     */
    palette: string[];
    /**
     * Gets a reference to the {@link ColorPicker} control shown in the drop-down.
     */
    readonly colorPicker: ColorPicker;
    /**
     * Occurs when the value of the {@link value} property changes, either
     * as a result of user actions or by assignment in code.
     */
    readonly valueChanged: Event<selfModule.InputColor, EventArgs>;
    /**
     * Raises the {@link valueChanged} event.
     */
    onValueChanged(e?: EventArgs): void;
    onIsDroppedDownChanged(e?: EventArgs): void;
    protected _createDropDown(): void;
    protected _keydown(e: KeyboardEvent): void;
    protected _commitText(): void;
}
/**
 * The {@link ComboBox} control allows users to pick strings from lists.
 *
 * The control automatically completes entries as the user types, and
 * allows users to show a drop-down list with the items available.
 *
 * Use the {@link ComboBox.itemsSource} property to populate the list of
 * options.
 * The items may be strings or objects. If the items are objects, use
 * the {@link ComboBox.displayMemberPath} to define which property of the
 * items will be displayed in the list and use the {@link ComboBox.selectedValuePath}
 * property to define which property of the items will be used to set the
 * combo's {@link ComboBox.selectedValue} property.
 *
 * Use the {@link ComboBox.selectedIndex} or the {@link ComboBox.text} properties
 * to determine which item is currently selected.
 *
 * The {@link ComboBox.isRequired} property determines whether the control
 * must have a non-null value or whether it can be set to null
 * (by deleting the content of the control). If the value is set to null,
 * the {@link ComboBox.selectedIndex} is set to -1.
 *
 * The {@link ComboBox.isEditable} property determines whether users can enter
 * values that are not present in the list.
 *
 * The example below creates a {@link ComboBox} control and populates it with
 * a list of countries. The {@link ComboBox} searches for the country as the
 * user types.
 * The {@link ComboBox.isEditable} property is set to false, so the user must
 * select one of the items in the list.
 *
 * {@sample Input/ComboBox/Overview/purejs Example}
 */
export declare class ComboBox extends DropDown {
    _lbx: ListBox;
    _editable: boolean;
    _trimText: boolean;
    _delKey: number;
    _composing: boolean;
    _settingText: boolean;
    _pathHdr: Binding;
    _bsCollapse: boolean;
    _fmtItemHandlers: number;
    /**
     * Initializes a new instance of the {@link ComboBox} class.
     *
     * @param element The DOM element that hosts the control, or a selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the array or {@link ICollectionView} object that contains
     * the items to select from.
     *
     * Setting this property to an array causes the {@link ComboBox} to create
     * an internal {@link ICollectionView} object that is exposed by the
     * {@link ComboBox.collectionView} property.
     *
     * The {@link ComboBox} selection is determined by the current item in its
     * {@link ComboBox.collectionView}. By default, this is the first item in
     * the collection. You may change this behavior by setting the
     * {@link wijmo.CollectionView.currentItem} property of the
     * {@link ComboBox.collectionView} to null.
     */
    itemsSource: any;
    /**
     * Gets the {@link ICollectionView} object used as the item source.
     */
    readonly collectionView: ICollectionView;
    /**
     * Gets or sets a value that determines whether the drop-down {@link ListBox}
     * should include group header items to delimit data groups.
     *
     * Data groups are created by modifying the {@link ICollectionView.groupDescriptions}
     * property of the {@link ICollectionView} object used as an {@link itemsSource}.
     *
     * The default value for this property is <b>false</b>.
     */
    showGroups: boolean;
    /**
     * Gets or sets the name of the property to use as the visual
     * representation of the items.
     */
    displayMemberPath: string;
    /**
     * Gets or sets the name of a property to use for getting the value
     * displayed in the control's input element.
     *
     * The default value for this property is null, which causes the control
     * to display the same content in the input element as in the selected
     * item of the drop-down list.
     *
     * Use this property if you want to de-couple the value shown in the
     * input element from the values shown in the drop-down list. For example,
     * the input element could show an item's name and the drop-down list
     * could show additional detail.
     */
    headerPath: string;
    /**
     * Gets or sets the name of the property used to get the
     * {@link selectedValue} from the {@link selectedItem}.
     */
    selectedValuePath: string;
    /**
     * Gets or sets a value indicating whether the drop-down list displays
     * items as plain text or as HTML.
     *
     * The default value for this property is <b>false</b>.
     */
    isContentHtml: boolean;
    /**
     * Gets or sets a value that determines whether searches performed
     * while the user types should case-sensitive.
     *
     * The default value for this property is <b>false</b>.
     */
    caseSensitiveSearch: boolean;
    /**
     * Gets or sets a value that determines whether values in the
     * control's input element should be trimmed by removing leading
     * and trailing spaces.
     *
     * The default value for this property is <b>true</b>.
     *
     * To see leading and trailing spaces in the drop-down list items,
     * you may have to apply a CSS rule such as this one:
     *
     * <pre>
     *   .wj-listbox-item {
     *      white-space: pre;
     *   }
     * </pre>
     */
    trimText: boolean;
    /**
     * Gets or sets a function used to customize the values shown in
     * the drop-down list.
     * The function takes two arguments, the item index and the default
     * text or html, and returns the new text or html to display.
     *
     * If the formatting function needs a scope (i.e. a meaningful 'this'
     * value), then remember to set the filter using the 'bind' function
     * to specify the 'this' object. For example:
     *
     * <pre>
     *   comboBox.itemFormatter = customItemFormatter.bind(this);
     *   function customItemFormatter(index, content) {
     *     if (this.makeItemBold(index)) {
     *       content = '&lt;b&gt;' + content + '&lt;/b&gt;';
     *     }
     *     return content;
     *   }
     * </pre>
     */
    itemFormatter: IItemFormatter;
    /**
     * Event that fires when items in the drop-down list are created.
     *
     * You can use this event to modify the HTML in the list items.
     * For details, see the {@link ListBox.formatItem} event.
     */
    readonly formatItem: Event;
    /**
     * Gets or sets the index of the currently selected item in
     * the drop-down list.
     */
    selectedIndex: number;
    /**
     * Gets or sets the item that is currently selected in
     * the drop-down list.
     */
    selectedItem: any;
    /**
     * Gets or sets the value of the {@link selectedItem}, obtained
     * using the {@link selectedValuePath}.
     *
     * If the {@link selectedValuePath} property is not set, gets or
     * sets the value of the control's {@link selectedItem} property.
     *
     * If the {@link itemsSource} property is not set, gets or sets
     * the value of the control's {@link text} property.
     */
    selectedValue: any;
    /**
     * Gets or sets a value that determines whether the content of the
     * input element should be restricted to items in the {@link itemsSource}
     * collection.
     *
     * This property defaults to false on the {@link ComboBox} control, and
     * to true on the {@link AutoComplete} and {@link InputTime} controls.
     */
    isEditable: boolean;
    /**
     * Gets or sets the maximum height of the drop-down list, in pixels.
     */
    maxDropDownHeight: number;
    /**
     * Gets or sets the maximum width of the drop-down list.
     *
     * The width of the drop-down list is also limited by the width of
     * the control itself (that value represents the drop-down's
     * minimum width).
     */
    maxDropDownWidth: number;
    /**
     * Gets the string displayed in the input element for the item at a
     * given index (always plain text).
     *
     * @param index The index of the item to retrieve the text for.
     */
    getDisplayText(index?: number): string;
    /**
     * Gets the index of the first item that matches a given string.
     *
     * @param search String to search for.
     * @param fullMatch Whether to look for a full match or just the start of the string.
     * @return The index of the item, or -1 if not found.
     */
    indexOf(search: string, fullMatch: boolean): number;
    /**
     * Gets the {@link ListBox} control shown in the drop-down.
     */
    readonly listBox: ListBox;
    /**
     * Occurs when the value of the {@link itemsSource} property changes.
     */
    readonly itemsSourceChanged: Event<selfModule.ComboBox, EventArgs>;
    /**
     * Raises the {@link itemsSourceChanged} event.
     */
    onItemsSourceChanged(e?: EventArgs): void;
    /**
     * Occurs when the value of the {@link selectedIndex} property changes.
     */
    readonly selectedIndexChanged: Event<selfModule.ComboBox, EventArgs>;
    /**
     * Raises the {@link selectedIndexChanged} event.
     */
    onSelectedIndexChanged(e?: EventArgs): void;
    refresh(fullUpdate?: boolean): void;
    onLostFocus(e?: EventArgs): void;
    onIsDroppedDownChanging(e: CancelEventArgs): boolean;
    onIsDroppedDownChanged(e?: EventArgs): void;
    protected _updateBtn(): void;
    protected _hasItems(): boolean;
    private _updateAria;
    protected _createDropDown(): void;
    protected _wheel(e: WheelEvent): void;
    protected _dropDownClick(e: MouseEvent): void;
    protected _setText(text: string, fullMatch: boolean): void;
    protected _findNext(search: string, step: number): number;
    protected _keydown(e: KeyboardEvent): void;
    protected _updateInputSelection(start: number): void;
    private _getSelStart;
    private _getSelEnd;
    private _setSelRange;
}
/**
 * Represents a method that returns a string used as a header for a
 * {@link MultiSelect} control.
 */
export interface IHeaderFormatter {
    /**
     * @param sender {@link MultiSelect} whose header is being formatted.
     * @returns The text to show in the control's header element.
     */
    (sender: MultiSelect): string;
}
/**
 * The {@link MultiSelect} control allows users to select multiple items from
 * drop-down lists that contain custom objects or simple strings.
 *
 * The {@link MultiSelect} control extends {@link ComboBox}, with all the usual
 * properties, including {@link MultiSelect.itemsSource} and
 * {@link MultiSelect.displayMemberPath}.
 *
 * Like the {@link ListBox} control, it has a {@link MultiSelect.checkedMemberPath}
 * property that defines the name of the property that determines whether an
 * item is checked or not.
 *
 * The items currently checked (selected) can be obtained using the
 * {@link MultiSelect.checkedItems} property.
 *
 * The control header is fully customizable. By default, it shows up to two items
 * selected and the item count after that. You can change the maximum number of
 * items to display ({@link MultiSelect.maxHeaderItems}), the message shown when no
 * items are selected ({@link MultiSelect.placeholder}), and the format string used to
 * show the item count ({@link MultiSelect.headerFormat}).
 *
 * Alternatively, you can provide a function to generate the header content based
 * on whatever criteria your application requires ({@link MultiSelect.headerFormatter}).
 *
 * The example below shows how you can use a {@link MultiSelect} control to select
 * multiple items from a drop-down list:
 *
 * {@sample Input/MultiSelect/Overview Example}
 */
export declare class MultiSelect extends ComboBox {
    private _maxHdrItems;
    private _readOnly;
    private _hdrFmt;
    private _hdrFormatter;
    private _msLbx;
    static _DEF_CHECKED_PATH: string;
    /**
     * Initializes a new instance of the {@link MultiSelect} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets whether the control should display a "Select All" checkbox
     * above the items to select or de-select all items.
     *
     * The default value for this property is <b>false</b>.
     */
    showSelectAllCheckbox: boolean;
    /**
     * Gets or sets whether the control should display a "filter" input
     * above the items to filter the items displayed.
     *
     * The default value for this property is <b>false</b>.
     */
    showFilterInput: boolean;
    /**
     * Gets or sets the string used as a placeholder for the filter input
     * element on the {@link MultiSelectListBox} drop-down.
     *
     * The default value for this property is null, which causes the control
     * to show a localized version of the string "Filter".
     */
    filterInputPlaceholder: string;
    /**
     * Gets or sets a value that determines whether the {@link MultiSelectListBox}
     * in the drop-down should automatically select all the filtered items when the
     * filter text changes.
     *
     * The default value for this property is <b>true</b>.
     */
    checkOnFilter: boolean;
    /**
     * Gets or sets the string to be used as a label for the "Select All"
     * checkbox that is displayed when the {@link showSelectAllCheckbox}
     * property is set to true.
     *
     * This property is set to null by default, which causes the control
     * to show a localized version of the string "Select All".
     */
    selectAllLabel: string;
    /**
     * Gets or sets the name of the property used to control the checkboxes
     * placed next to each item.
     */
    checkedMemberPath: string;
    /**
     * Gets or sets the maximum number of items to display on the control header.
     *
     * If no items are selected, the header displays the text specified by the
     * {@link placeholder} property.
     *
     * If the number of selected items is smaller than or equal to the value of the
     * {@link maxHeaderItems} property, the selected items are shown in the header.
     *
     * If the number of selected items is greater than {@link maxHeaderItems}, the
     * header displays the selected item count instead.
     */
    maxHeaderItems: number;
    /**
     * Gets or sets the format string used to create the header content
     * when the control has more than {@link maxHeaderItems} items checked.
     *
     * The format string may contain the '{count}' replacement string
     * which gets replaced with the number of items currently checked.
     * The default value for this property in the English culture is
     * '{count:n0} items selected'.
     */
    headerFormat: string;
    /**
     * Gets or sets a function that gets the text displayed in the control
     * header.
     *
     * By default, the control header content is determined based on the
     * {@link placeholder}, {@link maxHeaderItems}, and on the current selection.
     *
     * You may customize the header content by specifying a function that
     * returns a custom string based on whatever criteria your application
     * requires.
     */
    headerFormatter: IHeaderFormatter;
    /**
     * Gets or sets an array containing the items that are currently checked.
     */
    checkedItems: any[];
    /**
     * Occurs when the value of the {@link checkedItems} property changes.
     */
    readonly checkedItemsChanged: Event<selfModule.MultiSelect, EventArgs>;
    /**
     * Raises the {@link checkedItemsChanged} event.
     */
    onCheckedItemsChanged(e?: EventArgs): void;
    dispose(): void;
    onIsDroppedDownChanged(e?: EventArgs): void;
    protected _createDropDown(): void;
    isReadOnly: boolean;
    refresh(fullUpdate?: boolean): void;
    protected _setText(text: string, fullMatch: boolean): void;
    protected _keydown(e: KeyboardEvent): void;
    protected _hasItems(): boolean;
    private _updateHeader;
}
/**
 * The {@link Menu} control shows a text element with a drop-down list of commands that
 * the user can invoke by click or touch.
 *
 * The {@link Menu} control inherits from {@link ComboBox}, so you populate and style it
 * in the same way that you do the {@link ComboBox} (see the {@link Menu.itemsSource}
 * property).
 *
 * The {@link Menu} control adds an {@link Menu.itemClicked} event that fires when the user
 * selects an item from the menu. The event handler can inspect the {@link Menu} control
 * to determine which item was clicked. For example:
 *
 * ```typescript
 * import { Menu } from 'wijmo/wijmo.input';
 * let menu = new Menu(hostElement, {
 *     header: 'Main Menu',
 *     itemsSource: ['option 1', 'option 2', 'option 3'],
 *     itemClicked: s => {
 *         alert('Thanks for selecting item ' + s.selectedIndex + ' from menu ' + s.header + '!');
 *     }
 * });
 * ```
 *
 * The example below shows how you can create menus that handle the
 * {@link itemClicked} event.
 *
 * {@sample Input/Menu/Overview Example}
 */
export declare class Menu extends ComboBox {
    _hdr: HTMLElement;
    _closing: boolean;
    _cmd: any;
    _cmdPath: string;
    _cmdParamPath: string;
    _subPath: string;
    _defaultItem: any;
    _owner: HTMLElement;
    _isButton: boolean;
    _openOnHover: boolean;
    _closeOnLeave: boolean;
    _toHover: any;
    _subMenu: Menu;
    _hoverEnterBnd: any;
    _hoverLeaveBnd: any;
    _hoverOverBnd: any;
    static _evtHover: MouseEvent;
    /**
     * Initializes a new instance of the {@link Menu} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the HTML text shown in the {@link Menu} element.
     */
    header: string;
    /**
     * Gets or sets the command to execute when an item is clicked.
     *
     * Commands are objects that implement two methods:
     * <ul>
     *  <li><b>executeCommand(parameter)</b> This method executes the command.</li>
     *  <li><b>canExecuteCommand(parameter)</b> This method returns a Boolean value
     *      that determines whether the controller can execute the command.
     *      If this method returns false, the menu option is disabled.</li>
     * </ul>
     *
     * The parameter passed to the command is defined by the value of the
     * {@link commandParameterPath} property of the current item. If the
     * {@link commandParameterPath} property is not specified, the parameter
     * passed is the item itself.
     *
     * You can also set commands on individual items using the {@link commandPath}
     * property.
     */
    command: any;
    /**
     * Gets or sets the name of the property that contains the command to
     * execute when the user clicks an item.
     *
     * Commands are objects that implement two methods:
     * <ul>
     *  <li><b>executeCommand(parameter)</b> This method executes the command.</li>
     *  <li><b>canExecuteCommand(parameter)</b> This method returns a Boolean value
     *      that determines whether the controller can execute the command.
     *      If this method returns false, the menu option is disabled.</li>
     * </ul>
     */
    commandPath: string;
    /**
     * Gets or sets the name of the property that contains a parameter to use with
     * the command specified by the {@link commandPath} property.
     */
    commandParameterPath: string;
    /**
     * Gets or sets the name of the property that contains an array with items
     * to be displayed in a sub-menu.
     */
    subItemsPath: string;
    /**
     * Gets or sets a value that determines whether the menu (and any sub-menus)
     * should open automatically when the mouse hovers over the items.
     *
     * See also the {@link closeOnLeave} property, which determines whether the
     * menu should close automatically when the mouse leaves the menu.
     *
     * The default value for this property is <b>false</b>.
     */
    openOnHover: boolean;
    /**
     * Gets or sets a value that determines whether the menu (and any sub-menus)
     * should close automatically when the mouse leaves the menu.
     *
     * This property is applicable only when the {@link openOnHover} is set to true.
     *
     * The default value for this property is <b>true</b>.
     */
    closeOnLeave: boolean;
    /**
     * Gets or sets a value that determines whether this {@link Menu} should act
     * as a split button instead of a regular menu.
     *
     * The default value for this property is <b>false</b>.
     *
     * The difference between regular menus and split buttons is what happens
     * when the user clicks the menu header.
     * In regular menus, clicking the header shows or hides the menu options.
     * In split buttons, clicking the header raises the {@link Menu.itemClicked}
     * event and/or invokes the command associated with the last option selected by
     * the user as if the user had picked the item from the drop-down list.
     *
     * If you want to differentiate between clicks on menu items and the button
     * part of a split button, check the value of the {@link Menu.isDroppedDown} property
     * of the event sender. If that is true, then a menu item was clicked; if it
     * is false, then the button was clicked.
     *
     * For example, the code below implements a split button that uses the drop-down
     * list only to change the default item/command, and triggers actions only when
     * the button is clicked:
     *
     * ```html
     * <wj-menu is-button="true" header="Run" value="browser" item-clicked="itemClicked(s, e)>
     *     <wj-menu-item value="'Internet Explorer'">Internet Explorer</wj-menu-item>
     *     <wj-menu-item value="'Chrome'">Chrome</wj-menu-item>
     *     <wj-menu-item value="'Firefox'">Firefox</wj-menu-item>
     *     <wj-menu-item value="'Safari'">Safari</wj-menu-item>
     *     <wj-menu-item value="'Opera'">Opera</wj-menu-item>
     * </wj-menu>
     * ```
     * ```typescript
     * // controller
     * $scope.browser = 'Internet Explorer';
     * $scope.itemClicked = (s, e) => {
     *     if (!s.isDroppedDown) { // if not dropped down, click was on the button
     *         alert('running ' + $scope.browser);
     *     }
     * }
     * ```
     */
    isButton: boolean;
    /**
     * Gets or sets the element that owns this {@link Menu}.
     *
     * This variable is set by the wj-context-menu directive in case a single
     * menu is used as a context menu for several different elements.
     */
    owner: HTMLElement;
    /**
     * Shows the menu at a given location.
     *
     * This method is useful if you want to use the menu as a context
     * menu, attached to one or more elements on the page. For example:
     *
     * ```typescript
     * import { Menu } from 'wijmo/wijmo.input';
     * let div = document.createElement('div');
     * let menu = new Menu(div, {
     *     itemsSource: 'New,Open,Save,Exit'.split(','),
     *     itemClicked: s => {
     *         alert('thanks for picking ' + s.selectedIndex);
     *     }
     * });
     *
     * // use it as a context menu for one or more elements
     * let element = document.getElementById('btn');
     * element.addEventListener('contextmenu', e => {
     *     e.preventDefault();
     *     menu.show(e);
     * });
     * ```
     *
     * @param position An optional <b>MouseEvent</b> or reference element
     * that determines the position where the menu should be displayed.
     * If not provided, the menu is displayed at the center of the screen.
     */
    show(position?: any): void;
    /**
     * Hides the menu.
     *
     * This method is useful if you want to hide a context menu displayed
     * with the {@link show} method.
     */
    hide(): void;
    /**
     * Occurs when the user picks an item from the menu.
     *
     * The handler can determine which item was picked by reading the event sender's
     * {@link selectedIndex} property.
     */
    readonly itemClicked: Event<selfModule.Menu, EventArgs>;
    /**
     * Raises the {@link itemClicked} event.
     */
    onItemClicked(e?: EventArgs): void;
    refresh(fullUpdate?: boolean): void;
    onIsDroppedDownChanged(e?: EventArgs): void;
    _updateHoverEvents(): void;
    _getSubItems(item: any): any[];
    _formatMenuItem(s: ListBox, e: FormatItemEventArgs): void;
    protected _keydown(e: KeyboardEvent): void;
    protected _dropDownClick(e: MouseEvent): void;
    private _showSubMenu;
    private _raiseCommand;
    private _getCommand;
    private _getCommandParm;
    private _executeCommand;
    private _canExecuteCommand;
    private _enableDisableItems;
    private _clearHover;
    private _hoverEnter;
    private _hoverLeave;
    private _hoverOver;
}
/**
 * The {@link InputTime} control allows users to enter times using any format
 * supported by the {@link Globalize} class, or to pick times from a drop-down
 * list.
 *
 * The {@link min}, {@link max}, and {@link step} properties determine the values shown
 * in the list.
 *
 * For details about using the {@link min} and {@link max} properties, please see the
 * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
 *
 * The {@link value} property gets or sets a {@link Date} object that represents the time
 * selected by the user.
 *
 * The example below shows a <b>Date</b> value (that includes date and time information)
 * using an {@link InputDate} and an {@link InputTime} control. Notice how both controls
 * are bound to the same controller variable, and each edits the appropriate information
 * (either date or time).
 *
 * {@sample Input/InputTime/Overview/purejs Example}
 */
export declare class InputTime extends ComboBox {
    _value: Date;
    _min: Date;
    _max: Date;
    _step: number;
    _format: string;
    _msk: _MaskProvider;
    _hasCustomItems: boolean;
    /**
     * Initializes a new instance of the {@link InputTime} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets the HTML input element hosted by the control.
     *
     * Use this property in situations where you want to customize the
     * attributes of the input element.
     */
    readonly inputElement: HTMLInputElement;
    /**
     * Gets or sets the "type" attribute of the HTML input element hosted by the control.
     *
     * By default, this property is set to "tel", a value that causes mobile devices to
     * show a numeric keypad that includes a negative sign and a decimal separator.
     *
     * Use this property to change the default setting if the default does not work well
     * for the current culture, device, or application. In those cases, try changing
     * the value to "number" or "text."
     *
     * Note that input elements with type "number" prevent selection in Chrome and therefore
     * is not recommended. For more details, see this link:
     * https://stackoverflow.com/questions/21177489/selectionstart-selectionend-on-input-type-number-no-longer-allowed-in-chrome
     */
    inputType: string;
    /**
     * Gets or sets the current input time.
     */
    value: Date;
    /**
     * Gets or sets the text shown in the control.
     */
    text: string;
    /**
     * Gets or sets the earliest time that the user can enter.
     *
     * For details about using the {@link min} and {@link max} properties, please see the
     * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
     */
    min: Date;
    /**
     * Gets or sets the latest time that the user can enter.
     *
     * For details about using the {@link min} and {@link max} properties, please see the
     * <a href="/wijmo/docs/Topics/Input/Using-Min-Max">Using the min and max properties</a> topic.
     */
    max: Date;
    /**
     * Gets or sets the number of minutes between entries in the drop-down list.
     *
     * The default value for this property is 15 minutes.
     * Setting it to null, zero, or any negative value disables the drop-down.
     */
    step: number;
    /**
     * Gets or sets the format used to display the selected time (see {@link Globalize}).
     *
     * The format string is expressed as a .NET-style
     * <a href="https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings" target="_blank">
     * time format string</a>.
     */
    format: string;
    /**
     * Gets or sets a mask to use while the user is editing.
     *
     * The mask format is the same used by the {@link wijmo.input.InputMask}
     * control.
     *
     * If specified, the mask must be compatible with the value of
     * the {@link format} property. For example, you can use the mask '99:99 >LL'
     * for entering short times (format 't').
     */
    mask: string;
    /**
     * Occurs when the value of the {@link value} property changes, either
     * as a result of user actions or by assignment in code.
     */
    readonly valueChanged: Event<selfModule.InputTime, EventArgs>;
    /**
     * Raises the {@link valueChanged} event.
     */
    onValueChanged(e?: EventArgs): void;
    onItemsSourceChanged(e?: EventArgs): void;
    refresh(fullUpdate?: boolean): void;
    onSelectedIndexChanged(e?: EventArgs): void;
    _clamp(value: Date): Date;
    protected _wheel(e: WheelEvent): void;
    protected _updateInputSelection(start: number): void;
    protected _updateItems(): void;
    private _getTime;
    protected _keydown(e: KeyboardEvent): void;
    protected _commitText(): void;
}
/**
 * The {@link InputDateTime} control extends the {@link InputDate} control to allows users
 * to input dates and times, either by typing complete date/time values in any format
 * supported by the {@link Globalize} class, or by picking dates from a drop-down calendar
 * and times from a drop-down list.
 *
 * Use the {@link InputDateTime.min} and {@link InputDateTime.max} properties to restrict
 * the range of dates that the user can enter.
 *
 * Use the {@link InputDateTime.timeMin} and {@link InputDateTime.timeMax} properties to
 * restrict the range of times that the user can enter.
 *
 * Use the {@link InputDateTime.value} property to gets or set the currently selected
 * date/time.
 *
 * The example below shows how you can use an {@link InputDateTime} control to edit
 * dates and times using a single control:
 *
 * {@sample Input/InputDateTime/Overview Example}
 */
export declare class InputDateTime extends InputDate {
    private _btnTm;
    private _inputTime;
    /**
     * Gets or sets the template used to instantiate {@link InputDateTime} controls.
     */
    static controlTemplate: string;
    /**
     * Initializes a new instance of the {@link InputDateTime} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the earliest time that the user can enter.
     */
    timeMin: Date;
    /**
     * Gets or sets the latest time that the user can enter.
     */
    timeMax: Date;
    /**
     * Gets or sets the format used to display times in the drop-down list.
     *
     * This property does not affect the value shown in the control's input element.
     * That value is formatted using the {@link format} property.
     *
     * The format string is expressed as a .NET-style
     * <a href="https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings" target="_blank">
     * time format string</a>.
     */
    timeFormat: string;
    /**
     * Gets or sets the number of minutes between entries in the drop-down list of times.
     */
    timeStep: number;
    /**
     * Gets a reference to the inner {@link InputTime} control so you can access its
     * full object model.
     */
    readonly inputTime: InputTime;
    protected _btnclick(e: MouseEvent): void;
    dispose(): void;
    refresh(fullUpdate?: boolean): void;
    protected _updateBtn(): void;
    protected _clamp(value: Date): Date;
    protected _commitText(): void;
    protected _setDropdown(e: HTMLElement): boolean;
    protected _updateDropDown(): void;
}
/**
 * Represents a method that returns data items asynchronously as the user types.
 */
export interface IGetItems {
    /**
     * @param query Query string typed by the user.
     * @param maxItems Maximum number of items to return.
     * @param callback Callback function to invoke when the results become available.
     */
    (query: string, maxItems: number, callback: IGetItemsCallback): void;
}
/**
 * Represents a method to invoke when the data items become available.
 */
export interface IGetItemsCallback {
    /**
     * items Array of data items retrieved asynchrounously.
     * */
    (items: any[]): void;
}
/**
 * The {@link AutoComplete} control is an input control that allows callers
 * to customize the item list as the user types.
 *
 * The control is similar to the {@link ComboBox}, except the item source is a
 * function ({@link itemsSourceFunction}) rather than a static list. For example,
 * you can look up items on remote databases as the user types.
 *
 * The example below creates an {@link AutoComplete} control and populates it using
 * a 'countries' array. The {@link AutoComplete} searches for the country as the user
 * types, and narrows down the list of countries that match the current input.
 *
 * {@sample Input/AutoComplete/Overview/purejs Example}
 */
export declare class AutoComplete extends ComboBox {
    private _cssMatch;
    private _itemsSourceFn;
    private _itemsSourceFnCallBackBnd;
    private _srchProp;
    private _minLength;
    private _maxItems;
    private _itemCount;
    private _delay;
    private _toSearch;
    private _query;
    private _rxSrch;
    private _rxHighlight;
    private _inCallback;
    private _srchProps;
    /**
     * Initializes a new instance of the {@link AutoComplete} class.
     *
     * @param element The DOM element that hosts the control, or a selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Gets or sets the minimum input length to trigger auto-complete suggestions.
     *
     * The default value for this property is <b>2</b>.
     */
    minLength: number;
    /**
     * Gets or sets the maximum number of items to display in the drop-down list.
     *
     * The default value for this property is <b>6</b>.
     */
    maxItems: number;
    /**
     * Gets or sets the delay, in milliseconds, between when a keystroke occurs
     * and when the search is performed.
     *
     * The default value for this property is <b>500</b> milliseconds.
     */
    delay: number;
    /**
     * Gets or sets a string containing a comma-separated list of properties to use
     * when searching for items.
     *
     * By default, the {@link AutoComplete} control searches for matches against the
     * property specified by the {@link displayMemberPath} property.
     * The {@link searchMemberPath} property allows you to search using additional
     * properties.
     *
     * For example, the code below would cause the control to display the company
     * name and search by company name, symbol, and country:
     *
     * ```typescript
     * import { AutoComplete } from 'wijmo/wijmo.input';
     * var ac = new AutoComplete('#autoComplete', {
     *   itemsSource: companies,
     *   displayMemberPath: 'name',
     *   searchMemberPath: 'symbol,country'
     * });
     * ```
     */
    searchMemberPath: string;
    /**
     * Gets or sets a function that provides list items dynamically as the user types.
     *
     * The function takes three parameters:
     * <ul>
     *     <li>the query string typed by the user</li>
     *     <li>the maximum number of items to return</li>
     *     <li>the callback function to call when the results become available</li>
     * </ul>
     *
     * For example:
     * <pre>autoComplete.itemsSourceFunction = function (query, max, callback) {
     *   // get results from the server
     *   var params = { query: query, max: max };
     *   $.getJSON('companycatalog.ashx', params, function (response) {
     *     // return results to the control
     *     callback(response);
     *   });
     * };</pre>
     */
    itemsSourceFunction: IGetItems;
    /**
     * Gets or sets the name of the CSS class used to highlight any parts
     * of the content that match the search terms.
     *
     * The default value for this property is <b>wj-state-match</b>.
     */
    cssMatch: string;
    _keydown(e: KeyboardEvent): void;
    _setText(text: string): void;
    _itemSourceFunctionCallback(result: any): void;
    onIsDroppedDownChanged(e?: EventArgs): void;
    protected _updateItems(): void;
    protected _filter(item: any): boolean;
    protected _getItemText(item: any, header: boolean): string;
    protected _formatListItem(sender: any, e: FormatItemEventArgs): void;
    private _enclosed;
}
/**
 * The {@link MultiAutoComplete} control allows users to pick items from lists
 * that contain custom objects or simple strings.
 *
 * The example below shows how you can use a {@link MultiAutoComplete} to
 * enter multiple items picked from a single list:
 *
 * {@sample Input/MultiAutoComplete/Overview Example}
 */
export declare class MultiAutoComplete extends AutoComplete {
    private _wjTpl;
    private _wjInput;
    private _helperInput;
    private _selItems;
    private _maxSelItems;
    private _lastInputValue;
    private _selPath;
    private _notAddItm;
    static _clsActive: string;
    /**
     * Initializes a new instance of the {@link MultiAutoComplete} class.
     *
     * @param element The DOM element that hosts the control, or a CSS selector for the host element (e.g. '#theCtrl').
     * @param options The JavaScript object containing initialization data for the control.
     */
    constructor(element: any, options?: any);
    /**
     * Overridden to prevent the control from showing the drop-down button.
     */
    showDropDownButton: boolean;
    /**
     * Gets or sets the maximum number of items that can be selected.
     *
     * Setting this property to null (the default value) allows users
     * to pick any number of items.
     */
    maxSelectedItems: number;
    /**
     * Gets or sets the name of the property used to control which
     * item will be selected.
     */
    selectedMemberPath: string;
    /**
     * Gets or sets an array containing the items that are currently
     * selected.
     */
    selectedItems: any[];
    /**
     * Occurs when the value of the {@link selectedItems} property changes.
     */
    readonly selectedItemsChanged: Event<selfModule.MultiAutoComplete, EventArgs>;
    /**
     * Raises the {@link selectedItemsChanged} event.
     */
    onSelectedItemsChanged(e?: EventArgs): void;
    onIsDroppedDownChanged(e?: EventArgs): void;
    refresh(fullUpdate?: boolean): void;
    _keydown(e: KeyboardEvent): void;
    protected _updateState(): void;
    private _keyup;
    private _addHelperInput;
    private _refreshHeader;
    private _insertToken;
    private _updateMaxItems;
    private _updateFocus;
    private _addItem;
    private _delItem;
    private _updateSelItems;
    private _createItem;
    private _itemOn;
    private _itemOff;
    private _initSeltems;
    private _getSelItem;
    private _setSelItem;
    private _clearSelIndex;
    private _hasSelectedMemeberPath;
    private _disableInput;
    private _adjustInputWidth;
    private _getItemIndex;
}
export {};
