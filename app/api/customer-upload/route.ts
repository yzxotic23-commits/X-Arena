import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// POST: Bulk insert customer data (bypasses RLS)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableName, data } = body;

    // Validation
    if (!tableName || !data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: tableName and data (array)' },
        { status: 400 }
      );
    }

    // Allowed table names for security
    const allowedTables = [
      'customer_reactivation',
      'customer_retention',
      'customer_recommend',
      'customer_extra',
      'customer_adjustment'
    ];

    if (!allowedTables.includes(tableName)) {
      return NextResponse.json(
        { error: `Invalid table name. Allowed: ${allowedTables.join(', ')}` },
        { status: 400 }
      );
    }

    // Use supabaseServer (service_role key) to bypass RLS
    const { data: insertedData, error } = await supabaseServer
      .from(tableName)
      .insert(data)
      .select();

    if (error) {
      console.error(`[API] Failed to insert into ${tableName}:`, error);
      return NextResponse.json(
        { error: `Failed to upload to ${tableName}`, details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data: insertedData,
        count: insertedData?.length || 0
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error in POST /api/customer-upload:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
