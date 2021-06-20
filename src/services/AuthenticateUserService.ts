import { getRepository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { User } from '../models/Users';
import authConfig from '../config/jwt';

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export class AuthenticateUserService {
  public async execute({ email, password }: IRequest): Promise<IResponse> {
    const usersRepository = getRepository(User);

    const findUser = await usersRepository.findOne({
      where: { email },
    });

    if (!findUser) {
      throw new Error('Incorrect email/password combination');
    }

    const passwordMatched = await compare(password, findUser.password);

    if (!passwordMatched) {
      throw new Error('Incorrect email/password combination');
    }

    const { expiresIn, secretKey } = authConfig.jwt;

    const token = sign({}, secretKey, {
      subject: findUser.id,
      expiresIn,
    });

    const { password: del, ...user } = findUser;

    return { user, token };
  }
}
