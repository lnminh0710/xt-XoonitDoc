import { PersonTypeIdEnum } from '@app/app.constants';
export class FakeData {
    public createTabsData() {
        return [
            {
                title: 'Order Processing',
                projectType: 'OrderProcessing',
                active: true,
                data: [
                    {
                        id: 1,
                        header: 'Person',
                        parentId: 0,
                        level: 0,
                        items: [
                            {
                                id: 11,
                                header: 'Customer',
                                index: 'customer',
                                type: 'customer',
                                idPersonType: PersonTypeIdEnum.Customer,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 12,
                                header: 'Broker',
                                index: 'broker',
                                type: 'broker',
                                idPersonType: PersonTypeIdEnum.Broker,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 13,
                                header: 'Cash Provider',
                                index: 'cashprovider',
                                type: 'cashprovider',
                                idPersonType: PersonTypeIdEnum.CashProvider,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 14,
                                header: 'Desktop Provider',
                                index: 'desktopprovider',
                                type: 'desktopprovider',
                                idPersonType: PersonTypeIdEnum.DesktopProvider,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 15,
                                header: 'Freight Provider',
                                index: 'freightprovider',
                                type: 'freightprovider',
                                idPersonType: PersonTypeIdEnum.FreightProvider,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 16,
                                header: 'Mandant',
                                index: 'mandant',
                                type: 'mandant',
                                idPersonType: PersonTypeIdEnum.Mandant,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 17,
                                header: 'Post Provider',
                                index: 'postprovider',
                                type: 'postprovider',
                                idPersonType: PersonTypeIdEnum.PostProvider,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 18,
                                header: 'Principal',
                                index: 'principal',
                                type: 'principal',
                                idPersonType: PersonTypeIdEnum.Principal,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 19,
                                header: 'Print Provider',
                                index: 'printprovider',
                                type: 'printprovider',
                                idPersonType: PersonTypeIdEnum.PrintProvider,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 20,
                                header: 'Provider',
                                index: 'provider',
                                type: 'provider',
                                idPersonType: PersonTypeIdEnum.Provider,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 21,
                                header: 'Scan Center',
                                index: 'scancenter',
                                type: 'scancenter',
                                idPersonType: PersonTypeIdEnum.ScanCenter,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 22,
                                header: 'Service Provider',
                                index: 'serviceprovider',
                                type: 'serviceprovider',
                                idPersonType: PersonTypeIdEnum.ServiceProvider,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 23,
                                header: 'Supplier',
                                index: 'supplier',
                                type: 'supplier',
                                idPersonType: PersonTypeIdEnum.Supplier,
                                parentId: 1,
                                level: 1
                            },
                            {
                                id: 24,
                                header: 'Warehouse',
                                index: 'warehouse',
                                type: 'warehouse',
                                idPersonType: PersonTypeIdEnum.Warehouse,
                                parentId: 1,
                                level: 1
                            }
                        ]
                    },
                    {
                        id: 4,
                        header: 'Others',
                        parentId: 0,
                        level: 0,
                        items: [
                            {
                                id: 41,
                                header: 'Orders',
                                index: 'orders',
                                type: 'orders',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 42,
                                header: 'ReturnRefund',
                                index: 'returnrefund',
                                type: 'returnrefund',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 43,
                                header: 'Stock Correction',
                                index: 'stockcorrection',
                                type: 'stockcorrection',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 44,
                                header: 'Warehouse Movement',
                                index: 'warehousemovement',
                                type: 'warehousemovement',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 45,
                                header: 'Article',
                                index: 'article',
                                type: 'article',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 46,
                                header: 'BusinessCosts',
                                index: 'businesscosts',
                                type: 'businesscosts',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 47,
                                header: 'Campaign',
                                index: 'campaign',
                                type: 'campaign',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 48,
                                header: 'CashContractPRN',
                                index: 'ccprn',
                                type: 'ccprn',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 49,
                                header: 'Notification',
                                index: 'notification',
                                type: 'notification',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 50,
                                header: 'Order Processing',
                                index: 'orderprocessing',
                                type: 'orderprocessing',
                                object: 'OrderProcessingSearch',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 51,
                                header: 'Document Management',
                                index: 'document',
                                type: 'document',
                                object: 'DocumentContainerOCRSearch',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 52,
                                header: 'Contract',
                                index: 'contract',
                                type: 'contract',
                                object: 'ContractSearch',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 53,
                                header: 'InvoicePdm',
                                index: 'invoicepdm',
                                type: 'invoicepdm',
                                object: 'InvoicePdmSearch',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 54,
                                header: 'Contact',
                                index: 'contact',
                                type: 'contact',
                                object: 'ContactSearch',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 55,
                                header: 'Other Documents',
                                index: 'otherdocuments',
                                type: 'otherdocuments',
                                object: 'OtherDocumentsSearch',
                                parentId: 4,
                                level: 1
                            },
                            {
                                id: 56,
                                header: 'Main Documents',
                                index: 'maindocument',
                                type: 'maindocument',
                                object: 'DocumentSearch',
                                parentId: 4,
                                level: 1
                            },
                            
                        ]
                    }
                ]
            },
            //{
            //    title: 'Selection',
            //    active: false,
            //    data: [
            //        {
            //            id: 21,
            //            header: 'Broker',
            //            index: 'selectionbroker',
            //            type: 'selectionbroker',
            //            parentId: 0,
            //            level: 0
            //        },
            //        {
            //            id: 22,
            //            header: 'Campaign',
            //            index: 'selectioncampaign',
            //            type: 'selectioncampaign',
            //            parentId: 0,
            //            level: 0
            //        },
            //        {
            //            id: 23,
            //            header: 'Collect',
            //            index: 'selectioncollect',
            //            type: 'selectioncollect',
            //            parentId: 0,
            //            level: 0
            //        }
            //    ]
            //},
            //{
            //    title: 'Reporting',
            //    active: false,
            //    data: [
            //        {
            //            id: 31,
            //            header: 'Customer',
            //            index: 'reporting_customer',
            //            type: 'reporting_customer',
            //            idPersonType: PersonTypeIdEnum.Customer,
            //            parentId: 0,
            //            level: 0
            //        }
            //    ]
            //},
        ]
    }

    public createGridColumns() {
        return [
            {
                title: 'Id',
                data: 'id',
                setting: {
                    DataType: 'number',
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1'
                            }
                        }
                    ]
                }
            },
            {
                title: 'Module',
                data: 'module',
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
                title: 'Time (s)',
                data: 'time',
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
                title: 'Sync Records',
                data: 'syncRecords',
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
                title: 'Sync Status',
                data: 'syncStatus',
                setting: {
                    DataType: 'nvarchar',
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1'
                            },
                            ControlType: {
                                Type: 'Icon'
                            }
                        }
                    ]
                }
            },
            {
                title: 'Index',
                data: 'index',
                setting: {
                    DataType: 'nvarchar',
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1',
                                ReadOnly: '1'
                            }
                        }
                    ]
                }
            },
            {
                title: 'TotalRecords',
                data: 'totalRecords',
                setting: {
                    DataType: 'nvarchar',
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1',
                                ReadOnly: '1'
                            }
                        }
                    ]
                }
            },
            {
                title: 'SynchronizedRecords',
                data: 'synchronizedRecords',
                setting: {
                    DataType: 'nvarchar',
                    Setting: [
                        {
                            DisplayField: {
                                Hidden: '1',
                                ReadOnly: '1'
                            }
                        }
                    ]
                }
            }
        ];
    }
}
