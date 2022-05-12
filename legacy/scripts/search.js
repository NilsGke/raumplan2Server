var search = (str) => {
    var entries = [];

    // go through each user and see if name, username or team matches with search string
    data.userData.forEach(user => {
        if (
            user.Anmeldename.toLowerCase().includes(str.toLowerCase()) ||
            user.Person.toLowerCase().includes(str.toLowerCase()) ||
            user.Organisationseinheiten.toLowerCase().includes(str.toLowerCase())
        ) {
            entries.push({
                text: user.Person,
                userId: user.id,
                type: "user",
                teams: data.teams.filter(team => getTeamsFromString(user.Organisationseinheiten).includes(team.name))
            })
        }
    });


    data.tables.forEach(table => {
        if (table.location == data.currentLocation && table.tableNumber.includes(str)) {
            entries.push({
                text: `Tisch Nr. ${table.tableNumber}`,
                type: "table",
                tableObject: table
            })
        }
    });


    data.rooms.forEach(room => {
        if (room.location == data.currentLocation && room.name.toLowerCase().includes(str.toLowerCase())) {
            entries.push({
                text: `${room.name}`,
                type: "room",
                roomObj: room
            })
        }
    });


    $("#results").html(""); // remove old results

    entries.forEach(entry => {
        var entryString = "";

        // todo maybe clean this more up
        switch (entry.type) {
            case "user":
                entry.teams.forEach(team => {
                    entryString += `<span class="team" style="background: ${team.color}; color: ${pickColor(team.color, "#ffffff", "#000000")}">${team.name}</span>`;
                });
                break;
            case "table":
                entryString += `<span class="tableTag">Table</span>`;
                break;
            case "room":
                entryString += `<span class="roomTag">Room</span>`;
                break;
        }
        $("#results").append(`<div class="entry"><span class="userName">${entry.text}</span><div class="teamsList">${entryString}</div></div><br>`);
        $("#results > div.entry:last").on("click", function() {
            highlightEntry(entry);
        })

    });

    $("#searchContainer input").off()
        .on("keydown", function(e) {
            if (e.key == "Enter") highlightEntry(entries[0])
        }).on("keyup", function() {
            search($(this).val());
        });

}


const highlightEntry = entry => {
    console.log(entry);
    switch (entry.type) {
        case "user":
            data.tables.filter(t => t.user.includes(entry.userId)) // get all tables the user is sitting at
                .forEach(table => {
                    // highlight each table
                    if (table.location != data.currentLocation) loadLocation(table.location);

                    // highlight each table
                    $(`.table[data-id='${table.id}']`).addClass("highlighter").delay(6000).queue(function() {
                        $(this).removeClass("highlighter").dequeue();

                    });
                });
            break;
        case "table":

            $($(`.table`).toArray().find(t => $(t).text() == entry.tableObject.tableNumber.substr(entry.tableObject.tableNumber.length - 3))).addClass("highlighter").delay(6000).queue(function() {
                $(this).removeClass("highlighter").dequeue();
            });

            break;
        case "room":
            $($(`.room`).toArray().find(t => $(t).text() == entry.roomObj.name)).addClass("highlighter").delay(6000).queue(function() {
                $(this).removeClass("highlighter").dequeue();
            });
            break;
        default:
            break;
    }
}


var setupSearch = () => {
    // toggle search open and close on click on icon
    $("#searchContainer img").off().on("click", function() {
        $("#searchContainer").toggleClass("active");
        $("#searchContainer input").focus();
    });

    // initialize first search (also, so that the event listener is there)
    search("");

    // ctrl + f -> open this search bar
    $(document).on("keydown", (e) => {
        if (e.ctrlKey == true && e.key == "f") {
            e.preventDefault();
            $("#searchContainer").addClass("active");
            $("#searchContainer input").focus();
        }
    });
}