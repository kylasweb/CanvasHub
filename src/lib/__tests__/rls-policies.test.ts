import { PrismaClient } from '@prisma/client';
import { AccessControlService } from '../../../scripts/enable-rls';

const prisma = new PrismaClient();

describe('Database Access Control Policies', () => {
    let userId: string;
    let otherUserId: string;
    let adminUserId: string;
    let testProjectId: string;
    let testClientId: string;
    let testInvoiceId: string;

    let userService: AccessControlService;
    let otherUserService: AccessControlService;
    let adminService: AccessControlService;

    beforeAll(async () => {
        // Generate test IDs
        userId = 'test-user-' + Date.now();
        otherUserId = 'test-other-user-' + Date.now();
        adminUserId = 'test-admin-' + Date.now();
        testProjectId = 'test-project-' + Date.now();
        testClientId = 'test-client-' + Date.now();
        testInvoiceId = 'test-invoice-' + Date.now();

        // Create services
        userService = new AccessControlService(prisma, userId, false);
        otherUserService = new AccessControlService(prisma, otherUserId, false);
        adminService = new AccessControlService(prisma, adminUserId, true);
    });

    afterAll(async () => {
        // Clean up test data
        try {
            await prisma.invoice.deleteMany({
                where: { id: { startsWith: 'test-' } }
            });
            await prisma.clientProfile.deleteMany({
                where: { id: { startsWith: 'test-' } }
            });
            await prisma.project.deleteMany({
                where: { id: { startsWith: 'test-' } }
            });
            await prisma.user.deleteMany({
                where: { id: { startsWith: 'test-' } }
            });
        } catch (error) {
            console.warn('Cleanup failed:', error);
        }
    });

    describe('User Data Access Control', () => {
        beforeAll(async () => {
            // Create test users directly with prisma (bypassing access control for setup)
            await prisma.user.create({
                data: {
                    id: userId,
                    email: 'test-user@example.com',
                    name: 'Test User',
                    role: 'USER',
                },
            });

            await prisma.user.create({
                data: {
                    id: otherUserId,
                    email: 'other-user@example.com',
                    name: 'Other User',
                    role: 'USER',
                },
            });

            await prisma.user.create({
                data: {
                    id: adminUserId,
                    email: 'admin@example.com',
                    name: 'Admin User',
                    role: 'ADMIN',
                },
            });
        });

        test('users can access their own profile data', async () => {
            const ownData = await userService.findUser({ id: userId });
            expect(ownData).toBeTruthy();
            expect(ownData?.id).toBe(userId);
            expect(ownData?.email).toBe('test-user@example.com');
        });

        test('users cannot access other users profiles', async () => {
            await expect(otherUserService.findUser({ id: userId })).rejects.toThrow('Access denied');
        });

        test('admin users can access all user profiles', async () => {
            const allUsers = await adminService.findUsers();
            expect(allUsers.length).toBeGreaterThanOrEqual(3);
            const userIds = allUsers.map(u => u.id);
            expect(userIds).toContain(userId);
            expect(userIds).toContain(otherUserId);
            expect(userIds).toContain(adminUserId);
        });
    });

    describe('Project Data Access Control', () => {
        beforeAll(async () => {
            // Create test project using the service
            const project = await userService.createProject({
                id: testProjectId,
                name: 'Test Project',
                status: 'PLANNING',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            });
            expect(project.userId).toBe(userId);
        });

        test('users can access projects they own', async () => {
            const ownProject = await userService.findProject({ id: testProjectId });
            expect(ownProject).toBeTruthy();
            expect(ownProject?.userId).toBe(userId);
            expect(ownProject?.name).toBe('Test Project');
        });

        test('users cannot access projects owned by others', async () => {
            const projects = await otherUserService.findProjects();
            expect(projects).not.toContainEqual(
                expect.objectContaining({ id: testProjectId })
            );
        });

        test('project creation respects ownership', async () => {
            const newProjectId = 'test-new-project-' + Date.now();

            const newProject = await userService.createProject({
                id: newProjectId,
                name: 'New Test Project',
                status: 'PLANNING',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });

            expect(newProject).toBeTruthy();
            expect(newProject.userId).toBe(userId);
            expect(newProject.name).toBe('New Test Project');

            // Verify it can be found by owner
            const foundProject = await userService.findProject({ id: newProjectId });
            expect(foundProject?.id).toBe(newProjectId);

            // Clean up
            await userService.deleteProject({ id: newProjectId });
        });

        test('admins can access all projects', async () => {
            const allProjects = await adminService.findProjects();
            expect(allProjects.some(p => p.id === testProjectId)).toBe(true);
        });
    });

    describe('Client Profile Data Access Control', () => {
        beforeAll(async () => {
            // Create test client using the service
            const client = await userService.createClientProfile({
                id: testClientId,
                name: 'Test Client',
                email: 'client@example.com',
            });
            expect(client.userId).toBe(userId);
        });

        test('users can access client profiles they created', async () => {
            const ownClient = await userService.findClientProfile({ id: testClientId });
            expect(ownClient).toBeTruthy();
            expect(ownClient?.userId).toBe(userId);
            expect(ownClient?.name).toBe('Test Client');
        });

        test('users cannot access client profiles created by others', async () => {
            const clients = await otherUserService.findClientProfiles();
            expect(clients).not.toContainEqual(
                expect.objectContaining({ id: testClientId })
            );
        });

        test('client creation respects ownership', async () => {
            const newClientId = 'test-new-client-' + Date.now();

            const newClient = await userService.createClientProfile({
                id: newClientId,
                name: 'New Test Client',
                email: 'new-client@example.com',
            });

            expect(newClient).toBeTruthy();
            expect(newClient.userId).toBe(userId);
            expect(newClient.name).toBe('New Test Client');

            // Verify it can be found by owner
            const foundClient = await userService.findClientProfile({ id: newClientId });
            expect(foundClient?.id).toBe(newClientId);

            // Clean up
            await userService.deleteClientProfile({ id: newClientId });
        });
    });

    describe('Invoice Data Access Control', () => {
        beforeAll(async () => {
            // Create test invoice using the service
            const invoice = await userService.createInvoice({
                id: testInvoiceId,
                invoiceNumber: 'INV-TEST-001',
                amount: 1000,
                status: 'DRAFT',
                clientId: testClientId,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            expect(invoice.userId).toBe(userId);
        });

        test('users can access invoices they created', async () => {
            const ownInvoice = await userService.findInvoice({ id: testInvoiceId });
            expect(ownInvoice).toBeTruthy();
            expect(ownInvoice?.userId).toBe(userId);
            expect(ownInvoice?.amount).toBe(1000);
        });

        test('users cannot access invoices created by others', async () => {
            const invoices = await otherUserService.findInvoices();
            expect(invoices).not.toContainEqual(
                expect.objectContaining({ id: testInvoiceId })
            );
        });

        test('invoice creation respects ownership', async () => {
            const newInvoiceId = 'test-new-invoice-' + Date.now();

            const newInvoice = await userService.createInvoice({
                id: newInvoiceId,
                invoiceNumber: 'INV-TEST-002',
                amount: 500,
                status: 'DRAFT',
                clientId: testClientId,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });

            expect(newInvoice).toBeTruthy();
            expect(newInvoice.userId).toBe(userId);
            expect(newInvoice.amount).toBe(500);

            // Verify it can be found by owner
            const foundInvoice = await userService.findInvoice({ id: newInvoiceId });
            expect(foundInvoice?.id).toBe(newInvoiceId);

            // Clean up
            await userService.deleteInvoice({ id: newInvoiceId });
        });
    });

    describe('Data Modification Policies', () => {
        test('users can update their own records', async () => {
            // Update user's own project
            const updatedProject = await userService.updateProject(
                { id: testProjectId },
                { name: 'Updated Test Project' }
            );

            expect(updatedProject.name).toBe('Updated Test Project');

            // Reset for other tests
            await userService.updateProject(
                { id: testProjectId },
                { name: 'Test Project' }
            );
        });

        test('users cannot update records owned by others', async () => {
            await expect(
                otherUserService.updateProject(
                    { id: testProjectId },
                    { name: 'Hacked Project Name' }
                )
            ).rejects.toThrow();
        });

        test('users can delete their own records', async () => {
            const tempProjectId = 'test-temp-project-' + Date.now();

            // Create temp project
            await userService.createProject({
                id: tempProjectId,
                name: 'Temp Project',
                status: 'PLANNING',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });

            // Delete it
            const deletedProject = await userService.deleteProject({ id: tempProjectId });
            expect(deletedProject.id).toBe(tempProjectId);
        });

        test('users cannot delete records owned by others', async () => {
            await expect(
                otherUserService.deleteProject({ id: testProjectId })
            ).rejects.toThrow();
        });
    });
});