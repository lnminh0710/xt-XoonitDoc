import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgGrid, NgGridItem, NgGridItemConfig, NgGridItemEvent, NgGridPlaceholder } from '../index';

@NgModule({
  declarations:     [ NgGrid, NgGridItem, NgGridPlaceholder ],
  entryComponents:  [ NgGridPlaceholder ],
  exports:          [ NgGrid, NgGridItem ]
})
export class NgGridModule {}