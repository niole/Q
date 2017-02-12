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

LineMember.sync({force: true}).then(function() {
  return LineMember.create({
    bathroomId: 1,
    rank: 0,
    userId: 1
  }).then(function() {
    LineMember.create({
      bathroomId: 1,
      rank: 1,
      userId: 2
    });
  });

});

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
    }
  },
  {
  freezeTableName: true // Model tableName will be the same as the model name
  }
);

User.sync({force: true}).then(function () {
  return User.create({
    username: "u1",
    money: 100.0,
    latitude: 51.508742,
    longitude: -0.120850,
  }).then(function() {
    User.create({
      username: "u2",
      money: 100.0,
      latitude: 51.508742,
      longitude: -0.120850,
    }).then(function() {
      User.create({
        username: "niole",
        money: 100.0,
        latitude: 51.508742,
        longitude: -0.120850,
      });
    });
  });
});

const Bathroom = sequelize.define(
  'bathroom',
  {
    occupied: {
      type: Sequelize.BOOLEAN,
      field: 'occupied'
    },
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
    }
  },
  {
  freezeTableName: true
  }
);

Bathroom.sync({force: true}).then(function () {
  return Bathroom.create({
    occupied: true,
    latitude: 51.5073,
    longitude: -0.1222,
    lineLength: 1,
  });
});


module.exports = {
  Bathroom: Bathroom,
  User: User,
  LineMember: LineMember,
  Message: Message,
  sequelize: sequelize,
};
