
import 'dart:convert';

GetGlobalSearchModuleResponse getGlobalSearchModuleResponseFromJson(String str) => GetGlobalSearchModuleResponse.fromJson(json.decode(str));

String getGlobalSearchModuleResponseToJson(GetGlobalSearchModuleResponse data) => json.encode(data.toJson());

class GetGlobalSearchModuleResponse {
  
    int statusCode;
    dynamic resultDescription;
    List<GlobalSearchModule> item;

    GetGlobalSearchModuleResponse({
        this.statusCode,
        this.resultDescription,
        this.item,
    });

    factory GetGlobalSearchModuleResponse.fromJson(Map<String, dynamic> json) => GetGlobalSearchModuleResponse(
        statusCode: json["statusCode"] == null ? null : json["statusCode"],
        resultDescription: json["resultDescription"],
        item: json["item"] == null ? null : List<GlobalSearchModule>.from(json["item"].map((x) => GlobalSearchModule.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "statusCode": statusCode == null ? null : statusCode,
        "resultDescription": resultDescription,
        "item": item == null ? null : List<dynamic>.from(item.map((x) => x.toJson())),
    };
}

class GlobalSearchModule {
    int idSettingsGui;
    dynamic idSettingsGuiParent;
    String moduleName;
    String iconName;
    dynamic iconNameOver;
    bool isCanNew;
    bool isCanSearch;
    dynamic toDisplay;
    List<dynamic> children;
    String searchIndexKey;
    int orderByNr;

    int count = 0;

    GlobalSearchModule({
        this.idSettingsGui,
        this.idSettingsGuiParent,
        this.moduleName,
        this.iconName,
        this.iconNameOver,
        this.isCanNew,
        this.isCanSearch,
        this.toDisplay,
        this.children,
        this.searchIndexKey,
        this.orderByNr,
    });

    factory GlobalSearchModule.fromJson(Map<String, dynamic> json) => GlobalSearchModule(
        idSettingsGui: json["idSettingsGUI"] == null ? null : json["idSettingsGUI"],
        idSettingsGuiParent: json["idSettingsGUIParent"],
        moduleName: json["moduleName"] == null ? null : json["moduleName"],
        iconName: json["iconName"] == null ? null : json["iconName"],
        iconNameOver: json["iconNameOver"],
        isCanNew: json["isCanNew"] == null ? null : json["isCanNew"],
        isCanSearch: json["isCanSearch"] == null ? null : json["isCanSearch"],
        toDisplay: json["toDisplay"],
        children: json["children"] == null ? null : List<dynamic>.from(json["children"].map((x) => x)),
        searchIndexKey: json["searchIndexKey"] == null ? null : json["searchIndexKey"],
        orderByNr: json["orderByNr"] == null ? null : json["orderByNr"],
    );

    Map<String, dynamic> toJson() => {
        "idSettingsGUI": idSettingsGui == null ? null : idSettingsGui,
        "idSettingsGUIParent": idSettingsGuiParent,
        "moduleName": moduleName == null ? null : moduleName,
        "iconName": iconName == null ? null : iconName,
        "iconNameOver": iconNameOver,
        "isCanNew": isCanNew == null ? null : isCanNew,
        "isCanSearch": isCanSearch == null ? null : isCanSearch,
        "toDisplay": toDisplay,
        "children": children == null ? null : List<dynamic>.from(children.map((x) => x)),
        "searchIndexKey": searchIndexKey == null ? null : searchIndexKey,
        "orderByNr": orderByNr == null ? null : orderByNr,
    };
}