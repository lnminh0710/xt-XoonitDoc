import 'dart:convert';

FilterUsersResponse filterUsersResponseFromJson(String str) => FilterUsersResponse.fromJson(json.decode(str));

String filterUsersResponseToJson(FilterUsersResponse data) => json.encode(data.toJson());

class FilterUsersResponse {
    FilterUsersResponse({
        this.statusCode,
        this.resultDescription,
        this.users,
    });

    int statusCode;
    dynamic resultDescription;
    List<UserItem> users;

    factory FilterUsersResponse.fromJson(Map<String, dynamic> json) => FilterUsersResponse(
        statusCode: json["statusCode"],
        resultDescription: json["resultDescription"],
        users: json["item"] != null ?List<UserItem>.from(json["item"].map((x) => UserItem.fromJson(x))):[],
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode,
        "resultDescription": resultDescription,
        "item": List<dynamic>.from(users.map((x) => x.toJson())),
    };
}

class UserItem {
    UserItem({
        this.userId,
        this.fullName,
    });

    int userId;
    String fullName;

    factory UserItem.fromJson(Map<String, dynamic> json) => UserItem(
        userId: json["userId"],
        fullName: json["fullName"],
    );

    Map<String, dynamic> toJson() => {
        "userId": userId,
        "fullName": fullName,
    };
}
