if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const session = require('express-session');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");
const MongoStore = require('connect-mongo');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Fixed dirname issue
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

// ("mongodb://127.0.0.1:27017/Wanderlust")
const dbUrl = process.env.ATLASDB_URL;
// MongoDB connection
async function main() {
   await mongoose.connect(dbUrl);
}


main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

  const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
      secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
  })

  store.on("error", () => {
    console.log("ERROR  in MONGO SESSION STORE", err);
  });

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Fixed expires
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Middleware
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // Fixed LocalStrategy
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(User.createStrategy());


// Flash messages middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Routes

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Catch-all route
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { statusCode, message }); // Fixed error rendering
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);  // Fixed template literal
});