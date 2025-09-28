// Mock dependencies before any code
jest.mock('@/lib/firebase', () => ({
    firebaseAuth: {
        getCurrentUser: jest.fn()
    }
}));

jest.mock('@/lib/db', () => ({
    db: {
        user: {
            findUnique: jest.fn()
        }
    }
}));

// Mock NextResponse
jest.mock('next/server', () => ({
    NextRequest: jest.fn().mockImplementation((url, options) => ({
        url,
        method: options?.method || 'GET',
        headers: {
            get: jest.fn((name) => {
                if (name === 'cookie') return options?.headers?.cookie || '';
                return options?.headers?.[name] || null;
            })
        },
        cookies: {
            get: jest.fn((name) => {
                if (name === 'auth-token') {
                    return options?.headers?.cookie?.includes('auth-token=test-token')
                        ? { value: 'test-token' }
                        : null;
                }
                return null;
            })
        }
    })),
    NextResponse: {
        json: jest.fn().mockImplementation((data, options = {}) => ({
            status: options.status || 200,
            json: jest.fn().mockResolvedValue(data)
        }))
    }
}));

// Now import and create references
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../route';
import { firebaseAuth } from '@/lib/firebase';
import { db } from '@/lib/db';

describe('/api/auth/me', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        test('should return 401 when no session token', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/me');

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Not authenticated');
        });

        test('should return 401 when no current user', async () => {
            (firebaseAuth.getCurrentUser as jest.Mock).mockReturnValue(null);

            const request = new NextRequest('http://localhost:3000/api/auth/me', {
                headers: {
                    cookie: 'auth-token=test-token'
                }
            });

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Not authenticated');
        });

        test('should return user data when authenticated', async () => {
            const mockUser = {
                uid: '123',
                email: 'test@example.com',
                displayName: 'Test User',
                emailVerified: true,
                photoURL: 'https://example.com/avatar.jpg'
            };

            const mockDbUser = {
                id: '123',
                email: 'test@example.com',
                name: 'Test User'
            };

            (firebaseAuth.getCurrentUser as jest.Mock).mockReturnValue(mockUser);
            (db.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

            const request = new NextRequest('http://localhost:3000/api/auth/me', {
                headers: {
                    cookie: 'auth-token=test-token'
                }
            });

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.user).toEqual({
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
                emailVerified: true,
                avatar: 'https://example.com/avatar.jpg',
                role: 'user' // admin email check
            });
        });

        test('should assign admin role for admin emails', async () => {
            const mockUser = {
                uid: '123',
                email: 'admin@example.com',
                displayName: 'Admin User',
                emailVerified: true
            };

            (firebaseAuth.getCurrentUser as jest.Mock).mockReturnValue(mockUser);
            (db.user.findUnique as jest.Mock).mockResolvedValue({
                id: '123',
                email: 'admin@example.com',
                name: 'Admin User'
            });

            const request = new NextRequest('http://localhost:3000/api/auth/me', {
                headers: {
                    cookie: 'auth-token=test-token'
                }
            });

            const response = await GET(request);
            const data = await response.json();

            expect(data.user.role).toBe('admin');
        });
    });
});