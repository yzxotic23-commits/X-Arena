import { NextRequest, NextResponse } from 'next/server';
import { generateMockData } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || '123';
  const timeFilter = searchParams.get('timeFilter') || 'Daily';
  
  const data = generateMockData(userId, timeFilter);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(data);
}

