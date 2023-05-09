import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export type responseType = {
  secondUserId: string | null;
  error: "User not found" | "None" | "Chat already exists";
};
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // doing very weird and bad stuff with http res codes DONT DO THIS
  const { currentUserId, newUserName } = JSON.parse(req.body as string) as {
    currentUserId: string;
    newUserName: string;
  };
  const secondUser = await prisma.user.findFirst({
    where: {
      username: newUserName,
    },
  });

  if (!secondUser) {
    const response: responseType = {
      secondUserId: null,
      error: "User not found",
    };
    res.status(404).send(JSON.stringify(response));
    return;
  }

  const chat = await prisma.chat.findFirst({
    where: {
      OR: [
        {
          user_one_id: currentUserId,
          user_two_id: secondUser?.id,
        },
        {
          user_one_id: secondUser?.id,
          user_two_id: currentUserId,
        },
      ],
    },
  });

  if (chat) {
    const response: responseType = {
      secondUserId: secondUser.id,
      error: "Chat already exists",
    };
    res.status(400).send(JSON.stringify(response));
    return;
  }

  const newChat = await prisma.chat.create({
    data: {
      user_one_id: currentUserId,
      user_two_id: secondUser.id,
    },
  });

  const response: responseType = {
    secondUserId: secondUser.id,
    error: "None",
  };
  res.status(200).send(JSON.stringify(response));
};

export default handler;
