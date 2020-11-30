const registerRoute = require("./register");

const constructorMethod = (app) => {
    app.get("/", function (req, res) {
        res.render("pages/index");
    });
    app.use("/register", registerRoute);
};

module.exports = constructorMethod;

