import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Check if admin user already exists
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('Admin123!', 12);

        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@canvashub.com',
                name: 'CanvasHub Admin',
                password: hashedPassword,
                role: 'ADMIN',
                emailVerified: true,
            }
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@canvashub.com');
        console.log('Password: Admin123!');
        console.log('Please change the password after first login.');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();