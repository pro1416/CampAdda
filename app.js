if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ExpressError = require("./utils/ExpressError");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const campgroundRouter = require("./routes/campground");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/users");
const passport = require("passport");
const mongoSanitize = require("express-mongo-sanitize");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require('helmet');
const MongoStore = require("connect-mongo")(session);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate); 

const dbUrl = process.env.MONGO_URL ||"mongodb://localhost:27017/campAdda";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.once("open", () => console.log("Database Connected!"));
db.on("error", () => console.log("Error! Could not connect to database.."));

//for setting templating engine to be ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const secret = process.env.SECRET||'thisismysecret';

const store = new MongoStore({
  url:dbUrl,
  secret:secret,
  touchAfter:24*3600
})

store.on("error",function(e){
  console.log("Session store error",e);
});

const sessionConfig = {
  store,
  name:'ad45fg323445f5tty6g6t',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net"
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/"
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dbnck9ntf/", 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRouter);
app.use("/campgrounds", campgroundRouter);
app.use("/campgrounds/:id/review", reviewRouter);
app.get("/", (req, res) => {
  res.render("home.ejs");
});
//selects port and starts listening on the server
const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log("Camp Adda server started successfully..");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found!", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Whoops!";
  res.status(statusCode).render("error.ejs", { err });
});
