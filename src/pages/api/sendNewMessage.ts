import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { senderId, receiverId, content, file } = JSON.parse(
    req.body as string
  ) as {
    senderId: string;
    receiverId: string;
    content: string | undefined;
    file: string | undefined;
  };
  if (!senderId || !receiverId) {
    res.status(400).end();
  }

  try {
    await prisma.message.create({
      data: {
        senderId,
        receiverId,
        file,
        content,
      },
    });
    res.status(200).end();
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      console.log(e.message);
    }
    res.status(400).end();
  }
};

export default handler;
