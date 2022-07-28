import { Observable } from 'rxjs';
import { DroppedComponentEvent } from '@app/pages/form-layout-builder/components/control-templates/events/dropped-component.event';

export interface IDraggableComponent {
    readonly hasAttachedComponent: Observable<DroppedComponentEvent>;
}
