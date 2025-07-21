import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { Transform } from 'class-transformer';

export class CreateUserDTO {
     @IsNotEmpty()
     fullname: string;

     @IsNotEmpty()
     email: string;
     
     @IsNotEmpty()
     password: string;

     @IsOptional()
     @Transform(({ value }) => Number(value)) 
     age: number;
}