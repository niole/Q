const MSG_LEFT_LINE = "messageLeftLine";
const MSG_ENTER_LINE = "messageEnterLine";
const MSG_UPDATE_LINE_LINE_MEMBER = "messageLinememberUpdateLine";

function messageReceivedEnterLine(bathroomId, lineLength) {
  return {
    type: MSG_ENTER_LINE,
    data: {
      bathroomId,
      lineLength
    },
  };
}

function messageReceivedUpdateLineLineMember(bathroomId, newRank, lineLength) {
  return {
    type: MSG_UPDATE_LINE_LINE_MEMBER,
    data: { newRank, bathroomId, lineLength },
  };
}

function messageReceivedLeftLine(bathroomId, lineLength) {
  return {
    type: MSG_LEFT_LINE,
    data: { bathroomId, lineLength },
  };
}

module.exports = {
  messageReceivedLeftLine: messageReceivedLeftLine,
  messageReceivedEnterLine: messageReceivedEnterLine,
  messageReceivedUpdateLineLineMember: messageReceivedUpdateLineLineMember,
  MSG_LEFT_LINE: MSG_LEFT_LINE,
  MSG_ENTER_LINE: MSG_ENTER_LINE,
  MSG_UPDATE_LINE_LINE_MEMBER: MSG_UPDATE_LINE_LINE_MEMBER,
};
