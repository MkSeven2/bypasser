var d = { warn: 0 };

// List of authorized users
var WHITELIST = ["dasarsembayev@cps.edu", "sarsembayevdias7@gmail.com"];

// Function to verify the user
function verify_() {
    var userEmail = Session.getActiveUser().getEmail().trim();
    return WHITELIST.includes(userEmail);
}

// Main GET request handler
function doGet() {
    var user = Session.getActiveUser().getEmail();
    if (verify_()) {
        console.info(`Authorized user: ${user}`);
        return HtmlService.createHtmlOutputFromFile("Bypasser");
    } else {
        console.warn(`Unauthorized access attempt: ${user}`);
        return HtmlService.createHtmlOutput(generateBlockPage(user));
    }
}

// Common URL processing function
function processURLCommon(url, isComplex) {
    var fetch = UrlFetchApp.fetch(url);
    var headers = fetch.getHeaders();
    var contentType = headers['Content-Type'] || '';
    var content;

    // If not HTML, return the file
    if (!contentType.includes("text/html")) {
        return [fetch.getContent(), contentType, 1];
    }

    // Determine charset
    var charsetMatch = contentType.match(/charset=([\w-]+)/i);
    var charset = charsetMatch ? charsetMatch[1] : "utf-8";
    content = fetch.getContentText(charset);

    // Remove old meta tags
    content = content.replace(/<meta charset=["'].*?["']\/?>/i, "");

    // Format base URL
    var baseUrl = url.endsWith("/") ? url : url + "/";
    var baseTag = `<base href="${baseUrl}"/>`;

    // Insert base tag into HTML
    if (content.includes("<head>")) {
        content = content.replace("<head>", `<head>${baseTag}`);
    } else {
        content = content.replace("<html>", `<html><head>${baseTag}</head>`);
    }

    console.log(`${isComplex ? "Complex" : "Simple"} URL processed successfully`);
    return [content, "text/html", 0];
}

// Function for simple URL processing
function fun1(url) {
    if (verify_()) {
        return processURLCommon(url, false);
    } else {
        d.warn = 1;
        return blockUnauthorizedAccess(url);
    }
}

// Function for complex URL processing
function fun2(url) {
    if (verify_()) {
        return processURLCommon(url, true);
    } else {
        d.warn = 2;
        return blockUnauthorizedAccess(url);
    }
}

// Block unauthorized users
function blockUnauthorizedAccess(url) {
    console.warn(`Access attempt to ${url} was blocked.`);
    return generateBlockPage(Session.getActiveUser().getEmail());
}

// Generate block page
function generateBlockPage(user) {
    return `
        <html>
        <head>
            <title>Access Denied</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f8f9fa;
                    color: #212529;
                    text-align: center;
                    padding: 50px;
                }
                h1 {
                    color: #dc3545;
                }
                p {
                    font-size: 18px;
                    margin: 20px 0;
                }
                .container {
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    display: inline-block;
                    padding: 30px;
                    max-width: 500px;
                }
                .button {
                    text-decoration: none;
                    color: #fff;
                    background-color: #007bff;
                    padding: 10px 20px;
                    border-radius: 4px;
                    font-size: 16px;
                }
                .button:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Error 403: Access Denied</h1>
                <p>Your email address (<b>${user}</b>) is not authorized to access this resource.</p>
                <p>If you believe this is a mistake, please contact the administrator.</p>
                <a class="button" href="http://blocked.com-default.ws">Learn More</a>
                <script>
                    setTimeout(function() {
                        window.location.replace("http://blocked.com-default.ws");
                    }, 5000);
                </script>
            </div>
        </body>
        </html>`;
}

// Log unauthorized access attempts
function logUnauthorizedAccess(user, url) {
    console.error(`Unauthorized access attempt by ${user} to URL: ${url}`);
}
