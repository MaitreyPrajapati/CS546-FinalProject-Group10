const express = require("express");
const app = express();
const static = express.static(__dirname + "/public");
const configRoutes = require("./routes");
const exphbs = require("express-handlebars");
const session = require("express-session");

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

const handlebarsInstance = exphbs.create({
  defaultLayout: "main",
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === "number")
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
      return new Handlebars.SafeString(JSON.stringify(obj));
    },
  },
});

//Use cookie to implement login function
app.use(
  session({
    name: "AuthCookie",
    secret: "This is a secret",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 600000 },
  })
);

app.use("/public", static);

app.engine("handlebars", handlebarsInstance.engine);
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
