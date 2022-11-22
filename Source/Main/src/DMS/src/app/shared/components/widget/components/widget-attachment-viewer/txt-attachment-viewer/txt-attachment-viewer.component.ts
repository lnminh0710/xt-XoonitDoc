import { Component, Input } from '@angular/core';
import { Uti } from '@app/utilities';

@Component({
    selector: 'txt-attachment-viewer',
    templateUrl: './txt-attachment-viewer.component.html',
    styleUrls: ['./txt-attachment-viewer.component.scss'],
})
export class TxtAttachmentViewerComponent {
    public content: string;

    private _src: string;
    isUrlFile: boolean;

    @Input() set src(value: string) {
        this._src = value;
        this.getFileContent();
    }

    get src() {
        return this._src;
    }

    constructor() {}

    private getFileContent() {
        let txtFile = new XMLHttpRequest();
        const extension = Uti.getFileExtension(this.src);
        this.isUrlFile = extension.includes('url');

        txtFile.open('GET', this.src.replace('http://localhost:5000', 'https://dms.xoontec.ch'), true);
        txtFile.onreadystatechange = () => {
            if (txtFile.readyState === 4) {
                if (txtFile.status === 200) {
                    if (this.isUrlFile) {
                        const splitVal = txtFile.responseText?.split('URL=');
                        this.content = `${splitVal[0]}URL=<a href="${splitVal[1]}" target="_blank">${splitVal[1]}</a>`;
                    } else this.content = txtFile.responseText;
                }
            }
        };
        txtFile.send(null);
    }
}
