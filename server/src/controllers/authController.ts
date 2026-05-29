import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

const registerSchema = z.object({
  email: z.string().email({ message: 'Email 格式不正確' }),
  password: z.string().min(6, { message: '密碼至少需要 6 個字元' }),
  name: z.string().min(1, { message: '姓名不可為空' }),
  role: z.enum(['STORE', 'SCHOOL', 'USER']),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: '此 Email 已經註冊' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: '註冊成功',
      userId: user.id,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.issues[0]?.message || '資料格式錯誤',
      });
    }

    return res.status(400).json({
      message: error.message || '註冊失敗',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: '帳號不存在，請確認 Email 是否正確',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: '密碼錯誤，請重新輸入',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || '登入失敗',
    });
  }
};