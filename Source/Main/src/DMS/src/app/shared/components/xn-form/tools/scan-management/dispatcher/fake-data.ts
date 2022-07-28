export class DispatcherFakeData {

    public createScanCenter() {
        return [
            {
                id: 1111,
                company: 'Digitexx',
                place: 'DQS GmbH - Lgistic',
                country: 'English',
                createDate: '10-10-2017',
                poolQty: 11
            },
            {
                id: 2222,
                company: 'Digitexx',
                place: 'DQS GmbH - Lgistic',
                country: 'English',
                createDate: '10-10-2017',
                poolQty: 11
            },
            {
                id: 3333,
                company: 'Digitexx',
                place: 'DQS GmbH - Lgistic',
                country: 'English',
                createDate: '10-10-2017',
                poolQty: 11
            }
        ];
    }
    public createLeftGridColumns(): any {
        const result: any = [];
        result.push({
            'title': 'Id',
            'data': 'id',
            'visible': false,
            setting: {
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1',
                            Hidden: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'Company',
            'data': 'company',
            'visible': true
        });
        result.push({
            'title': 'Place',
            'data': 'place',
            'visible': true
        });
        result.push({
            'title': 'Country',
            'data': 'country',
            'visible': true
        });
        result.push({
            'title': 'Create Date',
            'data': 'createDate',
            'visible': true
        });
        result.push({
            'title': 'PoolQty',
            'data': 'poolQty',
            'visible': true
        });

        return result;
    }
    public createGridColumns(): any {
        const result: any = [];
        result.push({
            'title': 'Id',
            'data': 'id',
            'visible': false,
            setting: {
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1',
                            Hidden: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'dataEntryCenterId',
            'data': 'dataEntryCenterId',
            'visible': false,
            setting: {
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1',
                            Hidden: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'Pool name',
            'data': 'poolName',
            'visible': true,
            setting: {
                DataType: 'nvarchar',
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'Q.ty',
            'data': 'quantity',
            'visible': true,
            setting: {
                DataType: 'nvarchar',
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'Create Date',
            'data': 'createDate',
            'visible': true,
            setting: {
                DataType: 'nvarchar',
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'Select',
            'data': 'select',
            'dataType': 'Boolean',
            'visible': true
        });
        result.push({
            'title': 'Is active',
            'data': 'isActiveDisableRow',
            'dataType': 'Boolean',
            'visible': true
        });

        return result;
    }

    public createGridData(scanCenterId: any): any {
        return [
            {
                id: scanCenterId + '1',
                poolName: 'Pool 1' + scanCenterId,
                quantity: 50,
                createDate: '',
                select: false,
                isActiveDisableRow: true
            },
            {
                id: scanCenterId + '2',
                poolName: 'Pool 2' + scanCenterId,
                quantity: 50,
                createDate: '',
                select: false,
                isActiveDisableRow: true
            },
            {
                id: scanCenterId + '3',
                poolName: 'Pool 3' + scanCenterId,
                quantity: 50,
                createDate: '',
                select: false,
                isActiveDisableRow: true
            }
        ];
    }

    public createDataEntryCenter() {
        return [
            {
                id: 111111111,
                value: 1,
                text: 'DQS GmbH - Lgistic'
            },
            {
                id: 222222222,
                value: 2,
                text: 'DQS GmbH - Lgistic'
            },
            {
                id: 33333333,
                value: 3,
                text: 'DQS GmbH - Lgistic'
            },
            {
                id: 4444444444,
                value: 4,
                text: 'DQS GmbH - Lgistic'
            }
        ];
    }

    public createGridColumnsStep2(): any {
        const result: any = [];
        result.push({
            'title': 'Id',
            'data': 'id',
            'visible': false,
            setting: {
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1',
                            Hidden: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'dataEntryCenterId',
            'data': 'dataEntryCenterId',
            'visible': false,
            setting: {
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1',
                            Hidden: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'Pool name',
            'data': 'poolName',
            'visible': true,
            setting: {
                DataType: 'nvarchar',
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'Q.ty',
            'data': 'quantity',
            'visible': true,
            setting: {
                DataType: 'nvarchar',
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'Create Date',
            'data': 'createDate',
            'visible': true,
            setting: {
                DataType: 'nvarchar',
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '1'
                        }
                    }
                ]
            }
        });
        result.push({
            'title': 'Undispatch',
            'data': 'unDispatch',
            'dataType': 'Boolean',
            'visible': true
        });

        return result;
    }
}
