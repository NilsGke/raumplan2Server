const path = require("path");
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  user: "tischplanUser",
  host: "localhost",
  password: 'raumplanpasswort!"§$',
  database: "raumplan2",
});

// serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/page", "/index.html"));
});

// serve locations data
app.get("/locations", (req, res) => {
  db.query("SELECT * FROM locations", [], (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.send({ message: "error while fetching database" });
    }
  });
});

// serve tables for only one location
app.get("/locations/*", (req, res) => {
  db.query(
    "SELECT * FROM locations WHERE id = ?",
    [decodeURI(req.url).split("/").at(-1).replace("%20", " ")],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        res.send(result);
      } else {
        res.send({ message: "error while fetching database" });
      }
    }
  );
});

// serve user data
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", [], (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.send({ message: "error while fetching database" });
    }
  });
});

// serve one specific user
app.get("/users/*", (req, res) => {
  db.query(
    "SELECT * FROM users WHERE id = ?",
    [decodeURI(req.url).split("/").at(-1).replace("%20", " ")],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        res.send(result);
        //FIXME: TEST: REMOVE THIS! THIS IS ONLY FOR TESTING!!!!!
        setTimeout(() => {}, 2000);
      } else {
        res.send({ message: "error while fetching database" });
      }
    }
  );
});

// serve users by name
app.get("/getUsersByName/*", (req, res) => {
  const name = (
    decodeURI(req.url)
      .split("/")
      .at(-1)
      // .replace("%20", " ")
      .toUpperCase()
      .match(/([a-z]|\s)/gi) || []
  ).join("");
  db.query(
    "SELECT * FROM users WHERE UPPER(Person) LIKE ?",
    [name + "%"],
    (err, result) => {
      if (err && result) {
        res.send({ err: err });
      }

      if (result != undefined && result.length > 0) {
        res.send(result);
      } else {
        res.send([]);
      }
    }
  );
});

// serve tables data
app.get("/tables", (req, res) => {
  db.query("SELECT * FROM tables", [], (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.send({ message: "error while fetching database" });
    }
  });
});

// serve tables for only one location
app.get("/tables/*", (req, res) => {
  db.query(
    "SELECT * FROM tables WHERE location = ?",
    [decodeURI(req.url).split("/").at(-1).replace("%20", " ")],
    (err, result) => {
      if (err && result) {
        res.send({ err: err });
      }

      if (result != undefined && result.length > 0) {
        res.send(result);
      } else {
        res.send([]);
      }

      // if (err) {
      //   res.send({ err: err });
      // }
      // if (result.length > 0) {
      //   res.send(result);
      // } else {
      //   res.send({ message: "error while fetching database" });
      // }
    }
  );
});

// add user to table
app.post("/addUserToTable", (req, res) => {
  // get old ids
  db.query(
    "SELECT user FROM tables WHERE id = ?",
    [req.body.tableId],
    (err, response, fields) => {
      const oldUserId = response[0].user;
      let newId = oldUserId + ";" + req.body.userId;
      newId = filterOutSemicolons(newId);
      // set new userid
      db.query(
        "UPDATE tables SET user = ? WHERE id = ?",
        [newId, req.body.tableId],
        (err, results, fields) => {
          if (!err) {
            res.sendStatus(200);
          } else {
            console.log(err);
            res.send(err);
          }
        }
      );
    }
  );
});

// remove user from table
app.post("/removeUserFromTable", (req, res) => {
  // get old ids
  db.query(
    "SELECT user FROM tables WHERE id = ?",
    [req.body.tableId],
    (err, response, fields) => {
      const oldUserId = response[0].user;
      let newId = oldUserId.replace(req.body.userId, "");
      newId = filterOutSemicolons(newId);
      // set new userid
      db.query(
        "UPDATE tables SET user = ? WHERE id = ?",
        [newId, req.body.tableId],
        (err, results, fields) => {
          if (!err) {
            res.sendStatus(200);
          } else {
            console.log(err);
            res.send(err);
          }
        }
      );
    }
  );
});

// move table
app.post("/moveTable", (req, res) => {
  db.query(
    "UPDATE tables SET x = ?, y = ?, r = ? WHERE id = ?",
    [req.body.x, req.body.y, req.body.r, req.body.id],
    (err, results, fields) => {
      if (!err) {
        res.sendStatus(200);
      } else {
        console.log(err);
        res.send(err);
      }
    }
  );
});

// serve teams
app.get("/teams", (req, res) => {
  db.query("SELECT * FROM teams", [], (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.send({ message: "error while fetching database" });
    }
  });
});

// one team
app.get("/teams/*", (req, res) => {
  db.query(
    "SELECT * FROM teams WHERE name = ?",
    [decodeURI(req.url).split("/").at(-1).replace("%20", " ")],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        res.send(result);
      } else {
        res.sendStatus(404);
      }
    }
  );
});
// serve team locations
app.get("/teamlocations", (req, res) => {
  db.query("SELECT * FROM teamlocations", [], (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.send({ message: "error while fetching database" });
    }
  });
});
// serve team locations for one locations
app.get("/teamlocations/*", (req, res) => {
  db.query(
    "SELECT * FROM teamlocations WHERE location = ?",
    [req.url.split("/").at(-1)],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        res.send(result);
      } else {
        res.send([]);
      }
    }
  );
});

// serve team locations
app.get("/rooms", (req, res) => {
  db.query("SELECT * FROM rooms", [], (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.send({ message: "error while fetching database" });
    }
  });
});

// serve team locations for one location
app.get("/rooms/*", (req, res) => {
  db.query(
    "SELECT * FROM rooms WHERE location = ?",
    [req.url.split("/").at(-1)],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        res.send(result);
      } else {
        res.send([]);
      }
    }
  );
});

// search for stuff and return everything that matches with the search string
app.get("/search/*", (req, res) => {
  const search = mysql.escape(`%${decodeURI(req.url).split("/").at(-1)}%`);
  const results = {
    users: [],
    tables: [],
    teams: [],
    rooms: [],
    locations: [],
  };
  Promise.all([
    // users
    new Promise((resolve, reject) =>
      db.query(
        `SELECT *
        FROM users
        WHERE 
          Person Like ${search} 
          OR Organisationseinheiten Like ${search} 
          OR Person Like ${search} 
        `,
        [search],
        (err, res, fields) => {
          results.users = res;
          resolve();
        }
      )
    ),
    // tables
    new Promise((resolve, reject) =>
      db.query(
        `SELECT * FROM tables WHERE tableNumber LIKE ${search}`,
        [search],
        (err, res, fields) => {
          results.tables = res.length > 0 ? res : [];
          resolve();
        }
      )
    ),
    // teams
    new Promise((resolve, reject) =>
      db.query(
        `SELECT * FROM teams WHERE name LIKE ${search}`,
        [search],
        (err, res, fields) => {
          results.teams = res.length > 0 ? res : [];
          resolve();
        }
      )
    ),
    // rooms
    new Promise((resolve, reject) =>
      db.query(
        `SELECT name, location, color FROM rooms WHERE name LIKE ${search}`,
        [search],
        (err, res, fields) => {
          results.rooms = res.length > 0 ? res : [];
          resolve();
        }
      )
    ),
    // locations
    new Promise((resolve, reject) =>
      db.query(
        `SELECT name, img, id FROM locations WHERE name LIKE ${search}`,
        [search],
        (err, res, fields) => {
          results.locations = res.length > 0 ? res : [];
          resolve();
        }
      )
    ),
  ])
    .then(() => {
      res.send(results);
    })
    .catch((err) => console.log(err));
});

// get tables user is sitting at
app.get("/usersTables/*", (req, res) => {
  const search = mysql.escape(`%${decodeURI(req.url).split("/").at(-1)}%`);

  db.query(`SELECT * FROM tables WHERE user LIKE ${search}`, (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.send([]);
    }
  });
});

// IDEA: remove this because i already have it implemented
// get all users in a specific team
app.get("/usersInTeam/*", (req, res) => {
  const search = mysql.escape(`%${decodeURI(req.url).split("/").at(-1)}%`);

  db.query(
    `SELECT * FROM users WHERE Organisationseinheiten Like ${search}`,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        res.send(result);
      } else {
        res.send([]);
      }
    }
  );
});

// add table
app.post("/addTable", (req, res) => {
  // get free table id
  db.query("SELECT id FROM tables", [], (err, result) => {
    let id = 0;
    while (result.map((r) => r.id).includes(id)) id++;
    db.query(
      "INSERT INTO tables (id, tableNumber, x, y, r, user, location) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        req.body.tableNumber || "",
        req.body.position.x || 0,
        req.body.position.y || 0,
        req.body.position.r || 0,
        "",
        req.body.location,
      ],
      (err, results, fields) => {
        if (!err) res.sendStatus(200);
      }
    );
  });
});

// changeTableNumber table
app.post("/changeTableNumber", (req, res) => {
  if (req.body.id && req.body.tableNumber)
    db.query(
      `UPDATE tables
      SET tableNumber = ?
      WHERE id = ?`,
      [req.body.tableNumber, req.body.id],
      (err, results, fields) => {
        if (!err) res.sendStatus(200);
      }
    );
});

// reomve table
app.post("/removeTable", (req, res) => {
  db.query("DELETE FROM tables WHERE id = ?", [req.body.id], (err, result) => {
    if (!err) {
      res.sendStatus(200);
    } else {
      res.send({ message: err });
    }
  });
});

// update table
app.post("/updateTable", (req, res) => {
  const data = {
    id: 168,
    tableNumber: "",
    x: 461,
    y: 51,
    r: "0",
    user: [],
    location: 3,
  };

  db.query(
    "UPDATE tables SET tableNumber = ?, x = ?, y = ?, r = ?, user = ? WHERE id = ?",
    [
      req.body.tableNumber,
      req.body.x,
      req.body.y,
      req.body.r,
      req.body.user.join(";"),
      req.body.id,
    ],
    (err, result) => {
      if (!err) {
        res.sendStatus(200);
      } else {
        res.send({ message: err });
      }
    }
  );
});

// serve everything else as document
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "/page", req.url));
});

function filterOutSemicolons(string) {
  while (string.includes(";;")) string = string.replace(";;", ";"); // if (while removing a userId) there are two semicolons after each other, remove them
  string = string.replace(/^;+/, "").replace(/;+$/, ""); // removes trailing and leading whitespaces
  return string;
}

app.listen(port, () => {
  console.log("running on port: " + port);
});
