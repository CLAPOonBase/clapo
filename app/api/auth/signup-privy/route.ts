import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🔄 Proxying signup request to backend:', {
      url: `${process.env.NEXT_PUBLIC_API_URL}/auth/signup/privy`,
      accountType: body.accountType,
      hasPrivyId: !!body.privyId,
      hasUsername: !!body.username,
      hasEmail: !!body.email,
      hasWallet: !!body.wallet,
      fullBody: body
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

    console.log('📡 Backend response status:', response.status);
    console.log('📡 Backend response headers:', Object.fromEntries(response.headers));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!isJson) {
      const text = await response.text();
      console.error('❌ Backend returned non-JSON response:', {
        status: response.status,
        contentType,
        bodyPreview: text.substring(0, 200)
      });

      let userMessage = 'The backend server is currently unavailable. Please try again later.';

      if (response.status === 503) {
        userMessage = 'The backend service is temporarily unavailable. Please try again in a few minutes.';
      } else if (response.status === 500) {
        userMessage = 'The backend server encountered an error. The development team has been notified.';
      } else if (response.status === 404) {
        userMessage = 'The signup endpoint was not found. Please contact support.';
      }

      return NextResponse.json(
        {
          message: userMessage,
          error: 'Backend service error',
          technicalDetails: {
            status: response.status,
            contentType: contentType,
            endpoint: `${process.env.NEXT_PUBLIC_API_URL}/auth/signup/privy`
          }
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Backend error:', {
        status: response.status,
        error: data,
        sentPayload: body
      });
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
