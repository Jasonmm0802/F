import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const foodSchema = z.object({
  name: z.string().min(1, '食品名稱不能為空'),
  description: z.string().optional(),
  price: z.number().min(0, '價格不能小於 0'),
  category: z.enum(['CANTEEN', 'STORE', 'EVENT']),
  expiryDate: z.string().transform((str) => new Date(str)),
});

export const registerFood = async (req: any, res: Response) => {
  try {
    const data = foodSchema.parse(req.body);
    const food = await prisma.foodItem.create({
      data: {
        ...data,
        storeId: req.user.userId,
      },
    });
    res.status(201).json(food);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(400).json({ message: error.message });
  }
};

export const getAvailableFood = async (req: Request, res: Response) => {
  try {
    const foodItems = await prisma.foodItem.findMany({
      where: { status: 'AVAILABLE' },
      include: { store: { select: { name: true, lat: true, lng: true } } },
    });
    res.json(foodItems);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalItems = await prisma.foodItem.count({ where: { status: 'DELIVERED' } });
    const activeVolunteers = await prisma.user.count({ where: { role: 'USER' } });
    
    // ESG Logic: 1 item ~= 0.5kg food
    // 1kg food saved ~= 2.5kg CO2 reduction
    // 1kg food saved ~= 1.2m3 water saved
    const foodSavedKg = totalItems * 0.5;
    const co2Saved = foodSavedKg * 2.5;
    const waterSaved = foodSavedKg * 1.2;

    res.json({
      totalSaved: totalItems,
      foodSavedKg,
      activeVolunteers: activeVolunteers + 5, // Base + 5 active for demo
      co2Saved,
      waterSaved,
      impactScore: totalItems > 10 ? 'A+' : 'B',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
