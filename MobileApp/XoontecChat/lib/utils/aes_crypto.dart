import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';
import 'package:hex/hex.dart';
import 'package:xoontec_chat/difinition.dart';
import 'package:crypto/crypto.dart';
import 'package:tuple/tuple.dart';
import 'package:encrypt/encrypt.dart' as encrypt;

// AES key size
const KEY_SIZE = 32; // 32 byte key for AES-256
// const ITERATION_COUNT = 1000;

class AesHelper {
  static const CBC_MODE = 'CBC';
  static const CFB_MODE = 'CFB';

  static String decryptMessage(String _message) {
    String encryptedMessage = _message;
    String hexKeyPart1 = encryptedMessage.substring(0, 4);
    String hexKeyPart2 =
        encryptedMessage.substring(encryptedMessage.length - 4);
    String hexKey = hexKeyPart1 + hexKeyPart2;
    if (hexKey.length != 8) {
      return null;
    }

    String encryptMessagekeyPart1 =
        encryptedMessage.substring(hexKeyPart1.length, hexKeyPart1.length + 20);
    String encryptMessagekeyPart2 = encryptedMessage.substring(
        encryptedMessage.length - hexKeyPart2.length - 24,
        encryptedMessage.length - hexKeyPart2.length);
    String encryptMessagekey = encryptMessagekeyPart1 + encryptMessagekeyPart2;
    if (encryptMessagekey.length != 44) {
      return null;
    }
    printLog('decryptMessage encryptMessagekey: ' + encryptMessagekey);
    printLog('decryptMessage hexKey: ' + hexKey);
    String messageKey = decryptAESCryptoJS(encryptMessagekey, hexKey);
    // String messageKey = decrypt(hexKey, encryptMessagekey);

    encryptedMessage = encryptedMessage.substring(
        hexKeyPart1.length + encryptMessagekeyPart1.length,
        encryptedMessage.length -
            hexKeyPart2.length -
            encryptMessagekeyPart2.length);

    String message = decryptAESCryptoJS(encryptedMessage, messageKey);
    // String message = decrypt(messageKey, encryptedMessage);

    return message;
  }

  static String encryptMessage(String _message) {
    printLog('encryptMessage message : ' + _message);
    String messageKey = HEX.encode(genRandomWithNonZero(4));
    printLog('encryptMessage messageKey: ' + messageKey);

    String message = encryptAESCryptoJS(_message, messageKey);
    // String message = encrypt(messageKey, _message);

    printLog('encryptMessage message encrypt: ' + message);
    String hexKey = HEX.encode(genRandomWithNonZero(4));
    // Encrypt Key
    String encryptMessagekey = encryptAESCryptoJS(messageKey, hexKey);
    // String encryptMessagekey = encrypt(hexKey, messageKey);

    String encryptMessagekeyPart1 = encryptMessagekey.substring(0, 20);
    String encryptMessagekeyPart2 = encryptMessagekey.substring(20);
    String hexKeyPart1 = hexKey.substring(0, 4);
    String hexKeyPart2 = hexKey.substring(4);
    printLog('encryptMessage encryptMessagekey: ' + encryptMessagekey);
    printLog('encryptMessage hexKey: ' + hexKey);
    message = hexKeyPart1 +
        encryptMessagekeyPart1 +
        message +
        encryptMessagekeyPart2 +
        hexKeyPart2;
    return message;
  }

  static String encryptAESCryptoJS(String plainText, String passphrase) {
    try {
      final salt = genRandomWithNonZero(8);
      var keyndIV = deriveKeyAndIV(passphrase, salt);
      final key = encrypt.Key(keyndIV.item1);
      final iv = encrypt.IV(keyndIV.item2);

      final encrypter = encrypt.Encrypter(
          encrypt.AES(key, mode: encrypt.AESMode.cbc, padding: "PKCS7"));
      final encrypted = encrypter.encrypt(plainText, iv: iv);
      Uint8List encryptedBytesWithSalt = Uint8List.fromList(
          createUint8ListFromString("Salted__") + salt + encrypted.bytes);
      return base64.encode(encryptedBytesWithSalt);
    } catch (error) {
      throw error;
    }
  }

  static String decryptAESCryptoJS(String encrypted, String passphrase) {
    try {
      Uint8List encryptedBytesWithSalt = base64.decode(encrypted);

      Uint8List encryptedBytes =
          encryptedBytesWithSalt.sublist(16, encryptedBytesWithSalt.length);
      final salt = encryptedBytesWithSalt.sublist(8, 16);
      var keyndIV = deriveKeyAndIV(passphrase, salt);
      final key = encrypt.Key(keyndIV.item1);
      final iv = encrypt.IV(keyndIV.item2);

      final encrypter = encrypt.Encrypter(
          encrypt.AES(key, mode: encrypt.AESMode.cbc, padding: "PKCS7"));
      final decrypted =
          encrypter.decrypt64(base64.encode(encryptedBytes), iv: iv);
      return decrypted;
    } catch (error) {
      throw error;
    }
  }

  static Tuple2<Uint8List, Uint8List> deriveKeyAndIV(
      String passphrase, Uint8List salt) {
    var password = createUint8ListFromString(passphrase);
    Uint8List concatenatedHashes = Uint8List(0);
    Uint8List currentHash = Uint8List(0);
    bool enoughBytesForKey = false;
    Uint8List preHash = Uint8List(0);

    while (!enoughBytesForKey) {
      int preHashLength = currentHash.length + password.length + salt.length;
      if (currentHash.length > 0)
        preHash = Uint8List.fromList(currentHash + password + salt);
      else
        preHash = Uint8List.fromList(password + salt);

      currentHash = md5.convert(preHash).bytes;
      concatenatedHashes = Uint8List.fromList(concatenatedHashes + currentHash);
      if (concatenatedHashes.length >= 48) enoughBytesForKey = true;
    }

    var keyBtyes = concatenatedHashes.sublist(0, 32);
    var ivBtyes = concatenatedHashes.sublist(32, 48);
    return new Tuple2(keyBtyes, ivBtyes);
  }

  static Uint8List createUint8ListFromString(String s) {
    var ret = new Uint8List(s.length);
    for (var i = 0; i < s.length; i++) {
      ret[i] = s.codeUnitAt(i);
    }
    return ret;
  }

  static Uint8List genRandomWithNonZero(int seedLength) {
    final random = Random.secure();
    const int randomMax = 245;
    final Uint8List uint8list = Uint8List(seedLength);
    for (int i = 0; i < seedLength; i++) {
      uint8list[i] = random.nextInt(randomMax) + 1;
    }
    return uint8list;
  }
}
