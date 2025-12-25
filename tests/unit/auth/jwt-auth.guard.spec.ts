import { JwtAuthGuard } from '../../../src/auth/jwt-auth.guard';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(() => {
        guard = new JwtAuthGuard();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    // Additional tests would require mocking PassportStrategy
    // For now, basic instantiation test
});