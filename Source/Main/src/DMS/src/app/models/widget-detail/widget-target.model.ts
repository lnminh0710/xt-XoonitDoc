import { WidgetKeyType } from './widget-constant';

/**
* IWidgetTargetRender
*/
export interface IWidgetTargetRender {
    key: string;
    widgetKeyType: WidgetKeyType;
    srcWidgetId: string;
    syncWidgetIds?: Array<string>;
}

/**
* IWidgetRenderDataType
* Listen key handler
*/
export interface IWidgetRenderDataType {
    [key: string]: { [key: string]: any };  // { 'IdPersonInterface' : { 'Main' : 1, 'Sub'  : [{},{}] } };
    renderFor?: Array<IWidgetTargetRender>;
}

/**
* IWidgetRenderDataType
*/
export interface IWidgetDataTypeValues {
    [key: string]: IWidgetRenderDataType;
}