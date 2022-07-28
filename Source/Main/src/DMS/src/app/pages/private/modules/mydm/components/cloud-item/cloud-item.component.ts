import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CloudModel } from '../../models/cloud-configuration.model';

@Component({
    selector: 'cloud-item',
    templateUrl: './cloud-item.component.html',
    styleUrls: ['./cloud-item.component.scss'],
})
export class CloudItemComponent {
    @Input() public cloud: CloudModel;
    @Output() changeActivate: EventEmitter<any> = new EventEmitter();
    @Output() openSharingDialog: EventEmitter<any> = new EventEmitter();

    public changeActivateAction(cloud: CloudModel) {
        this.changeActivate.emit(cloud);
    }

    public openSharingDialogAction(cloud: CloudModel) {
        this.openSharingDialog.emit(cloud);
    }
}
