import { Component, Input } from '@angular/core';

@Component({
  selector: 'txt-attachment-viewer',
  templateUrl: './txt-attachment-viewer.component.html',
  styleUrls: ['./txt-attachment-viewer.component.scss']
})
export class TxtAttachmentViewerComponent {

  public content: string;

  private _src: string;

  @Input() set src(value: string) {
    this._src = value;
    this.getFileContent();
  }

  get src() {
    return this._src;
  }

  constructor() { }

  private getFileContent() {
    let txtFile = new XMLHttpRequest();
    txtFile.open("GET", this.src, true);
    txtFile.onreadystatechange = () => {
      if (txtFile.readyState === 4) {
        if (txtFile.status === 200) {
          this.content = txtFile.responseText;
        }
      }
    }
    txtFile.send(null);
  }
}
