import * as dotenv from 'dotenv'
dotenv.config();
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

const formatValidationErrors = (errors: ValidationError[]): string[] => {
  const formattedErrors: string[] = [];

  const traverse = (validationErrors: ValidationError[]) => {
    validationErrors.forEach((error) => {
      if (error.constraints) {
        formattedErrors.push(...Object.values(error.constraints));
      }

      if (error.children?.length) {
        traverse(error.children);
      }
    });
  };

  traverse(errors);
  return formattedErrors;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        statusCode: 400,
        message: formatValidationErrors(errors),
        error: 'Bad Request',
      }),
  }));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
