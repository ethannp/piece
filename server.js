const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const csrf = require("csurf");
var admin = require("firebase-admin");
var serviceAccount = require("./square-piece-firebase-adminsdk-3ok7a-7a389b0d87.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const csrfMiddleware = csrf({
    cookie: true
});

const app = express();

app.engine("html", require("ejs").renderFile);
app.use(express.static("public"));

app.use(cookieParser());
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    next();
});

app.get("/", function (req, res) {
    res.render("index.html");
});
app.get("/account", function (req, res) {
    res.render("account.html");
});
app.get("/play", function (req, res) {
    res.render("play.html");
});
app.get("/gallery", function (req, res) {
    res.render("gallery.html");
});
app.get("/admin", function (req, res) {
    res.render("admin.html");
});
app.use(function (req, res, next) {
    res.render("../public/404.html");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server up")
});