from flask import Flask, request, jsonify, render_template_string
import requests
pip install flask requests
app = Flask(__name__)

# Авторизованные ключи
AUTHORIZED_KEYS = ["Dias9872", "Otherppl"]

# HTML-шаблон для сайта
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <base target="_top">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            text-align: center;
            padding: 20px;
        }
        #auth-banner {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #ffffff;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            padding: 20px;
        }
        #main-content {
            display: none;
        }
        input[type="text"], input[type="url"] {
            width: 60%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            background-color: #007BFF;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #0056b3;
        }
        .error {
            color: red;
            margin-top: 10px;
        }
        a {
            display: block;
            margin: 10px 0;
            color: #007BFF;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div id="auth-banner">
        <h1>Enter your auth key</h1>
        <input type="text" id="authKey" placeholder="Enter key here...">
        <button onclick="validateKey()">Login</button>
        <p class="error" id="error-message"></p>
    </div>

    <div id="main-content">
        <h1>Website Bypasser</h1>
        <p>Enter the URL of the website you want to bypass:</p>
        <input type="url" id="myURL" placeholder="https://example.com">
        <br>
        <button onclick="analyze()">Analyze</button>
        <pre id="output"></pre>
    </div>

    <script>
        const apiUrl = "/";

        function validateKey() {
            const key = document.getElementById('authKey').value.trim();
            fetch(apiUrl + "validate_key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key }),
            })
            .then(res => res.json())
            .then(data => {
                if (data.valid) {
                    document.getElementById('auth-banner').style.display = 'none';
                    document.getElementById('main-content').style.display = 'block';
                } else {
                    document.getElementById('error-message').textContent = "Wrong key. Retry...";
                }
            });
        }

        function analyze() {
            const url = document.getElementById('myURL').value;
            fetch(apiUrl + "analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    document.getElementById('output').textContent = "Error: " + data.error;
                } else {
                    document.getElementById('output').textContent = data.content;
                }
            });
        }
    </script>
</body>
</html>
"""

@app.route("/")
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route("/validate_key", methods=["POST"])
def validate_key():
    data = request.json
    key = data.get("key", "")
    return jsonify({"valid": key in AUTHORIZED_KEYS})

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    url = data.get("url", "")
    if not url:
        return jsonify({"error": "URL not provided"}), 400

    try:
        response = requests.get(url)
        if "text/html" in response.headers.get("Content-Type", ""):
            return jsonify({"content": response.text})
        return jsonify({"error": "The content is not HTML"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
