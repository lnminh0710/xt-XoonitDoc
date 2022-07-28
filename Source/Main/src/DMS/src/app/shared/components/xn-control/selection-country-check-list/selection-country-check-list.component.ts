import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Country } from '@app/models';
import cloneDeep from 'lodash-es/cloneDeep';
import isNil from 'lodash-es/isNil';
import isString from 'lodash-es/isString';
import isBoolean from 'lodash-es/isBoolean';
import isNumber from 'lodash-es/isNumber';

@Component({
    selector: 'sel-country-check-list',
    styleUrls: ['./selection-country-check-list.component.scss'],
    templateUrl: './selection-country-check-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelCountryCheckListComponent implements OnInit, OnDestroy {
    public isRendered = false;
    public mainList: Array<Country[]> = [];
    public subList: Array<Country[]> = [];
    public viewModeMainList: Array<Country[]> = [];
    public viewModeSubList: Array<Country[]> = [];
    private defaultRowNo = 5;
    public defaulWidthColumn = 270;
    private isShowedSubList = false;
    private perfectScrollbarConfig: any = {};
    private idSelectAllMain = -1;
    private idSelectAllSecondary = -2;
    private selectedAllMainModel: Country;
    private selectedAllSecondaryModel: Country;
    public editMode = true;
    private outDataCountries: Country[] = [];
    private isCountryModel = true;
    private _isRadioButtonMode = false;

    private cachedMainList = [];
    private cachedSubList = [];

    private randonNr: number = (new Date()).getTime();

    // data structure: {mainList:[],subList:[]}
    @Input() set data(data: any) {
        this.changeData(data);
    }

    @Input() set isExpand(data: any) {
        this.showSubList(!!data);
        this.ref.markForCheck();
    }

    @Input() set edit(eventdata: any) {
        if (!eventdata)
            return;
        setTimeout(() => {
            if (eventdata.data)
                this.initCountriesData(eventdata.data);
            this.editMode = eventdata.editMode;
            this.ref.markForCheck();
        });
    }

    @Input() set isRadioButtonMode(isRadioButtonMode: boolean )
    {
        this._isRadioButtonMode = isRadioButtonMode;
        this.ref.markForCheck();
    }

    @Output() outputData: EventEmitter<any> = new EventEmitter();
    @Output() formChange: EventEmitter<any> = new EventEmitter();

    constructor(
        private ref: ChangeDetectorRef
    ) {}

    public ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        }
    }

    public changeData(data: any, isFilter?: boolean) {
        setTimeout(() => {
            this.initCountriesData(data, isFilter);
            this.randonNr = (new Date()).getTime();
            this.ref.markForCheck();
            this.setOutputData();
        }, 200);
    }

    public setActiveForItem(idValue: any, isActive?: boolean) {
        var isSet = false;
        this.mainList.forEach((item, index) => {
            if (isSet) return;
            item.forEach((rowItem, index) => {
                if (rowItem.idValue === idValue) {
                    rowItem.isActive = isActive;
                    isSet = true;
                    this.ref.markForCheck();
                    this.selectedAllMainModel.isActive = false;
                    return;
                }
            });
        });
        if (isSet) {
            this.setOutputData();
            return;
        }
        this.subList.forEach((item, index) => {
            if (isSet) return;
            item.forEach((rowItem, index) => {
                if (rowItem.idValue === idValue) {
                    rowItem.isActive = isActive;
                    isSet = true;
                    this.ref.markForCheck();
                    this.selectedAllSecondaryModel.isActive = false;
                    return;
                }
            });
        });
        this.setOutputData();
    }

    private setOutputData() {
        setTimeout(() => {
            this.outputData.emit(this.outDataCountries);
        })
    }

    private initCountriesData(countriesData: any, isFilter?: boolean) {
        if (!countriesData || !countriesData.length) {
            this.isRendered = false;
            return;
        }

        this.checkIsCountryModelType(countriesData[0]);
        const _countriesData = this.isCountryModel ? cloneDeep(countriesData) : this.mapDataToCountryModel(countriesData);
        this.outDataCountries = _countriesData;

        const mainList = _countriesData.filter(item => {
            if (isString(item.isMain) && (item.isMain as string).toLowerCase() === 'true') {
                item.isMain = true;
                return true;
            }
            if (isBoolean(item.isMain)) {
                return item.isMain;
            }
        });

        const subList = _countriesData.filter(item => {
            if (isString(item.isMain) && (item.isMain === '' || (item.isMain as string).toLowerCase() === 'false')) {
                item.isMain = false;
                return true;
            }
            if (isBoolean(item.isMain)) {
                return !item.isMain;
            }
        });

        // Edit mode
        this.selectedAllMainModel = new Country({ isoCode: null, isActive: false, isMain: true, idValue: this.idSelectAllMain, textValue: 'Select All Main' });
        const mainData = this.generateDisplayData(mainList, !this._isRadioButtonMode, this.selectedAllMainModel);
        this.mainList = mainData.list;
        this.selectedAllSecondaryModel = new Country({ isoCode: null, isActive: false, isMain: false, idValue: this.idSelectAllSecondary, textValue: 'Select All Secondary' });
        const subData = this.generateDisplayData(subList, !this._isRadioButtonMode, this.selectedAllSecondaryModel);
        this.subList = subData.list;

        // view mode
        const mainDataViewMode = this.generateDisplayData(_countriesData, false);
        this.viewModeMainList = mainDataViewMode.viewModeList;

        this.isRendered = (!!this.mainList.length && !!this.mainList[0].length) || (!!this.subList.length && !!this.subList[0].length);
    }

    generateDisplayData(data, isAddCbxSelectAll, additionalModel?) {
        let array: Country[] = [];
        let viewModeArray: Country[] = [];
        const _list: Country[][] = [];
        const _viewModeList: Country[][] = [];
        const dataLength = data.length;
        let isAllSelected = true;
        if (isAddCbxSelectAll && data.length > 1)
            array.push(additionalModel);
        (<Country[]>data).forEach((item, index) => {
            item.isActive = (item.isActive && item.isActive.toString() === '1') || item.isActive === true;
            array.push(item);
            if (item.isActive)
                viewModeArray.push(item);
            else
                isAllSelected = false;
            if (array.length === this.defaultRowNo || index === dataLength - 1) {
                _list.push(array);
                array = [];
            }
            if (viewModeArray.length === this.defaultRowNo || index === dataLength - 1) {
                _viewModeList.push(viewModeArray);
                viewModeArray = [];
            }
        });
        if (isAddCbxSelectAll && _list[0] && _list[0][0])
            _list[0][0].isActive = isAllSelected;
        return { list: _list, viewModeList: _viewModeList };
    }

    checkIsCountryModelType(data) {
        this.isCountryModel = !isNil(data.idValue) && !isNil(data.isoCode);
        this.ref.markForCheck();
    }

    private showSubList(isShowed: boolean) {
        this.isShowedSubList = isShowed;
        this.ref.markForCheck();
    }

    public itemChanged(event) {
        switch (event.source.value) {
            case this.idSelectAllMain + '':
                this.UpdateCheckListState(this.mainList, this.idSelectAllMain);
                break;
            case this.idSelectAllSecondary + '':
                this.UpdateCheckListState(this.subList, this.idSelectAllSecondary);
                break;
            default:
                if (event.source._elementRef.nativeElement.getAttribute('data-is-main-item') === 'true')
                    this.selectedAllMainModel.isActive = this.FindUncheckedItem(this.mainList) == null;
                else
                    this.selectedAllSecondaryModel.isActive = this.FindUncheckedItem(this.subList) == null;
                break;
        }
        this.ref.markForCheck();
        this.setOutputData();
        this.formChange.emit();
    }

    public radioItemChanged(id) {
        const selectedItem = this.outDataCountries.find((item) => item.isActive);
        if (selectedItem) {
            selectedItem.isActive = false;
        }
        const curSelectedItem = this.outDataCountries.find((item) => item.idValue.toString() === id);
        if (curSelectedItem)
            curSelectedItem.isActive = true;
        this.ref.markForCheck();
        this.setOutputData();
        this.formChange.emit();
    }

    private UpdateCheckListState(checkList: Array<Country[]>, id: number) {
        let isCheckedAll = false;
        checkList.forEach((col) => {
            col.forEach((row) => {
                if (id === row.idValue)
                    isCheckedAll = row.isActive;
                else
                    row.isActive = isCheckedAll;
            })
        });
        this.ref.markForCheck();
    }

    private FindUncheckedItem(checkList: Array<Country[]>): Country {
        let result: Country = null;
        checkList.forEach((col) => {
            col.forEach((row) => {
                if (!row.isActive && row.idValue !== this.idSelectAllMain && row.idValue !== this.idSelectAllSecondary) {
                    result = row;
                    return row;
                }
            })
            if (result)
                return result;
        });
        return result;
    }

    private mapDataToCountryModel(data) {
        const result: Country[] = [];
        data.forEach((item, index) => {
            const _item = new Country();

            if (isNumber(item.IdArticleExcludeCountries))
                _item.idArticleExcludeCountries = item.IdArticleExcludeCountries + '';

            _item.isActive = false;
            if (isBoolean(item.IsActive))
                _item.isActive = item.IsActive;

            _item.isMain = false
            if (isBoolean(item.IsMain))
                _item.isMain = item.IsMain;

            _item.idValue = item.IdIsoCountryCode;
            _item.isoCode = item.IsoCode;
            _item.textValue = item.Country;
            result.push(_item);
        });
        return result;
    }

    public resizeContainer(eve) {
        const flagContainer = $(eve.target).parent().find('div.flag-container')[0];
        const columnElements = $(eve.target).parent().find('div.flag-container div.colum-item');
        let totalWidth = 0;
        if (columnElements.length > 0)
            columnElements.each((index, col) => {
                totalWidth += $(col).width() + 10;
            });
        $(flagContainer).css({'min-width': (totalWidth + 10) + 'px'});
    }

    public getImgBlankSrc(): string {
        return 'public/assets/img/blank.gif?t=' + (new Date()).getTime();
    }

    ngOnDestroy() {
    }
}
