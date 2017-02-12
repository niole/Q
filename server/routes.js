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

    LineMember.find({
      userId: userid,
    }).then(function(lineMember) {
      const data = lineMember.dataValues;
      res.send(data);
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

          LineMember.create({
            bathroomId: bathroom.id,
            rank: nextLineLength,
            userId: userId
          }).then(function() {
              User.findAll({
                where: queryHelpers.getNeabyUsersWhereClause(bathroom.latitude, bathroom.longitude, userId)
              }).then(function(nearby) {

                nearby.forEach(function(user) {
                  const userData = user.dataValues;
                  emitter = req.app.get('socketio');
                  emitter.emit(userData.id, actions.messageReceivedEnterLine(parseInt(bathroomId), nextLineLength));
                });

                res.send({
                  bathroomId: bathroom.id,
                  rank: nextLineLength,
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
    }).then(function(goneLineMember) {
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
            rank: {
              $gt: goneLineMember.rank
            }
          }
        }).then(function() {
          Bathroom.find({
            where: {
              id: bathroomId,
            }
          }).then(function(bathroom) {
              //send out status update for every user that is near this bathroom
              //as they might be looking at it and need the newest data
              const bathroomData = bathroom.dataValues;

              User.findAll({
                where: queryHelpers.getNeabyUsersWhereClause(bathroomData.latitude, bathroomData.longitude)
              }).then(function(nearby) {

                nearby.forEach(function(user) {
                  const userData = user.dataValues;
                  emitter = req.app.get('socketio');
                  emitter.emit(userData.id, actions.messageReceivedLeftLine(bathroomData.id, bathroomData.lineLength));
                });

                res.send(bathroomId);
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

  LineMember.findAll({
    where: {
      bathroomId: bathroomId,
      rank: rankOfAddressee
    }
  }).then(function(data) {
    const lmData = data[0].dataValues;
    if (lmData) {
      Message.create({
        bathroomId: bathroomId,
        fromId: fromId,
        toId: lmData.userId,
        money: money
      }).then(function(ms) {
        if (ms) {
          res.send(ms.dataValues);
        }
      });
    }
  });
});

//get user's messages
router.get('/messages/:userid', function(req, res) {
  if (message.toId === req.params.userid) {
    res.send([message]);
  }
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

module.exports = router;
