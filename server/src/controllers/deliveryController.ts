import { Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const claimSchema = z.object({
  foodId: z.number(),
  schoolId: z.number(),
});

const confirmSchema = z.object({
  deliveryId: z.number(),
});

// Haversine formula to calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

export const claimDelivery = async (req: any, res: Response) => {
  try {
    const { foodId, schoolId } = claimSchema.parse(req.body);
    
    const result = await prisma.$transaction(async (tx) => {
      const food = await tx.foodItem.findUnique({ where: { id: foodId } });
      if (!food || food.status !== 'AVAILABLE') {
        throw new Error('Food not available');
      }

      // 檢查積分
      const user = await tx.user.findUnique({ where: { id: req.user.userId } });
      if (!user || user.points < food.price) {
        throw new Error('積分不足');
      }

      // 扣除積分
      await tx.user.update({
        where: { id: req.user.userId },
        data: { points: { decrement: food.price } }
      });

      // 生成 4 位數字驗證碼
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      // 隨機分配一個馬達 (1-6)
      const lockerId = Math.floor(Math.random() * 6) + 1;

      const delivery = await tx.delivery.create({
        data: {
          foodId,
          courierId: req.user.userId,
          schoolId,
          status: 'PENDING',
          verificationCode,
          lockerId,
        },
      });

      await tx.foodItem.update({
        where: { id: foodId },
        data: { status: 'IN_TRANSIT' },
      });

      return { ...delivery, verificationCode, lockerId };
    });

    res.status(201).json(result);
  } catch (error: any) {
    const status = ['Food not available', '積分不足'].includes(error.message) ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const topupPoints = async (req: any, res: Response) => {
  try {
    const { amount } = z.object({ amount: z.number() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { points: { increment: amount } }
    });
    res.json({ points: user.points });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyHardwareCode = async (req: any, res: Response) => {
  try {
    const { code } = z.object({ code: z.string() }).parse(req.body);
    const delivery = await prisma.delivery.findFirst({
      where: { verificationCode: code, status: 'PENDING' },
      include: { food: true }
    });

    if (!delivery) {
      return res.status(404).json({ message: '無效的代碼' });
    }

    // 驗證成功，返回 lockerId
    res.json({ lockerId: delivery.lockerId, foodName: delivery.food.name });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveDeliveries = async (req: any, res: Response) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      where: { courierId: req.user.userId, status: 'PENDING' },
      include: { food: { include: { store: true } }, school: true },
    });
    res.json(deliveries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmDelivery = async (req: any, res: Response) => {
  try {
    const { deliveryId } = confirmSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
        include: { food: { include: { store: true } }, school: true, courier: true },
      });

      if (!delivery || delivery.status !== 'PENDING') {
        throw new Error('Invalid delivery');
      }

      if (delivery.schoolId !== req.user.userId) {
        throw new Error('Only the destination school can confirm');
      }

      const now = new Date();
      const startTime = new Date(delivery.startTime);
      const diffHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      if (diffHours > 5) {
        // Timeout
        await tx.delivery.update({
          where: { id: deliveryId },
          data: { status: 'TIMEOUT', endTime: now },
        });
        await tx.user.update({
          where: { id: delivery.courierId },
          data: { points: { decrement: delivery.food.price } },
        });
        return { message: 'Delivery timed out (> 5h). Courier charged.', status: 'TIMEOUT' };
      } else {
        // Success
        const distance = calculateDistance(
          delivery.food.store.lat || 0,
          delivery.food.store.lng || 0,
          delivery.school.lat || 0,
          delivery.school.lng || 0
        );
        
        let pointsEarned = Math.round(distance * 10);
        
        // Bonus points for saving food in "WARNING" status (expires in < 1h)
        const foodExpiry = new Date(delivery.food.expiryDate);
        const hoursToExpiry = (foodExpiry.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursToExpiry < 1) {
          pointsEarned += 50; // High priority bonus
        }

        await tx.delivery.update({
          where: { id: deliveryId },
          data: { status: 'COMPLETED', endTime: now, pointsEarned },
        });
        await tx.foodItem.update({
          where: { id: delivery.foodId },
          data: { status: 'DELIVERED' },
        });
        await tx.user.update({
          where: { id: delivery.courierId },
          data: { points: { increment: pointsEarned } },
        });

        return { message: 'Delivery confirmed!', pointsEarned, status: 'COMPLETED' };
      }
    });

    res.json(result);
  } catch (error: any) {
    const status = ['Invalid delivery', 'Only the destination school can confirm'].includes(error.message) ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const getSchoolDeliveries = async (req: any, res: Response) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      where: { schoolId: req.user.userId, status: 'PENDING' },
      include: { food: true, courier: true },
    });
    res.json(deliveries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
