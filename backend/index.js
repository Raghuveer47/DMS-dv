require("dotenv").config({ path: __dirname + `/config/.env` });
const express = require("express");
const cors = require("cors");
const moment = require("moment");
const logger = require("./middleware/logger/logger");
const connectDB = require("./config/db");
const morgan = require("morgan");
const app = express();
const fs = require("fs");
const rfs = require("rotating-file-stream");
const path = require("path");
const schedule = require("node-schedule");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");

/**
 * Morgon
 */
let logsPath = __dirname + "/logs";
if (!fs.existsSync(logsPath)) {
  fs.mkdirSync(logsPath);
}

let apiLogsPath = __dirname + "/logs/api.log";
if (!fs.existsSync(apiLogsPath)) {
  fs.writeFileSync(apiLogsPath, "");
}
// Create rotating write stream
var accessLogStream = rfs.createStream("api.log", {
  interval: "1d",
  path: path.join(process.env.LOGPATH),
});

app.use(morgan("dev", {}));

app.use(morgan("combined", { stream: accessLogStream }));

/**
 * Connect to database
 */
connectDB();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN_URL.split(","),
    credentials: true,
    allowedHeaders: [
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Headers",
      "Content-Type",
      "Authorization",
      "x-csrf-token",
      "Accept",
      "form-data",
    ],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

/**
 * Serve Static files
 */

let debugLogsPath = path.join(
  __dirname + `/logs/debug-${moment().format("MM-DD-YYYY")}.log`
);
let errorLogsPath = path.join(
  __dirname + `/logs/error-${moment().format("MM-DD-YYYY")}.log`
);

app.use("/public", express.static(__dirname + "/public"));
app.use("/logs", express.static(__dirname + "/logs"));
app.use("/logs/server", express.static(debugLogsPath));
app.use("/logs/error", express.static(errorLogsPath));

/**
 * Routes
 */

app.use("/", require("./routes/index"));

/**
 * Error handling
 */
process.on("uncaughtException", (error, promise) => {
  logger.error("----- uncaught exception  -----");
  logger.error(error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("----- Reason -----");
  logger.error(reason);
});

process.on("SIGINT", function () {
  schedule.gracefulShutdown().then(() => process.exit(0));
});
/**
 * Create Server
 */

const server = require("http").Server(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
    transports: ["websocket"],
    credentials: true,
  },
  allowEIO3: true,
});
require("./sockets/socket")(io);

server.listen(process.env.PORT || 8080, async () => {
  logger.info(`server started on port number ${process.env.PORT} }`);

  /**
   * Firebase config
   */
  // const { initializeApp, cert } = require("firebase-admin/app");
  // var serviceAccount = require("./config/mechanicpro.json");

  // initializeApp({
  //   credential: cert(serviceAccount),
  //   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  // });

  // await ServiceCenters.create({
  //   name: "Autoris Car Care",
  //   image:
  //     "https://lh5.googleusercontent.com/p/AF1QipOIYQWoNWJHwL3ZNQzZUkpaStRosJRcLtr7VhE6=w260-h175-n-k-no",
  //   location: {
  //     latitude: "16.4978378",
  //     longitude: "80.6445836",
  //     city: "vijayawada",
  //     state: "Andhra Pradesh",
  //   },
  //   address:
  //     "M1 Car Garage, Sri Siri Residency, 59A, High School Rd, opp. Gotham E.M High school, RR gardens, Vijayawada, Andhra Pradesh 520010",
  // });
});
