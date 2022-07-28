import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/constants_value.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/model/remote/global_search/get_module_response.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/widgets/global_search_folder_item.dart';
import 'package:xoonit/app/ui/screen/global_search/widgets/global_search_folder_item_list_view.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class GlobalSearchResult extends StatefulWidget {
  final bool isGridView;
  final String keywordSearch;
  const GlobalSearchResult(
      {Key key, this.isGridView = true, this.keywordSearch})
      : super(key: key);

  @override
  _GlobalSearchResultState createState() => _GlobalSearchResultState();
}

class _GlobalSearchResultState extends State<GlobalSearchResult> {
  bool _isGridView;
  DashBoardBloc dashBoardBloc;
  @override
  void initState() {
    super.initState();
    _isGridView = widget.isGridView;
  }

  @override
  Widget build(BuildContext context) {
    dashBoardBloc = BlocProvider.of(context);
    return StreamBuilder<List<GlobalSearchModule>>(
        stream: XoonitApplication.instance
            .getGlobalSearchController()
            .listSearchModuleStream,
        builder: (context, listModuleSnapshot) {
          return listModuleSnapshot.hasData &&
                  listModuleSnapshot.data != null &&
                  listModuleSnapshot.data.length > 0
              ? Container(
                  child: Column(
                  children: <Widget>[
                    Container(
                      alignment: Alignment.centerRight,
                      child: IconButton(
                        onPressed: () {
                          setState(() {
                            _isGridView = !_isGridView;
                          });
                        },
                        icon: Image.asset(
                          _isGridView
                              ? Resources.iconListView
                              : Resources.iconGroup,
                          width: 28,
                          height: 28,
                        ),
                      ),
                    ),
                    _isGridView
                        ? GridView.builder(
                            shrinkWrap: true,
                            physics: NeverScrollableScrollPhysics(),
                            padding: EdgeInsets.all(16),
                            itemCount: listModuleSnapshot.data.length,
                            gridDelegate:
                                SliverGridDelegateWithFixedCrossAxisCount(
                                    childAspectRatio: 3 / 2,
                                    crossAxisCount: 2,
                                    mainAxisSpacing: 12,
                                    crossAxisSpacing: 12),
                            itemBuilder: (_, index) {
                              return GlobalSearchFolderItem(
                                module: listModuleSnapshot.data[index],
                                onTap: () {
                                  _navigateTo(
                                          dashBoardBloc,
                                          listModuleSnapshot.data[index],
                                          widget.keywordSearch ?? '*')
                                      .then((value) {
                                    XoonitApplication.instance
                                        .getGlobalSearchController()
                                        .search(widget.keywordSearch);
                                  });
                                },
                              );
                            })
                        : Container(
                            padding: EdgeInsets.symmetric(horizontal: 8),
                            child: ListView.builder(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              itemBuilder: (_context, index) {
                                return GlobalSearchFolderItemListView(
                                  module: listModuleSnapshot.data[index],
                                  onTap: () {
                                    _navigateTo(
                                            dashBoardBloc,
                                            listModuleSnapshot.data[index],
                                            widget.keywordSearch ?? '*')
                                        .then((value) {
                                      XoonitApplication.instance
                                          .getGlobalSearchController()
                                          .getModules();
                                    });
                                  },
                                );
                              },
                              itemCount: listModuleSnapshot.data.length,
                            ),
                          ),
                  ],
                ))
              : Padding(
                  padding: const EdgeInsets.only(top: 80.0),
                  child: Center(child: CircularProgressIndicator()),
                );
        });
  }

  Future<void> _navigateTo(DashBoardBloc dashBoardBloc,
      GlobalSearchModule _module, String keywordSearch) async {
    // document,contact,maindocument,invoicepdm,contract,otherdocuments
    switch (_module.searchIndexKey) {
      case ConstantValues.captureKeySearchIndex:
        await dashBoardBloc.jumpToScreen(EHomeScreenChild.captureSearchDetail,
            args: keywordSearch);

        break;
      case ConstantValues.contactKeySearchIndex:
        await dashBoardBloc.jumpToScreen(EHomeScreenChild.contactSearchDetail,
            args: keywordSearch);
        break;

      case ConstantValues.allDocumentKeySearchIndex:
        await dashBoardBloc.jumpToScreen(
            EHomeScreenChild.allDocumentSearchDetail,
            args: keywordSearch);
        break;

      case ConstantValues.invoiceKeySearchIndex:
        await dashBoardBloc.jumpToScreen(EHomeScreenChild.invoiceSearchDetail,
            args: keywordSearch);
        break;

      case ConstantValues.contractKeySearchIndex:
        await dashBoardBloc.jumpToScreen(EHomeScreenChild.contractSearchDetail,
            args: keywordSearch);
        break;

      case ConstantValues.otherDocumentsKeySearchIndex:
        await dashBoardBloc.jumpToScreen(
            EHomeScreenChild.otherDocumentSearchDetail,
            args: keywordSearch);
        break;
      case ConstantValues.todoDocumentsKeySearchIndex:
        await dashBoardBloc.jumpToScreen(
            EHomeScreenChild.todoDocumentSearchDetail,
            args: keywordSearch);
        break;

      default:
        return;
    }
  }
}
