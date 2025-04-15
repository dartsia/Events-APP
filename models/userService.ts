import prisma from '../src/prismaClient';

export const getUserByRefreshToken = async (refreshToken: string) => {
    const user = await prisma.user.findFirst({
        where: { refreshToken },
      });
    return user;      
};
  