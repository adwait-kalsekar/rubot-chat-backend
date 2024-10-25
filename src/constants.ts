import dotenv from "dotenv";

dotenv.config();

// Node Environment
const NODE_ENV = process.env.NODE_ENV;

// Express app constants
const PORT = process.env.PORT || 8001;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const DATABASE_URL = process.env.DATABASEURL;

// Backend URLS
const AUTH_BACKEND_URL = process.env.AUTH_BACKEND_URL;

export { NODE_ENV, PORT, CORS_ORIGIN, DATABASE_URL, AUTH_BACKEND_URL };
