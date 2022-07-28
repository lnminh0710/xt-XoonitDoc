﻿/*!
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

"use strict";var __extends=this&&this.__extends||function(){var extendStatics=function(e,t){return(extendStatics=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var o in t)t.hasOwnProperty(o)&&(e[o]=t[o])})(e,t)};return function(e,t){extendStatics(e,t);function __(){this.constructor=e}e.prototype=null===t?Object.create(t):(__.prototype=t.prototype,new __)}}();Object.defineProperty(exports,"__esModule",{value:!0});var wijmo_1=require("wijmo/wijmo"),wijmo_grid_1=require("wijmo/wijmo.grid"),selfModule=require("wijmo/wijmo.grid.selector"),_CLS_CB_ITEM="wj-column-selector",_CLS_CB_GROUP="wj-column-selector-group",Selector=function(){function Selector(e,t){this._col=null;this._grid=null;this._isFixedCol=!1;this._isBound=!1;this._showCheckAll=!0;this._clickBnd=this._click.bind(this);this._mousedownBnd=this._mousedown.bind(this);this.columnChanging=new wijmo_1.Event;this.columnChanged=new wijmo_1.Event;this.itemChecked=new wijmo_1.Event;this._initialize();this.column=this._getColumn(e);t&&wijmo_1.copy(this,t)}Object.defineProperty(Selector.prototype,"column",{get:function(){return this._col},set:function(e){if((e=this._getColumn(e))!=this._col&&this.onColumnChanging(new wijmo_1.CancelEventArgs)){var t=this._grid;if(t){var o=t.hostElement;t.formatItem.removeHandler(this._formatItem,this);t.removeEventListener(o,"click",this._clickBnd);t.removeEventListener(o,"mousedown",this._mousedownBnd)}var i=this._col=wijmo_1.asType(e,wijmo_grid_1.Column,!0);this._grid=t=i?i.grid:null;this._isFixedCol=!!t&&t.columns.indexOf(i)<0;i&&!this._isBound&&(i.allowMerging=!1);t&&!this._isBound&&(t.selectionMode=wijmo_grid_1.SelectionMode.Cell);if(t){o=t.hostElement;t.formatItem.addHandler(this._formatItem,this);t.addEventListener(o,"click",this._clickBnd,!0);t.addEventListener(o,"mousedown",this._mousedownBnd,!0)}this.onColumnChanged()}},enumerable:!0,configurable:!0});Object.defineProperty(Selector.prototype,"showCheckAll",{get:function(){return this._showCheckAll},set:function(e){if(e!=this._showCheckAll){this._showCheckAll=wijmo_1.asBoolean(e);this._grid&&this._grid.invalidate()}},enumerable:!0,configurable:!0});Selector.prototype.onColumnChanging=function(e){this.columnChanging.raise(this,e);return!e.cancel};Selector.prototype.onColumnChanged=function(e){this.columnChanged.raise(this,e)};Selector.prototype.onItemChecked=function(e){this.itemChecked.raise(this,e)};Selector.prototype._initialize=function(){};Selector.prototype._click=function(e){if(!e.defaultPrevented&&e.target instanceof HTMLElement){var t=this._grid,o=this._col,i=e.target,n=t.hitTest(i);if(o&&n&&n.getColumn()==o){if(i instanceof HTMLInputElement&&wijmo_1.hasClass(i,_CLS_CB_ITEM)){var s=void 0,r=n.panel.rows,l=r[n.range.topRow];if(r==t.columnHeaders.rows){s=new wijmo_grid_1.CellRange(0,0,t.rows.length-1,0);if(this._isBound){var c=t.selection;c.col=c.col2=o.index;t.select(c)}}else s=this._isGroupRow(l)?l.getCellRange():n.range;if(s.isValid){this._setRangeChecked(i.checked,s);this.onItemChecked()}t.invalidate();e.preventDefault();return}if(wijmo_1.hasClass(i,"wj-cell")&&t.bigCheckboxes&&this._isBound&&(this._isFixedCol||this._isGroupRow(n.getRow()))){var _=i.querySelector("input."+_CLS_CB_ITEM);if(_ instanceof HTMLInputElement){_.click();e.preventDefault()}}}}};Selector.prototype._mousedown=function(e){var t=this._grid,o=this._col,i=t.editableCollectionView;if(this._isBound&&o&&i&&i.currentEditItem){var n=t.hitTest(e);if(n.getColumn()==o&&this._isGroupRow(n.getRow())){var s=wijmo_1.closestClass(e.target,_CLS_CB_GROUP);s instanceof HTMLInputElement&&s.click()}}};Selector.prototype._isGroupRow=function(e){return e instanceof wijmo_grid_1.GroupRow&&(!this._grid.childItemsPath||e.getCellRange().rowSpan>1)};Selector.prototype._getRowChecked=function(e,t){void 0===t&&(t=e);for(var o=0,i=0,n=this._col._binding,s=e;s<=t&&(!o||!i);s++){var r=this._grid.rows[s],l=r.dataItem;if(l&&!this._isGroupRow(r)){(this._isBound?n.getValue(l):r.isSelected)?o++:i++}}return!(!o||i)||!(i&&!o)&&null};Selector.prototype._setRangeChecked=function(e,t){var o=this._grid,i=o.rows,n=this._col,s=n?n._binding:null,r=o.selection,l=this._isBound?o.editableCollectionView:null;if(!this._isBound||!o.isReadOnly&&l&&s){l&&l.beginUpdate();for(var c=t.bottomRow;c>=t.topRow;c--){var _=i[c],a=_.dataItem;if(a)if(this._isGroupRow(_))o.childItemsPath&&!this._isBound&&(_.isSelected=e);else if(this._isBound){l&&l.editItem(a);s.setValue(a,e)}else _.isSelected=e}if(l){l.commitEdit();l.endUpdate();o.selection=r}}};Selector.prototype._formatItem=function(e,t){var o=t.getColumn(),i=e.editRange;if(o&&o==this._col&&(!i||!i.contains(t.row,t.col))&&t.panel.rows!=e.columnFooters.rows){var n=t.getRow(),s=t.cell,r="",l=void 0;if(t.panel.rows==e.columnHeaders.rows){if(this._showCheckAll&&t.range.bottomRow==t.panel.rows.length-1){l=this._getRowChecked(0,e.rows.length-1);r=_CLS_CB_ITEM+" "+_CLS_CB_GROUP}}else if(this._isGroupRow(n)){var c=n.getCellRange();l=this._getRowChecked(c.row,c.row2);r=_CLS_CB_ITEM+" "+_CLS_CB_GROUP}else if(n.dataItem&&!this._isBound){l=this._getRowChecked(t.row);r=_CLS_CB_ITEM}if(r){if(this._isFixedCol||this._isBound&&this._isGroupRow(n)){var _=s.querySelector("."+wijmo_grid_1.CellFactory._WJC_COLLAPSE);s.textContent="";_&&s.appendChild(_)}var a=wijmo_1.createElement('<label><input type="checkbox" class="'+r+'" tabindex="-1"><span></span></label>'),h=a.querySelector("input");h.checked=l;null==l&&(h.indeterminate=!0);if(this._isBound&&(o.isReadOnly||e.selectionMode==wijmo_grid_1.SelectionMode.None)){h.disabled=!0;h.style.cursor="default"}s.insertBefore(a,s.firstChild)}}};Selector.prototype._getColumn=function(e){if(e instanceof wijmo_grid_1.FlexGrid){var t=e,o=t.rowHeaders.columns;e=t.headersVisibility&wijmo_grid_1.HeadersVisibility.Row&&o.length?o[0]:t.columns[0]}this._grid&&(wijmo_1.isString(e)||wijmo_1.isNumber(e))&&(e=this._grid.getColumn(e));return e instanceof wijmo_grid_1.Column?e:null};return Selector}();exports.Selector=Selector;var BooleanChecker=function(e){__extends(BooleanChecker,e);function BooleanChecker(t,o){return e.call(this,t,o)||this}BooleanChecker.prototype.onColumnChanged=function(t){var o=this.column;wijmo_1.assert(!o||o.dataType==wijmo_1.DataType.Boolean,"BooleanChecker should be bound to boolean columns");e.prototype.onColumnChanged.call(this,t)};BooleanChecker.prototype._initialize=function(){this._isBound=!0};return BooleanChecker}(Selector);exports.BooleanChecker=BooleanChecker;wijmo_1._registerModule("wijmo.grid.selector",selfModule);