import fetch from 'node-fetch';

/**
 * Verify Cloudflare Turnstile token
 * @param {string} token - The token from client-side Turnstile
 * @param {string} remoteip - Client IP address (optional)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyTurnstileToken(token, remoteip = null) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY not configured');
    return { success: false, error: 'Server configuration error' };
  }

  if (!token) {
    return { success: false, error: 'No captcha token provided' };
  }

  // Special handling for test environment
  const isTestKey = secretKey === '1x0000000000000000000000000000000AA';
  if (isTestKey) {
    // Trong môi trường test với secret key test của Cloudflare, chấp nhận token được sinh ra
    if (token && typeof token === 'string' && token.trim().length > 0) {
      console.log('Test mode: Valid test token accepted');
      return { success: true };
    } else {
      console.log('Test mode: No token provided');
      return { success: false, error: 'Vui lòng xác thực captcha' };
    }
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return { success: true };
    } else {
      console.error('Turnstile verification failed:', result['error-codes']);
      return { 
        success: false, 
        error: 'Captcha verification failed',
        errorCodes: result['error-codes']
      };
    }
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return { success: false, error: 'Captcha verification error' };
  }
}