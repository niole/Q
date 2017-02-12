const MSG_LEFT_LINE = "messageLeftLine";
const MSG_ENTER_LINE = "messageEnterLine";

function messageReceivedEnterLine(bathroomId, newRank, lineLength) {
  return {
    type: MSG_ENTER_LINE,
    data: { newRank, bathroomId, lineLength },
  };
}

function messageReceivedLeftLine(bathroomId, newRank, lineLength) {
  return {
    type: MSG_LEFT_LINE,
    data: { newRank, bathroomId, lineLength },
  };
}

module.exports = {
  messageReceivedLeftLine: messageReceivedLeftLine,
  messageReceivedEnterLine: messageReceivedEnterLine,
  MSG_LEFT_LINE: MSG_LEFT_LINE,
  MSG_ENTER_LINE: MSG_ENTER_LINE,
};
