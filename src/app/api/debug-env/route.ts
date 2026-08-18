import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: "DIAGNÓSTICO CONCLUÍDO",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET 
        ? `✅ SALVA (Tamanho: ${process.env.NEXTAUTH_SECRET.length} caracteres)` 
        : "❌ NÃO ENCONTRADA OU VAZIA NO VERCEL",
      
      DATABASE_URL: process.env.DATABASE_URL 
        ? "✅ SALVA" 
        : "❌ NÃO ENCONTRADA OU VAZIA NO VERCEL",
      
      NEXTAUTH_URL: process.env.NEXTAUTH_URL 
        ? `✅ SALVA: ${process.env.NEXTAUTH_URL}` 
        : "❌ NÃO ENCONTRADA OU VAZIA NO VERCEL",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
