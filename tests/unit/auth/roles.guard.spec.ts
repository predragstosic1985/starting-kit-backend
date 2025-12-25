import { RolesGuard } from '../../../src/auth/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow access when no roles required', () => {
        const mockContext = {
            getHandler: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({}),
            }),
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'get').mockReturnValue(undefined);

        expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow access when user has required role', () => {
        const mockContext = {
            getHandler: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    user: { roles: ['admin'] },
                }),
            }),
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

        expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should deny access when user lacks required role', () => {
        const mockContext = {
            getHandler: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    user: { roles: ['user'] },
                }),
            }),
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

        expect(guard.canActivate(mockContext)).toBe(false);
    });
});