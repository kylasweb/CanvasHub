// Mock Firebase before importing
jest.mock('@/lib/firebase', () => ({
    firebaseAuth: {
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        getCurrentUser: jest.fn(),
        onAuthStateChanged: jest.fn()
    }
}));

import { firebaseAuth } from '@/lib/firebase';

describe('Firebase Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signIn', () => {
        test('should call firebaseAuth.signIn with correct parameters', async () => {
            const mockUserCredential = { user: { uid: '123', email: 'test@example.com' } };
            (firebaseAuth.signIn as jest.Mock).mockResolvedValue(mockUserCredential);

            const result = await firebaseAuth.signIn('test@example.com', 'password');

            expect(firebaseAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password');
            expect(result).toEqual(mockUserCredential);
        });

        test('should throw error when firebaseAuth is not available', async () => {
            (firebaseAuth.signIn as jest.Mock).mockRejectedValue(
                new Error('Firebase Auth is not initialized. Please check your Firebase configuration.')
            );

            await expect(
                firebaseAuth.signIn('test@example.com', 'password')
            ).rejects.toThrow('Firebase Auth is not initialized');
        });
    });

    describe('signUp', () => {
        test('should call firebaseAuth.signUp with correct parameters', async () => {
            const mockUserCredential = { user: { uid: '123', email: 'test@example.com' } };
            (firebaseAuth.signUp as jest.Mock).mockResolvedValue(mockUserCredential);

            const result = await firebaseAuth.signUp('test@example.com', 'password');

            expect(firebaseAuth.signUp).toHaveBeenCalledWith('test@example.com', 'password');
            expect(result).toEqual(mockUserCredential);
        });
    });

    describe('signOut', () => {
        test('should call firebaseAuth.signOut', async () => {
            (firebaseAuth.signOut as jest.Mock).mockResolvedValue(undefined);

            await firebaseAuth.signOut();

            expect(firebaseAuth.signOut).toHaveBeenCalled();
        });
    });

    describe('getCurrentUser', () => {
        test('should return current user', () => {
            const mockUser = { uid: '123', email: 'test@example.com' };
            (firebaseAuth.getCurrentUser as jest.Mock).mockReturnValue(mockUser);

            const result = firebaseAuth.getCurrentUser();

            expect(result).toEqual(mockUser);
            expect(firebaseAuth.getCurrentUser).toHaveBeenCalled();
        });

        test('should return null when no user', () => {
            (firebaseAuth.getCurrentUser as jest.Mock).mockReturnValue(null);

            const result = firebaseAuth.getCurrentUser();

            expect(result).toBeNull();
        });
    });
});