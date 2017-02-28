const MSG_LEFT_LINE = "messageLeftLine";
const MSG_ENTER_LINE = "messageEnterLine";
const MSG_UPDATE_LINE_LINE_MEMBER = "messageLinememberUpdateLine";
const MSG_RECEIVED_CUT_MESSAGE = "messageReceivedCutMessage";
const MSG_RANK_UPDATED = "messageRankUpdated";
const MSG_BATHROOM_CREATED = "messageBathroomCreated";

function messageBathroomCreated(bathroom) {
  return {
    type: MSG_BATHROOM_CREATED,
    data: [bathroom],
  };
}

function messageReceivedRankUpdated(bathroomId, newRank) {
  return {
    type: MSG_RANK_UPDATED,
    data: {
      bathroomId: bathroomId,
      newRank: newRank || null,
    }
  };
}

function messageReceivedCutMessage(cutMessage) {
  return {
    type: MSG_RECEIVED_CUT_MESSAGE,
    data: cutMessage,
  };
}

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
    data: {
      newRank,
      bathroomId,
      lineLength
    },
  };
}

function messageReceivedLeftLine(bathroomId, lineLength) {
  return {
    type: MSG_LEFT_LINE,
    data: {
      bathroomId,
      lineLength
    },
  };
}

module.exports = {
  messageReceivedLeftLine: messageReceivedLeftLine,
  messageReceivedEnterLine: messageReceivedEnterLine,
  messageReceivedUpdateLineLineMember: messageReceivedUpdateLineLineMember,
  messageReceivedCutMessage: messageReceivedCutMessage,
  messageReceivedRankUpdated: messageReceivedRankUpdated,
  messageBathroomCreated: messageBathroomCreated,
  MSG_LEFT_LINE: MSG_LEFT_LINE,
  MSG_ENTER_LINE: MSG_ENTER_LINE,
  MSG_UPDATE_LINE_LINE_MEMBER: MSG_UPDATE_LINE_LINE_MEMBER,
  MSG_RECEIVED_CUT_MESSAGE: MSG_RECEIVED_CUT_MESSAGE,
  MSG_RANK_UPDATED: MSG_RANK_UPDATED,
  MSG_BATHROOM_CREATED: MSG_BATHROOM_CREATED,
};
