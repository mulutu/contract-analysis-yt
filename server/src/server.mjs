import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import session from "express-session";
import "./config/passport";
import MySQLStore from 'express-session-mysql';
import mysql from "mysql2";

// routes
import authRoute from "./routes/auth";
import contractsRoute from "./routes/contracts";
import paymentsRoute from "./routes/payments";
import { handleWebhook } from "./controllers/payment.controller.js";

const server = express();

// Enable CORS middleware
//server.use(cors());
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
server.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies to be sent
  })
);

server.use(helmet());
server.use(morgan("dev"));

server.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);
server.use(express.json());



const dbOptions = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "M@gar1ta@2024!$",
  database: process.env.DB_NAME || "contract",
  port: process.env.DB_PORT || 3306,
};

const pool = mysql.createPool(dbOptions); // Create the MySQL connection pool

// Use connection pool for session storage
const sessionStore = new MySQLStore({}, pool);

server.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    /*store: new MySQLStore({
      createConnect: async () => {
        const pool = await getPool();
        return pool.getConnection();
      },
      destroyConnection: async (connection) => {
        connection.release();
      },
    }),*/
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

server.use(passport.initialize());
server.use(passport.session());

server.use("/auth", authRoute);
server.use("/contracts", contractsRoute);
server.use("/payments", paymentsRoute);


// Custom API route
server.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Custom Server!' });
});

// Handle all other routes (fallback for undefined routes)
server.all('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`> Server running on http://localhost:${PORT}`);
});
