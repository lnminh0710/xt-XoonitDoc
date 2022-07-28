export class WidgetTranslateFakeDate {

    public createLabels() {
        return [
            {
                id: 1,
                text: 'PersonNr',
                value: '012511456',
                dataType: 'varchar'
            },
            {
                id: 2,
                text: 'Note',
                value: 'this is a note',
                dataType: 'varchar'

            },
            {
                id: 3,
                text: 'IsMatch',
                value: true,
                dataType: 'boolean'
            },
            {
                id: 4,
                text: 'IsActive',
                value: false,
                dataType: 'boolean'
            },
            {
                id: 5,
                text: 'CreateDate',
                value: '2017-08-23',
                dataType: 'varchar'
            },
            {
                id: 6,
                text: 'UpdateDate',
                value: '2017-08-23',
                dataType: 'varchar'
            },
            {
                id: 7,
                text: 'Street',
                value: 'Reiver',
                dataType: 'varchar'
            },
            {
                id: 8,
                text: 'StreetNr',
                value: '123',
                dataType: 'varchar'
            },
            {
                id: 9,
                text: 'StreetAddition1',
                value: '123',
                dataType: 'varchar'
            },
            {
                id: 10,
                text: 'StreetAddition2',
                value: '12321',
                dataType: 'varchar'
            },
            {
                id: 11,
                text: 'StreetAddition3',
                value: '12321',
                dataType: 'varchar'
            },
            {
                id: 12,
                text: 'Addition',
                value: '',
                dataType: 'varchar'
            },
            {
                id: 13,
                text: 'PoboxLable',
                value: '',
                dataType: 'varchar'
            },
            {
                id: 14,
                text: 'Zip',
                value: '700000',
                dataType: 'varchar'
            },
            {
                id: 15,
                text: 'Zip2',
                value: '',
                dataType: 'varchar'
            },
            {
                id: 16,
                text: 'Place',
                value: '',
                dataType: 'varchar'
            },
            {
                id: 17,
                text: 'Area',
                value: 'Now zone',
                dataType: 'varchar'
            },
            {
                id: 18,
                text: 'CountryAddition',
                value: 'England',
                dataType: 'varchar'
            },
            {
                id: 17,
                text: 'IsDeleted',
                value: true,
                dataType: 'boolean'
            },
        ]
    }
    public getLanguage(textId: any): any {
        switch (textId) {
            case 1: {
                return [
                    {
                        LanguageName: 'German',
                        TranslateText: 'Tieng Duc'
                    },
                    {
                        LanguageName: 'Italian',
                        TranslateText: 'Tieng Y'
                    },
                    {
                        LanguageName: 'French',
                        TranslateText: 'Tieng Phap'
                    },
                    {
                        LanguageName: 'English',
                        TranslateText: 'Tieng Anh'
                    },
                    {
                        LanguageName: 'Spanish',
                        TranslateText: 'Tieng Tay Ban Nha'
                    },
                    {
                        LanguageName: 'Portuguese',
                        TranslateText: 'Tieng Bo Dao Nha'
                    },
                    {
                        LanguageName: 'Dutch',
                        TranslateText: 'Tieng Ha lan'
                    },
                    {
                        LanguageName: 'Japanese',
                        TranslateText: 'Y Cu, Y Cu'
                    }
                ]
            }
            case 2: {
                return [
                    {
                        LanguageName: 'German',
                        TranslateText: 'Tieng Duc 2'
                    },
                    {
                        LanguageName: 'Italian',
                        TranslateText: 'Tieng Y 2'
                    },
                    {
                        LanguageName: 'French',
                        TranslateText: 'Tieng Phap 2'
                    },
                    {
                        LanguageName: 'English',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'Spanish',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'Portuguese',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'Dutch',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'Japanese',
                        TranslateText: 'Y Cu, Y Cu'
                    }
                ]
            }
            case 3: {
                return [
                    {
                        LanguageName: 'German',
                        TranslateText: 'Tieng Duc'
                    },
                    {
                        LanguageName: 'Italian',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'French',
                        TranslateText: 'Tieng Phap'
                    },
                    {
                        LanguageName: 'English',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'Spanish',
                        TranslateText: 'Tieng Tay Ban Nha'
                    },
                    {
                        LanguageName: 'Portuguese',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'Dutch',
                        TranslateText: 'Tieng Ha lan'
                    },
                    {
                        LanguageName: 'Japanese',
                        TranslateText: 'Y Cu, Y Cu'
                    }
                ]
            }
            case 4: {
                return [
                    {
                        LanguageName: 'German',
                        TranslateText: 'Tieng Duc'
                    },
                    {
                        LanguageName: 'Italian',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'French',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'English',
                        TranslateText: 'Tieng Anh'
                    },
                    {
                        LanguageName: 'Spanish',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'Portuguese',
                        TranslateText: 'Tieng Bo Dao Nha'
                    },
                    {
                        LanguageName: 'Dutch',
                        TranslateText: ''
                    },
                    {
                        LanguageName: 'Japanese',
                        TranslateText: ''
                    }
                ]
            }
            default: {
                return [];
            }
        }
    }

    public createGridData() {
        return {
            data: this.createData(),
            columns: this.createColumns()
        }
    }

    private createData() {
        return [];
    }

    private createColumns() {
        return [
        {
            title: 'Language Name',
            data: 'LanguageName',
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
        },
        {
            title: 'Translate Text',
            data: 'TranslateText',
            setting: {
                DataType: 'nvarchar',
                Setting: [
                    {
                        DisplayField: {
                            ReadOnly: '0'
                        }
                    }
                ]
            }
        }
    ];
    }
}
