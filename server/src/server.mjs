import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import session from "express-session";
import "./config/passport";
import MySQLStore from 'express-session-mysql';

// routes
import authRoute from "./routes/auth";
import contractsRoute from "./routes/contracts";
import paymentsRoute from "./routes/payments";
import { handleWebhook } from "./controllers/payment.controller.js";

const server = express();

// Enable CORS middleware
server.use(cors());
server.use(helmet());
server.use(morgan("dev"));

server.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);
server.use(express.json());

server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({
      createConnect: async () => {
        const pool = await getPool();
        return pool.getConnection();
      },
      destroyConnection: async (connection) => {
        connection.release();
      },
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
