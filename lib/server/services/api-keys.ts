import { MAX_API_KEYS_PER_PROVIDER } from "@/lib/config";
import { prisma } from "@/prisma";
import { AppError } from "@/lib/server/errors";
import { encrypt, decrypt } from "@/lib/encryption";
import { ApiKeys } from "@prisma/client";

// Shape returned to the rest of the app (matches previous ApiKeys model including `key`)
export interface DecryptedApiKey {
    id: string;
    userId: string;
    provider: string;
    default: boolean;
    key: string; // plaintext (decrypted) key
    createdAt: Date;
    updatedAt: Date;
}

// Input shape when creating a key
interface CreateApiKeyInput {
    userId: string;
    provider: string;
    key: string; // plaintext provided by user
    default?: boolean;
}

// Update input (plaintext key optional)
interface UpdateApiKeyInput {
    provider?: string;
    key?: string; // new plaintext key
    default?: boolean;
}

async function mapAndDecrypt(record: ApiKeys): Promise<DecryptedApiKey> {
    return {
        id: record.id,
        userId: record.userId,
        provider: record.provider,
        default: record.default,
        key: await decrypt(record.encrypted, record.iv),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
    };
}

async function decryptMany(records: ApiKeys[]): Promise<DecryptedApiKey[]> {
    return Promise.all(records.map(r => mapAndDecrypt(r)));
}

export async function create(data: CreateApiKeyInput): Promise<DecryptedApiKey> {
    const keyCountForProvider = await prisma.apiKeys.count({ where: { userId: data.userId, provider: data.provider } });

    if (keyCountForProvider >= MAX_API_KEYS_PER_PROVIDER) {
        throw new AppError("Maximum number of API keys reached for this provider", 409);
    }

    let makeDefault = data.default ?? false;
    if (keyCountForProvider === 0) {
        makeDefault = true; // first key for provider
    }

    const { encrypted, iv } = await encrypt(data.key);

    const created = await prisma.apiKeys.create({
        data: {
            userId: data.userId,
            provider: data.provider,
            default: makeDefault,
            encrypted,
            iv
        }
    });

    return mapAndDecrypt(created);
}

export async function findAllByUserId(userId: string) {
    const records = await prisma.apiKeys.findMany({ where: { userId } });
    return decryptMany(records);
}

export async function setDefault(id: string, userId: string) {
    // Find the API key and verify ownership
    const key = await prisma.apiKeys.findUnique({
        where: {
            id
        }
    });

    if (!key) {
        throw new AppError("API key not found", 404);
    }

    // Check if the user owns this API key
    if (key.userId !== userId) {
        throw new AppError("Unauthorized: You can only modify your own API keys", 403);
    }

    // Revoke all other API keys for the same user and provider
    await prisma.apiKeys.updateMany({
        where: {
            userId: key.userId,
            provider: key.provider
        },
        data: {
            default: false
        }
    });

    // Make the selected API key default
    await prisma.apiKeys.update({
        where: {
            id
        },
        data: {
            default: true
        }
    });
}

export async function getDefaultApiKeyForProvider(userId: string, provider: string) {
    const record = await prisma.apiKeys.findFirst({ where: { userId, provider, default: true } });
    if (!record) return null;
    return mapAndDecrypt(record);
}

export async function getAllAvailableProvidersForUserId(userId: string) {
    return (await prisma.apiKeys.findMany({
        where: {
            userId,
            default: true
        }
    })).map(key => key.provider);
}

export async function deleteById(id: string, userId: string) {
    // Find the API key and verify ownership
    const key = await prisma.apiKeys.findUnique({
        where: {
            id
        }
    });

    if (!key) {
        throw new AppError("API key not found", 404);
    }

    // Check if the user owns this API key
    if (key.userId !== userId) {
        throw new AppError("Unauthorized: You can only delete your own API keys", 403);
    }

    // Delete the API key
    await prisma.apiKeys.delete({
        where: {
            id
        }
    });

    // If this was the default key and there are other keys for the same provider,
    // make the first remaining key the default
    if (key.default) {
        const remainingKey = await prisma.apiKeys.findFirst({
            where: {
                userId,
                provider: key.provider
            }
        });

        if (remainingKey) {
            await prisma.apiKeys.update({
                where: {
                    id: remainingKey.id
                },
                data: {
                    default: true
                }
            });
        }
    }
}

export async function findById(id: string, userId: string) {
    // Find the API key and verify ownership
    const key = await prisma.apiKeys.findUnique({
        where: {
            id
        }
    });

    if (!key) {
        return null;
    }

    // Check if the user owns this API key
    if (key.userId !== userId) {
        throw new AppError("Unauthorized: You can only access your own API keys", 403);
    }

    return mapAndDecrypt(key);
}

export async function updateById(id: string, userId: string, data: UpdateApiKeyInput) {
    // Find the API key and verify ownership
    const existingKey = await prisma.apiKeys.findUnique({
        where: {
            id
        }
    });

    if (!existingKey) {
        throw new AppError("API key not found", 404);
    }

    // Check if the user owns this API key
    if (existingKey.userId !== userId) {
        throw new AppError("Unauthorized: You can only update your own API keys", 403);
    }

    // If updating the key value, check for duplicates (decrypt existing keys for user)
    if (data.key) {
        const userKeys = await prisma.apiKeys.findMany({ where: { userId } });
        for (const record of userKeys) {
            if (record.id === id) continue;
            const plaintext = await decrypt(record.encrypted, record.iv);
            if (plaintext === data.key) {
                throw new AppError("API key already exists for this user", 409);
            }
        }
    }

    // If setting as default, unset other defaults for the same provider
    if (data.default === true) {
        await prisma.apiKeys.updateMany({
            where: {
                userId,
                provider: data.provider || existingKey.provider,
                id: {
                    not: id
                }
            },
            data: {
                default: false
            }
        });
    }

    let encryptedUpdate: { encrypted?: string; iv?: string } = {};
    if (data.key) {
        const { encrypted, iv } = await encrypt(data.key);
        encryptedUpdate = { encrypted, iv };
    }

    const updated = await prisma.apiKeys.update({
        where: { id },
        data: {
            provider: data.provider ?? existingKey.provider,
            default: typeof data.default === 'boolean' ? data.default : existingKey.default,
            ...encryptedUpdate
        }
    });

    return mapAndDecrypt(updated);
}