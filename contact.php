<?php
    $email = $name = $phone = $message = "";
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (!empty($_POST["last_name"])){
            echo 'true';
            return;
        }

        if (empty($_POST["name"])) {
            echo false;
            return;
        } else {
            $name = $_POST["name"];
            // check if name only contains letters and whitespace
            if (!preg_match("/^[a-zA-Z-' ]*$/", $name)) {
                echo false;
                return;
            }
        }
        
        if (empty($_POST["email"])) {
            echo false;
            return;
        } else {
            $email = $_POST["email"];
            // check if e-mail address is well-formed
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo false;
                return;
            }
        }

        if (empty($_POST["message"])) {
            echo false;
            return;
        }else{
            $message = $_POST["message"];
        }

        if (empty($_POST["phone"])) {
            echo false;
            return;
        }else{
            $phone = $_POST["phone"];
        }

        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

        // More headers. From is required, rest other headers are optional
        $headers .= 'From: <inquiries@michaelyoung.net>' . "\r\n";

        $subject = "Web Development Service inquiry from " . $email;
        $message = '
        <html>
            <body style="margin: 2em; background-color: green; color: white;">
                <h1>Service Inquiry from: ' .$name.'</h1>
                <div font-size: 0.5em>NOTE: This is an automated email sent from michaelyoung.net using the "request a quote" form.</div>
                <div>
                    Contact information:
                </div>
                    '. $phone .'
                <div>
                </div>
                    '. $email . '
                <div>
                <h2>Service requested</h2>
                    ' .$message.'
                </div>
                <p>Site by Michael Young (302) 752-6252</p>
            </body>
        </html>';

        if (mail("mikewyoung@ymail.com", $subject,  $message, $headers) == true){
            echo 'true';
        }else{
            echo false;
        }
        

    }
?>