import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const settingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  siteUrl: z.string().url(),
  adminEmail: z.string().email(),
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
  emailVerification: z.boolean(),
  defaultUserRole: z.enum(['USER', 'EDITOR', 'MANAGER']),
  sessionTimeout: z.number().min(300).max(86400),
  maxUploadSize: z.number().min(1).max(100),
  allowedFileTypes: z.array(z.string()),
  currency: z.string().min(3).max(3),
  timezone: z.string(),
  language: z.string().min(2).max(2),
});

const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1),
  smtpPort: z.number().min(1).max(65535),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  fromEmail: z.string().email(),
  fromName: z.string().min(1),
  encryption: z.enum(['tls', 'ssl', 'none']),
});

const paymentSettingsSchema = z.object({
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
  currency: z.string().min(3).max(3),
});

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

    // Get settings from database or return defaults
    const systemSettings = await db.systemSettings.findMany();

    // Group settings by category
    const settingsByCategory = systemSettings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = setting.value;
      return acc;
    }, {} as Record<string, Record<string, string>>);

    const emailSettings = settingsByCategory.email || {};
    const paymentSettings = settingsByCategory.payment || {};
    const generalSettings = settingsByCategory.general || {};

    return NextResponse.json({
      system: {
        siteName: generalSettings.siteName || 'Canvas Hub',
        siteUrl: generalSettings.siteUrl || 'https://canvashub.com',
        adminEmail: generalSettings.adminEmail || 'admin@canvashub.com',
        maintenanceMode: generalSettings.maintenanceMode === 'true' || false,
        allowRegistration: generalSettings.allowRegistration !== 'false',
        emailVerification: generalSettings.emailVerification !== 'false',
        defaultUserRole: generalSettings.defaultUserRole || 'USER',
        sessionTimeout: parseInt(generalSettings.sessionTimeout) || 3600,
        maxUploadSize: parseInt(generalSettings.maxUploadSize) || 10,
        allowedFileTypes: generalSettings.allowedFileTypes ? JSON.parse(generalSettings.allowedFileTypes) : ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        currency: generalSettings.currency || 'USD',
        timezone: generalSettings.timezone || 'UTC',
        language: generalSettings.language || 'en',
      },
      email: {
        smtpHost: emailSettings.smtpHost || 'smtp.gmail.com',
        smtpPort: parseInt(emailSettings.smtpPort) || 587,
        smtpUsername: emailSettings.smtpUsername || '',
        smtpPassword: emailSettings.smtpPassword || '',
        fromEmail: emailSettings.fromEmail || 'noreply@canvashub.com',
        fromName: emailSettings.fromName || 'Canvas Hub',
        encryption: emailSettings.encryption || 'tls',
      },
      payment: {
        stripePublicKey: paymentSettings.stripePublicKey || '',
        stripeSecretKey: paymentSettings.stripeSecretKey || '',
        stripeWebhookSecret: paymentSettings.stripeWebhookSecret || '',
        paypalClientId: paymentSettings.paypalClientId || '',
        paypalClientSecret: paymentSettings.paypalClientSecret || '',
        currency: paymentSettings.currency || 'USD',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { type, settings } = body;

    let category: string;
    let validatedData: any;

    switch (type) {
      case 'system':
        category = 'general';
        validatedData = settingsSchema.parse(settings);
        break;

      case 'email':
        category = 'email';
        validatedData = emailSettingsSchema.parse(settings);
        break;

      case 'payment':
        category = 'payment';
        validatedData = paymentSettingsSchema.parse(settings);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid settings type' },
          { status: 400 }
        );
    }

    // Update settings in SystemSettings table
    const updatePromises = Object.entries(validatedData).map(([key, value]) =>
      db.systemSettings.upsert({
        where: {
          key_category: {
            key,
            category,
          },
        },
        update: {
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        },
        create: {
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          category,
          description: `${type} setting: ${key}`,
        },
      })
    );

    await Promise.all(updatePromises);

    // Log settings change
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'SETTINGS_UPDATED',
        entityType: 'SystemSettings',
        entityId: type,
        newValues: JSON.stringify({
          type,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: validatedData,
    });
  } catch (error) {
    console.error('Error updating settings:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}