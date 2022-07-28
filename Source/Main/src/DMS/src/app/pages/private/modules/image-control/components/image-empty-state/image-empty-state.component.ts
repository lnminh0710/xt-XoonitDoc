import { Component, Input } from '@angular/core';

@Component({
    selector: 'image-empty-state',
    templateUrl: './image-empty-state.component.html',
    styleUrls: ['./image-empty-state.component.scss'],
})
export class ImageEmptyStateComponent {
    @Input() title: string;
}
