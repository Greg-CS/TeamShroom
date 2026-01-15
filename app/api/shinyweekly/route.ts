import { NextResponse } from 'next/server';
import { loadShinyWeekly } from '@/lib/data';

export async function GET() {
  try {
    const weeks = await loadShinyWeekly();
    return NextResponse.json(weeks);
  } catch (error) {
    console.error('Failed to load shiny weekly:', error);
    return NextResponse.json({ error: 'Failed to load shiny weekly' }, { status: 500 });
  }
}
