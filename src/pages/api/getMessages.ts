import { Message } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { currentUserId, otherUserId } = JSON.parse(req.body as string) as {
    currentUserId: string;
    otherUserId: string;
  };

  let messages = await prisma.message.findMany({
    where: {
      OR: [
        {
          senderId: currentUserId,
          receiverId: otherUserId,
        },
        {
          senderId: otherUserId,
          receiverId: currentUserId,
        },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!messages) {
    const dummyMessageArr = [
      {
        id: -1,
        content: null,
        file: null,
        senderId: "",
        receiverId: "",
        createdAt: new Date(0),
      },
    ] as Message[];
    messages = dummyMessageArr;
  }
  res.status(200).send(JSON.stringify(messages));
};

export default handler;
