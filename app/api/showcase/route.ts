import { NextResponse } from 'next/server';
import { loadShowcase } from '@/lib/data';

export async function GET() {
  try {
    const showcase = await loadShowcase();
    return NextResponse.json(showcase);
  } catch (error) {
    console.error('Failed to load showcase:', error);
    return NextResponse.json({ error: 'Failed to load showcase' }, { status: 500 });
  }
}
