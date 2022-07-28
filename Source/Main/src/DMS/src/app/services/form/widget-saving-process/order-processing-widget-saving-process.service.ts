import { Injectable, Injector, forwardRef, Inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AppErrorHandler, PersonService, CommonService, DocumentService } from '@app/services';
import { BaseWidgetSavingProcessService } from './base-widget-saving-process.service';
import { ToasterService } from 'angular2-toaster';
import { WidgetContainerComponent } from '@app/shared/components/widget';

@Injectable()
export class OrderProcessingSavingProcessService extends BaseWidgetSavingProcessService {
    constructor(
        @Inject(forwardRef(() => DocumentService)) private documentService: DocumentService,
        @Inject(forwardRef(() => ToasterService)) protected toasterService: ToasterService,
    ) {
        super(toasterService);
    }

    protected savingFunc: Function = (data) => {
        if (data.ArticleData && data.ArticleData.length) {
            data.ArticleData = data.ArticleData.filter((p) => p.selectAll);
            let articles: Array<any> = data.ArticleData;
            articles.forEach((article) => {
                article['IsForInvoice'] = data['IsForInvoice'];
                article['IsForOffer'] = data['IsForOffer'];
                article['IsForOrder'] = data['IsForOrder'];
            });
        }
        return this.documentService.saveOrderProcessing(data);
    };

    protected isValidCustom(data, widgetContainers: Array<WidgetContainerComponent>) {
        if (!data.ArticleData || !data.ArticleData.length) {
            if (widgetContainers && widgetContainers.length) {
                for (let i = 0; i < widgetContainers.length; i++) {
                    widgetContainers[i].widgetModuleComponents.forEach((widgetModuleComponent) => {
                        if (widgetModuleComponent.agGridComponent) {
                            widgetModuleComponent.agGridComponent.addNewRow();
                        }
                    });
                }
            }
            return false;
        }
        let items: Array<any> = data.ArticleData.filter((p) => p.selectAll);
        return items.length ? true : false;
    }
}
