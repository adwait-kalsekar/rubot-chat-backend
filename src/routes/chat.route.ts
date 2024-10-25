import { Router } from "express";
import {
  addMessageToConversation,
  createConversation,
  getAllConversations,
  getAllMessages,
} from "../controllers/chat.controller";
import { verifyJwt } from "../middlewares/auth.middleware";

const router = Router();

router
  .route("/")
  .get(verifyJwt, getAllConversations)
  .post(verifyJwt, createConversation);

router
  .route("/:conversationId")
  .get(verifyJwt, getAllMessages)
  .post(verifyJwt, addMessageToConversation);

export default router;
