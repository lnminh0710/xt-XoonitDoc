import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HotKeySettingComponent } from './hotkey-setting.component';
import { MatInputModule } from '../xn-control/light-material-ui/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '../xn-control/light-material-ui/form-field';
import { MatButtonModule } from '../xn-control/light-material-ui/button';
import { MatIconModule } from '../xn-control/light-material-ui/icon';
import { HotKeyDialogComponent } from './hotkey-dialog/hotkey-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
    ],
    declarations: [
        HotKeySettingComponent,
        HotKeyDialogComponent
    ],
    entryComponents: [
        HotKeyDialogComponent
    ],
    exports: [
        HotKeySettingComponent,
        HotKeyDialogComponent
    ]
})
export class HotKeySettingModule { }
