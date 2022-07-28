import 'dart:convert';

GlobalSearchSummaryRequest globalSearchSummaryRequestFromJson(String str) => GlobalSearchSummaryRequest.fromJson(json.decode(str));

String globalSearchSummaryRequestToJson(GlobalSearchSummaryRequest data) => json.encode(data.toJson());

class GlobalSearchSummaryRequest {
    String keyword;
    String indexes;
    String searchWithStarPattern;
    bool isWithStar;

    GlobalSearchSummaryRequest({
        this.keyword,
        this.indexes,
        this.searchWithStarPattern,
        this.isWithStar,
    });

    factory GlobalSearchSummaryRequest.fromJson(Map<String, dynamic> json) => GlobalSearchSummaryRequest(
        keyword: json["keyword"] == null ? null : json["keyword"],
        indexes: json["indexes"] == null ? null : json["indexes"],
        searchWithStarPattern: json["searchWithStarPattern"] == null ? null : json["searchWithStarPattern"],
        isWithStar: json["isWithStar"] == null ? null : json["isWithStar"],
    );

    Map<String, dynamic> toJson() => {
        "keyword": keyword == null ? null : keyword,
        "indexes": indexes == null ? null : indexes,
        "searchWithStarPattern": searchWithStarPattern == null ? null : searchWithStarPattern,
        "isWithStar": isWithStar == null ? null : isWithStar,
    };
}
