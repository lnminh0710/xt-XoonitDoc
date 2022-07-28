import { Injectable } from '@angular/core';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class BranchActions {
    static LOAD_BRANCHES = '[Branch] Load Branch';
    loadBranches(item: any): CustomAction {
        return {
            type: BranchActions.LOAD_BRANCHES,
            payload: item,
        };
    }
}
