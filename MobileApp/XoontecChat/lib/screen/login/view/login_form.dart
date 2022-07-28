import 'package:flutter/material.dart';
import 'package:formz/formz.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:xoontec_chat/common_component/dialog/common_dialog_notification.dart';
import 'package:xoontec_chat/screen/authentication/authentication.dart';
import 'package:xoontec_chat/screen/forgot_password/view/forgot_password_page.dart';
import 'package:xoontec_chat/screen/login/login.dart';
import 'package:xoontec_chat/screen/signup/view/signup_page.dart';
import 'package:xoontec_chat/theme/theme_state.dart';

class LoginForm extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocListener<LoginBloc, LoginState>(
      listener: (context, state) {
        if (state.status.isSubmissionFailure) {
          // Scaffold.of(context)
          //   ..hideCurrentSnackBar()
          //   ..showSnackBar(
          //     const SnackBar(
          //       content: Text('Authentication Failure!'),
          //     ),
          //   );
          showDialog(
              context: context,
              builder: (BuildContext mcontext) {
                return NotificationDialog(
                  iconImages: Icon(Icons.notifications),
                  message: 'Authentication Failure!',
                  title: 'Notification',
                  possitiveButtonName: 'OK',
                  possitiveButtonOnClick: (_context) {
                    Navigator.of(_context).pop();
                  },
                );
              });
        }
        if (state.status.isSubmissionSuccess) {
          context.bloc<AuthenticationBloc>().add(
              const AuthenticationStatusChanged(
                  AuthenticationStatus.authenticated));
        }
      },
      child: GestureDetector(
        onTap: () {
          FocusScope.of(context).requestFocus(new FocusNode());
        },
        child: Container(
          color: Colors.transparent,
          child: Align(
            alignment: const Alignment(0, -1 / 3),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _UsernameInput(),
                const Padding(padding: EdgeInsets.all(12)),
                _PasswordInput(),
                const Padding(padding: EdgeInsets.all(12)),
                _LoginButton(),
                Switch(
                  value: Provider.of<ThemeState>(context).isDarkMode,
                  onChanged: (boolVal) {
                    Provider.of<ThemeState>(context, listen: false)
                        .updateTheme(boolVal);
                  },
                ),
                FlatButton(
                  child: Text('Forgot password'),
                  onPressed: () {
                    Navigator.of(context).push(ForgotPasswordPage.route());
                  },
                ),
                FlatButton(
                  child: Text('Sign up'),
                  onPressed: () {
                    Navigator.of(context).push(SignupPage.route());
                  },
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _UsernameInput extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LoginBloc, LoginState>(
      buildWhen: (previous, current) => previous.username != current.username,
      builder: (context, state) {
        return TextField(
          key: const Key('loginForm_usernameInput_textField'),
          onChanged: (username) =>
              context.bloc<LoginBloc>().add(LoginUsernameChanged(username)),
          decoration: InputDecoration(
            labelText: 'username',
            errorText: state.username.invalid ? 'invalid username' : null,
          ),
        );
      },
    );
  }
}

class _PasswordInput extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LoginBloc, LoginState>(
      buildWhen: (previous, current) => previous.password != current.password,
      builder: (context, state) {
        return TextField(
          key: const Key('loginForm_passwordInput_textField'),
          onChanged: (password) =>
              context.bloc<LoginBloc>().add(LoginPasswordChanged(password)),
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'password',
            errorText: state.password.invalid ? 'invalid password' : null,
          ),
        );
      },
    );
  }
}

class _LoginButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LoginBloc, LoginState>(
      buildWhen: (previous, current) => previous.status != current.status,
      builder: (context, state) {
        return state.status.isSubmissionInProgress
            ? const CircularProgressIndicator()
            : RaisedButton(
                key: const Key('loginForm_continue_raisedButton'),
                child: const Text('Login'),
                onPressed: state.status.isValidated
                    ? () {
                        FocusScope.of(context).requestFocus(new FocusNode());
                        context.bloc<LoginBloc>().add(const LoginSubmitted());
                      }
                    : null,
              );
      },
    );
  }
}
