import bcrypt from 'bcrypt';

class HashService {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateResetToken(): Promise<string> {
    const buffer = await bcrypt.genSalt(16);
    return buffer.replace(/[/+=]/g, '');
  }
}

export default new HashService(); 