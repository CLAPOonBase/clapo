import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');

  console.log('🔍 Twitter API route called');
  console.log('🔍 Access token provided:', accessToken ? 'YES' : 'NO');

  if (!accessToken) {
    console.error('🔍 Error: Access token is required');
    return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
  }

  try {
    console.log('🔍 Making request to Twitter API...');
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 Twitter API response status:', response.status);
    console.log('🔍 Twitter API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Twitter API error response:', errorText);
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 Raw Twitter API response:', data);
    
    const processedData = {
      success: true,
      data: {
        id: data.data.id,
        username: data.data.username,
        name: data.data.name,
        description: data.data.description,
        profile_image_url: data.data.profile_image_url,
        verified: data.data.verified,
        followers_count: data.data.public_metrics?.followers_count,
        following_count: data.data.public_metrics?.following_count,
        tweet_count: data.data.public_metrics?.tweet_count,
      }
    };
    
    console.log('🔍 Processed Twitter data:', processedData);
    return NextResponse.json(processedData);
  } catch (error) {
    console.error('🔍 Error fetching Twitter user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twitter user details' },
      { status: 500 }
    );
  }
} 