const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname'); //TODO set up actual database


const LineMember = sequelize.define(
  'linemember',
  {
    bathroomId: {
      type: sequelize.STRING,
      field: 'bathroom_id'
    },
    rank: {
      type: sequelize.INTEGER, //0 means in bathroom
      field: 'rank'
    },
    userId: {
      type: sequelize.STRING,
      field: 'user_id'
    }
  },
  {
  freezeTableName: true // Model tableName will be the same as the model name
  }
);

LineMember.sync({force: true});

const Message = sequelize.define(
  'message',
  {
    latitude: {
      type: Sequelize.INTEGER, //location of bathroom
      field: 'lat'
    },
    longitude: {
      type: sequelize.INTEGER,
      field: 'long'
    },
    fromId: {
      type: sequelize.STRING, //id of user requesting to cut in line
      field: 'from_id'
    },
    toId: {
      type: sequelize.STRING, //id of user being requested
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
  'user',
  {
    money: {
      type: Sequelize.FLOAT,
      field: 'money'
    }
  },
  {
  freezeTableName: true // Model tableName will be the same as the model name
  }
);

User.sync({force: true}).then(function () {
  // Table created
  return User.create({
    money: 100.0
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
      type: Sequelize.INTEGER,
      field: 'lat'
    },
    longitude: {
      type: Sequelize.INTEGER,
      field: 'long'
    }
  },
  {
  freezeTableName: true
  }
);

Bathroom.sync({force: true}).then(function () {
  // Table created
  return Bathroom.create({
    occupied: false,
    latitude: 8696,
    longitude: 2344
  });
});

