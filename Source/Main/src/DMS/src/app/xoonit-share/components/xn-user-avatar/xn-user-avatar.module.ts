import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { XnUserAvatarComponent } from './xn-user-avatar.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
    declarations: [XnUserAvatarComponent],
    imports: [CommonModule, TooltipModule],
    exports: [XnUserAvatarComponent],
    providers: [],
})
export class XnUserAvatarModule {}
