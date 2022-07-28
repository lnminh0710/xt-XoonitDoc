import { Injectable } from '@angular/core';
import { CustomAction } from '@app/state-management/store/actions/base';

@Injectable()
export class PreissChildActions {
    static SELECT_CAR = '[PreissChild] Select PreissChild';
    selectItem(item: any): CustomAction {
        return {
            type: PreissChildActions.SELECT_CAR,
            payload: item,
        };
    }

    static GALLERY_PICTURE_FINISH_LOAD = '[PreissChild] Gallery Picture finish load';
    galleryPictureFinishLoad(): CustomAction {
        return {
            type: PreissChildActions.GALLERY_PICTURE_FINISH_LOAD,
        };
    }
}
