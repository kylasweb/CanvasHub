import { prisma } from '@/lib/db';
import { User, ClientProfile, UserSettings, UserRole, UserStatus } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  tenantId?: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  tenantId?: string;
}

export interface CreateClientProfileInput {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateClientProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  tags?: string[];
  notes?: string;
}

export class UserService {
  // User CRUD operations
  async createUser(data: CreateUserInput): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role || UserRole.USER,
        tenantId: data.tenantId,
      },
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        clientProfiles: true,
        userSettings: true,
        subscriptions: true,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        clientProfiles: true,
        userSettings: true,
        subscriptions: true,
      },
    });
  }

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (params?.role) {
      where.role = params.role;
    }
    
    if (params?.status) {
      where.status = params.status;
    }
    
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          clientProfiles: true,
          userSettings: true,
          subscriptions: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
      include: {
        clientProfiles: true,
        userSettings: true,
        subscriptions: true,
      },
    });
  }

  async deleteUser(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    });
  }

  async toggleUserStatus(id: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    
    return await prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  // Client Profile CRUD operations
  async createClientProfile(data: CreateClientProfileInput): Promise<ClientProfile> {
    return await prisma.clientProfile.create({
      data: {
        userId: data.userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        notes: data.notes,
      },
    });
  }

  async getClientProfileById(id: string): Promise<ClientProfile | null> {
    return await prisma.clientProfile.findUnique({
      where: { id },
      include: {
        user: true,
        projects: true,
        invoices: true,
      },
    });
  }

  async getAllClientProfiles(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    search?: string;
  }): Promise<{ clientProfiles: ClientProfile[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (params?.userId) {
      where.userId = params.userId;
    }
    
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { company: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [clientProfiles, total] = await Promise.all([
      prisma.clientProfile.findMany({
        where,
        include: {
          user: true,
          projects: true,
          invoices: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.clientProfile.count({ where }),
    ]);

    return { clientProfiles, total };
  }

  async updateClientProfile(id: string, data: UpdateClientProfileInput): Promise<ClientProfile> {
    return await prisma.clientProfile.update({
      where: { id },
      data: {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
      },
      include: {
        user: true,
        projects: true,
        invoices: true,
      },
    });
  }

  async deleteClientProfile(id: string): Promise<ClientProfile> {
    return await prisma.clientProfile.delete({
      where: { id },
    });
  }

  // User Settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return await prisma.userSettings.findUnique({
      where: { userId },
    });
  }

  async createOrUpdateUserSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings> {
    return await prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  // Statistics
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<UserRole, number>;
    byStatus: Record<UserStatus, number>;
  }> {
    const [total, active, inactive, byRole, byStatus] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.INACTIVE } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      prisma.user.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const roleCounts = byRole.reduce((acc, item) => {
      acc[item.role as UserRole] = item._count.role;
      return acc;
    }, {} as Record<UserRole, number>);

    const statusCounts = byStatus.reduce((acc, item) => {
      acc[item.status as UserStatus] = item._count.status;
      return acc;
    }, {} as Record<UserStatus, number>);

    return {
      total,
      active,
      inactive,
      byRole: roleCounts,
      byStatus: statusCounts,
    };
  }

  async getClientProfileStats(): Promise<{
    total: number;
    byUser: Record<string, number>;
  }> {
    const [total, byUser] = await Promise.all([
      prisma.clientProfile.count(),
      prisma.clientProfile.groupBy({
        by: ['userId'],
        _count: { userId: true },
      }),
    ]);

    const userCounts = byUser.reduce((acc, item) => {
      acc[item.userId] = item._count.userId;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byUser: userCounts,
    };
  }
}