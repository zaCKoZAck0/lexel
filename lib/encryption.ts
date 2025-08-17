import 'server-only';

import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const masterKey = process.env.MASTER_ENCRYPTION_KEY;

export async function encrypt(plaintext: string): Promise<{ encrypted: string; iv: string }> {
    if (!masterKey) {
        throw new Error("Master key not found");
    }
    const iv = crypto.randomBytes(16); // Unique IV
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(masterKey, 'hex'), iv);
    let encrypted = cipher.update(plaintext);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { encrypted: encrypted.toString('hex'), iv: iv.toString('hex') };
}

export async function decrypt(encrypted: string, iv: string): Promise<string> {
    if (!masterKey) {
        throw new Error("Master key not found");
    }
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(masterKey, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}