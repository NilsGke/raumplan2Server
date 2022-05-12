let data = new Object();

const refreshData = async (_callback) => {
  // fetch all the data and do some stuff afterwards
  fetch("./users")
    .then((response) => response.json())
    .then((jsonRes) => {
      data.userData = jsonRes;
    })
    .then(() => {
      fetch("./tables")
        .then((response) => response.json())
        .then((jsonRes) => {
          data.tables = jsonRes;
          data.tables.forEach(
            (table, index) =>
              (data.tables[index].user = table.user
                .split(";")
                .filter((s) => s.length > 0))
          );
        })
        .then(() => {
          fetch("./teamlocations")
            .then((response) => response.json())
            .then((jsonRes) => {
              data.teamLocations = jsonRes;
            })
            .then(() => {
              fetch("./teams")
                .then((response) => response.json())
                .then((jsonRes) => {
                  data.teams = jsonRes;
                })
                .then(() => {
                  fetch("./locations")
                    .then((response) => response.json())
                    .then((jsonRes) => {
                      data.locations = jsonRes;
                    })
                    .then(() => {
                      fetch("./rooms")
                        .then((response) => response.json())
                        .then((jsonRes) => {
                          data.rooms = jsonRes;
                        })
                        .then(() => {
                          _callback();
                        })
                        .catch((err) =>
                          console.error(
                            "an error occured while fetching data or in callback",
                            err
                          )
                        );
                    });
                });
            });
        });
    });
};

const setup = () => {
  refreshData(addFunctionality);
  // load location that was last used (if no location set, set the first one)
  if (localStorage.getItem("location") == null)
    localStorage.setItem("location", 3);
  data.currentLocation = parseInt(localStorage.getItem("location"));
};
const addFunctionality = () => {
  // nav buttons function
  $(".nav button")
    .off()
    .on("click", function () {
      loadLocation($(this).parent().children().index($(this)));
    });

  // add Table Button
  $("#AddTableButton")
    .off()
    .on("click", function () {
      data.addTable();
    });

  loadLocation(data.currentLocation);

  setupSearch();

  $(window).resize(function () {
    updateNav($(".navElem")[data.currentLocation]);
  });

  $(".navElem").on("click", function () {
    updateNav($(this)[0]);
  });

  updateNav($(".navElem")[data.currentLocation]);
};

const updateNav = (elem) =>
  $("#stayer")
    .css("display", "block")
    .css("left", elem.offsetLeft)
    .css("width", elem.offsetWidth);

// function to pick light or dark font color, based on background
const pickColor = (bgColor, lightColor, darkColor) => {
  var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
};

data.addTable = () => {
  let newTable = {
    id: "-1",
    tableNumber: "",
    position: {
      x: Math.floor(Math.random() * 100) + 300,
      y: Math.floor(Math.random() * 100),
      r: 0,
    },
    user: [],
    location: data.locations[data.currentLocation].id,
  };

  fetch("./addTable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTable),
  }).then((res) => {
    console.log("Request complete! response:", res);
    setup();
  });
};

data.removeTable = (table) => {
  if (
    !confirm(
      `Tisch Nr.: "${table.tableNumber}" aus "${table.location}" löschen?\n Es gibt kein zurück!`
    )
  )
    return;
  fetch("./removeTable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(table),
  }).then((res) => {
    console.log("Request complete! response:", res);
    $("#popup").dialog("close");
    setup();
    // loadLocation(data.currentLocation);
  });
};

data.updateTable = (table) => {
  let props = Object.getOwnPropertyNames(table);
  console.log(props);
  if (props.forEach((prop) => table[prop] == null)) {
    console.error(
      "Error with data (customError)\nData: [Object (table)]: " + table
    );
    return;
  }

  fetch("./updateTable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(table),
  }).then((res) => {
    console.log("Request complete! response:", res);
    $("#popup").dialog("close");
    setup();
    loadLocation(data.currentLocation);
  });
};

Array.prototype.removeDuplicates = function () {
  return [...new Set(this)];
};

// "getter" functions
const getUser = (id) => data.userData.find((user) => user.id == id);
const getUserByName = (name) =>
  data.userData.find((user) => user.Person == name);
const getTeam = (name) => data.teams.find((team) => team.name == name);

// * fancy algorythm wuuuuhhuuu :D
const generateGradient = (colors) => {
  var background = "linear-gradient(to right";

  for (let i = 0; i < colors.length - 1; i++) {
    background += `, ${colors[i]} ${(100 / colors.length) * (i + 1)}%, ${
      colors[i + 1]
    } ${(100 / colors.length) * i + 1}%`;
  }

  return background + ")";
};

// take a string of teams (polluted) and return array of teamNames
// 'Confluence : Seibert Media (SM), Schulungen : Seibert Media (SM)'    ->    ["Confluence", "Schulungen"]
const getTeamsFromString = (str) => {
  return str
    .split(":")
    .map((s) => s.trim().replace("Seibert Media (SM)", "").replace(", ", ""))
    .filter((t) => t.length > 0);
};

// function for loading a location and tables and everything
const loadLocation = (location) => {
  // close popup if it was initialized
  // add popup back in if it thows an error (currently not in, bc comfort over bugs)
  // if ($("#popup.ui-dialog-content").length != 0) $("#popup").dialog("close");

  localStorage.setItem("location", location);
  data.currentLocation = location;

  let locationData = data.locations[location];

  // set right image from location data
  // $("#main").css("background-image", `url(${locationData.img == "" ? "./img/404.png" : locationData.img})`);
  $("#main img").attr(
    "src",
    locationData.img == "" ? "./img/404.png" : "./img/" + locationData.img
  );

  // remove all tables, that might be there from loading another location
  $("#main .table, #main .team, #main .room").remove();

  // add all the tables to the plan
  data.tables.forEach((table, tableIndex) => {
    // go through all the tables
    if (table.location == locationData.id) {
      // check if table is in this location

      let colors = [];
      let users = [];

      table.user.forEach((user, index) => {
        users = getUser(user);

        users.teams = getTeamsFromString(getUser(user).Organisationseinheiten)
          .map((team) => getTeam(team))
          .removeDuplicates();

        users.teams.forEach((team) => {
          try {
            colors.push(team.color);
          } catch (error) {}
        });
      });

      background =
        colors.length === 0
          ? "#444"
          : colors.length === 1
          ? colors[0]
          : generateGradient(colors); // generate a gradient, if multiple colors

      // add table div
      var temp = $("#main").append(
        `<div data-id="${table.id}" class="table">${table.tableNumber.substr(
          table.tableNumber.length - 3
        )}</div>`
      );

      // style the new table element
      $(temp.children()[temp.children().length - 1]) // get last table bc its the one we just created
        .css("left", table.x + "px")
        .css("top", table.y + "px")
        .css("transform", `rotate(${table.r}deg)`)
        .css("background", background);
    }
  });

  // position the tables and add click handler
  $(".table")
    .css("height", locationData.tableHeight + "px")
    .css("width", locationData.tableWidth + "px")
    .css("font-size", locationData.fontSize + "px")
    .on("click", function () {
      let table = data.tables.find((t) => t.id == $(this).attr("data-id"));
      popup(table, $(this));
    });
  $(".table, #preview").hover(
    function () {
      // hover start
      let table = data.tables.find((table) => table.id == $(this).data("id"));

      let teams = [];

      $("#preview").addClass("active");

      // if we are hovering a table it should change the values
      // if not, we are hovering the popup and we cannot change the values but just add the "active" class
      if (table) {
        $("#preview")
          .css("left", table.x + 40 + "px")
          .css("top", table.y + 60 + "px");

        table.user.forEach((u) => {
          getTeamsFromString(getUser(u).Organisationseinheiten).forEach((t) =>
            teams.push(t)
          );
        });

        teams = teams.removeDuplicates();

        // Daten eintragen
        $("#preview .names").text(
          table.user.map((userId) => getUser(userId).Person).join(", ")
        );
        // add all teams from every user to teams array
        $("#preview .tableNum span").text(table.tableNumber);
        $("#preview .users span").text(
          table.user
            .map((userId) => getUser(userId).Anmeldename.toLowerCase())
            .join(", ")
        );
        $("#preview .teams span").text(teams.join(", "));
      }
    },
    function () {
      // hover end
      $("#preview").removeClass("active");
    }
  );

  data.teamLocations
    .filter((team) => team.location == data.currentLocation)
    .forEach((team) => {
      // add table div
      var temp = $("#main").append(
        `<div data-id="${team.id}" class="team">${team.name}</div>`
      );

      // style the new table element
      $(temp.children()[temp.children().length - 1]) // get last table bc its the one we just created
        .css("left", team.x + "px")
        .css("top", team.y + "px")
        .css("color", team.color);
    });

  // add all the teams to the location
  data.rooms.forEach((room) => {
    if (room.location == data.currentLocation) {
      // add table div
      var temp = $("#main").append(`<div class="room">${room.name}</div>`);

      // style the new table element
      $(temp.children()[temp.children().length - 1]) // get last table bc its the one we just created
        .css("left", room.x + "px")
        .css("top", room.y + "px")
        .css("width", room.w + "px")
        .css("height", room.h + "px")
        .css("background", room.color)
        .css("font-size", room.fontSize + "px")
        .addClass(room.class);

      if (room.link == undefined || room.link != "") {
        $(temp.children()[temp.children().length - 1])
          .on("click", function () {
            $("#calendarContainer .close")
              .off()
              .on("click", function () {
                $(this).parent().removeClass("active");
              });
            $(document)
              .off()
              .on("click", function (e) {
                if (
                  e.target != $("iframe")[0] &&
                  !e.target.classList.contains("room")
                ) {
                  $("#calendarContainer").removeClass("active");
                }
              });
            $("#calendarContainer").addClass("active");
            $("iframe#calendar").fadeIn();
            if ($("iframe#calendar").attr("src") !== room.link) {
              $("iframe#calendar").attr("src", room.link);
            }
          })
          .addClass("clickable");
      }
    }
  });
};

$(() => {
  // remove footer after 10 seconds
  if ($("#footer").css("display") != "none") {
    setTimeout(function () {
      $("#footer").fadeOut("fast");
      $("#feedbackContainer").css("bottom", "5px");
    }, 10000); // 10 seconds
  }
});

setup();

// TODO: tabindex to buttons on popup bc the invisible buttons are still accessable through tabbing and the dont have an outline and stuff

// IDEA: teams von mehreren Mitarbeitern mit Semikolon trennen ODER in Klammern hinter die Mitarbeiter
