
import 'dart:convert';

GlobalSearchSummaryResponse globalSearchSummaryResponseFromJson(String str) => GlobalSearchSummaryResponse.fromJson(json.decode(str));

String globalSearchSummaryResponseToJson(GlobalSearchSummaryResponse data) => json.encode(data.toJson());

class GlobalSearchSummaryResponse {

    int statusCode;
    dynamic resultDescription;
    List<GlobalSearchSummary> item;

    GlobalSearchSummaryResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    factory GlobalSearchSummaryResponse.fromJson(Map<String, dynamic> json) => GlobalSearchSummaryResponse(
        statusCode: json["statusCode"] == null ? null : json["statusCode"],
        resultDescription: json["resultDescription"],
        item: json["item"] == null ? null : List<GlobalSearchSummary>.from(json["item"].map((x) => GlobalSearchSummary.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode == null ? null : statusCode,
        "resultDescription": resultDescription,
        "item": item == null ? null : List<dynamic>.from(item.map((x) => x.toJson())),
    };
}

class GlobalSearchSummary {
  
    String key;
    int count;

    GlobalSearchSummary({
        this.key,
        this.count,
    });

    factory GlobalSearchSummary.fromJson(Map<String, dynamic> json) => GlobalSearchSummary(
        key: json["key"] == null ? null : json["key"],
        count: json["count"] == null ? null : json["count"],
    );

    Map<String, dynamic> toJson() => {
        "key": key == null ? null : key,
        "count": count == null ? null : count,
    };
}
