import { Roles } from '../../../src/auth/roles.decorator';
import { User } from '../../../src/auth/user.decorator';
import { ExecutionContext } from '@nestjs/common';

describe('Auth Decorators', () => {
    describe('Roles decorator', () => {
        it('should return decorator function', () => {
            const decorator = Roles('admin', 'user');
            expect(typeof decorator).toBe('function');
        });
    });

    describe('User decorator', () => {
        it('should extract user from request', () => {
            const mockUser = { id: '1', username: 'test' };
            const mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        user: mockUser,
                    }),
                }),
            } as unknown as ExecutionContext;

            const result = User(null, mockContext);
            expect(result).toBe(mockUser);
        });
    });
});