
class Invoice {
  Invoice({
    this.customerNr,
    this.invoiceNr,
    this.invoiceDate,
    this.payableWithinDays,
    this.idRepMeansOfPayment,
    this.purposeOfPayment,
    this.idRepCurrencyCode,
    this.invoiceAmount,
    this.isPaid,
    this.isTaxRelevant,
    this.isGuarantee,
    this.guaranteeDateOfExpiry,
    this.vatNr,
    this.iban,
    this.swiftbic,
    this.contoNr,
    this.invoiceExpirydDate,
    this.guranteeExpiryDate,
    this.notes,
    this.eSrNr,
  });

  dynamic customerNr;
  dynamic invoiceNr;
  String invoiceDate;
  dynamic payableWithinDays;
  dynamic idRepMeansOfPayment;
  dynamic purposeOfPayment;
  String idRepCurrencyCode;
  String invoiceAmount;
  String isPaid;
  String isTaxRelevant;
  String isGuarantee;
  dynamic guaranteeDateOfExpiry;
  dynamic vatNr;
  dynamic iban;
  dynamic swiftbic;
  dynamic contoNr;
  String invoiceExpirydDate;
  dynamic guranteeExpiryDate;
  String notes;
  String eSrNr;

  factory Invoice.fromJson(Map<String, dynamic> json) => Invoice(
        customerNr: json["customerNr"],
        invoiceNr: json["invoiceNr"],
        invoiceDate: json["invoiceDate"],
        payableWithinDays: json["payableWithinDays"],
        idRepMeansOfPayment: json["idRepMeansOfPayment"],
        purposeOfPayment: json["purposeOfPayment"],
        idRepCurrencyCode: json["idRepCurrencyCode"],
        invoiceAmount: json["invoiceAmount"],
        isPaid: json["isPaid"],
        isTaxRelevant: json["isTaxRelevant"],
        isGuarantee: json["isGuarantee"],
        guaranteeDateOfExpiry: json["guaranteeDateOfExpiry"],
        vatNr: json["vatNr"],
        iban: json["IBAN"],
        swiftbic: json["SWIFTBIC"],
        contoNr: json["ContoNr"],
        invoiceExpirydDate: json["invoiceExpirydDate"],
        guranteeExpiryDate: json["guranteeExpiryDate"],
        notes: json["notes"],
        eSrNr: json["eSRNr"],
      );

  Map<String, dynamic> toJson() => {
        "customerNr": customerNr,
        "invoiceNr": invoiceNr,
        "invoiceDate": invoiceDate,
        "payableWithinDays": payableWithinDays,
        "idRepMeansOfPayment": idRepMeansOfPayment,
        "purposeOfPayment": purposeOfPayment,
        "idRepCurrencyCode": idRepCurrencyCode,
        "invoiceAmount": invoiceAmount,
        "isPaid": isPaid,
        "isTaxRelevant": isTaxRelevant,
        "isGuarantee": isGuarantee,
        "guaranteeDateOfExpiry": guaranteeDateOfExpiry,
        "vatNr": vatNr,
        "IBAN": iban,
        "SWIFTBIC": swiftbic,
        "ContoNr": contoNr,
        "invoiceExpirydDate": invoiceExpirydDate,
        "notes": notes,
        "eSRNr": eSrNr,
      };
}