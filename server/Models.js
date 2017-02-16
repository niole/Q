const fixtures = require('./ModelFixtures.json');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('mysql', 'root', 'root', {
  host: "127.0.0.1",
  port: 3306
});


const LineMember = sequelize.define(
  'linemember',
  {
    bathroomId: {
      type: Sequelize.STRING,
      field: 'bathroom_id'
    },
    rank: {
      type: Sequelize.INTEGER, //0 means in bathroom
      field: 'rank'
    },
    userId: {
      type: Sequelize.STRING,
      field: 'user_id'
    }
  },
  {
  freezeTableName: true // Model tableName will be the same as the model name
  }
);

LineMember.sync({force: true});/*.then(function() {
  return fixtures.lineMembers.map(function(lm) {
    return LineMember.create({
      bathroomId: lm.bathroomId,
      rank: lm.rank,
      userId: lm.userId
    });
  });
});*/

const Message = sequelize.define(
  'message',
  {
    bathroomId: {
      type: Sequelize.STRING,
      field: 'bathroom_id'
    },
    fromId: {
      type: Sequelize.STRING, //id of user requesting to cut in line
      field: 'from_id'
    },
    toId: {
      type: Sequelize.STRING, //id of user being requested
      field: 'to_id'
    },
    money: {
      type: Sequelize.FLOAT, //amount of money they're offering
      field: 'money'
    }
  },
  {
  freezeTableName: true // Model tableName will be the same as the model name
  }
);

Message.sync({force: true});

const User = sequelize.define(
  'users',
  {
    username: {
      type: Sequelize.STRING,
      field: 'username'
    },
    money: {
      type: Sequelize.FLOAT,
      field: 'money'
    },
    latitude: {
      type: Sequelize.FLOAT,
      field: 'lat'
    },
    longitude: {
      type: Sequelize.FLOAT,
      field: 'lng'
    },
    authId: {
      type: Sequelize.STRING,
      field: 'authId'
    }
  },
  {
  freezeTableName: true // Model tableName will be the same as the model name
  }
);

User.sync({force: true});/*.then(function () {
  return fixtures.users.map(function(u) {
    return User.create({
        authId: "0",
        username: u.username,
        money: u.money,
        latitude: u.latitude,
        longitude: u.longitude,
    });
  });
});*/

const Bathroom = sequelize.define(
  'bathroom',
  {
    latitude: {
      type: Sequelize.FLOAT,
      field: 'lat'
    },
    longitude: {
      type: Sequelize.FLOAT,
      field: 'lng'
    },
    lineLength: {
      type: Sequelize.INTEGER,
      field: 'line_length'
    },
    ownerId: {
      type: Sequelize.INTEGER,
      field: 'owner_id'
    },
    name: {
      type: Sequelize.STRING,
      field: 'name'
    },
    address: {
      type: Sequelize.STRING,
      field: 'address'
    },
  },
  {
  freezeTableName: true
  }
);

Bathroom.sync({force: true}).then(function () {
  return fixtures.bathrooms.map(function(b) {
    return Bathroom.create({
      latitude: b.latitude,
      longitude: b.longitude,
      lineLength: b.lineLength,
      ownerId: b.ownerId,
      name: b.name,
      address: b.address,
    });
  });
});


module.exports = {
  Bathroom: Bathroom,
  User: User,
  LineMember: LineMember,
  Message: Message,
  sequelize: sequelize,
};
