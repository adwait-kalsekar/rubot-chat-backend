import { Request, Response } from "express";

import prisma from "../db/prisma";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { User } from "../middlewares/auth.middleware";
import { messageValidator } from "../validators/message.validator";
import { Role } from "@prisma/client";
import axios from "axios";
import { AUTH_BACKEND_URL, GENAI_BACKEND_URL } from "../constants";

interface AiResponseData {
  statusCode: Number;
  data: String;
  message: String;
  success: Boolean;
}

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
      orderBy: {
        createdAt: "desc",
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
        orderBy: {
          createdAt: "asc",
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
  const validatedMessage = messageValidator.parse(req.body);

  const { prompt } = validatedMessage;

  const titleResponse = await axios.post(
    `${GENAI_BACKEND_URL}/ai/generate-title`,
    { prompt },
  );

  console.log(titleResponse);

  const title = titleResponse.data.data;

  const conversation = await prisma.conversation.create({
    data: {
      userId: user._id,
      title,
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

    const validatedMessage = messageValidator.parse(req.body);
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

const getAiResponse = asyncHandler(async (req: Request, res: Response) => {
  const user: User = req.user;
  const { conversationId } = req.params;

  const userRole = user.role;

  if (userRole === "user") {
    const response = await prisma.message.create({
      data: {
        conversationId,
        content:
          "Sorry the chat feature is still under development and only accessible to beta users",
        role: "assistant",
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Sorry the chat feature is still under development and only accessible to beta users",
          `Not allowed to send messages yet`,
        ),
      );
  }

  const userProfileResponse = await axios.get(`${AUTH_BACKEND_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${
        req.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")
      }`,
    },
  });

  const userProfileData = userProfileResponse.data?.data;

  const userData = userProfileData.user;

  const userForProfile = {
    fullName: userData.fullName,
    username: userData.username,
    email: userData.email,
    role: userData.role,
  };

  const userProfile = {
    canvasApiKey: userProfileData.canvasApiKey,
    user: userForProfile,
    isStudent: userProfileData.isStudent,
  };

  const validatedMessage = messageValidator.parse(req.body);
  const { prompt } = validatedMessage;

  // userProfile.canvasApiKey = "";

  console.log({
    // chat_history: {
    //   messages: [
    //     {
    //       role: "user",
    //       content: prompt,
    //     },
    //   ],
    // },
    // user_profile: userProfile,
    ...userProfile,
  });

  const aiResponse = await axios.post(`${GENAI_BACKEND_URL}/ai/get-response`, {
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    user_profile: userProfile,
  });

  const aiData: AiResponseData = aiResponse.data;

  const response = await prisma.message.create({
    data: {
      conversationId,
      content: aiData.data.toString(),
      role: Role.assistant,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        aiData.data.toString(),
        `Response for the message: ${prompt}`,
      ),
    );
});

export {
  getAllConversations,
  getAllMessages,
  createConversation,
  addMessageToConversation,
  getAiResponse,
};
