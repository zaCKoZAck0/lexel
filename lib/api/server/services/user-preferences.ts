import { prisma } from '@/prisma';
import { AppError } from '@/lib/api/server/errors';

export interface UserPreferencesDTO {
  id: string;
  userId: string;
  favoriteModels: string[];
}

export async function getByUserId(
  userId: string,
): Promise<UserPreferencesDTO | null> {
  const pref = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!pref) return null;
  return {
    id: pref.id,
    userId: pref.userId,
    favoriteModels: pref.favoriteModels,
  };
}

/** Ensure preferences row exists; return current values */
export async function ensureForUser(
  userId: string,
): Promise<UserPreferencesDTO> {
  const existing = await prisma.userPreferences.findUnique({
    where: { userId },
  });
  if (existing) {
    return {
      id: existing.id,
      userId: existing.userId,
      favoriteModels: existing.favoriteModels,
    };
  }
  const created = await prisma.userPreferences.create({
    data: { userId, favoriteModels: [] },
  });
  return {
    id: created.id,
    userId: created.userId,
    favoriteModels: created.favoriteModels,
  };
}

/** Partial update to keep API open for future preference fields */
export async function update(
  userId: string,
  updates: { favoriteModels?: string[] },
): Promise<UserPreferencesDTO> {
  await ensureForUser(userId);
  const data: { favoriteModels?: string[] } = {};
  if (typeof updates.favoriteModels !== 'undefined') {
    if (!Array.isArray(updates.favoriteModels)) {
      throw new AppError('favoriteModels must be an array', 400);
    }
    data.favoriteModels = updates.favoriteModels;
  }
  const saved = await prisma.userPreferences.update({
    where: { userId },
    data,
  });
  return {
    id: saved.id,
    userId: saved.userId,
    favoriteModels: saved.favoriteModels,
  };
}
