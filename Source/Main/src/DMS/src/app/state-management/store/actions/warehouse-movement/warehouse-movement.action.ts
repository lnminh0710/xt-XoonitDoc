import { Injectable } from '@angular/core';
import { Module } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class WarehouseMovementActions {
    static REQUEST_CONFIRM_ALL = '[WarehouseMovement] Request Confirm All';
    requestCofirmAll(module: Module): CustomAction {
        return {
            type: WarehouseMovementActions.REQUEST_CONFIRM_ALL,
            module: module
        };
    }
}