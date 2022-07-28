import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/ui/screen/global_search/widgets/global_search_item.dart';
import 'package:xoonit/app/ui/screen/home/home_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';

import 'global_search_bloc.dart';

class GlobalSearchScreen extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    
    GlobalSearchBloc bloc = BlocProvider.of(context);
    HomeBloc homeBloc = BlocProvider.of(context);
    homeBloc.searchDelegate.add(bloc);

    return Container(
      child: StreamBuilder(
        stream: bloc.lsModule,
        builder: (context, snapshot) {
          return snapshot.hasData
              ? ListView.builder(
                  itemCount: snapshot.data.length,
                  padding: EdgeInsets.all(16),
                  itemBuilder: (context, index) {
                    return GlobalSearchItem(snapshot.data[index]);
                  })
              : Container();
        },
      ),
    );
  }
}
