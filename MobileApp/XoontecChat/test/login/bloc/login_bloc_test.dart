// import 'package:authentication_repository/authentication_repository.dart';
// import 'package:bloc_test/bloc_test.dart';
// import 'package:xoontec_chat/screen/login/login.dart';
// import 'package:flutter_test/flutter_test.dart';
// import 'package:formz/formz.dart';
// import 'package:mockito/mockito.dart';

// class MockAuthenticationRepository extends Mock
//     implements AuthenticationRepository {}

// void main() {
//   LoginBloc loginBloc;
//   MockAuthenticationRepository authenticationRepository;

//   setUp(() {
//     authenticationRepository = MockAuthenticationRepository();
//     loginBloc = LoginBloc(authenticationRepository: authenticationRepository);
//   });

//   group('LoginBloc', () {
//     test('throws AssertionError when authenticationRepository is null', () {
//       expect(() => LoginBloc(authenticationRepository: null),
//           throwsAssertionError);
//     });

//     test('initial state is LoginState', () {
//       expect(loginBloc.state, const LoginState());
//     });

//     group('LoginSubmitted', () {
//       blocTest<LoginBloc, LoginState>(
//         'emits [submissionInProgress, submissionSuccess] '
//         'when login succeeds',
//         build: () {
//           when(authenticationRepository.logIn(
//             username: 'username',
//             password: 'password',
//           )).thenAnswer((_) => Future.value('user'));
//           return loginBloc;
//         },
//         act: (bloc) {
//           bloc
//             ..add(const LoginUsernameChanged('username'))
//             ..add(const LoginPasswordChanged('password'))
//             ..add(const LoginSubmitted());
//         },
//         expect: const <LoginState>[
//           LoginState(
//             username: Username.dirty('username'),
//             status: FormzStatus.invalid,
//           ),
//           LoginState(
//             username: Username.dirty('username'),
//             password: Password.dirty('password'),
//             status: FormzStatus.valid,
//           ),
//           LoginState(
//             username: Username.dirty('username'),
//             password: Password.dirty('password'),
//             status: FormzStatus.submissionInProgress,
//           ),
//           LoginState(
//             username: Username.dirty('username'),
//             password: Password.dirty('password'),
//             status: FormzStatus.submissionSuccess,
//           ),
//         ],
//       );

//       blocTest<LoginBloc, LoginState>(
//         'emits [LoginInProgress, LoginFailure] when logIn fails',
//         build: () {
//           when(authenticationRepository.logIn(
//             username: 'username',
//             password: 'password',
//           )).thenThrow(Exception('oops'));
//           return loginBloc;
//         },
//         act: (bloc) {
//           bloc
//             ..add(const LoginUsernameChanged('username'))
//             ..add(const LoginPasswordChanged('password'))
//             ..add(const LoginSubmitted());
//         },
//         expect: const <LoginState>[
//           LoginState(
//             username: Username.dirty('username'),
//             status: FormzStatus.invalid,
//           ),
//           LoginState(
//             username: Username.dirty('username'),
//             password: Password.dirty('password'),
//             status: FormzStatus.valid,
//           ),
//           LoginState(
//             username: Username.dirty('username'),
//             password: Password.dirty('password'),
//             status: FormzStatus.submissionInProgress,
//           ),
//           LoginState(
//             username: Username.dirty('username'),
//             password: Password.dirty('password'),
//             status: FormzStatus.submissionFailure,
//           ),
//         ],
//       );
//     });
//   });
// }
