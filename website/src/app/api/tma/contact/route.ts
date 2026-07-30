import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function POST(request: Request) {
  try {
    const { userId, messageText } = await request.json();

    if (!userId || !messageText) {
      return NextResponse.json({ error: 'userId and messageText required' }, { status: 400 });
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
