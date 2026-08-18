import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    mensagem: "Diagnóstico de Variáveis de Ambiente no Servidor",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET 
      ? `✅ Definida (Tamanho: ${process.env.NEXTAUTH_SECRET.length} caracteres)` 
      : "❌ NÃO ENCONTRADA OU VAZIA",
    
    DATABASE_URL: process.env.DATABASE_URL 
      ? "✅ Definida" 
      : "❌ NÃO ENCONTRADA OU VAZIA",
    
    NEXTAUTH_URL: process.env.NEXTAUTH_URL 
      ? `✅ Definida: ${process.env.NEXTAUTH_URL}` 
      : "❌ NÃO ENCONTRADA OU VAZIA",
  });
}
