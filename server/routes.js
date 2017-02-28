"use strict";
const express = require('express');
const router = express.Router();
const queryHelpers = require('../app/queryHelpers.js');
const s = require('../expressAppInstance.js');
const io = require('socket.io')(s.server);
const models = require('./Models.js');
const actions = require('../app/serverActions.js');

const Bathroom = models.Bathroom;
const User = models.User;
const LineMember = models.LineMember;
const Message = models.Message;
const sequelize = models.sequelize;

const shouldBeInt = ["bathroomId", "fromId", "toId", "money", "userId"];

s.app.set('socketio', io);
let emitter;

//update user location
router.post('/user/:userId/loc/update', function(req, res) {
    const latitude = req.body.lat;
    const longitude = req.body.lng;

    User.update({
        latitude: latitude,
        longitude: longitude,
      }, {
      where: {
        id: req.params.userId
      }
    }).then(function() {
      res.send({
        latitude: latitude,
        longitude: longitude,
      });
    });
});

//get user
router.get('/user/:id', function(req, res) {
    User.findAll({
      where: {
        id: req.params.id
      }
    }).then(function(user) {
      if (user) {
        res.send(user);
      }
    });
});

//update user's money
router.post('/user/:id/:money', function(req, res) {
    User.update({
      money: req.params.money,
    }).then(function(user) {
      if (user) {
        res.send(user);
      }
    });
});

//get specific linemember record
router.get('/linemember/:bathroomId/:userid', function(req, res) {
    const userid = req.params.userid;
    const bathroomId = req.params.bathroomId;

    LineMember.find({
      where: {
        userId: userid,
        bathroomId: bathroomId,
      }
    }).then(function(lineMember) {
      const data = lineMember && lineMember.dataValues;
      if (data) {
        res.send(data);
      }
    });
});

//get user's line locations
router.get('/linemember/:userid', function(req, res) {
    const userid = req.params.userid;

    LineMember.findAll({
      userId: userid,
    }).then(function(lineMembers) {
      if (lineMembers) {
        res.send(lineMembers);
      }
    });
});

//enter line at bathroom
router.get('/linemember/:userid/:bathroomid/new', function(req, res) {
  const bathroomId = req.params.bathroomid;
  const userId = req.params.userid;

  Bathroom.findAll({
    where: {
      id: bathroomId
    }
  }).then(function(bathroom) {
    if (bathroom[0].dataValues) {
      bathroom = bathroom[0].dataValues;
      const nextLineLength = bathroom.lineLength+1;

      Bathroom.update({
          lineLength: nextLineLength
        }, {
          where: {
            id: bathroomId
          }
      }).then(function() {
          const newRank = nextLineLength-1;

          LineMember.create({
            bathroomId: bathroom.id,
            rank: newRank,
            userId: userId
          }).then(function() {
              User.findAll({
                where: queryHelpers.getNeabyUsersWhereClause(bathroom.latitude, bathroom.longitude, userId)
              }).then(function(nearby) {
                emitter = req.app.get('socketio');

                nearby.forEach(function(user) {
                  const userData = user.dataValues;
                  emitter.emit(userData.id, actions.messageReceivedEnterLine(parseInt(bathroomId), nextLineLength));
                });

                res.send({
                  bathroomId: bathroom.id,
                  rank: newRank,
                });

              });
          });

      });
    }
  });

});

//enter bathroom
router.get('/linemember/:linememberid/enter', function(req, res) {
  const linememberid = req.params.linememberid;

  LineMember.update({
    rank: 0,
  }, {
    where: {
      id: linememberid
    }
  }).then(function(lineMembers) {
    res.send(lineMembers);
  });

});

//leave bathroom/line
router.get('/linemember/:userId/:bathroomId/leave', function(req, res) {
  const userId = req.params.userId;
  const bathroomId = req.params.bathroomId;

  LineMember.find({
    where: {
      userId: userId,
      bathroomId: bathroomId,
    }
  }).then(function(goneLineMember) {
    LineMember.destroy({
      where: {
        userId: userId,
        bathroomId: bathroomId,
      }
    }).then(function() {
      Bathroom.update({
        lineLength: sequelize.literal('line_length - 1')
      }, {
        where: {
          id: bathroomId,
        }
      }).then(function(bathroom) {
        //update all that were of rank higher than the
        //destroyed line member
        LineMember.update({
          rank: sequelize.literal('rank - 1')
        }, {
          where: {
            bathroomId: bathroomId,
            rank: {
              $gt: goneLineMember.rank
            }
          }
        }).then(function(s) {
          Bathroom.find({
            where: {
              id: bathroomId,
            }
          }).then(function(bathroom) {
              //send out status update for every user that is near this bathroom
              //as they might be looking at it and need the newest data
              const bathroomData = bathroom.dataValues;

              User.findAll({
                where: queryHelpers.getNeabyUsersWhereClause(bathroomData.latitude, bathroomData.longitude, userId)
              }).then(function(nearby) {
                emitter = req.app.get('socketio');

                nearby.forEach(function(user) {
                  const userData = user.dataValues;
                  emitter.emit(userData.id, actions.messageReceivedLeftLine(bathroomData.id, bathroomData.lineLength));
                });

                res.send({
                  bathroomId: bathroomId,
                  lineLength: bathroomData.lineLength,
                });
              });

          });
         });
      });
    });
  });
});

//send cut request
router.post('/linemember/:bathroomId/:userId/cut', function(req, res) {

  const rankOfAddressee = req.body.rankLineMember;
  const fromId = req.params.userId;
  const money = req.body.money;
  const bathroomId = req.params.bathroomId;

  LineMember.find({
    where: {
      bathroomId: bathroomId,
      rank: rankOfAddressee
    }
  }).then(function(data) {
    const lmData = data.dataValues;
    if (lmData) {
      Message.create({
        bathroomId: bathroomId,
        fromId: fromId,
        toId: lmData.userId,
        money: money
      }).then(function(ms) {
        emitter = req.app.get('socketio');

        const message = shouldBeInt.reduce(function(m, key) {
          if (typeof m[key] === "string") {
            m[key] = parseInt(m[key]);
          }
          return m;
        },  ms.dataValues);

        emitter.emit(message.toId, actions.messageReceivedCutMessage(message));

        res.send(message);
      });
    }
  });
});

//accept a message
router.post('/messages/accept', function(req, res) {
  const message = req.body;

  Message.destroy({
    where: {
      id: message.id
    }
  }).then(function() {
    User.update({
      money: sequelize.literal(`money - ${message.money}`),
    }, {
      where: {
        id: message.fromId
      }
    }).then(function() {
      User.update({
          money: sequelize.literal(`money + ${message.money}`)
        }, {
          where: {
            id: message.toId
          }
      }).then(function() {
        //update relevant user's ranks in line

        LineMember.find({
          where: {
            bathroomId: message.bathroomId,
            userId: message.toId
          }
        }).then(function(toLm) {
          const toLineMember = toLm.dataValues;

          LineMember.find({
            where: {
              bathroomId: message.bathroomId,
              userId: message.fromId
            }
          }).then(function(fromLm) {
            const fromLineMember = fromLm.dataValues;

            LineMember.update({
              rank: toLineMember.rank
            }, {
              where: {
                bathroomId: message.bathroomId,
                userId: message.fromId
              }
            }).then(function() {
              LineMember.update({
                rank: sequelize.literal('rank + 1')
              }, {
                where: {
                  bathroomId: message.bathroomId,
                  rank: {
                    $gte: toLineMember.rank,
                    $lt: fromLineMember.rank
                  },
                  id: {
                    $ne: fromLineMember.id
                  }
                }
              }).then(function() {
                //broadcast that these changes have happened to
                //everyone near this bathroom
                Bathroom.find({
                  where: {
                    id: message.bathroomId
                  }
                }).then(function(bathroomData) {
                  const bathroom = bathroomData.dataValues;

                  User.findAll({
                    where: queryHelpers.getNeabyUsersWhereClause(bathroom.latitude, bathroom.longitude, message.toId)
                  }).then(function(nearby) {
                    //nearby includes whoever sent the now deleted message
                    emitter = req.app.get('socketio');
                    const bathroomId = parseInt(bathroom.id);

                    nearby.forEach(function(user) {
                      const userData = user.dataValues;

                      emitter.emit(userData.id, actions.messageReceivedRankUpdated(bathroomId)); //tells affected userss to go get their new ranks
                    });

                    res.send([bathroomId, toLineMember.rank+1, parseInt(message.id)]); //the user who accepted the message will update own client state on success
                  });

                });
              });
            });
          });
        });
      });
    });
  });
});

//get user's messages
router.get('/messages/:userid', function(req, res) {
  const userId = req.params.userid;

  Message.findAll({
    where: {
      toId: userId,
    }
  }).then(function(messageData) {
    const messages = messageData.map(function(m) { return m.dataValues; });
    res.send(messages);
  });
});

router.get('/bathrooms/near/:lat/:lng/:userId', function(req, res) {
  const userId = req.params.userId;
  const lat = req.params.lat;
  const lng = req.params.lng;

  Bathroom.findAll().then(function(bathrooms) {
    LineMember.findAll({
      where: {
        userId: userId,
        bathroomId: {
          $in: bathrooms.map(function(b) {
            return b.dataValues.id;
          })
        }
      }
    }).then(function(lms) {
      res.send({
        nearbyBathrooms: bathrooms,
        lineMembers: lms.map(function(l) { return l.dataValues; })
      });
    });
  });
});

router.post('/bathrooms/add', function(req, res) {
  const address = req.body.address;
  const name = req.body.name;
  const ownerId = parseInt(req.body.ownerId);
  const lat = parseFloat(req.body.lat);
  const lng = parseFloat(req.body.lng);

  Bathroom.find({
    where: {
      address: address,
      ownerId: ownerId,
      latitude: lat,
      longitude: lng,
    }
  }).then(function(foundBathroom) {
    emitter = req.app.get('socketio');

    if (!foundBathroom || !foundBathroom.dataValues) {
      const newBathroom = {
        address: address,
        name: name,
        ownerId: ownerId,
        latitude: lat,
        longitude: lng,
        lineLength: 0,
      };

      Bathroom.create(newBathroom).then(function(data) {
        res.send(data);

        const createdBathroom = data.dataValues;

        User.findAll({
          where: queryHelpers.getNeabyUsersWhereClause(lat, lng)
        }).then(function(nearby) {
          nearby.forEach(function(user) {
            const userData = user.dataValues;

            emitter.emit(userData.id, actions.messageBathroomCreated(createdBathroom));
          });
        });
      });
    } else {
      res.send(foundBathroom);
    }
  });
});


module.exports = router;
