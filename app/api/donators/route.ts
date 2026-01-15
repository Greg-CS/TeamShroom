import { NextResponse } from 'next/server';
import { loadDonators } from '@/lib/data';

export async function GET() {
  try {
    const donators = await loadDonators();
    return NextResponse.json(donators);
  } catch (error) {
    console.error('Failed to load donators:', error);
    return NextResponse.json({ error: 'Failed to load donators' }, { status: 500 });
  }
}
