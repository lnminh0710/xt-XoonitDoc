import { Component, OnInit, Input } from '@angular/core';
import { BlockUIState } from '@app/models/cloud-connection.model';

@Component({
    selector: 'block-ui-dialog',
    templateUrl: './block-ui-dialog.component.html',
    styleUrls: ['./block-ui-dialog.component.scss'],
})
export class BlockUIDialogComponent {
    @Input() isBlockClient = true;
    @Input() blockUIStatus: BlockUIState | null;
    public blockUIState = BlockUIState;
}
