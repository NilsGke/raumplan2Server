<?php



file_put_contents("../data/feedback.md", file_get_contents("../data/feedback.md") . "  \n\n## " . $_POST["reason"] . "  \n\n> ". date("F j, Y, g:i a") . "  \n> Email: " . $_POST["emailInput"] . "  \n> Message: " . str_replace("\n", "<br>  ", $_POST["message"]));

header("Location: ../danke.html");