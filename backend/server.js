const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const { connectToDatabase } = require("./db/connection");
const authenticateJWT = require("./middleware/auth");

const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const authRoute = require("./routes/auth");

const profileRoute = require("./routes/profile");
const uploadRoute = require("./routes/upload");
const historyRoute = require("./routes/history");
const transactionRoute = require("./routes/transactions");
const bankRoute = require("./routes/bank");
const userRoute = require("./routes/user");
const manageuserRoute = require("./routes/manageuser");
const reportRoute = require("./routes/report");
const dashboardRoute = require("./routes/dashboard");


const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, { cors: { origin: "*" } });

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("uploads"));

app.use("/api", require("./routes/donation"));


connectToDatabase();


require("./socket/overlaysocket")(io);
require("./socket/externalPayment")(io);


app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/auth", authRoute);
app.use("/user", userRoute);

app.use("/profile", authenticateJWT, profileRoute);
app.use("/upload", authenticateJWT, uploadRoute);
app.use("/manageuser", authenticateJWT, manageuserRoute);
app.use("/history", authenticateJWT, historyRoute);
app.use("/transactions", authenticateJWT, transactionRoute);
app.use("/bank", authenticateJWT, bankRoute);
app.use("/report", authenticateJWT, reportRoute);
app.use("/dashboard", authenticateJWT, dashboardRoute);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running`);
});
