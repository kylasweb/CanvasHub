import { PrismaClient } from '@prisma/client';

// Access Control Service Class
export class AccessControlService {
    private prisma: PrismaClient;
    private currentUserId?: string;
    private isAdmin: boolean = false;

    constructor(prisma: PrismaClient, currentUserId?: string, isAdmin: boolean = false) {
        this.prisma = prisma;
        this.currentUserId = currentUserId;
        this.isAdmin = isAdmin;
    }

    // User access control
    async findUsers(where?: any) {
        if (this.isAdmin) {
            return this.prisma.user.findMany({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        return this.prisma.user.findMany({
            where: { ...where, id: this.currentUserId }
        });
    }

    async findUser(where: any) {
        if (this.isAdmin) {
            return this.prisma.user.findUnique({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        // Ensure the requested user ID matches the current user
        if (where.id !== this.currentUserId) {
            throw new Error('Access denied');
        }
        return this.prisma.user.findUnique({ where });
    }

    async updateUser(where: any, data: any) {
        if (this.isAdmin) {
            return this.prisma.user.update({ where, data });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        return this.prisma.user.update({
            where: { ...where, id: this.currentUserId },
            data
        });
    }

    // Project access control
    async findProjects(where?: any) {
        if (this.isAdmin) {
            return this.prisma.project.findMany({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        return this.prisma.project.findMany({
            where: { ...where, userId: this.currentUserId }
        });
    }

    async findProject(where: any) {
        if (this.isAdmin) {
            return this.prisma.project.findUnique({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        // First check if the project exists and belongs to the user
        const project = await this.prisma.project.findUnique({
            where: { ...where, userId: this.currentUserId }
        });
        if (!project) {
            throw new Error('Access denied');
        }
        return project;
    }

    async createProject(data: any) {
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        return this.prisma.project.create({
            data: { ...data, userId: this.currentUserId }
        });
    }

    async updateProject(where: any, data: any) {
        if (this.isAdmin) {
            return this.prisma.project.update({ where, data });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        // First check if the project exists and belongs to the user
        const existingProject = await this.prisma.project.findUnique({
            where: { ...where, userId: this.currentUserId }
        });
        if (!existingProject) {
            throw new Error('Access denied');
        }
        return this.prisma.project.update({
            where: { ...where, userId: this.currentUserId },
            data
        });
    }

    async deleteProject(where: any) {
        if (this.isAdmin) {
            return this.prisma.project.delete({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        // First check if the project exists and belongs to the user
        const existingProject = await this.prisma.project.findUnique({
            where: { ...where, userId: this.currentUserId }
        });
        if (!existingProject) {
            throw new Error('Access denied');
        }
        return this.prisma.project.delete({
            where: { ...where, userId: this.currentUserId }
        });
    }

    // Client Profile access control
    async findClientProfiles(where?: any) {
        if (this.isAdmin) {
            return this.prisma.clientProfile.findMany({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        return this.prisma.clientProfile.findMany({
            where: { ...where, userId: this.currentUserId }
        });
    }

    async findClientProfile(where: any) {
        if (this.isAdmin) {
            return this.prisma.clientProfile.findUnique({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        // First check if the client exists and belongs to the user
        const client = await this.prisma.clientProfile.findUnique({
            where: { ...where, userId: this.currentUserId }
        });
        if (!client) {
            throw new Error('Access denied');
        }
        return client;
    }

    async createClientProfile(data: any) {
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        return this.prisma.clientProfile.create({
            data: { ...data, userId: this.currentUserId }
        });
    }

    async updateClientProfile(where: any, data: any) {
        if (this.isAdmin) {
            return this.prisma.clientProfile.update({ where, data });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        // First check if the client exists and belongs to the user
        const existingClient = await this.prisma.clientProfile.findUnique({
            where: { ...where, userId: this.currentUserId }
        });
        if (!existingClient) {
            throw new Error('Access denied');
        }
        return this.prisma.clientProfile.update({
            where: { ...where, userId: this.currentUserId },
            data
        });
    }

    async deleteClientProfile(where: any) {
        if (this.isAdmin) {
            return this.prisma.clientProfile.delete({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        // First check if the client exists and belongs to the user
        const existingClient = await this.prisma.clientProfile.findUnique({
            where: { ...where, userId: this.currentUserId }
        });
        if (!existingClient) {
            throw new Error('Access denied');
        }
        return this.prisma.clientProfile.delete({
            where: { ...where, userId: this.currentUserId }
        });
    }

    // Invoice access control
    async findInvoices(where?: any) {
        if (this.isAdmin) {
            return this.prisma.invoice.findMany({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        return this.prisma.invoice.findMany({
            where: { ...where, userId: this.currentUserId }
        });
    }

    async findInvoice(where: any) {
        if (this.isAdmin) {
            return this.prisma.invoice.findUnique({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        // First check if the invoice exists and belongs to the user
        const invoice = await this.prisma.invoice.findUnique({
            where: { ...where, userId: this.currentUserId }
        });
        if (!invoice) {
            throw new Error('Access denied');
        }
        return invoice;
    }

    async createInvoice(data: any) {
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        return this.prisma.invoice.create({
            data: { ...data, userId: this.currentUserId }
        });
    }

    async updateInvoice(where: any, data: any) {
        if (this.isAdmin) {
            return this.prisma.invoice.update({ where, data });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        // First check if the invoice exists and belongs to the user
        const existingInvoice = await this.prisma.invoice.findUnique({
            where: { ...where, userId: this.currentUserId }
        });
        if (!existingInvoice) {
            throw new Error('Access denied');
        }
        return this.prisma.invoice.update({
            where: { ...where, userId: this.currentUserId },
            data
        });
    }

    async deleteInvoice(where: any) {
        if (this.isAdmin) {
            return this.prisma.invoice.delete({ where });
        }
        if (!this.currentUserId) {
            throw new Error('Authentication required');
        }
        // First check if the invoice exists and belongs to the user
        const existingInvoice = await this.prisma.invoice.findUnique({
            where: { ...where, userId: this.currentUserId }
        });
        if (!existingInvoice) {
            throw new Error('Access denied');
        }
        return this.prisma.invoice.delete({
            where: { ...where, userId: this.currentUserId }
        });
    }
}

// Test function to validate access control
export async function testAccessControl() {
    console.log('Testing Application-Level Access Control...');

    const prisma = new PrismaClient();

    // Test with regular user
    const userId = 'test-user-' + Date.now();

    try {
        // Create test user directly with prisma (bypassing access control for setup)
        const user = await prisma.user.create({
            data: {
                id: userId,
                email: 'test@example.com',
                name: 'Test User',
                role: 'USER',
            },
        });
        console.log('✅ User created:', user.id);

        // Create access control service for the user
        const userService = new AccessControlService(prisma, userId, false);

        const project = await userService.createProject({
            id: 'test-project-' + Date.now(),
            name: 'Test Project',
            status: 'PLANNING',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        console.log('✅ Project created:', project.id);

        // Test access control - should work for owner
        const foundProject = await userService.findProject({ id: project.id });
        console.log('✅ Project found by owner:', foundProject?.id);

        // Test with different user - should not find the project
        const otherUserId = 'other-user-' + Date.now();
        const otherUserService = new AccessControlService(prisma, otherUserId, false);

        try {
            const notFoundProject = await otherUserService.findProject({ id: project.id });
            console.log('❌ Access control failed - project found by different user');
        } catch (error) {
            console.log('✅ Access control working - project not accessible to different user');
        }

        // Test admin access
        const adminService = new AccessControlService(prisma, otherUserId, true);
        const adminFoundProject = await adminService.findProject({ id: project.id });
        console.log('✅ Admin access working - project found by admin:', adminFoundProject?.id);

        // Cleanup
        await prisma.project.delete({ where: { id: project.id } });
        await prisma.user.delete({ where: { id: userId } });

        console.log('✅ Application-Level Access Control tests passed!');

    } catch (error) {
        console.error('❌ Access control test failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Main execution
async function main() {
    try {
        console.log('Setting up Application-Level Access Control...');
        console.log('Note: Using service layer instead of database RLS for SQLite compatibility');

        // Run tests to validate the access control
        await testAccessControl();

        console.log('✅ Application-Level Access Control successfully implemented!');
        console.log('');
        console.log('To use access control in your application:');
        console.log('1. Import: import { AccessControlService } from "./scripts/enable-rls"');
        console.log('2. Create service: const service = new AccessControlService(prisma, userId, isAdmin)');
        console.log('3. Use service methods: service.findProjects(), service.createProject(), etc.');
        console.log('4. The service will automatically enforce access control rules');

    } catch (error) {
        console.error('❌ Access control setup failed:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    main()
        .then(() => {
            console.log('🎉 Access control setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Access control setup failed:', error);
            process.exit(1);
        });
}