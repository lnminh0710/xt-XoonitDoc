import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Uti } from '@app/utilities/uti';

@Injectable()
export class TreeViewService extends BaseService {

    public makeDataForSaveTreeView(data: any, dataEdited: any, idArticle: any): Array<any> {
        let oldTreeViewItem: any;
        const result: any = [];
        for (const newTreeViewItem of dataEdited) {
            if (parseInt(newTreeViewItem.id) < 0) continue;
            oldTreeViewItem = data.find(x => x.id === newTreeViewItem.id);
            if (this.compareOldAndNewTreeViewItem(newTreeViewItem, oldTreeViewItem)) {
                // 1. If old is selected
                if (oldTreeViewItem.select) {
                    // 1.1 and If new has selected that will be update
                    // And update the treeview text
                    if (newTreeViewItem.select) {
                        result.push({
                            IdSharingTreeGroupsRootname: newTreeViewItem.idSharingTreeGroupsRootname,
                            IdArticle: idArticle,
                            IdSharingTreeGroups: newTreeViewItem.id,
                            IdArticleGroups: newTreeViewItem.idArticleGroups,
                            IsActive: 1,
                            IsMainGroup: newTreeViewItem.isMain ? 1 : 0,
                            GroupInPercent: this.parsePercent(newTreeViewItem.percent),
                            GroupName: newTreeViewItem.text
                        });
                    } else {
                        // 1.2 and If new has not selected that will be removed
                        // And update the treeview text
                        result.push({
                            IdSharingTreeGroupsRootname: newTreeViewItem.idSharingTreeGroupsRootname,
                            IdArticle: idArticle,
                            IdSharingTreeGroups: newTreeViewItem.id,
                            IdArticleGroups: newTreeViewItem.idArticleGroups,
                            IsActive: 0,
                            //IsMainGroup: newTreeViewItem.isMain ? 1 : 0,
                            IsMainGroup: 0,
                            GroupInPercent: this.parsePercent(newTreeViewItem.percent),
                            GroupName: newTreeViewItem.text
                        });
                    }

                } else if (newTreeViewItem.select) {
                    // 2. If old is not select and new is selected that will be insert new item
                    // And update the treeview text
                    result.push({
                        IdSharingTreeGroupsRootname: newTreeViewItem.idSharingTreeGroupsRootname,
                        IdArticle: idArticle,
                        IdSharingTreeGroups: newTreeViewItem.id,
                        IdArticleGroups: newTreeViewItem.idArticleGroups ? newTreeViewItem.idArticleGroups : (Uti.getTempId2() + ''),
                        IsActive: 1,
                        IsMainGroup: newTreeViewItem.isMain ? 1 : 0,
                        GroupInPercent: this.parsePercent(newTreeViewItem.percent),
                        GroupName: newTreeViewItem.text
                    });
                }
            }
        }
        return result;
    }

    public makeDataForSaveTreeViewMaster(addData: Array<any>, deleteData: Array<any>, idArticle: any): Array<any> {
        let result = [];
        // Make Add Data
        for (let item of addData) {
            result.push({
                IdSharingTreeGroupsRootname: item.idSharingTreeGroupsRootname,
                IdArticle: idArticle,
                IdParent: item.parentId,
                IdSharingTreeGroups: item.id,
                IdArticleGroups: Uti.getTempId2() + '',
                IsActive: 1,
                IsMainGroup: item.isMain ? 1 : 0,
                GroupInPercent: this.parsePercent(item.percent),
                GroupName: item.text
            });
        }
        // Make Delete Data
        for (let item of deleteData) {
            result.push({
                IdArticle: idArticle,
                IdSharingTreeGroups: item.id,
                IsDeleteCategory: 1
            });
        }
        return result;
    }

    public makeTreeViewItemData(rawItem: any): any {
        return {
            idSharingTreeGroupsRootname: this.strValObj(rawItem.idSharingTreeGroupsRootname.value),
            id: this.strValObj(rawItem.idSharingTreeGroups.value),
            select: !!this.strValObj(rawItem.isActive.value),
            text: this.strValObj(rawItem.groupName.value),
            isMain: !!this.strValObj(rawItem.isMainGroup.value),
            isMainText: 'Is Main',
            percentText: 'Percent',
            percent: this.strValObj(rawItem.groupInPercent.value),
            parentId: this.strValObj(rawItem.slave2IdSharingTreeGroups.value),
            idArticleGroups: this.strValObj(rawItem.idArticleGroups.value)
        };
    }

    private compareOldAndNewTreeViewItem(oldItem: any, newItem: any): boolean {
        for (const pro in oldItem) {
            if (this.isExistsPropertiesWantToUpdate(pro) && (oldItem[pro] !== newItem[pro])) {
                return true;
            }
        }
        return false;
    }

    private isExistsPropertiesWantToUpdate(proName: any): boolean {
        const propertiesWantToUpdate = ['select', 'isMain', 'percent', 'text'];
        return (propertiesWantToUpdate.indexOf(proName) > -1);
    }

    private strValObj(object: any): string {
        return Uti.strValObj(object);
    }


    private parsePercent(percent: any): string {
        const val: number = Number(percent);
        if (isNaN(val) || !val) return '';
        if (val > 100) return '100';

        return percent;
    }
}

