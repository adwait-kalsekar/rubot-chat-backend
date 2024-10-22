import dotenv from "dotenv";

dotenv.config();

// Node Environment
const NODE_ENV = process.env.NODE_ENV;

// Express app constants
const PORT = process.env.PORT || 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const DATABASE_URL = process.env.DATABASEURL;

export { NODE_ENV, PORT, CORS_ORIGIN, DATABASE_URL };
