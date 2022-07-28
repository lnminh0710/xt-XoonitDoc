import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementPopupComponent } from './user-management-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@xn-control/light-material-ui/input';
import { MatFormFieldModule } from '@xn-control/light-material-ui/form-field';
import { MatButtonModule } from '@xn-control/light-material-ui/button';
import { MatDialogModule } from '@xn-control/light-material-ui/dialog';
import { MatIconModule } from '@xn-control/light-material-ui/icon';
import { MatTooltipModule } from '@xn-control/light-material-ui/tooltip';
import { XnTranslationModule } from '@app/shared/components/translation/xn-translation.module';



@NgModule({
  declarations: [UserManagementPopupComponent],
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDialogModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    XnTranslationModule,
  ],
  exports: [UserManagementPopupComponent],
})
export class UserManagementPopupModule { }
