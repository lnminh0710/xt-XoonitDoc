import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base.service';

@Injectable()
export class FileService extends BaseService {
    constructor(
        protected injector: Injector
    ) {
        super(injector);
    }
}
