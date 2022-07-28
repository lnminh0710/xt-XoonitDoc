import { NgModule } from '@angular/core';
import { APP_PIPES } from '.';

@NgModule({
    imports: [
    ],
    declarations: [
        ...APP_PIPES
    ],
    exports: [
        ...APP_PIPES
    ]
})
export class PipesModule { }

export * from './pipes.module';
