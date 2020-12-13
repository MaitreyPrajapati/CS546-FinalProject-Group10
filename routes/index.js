const registerRoute = require("./register");
const loginRoute = require("./login");
const privateRoute = require("./private");
const logoutRoute = require("./logout");
const rentRoute = require("./rent");
const purchaseRoute = require("./purchase");
const userDeleteRoute = require("./userDeleteRoute");
const userUpdateRoute = require("./userUpdateRoute");

const constructorMethod = (app) => {
    app.get("/", function (req, res) {
        res.render("pages/index");
    });
    app.use("/register", registerRoute);
    app.use("/login", loginRoute);
    app.use("/logout", logoutRoute);
    app.use("/rent",rentRoute);
    app.use("/purchase",purchaseRoute);
    app.use("/private", privateRoute); 
    app.use("/userDelete",userDeleteRoute);
    app.use("/userUpdate",userUpdateRoute);
};

module.exports = constructorMethod;

