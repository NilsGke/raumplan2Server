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
$oldData = json_decode($oldData);


foreach ($oldData as $key => $value) {
    // problem war, dass es ein object ist und ich den knoten "id" nur mit $value->id und nicht mit $value["id"]
    if ($value->id == $object["id"]) {
        $oldData[$key] = $object;
    }
}




// Write contents to file if data is not null
if(isset($oldData)) {
    file_put_contents("../data/tables.json", json_encode($oldData, JSON_PRETTY_PRINT));
    header("HTTP/1.1 200 OK");
} else {
    file_put_contents("../data/temp.json", json_encode($oldData, JSON_PRETTY_PRINT));
    header("HTTP/1.1 500 Internal Server Error");
}


// Write contents to file
// file_put_contents("../data/tables.json", json_encode($newData, JSON_PRETTY_PRINT));
// file_put_contents("../data/tables.json", json_encode($oldData, JSON_PRETTY_PRINT));

