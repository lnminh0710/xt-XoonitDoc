enum ESendEvent {
  JoinToGroup,
  SendMessageToGroup,
  SendPinMessageToGroup,
  SendPinPrivateMessageToGroup,
  SendMessageStatusToGroup,
  SendMessageTranslate,
  SendClearPinMessage,

  SendUserStatus,
  SendTypingStatus,
  SendEndTypingStatus,
  SendBlockStatusByOwner,
  SendUserAvatar,
  SendUserBio,

  SendAddressBookRequest,
  SendAddressBookRequestAccept,
  SendAddressBookRequestDecline,
  SendAddressBookUpdate,
  SendGroupAddressBookUpdate,
  SendGroupAddressBookAdd,
  SendGroupAddressBookLeave,
  SendAddressBookRemove,
  SendAddOrRemoveFavorites,

  SendTopicCreate,
  SendTopicUpdate,
  SendTopicRemove,
  SendTopicOrder,

  //test
  SendMessage
}

extension ESendEventExt on ESendEvent {
  String get name => '$this'.split(".").last;
}
