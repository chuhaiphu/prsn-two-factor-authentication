import { MailerService } from '@nestjs-modules/mailer'
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { SignupDto } from 'src/_dtos/signup.dto'
import { UserDto } from 'src/_dtos/user.dto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private jwtService: JwtService
  ) { }

  async createAdminIfNotExists() {
    const adminEmail = 'admin@example.com';
    const adminUserName = 'admin'
    const existingAdmin = await this.prisma.user.findFirst({
      where: { email: adminEmail, role: 'ADMIN' },
    })
  
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin', 10)
      await this.prisma.user.create({
        data: {
          username: adminUserName,
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          refreshToken: '',
          verificationToken: '',
        },
      })
    }
  }

  // ! USER
  async createUser(signupData: SignupDto) {
    const { username, email, password, phone } = signupData;

    // Check if email is in use
    const emailInUse = await this.prisma.user.findFirst({
      where: { email },
    })

    const usernameInUse = await this.prisma.user.findFirst({
      where: { username },
    })

    if (emailInUse) {
      throw new BadRequestException('Email already in use')
    }

    if (usernameInUse) {
      throw new BadRequestException('Username already in use')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user document and save in PostgreSQL using Prisma
    const newUser = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
        role: 'USER',
        refreshToken: '',
        verificationToken: '',
      },
    })

    const { password: userPassword, refreshToken, verificationToken, ...result } = newUser
    return result
  }
  
  async updateUser(id: string, userData: UserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      userData.password = hashedPassword
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
      }
    })

    return updatedUser
  }

  async forgetPassword(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationToken = this.jwtService.sign(
      { sub: user.id, code: verificationCode },
      { expiresIn: '15m' }
    )

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
      },
    })

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Verification Code',
      template: './password-reset',
      context: {
        username: user.username,
        email: user.email,
        verificationCode
      },
    })

    return { message: 'Verification code sent to your email' }
  }

  async validateVerificationToken(email: string, verification_code: string) {
    const user = await this.prisma.user.findFirst({ where: { email } })
    if (!user || !user.verificationToken) {
      throw new UnauthorizedException('User not found or no reset requested')
    }
  
    try {
      const decodedToken = this.jwtService.verify(user.verificationToken)
      if (decodedToken.code !== verification_code) {
        throw new UnauthorizedException('Invalid verification code')
      }
  
      return { userId: user.id, email: user.email }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired verification token')
    }
  }
  
  async resetPassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        verificationToken: "",
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
      }
    })

    return { message: 'Password reset successfully' }
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
      },
    })
  }

  async findByPagination(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit
  
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
        },
      }),
      this.prisma.user.count(),
    ])
  
    return {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      users
    }
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isTwoFAEnabled: true
      }
    })
  }

  async deleteUser(id: string, currentUserId: number, currentUserRole: string) {
    const userToDelete = await this.prisma.user.findUnique({ where: { id } })
    if (!userToDelete) {
      throw new NotFoundException('User not found')
    }
  
    if (currentUserRole === 'USER' && currentUserId.toString() !== id) {
      throw new UnauthorizedException('Users can only delete their own account')
    }
  
    return await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
      }
    })
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        isTwoFAEnabled: true,
      }
    })
  }

  //********************************************************** */
}
