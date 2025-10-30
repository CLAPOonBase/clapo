import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🔄 Proxying signup request to backend:', {
      url: `${process.env.NEXT_PUBLIC_API_URL}/auth/signup/privy`,
      hasBody: !!body
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/signup/privy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Backend error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Signup successful:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to create account',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
