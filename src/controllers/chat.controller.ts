import { Request, Response } from "express";

import prisma from "../db/prisma";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { User } from "../middlewares/auth.middleware";
import { createMessageValidator } from "../validators/message.validator";
import { Role } from "@prisma/client";

const getAllConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const user: User = req.user;

    if (!user) {
      throw new ApiError(404, "User Not Found");
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: user._id,
      },
      include: {
        messages: false,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, conversations, "Fetched All Conversations"));
  },
);

const getAllMessages = asyncHandler(async (req: Request, res: Response) => {
  const user: User = req.user;
  const { conversationId } = req.params;

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
      userId: user._id,
    },
    include: {
      messages: {
        select: {
          role: true,
          content: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation Not Found");
  }

  return res.status(200).json(new ApiResponse(200, conversation, "Messages"));
});

const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const user: User = req.user;
  const validatedMessage = createMessageValidator.parse(req.body);

  const { prompt } = validatedMessage;

  const conversation = await prisma.conversation.create({
    data: {
      userId: user._id,
      title: prompt.slice(0, 10),
    },
  });

  const createdConversation = await prisma.conversation.findUnique({
    where: {
      id: conversation.id,
      userId: user._id,
    },
  });

  if (!createdConversation) {
    throw new ApiError(500, "Error creating conversation");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, conversation, "Conversation Created Successfully"),
    );
});

const addMessageToConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const user: User = req.user;
    const { conversationId } = req.params;

    const validatedMessage = createMessageValidator.parse(req.body);
    const { prompt } = validatedMessage;

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userId: user._id,
      },
    });

    if (!conversation) {
      throw new ApiError(404, "Conversation Not Found");
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        content: prompt,
        role: Role.user,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, message, "Message Created"));
  },
);

export {
  getAllConversations,
  getAllMessages,
  createConversation,
  addMessageToConversation,
};
