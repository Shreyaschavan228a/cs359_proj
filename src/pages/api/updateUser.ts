import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    userId,
    username,
    profileUrl: profileImage,
  } = JSON.parse(req.body as string) as {
    userId: string;
    username: string;
    profileUrl: string | undefined;
  };
  console.log(userId, username, profileImage);
  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
        profileImage,
      },
    });
    res.status(200).end();
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      console.log(e.message);
    }
    console.log(e);
    res.status(400).end();
  }
};

export default handler;
