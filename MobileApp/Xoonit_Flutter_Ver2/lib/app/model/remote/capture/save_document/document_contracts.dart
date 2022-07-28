class Contract {
  Contract({
    this.idContract,
    this.contractNr,
    this.netAnnualPremium,
    this.idRepCurrencyCode,
    this.commencementOfInsurance,
    this.termOfContract,
    this.notes,
    this.memeberNr,
    this.contractDate,
    this.untilDate,
    this.durationInMonths,
    this.cancellationUntilDate,
    this.cancellationInMonths,
  });

  dynamic idContract;
  String contractNr;
  dynamic netAnnualPremium;
  dynamic idRepCurrencyCode;
  dynamic commencementOfInsurance;
  dynamic termOfContract;
  String notes;
  String memeberNr;
  String contractDate;
  String untilDate;
  String durationInMonths;
  String cancellationUntilDate;
  String cancellationInMonths;

  factory Contract.fromJson(Map<String, dynamic> json) => Contract(
        idContract: json["idContract"],
        contractNr: json["contractNr"],
        netAnnualPremium: json["netAnnualPremium"],
        idRepCurrencyCode: json["idRepCurrencyCode"],
        commencementOfInsurance: json["commencementOfInsurance"],
        termOfContract: json["termOfContract"],
        notes: json["notes"],
        memeberNr: json["memeberNr"],
        contractDate: json["contractDate"],
        untilDate: json["untilDate"],
        durationInMonths: json["durationInMonths"],
        cancellationUntilDate: json["cancellationUntilDate"],
        cancellationInMonths: json["cancellationInMonths"],
      );

  Map<String, dynamic> toJson() => {
        "idContract": idContract,
        "contractNr": contractNr,
        "netAnnualPremium": netAnnualPremium,
        "idRepCurrencyCode": idRepCurrencyCode,
        "commencementOfInsurance": commencementOfInsurance,
        "termOfContract": termOfContract,
        "notes": notes,
        "memeberNr": memeberNr,
        "contractDate": contractDate,
        "untilDate": untilDate,
        "durationInMonths": durationInMonths,
        "cancellationUntilDate": cancellationUntilDate,
        "cancellationInMonths": cancellationInMonths,
      };
}