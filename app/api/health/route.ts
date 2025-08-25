import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get environment info
    const environment = process.env.NODE_ENV || 'development';
    const timestamp = new Date().toISOString();
    
    return NextResponse.json({
      status: 'healthy',
      environment,
      timestamp,
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
    
  } finally {
    await prisma.$disconnect();
  }
}
