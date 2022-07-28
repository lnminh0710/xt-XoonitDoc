import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import {
    QueryObject
} from '@app/app.constants';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
@Injectable()
export class RuleService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getProjectRules(idSelectionWidget, idSelectionProject, idSelectionProjectCountry): Observable<any> {
        return this.get<any>(this.serUrl.getProjectRules, {
            idSelectionWidget: idSelectionWidget,
            idSelectionProject: idSelectionProject,
            idSelectionProjectCountry: idSelectionProjectCountry
        });
    }

    public getProjectRulesForTemplate(idSelectionWidget, idSelectionProject): Observable<any> {
        return this.get<any>(this.serUrl.getProjectRulesForTemplate, {
            idSelectionWidget: idSelectionWidget,
            idSelectionProject: idSelectionProject
        });
    }

    public getBlackListRules(): Observable<any> {
        return this.get<any>(this.serUrl.getBlackListRules);
    }

    public getOrdersGroups(): Observable<any> {
        return this.get<any>(this.serUrl.getOrdersGroups);
    }

    public getComboBoxForRuleBuilder(queryObject: QueryObject): Observable<any> {
        return this.get<any>(this.serUrl.getComboBoxForRuleBuilder, {
            queryObject: queryObject
        });
    }

    public saveProjectRules(projectRules): Observable<any> {
        return this.post<any>(this.serUrl.saveProjectRules, JSON.stringify(projectRules));
    }

    // Get profile by idSelectionWidget
    /*
        Black list = 1
        Orders = 2
        OrdersGroup = 3
        ExtendedRules = 4
    */
    public getTemplate(idSelectionWidget: any): Observable<any> {
        return this.get<any>(this.serUrl.getTemplate, { idSelectionWidget: idSelectionWidget });
    }

    public saveBlackListProfile(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveBlackListProfile, JSON.stringify(data));
    }

    public hasEmptyFieldRecursive(data, fieldName) {
        if (!data || !fieldName) {
            return false;
        }

        if (data.hasOwnProperty(fieldName) && isEmpty(data[fieldName])) {
            return true;
        }

        if (!isNil(data.rules)) {
            for (let i = 0; i < data.rules.length; i++) {
                let found = this.hasEmptyFieldRecursive(data.rules[i], fieldName);
                if (found) {
                    return found;
                }
            }
        }

        return false;
    }

    public hasEmptySubFieldRecursive(data, parentFieldName, fieldName) {
        if (!data || !parentFieldName || !fieldName || (data.hasOwnProperty(parentFieldName) && isEmpty(data[parentFieldName]))) {
            return true;
        }

        if (!data.hasOwnProperty(parentFieldName)) {
            return false;
        }

        for (let i = 0; i < data[parentFieldName].length; i++) {
            if (!data[parentFieldName][i].hasOwnProperty(fieldName) ||
                isNil(data[parentFieldName][i][fieldName]) ||
                data[parentFieldName][i][fieldName] === '' ||
                this.hasEmptyPropValue(data[parentFieldName][i][fieldName])) {
                return true;
            }

            let found = this.hasEmptySubFieldRecursive(data[parentFieldName][i], parentFieldName, fieldName);
            if (found) {
                return found;
            }
        }

        return false;
    }

    public hasEmptyPropValue(obj) {
        var isSingleType = true;
        var groupOperatorsValue = 'value';
        var groupQuantityValue = 'value';

        for (let i = 0; i < Object.keys(obj).length; i++) {
            if (Object.keys(obj)[i] === 'groupType') {
                isSingleType = obj[Object.keys(obj)[i]] === 'Single';
            }
            if (Object.keys(obj)[i] === 'groupOperators') {
                groupOperatorsValue = obj[Object.keys(obj)[i]];
            }
            if (Object.keys(obj)[i] === 'groupQuantity') {
                groupQuantityValue = obj[Object.keys(obj)[i]];
            }
        }
        var result = false;

        for (let i = 0; i < Object.keys(obj).length; i++) {
            if (isSingleType && (Object.keys(obj)[i] === 'groupOperators') || Object.keys(obj)[i] === 'groupQuantity') {
                continue;
            }
            if (isNil(obj[Object.keys(obj)[i]]) || obj[Object.keys(obj)[i]] === '') {
                result = true;
            }
        }

        return isSingleType ? result : result || !groupOperatorsValue || !groupQuantityValue;
    }

    public deleteDataToUsed(): Observable<any> {
        return this.post<any>(this.serUrl.deleteDataToUsed);
    }
}
