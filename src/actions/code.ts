// src/actions/code.ts
'use server'

export async function handleCodeSubmit(formData: FormData) {
    const code = formData.get('code') as string;

    if (!code || code.length < 4) {
        return {
            success: false,
            error: 'Code must be at least 4 characters long'
        };
    }

    const isValidCode = await validateCodeInDatabase(code);

    if (!isValidCode) {
        return {
            success: false,
            error: 'Invalid code. Please check and try again.'
        };
    }

    // Don't redirect here — return success and redirect on the client side
    return {
        success: true,
        redirectTo: `/student/info?code=${code}`
    };
}

async function validateCodeInDatabase(code: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const validCodes = ['STORY1', 'STORY2'];
    return validCodes.includes(code.toUpperCase());
}
