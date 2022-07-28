import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { Uti } from '@app/utilities/uti';

@Injectable()
export class TreeViewService extends BaseService {

    public makeDataForSaveTreeView(data: any, dataEdited: any, idArticle: any): any {
        let oldTreeViewItem: any;
        const result: any = [];
        for (const newTreeViewItem of dataEdited) {
            oldTreeViewItem = data.find(x => x.id === newTreeViewItem.id);
            if (this.compareOldAndNewTreeViewItem(newTreeViewItem, oldTreeViewItem)) {
                // 1. If old is selected
                if (oldTreeViewItem.select) {
                    // 1.1 and If new has selected that will be update
                    if (newTreeViewItem.select) {
                        result.push({
                            IdArticle: idArticle,
                            IdArticleGroups: newTreeViewItem.idArticleGroups,
                            IdSharingTreeGroups: newTreeViewItem.id,
                            IsActive: 1,
                            IsMainGroup: newTreeViewItem.isMain ? 1 : 0,
                            GroupInPercent: newTreeViewItem.percent
                        });
                    } else {
                        // 1.2 and If new has not selected that will be removed
                        result.push({
                            IdArticleGroups: newTreeViewItem.idArticleGroups,
                            IsDeleted: 1
                        });
                    }

                } else if (newTreeViewItem.select) {
                    // 2. If old is not select and new is selected that will be insert new item
                    result.push({
                        IdArticle: idArticle,
                        IdSharingTreeGroups: newTreeViewItem.id,
                        IsActive: 1,
                        IsMainGroup: newTreeViewItem.isMain ? 1 : 0,
                        GroupInPercent: newTreeViewItem.percent
                    });
                }
            }
        }
        return result;
    }

    public makeTreeViewItemData(rawItem: any): any {
        return {
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
        const propertiesWantToUpdate = ['select', 'isMain', 'percent'];
        return (propertiesWantToUpdate.indexOf(proName) > -1);
    }

    private strValObj(object: any): string {
        return Uti.strValObj(object);
    }

}

