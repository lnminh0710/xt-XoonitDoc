/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatTable} from './table';
import {CdkTableModule} from '@angular/cdk/table';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatHeaderCell,
  MatHeaderCellDef
} from './cell';
import {
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef
} from './row';
import {MatTextColumn} from './text-column';
import {MatCommonModule} from '@app/shared/components/xn-control/light-material-ui/core';

const EXPORTED_DECLARATIONS = [
  // Table
  MatTable,

  // Template defs
  MatHeaderCellDef,
  MatHeaderRowDef,
  MatColumnDef,
  MatCellDef,
  MatRowDef,
  MatFooterCellDef,
  MatFooterRowDef,

  // Cell directives
  MatHeaderCell,
  MatCell,
  MatFooterCell,

  // Row directives
  MatHeaderRow,
  MatRow,
  MatFooterRow,

  MatTextColumn,
];

@NgModule({
  imports: [
    CdkTableModule,
    MatCommonModule,
  ],
  exports: [MatCommonModule, EXPORTED_DECLARATIONS],
  declarations: EXPORTED_DECLARATIONS,
})
export class MatTableModule {}
