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

"use strict";var __extends=this&&this.__extends||function(){var extendStatics=function(t,e){return(extendStatics=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])})(t,e)};return function(t,e){extendStatics(t,e);function __(){this.constructor=t}t.prototype=null===e?Object.create(e):(__.prototype=e.prototype,new __)}}();Object.defineProperty(exports,"__esModule",{value:!0});var wijmo_1=require("wijmo/wijmo"),wijmo_chart_1=require("wijmo/wijmo.chart"),selfModule=require("wijmo/wijmo.chart.finance"),FinancialSeries=function(t){__extends(FinancialSeries,t);function FinancialSeries(){return null!==t&&t.apply(this,arguments)||this}Object.defineProperty(FinancialSeries.prototype,"chartType",{get:function(){return this._finChartType},set:function(t){if((t=wijmo_1.asEnum(t,FinancialChartType,!0))!=this._finChartType){this._finChartType=t;this._invalidate()}},enumerable:!0,configurable:!0});FinancialSeries.prototype._getChartType=function(){var t=null;switch(this.chartType){case FinancialChartType.Area:t=wijmo_chart_1.ChartType.Area;break;case FinancialChartType.Line:case FinancialChartType.Kagi:case FinancialChartType.PointAndFigure:t=wijmo_chart_1.ChartType.Line;break;case FinancialChartType.Column:case FinancialChartType.ColumnVolume:t=wijmo_chart_1.ChartType.Column;break;case FinancialChartType.LineSymbols:t=wijmo_chart_1.ChartType.LineSymbols;break;case FinancialChartType.Scatter:t=wijmo_chart_1.ChartType.Scatter;break;case FinancialChartType.Candlestick:case FinancialChartType.Renko:case FinancialChartType.HeikinAshi:case FinancialChartType.LineBreak:case FinancialChartType.EquiVolume:case FinancialChartType.CandleVolume:case FinancialChartType.ArmsCandleVolume:t=wijmo_chart_1.ChartType.Candlestick;break;case FinancialChartType.HighLowOpenClose:t=wijmo_chart_1.ChartType.HighLowOpenClose}return t};FinancialSeries.prototype.getDataRect=function(t,e){if(e)return e;var i=this.getValues(0),a=this.getValues(1)||(this.chart._xvals&&this.chart._xvals.length?this.chart._xvals:null),n=this._getBinding(0),r=this._getBinding(1),s=this._getBinding(2),o=this._getBinding(3),l=(this._plotter,this._getChartType()||this.chart._getChartType());if(l!==wijmo_chart_1.ChartType.HighLowOpenClose&&l!==wijmo_chart_1.ChartType.Candlestick||n===r)return null;if(i){for(var h=NaN,_=NaN,c=NaN,u=NaN,g=i.length,p=0;p<g;p++){var m=this._getItem(p),d=i[p];if(isFinite(d)){[d,r?m[r]:null,s?m[s]:null,o?m[o]:null].forEach((function(t){if(wijmo_chart_1._DataInfo.isValid(t)&&null!==t){(isNaN(_)||t<_)&&(_=t);(isNaN(u)||t>u)&&(u=t)}}))}if(a){var f=a[p];isFinite(f)&&(isNaN(h)?h=c=f:f<h?h=f:f>c&&(c=f))}}if(!a){h=0;c=g-1}if(!isNaN(_))return new wijmo_1.Rect(h,_,c-h,u-_)}return null};return FinancialSeries}(wijmo_chart_1.SeriesBase);exports.FinancialSeries=FinancialSeries;function _trunc(t){wijmo_1.asNumber(t,!0,!1);return t>0?Math.floor(t):Math.ceil(t)}exports._trunc=_trunc;function _sum(t){arguments.length>1&&(t=Array.prototype.slice.call(arguments));wijmo_1.asArray(t,!1);return t.reduce((function(t,e){return t+wijmo_1.asNumber(e)}),0)}exports._sum=_sum;function _average(t){arguments.length>1&&(t=Array.prototype.slice.call(arguments));wijmo_1.asArray(t,!1);return _sum(t)/t.length}exports._average=_average;function _minimum(t){arguments.length>1&&(t=Array.prototype.slice.call(arguments));wijmo_1.asArray(t,!1);return Math.min.apply(null,t)}exports._minimum=_minimum;function _maximum(t){arguments.length>1&&(t=Array.prototype.slice.call(arguments));wijmo_1.asArray(t,!1);return Math.max.apply(null,t)}exports._maximum=_maximum;function _variance(t){arguments.length>1&&(t=Array.prototype.slice.call(arguments));wijmo_1.asArray(t,!1);var e=_average(t);return _average(t.map((function(t){return Math.pow(t-e,2)})))}exports._variance=_variance;function _stdDeviation(t){arguments.length>1&&(t=Array.prototype.slice.call(arguments));wijmo_1.asArray(t,!1);return Math.sqrt(_variance(t))}exports._stdDeviation=_stdDeviation;function _avgTrueRng(t,e,i,a){void 0===a&&(a=14);wijmo_1.asArray(t,!1);wijmo_1.asArray(e,!1);wijmo_1.asArray(i,!1);wijmo_1.asInt(a,!1,!0);var n=_trueRng(t,e,i,a),r=Math.min(t.length,e.length,i.length,n.length),s=[];wijmo_1.assert(r>a&&a>1,"Average True Range period must be an integer less than the length of the data and greater than one.");for(var o=0;o<r;o++){wijmo_1.asNumber(t[o],!1);wijmo_1.asNumber(e[o],!1);wijmo_1.asNumber(i[o],!1);wijmo_1.asNumber(n[o],!1);o+1===a?s.push(_average(n.slice(0,a))):o+1>a&&s.push(((a-1)*s[s.length-1]+n[o])/a)}return s}exports._avgTrueRng=_avgTrueRng;function _trueRng(t,e,i,a){void 0===a&&(a=14);wijmo_1.asArray(t,!1);wijmo_1.asArray(e,!1);wijmo_1.asArray(i,!1);wijmo_1.asInt(a,!1,!0);var n=Math.min(t.length,e.length,i.length),r=[];wijmo_1.assert(n>a&&a>1,"True Range period must be an integer less than the length of the data and greater than one.");for(var s=0;s<n;s++){wijmo_1.asNumber(t[s],!1);wijmo_1.asNumber(e[s],!1);wijmo_1.asNumber(i[s],!1);0===s?r.push(t[s]-e[s]):r.push(Math.max(t[s]-e[s],Math.abs(t[s]-i[s-1]),Math.abs(e[s]-i[s-1])))}return r}exports._trueRng=_trueRng;function _sma(t,e){wijmo_1.asArray(t,!1);wijmo_1.asNumber(e,!1,!0);wijmo_1.assert(t.length>e&&e>1,"Simple Moving Average period must be an integer less than the length of the data and greater than one.");for(var i=[],a=e;a<=t.length;a++)i.push(_average(t.slice(a-e,a)));return i}exports._sma=_sma;function _ema(t,e){wijmo_1.asArray(t,!1);wijmo_1.asNumber(e,!1,!0);wijmo_1.assert(t.length>e&&e>1,"Exponential Moving Average period must be an integer less than the length of the data and greater than one.");var i=[],a=2/(e+1),n=_sma(t,e);t=t.slice(e-1);for(var r=0;r<t.length;r++)0===r?i.push(n[0]):i.push((t[r]-i[r-1])*a+i[r-1]);return i}exports._ema=_ema;function _range(t,e,i){void 0===i&&(i=1);wijmo_1.asNumber(t,!1);wijmo_1.asNumber(e,!1);wijmo_1.asNumber(i,!1);wijmo_1.assert(t<e,"begin argument must be less than end argument.");for(var a=[],n=t;n<=e;n+=i)a.push(n);return a}exports._range=_range;var _BaseCalculator=function(){function _BaseCalculator(t,e,i,a){this.highs=t;this.lows=e;this.opens=i;this.closes=a}_BaseCalculator.prototype.calculate=function(){};return _BaseCalculator}();exports._BaseCalculator=_BaseCalculator;var _HeikinAshiCalculator=function(t){__extends(_HeikinAshiCalculator,t);function _HeikinAshiCalculator(e,i,a,n){return t.call(this,e,i,a,n)||this}_HeikinAshiCalculator.prototype.calculate=function(){var t,e,i,a,n=Math.min(this.highs.length,this.lows.length,this.opens.length,this.closes.length),r=[];if(n<=0)return r;for(var s=0;s<n;s++){a=_average(this.highs[s],this.lows[s],this.opens[s],this.closes[s]);if(0===s){i=_average(this.opens[s],this.closes[s]);t=this.highs[s];e=this.lows[s]}else{i=_average(r[s-1].open,r[s-1].close);t=Math.max(this.highs[s],i,a);e=Math.min(this.lows[s],i,a)}r.push({high:t,low:e,close:a,open:i,pointIndex:s,x:null})}return r};return _HeikinAshiCalculator}(_BaseCalculator);exports._HeikinAshiCalculator=_HeikinAshiCalculator;var _BaseRangeCalculator=function(t){__extends(_BaseRangeCalculator,t);function _BaseRangeCalculator(e,i,a,n,r,s,o,l){var h=t.call(this,e,i,a,n)||this;h.xs=r;h.size=s;h.unit=o;h.fields=l;return h}_BaseRangeCalculator.prototype._getValues=function(){var t,e=[],i=Math.min(this.highs.length,this.lows.length,this.opens.length,this.closes.length);switch(this.fields){case DataFields.High:e=this.highs;break;case DataFields.Low:e=this.lows;break;case DataFields.Open:e=this.opens;break;case DataFields.HL2:for(t=0;t<i;t++)e.push(_average(this.highs[t],this.lows[t]));break;case DataFields.HLC3:for(t=0;t<i;t++)e.push(_average(this.highs[t],this.lows[t],this.closes[t]));break;case DataFields.HLOC4:for(t=0;t<i;t++)e.push(_average(this.highs[t],this.lows[t],this.opens[t],this.closes[t]));break;case DataFields.Close:default:e=this.closes}return e};_BaseRangeCalculator.prototype._getSize=function(){var t=this.unit===RangeMode.ATR?_avgTrueRng(this.highs,this.lows,this.closes,this.size):null;return this.unit===RangeMode.ATR?t[t.length-1]:this.size};return _BaseRangeCalculator}(_BaseCalculator);exports._BaseRangeCalculator=_BaseRangeCalculator;var _LineBreakCalculator=function(t){__extends(_LineBreakCalculator,t);function _LineBreakCalculator(e,i,a,n,r,s){return t.call(this,e,i,a,n,r,s)||this}_LineBreakCalculator.prototype.calculate=function(){var t=null!==this.xs&&this.xs.length>0,e=this.closes.length,i=[],a=[[],[]];if(e<=0)return i;for(var n,r,s,o,l,h,_=[],c=1;c<e;c++){o=i.length-1;r=t?this.xs[c]:c;s=this.closes[c];if(-1===o){if((n=this.closes[0])===s)continue}else{_=this._trendExists(a)||1===this.size?a[0].slice(-this.size).concat(a[1].slice(-this.size)):a[0].slice(1-this.size).concat(a[1].slice(1-this.size));l=Math.max.apply(null,_);h=Math.min.apply(null,_);if(s>l)n=Math.max(a[0][o],a[1][o]);else{if(!(s<h))continue;n=Math.min(a[0][o],a[1][o])}}a[0].push(n);a[1].push(s);i.push({high:Math.max(n,s),low:Math.min(n,s),open:n,close:s,x:r,pointIndex:c})}return i};_LineBreakCalculator.prototype._trendExists=function(t){if(t[1].length<this.size)return!1;var e,i=!1,a=t[1].slice(-this.size);for(e=1;e<this.size&&(i=a[e]>a[e-1]);e++);if(!i)for(e=1;e<this.size&&(i=a[e]<a[e-1]);e++);return i};return _LineBreakCalculator}(_BaseRangeCalculator);exports._LineBreakCalculator=_LineBreakCalculator;var _KagiCalculator=function(t){__extends(_KagiCalculator,t);function _KagiCalculator(e,i,a,n,r,s,o,l){return t.call(this,e,i,a,n,r,s,o,l)||this}_KagiCalculator.prototype.calculate=function(){var t,e,i,a,n,r,s,o,l,h=this._getSize(),_=Math.min(this.highs.length,this.lows.length,this.opens.length,this.closes.length),c=this._getValues(),u=null!==this.xs&&this.xs.length>0,g=[],p=[[],[]];if(_<=0)return g;for(var m=1;m<_;m++){a=g.length-1;e=u?this.xs[m]:m;l=m;o=!1;if(this.fields===DataFields.HighLow)if(-1===a)if(this.highs[m]>this.highs[0])i=this.highs[m];else{if(!(this.lows[m]<this.lows[0]))continue;i=this.lows[m]}else if((s=p[1][a]-p[0][a])>0)if(this.highs[m]>p[1][a])i=this.highs[m];else{if(!(this.lows[m]<p[1][a]))continue;i=this.lows[m]}else if(this.lows[m]<p[1][a])i=this.lows[m];else{if(!(this.highs[m]>p[1][a]))continue;i=this.highs[m]}else i=c[m];this.unit===RangeMode.Percentage&&(h=i*this.size);if(-1===a){e=u?this.xs[0]:0;l=0;t=this.fields===DataFields.HighLow?null==this.highs[0]?this.highs[this.highs.length-1]:this.highs[0]:null==c[0]?c[c.length-1]:c[0];if((s=Math.abs(t-i)||0)<h)continue}else{s=p[1][a]-p[0][a];r=Math.max(p[0][a],p[1][a]);n=Math.min(p[0][a],p[1][a]);if(s>0)if(i>r)o=!0;else{if(!((s=r-i)>=h))continue;t=r}else if(i<n)o=!0;else{if(!((s=i-n)>=h))continue;t=n}}if(o){p[1][a]=i;g[a].close=i;g[a].high=Math.max(g[a].open,g[a].close);g[a].low=Math.min(g[a].open,g[a].close)}else{p[0].push(t);p[1].push(i);g.push({high:Math.max(t,i),low:Math.min(t,i),open:t,close:i,x:e,pointIndex:l})}}return g};return _KagiCalculator}(_BaseRangeCalculator);exports._KagiCalculator=_KagiCalculator;var _RenkoCalculator=function(t){__extends(_RenkoCalculator,t);function _RenkoCalculator(e,i,a,n,r,s,o,l,h){void 0===h&&(h=!1);var _=t.call(this,e,i,a,n,r,s,o,l)||this;_.rounding=h;return _}_RenkoCalculator.prototype.calculate=function(){var t,e,i,a,n,r,s,o=this._getSize(),l=Math.min(this.highs.length,this.lows.length,this.opens.length,this.closes.length),h=null!==this.xs&&this.xs.length>0,_=this._getValues(),c=[],u=[[],[]];if(l<=0)return c;for(var g=1;g<l;g++){a=c.length-1;e=h?this.xs[g]:g;if(this.fields===DataFields.HighLow)if(-1===a)if(this.highs[g]-this.highs[0]>o){t=this.highs[0];i=this.highs[g]}else{if(!(this.lows[0]-this.lows[g]>o))continue;t=this.lows[0];i=this.lows[g]}else{n=Math.min(u[0][a],u[1][a]);r=Math.max(u[0][a],u[1][a]);if(this.highs[g]-r>o){t=r;i=this.highs[g]}else{if(!(n-this.lows[g]>o))continue;t=n;i=this.lows[g]}}else{i=_[g];if(-1===a)t=_[0];else{n=Math.min(u[0][a],u[1][a]);if(i>(r=Math.max(u[0][a],u[1][a])))t=r;else{if(!(i<n))continue;t=n}}}s=i-t;if(!(Math.abs(s)<o)){s=_trunc(s/o);for(var p=0;p<Math.abs(s);p++){var m={};this.rounding&&(t=this._round(t,o));u[0].push(t);m.open=t;t=s>0?t+o:t-o;u[1].push(t);m.close=t;m.x=e;m.pointIndex=g;m.high=Math.max(m.open,m.close);m.low=Math.min(m.open,m.close);c.push(m)}}}return c};_RenkoCalculator.prototype._round=function(t,e){return Math.round(t/e)*e};return _RenkoCalculator}(_BaseRangeCalculator);exports._RenkoCalculator=_RenkoCalculator;var DataFields,RangeMode,PointAndFigureScaling,_BaseRangePlotter=function(t){__extends(_BaseRangePlotter,t);function _BaseRangePlotter(){var e=t.call(this)||this;e._symFactor=.7;e.clear();return e}_BaseRangePlotter.prototype.clear=function(){t.prototype.clear.call(this);this._rangeValues=null;this._rangeXLabels=null;this._calculator=null};_BaseRangePlotter.prototype.unload=function(){t.prototype.unload.call(this);for(var e,i,a=0;a<this.chart.series.length;a++)(e=this.chart.series[a])&&(i=e._getAxisX())&&i.itemsSource&&(i.itemsSource=null)};_BaseRangePlotter.prototype.adjustLimits=function(t,e){var i,a,n,r=0,s=0,o=0,l=0,h=this.chart._xDataType===wijmo_1.DataType.Date?.5:0;wijmo_1.assert(this.chart.series.length<=1,"Current FinancialChartType only supports a single series");for(var _=0;_<this.chart.series.length;_++){i=this.chart.series[_];this._calculate(i);if(!(this._rangeValues.length<=0||this._rangeXLabels.length<=0)){(a=this._rangeValues.map((function(t){return t.open}))).push.apply(a,this._rangeValues.map((function(t){return t.close})));n=this._rangeXLabels.map((function(t){return t.value}));o=Math.min.apply(null,a);l=Math.max.apply(null,a);r=Math.min.apply(null,n);s=Math.max.apply(null,n);i._getAxisX().itemsSource=this._rangeXLabels}}r-=h;return new wijmo_1.Rect(r,o,s-r+h,l-o)};_BaseRangePlotter.prototype.plotSeries=function(t,e,i,a,n,r,s){var o=this;this._calculate(a);var l=this.chart.series.indexOf(a),h=this._rangeValues.length,_=e.actualMin,c=e.actualMax,u=this._DEFAULT_WIDTH,g=this._symFactor,p=a._getSymbolFill(l),m=a._getAltSymbolFill(l)||"transparent",d=a._getSymbolStroke(l),f=a._getAltSymbolStroke(l)||d;t.strokeWidth=u;for(var w,y,v,C,P=0,x=this.getItemFormatter(a),k=0;k<h;k++){w=k;if(wijmo_chart_1._DataInfo.isValid(w)&&_<=w&&w<=c){y=this._rangeValues[k].open;v=this._rangeValues[k].close;t.fill=y>v?p:m;t.stroke=y>v?d:f;C=this._getDataPoint(l,k,a,Math.max(y,v));t.startGroup();if(x){var F=new wijmo_chart_1.HitTestInfo(this.chart,new wijmo_1.Point(e.convert(w),i.convert(v)),wijmo_chart_1.ChartElement.SeriesSymbol);F._setData(a,k);F._setDataPoint(C);x(t,F,(function(){o._drawSymbol(t,e,i,l,P,g,w,y,v,C)}))}else this._drawSymbol(t,e,i,l,P,g,w,y,v,C);t.endGroup();a._setPointIndex(k,P);P++}}};_BaseRangePlotter.prototype._drawSymbol=function(t,e,i,a,n,r,s,o,l,h){var _,c,u,g,p;if((u=e.convert(s-.5*r))>(g=e.convert(s+.5*r))){var m=u;u=g;g=m}if(wijmo_chart_1._DataInfo.isValid(o)&&wijmo_chart_1._DataInfo.isValid(l)){o=i.convert(o);l=i.convert(l);c=(_=Math.min(o,l))+Math.abs(o-l);t.drawRect(u,_,g-u,c-_);(p=new wijmo_chart_1._RectArea(new wijmo_1.Rect(u,_,g-u,c-_))).tag=h;this.hitTester.add(p,a)}};_BaseRangePlotter.prototype._getDataPoint=function(t,e,i,a){var n=e,r=new wijmo_chart_1._DataPoint(t,e,n,a),s=i._getItem(this._rangeValues[e].pointIndex),o=i.bindingX||this.chart.bindingX,l=i._getBinding(0),h=i._getBinding(1),_=i._getBinding(2),c=i._getBinding(3),u=i._getAxisY();r.item=wijmo_chart_1._BasePlotter.cloneStyle(s,[]);r.item[l]=this._rangeValues[e].high;r.item[h]=this._rangeValues[e].low;r.item[_]=this._rangeValues[e].open;r.item[c]=this._rangeValues[e].close;r.y=this._rangeValues[e].close;r.yfmt=u._formatValue(this._rangeValues[e].close);r.x=r.item[o];r.xfmt=this._rangeXLabels[e]._text;return r};_BaseRangePlotter.prototype._init=function(){this._rangeValues=[];this._rangeXLabels=[]};_BaseRangePlotter.prototype._calculate=function(t){};_BaseRangePlotter.prototype._generateXLabels=function(t){var e,i=this,a=t._getAxisX(),n=t.getDataType(1)||this.chart._xDataType;this._rangeValues.forEach((function(t,r){var s=t.x;e=n===wijmo_1.DataType.Date?wijmo_1.Globalize.format(wijmo_chart_1.FlexChart._fromOADate(s),a.format||"d"):n===wijmo_1.DataType.Number?a._formatValue(s):null!==n&&n!==wijmo_1.DataType.String||!i.chart._xlabels?s.toString():i.chart._xlabels[s];i._rangeXLabels.push({value:r,text:e,_text:e})}),this)};return _BaseRangePlotter}(wijmo_chart_1._BasePlotter);exports._BaseRangePlotter=_BaseRangePlotter;!function(t){t[t.Close=0]="Close";t[t.High=1]="High";t[t.Low=2]="Low";t[t.Open=3]="Open";t[t.HighLow=4]="HighLow";t[t.HL2=5]="HL2";t[t.HLC3=6]="HLC3";t[t.HLOC4=7]="HLOC4"}(DataFields=exports.DataFields||(exports.DataFields={}));!function(t){t[t.Fixed=0]="Fixed";t[t.ATR=1]="ATR";t[t.Percentage=2]="Percentage"}(RangeMode=exports.RangeMode||(exports.RangeMode={}));!function(t){t[t.Traditional=0]="Traditional";t[t.Fixed=1]="Fixed";t[t.Dynamic=2]="Dynamic"}(PointAndFigureScaling=exports.PointAndFigureScaling||(exports.PointAndFigureScaling={}));var _PointAndFigurePlotter=function(t){__extends(_PointAndFigurePlotter,t);function _PointAndFigurePlotter(){return t.call(this)||this}_PointAndFigurePlotter.prototype.clear=function(){t.prototype.clear.call(this);this._boxSize=null;this._fields=null;this._reversal=null;this._scaling=null};_PointAndFigurePlotter.prototype.unload=function(){t.prototype.unload.call(this);this.chart.axisX.itemsSource=this._xlbls};_PointAndFigurePlotter.prototype._init=function(){this._boxSize=this.getNumOption("boxSize","pointAndFigure")||1;this._reversal=this.getNumOption("reversal","pointAndFigure")||3;this._period=this.getNumOption("period","pointAndFigure")||20;this._fields=this.getOption("fields","pointAndFigure")||DataFields.Close;this._fields=wijmo_1.asEnum(this._fields,DataFields,!0);wijmo_1.assert(this._fields==DataFields.Close||this._fields==DataFields.HighLow,"Only DataFields.Close and DataFields.HighLow are supported");this._scaling=this.getOption("scaling","pointAndFigure")||PointAndFigureScaling.Traditional;this._scaling=wijmo_1.asEnum(this._scaling,PointAndFigureScaling,!0);this._xlbls=[]};_PointAndFigurePlotter.prototype.adjustLimits=function(t,e){this._init();this.hitTester.clear();var i=new wijmo_1.Rect(0,0,0,0),a=this.chart.series.length;wijmo_1.assert(a<=1,"Current FinancialChartType only supports a single series");if(a>0){var n=this.chart.series[0],r=this._reversal,s=n.collectionView?n.collectionView:this.chart.collectionView,o=s?s.items:null;if(o&&o.length>0){var l=n._getBinding(0),h=n._getBinding(1),_=n._getBinding(2),c=n._getBinding(3);if(this._fields==DataFields.Close){c?l=c:_&&(l=_);h=l}var u=n.bindingX?n.bindingX:this.chart.bindingX,g=this._actualBoxSize=this.calcBoxSize(o,l,h);this._pfdata=this.calcPFHiLo2(o,l,h,u,g,r);if(this._pfdata&&this._pfdata.length>0){var p=this._pfdata.reduce((function(t,e){return Math.max(t,e.max)}),this._pfdata[0].max),m=this._pfdata.reduce((function(t,e){return Math.min(t,e.min)}),this._pfdata[0].min);i=new wijmo_1.Rect(-.5,m-.5*g,this._pfdata.length,p-m+g);for(var d=1;d<this._pfdata.length;d++){var f=this._pfdata[d-1],w=this._pfdata[d];wijmo_1.isDate(w.date)&&wijmo_1.isDate(f.date)&&w.date.getYear()!=f.date.getYear()&&this._xlbls.push({value:d,text:wijmo_1.Globalize.formatNumber(w.date.getFullYear()%100,"d2")})}}}}0==this._xlbls.length&&this._xlbls.push({value:0});var y=this.chart.axisY;this.axisYMajorGrid=y.majorGrid;y._chart=null;y.majorGrid=!1;y._chart=this.chart;this.chart.axisX.itemsSource=this._xlbls;return i};_PointAndFigurePlotter.prototype.plotSeries=function(t,e,i,a,n,r,s){if(this._pfdata&&this._pfdata.length>0){var o=this._actualBoxSize;this.renderGrid(t,this._pfdata,o);this.renderData(this.chart,t,this._pfdata,o)}var l=this.chart.axisY;l._chart=null;l.majorGrid=this.axisYMajorGrid;l._chart=this.chart};_PointAndFigurePlotter.prototype.calcBoxSize=function(t,e,i){var a=t.reduce((function(t,i){return Math.max(t,i[e])}),t[0][e]),n=t.reduce((function(t,e){return Math.min(t,e[i])}),t[0][i]),r=this._boxSize,s=a-n;switch(this._scaling){case PointAndFigureScaling.Traditional:s<.25?r=.0625:s>=.25&&s<1?r=.125:s>=1&&s<5?r=.25:s>=5&&s<20?r=.5:s>=20&&s<100?r=1:s>=100&&s<200?r=2:s>=200&&s<500?r=4:s>=500&&s<1e3?r=5:s>=1e3&&s<25e3?r=50:s>-25e3&&(r=500);break;case PointAndFigureScaling.Dynamic:var o=this.chart.series[0],l=o._getBindingValues(0),h=o._getBindingValues(1),_=(o._getBindingValues(2),_avgTrueRng(l,h,o._getBindingValues(3),this._period));r=_[_.length-1];break;case PointAndFigureScaling.Fixed:}return r};_PointAndFigurePlotter.prototype.calcPFHiLo2=function(t,e,i,a,n,r){for(var s=[],o=0;o<t.length;o++){var l=t[o][e],h=t[o][i];wijmo_1.assert(l>=h,"'High' value must be larger than 'low' value.");var _=t[o][a];if(0==s.length)s.push({min:this.roundDown(h,n),max:this.roundDown(l,n),rise:!1,date:_});else{var c=s[s.length-1];if(c.rise){var u=c.max+n,g=c.max-r*n;this.roundUp(l,n)>=u?c.max=this.roundUp(l,n):h<=g&&s.push({min:this.roundDown(h,n),max:c.max-n,rise:!1,date:_})}else{u=c.min-n,g=c.min+r*n;this.roundDown(h,n)<=u?c.min=this.roundDown(h,n):l>=g&&s.push({min:c.min+n,max:this.roundUp(l,n),rise:!0,date:_})}}}if(s.length>0){var p=s[0];p.min==p.max&&s.splice(0,1)}return s};_PointAndFigurePlotter.prototype.roundUp=function(t,e){return Math.ceil(t/e-.999999)*e};_PointAndFigurePlotter.prototype.roundDown=function(t,e){return Math.floor(t/e+.999999)*e};_PointAndFigurePlotter.prototype.renderGrid=function(t,e,i){if(this._pfdata){for(var a=this._pfdata.reduce((function(t,e){return Math.max(t,e.max)}),this._pfdata[0].max),n=this._pfdata.reduce((function(t,e){return Math.min(t,e.min)}),this._pfdata[0].min),r=this.chart,s=this._pfdata.length,o=n-.5*i;o<=a+i;o+=i){var l=new wijmo_1.Point(-.5,o);l=r.dataToPoint(l);var h=new wijmo_1.Point(s,o);h=r.dataToPoint(h);t.stroke=wijmo_chart_1.FlexChartCore._FG;t.strokeWidth=1;t.drawLine(l.x,l.y,h.x,h.y,wijmo_chart_1.FlexChartCore._CSS_GRIDLINE)}for(var _=-.5;_<=s;_+=1){l=new wijmo_1.Point(_,this.chart.axisY.actualMin);l=r.dataToPoint(l);h=new wijmo_1.Point(_,this.chart.axisY.actualMax);h=r.dataToPoint(h);t.stroke=wijmo_chart_1.FlexChartCore._FG;t.strokeWidth=1;t.drawLine(l.x,l.y,h.x,h.y,wijmo_chart_1.FlexChartCore._CSS_GRIDLINE)}}};_PointAndFigurePlotter.prototype.renderData=function(t,e,i,a){for(var n=t.series[0],r=n._getSymbolStroke(0),s=n._getAltSymbolStroke(0)||r,o=0;o<i.length;o++){var l=i[o],h=(i[o].max-i[o].min)/a;if(0!=h){var _=new wijmo_1.Point(o-.5,l.min);_=t.dataToPoint(_);var c=new wijmo_1.Point(o+.5,l.max);c=t.dataToPoint(c);e.fill="transparent";for(var u=(c.y-_.y)/h,g=0;g<h+1;g++){e.strokeWidth=1.5;if(l.rise){e.stroke=r;e.drawLine(_.x,_.y+(g-.5)*u,c.x,_.y+(g+.5)*u);e.drawLine(c.x,_.y+(g-.5)*u,_.x,_.y+(g+.5)*u)}else{e.stroke=s;e.drawEllipse(.5*(_.x+c.x),_.y+g*u,.5*Math.abs(_.x-c.x),.5*Math.abs(u))}if(this.hitTester){var p=l.min+g*a,m=new wijmo_chart_1._DataPoint(0,o,l.date,p);m.y=p;m.yfmt=this.chart.axisY._formatValue(p);if(wijmo_1.isDate(l.date)){m.x=l.date;m.xfmt=wijmo_1.Globalize.formatDate(l.date,"d")}var d=new wijmo_1.Rect(Math.min(_.x,c.x),_.y+g*u-.5*u,Math.abs(c.x-_.x),u);if(d.height<0){d.top+=u;d.height=-d.height}var f=new wijmo_chart_1._RectArea(d);f.tag=m;this.hitTester.add(f,0)}}}}};return _PointAndFigurePlotter}(wijmo_chart_1._BasePlotter);exports._PointAndFigurePlotter=_PointAndFigurePlotter;var _KagiPlotter=function(t){__extends(_KagiPlotter,t);function _KagiPlotter(){return t.call(this)||this}_KagiPlotter.prototype._calculate=function(t){this._init();var e=t._getBindingValues(0),i=t._getBindingValues(1),a=t._getBindingValues(2),n=t._getBindingValues(3),r=t.getValues(1)||this.chart._xvals;this._calculator=new _KagiCalculator(e,i,a,n,r,this._reversalAmount,this._rangeMode,this._fields);this._rangeValues=this._calculator.calculate();(null===this._rangeValues||wijmo_1.isUndefined(this._rangeValues))&&(this._rangeValues=[]);this._generateXLabels(t)};_KagiPlotter.prototype.plotSeries=function(t,e,i,a,n,r,s){this._calculate(a);var o=this.chart.series.indexOf(a),l=this._rangeValues.length,h=e.actualMin,_=e.actualMax,c=this._DEFAULT_WIDTH,u=a._getSymbolStroke(o),g=a._getAltSymbolStroke(o)||u,p=[],m=[];t.stroke=u;t.strokeWidth=c;var d,f,w,y,v,C,P,x=0;t.startGroup();for(var k=0;k<l;k++){d=k;if(wijmo_chart_1._DataInfo.isValid(d)&&h<=d&&d<=_){f=this._rangeValues[k].open;w=this._rangeValues[k].close;if(0===k){y=Math.min(f,w);v=Math.max(f,w);t.strokeWidth=f>w?c:2*c;t.stroke=f>w?u:g;t.drawLine(e.convert(d),i.convert(f),e.convert(d),i.convert(w));t.drawLine(e.convert(d-1)-t.strokeWidth/2,i.convert(f),e.convert(d)+t.strokeWidth/2,i.convert(f))}else if(t.strokeWidth===c)if(w>f){if(w>v){t.drawLine(e.convert(d),i.convert(f),e.convert(d),i.convert(v));t.strokeWidth=2*c;t.stroke=g;t.drawLine(e.convert(d),i.convert(v),e.convert(d),i.convert(w));y=f}else t.drawLine(e.convert(d),i.convert(f),e.convert(d),i.convert(w));v=w}else t.drawLine(e.convert(d),i.convert(f),e.convert(d),i.convert(w));else if(t.strokeWidth/2===c)if(w<f){if(w<y){t.drawLine(e.convert(d),i.convert(f),e.convert(d),i.convert(y));t.strokeWidth=c;t.stroke=u;t.drawLine(e.convert(d),i.convert(y),e.convert(d),i.convert(w));v=f}else t.drawLine(e.convert(d),i.convert(f),e.convert(d),i.convert(w));y=w}else t.drawLine(e.convert(d),i.convert(f),e.convert(d),i.convert(w));k<l-1&&t.drawLine(e.convert(d)-t.strokeWidth/2,i.convert(w),e.convert(d+1)+t.strokeWidth/2,i.convert(w));P=this._getDataPoint(o,k,a,w);(C=new wijmo_chart_1._CircleArea(new wijmo_1.Point(e.convert(d),i.convert(w)),.5*t.strokeWidth)).tag=P;this.hitTester.add(C,o);a._setPointIndex(k,x);x++;p.push(e.convert(d));m.push(i.convert(f));p.push(e.convert(d));m.push(i.convert(w))}}t.endGroup();this.hitTester.add(new wijmo_chart_1._LinesArea(p,m),o)};_KagiPlotter.prototype._init=function(){t.prototype._init.call(this);this._reversalAmount=this.getNumOption("reversalAmount","kagi")||14;this._rangeMode=this.getOption("rangeMode","kagi")||RangeMode.Fixed;this._rangeMode=wijmo_1.asEnum(this._rangeMode,RangeMode,!0);this._fields=this.getOption("fields","kagi")||DataFields.Close;this._fields=wijmo_1.asEnum(this._fields,DataFields,!0)};_KagiPlotter.prototype.clear=function(){t.prototype.clear.call(this);this._reversalAmount=null;this._rangeMode=null};return _KagiPlotter}(_BaseRangePlotter);exports._KagiPlotter=_KagiPlotter;var _RenkoPlotter=function(t){__extends(_RenkoPlotter,t);function _RenkoPlotter(){return t.call(this)||this}_RenkoPlotter.prototype.clear=function(){t.prototype.clear.call(this);this._boxSize=null;this._rangeMode=null};_RenkoPlotter.prototype._calculate=function(t){this._init();var e=t._getBindingValues(0),i=t._getBindingValues(1),a=t._getBindingValues(2),n=t._getBindingValues(3),r=t.getValues(1)||this.chart._xvals;this._calculator=new _RenkoCalculator(e,i,a,n,r,this._boxSize,this._rangeMode,this._fields,this._rounding);this._rangeValues=this._calculator.calculate();(null===this._rangeValues||wijmo_1.isUndefined(this._rangeValues))&&(this._rangeValues=[]);this._generateXLabels(t)};_RenkoPlotter.prototype._init=function(){t.prototype._init.call(this);this._boxSize=this.getNumOption("boxSize","renko")||14;this._rangeMode=this.getOption("rangeMode","renko")||RangeMode.Fixed;this._rangeMode=wijmo_1.asEnum(this._rangeMode,RangeMode,!0);wijmo_1.assert(this._rangeMode!==RangeMode.Percentage,"RangeMode.Percentage is not supported");this._fields=this.getOption("fields","renko")||DataFields.Close;this._fields=wijmo_1.asEnum(this._fields,DataFields,!0);wijmo_1.assert(this._fields!==DataFields.HighLow,"DataFields.HighLow is not supported");this._rounding=wijmo_1.asBoolean(this.getOption("rounding","renko"),!0)};_RenkoPlotter.prototype._generateXLabels=function(e){var i=this;t.prototype._generateXLabels.call(this,e);this._rangeXLabels.forEach((function(t,e){e>0&&i._rangeXLabels[e-1]._text===t.text&&(t.text="")}),this)};return _RenkoPlotter}(_BaseRangePlotter);exports._RenkoPlotter=_RenkoPlotter;var _LineBreakPlotter=function(t){__extends(_LineBreakPlotter,t);function _LineBreakPlotter(){return t.call(this)||this}_LineBreakPlotter.prototype.clear=function(){t.prototype.clear.call(this);this._newLineBreaks=null};_LineBreakPlotter.prototype._calculate=function(t){this._init();var e=t._getBindingValues(3),i=t.getValues(1)||this.chart._xvals;this._calculator=new _LineBreakCalculator(null,null,null,e,i,this._newLineBreaks);this._rangeValues=this._calculator.calculate();(null===this._rangeValues||wijmo_1.isUndefined(this._rangeValues))&&(this._rangeValues=[]);this._generateXLabels(t)};_LineBreakPlotter.prototype._init=function(){t.prototype._init.call(this);this._newLineBreaks=wijmo_1.asInt(this.getNumOption("newLineBreaks","lineBreak"),!0,!0)||3;wijmo_1.assert(this._newLineBreaks>=1,"Value must be greater than 1")};return _LineBreakPlotter}(_BaseRangePlotter);exports._LineBreakPlotter=_LineBreakPlotter;var FinancialChartType,_HeikinAshiPlotter=function(t){__extends(_HeikinAshiPlotter,t);function _HeikinAshiPlotter(){var e=t.call(this)||this;e._symFactor=.7;e.clear();return e}_HeikinAshiPlotter.prototype.clear=function(){t.prototype.clear.call(this);this._haValues=null;this._calculator=null};_HeikinAshiPlotter.prototype.plotSeries=function(t,e,i,a,n,r,s){var o=this;this._calculate(a);var l=wijmo_1.asType(a,wijmo_chart_1.SeriesBase),h=this.chart.series.indexOf(a),_=a.getValues(1),c=this._symFactor,u=this._haValues.length,g=!0;if(_){var p=this.dataInfo.getDeltaX();p>0&&(c*=p)}else _=this.dataInfo.getXVals();if(_)u=Math.min(u,_.length);else{g=!1;_=new Array(u)}var m=this._DEFAULT_WIDTH,d=l._getSymbolFill(h),f=l._getAltSymbolFill(h)||"transparent",w=l._getSymbolStroke(h),y=l._getAltSymbolStroke(h)||w,v=c,C=a.getDataType(1)||a.chart._xDataType;t.strokeWidth=m;for(var P,x,k,F,j,b,A,T,B=e.actualMin,V=e.actualMax,L=0,M=this.getItemFormatter(a),R=0;R<u;R++){k=g?_[R]:R;if(wijmo_chart_1._DataInfo.isValid(k)&&B<=k&&k<=V){j=this._haValues[R].high;b=this._haValues[R].low;A=this._haValues[R].open;T=this._haValues[R].close;P=A<T?f:d;x=A<T?y:w;t.fill=P;t.stroke=x;t.startGroup();F=this._getDataPoint(h,R,k,a);if(M){var S=new wijmo_chart_1.HitTestInfo(this.chart,new wijmo_1.Point(e.convert(k),i.convert(j)),wijmo_chart_1.ChartElement.SeriesSymbol);S._setData(l,R);S._setDataPoint(F);M(t,S,(function(){o._drawSymbol(t,e,i,h,R,P,v,k,j,b,A,T,F,C)}))}else this._drawSymbol(t,e,i,h,R,P,v,k,j,b,A,T,F,C);t.endGroup();a._setPointIndex(R,L);L++}}};_HeikinAshiPlotter.prototype._drawSymbol=function(t,e,i,a,n,r,s,o,l,h,_,c,u,g){var p,m=null,d=null,f=null,w=null,y=g===wijmo_1.DataType.Date?432e5:.5;if((f=e.convert(o-y*s))>(w=e.convert(o+y*s))){var v=f;f=w;w=v}o=e.convert(o);if(wijmo_chart_1._DataInfo.isValid(_)&&wijmo_chart_1._DataInfo.isValid(c)){_=i.convert(_);c=i.convert(c);d=(m=Math.min(_,c))+Math.abs(_-c);t.drawRect(f,m,w-f,d-m);(p=new wijmo_chart_1._RectArea(new wijmo_1.Rect(f,m,w-f,d-m))).tag=u;this.hitTester.add(p,a)}if(wijmo_chart_1._DataInfo.isValid(l)){l=i.convert(l);if(null!==m){t.drawLine(o,m,o,l);p.rect.top=l;p.rect.height=p.rect.height+l}}if(wijmo_chart_1._DataInfo.isValid(h)){h=i.convert(h);if(null!==d){t.drawLine(o,d,o,h);p.rect.height=p.rect.height+h}}};_HeikinAshiPlotter.prototype._getDataPoint=function(t,e,i,a){var n=new wijmo_chart_1._DataPoint(t,e,i,this._haValues[e].high),r=a._getItem(e),s=a._getBinding(0),o=a._getBinding(1),l=a._getBinding(2),h=a._getBinding(3),_=a._getAxisY();if(null!=r){n.item=wijmo_chart_1._BasePlotter.cloneStyle(r,[]);n.item[s]=this._haValues[e].high;n.item[o]=this._haValues[e].low;n.item[l]=this._haValues[e].open;n.item[h]=this._haValues[e].close}n.y=this._haValues[e].high;n.yfmt=_._formatValue(this._haValues[e].high);return n};_HeikinAshiPlotter.prototype._calculate=function(t){var e=t._getBindingValues(0),i=t._getBindingValues(1),a=t._getBindingValues(2),n=t._getBindingValues(3);this._calculator=new _HeikinAshiCalculator(e,i,a,n);this._haValues=this._calculator.calculate();(null===this._haValues||wijmo_1.isUndefined(this._haValues))&&this._init()};_HeikinAshiPlotter.prototype._init=function(){this._haValues=[]};return _HeikinAshiPlotter}(wijmo_chart_1._FinancePlotter);exports._HeikinAshiPlotter=_HeikinAshiPlotter;!function(t){t[t.Column=0]="Column";t[t.Scatter=1]="Scatter";t[t.Line=2]="Line";t[t.LineSymbols=3]="LineSymbols";t[t.Area=4]="Area";t[t.Candlestick=5]="Candlestick";t[t.HighLowOpenClose=6]="HighLowOpenClose";t[t.HeikinAshi=7]="HeikinAshi";t[t.LineBreak=8]="LineBreak";t[t.Renko=9]="Renko";t[t.Kagi=10]="Kagi";t[t.ColumnVolume=11]="ColumnVolume";t[t.EquiVolume=12]="EquiVolume";t[t.CandleVolume=13]="CandleVolume";t[t.ArmsCandleVolume=14]="ArmsCandleVolume";t[t.PointAndFigure=15]="PointAndFigure"}(FinancialChartType=exports.FinancialChartType||(exports.FinancialChartType={}));var FinancialChart=function(t){__extends(FinancialChart,t);function FinancialChart(e,i){var a=t.call(this,e,null)||this;a._chartType=FinancialChartType.Line;a.__heikinAshiPlotter=null;a.__lineBreakPlotter=null;a.__renkoPlotter=null;a.__kagiPlotter=null;a.__pfPlotter=null;a.initialize(i);return a}FinancialChart.prototype._getProductInfo=function(){return"A78U,FinancialChart"};Object.defineProperty(FinancialChart.prototype,"chartType",{get:function(){return this._chartType},set:function(t){if((t=wijmo_1.asEnum(t,FinancialChartType))!=this._chartType){this._chartType=t;this.invalidate()}},enumerable:!0,configurable:!0});Object.defineProperty(FinancialChart.prototype,"options",{get:function(){return this._options},set:function(t){if(t!=this._options){this._options=t;this.invalidate()}},enumerable:!0,configurable:!0});Object.defineProperty(FinancialChart.prototype,"_heikinAshiPlotter",{get:function(){if(null===this.__heikinAshiPlotter){this.__heikinAshiPlotter=new _HeikinAshiPlotter;this._initPlotter(this.__heikinAshiPlotter)}return this.__heikinAshiPlotter},enumerable:!0,configurable:!0});Object.defineProperty(FinancialChart.prototype,"_lineBreakPlotter",{get:function(){if(null===this.__lineBreakPlotter){this.__lineBreakPlotter=new _LineBreakPlotter;this._initPlotter(this.__lineBreakPlotter)}return this.__lineBreakPlotter},enumerable:!0,configurable:!0});Object.defineProperty(FinancialChart.prototype,"_renkoPlotter",{get:function(){if(null===this.__renkoPlotter){this.__renkoPlotter=new _RenkoPlotter;this._initPlotter(this.__renkoPlotter)}return this.__renkoPlotter},enumerable:!0,configurable:!0});Object.defineProperty(FinancialChart.prototype,"_kagiPlotter",{get:function(){if(null===this.__kagiPlotter){this.__kagiPlotter=new _KagiPlotter;this._initPlotter(this.__kagiPlotter)}return this.__kagiPlotter},enumerable:!0,configurable:!0});Object.defineProperty(FinancialChart.prototype,"_pfPlotter",{get:function(){if(null===this.__pfPlotter){this.__pfPlotter=new _PointAndFigurePlotter;this._initPlotter(this.__pfPlotter)}return this.__pfPlotter},enumerable:!0,configurable:!0});FinancialChart.prototype._getChartType=function(){var t=null;switch(this.chartType){case FinancialChartType.Area:t=wijmo_chart_1.ChartType.Area;break;case FinancialChartType.Line:case FinancialChartType.Kagi:case FinancialChartType.PointAndFigure:t=wijmo_chart_1.ChartType.Line;break;case FinancialChartType.Column:case FinancialChartType.ColumnVolume:t=wijmo_chart_1.ChartType.Column;break;case FinancialChartType.LineSymbols:t=wijmo_chart_1.ChartType.LineSymbols;break;case FinancialChartType.Scatter:t=wijmo_chart_1.ChartType.Scatter;break;case FinancialChartType.Candlestick:case FinancialChartType.Renko:case FinancialChartType.HeikinAshi:case FinancialChartType.LineBreak:case FinancialChartType.EquiVolume:case FinancialChartType.CandleVolume:case FinancialChartType.ArmsCandleVolume:t=wijmo_chart_1.ChartType.Candlestick;break;case FinancialChartType.HighLowOpenClose:t=wijmo_chart_1.ChartType.HighLowOpenClose}return t};FinancialChart.prototype._getPlotter=function(e){var i=this.chartType,a=null;if(e){var n=e.chartType;if(n&&!wijmo_1.isUndefined(n)&&n!=i){i=n;!0}}switch(i){case FinancialChartType.HeikinAshi:a=this._heikinAshiPlotter;break;case FinancialChartType.LineBreak:a=this._lineBreakPlotter;break;case FinancialChartType.Renko:a=this._renkoPlotter;break;case FinancialChartType.Kagi:a=this._kagiPlotter;break;case FinancialChartType.ColumnVolume:(a=t.prototype._getPlotter.call(this,e)).isVolume=!0;a.width=1;break;case FinancialChartType.EquiVolume:(a=t.prototype._getPlotter.call(this,e)).isEqui=!0;a.isCandle=!1;a.isArms=!1;a.isVolume=!0;a.symbolWidth="100%";break;case FinancialChartType.CandleVolume:(a=t.prototype._getPlotter.call(this,e)).isEqui=!1;a.isCandle=!0;a.isArms=!1;a.isVolume=!0;a.symbolWidth="100%";break;case FinancialChartType.ArmsCandleVolume:(a=t.prototype._getPlotter.call(this,e)).isEqui=!1;a.isCandle=!1;a.isArms=!0;a.isVolume=!0;a.symbolWidth="100%";break;case FinancialChartType.PointAndFigure:a=this._pfPlotter;break;default:a=t.prototype._getPlotter.call(this,e)}return a};FinancialChart.prototype._createSeries=function(){return new FinancialSeries};return FinancialChart}(wijmo_chart_1.FlexChartCore);exports.FinancialChart=FinancialChart;wijmo_1._registerModule("wijmo.chart.finance",selfModule);