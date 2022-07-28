import { Injectable } from '@angular/core';
import {
    ParkedItemModel, WidgetTemplateSettingModel, PageSetting,
    RawFieldEntity, FieldEntity, DataSetting,
    WidgetDetail, ListenKey, WidgetDetailPage, WidgetType, WidgetKeyType,
    IWidgetDataTypeValues, IWidgetTargetRender, Module, TabSummaryModel, IWidgetRenderDataType
} from '@app/models';
import { Uti } from '@app/utilities';
import {
    ReplaceString,
    MenuModuleId, RepWidgetAppIdEnum
} from '@app/app.constants';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import upperFirst from 'lodash-es/upperFirst';
import toSafeInteger from 'lodash-es/toSafeInteger';
import { XnWidgetMenuStatusComponent } from '../components';

@Injectable()
export class WidgetMenuStatusUtils {

    constructor() {

    }

}
