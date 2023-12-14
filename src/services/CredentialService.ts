import bcrypt from "bcryptjs";

export class CredentialService {
    async comparePassword(userPassword: string, hashedPassword: string) {
        return await bcrypt.compare(userPassword, hashedPassword);
    }
}
