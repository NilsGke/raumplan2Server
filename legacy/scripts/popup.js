var popup = (table, tableElem) => {
  let tablePos = table.position;
  $("#popup").dialog({
    closeOnEscape: false,
    buttons: [
      {
        text: "edit", // Das muss NTH 1 sein
        id: "editButton",
        // icon: "ui-icon-pencil",
        icons: { primary: "ui-icon-pencil" },
        click: function () {
          // display and hide the correct buttons, needed for this menu
          $("#deleteButton, #editButton, #moveButton").css("display", "none");
          $("#saveButton, #cancelButton").css("display", "");
          tableElem.addClass("active");

          let names = data.userData.map((a) => a.Person);

          let userSelection = "";

          table.user.forEach((u) => {
            // for every user (on a table), we create a selection
            userSelection += createSelection(getUser(u).Person, names);
          });

          // put the inputs on the page
          $("#infoTable tr:nth-child(1) td:last-of-type").html(
            `<input id="tableNumberInput" type="text" value="${$(
              "#infoTable tr:nth-child(1) td:last-of-type"
            ).text()}"></input>`
          );
          $("#infoTable tr:nth-child(2) td:last-of-type").html(
            `${userSelection}`
          );
          $("#infoTable tbody").append(`
                        <tr>
                            <td>X</td>
                            <td><input id="coordsX" type="number" min="0" value="${table.x}"></td>
                        </tr>
                        <tr>
                            <td>Y</td>
                            <td><input id="coordsY" type="number" min="0" value="${table.y}"></td>
                        </tr>
                        <tr>
                            <td>Rotation</td>
                            <td><input id="rotationInput" type="number" min="0" max="360" value="${table.r}"></td>
                        </tr>
                    `);

          $("#infoTable tr:nth-child(2) td:last-of-type").append(
            "<button>+</button>"
          );

          // plus button to add userSelection
          $("#infoTable tr:nth-child(2) td:last-of-type > button").on(
            "click",
            function () {
              $("#infoTable tr:nth-child(2) td:last-of-type").prepend(
                createSelection("", names)
              );
              // minus button to remove userSelection
              $(
                "#infoTable tr:nth-child(2) td:last-of-type > .userSelect button"
              )
                .off()
                .on("click", function () {
                  $(this).parent().remove();
                });
            }
          );
          $("#infoTable tr:nth-child(2) td:last-of-type > .userSelect button")
            .off()
            .on("click", function () {
              $(this).parent().remove();
            });

          // Mitarbeiter-Input change
          $("#infoTable tr:nth-child(2) td:last-of-type select").on(
            "change",
            function () {
              let user = getUserByName(
                $(this).children("option:selected").val()
              );
              let teams = user.Organisationseinheiten.split(":")
                .map((s) =>
                  s.trim().replace("Seibert Media (SM)", "").replace(", ", "")
                )
                .filter((t) => t.length > 0);
              $("#infoTable tr:nth-child(3) td:last-of-type").text(
                user["Geschäftliche E-Mailadresse(n)"]
              );
              $("#infoTable tr:nth-child(4) td:last-of-type").text(
                teams.join(", ")
              );
            }
          );

          // coords input change
          // x
          $("#infoTable tr:nth-child(5) td:last-of-type input").on(
            "change",
            function () {
              tableElem.css("left", `${$(this).val()}px`);
            }
          );
          // y
          $("#infoTable tr:nth-child(6) td:last-of-type input").on(
            "change",
            function () {
              tableElem.css("top", `${$(this).val()}px`);
            }
          );
          // r
          $("#infoTable tr:nth-child(7) td:last-of-type input").on(
            "change",
            function () {
              tableElem.css("transform", `rotate(${$(this).val()}deg)`);
            }
          );

          // click on save
          $("#saveButton").on("click", function () {
            newTable = {
              id: table.id,
              tableNumber: $("#tableNumberInput").val(),
              x: parseInt($("#coordsX").val()),
              y: parseInt($("#coordsY").val()),
              r: parseInt($("#rotationInput").val()),
              user: $(".userSelect select option:selected")
                .toArray()
                .map((e) => getUserByName($(e).val()).id),
              location: table.location,
            };
            data.updateTable(newTable);
          });
        },
        showText: false,
      },
      {
        text: "save", // 4tes nth
        id: "saveButton",
        icon: "ui-icon-save",
        click: function () {},
        showText: false,
      },
      {
        text: "cancel", // Das hier wird erst wenn auf Edit gedrückt wird wieder angezeigt
        id: "cancelButton",
        icon: "ui-icon-save",
        click: function () {
          tableElem.removeClass("active");
          $("#cancelButton, #saveButton").css("display", "none");
          // $(`.ui-dialog > .ui-dialog-buttonpane > div`).css('text-align', 'center');
          $("#editButton, #deleteButton, #moveButton, #rotateButton").css(
            "display",
            "inline-block"
          );

          fillPopupContent(table);

          // put table back to where it was and how it was (position and rotation)
          tableElem
            .draggable({ disabled: true })
            .css("left", table.x + "px")
            .css("top", table.y + "px")
            .css("transform", `rotate(${table.r}deg)`);
        },
        showText: false,
      },
      {
        text: "delete", // Das muss NTH 3 sein
        id: "deleteButton",
        icon: "ui-icon-delete",
        click: function () {
          data.removeTable(table);
          loadLocation(data.currentLocation);
        },
        showText: false,
      },
      {
        text: "move / rotate", //5tes nth
        id: "moveButton",
        icon: "ui-icon-move",
        click: function () {
          // remove and add buttons
          $("#editButton, #deleteButton, #moveButton").css("display", "none");
          $("#cancelButton, #saveButton").css("display", "inline-block");

          // move table with arrow keys
          $("body").on("keydown", function (e) {
            switch (e.which) {
              case 37:
                tableElem.css(
                  "left",
                  parseInt(tableElem.css("left").replace("px")) - 1 + "px"
                );
                break;
              case 38:
                tableElem.css(
                  "top",
                  parseInt(tableElem.css("top").replace("px")) - 1 + "px"
                );
                break;
              case 39:
                tableElem.css(
                  "left",
                  parseInt(tableElem.css("left").replace("px")) + 1 + "px"
                );
                break;
              case 40:
                tableElem.css(
                  "top",
                  parseInt(tableElem.css("top").replace("px")) + 1 + "px"
                );
                break;
              default:
                return; // allow other keys to be handled
            }
            // prevent default action (eg. page moving up/down)
            // but consider accessibility (eg. user may want to use keys to choose a radio button)
            e.preventDefault();
          });

          // move table element by dragging
          tableElem.off().addClass("active").draggable({ disabled: false });

          $("#popup").css("padding", "20px");
          $("#cancelButton, #saveButton").css("display", "");
          $("#form_table_edit").css("margin-bottom", "10px");

          $("#popup").html(`  
                    <h1>Move / Rotate</h1>
                    <p>Move the table by dragging or with arrow-keys</p>
                    <h2 style=" font-size:15px; text-align:center; color: #c3cb2c;!important">Rotate:</h2>

                    <div id="SliderAll">
                        <span>
                            <span id="myValue" ></span>
                        </span>
                        <input type="range" id="myRange" max="360" min="0" value="${table.r}" style="width:100%"> 
                    </div>   
                `);
          var myRange = document.querySelector("#myRange");
          var myValue = document.querySelector("#myValue");
          var myUnits = "°";
          var off =
            myRange.offsetWidth /
            (parseInt(myRange.max) - parseInt(myRange.min));
          var px =
            (myRange.valueAsNumber - parseInt(myRange.min)) * off -
            myValue.offsetParent.offsetWidth / 2;

          myValue.parentElement.style.left = px + "px";
          myValue.parentElement.style.top = myRange.offsetHeight + "px";
          myValue.innerHTML = myRange.value + "" + myUnits; // kein Platz lassen zwischen den ''

          myRange.oninput = function () {
            let px =
              (myRange.valueAsNumber - parseInt(myRange.min)) * off -
              myValue.offsetWidth / 2;
            myValue.innerHTML = myRange.value + " " + myUnits; // Platz lassen zwischen den ' '
            myValue.parentElement.style.left = px + "px";
            tableElem.css("transform", `rotate(${myRange.value}deg)`);
            table.r = myRange.value;
          };

          // save
          $("#saveButton").on("click", function () {
            table.x = parseInt(tableElem.css("left").replace("px", ""));
            table.y = parseInt(tableElem.css("top").replace("px", ""));
            table.r = myRange.value;
            data.updateTable(table);
          });
        },
        showText: false,
      },
    ],
    close: function () {
      $("#cancelButton").click();
      tableElem.removeClass("draggable active");
      addFunctionality();

      // todo remove eventlisteners and everything for handeling saving and cancelling the actions and stuff
    },
  });

  $(".table").off();
  $("#preview").removeClass("active");

  fillPopupContent(table);

  // overwrite the default close button
  $(
    ".ui-button.ui-corner-all.ui-widget.ui-button-icon-only.ui-dialog-titlebar-close"
  ) // Close Button
    .text("");

  $(`#saveButton, #cancelButton`) // Close Button
    .css("display", "none");
};

const createSelection = (selectedName, names) => {
  let str = "<div class='userSelect'><select>";
  names.forEach((name) => {
    str += `<option value="${name}" ${
      selectedName == name ? "selected" : ""
    }>${name}</option>`; // build the option with the name and the name as value AND if the name is the same as the table user name then we put in "selected"
  });
  str += "</select><button>-</button></div>";
  return str;
};

const fillPopupContent = (table) => {
  let users = [];
  let emails = [];
  let teams = [];

  table.user.forEach((u, i) => {
    let user = getUser(u);
    users.push(user.Person);
    emails.push(user["Geschäftliche E-Mailadresse(n)"]);
    getTeamsFromString(user.Organisationseinheiten).forEach((t) =>
      teams.push(t)
    );
  });

  $(".ui-dialog-content").html(`
        <table id="infoTable">
            <tr>
                <td>Tisch Nr.:</td>
                <td>${table.tableNumber}</td>
            </tr>
            <tr>
                <td>Mitarbeiter:</td>
                <td>${users.join(", ")}</td>
            </tr>
            <tr>
                <td>Email(s):</td>
                <td>${emails.join(", <br>")}</td>
            </tr>
            <tr>
                <td>Team(s):</td>
                <td>${teams.join(", <br>")}</td>
            </tr>
        </table>
    `);
};
