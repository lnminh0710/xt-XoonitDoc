import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { DownloadFileService } from "@app/services";
import { Uti } from "@app/utilities";

class DownloadInfo {
    id: string;
    value: string;
}

@Component({
    selector: 'download-col-cell-renderer',
    templateUrl: './download-col-cell-renderer.html',
    styleUrls: ['./download-col-cell-renderer.scss']
})
export class DownloadColCellRenderer extends BaseAgGridCellComponent<string> implements ICellRendererAngularComp {

    public icon: string;//fa-file-pdf-o
    public downloadInfoList: Array<DownloadInfo> = [];

    constructor(private downloadFileService: DownloadFileService) {
        super();
    }

    refresh(params: any): boolean {
        return false;
    }

    protected getCustomParam(params: any) {
        const obj = Uti.parseJsonString(this.value);
        if (obj) {
            /*
            "{"Icon":"fa-file-pdf-o","Files":[{"FileName":"Warehouse_2019-05-03_01","FilePath":""},{"FileName":"Warehouse_2019-05-03_02","FilePath":""},{"FileName":"Warehouse_2019-05-03_03","FilePath":""}]}"
            */
            this.icon = obj.Icon;
            this.downloadInfoList = obj.Files.map((item) => {
                return { id: item.FilePath, value: item.FileName };
            });
        }
    }

    /**
     * selectedIndexChanged
     **/
    public selectedIndexChanged(selectedItem: any) {
        //console.log(selectedItem);
        if (selectedItem && selectedItem.id)
            this.downloadFileService.downloadFileWithIframe(selectedItem.id);
    }

    public downloadFile($event, selectedItem: any) {
        $event.preventDefault();
        //console.log(selectedItem);
        if (selectedItem && selectedItem.id)
            this.downloadFileService.downloadFileWithIframe(selectedItem.id);
    }
}
