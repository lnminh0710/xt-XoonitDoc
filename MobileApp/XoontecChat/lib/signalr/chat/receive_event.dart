enum EReceiveEvent {
  ReceiveMessageGroup,
  ReceivePinMessageGroup,
  ReceivePinPrivateMessageGroup,
  ReceiveJoinToGroup,
  ReceiveMessageStatusGroup,
  ReceiveClearPinMessage,

  ReceiveUserStatus,
  ReceiveTypingStatus,
  ReceiveEndTypingStatus,
  ReceiveBlockStatusByOwner,
  ReceiveUserAvatar,
  ReceiveUserBio,

  ReceiveAddressBookRequest,
  ReceiveAddressBookRequestAccept,
  ReceiveAddressBookRequestDecline,
  ReceiveAddressBookUpdate,
  ReceiveGroupAddressBookUpdate,
  ReceiveGroupAddressBookAdd,
  ReceiveGroupAddressBookLeave,
  ReceiveAddressBookRemove,
  ReceiveAddOrRemoveFavorites,

  ReceiveTopicCreate,
  ReceiveTopicUpdate,
  ReceiveTopicRemove,
  ReceiveTopicOrder,

  //test
  ReceiveMessage,
}

extension EReceiveEventExt on EReceiveEvent {
  String get name => '$this'.split(".").last;
}
