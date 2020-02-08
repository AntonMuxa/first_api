const { Sequelize, DataTypes } = require("sequelize"),
  express = require("express");

const app = express();
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

var sequelize = new Sequelize("users", "root", null, {
  dialect: "mariadb",
  define: {
    charset: "utf8",
    timestamps: true,
    dialectOptions: {
      collate: "utf8_general_ci",
      useUTC: false
    },
    timezone: "+02:00"
  }
});

const Users = sequelize.define("users", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Tasks = sequelize.define("tasks", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sheduled_date: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

Users.hasMany(Tasks, { foreignKey: "user_id" });
Tasks.belongsTo(Users, { foreignKey: "user_id" });

Users.sync();
Tasks.sync();

app.get("/", function(req, res) {
  express = require("./frontend.js");
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/api/tasks", async (req, res) => {
  try {
    const task = await Tasks.findAll({
      include: [
        {
          model: Users,
          required: false
        }
      ]
    });
    if (!task.length) throw "Массив данных пуст!";
    res.json(task);
  } catch (e) {
    res.status(404).send({ error: e });
  }
});

app.get("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Tasks.findAll({
      where: { id: req.params.id },
      include: [
        {
          model: Users
        }
      ]
    });

    if (!task.length) throw "Нет такого элемента!";
    res.json(task);
  } catch (e) {
    res.status(404).send({ error: e });
  }
});

app.post("/api/tasks", async (req, res) => {
  if (!Object.keys(req.body).length) {
    res.sendStatus(400);
  } else {
    try {
      const task = await Tasks.create({
        title: req.body.title,
        user_id: req.body.user_id,
        description: req.body.description,
        sheduled_date: req.body.sheduled_date
      });
      res.json(task);
    } catch (e) {
      if(e.name == 'SequelizeForeignKeyConstraintError') {
        res.send({ error: 'User_id dont exist. Create user before!' });
      } else {
        res.send({ error: e });
      }
      
    }
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  if (!Object.keys(req.body).length) {
    res.sendStatus(400);
  } else {
    const task = await Tasks.update(
      {
        title: req.body.title,
        user_id: req.body.user_id,
        description: req.body.description,
        sheduled_date: req.body.sheduled_date
      },
      {
        where: {
          task_id: req.params.id
        }
      }
    );
    res.json(task);
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Tasks.destroy({ where: { task_id: req.params.id } });
    if (!task) throw "Не такого элемента!";
    res.send({ status: "ok", desc: `Элемент id=${req.params.id} удален` });
  } catch (e) {
    res.send({ error: e });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await Users.findAll({
      include: [
        {
          model: Tasks,
          required: false
        }
      ]
    });
    if (!users.length) throw "Массив данных пуст!";
    res.json(users);
  } catch (e) {
    res.status(404).send({ error: e });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const users = await Users.findAll({
      where: { user_id: req.params.id },
      include: [
        {
          model: Tasks,
          require: false
        }
      ]
    });

    if (!users.length) throw "Нет такого элемента!";
    res.json(users);
  } catch (e) {
    res.status(404).send({ error: e });
  }
});

app.post("/api/users", async (req, res) => {
  if (!Object.keys(req.body).length) {
    res.sendStatus(400);
  } else {
    try {
      const task = await Users.create({ name: req.body.name });
      console.log(task);
      res.json(task);
    } catch (e) {
      res.send({ error: e });
    }
  }
});

app.put("/api/users/:id", async (req, res) => {
  if (!Object.keys(req.body).length) {
    res.sendStatus(400);
  } else {
    try {
      const task = await Users.update(
        {
          name: req.body.name
        },
        {
          where: {
            user_id: req.params.id
          }
        }
      );
      res.json({ success: "true" });
    } catch (e) {
      res.send({ error: e });
    }
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const task = await Users.destroy({ where: { user_id: req.params.id } });
    if (!task) throw "Не такого элемента!";
    res.send({ status: "ok", desc: `User id=${req.params.id} deleted` });
  } catch (e) {
    res.send({ error: e });
  }
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
