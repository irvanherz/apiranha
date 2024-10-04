import { StdError } from './std-error';

export function ErrorHandler() {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (error) {
                console.error(`Error in ${propertyKey}:`, error);
                if (error instanceof StdError) {
                    const stdError = error as StdError;
                    return {
                        statusCode: stdError.httpStatus,
                        body: JSON.stringify({
                            code: stdError.code,
                            message: stdError.message,
                        }),
                    };
                }

                return {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Internal Server Error' }),
                };
            }
        };

        return descriptor;
    };
}
