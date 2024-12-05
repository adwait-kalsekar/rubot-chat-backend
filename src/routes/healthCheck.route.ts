import { Router } from "express";

import { healthCheck } from "../controllers/healthCheck.controller";

const healthCheckRouter = Router();

healthCheckRouter.route("/").get(healthCheck);

export default healthCheckRouter;
