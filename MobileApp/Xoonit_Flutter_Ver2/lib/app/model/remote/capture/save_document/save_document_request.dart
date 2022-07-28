import 'dart:convert';

import 'package:xoonit/app/model/remote/capture/save_document/other_documents.dart';

import 'document_contracts.dart';
import 'document_invoices.dart';
import 'document_tree_media.dart';
import 'main_document.dart';

SaveDocumentRequest saveDocumentRequestFromJson(String str) =>
    SaveDocumentRequest.fromJson(json.decode(str));

String saveDocumentRequestToJson(SaveDocumentRequest data) =>
    json.encode(data.toJson());

class SaveDocumentRequest {
  SaveDocumentRequest(
      {this.mainDocument,
      this.documentTreeMedia,
      this.folderChange,
      this.personBeneficiary,
      this.invoice,
      this.personContractingParty,
      this.contract,
      this.dynamicFields,
      this.personContact,
      this.otherDocuments});

  MainDocument mainDocument;
  DocumentTreeMedia documentTreeMedia;
  dynamic folderChange;
  ContactPerson personBeneficiary;
  Invoice invoice;
  ContactPerson personContractingParty;
  Contract contract;
  dynamic dynamicFields;
  OtherDocuments otherDocuments;
  ContactPerson personContact;

  factory SaveDocumentRequest.fromJson(Map<String, dynamic> json) =>
      SaveDocumentRequest(
          mainDocument: MainDocument.fromJson(json["mainDocument"]),
          documentTreeMedia:
              DocumentTreeMedia.fromJson(json["documentTreeMedia"]),
          folderChange: json["folderChange"],
          personBeneficiary: ContactPerson.fromJson(json["personBeneficiary"]),
          invoice: Invoice.fromJson(json["invoice"]),
          personContractingParty:
              ContactPerson.fromJson(json["personContractingParty"]),
          contract: Contract.fromJson(json["contract"]),
          dynamicFields: json["dynamicFields"],
          otherDocuments: OtherDocuments.fromJson(json["otherDocuments"]),
          personContact: ContactPerson.fromJson(json["personContact"]));

  Map<String, dynamic> toJson() => {
        "mainDocument": mainDocument?.toJson(),
        "documentTreeMedia": documentTreeMedia?.toJson(),
        "folderChange": folderChange,
        "personBeneficiary": personBeneficiary?.toJson(),
        "invoice": invoice?.toJson(),
        "personContractingParty": personContractingParty?.toJson(),
        "contract": contract?.toJson(),
        "dynamicFields": dynamicFields,
        "personContact": personContact?.toJson(),
        "otherDocuments": otherDocuments?.toJson()
      };
}

class ContactPerson {
  ContactPerson({
    this.idPerson,
    this.b00SharingCompanyCompany,
    this.b00SharingAddressStreet,
    this.b00SharingAddressZip,
    this.b00SharingAddressPlace,
    this.b00SharingAddressPoboxLabel,
    this.b00SharingCommunicationTelOffice,
    this.b00SharingCommunicationEmail,
    this.b00SharingCommunicationInternet,
    this.b00SharingNameFirstName,
    this.b00SharingNameLastName,
  });

  dynamic idPerson;
  String b00SharingCompanyCompany;
  String b00SharingAddressStreet;
  String b00SharingAddressZip;
  String b00SharingAddressPlace;
  dynamic b00SharingAddressPoboxLabel;
  String b00SharingCommunicationTelOffice;
  dynamic b00SharingCommunicationEmail;
  dynamic b00SharingCommunicationInternet;
  String b00SharingNameFirstName;
  String b00SharingNameLastName;

  factory ContactPerson.fromJson(Map<String, dynamic> json) => ContactPerson(
        idPerson: json["idPerson"],
        b00SharingCompanyCompany: json["b00SharingCompany_Company"],
        b00SharingAddressStreet: json["b00SharingAddress_Street"],
        b00SharingAddressZip: json["b00SharingAddress_Zip"],
        b00SharingAddressPlace: json["b00SharingAddress_Place"],
        b00SharingAddressPoboxLabel: json["b00SharingAddress_PoboxLabel"],
        b00SharingCommunicationTelOffice:
            json["b00SharingCommunication_TelOffice"],
        b00SharingCommunicationEmail: json["b00SharingCommunication_Email"],
        b00SharingCommunicationInternet:
            json["b00SharingCommunication_Internet"],
        b00SharingNameFirstName: json["b00SharingName_FirstName"],
        b00SharingNameLastName: json["b00SharingName_LastName"],
      );

  Map<String, dynamic> toJson() => {
        "idPerson": idPerson,
        "b00SharingCompany_Company": b00SharingCompanyCompany,
        "b00SharingAddress_Street": b00SharingAddressStreet,
        "b00SharingAddress_Zip": b00SharingAddressZip,
        "b00SharingAddress_Place": b00SharingAddressPlace,
        "b00SharingAddress_PoboxLabel": b00SharingAddressPoboxLabel,
        "b00SharingCommunication_TelOffice": b00SharingCommunicationTelOffice,
        "b00SharingCommunication_Email": b00SharingCommunicationEmail,
        "b00SharingCommunication_Internet": b00SharingCommunicationInternet,
        "b00SharingName_FirstName": b00SharingNameFirstName,
        "b00SharingName_LastName": b00SharingNameLastName,
      };
}
