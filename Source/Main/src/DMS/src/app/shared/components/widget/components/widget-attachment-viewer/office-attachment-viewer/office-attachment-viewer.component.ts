import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'office-attachment-viewer',
  templateUrl: './office-attachment-viewer.component.html',
  styleUrls: ['./office-attachment-viewer.component.scss']
})
export class OfficeAttachmentViewerComponent {

  @Input() src: string = '';

  constructor() { }

  viewerLoaded(){}

}
