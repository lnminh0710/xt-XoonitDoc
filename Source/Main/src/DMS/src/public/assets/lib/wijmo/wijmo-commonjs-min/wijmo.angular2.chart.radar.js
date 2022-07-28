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

"use strict";var __extends=this&&this.__extends||function(){var extendStatics=function(e,t){return(extendStatics=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])})(e,t)};return function(e,t){extendStatics(e,t);function __(){this.constructor=e}e.prototype=null===t?Object.create(t):(__.prototype=t.prototype,new __)}}(),__decorate=this&&this.__decorate||function(e,t,r,a){var i,o=arguments.length,n=o<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(o<3?i(n):o>3?i(t,r,n):i(t,r))||n);return o>3&&n&&Object.defineProperty(t,r,n),n},__param=this&&this.__param||function(e,t){return function(r,a){t(r,a,e)}};Object.defineProperty(exports,"__esModule",{value:!0});var core_1=require("@angular/core"),common_1=require("@angular/common"),forms_1=require("@angular/forms"),wijmo_angular2_directiveBase_1=require("wijmo/wijmo.angular2.directiveBase"),wjcChartRadar=require("wijmo/wijmo.chart.radar"),wjFlexRadarMeta={selector:"wj-flex-radar",template:"<div><ng-content></ng-content></div>",inputs:["asyncBindings","wjModelProperty","renderEngine","isDisabled","binding","footer","header","selectionMode","palette","plotMargin","footerStyle","headerStyle","tooltipContent","itemsSource","bindingX","interpolateNulls","legendToggle","symbolSize","options","selection","itemFormatter","labelContent","chartType","startAngle","totalAngle","reversed","stacking"],outputs:["initialized","gotFocusNg: gotFocus","lostFocusNg: lostFocus","refreshingNg: refreshing","refreshedNg: refreshed","renderingNg: rendering","renderedNg: rendered","selectionChangedNg: selectionChanged","selectionChangePC: selectionChange","itemsSourceChangingNg: itemsSourceChanging","itemsSourceChangedNg: itemsSourceChanged","seriesVisibilityChangedNg: seriesVisibilityChanged"],providers:[{provide:forms_1.NG_VALUE_ACCESSOR,useFactory:wijmo_angular2_directiveBase_1.WjValueAccessorFactory,multi:!0,deps:["WjComponent"]}]};exports.wjFlexRadarMeta=wjFlexRadarMeta;var WjFlexRadar=function(e){__extends(WjFlexRadar,e);function WjFlexRadar(t,r,a){var i=e.call(this,wijmo_angular2_directiveBase_1.WjDirectiveBehavior.getHostElement(t,r))||this;i.isInitialized=!1;i._wjBehaviour=wijmo_angular2_directiveBase_1.WjDirectiveBehavior.attach(i,t,r,a);i.created();return i}t=WjFlexRadar;WjFlexRadar.prototype.created=function(){};WjFlexRadar.prototype.ngOnInit=function(){this._wjBehaviour.ngOnInit()};WjFlexRadar.prototype.ngAfterViewInit=function(){this._wjBehaviour.ngAfterViewInit()};WjFlexRadar.prototype.ngOnDestroy=function(){this._wjBehaviour.ngOnDestroy()};WjFlexRadar.prototype.addEventListener=function(t,r,a,i){var o=this;void 0===i&&(i=!1);var n=wijmo_angular2_directiveBase_1.WjDirectiveBehavior,s=n.ngZone;s&&n.outsideZoneEvents[r]?s.runOutsideAngular((function(){e.prototype.addEventListener.call(o,t,r,a,i)})):e.prototype.addEventListener.call(this,t,r,a,i)};Object.defineProperty(WjFlexRadar.prototype,"tooltipContent",{get:function(){return this.tooltip.content},set:function(e){this.tooltip.content=e},enumerable:!0,configurable:!0});Object.defineProperty(WjFlexRadar.prototype,"labelContent",{get:function(){return this.dataLabel.content},set:function(e){this.dataLabel.content=e},enumerable:!0,configurable:!0});var t;WjFlexRadar.meta={outputs:wjFlexRadarMeta.outputs,changeEvents:{selectionChanged:["selection"]}};return WjFlexRadar=t=__decorate([core_1.Component({selector:wjFlexRadarMeta.selector,template:wjFlexRadarMeta.template,inputs:wjFlexRadarMeta.inputs,outputs:wjFlexRadarMeta.outputs,providers:[{provide:"WjComponent",useExisting:core_1.forwardRef((function(){return t}))}].concat(wjFlexRadarMeta.providers)}),__param(0,core_1.Inject(core_1.ElementRef)),__param(1,core_1.Inject(core_1.Injector)),__param(2,core_1.Inject("WjComponent")),__param(2,core_1.SkipSelf()),__param(2,core_1.Optional())],WjFlexRadar)}(wjcChartRadar.FlexRadar);exports.WjFlexRadar=WjFlexRadar;var wjFlexRadarAxisMeta={selector:"wj-flex-radar-axis",template:"",inputs:["wjProperty","axisLine","format","labels","majorGrid","majorTickMarks","majorUnit","max","min","position","reversed","title","labelAngle","minorGrid","minorTickMarks","minorUnit","origin","logBase","plotArea","labelAlign","name","overlappingLabels","labelPadding","itemFormatter","itemsSource","binding"],outputs:["initialized","rangeChangedNg: rangeChanged"],providers:[]};exports.wjFlexRadarAxisMeta=wjFlexRadarAxisMeta;var WjFlexRadarAxis=function(e){__extends(WjFlexRadarAxis,e);function WjFlexRadarAxis(t,r,a){var i=e.call(this)||this;i.isInitialized=!1;i.wjProperty="axes";i._wjBehaviour=wijmo_angular2_directiveBase_1.WjDirectiveBehavior.attach(i,t,r,a);i.created();return i}t=WjFlexRadarAxis;WjFlexRadarAxis.prototype.created=function(){};WjFlexRadarAxis.prototype.ngOnInit=function(){this._wjBehaviour.ngOnInit()};WjFlexRadarAxis.prototype.ngAfterViewInit=function(){this._wjBehaviour.ngAfterViewInit()};WjFlexRadarAxis.prototype.ngOnDestroy=function(){this._wjBehaviour.ngOnDestroy()};var t;WjFlexRadarAxis.meta={outputs:wjFlexRadarAxisMeta.outputs};return WjFlexRadarAxis=t=__decorate([core_1.Component({selector:wjFlexRadarAxisMeta.selector,template:wjFlexRadarAxisMeta.template,inputs:wjFlexRadarAxisMeta.inputs,outputs:wjFlexRadarAxisMeta.outputs,providers:[{provide:"WjComponent",useExisting:core_1.forwardRef((function(){return t}))}].concat(wjFlexRadarAxisMeta.providers)}),__param(0,core_1.Inject(core_1.ElementRef)),__param(1,core_1.Inject(core_1.Injector)),__param(2,core_1.Inject("WjComponent")),__param(2,core_1.SkipSelf()),__param(2,core_1.Optional())],WjFlexRadarAxis)}(wjcChartRadar.FlexRadarAxis);exports.WjFlexRadarAxis=WjFlexRadarAxis;var wjFlexRadarSeriesMeta={selector:"wj-flex-radar-series",template:"<div><ng-content></ng-content></div>",inputs:["asyncBindings","wjProperty","axisX","axisY","binding","bindingX","cssClass","name","style","altStyle","symbolMarker","symbolSize","symbolStyle","visibility","itemsSource","interpolateNulls","tooltipContent","itemFormatter","chartType"],outputs:["initialized","renderingNg: rendering","renderedNg: rendered","visibilityChangePC: visibilityChange"],providers:[]};exports.wjFlexRadarSeriesMeta=wjFlexRadarSeriesMeta;var WjFlexRadarSeries=function(e){__extends(WjFlexRadarSeries,e);function WjFlexRadarSeries(t,r,a){var i=e.call(this)||this;i.isInitialized=!1;i.wjProperty="series";i._wjBehaviour=wijmo_angular2_directiveBase_1.WjDirectiveBehavior.attach(i,t,r,a);i.created();return i}t=WjFlexRadarSeries;WjFlexRadarSeries.prototype.created=function(){};WjFlexRadarSeries.prototype.ngOnInit=function(){this._wjBehaviour.ngOnInit()};WjFlexRadarSeries.prototype.ngAfterViewInit=function(){this._wjBehaviour.ngAfterViewInit()};WjFlexRadarSeries.prototype.ngOnDestroy=function(){this._wjBehaviour.ngOnDestroy()};var t;WjFlexRadarSeries.meta={outputs:wjFlexRadarSeriesMeta.outputs,changeEvents:{"chart.seriesVisibilityChanged":["visibility"]},siblingId:"series"};return WjFlexRadarSeries=t=__decorate([core_1.Component({selector:wjFlexRadarSeriesMeta.selector,template:wjFlexRadarSeriesMeta.template,inputs:wjFlexRadarSeriesMeta.inputs,outputs:wjFlexRadarSeriesMeta.outputs,providers:[{provide:"WjComponent",useExisting:core_1.forwardRef((function(){return t}))}].concat(wjFlexRadarSeriesMeta.providers)}),__param(0,core_1.Inject(core_1.ElementRef)),__param(1,core_1.Inject(core_1.Injector)),__param(2,core_1.Inject("WjComponent")),__param(2,core_1.SkipSelf()),__param(2,core_1.Optional())],WjFlexRadarSeries)}(wjcChartRadar.FlexRadarSeries);exports.WjFlexRadarSeries=WjFlexRadarSeries;var moduleExports=[WjFlexRadar,WjFlexRadarAxis,WjFlexRadarSeries],WjChartRadarModule=function(){function WjChartRadarModule(){}return WjChartRadarModule=__decorate([core_1.NgModule({imports:[common_1.CommonModule],declarations:moduleExports.slice(),exports:moduleExports.slice()})],WjChartRadarModule)}();exports.WjChartRadarModule=WjChartRadarModule;