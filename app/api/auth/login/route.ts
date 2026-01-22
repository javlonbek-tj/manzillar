import { NextRequest, NextResponse } from 'next/server';

// Hardcoded credentials
const VALID_USERNAME = 'manzil';
const VALID_PASSWORD = 'manzilabc123';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate credentials
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Create session token (simple base64 encoded username)
      const sessionToken = Buffer.from(username).toString('base64');

      // Create response with success
      const response = NextResponse.json(
        { success: true, message: 'Login successful' },
        { status: 200 }
      );

      // Set HTTP-only cookie
      response.cookies.set('auth-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    } else {
      // Invalid credentials
      return NextResponse.json(
        { error: 'Login yoki parol noto\'g\'ri' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Server xatosi' },
      { status: 500 }
    );
  }
}
