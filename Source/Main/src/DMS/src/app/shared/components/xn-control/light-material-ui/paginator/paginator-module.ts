/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@app/shared/components/xn-control/light-material-ui/button';
import {MatSelectModule} from '@app/shared/components/xn-control/light-material-ui/select';
import {MatTooltipModule} from '@app/shared/components/xn-control/light-material-ui/tooltip';
import {MatPaginator} from './paginator';
import {MAT_PAGINATOR_INTL_PROVIDER} from './paginator-intl';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  exports: [MatPaginator],
  declarations: [MatPaginator],
  providers: [MAT_PAGINATOR_INTL_PROVIDER],
})
export class MatPaginatorModule {}
