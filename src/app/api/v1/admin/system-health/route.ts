import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get system health metrics (mock data for demonstration)
    const systemMetrics = {
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        temperature: 45 + Math.random() * 20,
      },
      memory: {
        total: 16384,
        used: 8192 + Math.random() * 4096,
        available: 4096 - Math.random() * 2048,
        usage: 50 + Math.random() * 30,
      },
      disk: {
        total: 1000000,
        used: 600000 + Math.random() * 200000,
        available: 200000 - Math.random() * 100000,
        usage: 60 + Math.random() * 20,
      },
      network: {
        incoming: Math.random() * 50,
        outgoing: Math.random() * 30,
        latency: 20 + Math.random() * 60,
      },
      uptime: '15d 4h 23m',
      loadAverage: [1.0 + Math.random() * 0.5, 1.0 + Math.random() * 0.3, 1.0 + Math.random() * 0.2],
    };

    // Get service statuses
    const services = [
      {
        name: 'Web Server',
        status: Math.random() > 0.1 ? 'healthy' : 'warning',
        responseTime: 30 + Math.random() * 100,
        lastCheck: new Date().toISOString(),
        uptime: '15d 4h 23m',
        description: 'Main web application server',
      },
      {
        name: 'Database',
        status: Math.random() > 0.05 ? 'healthy' : 'warning',
        responseTime: 5 + Math.random() * 20,
        lastCheck: new Date().toISOString(),
        uptime: '15d 4h 23m',
        description: 'Primary database server',
      },
      {
        name: 'Redis Cache',
        status: Math.random() > 0.05 ? 'healthy' : 'warning',
        responseTime: 1 + Math.random() * 5,
        lastCheck: new Date().toISOString(),
        uptime: '15d 4h 23m',
        description: 'In-memory cache server',
      },
      {
        name: 'Email Service',
        status: Math.random() > 0.2 ? 'healthy' : 'warning',
        responseTime: 100 + Math.random() * 2000,
        lastCheck: new Date().toISOString(),
        uptime: '14d 22h 45m',
        description: 'Email delivery service',
      },
      {
        name: 'Payment Gateway',
        status: Math.random() > 0.1 ? 'healthy' : 'warning',
        responseTime: 100 + Math.random() * 300,
        lastCheck: new Date().toISOString(),
        uptime: '15d 4h 23m',
        description: 'Payment processing service',
      },
    ];

    // Get health stats
    const healthStats = {
      overallHealth: systemMetrics.cpu.usage < 80 && systemMetrics.memory.usage < 80 ? 'good' : 'fair',
      uptime: '15d 4h 23m',
      responseTime: 100 + Math.random() * 100,
      errorRate: Math.random() * 0.5,
      activeUsers: 1000 + Math.floor(Math.random() * 500),
      databaseConnections: 30 + Math.floor(Math.random() * 30),
      cacheHitRate: 90 + Math.random() * 9,
      queueLength: Math.floor(Math.random() * 20),
    };

    return NextResponse.json({
      metrics: systemMetrics,
      services,
      stats: healthStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}