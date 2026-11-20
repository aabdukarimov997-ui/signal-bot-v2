import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';
import { getAuthenticatedUser, getInitDataFromRequest } from '@/lib/tma/verify';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUser(getInitDataFromRequest(request));
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const userId = auth.user.id;

    const { messageText } = await request.json();

    if (!messageText) {
      return NextResponse.json({ error: 'messageText required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO ${TABLES.contactMessages} (user_id, message_text, is_read, created_at)
       VALUES ($1, $2, false, NOW())
       RETURNING *`,
      [userId, messageText]
    );

    return NextResponse.json({ message: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create contact message:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}