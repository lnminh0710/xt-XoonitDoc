import { Injectable, Injector, forwardRef, Inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AppErrorHandler, PersonService } from '@app/services';
import { BaseWidgetSavingProcessService } from './base-widget-saving-process.service';
import { ToasterService } from 'angular2-toaster';

@Injectable()
export class CustomerWidgetSavingProcessService extends BaseWidgetSavingProcessService {
    constructor(
        @Inject(forwardRef(() => PersonService)) private personService: PersonService,
        @Inject(forwardRef(() => ToasterService)) protected toasterService: ToasterService,
    ) {
        super(toasterService);
    }

    protected savingFunc: Function = (data) => {
        return this.personService.saveCustomer(data);
    };
}
