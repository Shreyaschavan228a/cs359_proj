import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { Message } from "@prisma/client";

export const messageRouter = createTRPCRouter({
  getAllMessages: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.message.findMany();
  }),
  getMessages: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      const messages = await ctx.prisma.message.findMany({
        where: {
          senderId: {
            equals: userId,
          },
        },
      });
      return messages;
    }),
  getUniqueMessages: publicProcedure
    .input(z.object({ currentUserId: z.string(), otherUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { currentUserId, otherUserId } = input;

      const messages = await ctx.prisma.message.findMany({
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
        return dummyMessageArr;
      } else {
        return messages;
      }
    }),
});
