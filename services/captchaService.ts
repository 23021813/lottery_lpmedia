/**
 * Verify captcha token with server
 * @param captchaToken - Token from Turnstile
 * @param formData - Form data being submitted
 * @returns Promise<{success: boolean, error?: string}>
 */
export async function verifyCaptcha(captchaToken: string, formData: any): Promise<{success: boolean, error?: string}> {
  try {
    const response = await fetch('/api/verify-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        captchaToken,
        formData
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Captcha verification failed'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error verifying captcha:', error);
    return {
      success: false,
      error: 'Network error during captcha verification'
    };
  }
}