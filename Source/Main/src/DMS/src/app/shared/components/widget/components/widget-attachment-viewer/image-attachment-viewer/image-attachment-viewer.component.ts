import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import Viewer from './viewer';

@Component({
  selector: 'image-attachment-viewer',
  templateUrl: './image-attachment-viewer.component.html',
  styleUrls: ['./image-attachment-viewer.component.scss'],
})
export class ImageAttachmentViewerComponent {


    @ViewChild('container', { static: true }) container: ElementRef<HTMLDivElement>;
    @Input() set src(sc: string) {
      if (this.viewer) {
        this.viewer.destroy();
        clearTimeout(this.timeoutIndex);
      }
      this.srcs = [];
      this.srcs.push(sc);
      this.timeoutIndex = setTimeout(() => this.setViewer(), 100);
    };
    srcs: string[] = [];
    viewer: Viewer;
    timeoutIndex: NodeJS.Timeout;
  
    constructor(
    ) { }
  
    ngOnInit() {
    }
  
    private setViewer() {
      this.viewer = new Viewer(document.getElementById('image-viewer-display'), {
        container: document.getElementById('image-viewer-container'),
        className: 'image-viewer',
        backdrop: false,
        button: false,
        title: 0,
        navbar: 0,
        toolbar: 0,
        inline: true,
      });
      this.viewer.show();
    }
}
