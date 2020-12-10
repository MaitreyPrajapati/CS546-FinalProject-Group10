const registerRoute = require("./register");
const loginRoute = require("./login");
const privateRoute = require("./private");

const constructorMethod = (app) => {
    app.get("/", function (req, res) {
        res.render("pages/index");
    });
    app.use("/register", registerRoute);
    app.use("/login", loginRoute);
    app.get("/private", (req, res) => {
        if (req.session.user) {
            res.render("pages/private");
          } else {
            res.redirect("/login");
        }
    }); 
};

module.exports = constructorMethod;

