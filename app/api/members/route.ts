import { NextResponse } from 'next/server';
import { loadMembers } from '@/lib/data';

export async function GET() {
  try {
    const members = await loadMembers();
    return NextResponse.json(members);
  } catch (error) {
    console.error('Failed to load members:', error);
    return NextResponse.json({ error: 'Failed to load members' }, { status: 500 });
  }
}
