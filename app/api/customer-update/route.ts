import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// PUT: Update customer data (bypasses RLS)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableName, id, ...updateData } = body;

    // Validation
    if (!tableName || !id) {
      return NextResponse.json(
        { error: 'Missing required fields: tableName and id' },
        { status: 400 }
      );
    }

    // Allowed table names for security
    const allowedTables = [
      'customer_reactivation',
      'customer_retention',
      'customer_recommend',
      'customer_extra',
    ];

    if (!allowedTables.includes(tableName)) {
      return NextResponse.json(
        { error: `Invalid table name. Allowed: ${allowedTables.join(', ')}` },
        { status: 400 }
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    console.log('[API] Updating customer:', { tableName, id, updateData });

    // Use supabaseServer (service_role key) to bypass RLS
    const { data: updatedData, error } = await supabaseServer
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error(`[API] Failed to update ${tableName}:`, error);
      return NextResponse.json(
        { 
          error: `Failed to update ${tableName}`, 
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    if (!updatedData || updatedData.length === 0) {
      console.warn(`[API] Update returned no data for ${tableName}, id: ${id}`);
      return NextResponse.json(
        { 
          error: `No record found or updated for id: ${id}`,
          tableName,
          id,
        },
        { status: 404 }
      );
    }

    console.log(`[API] Successfully updated ${tableName}:`, updatedData);

    return NextResponse.json(
      { 
        success: true, 
        data: updatedData[0],
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error in PUT /api/customer-update:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
