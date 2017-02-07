"use strict";
const express = require('express');
const router = express.Router();

let user = {
  money: 10,
  _id: "sdfdss"
};

let lineMember = {
    _id: "ddfff",
    bathroomId: "0090900",
    rank: -1,
    userId: ""
};

let message = {
    _id: "344sfsdf",
    latitude: 0,
    longitude: 0,
    fromId: "",
    toId: "",
    money: 0
};

let bathroom = {
  _id: "222344sfsdf",
  occupied: false,
  latitude: 51.5073,
  longitude: -0.1222,
  lineLength: 5,
};

//get user
router.get('/user/:id', function(req, res) {
    res.send(user);
});

//update user's money
router.post('/user/:id/:money', function(req, res) {
    user.money += req.money;
    res.send(user);
});

//get user's line locations
router.get('/linemember/:userid', function(req, res) {
  if (lineMember.userId === req.userid) {
    res.send(lineMember);
  }
});

//enter line at bathroom
router.get('/linemember/:userid/:bathroomid/new', function(req, res) {
  //req's data contains lat long
  lineMember.userId = req.userid;
  lineMember.bathroomId = req.bathroomId;

  //update length of bathroom line
  bathroom.lineLength += 1;

  //update user rank
  lineMember.rank = bathroom.lineLength-1;

  res.send(lineMember);
});

//enter bathroom
router.get('/linemember/:linememberid/enter', function(req, res) {
  lineMember.rank = 0; //TODO rank should be determined by actual data in database

  //send req to update relevent bathroom
  if (bathroom._id === lineMember.bathroomId) {
    bathroom.occupied = true;
  }

  //TODO update ranking of all other linemembers

  res.send(lineMember);
});

//leave bathroom
router.get('/linemember/:linememberid/leave', function(req, res) {
  //TODO should actually delete record
  //but instead will set lineMember rank to -1
  lineMember.rank = -1;

  res.send("done");
});

//send cut request
router.post('/linemember/cut', function(req, res) {
  console.log(req.body);

  message.fromId = req.body.userId;
  message.toId = req.body.userId; //TODO in future, figure out who's at that rank in that bathroom line

  message = Object.assign(message, req.body);

  res.send(message);
});


//get user's messages
router.get('/messages/:userid', function(req, res) {
  if (message.toId === req.userid) {
    res.send([message]);
  }
});

router.get('/bathrooms/near/:lat/:lng', function(req, res) {
  res.send([bathroom]);
});

module.exports = router;
