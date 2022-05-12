<?php


// Read the input stream
$body = file_get_contents("../data/tables.json");

// Decode the JSON object
$object = json_decode($body, true);
$idCollection = [];
foreach ($object as $key => $value) {
    array_push($idCollection, intval($value["id"]));
}

for ($i=0; $i < 99999; $i++) { 
    $taken = false;
    foreach ($idCollection as $key => $value) {
        if ($value == $i) $taken = true;
    }
    if ($taken == false) {
        $id = $i;
        break;
    }
}


echo "{\"id\":{$id}}";