import { Injectable, Injector } from '@angular/core';
import { BaseService } from '@app/services';
import { Observable, Subscription } from 'rxjs';
import { ApiResultResponse } from '@app/models';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class FileManagerService extends BaseService {
  constructor(injector: Injector) {
    super(injector);
  }

  public getTree(): Observable<ApiResultResponse> {
    const params: any = {};
    const url = this.serUrl.getTree;

    return this.get<any>(url, params);
  }

  public getChildren(path: string): Observable<ApiResultResponse> {
    const params: any = { path: path };
    const url = this.serUrl.getChildByPath;

    return this.get<any>(url, params);
  }

  public createFolder(ParentFolder: string, NewFolder: string): Observable<ApiResultResponse> {
    const params: any = { Action: 'create', ParentFolder, NewFolder };
    const url = this.serUrl.folderControl;

    return this.post<any>(url, params);
  }

  public renameFolder(FromFolder: string, NewFolder: string): Observable<ApiResultResponse> {
    const params: any = { Action: 'Rename', FromFolder, NewFolder };
    const url = this.serUrl.folderControl;

    return this.post<any>(url, params);
  }

  public renameFile(OrginalFile: string, NewFile: string): Observable<ApiResultResponse> {
    const params: any = { Action: 'Rename', OrginalFile, NewFile };
    const url = this.serUrl.fileControl;

    return this.post<any>(url, params);
  }

  public deleteFileByPath(FilePaths: Array<string>): Observable<ApiResultResponse> {
    const params: any = { FilePaths };
    const url = this.serUrl.deleteFileExplorer;

    return this.post<any>(url, params);
  }

  public getFileByUrl(url: string) {
    url = url.replace(/(^[\\\/])/g, '');

    const options = {};
    options['responseType'] = 'blob';

    if (url.startsWith('\\file.xena.local')) {
      return this.getV2<any>(`${this.serUrl.getFile}?name=${url}&mode=13`, options);
    }

    return this.getV2<any>(url, options);
  }
}
