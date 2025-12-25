import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
    @ApiProperty({ description: 'Unique identifier of the user' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Name of the user', maxLength: 100 })
    @Column({ length: 100 })
    name: string;

    @ApiProperty({ description: 'Email address of the user', maxLength: 150 })
    @Column({ unique: true, length: 150 })
    email: string;

    @ApiProperty({ description: 'Date when the user was created' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Date when the user was last updated' })
    @UpdateDateColumn()
    updatedAt: Date;
}