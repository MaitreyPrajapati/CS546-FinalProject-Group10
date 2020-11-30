
const constructorMethod = (app) => {
    app.get("/", function (req, res) {
        res.render("pages/index");
    });
};

module.exports = constructorMethod;

