import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:xoontec_chat/repository/app_repository.dart';
import 'package:xoontec_chat/repository/models/model_user_info.dart';

part 'authentication_event.dart';
part 'authentication_state.dart';

class AuthenticationBloc
    extends Bloc<AuthenticationEvent, AuthenticationState> {
  AuthenticationBloc(this.appRepository)
      : super(const AuthenticationState.unknown()) {
    if (appRepository.isUserLogin()) {
      add(const AuthenticationStatusChanged(
          AuthenticationStatus.authenticated));
    } else {
      add(const AuthenticationStatusChanged(
          AuthenticationStatus.unauthenticated));
    }
  }

  final AppRepository appRepository;
  @override
  Stream<AuthenticationState> mapEventToState(
    AuthenticationEvent event,
  ) async* {
    if (event is AuthenticationStatusChanged) {
      yield await _mapAuthenticationStatusChangedToState(event);
    } else if (event is AuthenticationLogoutRequested) {
      yield  const AuthenticationState.unauthenticated();
    }
  }

  @override
  Future<void> close() {
    return super.close();
  }

  Future<AuthenticationState> _mapAuthenticationStatusChangedToState(
    AuthenticationStatusChanged event,
  ) async {
    switch (event.status) {
      case AuthenticationStatus.unauthenticated:
        return const AuthenticationState.unauthenticated();
      case AuthenticationStatus.authenticated:
        final user = await _tryGetUser();
        return user != null
            ? AuthenticationState.authenticated(user)
            : const AuthenticationState.unauthenticated();
      default:
        return const AuthenticationState.unknown();
    }
  }

  Future<UserInfo> _tryGetUser() async {
    return UserInfo();
  }
}
