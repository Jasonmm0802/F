import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

const registerSchema = z.object({
  email: z.string().email({ message: "?¡æ???Email ?¼å?" }),
  password: z.string().min(6, { message: "å¯†ç¢¼?³å??€è¦?6 ?‹å??? }),
  name: z.string().min(1, { message: "å§“å?ä¸èƒ½?ºç©º" }),
  role: z.enum(['STORE', 'SCHOOL', 'USER']),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'è©?Email å·²è¢«è¨»å?' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'è¨»å??å?', userId: user.id });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: '?¾ä??°æ­¤å¸³è?ï¼Œè?æª¢æŸ¥ Email ?¯å¦æ­?¢º' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'å¯†ç¢¼?¯èª¤ï¼Œè??æ–°è¼¸å…¥' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
