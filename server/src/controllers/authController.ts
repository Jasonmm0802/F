import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

const registerSchema = z.object({
  email: z.string().email({ message: "?⊥???Email ?澆?" }),
  password: z.string().min(6, { message: "撖Ⅳ?喳??閬?6 ???? }),
  name: z.string().min(1, { message: "憪?銝?箇征" }),
  role: z.enum(['STORE', 'SCHOOL', 'USER']),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ message: '閰?Email 撌脰◤閮餃?' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: '閮餃???', userId: user.id });
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
      return res.status(401).json({ message: '?曆??唳迨撣唾?嚗?瑼Ｘ Email ?臬甇?Ⅱ' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '撖Ⅳ?航炊嚗??頛詨' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

