import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    console.log('🔄 Checking username availability:', username);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/check-username/${username}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    console.log('✅ Username check result:', data);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Username check error:', error);
    // If endpoint doesn't exist, assume available
    return NextResponse.json({ available: true }, { status: 200 });
  }
}
