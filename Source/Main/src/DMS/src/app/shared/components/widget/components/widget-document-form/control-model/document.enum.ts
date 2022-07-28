import { DocumentProcessingTypeEnum } from '@app/app.constants';

export const contactModeEnum = {
    beneficiary: 'BeneficiaryContact',
    remitter: 'RemitterContact',
    bank: 'BankContact',
    contractor: 'Contractor',
    contractingParty: 'ContractingParty',
    privat: 'Privat',
    contact: 'Contact',
}

export const communicationTypeDisplayNameConstant = [
    { type: 'Phone', displayName: 'Tel Office' },
    { type: 'E-Mails', displayName: 'Email' },
    { type: 'Internet', displayName: 'Internet' },
];

export const personContactDisplayNameConstant = [
    { type: 'Company', displayName: 'Firma' },
    { type: 'FirstName', displayName: 'Kontaktperson Vorname' },
    { type: 'LastName', displayName: 'Kontaktperson Nachname' },
    { type: 'Street', displayName: 'Strasse' },
    { type: 'Zip', displayName: 'PLZ' },
    { type: 'Place', displayName: 'Ort' },
    { type: 'ContoNr', displayName: 'Konto Nr.' },
    { type: 'SWIFTBIC', displayName: 'BIC / SWIFT' },
    { type: 'IBAN', displayName: 'IBAN' },
    { type: 'PoboxLabel', displayName: 'PO Box' },
];

export const communicationTypeSettingEnum = {
    comTypeName: 'IdRepCommunicationType',
    valueTypeName: 'CommValue1',
};

export const invoiceDisplayNameConstant = [
    { type: 'CustomerNr', displayName: 'Kunder / Mitglieds Nr.' },
    { type: 'InvoiceNr', displayName: 'ReChnungs Nr.' },
    { type: 'InvoiceDate', displayName: 'ReChnungs Datum' },
    { type: 'PayableWithinDays', displayName: 'Zahlbar innert Tagen' },
    { type: 'MeansOfPayment', displayName: 'Zahlungsmittel' },
    { type: 'PurposeOfPayment', displayName: 'Zahlungszweck' },
    { type: 'IdRepCurrencyCode', displayName: 'Wahrung' },
    { type: 'InvoiceAmount', displayName: 'Rechnungsbetrag' },
    { type: 'IsPaid', displayName: 'Bezahlt' },
    { type: 'IsTaxRelevant', displayName: 'Steuerrelevant' },
    { type: 'IsGuarantee', displayName: 'Garantie' },
    { type: 'GuaranteeDateOfExpiry', displayName: 'Bis Datum' },
    { type: 'SWIFTBIC', displayName: 'ESR / (BESER / VESR) Referenz Nr.' },
    { type: 'VatNr', displayName: 'VAT Nr.' },
];

export const contractDisplayNameConstant = [
    { type: 'IdRepCurrencyCode', displayName: 'Currency' },
    { type: 'ContractNr', displayName: 'Contract Nr.' },
    { type: 'NetAnnualPremium', displayName: 'Net Annual Premium' },
    { type: 'CommencementOfInsurance', displayName: 'Commencement Of Insurance' },
    { type: 'TermOfContract', displayName: 'Term Of Contract' },
];

export const dataTypeFormControl = {
    comboBox: 'combobox',
    nvarchar: 'nvarchar',
    varchar: 'varchar',
    datetime: 'datetime',
    decimal: 'decimal',
    bigint: 'bigint',
    int: 'int',
    money: 'money',
    bit: 'bit',
};

export const dynamicInvoiceColumnNameConstant = {
    columnName: 'FieldName',
    valueName: 'FieldValue',
}

export const documentContactTypeList = [
    {
        type: DocumentProcessingTypeEnum.INVOICE,
        textValueTrue: 'Firma',
        textValueFalse: 'Privat',
        data: [{
            prefix: 'BENEFICIARY',
            name: 'Beneficiary'
        },
        {
            prefix: 'REMITTER',
            name: 'Remitter'
        }],
    },
    {
        type: DocumentProcessingTypeEnum.CONTRACT,
        textValueTrue: 'Contractor',
        textValueFalse: 'ContractingParty',
        data: [{
            prefix: 'CONTRACTOR',
            name: 'Contractor'
        },
        {
            prefix: 'CONTRACTINGPARTY',
            name: 'ContractingParty'
        }],
    },
    {
        type: DocumentProcessingTypeEnum.OTHER_DOCUMENT,
        textValueTrue: 'Contact',
        textValueFalse: 'Private',
        data: [{
            prefix: 'CONTACT',
            name: 'Contact'
        },
        {
            prefix: 'PRIVAT',
            name: 'Privat'
        }],
    },
    {
        type: DocumentProcessingTypeEnum.UNKNOWN,
        textValueTrue: 'Contact',
        textValueFalse: 'Private',
        data: [{
            prefix: 'CONTACT',
            name: 'Contact'
        },
        {
            prefix: 'PRIVAT',
            name: 'Privat'
        }],
    },
];
