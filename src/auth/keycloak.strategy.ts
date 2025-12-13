import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import KeycloakBearerStrategy from 'passport-keycloak-bearer';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(KeycloakBearerStrategy) {
    constructor() {
        super({
            realm: process.env.KEYCLOAK_REALM || 'master',
            url: process.env.KEYCLOAK_URL || 'http://localhost:8080',
            clientId: process.env.KEYCLOAK_CLIENT_ID || 'starting-kit',
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        } as any, (token, done) => {
            this.validate(token, done);
        });
    }

    async validate(payload: any, done: (err: any, user: any) => void) {
        done(null, payload);
    }
}