import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { defaultLanguage } from '@app/app.resource';

export class MyDmMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
        let value = defaultLanguage[params.key] || params.key;
        if (params.translateService && params.interpolateParams) {
            value = params.translateService.parser.interpolate(value, params.interpolateParams);
        }
        return value;
    }
}
