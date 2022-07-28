import 'dart:convert';

SaveContactRequest saveContactRequestFromJson(String str) =>
    SaveContactRequest.fromJson(json.decode(str));

String saveContactRequestToJson(SaveContactRequest data) =>
    json.encode(data.toJson());

class SaveContactRequest {
  String idPerson;
  String firstName;
  String lastName;
  String street;
  String zip;
  String poboxLabel;
  String place;
  String company;
  String phone;
  String email;
  String internet;
  String idPersonType;

  SaveContactRequest({
    this.idPerson,
    this.firstName,
    this.lastName,
    this.street,
    this.zip,
    this.poboxLabel,
    this.place,
    this.company,
    this.phone,
    this.email,
    this.internet,
    this.idPersonType,
  });

  factory SaveContactRequest.fromJson(Map<String, dynamic> json) =>
      SaveContactRequest(
        idPerson: json["idPerson"],
        firstName: json["firstName"],
        lastName: json["lastName"],
        street: json["street"],
        zip: json["zip"],
        poboxLabel: json["poboxLabel"],
        place: json["place"],
        company: json["company"],
        phone: json["phone"],
        email: json["email"],
        internet: json["internet"],
        idPersonType: json["idPersonType"],
      );

  Map<String, dynamic> toJson() => {
        "idPerson": idPerson,
        "firstName": firstName,
        "lastName": lastName,
        "street": street,
        "zip": zip,
        "poboxLabel": poboxLabel,
        "place": place,
        "company": company,
        "phone": phone,
        "email": email,
        "internet": internet,
        "idPersonType": idPersonType,
      };
}
