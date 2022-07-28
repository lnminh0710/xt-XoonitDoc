import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { Uti } from "@app/utilities";

@Component({
    selector: 'tag-labels-cell-renderer',
    templateUrl: './tag-labels-cell-renderer.html',
    styleUrls: ['./tag-labels-cell-renderer.scss']
})
export class TagLabelsCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {

    public buttonList: Array<any> = [];

    constructor() {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    /**
     * getCustomParam
     * @param params
     */
    protected getCustomParam(params: any) {
        const obj = Uti.parseJsonString(this.value);
        if (obj) {
            /*
            [
              {
                "Icon": "fa-address-book-o",
                "Color": "blue",
                "Text": "Invoice",
                'Class':''
              },
              {
                "Icon": "fa-cart-plus",
                "Color": "red",
                "Text": "Order",
                'Class':''
              },
              {
                "Icon": "fa-bullhorn",
                "Color": "green",
                "Text": "Offer",
                'Class':''
              }
            ]
            */
            this.buttonList = obj.map((item) => {
                return {
                    class: item.Class,
                    icon: item.Icon,
                    text: item.Text,
                    color: item.Color,
                    iconColor: item.IconColor || item.Color,
                    textColor: item.TextColor || item.Color,
                    borderColor: item.BorderColor || item.Color,
                    bgColor: item.BgColor || item.Color,
                    isActive: (item.IsActive != null && item.IsActive != undefined) ? Uti.getBoolean(item.IsActive) : true
                };
            });
        }
    }
}
