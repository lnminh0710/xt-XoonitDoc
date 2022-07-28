import 'dart:convert';

GlobalSearchSummaryRequest globalSearchSummaryRequestFromJson(String str) => GlobalSearchSummaryRequest.fromJson(json.decode(str));

String globalSearchSummaryRequestToJson(GlobalSearchSummaryRequest data) => json.encode(data.toJson());

class GlobalSearchSummaryRequest {
    String keyword;
    String indexes;
    String searchWithStarPattern;
    bool isWithStart;

    GlobalSearchSummaryRequest({
        this.keyword,
        this.indexes,
        this.searchWithStarPattern,
        this.isWithStart,
    });

    factory GlobalSearchSummaryRequest.fromJson(Map<String, dynamic> json) => GlobalSearchSummaryRequest(
        keyword: json["keyword"] == null ? null : json["keyword"],
        indexes: json["indexes"] == null ? null : json["indexes"],
        searchWithStarPattern: json["searchWithStarPattern"] == null ? null : json["searchWithStarPattern"],
        isWithStart: json["isWithStart"] == null ? null : json["isWithStart"],
    );

    Map<String, dynamic> toJson() => {
        "keyword": keyword == null ? null : keyword,
        "indexes": indexes == null ? null : indexes,
        "searchWithStarPattern": searchWithStarPattern == null ? null : searchWithStarPattern,
        "isWithStart": isWithStart == null ? null : isWithStart,
    };
}
