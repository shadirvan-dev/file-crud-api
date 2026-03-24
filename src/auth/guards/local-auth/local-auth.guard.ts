import {
    BadRequestException,
    ExecutionContext,
    Injectable,
    ValidationError,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { firstValueFrom, isObservable } from 'rxjs';
import { LoginDto } from '../../dto/login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    private formatValidationErrors(errors: ValidationError[]): string[] {
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
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const loginDto = plainToInstance(LoginDto, req.body ?? {});
        const errors = await validate(loginDto, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        if (errors.length > 0) {
            throw new BadRequestException({
                statusCode: 400,
                message: this.formatValidationErrors(errors),
                error: 'Bad Request',
            });
        }

        req.body = loginDto;

        const canActivateResult = await super.canActivate(context);

        if (isObservable(canActivateResult)) {
            return firstValueFrom(canActivateResult);
        }

        return canActivateResult as boolean;
    }

}
