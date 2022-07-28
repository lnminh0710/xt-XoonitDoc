import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconNames } from '@app/app-icon-registry.service';

@Component({
  selector: 'unsupport-attachment-viewer',
  templateUrl: './unsupport-attachment-viewer.component.html',
  styleUrls: ['./unsupport-attachment-viewer.component.scss']
})
export class UnsupportAttachmentViewerComponent {
  
  svgDownload = IconNames.APP_DOWNLOAD;

  loading: {[key: string]: boolean} = {
    download: false
  }

  @Input() name: string;
  @Output() onDownload: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  download() {
    this.onDownload.emit({loading: this.loading});
  }
}
