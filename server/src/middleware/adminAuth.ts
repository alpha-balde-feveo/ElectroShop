import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
  sub: string;
  role?: string;
};

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization Bearer token" });
  }

  const token = header.slice("Bearer ".length);

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: "Missing JWT_SECRET" });

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    (req as any).adminId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
