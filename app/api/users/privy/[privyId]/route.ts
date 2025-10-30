import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ privyId: string }> }
) {
  try {
    const { privyId } = await params;

    console.log('🔄 Checking user by Privy ID:', privyId);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/privy/${privyId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    console.log('✅ User lookup result:', data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ User lookup error:', error);
    return NextResponse.json(
      { exists: false, error: 'Failed to check user' },
      { status: 500 }
    );
  }
}
