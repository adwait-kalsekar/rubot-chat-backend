import chalk from "chalk";

import logger from "./utils/logger";

import app from "./app";
import { PORT } from "./constants";
import connectDB from "./db";

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      const localUrl = `http://localhost:${PORT}`;
      const styledUrl = chalk.magenta.underline.bold(localUrl); // Style the URL with Chalk

      logger.info(`Server is running at: ${styledUrl}`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB Connection Error: ", err);
  });
