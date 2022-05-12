<?php

// Only allow POST requests
if (strtoupper($_SERVER['REQUEST_METHOD']) != 'POST') {
    throw new Exception('Only POST requests are allowed');
}

// Make sure Content-Type is application/json 
$content_type = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
if (stripos($content_type, 'application/json') === false) {
    throw new Exception('Content-Type must be application/json');
}

// Read the input stream
$body = file_get_contents("php://input");

// Decode the JSON object
$object = json_decode($body, true);

// Throw an exception if decoding failed
if (!is_array($object)) {
    throw new Exception('Failed to decode JSON object');
}


$oldData = file_get_contents("../data/tables.json");
$newData = json_decode($oldData);




// get free id 
$idCollection = [];
foreach ($newData as $key => $value) {
    array_push($idCollection, intval($value->id));
}

for ($i=0; $i < 9999; $i++) { 
    $taken = false;
    foreach ($idCollection as $key => $value) {
        if ($value == $i) $taken = true;
    }
    if ($taken == false) {
        $id = $i;
        break;
    }
}

// error_log((string)$object);
// todo test and fix this
$object["id"] = $id;


array_push($newData, $object);

if(isset($newData)) {
    // Write contents to file
    // file_put_contents("../data/temp.json", json_encode($newData, JSON_PRETTY_PRINT));
    file_put_contents("../data/tables.json", json_encode($newData, JSON_PRETTY_PRINT));
    header("HTTP/1.1 200 OK");
} else {
    file_put_contents("../data/temp.json", json_encode($newData, JSON_PRETTY_PRINT));
    header("HTTP/1.1 500 Internal Server Error");
}

