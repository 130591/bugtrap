import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class RegisterOrganizationAndUserDto {
  @ApiProperty({
    example: 'My Awesome Organization',
    description: 'Name of the new organization to be registered.',
  })
  @IsNotEmpty({ message: 'Organization name is required.' })
  @IsString({ message: 'Organization name must be a string.' })
  @Expose()
  organizationName: string;

  @ApiProperty({
    example: 'contact@myorganization.com',
    description: 'Main contact email for the organization. Must be unique.',
  })
  @IsNotEmpty({ message: 'Organization email is required.' })
  @IsEmail({}, { message: 'Invalid organization email format.' })
  @Expose()
  organizationEmail: string;

  @ApiProperty({
    example: 'base64_string_of_image_logo',
    description: 'Organization profile image (logo) in base64 format. Optional.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Profile image must be a string.' })
  @Expose()
  portraitImageBase64?: string;
}
