import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    url_status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    key_status: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    env_keys: Object.keys(process.env).filter(k => k.includes('SUPA') || k.includes('NEXT_PUBLIC'))
  });
}
