import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
});
