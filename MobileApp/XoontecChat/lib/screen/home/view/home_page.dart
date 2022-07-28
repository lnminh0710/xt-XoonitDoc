import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:xoontec_chat/screen/authentication/authentication.dart';
import 'package:xoontec_chat/screen/chat/view/chat_screen.dart';
import 'package:xoontec_chat/theme/theme_state.dart';

class HomePage extends StatelessWidget {
  static Route route() {
    return MaterialPageRoute<void>(builder: (_) => HomePage());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text('Home')),
        drawer: Theme(
          data: Theme.of(context),
          child: Drawer(
            child: Container(
                padding: EdgeInsets.only(left: 16, top: 100),
                alignment: Alignment.topLeft,
                child: Row(
                  children: <Widget>[
                    Text('Dark mode: '),
                    Switch(
                      value: Provider.of<ThemeState>(context).isDarkMode,
                      onChanged: (boolVal) {
                        Provider.of<ThemeState>(context, listen: false)
                            .updateTheme(boolVal);
                      },
                    ),
                  ],
                )),
          ),
        ),
        body: ChatScreen()
        // Center(
        //   child: Column(
        //     mainAxisSize: MainAxisSize.min,
        //     children: <Widget>[
        //       Text(
        //         // ignore: lines_longer_than_80_chars
        //         'UserID: ${context.bloc<AuthenticationBloc>().state.user.userName}',
        //       ),
        //       RaisedButton(
        //         child: const Text('Logout'),
        //         onPressed: () {
        //           context
        //               .bloc<AuthenticationBloc>()
        //               .add(AuthenticationLogoutRequested());
        //         },
        //       ),
        //     ],
        //   ),
        // ),
        );
  }
}
