/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TextFieldModule} from '@angular/cdk/text-field';
import {NgModule} from '@angular/core';
import {ErrorStateMatcher} from '@app/shared/components/xn-control/light-material-ui/core';
import {MatFormFieldModule} from '@app/shared/components/xn-control/light-material-ui/form-field';
import {MatTextareaAutosize} from './autosize';
import {MatInput} from './input';

@NgModule({
  declarations: [MatInput, MatTextareaAutosize],
  imports: [
    TextFieldModule,
    MatFormFieldModule,
  ],
  exports: [
    TextFieldModule,
    // We re-export the `MatFormFieldModule` since `MatInput` will almost always
    // be used together with `MatFormField`.
    MatFormFieldModule,
    MatInput,
    MatTextareaAutosize,
  ],
  providers: [ErrorStateMatcher],
})
export class MatInputModule {}
