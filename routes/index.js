const registerRoute = require("./register");
const loginRoute = require("./login");
const privateRoute = require("./private");
const logoutRoute = require("./logout");
const rentRoute = require("./rent");
const purchaseRoute = require("./purchase");

const constructorMethod = (app) => {
    app.get("/", function (req, res) {
        res.render("pages/index");
    });
    app.use("/register", registerRoute);
    app.use("/login", loginRoute);
    app.use("/logout", logoutRoute);
    app.use("/rent",rentRoute);
    app.use("/purchase",purchaseRoute);
    app.get("/private", (req, res) => {
        if (req.session.user) {
            res.render("pages/private",{user:req.session.user});
          } else {
            res.status(500).redirect("/login");
        }
    }); 
};

module.exports = constructorMethod;

