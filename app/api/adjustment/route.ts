import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET: Fetch all adjustments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month'); // Optional filter by month

    // Build query
    let query = supabaseServer
      .from('customer_adjustment')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by month if provided
    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API] Failed to fetch adjustments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch adjustments', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] }, { status: 200 });
  } catch (error) {
    console.error('[API] Error in GET /api/adjustment:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Insert new adjustment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, employee_name, squad, score, month } = body;

    // Validation
    if (!type || !squad || !score || !month) {
      return NextResponse.json(
        { error: 'Missing required fields: type, squad, score, month' },
        { status: 400 }
      );
    }

    if (type !== 'X-Arena' && type !== 'PK-Tracking') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "X-Arena" or "PK-Tracking"' },
        { status: 400 }
      );
    }

    if (type === 'X-Arena' && !employee_name) {
      return NextResponse.json(
        { error: 'employee_name is required for X-Arena type' },
        { status: 400 }
      );
    }

    if (score <= 0) {
      return NextResponse.json(
        { error: 'Score must be greater than 0' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      type,
      squad,
      score: parseFloat(score),
      month,
    };

    // Only add employee_name for X-Arena
    if (type === 'X-Arena' && employee_name) {
      insertData.employee_name = employee_name.trim();
    }

    // Use supabaseServer (service_role key) to bypass RLS
    const { data, error } = await supabaseServer
      .from('customer_adjustment')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[API] Failed to insert adjustment:', error);
      return NextResponse.json(
        { error: 'Failed to insert adjustment', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('[API] Error in POST /api/adjustment:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT: Update existing adjustment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, employee_name, squad, score, month } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    if (!type || !squad || !score || !month) {
      return NextResponse.json(
        { error: 'Missing required fields: type, squad, score, month' },
        { status: 400 }
      );
    }

    if (type !== 'X-Arena' && type !== 'PK-Tracking') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "X-Arena" or "PK-Tracking"' },
        { status: 400 }
      );
    }

    if (type === 'X-Arena' && !employee_name) {
      return NextResponse.json(
        { error: 'employee_name is required for X-Arena type' },
        { status: 400 }
      );
    }

    if (score <= 0) {
      return NextResponse.json(
        { error: 'Score must be greater than 0' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      type,
      squad,
      score: parseFloat(score),
      month,
    };

    // Only add employee_name for X-Arena
    if (type === 'X-Arena' && employee_name) {
      updateData.employee_name = employee_name.trim();
    } else if (type === 'PK-Tracking') {
      updateData.employee_name = null; // Clear employee_name for PK-Tracking
    }

    // Use supabaseServer (service_role key) to bypass RLS
    const { data, error } = await supabaseServer
      .from('customer_adjustment')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API] Failed to update adjustment:', error);
      return NextResponse.json(
        { error: 'Failed to update adjustment', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('[API] Error in PUT /api/adjustment:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete adjustment
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Use supabaseServer (service_role key) to bypass RLS
    const { error } = await supabaseServer
      .from('customer_adjustment')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API] Failed to delete adjustment:', error);
      return NextResponse.json(
        { error: 'Failed to delete adjustment', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[API] Error in DELETE /api/adjustment:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
