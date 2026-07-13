/**
 * Database Seed Script
 * Run with: npx tsx scripts/seed-database.ts
 *
 * This script seeds the Supabase database with comprehensive test data
 */

import { createClient } from '@supabase/supabase-js';

// Supabase connection
const supabaseUrl = 'https://vediyxsldxfptctwnnqh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGl5eHNsZHhmcHRjdHdubnFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU3OTI1NCwiZXhwIjoyMDk5MTU1MjU0fQ.l8bdJIbJlVKqekdlP8yBL5Mfl1ztYieNzWAFv-iftiw';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Helper to generate UUID
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to generate date in the past
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

// Helper to generate random IP
function randomIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Helper to generate random phone (Indonesian format)
function randomPhone(): string {
  const prefixes = ['0812', '0813', '0821', '0822', '0852', '0853', '0877', '0878', '0895', '0896'];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

async function seed() {
  console.log('🚀 Starting database seed...\n');

  // ============================================
  // 1. SEED USERS
  // ============================================
  console.log('📝 Seeding users...');

  const users = [
    // Admins
    { email: 'admin@cuanpintar.com', name: 'Admin User', role: 'admin', company: 'CuanPintar' },

    // Advertisers
    { email: 'sarah@tunaiku.com', name: 'Sarah Wijaya', role: 'advertiser', company: 'Tunaiku' },
    { email: 'marketing@prudential.co.id', name: 'Marketing Prudential', role: 'advertiser', company: 'Prudential Indonesia' },
    { email: 'rudi@xl.co.id', name: 'Rudi Hermawan', role: 'advertiser', company: 'XL Axiata' },
    { email: 'fani@astrapay.com', name: 'Fani Rahman', role: 'advertiser', company: 'AstraPay' },
    { email: 'galih@banksaqu.com', name: 'Galih Pratama', role: 'advertiser', company: 'Bank Saqu' },
    { email: 'hendra@pegadaian.co.id', name: 'Hendra Wijaya', role: 'advertiser', company: 'Pegadaian' },

    // Partners
    { email: 'budi@jakselnews.com', name: 'Budi Santoso', role: 'partner', company: 'JakselNews Media Network' },
    { email: 'media@detik.com', name: 'Media Detik', role: 'partner', company: 'Detik Finance' },
    { email: 'creator@finance.youtube', name: 'Finance Creator', role: 'partner', company: 'Finance Creator Channel' },
    { email: 'affiliate@budi.marketing', name: 'Budi Affiliate', role: 'partner', company: 'Budi Affiliate Network' },
    { email: 'dewi@financecreator.id', name: 'Dewi Kusuma', role: 'partner', company: 'Finance Creator Jakarta' },
    { email: 'ani@parenting.id', name: 'Ani Wulandari', role: 'partner', company: 'Parenting Community Indonesia' },
    { email: 'hendra@digitalmarket.id', name: 'Hendra Digital', role: 'partner', company: 'Digital Marketing Indonesia' },
    { email: 'rini@techreview.id', name: 'Rini Teknologi', role: 'partner', company: 'Tech Review Channel' },
  ];

  const userIds: Record<string, string> = {};

  for (const user of users) {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: user.email,
        name: user.name,
        role: user.role,
        password_hash: '$2a$10$demopasswordhash',
        is_active: true,
        email_verified: true,
      }, { onConflict: 'email' })
      .select('id')
      .single();

    if (error) {
      console.log(`  ⚠️ User ${user.email}: ${error.message}`);
    } else {
      userIds[user.email] = data.id;
      console.log(`  ✅ User: ${user.name} (${user.role})`);
    }
  }

  console.log('');

  // ============================================
  // 2. SEED ADVERTISERS
  // ============================================
  console.log('🏢 Seeding advertisers...');

  const advertisers = [
    { email: 'sarah@tunaiku.com', company: 'Tunaiku', industry: 'Financial Services', website: 'https://tunaiku.com', total_spend: 125000000 },
    { email: 'marketing@prudential.co.id', company: 'Prudential Indonesia', industry: 'Insurance', website: 'https://prudential.co.id', total_spend: 89000000 },
    { email: 'rudi@xl.co.id', company: 'XL Axiata', industry: 'Telecommunications', website: 'https://xl.co.id', total_spend: 67000000 },
    { email: 'fani@astrapay.com', company: 'AstraPay', industry: 'Fintech', website: 'https://astrapay.com', total_spend: 38000000 },
    { email: 'galih@banksaqu.com', company: 'Bank Saqu', industry: 'Banking', website: 'https://banksaqu.com', total_spend: 52000000 },
    { email: 'hendra@pegadaian.co.id', company: 'Pegadaian', industry: 'Financial Services', website: 'https://pegadaian.co.id', total_spend: 45000000 },
  ];

  const advertiserIds: Record<string, string> = {};

  for (const adv of advertisers) {
    if (!userIds[adv.email]) continue;

    const { data, error } = await supabase
      .from('advertisers')
      .upsert({
        user_id: userIds[adv.email],
        company_name: adv.company,
        industry: adv.industry,
        website: adv.website,
        status: 'active',
        total_spend: adv.total_spend,
        active_programs: 1,
      }, { onConflict: 'user_id' })
      .select('id')
      .single();

    if (error) {
      console.log(`  ⚠️ Advertiser ${adv.company}: ${error.message}`);
    } else {
      advertiserIds[adv.email] = data.id;
      console.log(`  ✅ Advertiser: ${adv.company}`);
    }
  }

  console.log('');

  // ============================================
  // 3. SEED PARTNERS
  // ============================================
  console.log('🤝 Seeding partners...');

  const partners = [
    { email: 'budi@jakselnews.com', name: 'JakselNews Media Network', type: 'media', niche: 'Lifestyle & Urban', location: 'Jakarta Selatan', audience: 2500000, quality: 92 },
    { email: 'media@detik.com', name: 'Detik Finance', type: 'media', niche: 'Finance & News', location: 'Jakarta', audience: 5000000, quality: 88 },
    { email: 'creator@finance.youtube', name: 'Finance Creator Channel', type: 'creator', niche: 'Finance & Investment', location: 'Online', audience: 800000, quality: 92 },
    { email: 'affiliate@budi.marketing', name: 'Budi Affiliate Network', type: 'affiliate', niche: 'Finance Products', location: 'Surabaya', audience: 150000, quality: 78 },
    { email: 'dewi@financecreator.id', name: 'Finance Creator Jakarta', type: 'creator', niche: 'Personal Finance', location: 'Jakarta', audience: 450000, quality: 85 },
    { email: 'ani@parenting.id', name: 'Parenting Community Indonesia', type: 'community', niche: 'Parenting & Family', location: 'Nasional', audience: 1200000, quality: 90 },
    { email: 'hendra@digitalmarket.id', name: 'Digital Marketing Indonesia', type: 'agency', niche: 'Digital Marketing', location: 'Jakarta', audience: 50000, quality: 82 },
    { email: 'rini@techreview.id', name: 'Tech Review Channel', type: 'creator', niche: 'Technology Reviews', location: 'Nasional', audience: 1200000, quality: 89 },
  ];

  const partnerIds: Record<string, string> = {};

  for (const partner of partners) {
    if (!userIds[partner.email]) continue;

    const earnings = Math.floor(Math.random() * 20000000);
    const conversions = Math.floor(earnings / 25000);

    const { data, error } = await supabase
      .from('partners')
      .upsert({
        user_id: userIds[partner.email],
        partner_name: partner.name,
        partner_type: partner.type,
        niche: partner.niche,
        location: partner.location,
        audience_size: partner.audience,
        quality_score: partner.quality,
        fraud_risk: 'low',
        status: 'active',
        total_earnings: earnings,
        total_paid: Math.floor(earnings * 0.7),
        pending_payout: Math.floor(earnings * 0.3),
        total_conversions: conversions,
        valid_conversions: Math.floor(conversions * 0.95),
      }, { onConflict: 'user_id' })
      .select('id')
      .single();

    if (error) {
      console.log(`  ⚠️ Partner ${partner.name}: ${error.message}`);
    } else {
      partnerIds[partner.email] = data.id;
      console.log(`  ✅ Partner: ${partner.name} (${partner.type})`);
    }
  }

  console.log('');

  // ============================================
  // 4. SEED PROGRAMS
  // ============================================
  console.log('📋 Seeding programs...');

  const programs = [
    { advertiser: 'sarah@tunaiku.com', name: 'Tunaiku Download + Registration', brand: 'Tunaiku', model: 'CPA', advertiser_price: 30000, partner_payout: 25000, budget: 50000000, volume: 2000, status: 'active' },
    { advertiser: 'sarah@tunaiku.com', name: 'Tunaiku KTA Promotion', brand: 'Tunaiku', model: 'CPA', advertiser_price: 75000, partner_payout: 50000, budget: 100000000, volume: 2000, status: 'active' },
    { advertiser: 'marketing@prudential.co.id', name: 'Prudential Proteksi Keluarga', brand: 'Prudential', model: 'CPL', advertiser_price: 100000, partner_payout: 75000, budget: 150000000, volume: 2000, status: 'active' },
    { advertiser: 'marketing@prudential.co.id', name: 'Prudential Critical Illness', brand: 'Prudential', model: 'CPA', advertiser_price: 150000, partner_payout: 100000, budget: 100000000, volume: 1000, status: 'active' },
    { advertiser: 'rudi@xl.co.id', name: 'XL Paket Data Promo', brand: 'XL Axiata', model: 'CPI', advertiser_price: 5000, partner_payout: 3000, budget: 75000000, volume: 10000, status: 'active' },
    { advertiser: 'fani@astrapay.com', name: 'AstraPay Cashback Campaign', brand: 'AstraPay', model: 'CPA', advertiser_price: 15000, partner_payout: 10000, budget: 50000000, volume: 5000, status: 'active' },
    { advertiser: 'galih@banksaqu.com', name: 'Bank Saqu Account Opening', brand: 'Bank Saqu', model: 'CPL', advertiser_price: 50000, partner_payout: 35000, budget: 80000000, volume: 3000, status: 'active' },
    { advertiser: 'hendra@pegadaian.co.id', name: 'Pegadaian Gadai Haji', brand: 'Pegadaian', model: 'CPL', advertiser_price: 80000, partner_payout: 60000, budget: 60000000, volume: 1500, status: 'active' },
  ];

  const programIds: string[] = [];

  for (const program of programs) {
    if (!advertiserIds[program.advertiser]) continue;

    const { data, error } = await supabase
      .from('programs')
      .upsert({
        advertiser_id: advertiserIds[program.advertiser],
        name: program.name,
        brand_name: program.brand,
        industry: 'Financial Services',
        payout_model: program.model,
        advertiser_price: program.advertiser_price,
        partner_payout: program.partner_payout,
        budget: program.budget,
        target_volume: program.volume,
        total_conversions: 0,
        valid_conversions: 0,
        status: program.status,
      }, { onConflict: 'name,advertiser_id' })
      .select('id')
      .single();

    if (error) {
      console.log(`  ⚠️ Program ${program.name}: ${error.message}`);
    } else {
      programIds.push(data.id);
      console.log(`  ✅ Program: ${program.name} (${program.model})`);
    }
  }

  console.log('');

  // ============================================
  // 5. SEED PAYMENT METHODS
  // ============================================
  console.log('💳 Seeding payment methods...');

  for (const partnerEmail of Object.keys(partnerIds)) {
    const partnerId = partnerIds[partnerEmail];

    // Add bank transfer
    await supabase.from('payment_methods').upsert({
      partner_id: partnerId,
      type: 'bank_transfer',
      bank_name: 'BCA',
      bank_code: 'BCA',
      account_number: '1234567890',
      account_holder: 'Account Holder',
      is_default: true,
      is_verified: true,
      verified_at: daysAgo(30),
    }, { onConflict: 'partner_id,type,bank_code' });

    // Add e-wallet (random)
    const ewallets = ['gopay', 'ovo', 'dana', 'linkaja'];
    const ewallet = ewallets[Math.floor(Math.random() * ewallets.length)];
    await supabase.from('payment_methods').upsert({
      partner_id: partnerId,
      type: ewallet as any,
      ewallet_number: randomPhone(),
      account_holder: 'Account Holder',
      is_default: false,
      is_verified: true,
      verified_at: daysAgo(30),
    }, { onConflict: 'partner_id,type' });

    console.log(`  ✅ Payment methods for partner`);
  }

  console.log('');

  // ============================================
  // 6. SEED TRACKING LINKS
  // ============================================
  console.log('🔗 Seeding tracking links...');

  for (const programId of programIds.slice(0, 4)) {
    for (const partnerId of Object.values(partnerIds).slice(0, 4)) {
      const uniqueCode = uuid().substring(0, 8);
      const clicks = Math.floor(Math.random() * 500) + 100;
      const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02));

      await supabase.from('tracking_links').upsert({
        partner_id: partnerId,
        program_id: programId,
        unique_code: uniqueCode,
        short_url: `https://cp.io/${uniqueCode}`,
        tracking_url: `https://vediyxsldxfptctwnnqh.supabase.co/track/${uniqueCode}`,
        is_active: true,
        total_clicks: clicks,
        total_conversions: conversions,
        valid_conversions: Math.floor(conversions * 0.9),
        total_payout: conversions * 25000,
      }, { onConflict: 'partner_id,program_id,unique_code' });
    }
  }

  console.log('  ✅ Tracking links created');
  console.log('');

  // ============================================
  // 7. SEED CLICKS
  // ============================================
  console.log('🖱️ Seeding clicks...');

  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const osList = ['Windows', 'macOS', 'Android', 'iOS'];
  const devices = ['desktop', 'mobile', 'tablet'];
  const channels = ['social_media', 'content', 'email', 'display'];

  for (let i = 0; i < 100; i++) {
    const programId = programIds[Math.floor(Math.random() * programIds.length)];
    const partnerId = Object.values(partnerIds)[Math.floor(Math.random() * Object.values(partnerIds).length)] as string;

    await supabase.from('clicks').insert({
      click_id: uuid(),
      partner_id: partnerId,
      program_id: programId,
      fingerprint: uuid(),
      ip_address: randomIP(),
      country: 'ID',
      city: ['Jakarta', 'Surabaya', 'Bandung', 'Medan'][Math.floor(Math.random() * 4)],
      device_type: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      os: osList[Math.floor(Math.random() * osList.length)],
      channel_type: channels[Math.floor(Math.random() * channels.length)],
      source_url: 'https://example.com/landing',
      referrer: 'https://google.com',
      utms: { source: 'google', medium: 'cpc', campaign: 'summer_sale' },
    });
  }

  console.log('  ✅ 100 clicks created');
  console.log('');

  // ============================================
  // 8. SEED CONVERSIONS
  // ============================================
  console.log('📈 Seeding conversions...');

  const statuses = ['pending', 'valid', 'valid', 'valid', 'rejected', 'fraud'];
  const conversionTypes = ['signup', 'registration', 'purchase', 'install'];

  for (let i = 0; i < 150; i++) {
    const programId = programIds[Math.floor(Math.random() * programIds.length)];
    const partnerId = Object.values(partnerIds)[Math.floor(Math.random() * Object.values(partnerIds).length)] as string;
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const payout = status === 'fraud' || status === 'rejected' ? 0 : Math.floor(Math.random() * 50000) + 10000;

    await supabase.from('conversions').insert({
      program_id: programId,
      partner_id: partnerId,
      channel_type: channels[Math.floor(Math.random() * channels.length)],
      conversion_type: conversionTypes[Math.floor(Math.random() * conversionTypes.length)],
      user_identifier: `user_${uuid().substring(0, 8)}@example.com`,
      fingerprint: uuid(),
      ip_address: randomIP(),
      quality_score: Math.floor(Math.random() * 30) + 70,
      fraud_score: status === 'fraud' ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20),
      fraud_signals: status === 'fraud' ? ['duplicate_ip', 'suspicious_velocity'] : null,
      status: status,
      payout_amount: payout,
      view_through: Math.random() > 0.7,
      utms: { source: 'google', campaign: 'summer_2024' },
      created_at: daysAgo(Math.floor(Math.random() * 30)),
    });
  }

  console.log('  ✅ 150 conversions created');
  console.log('');

  // ============================================
  // 9. SEED PAYOUTS
  // ============================================
  console.log('💰 Seeding payouts...');

  for (const partnerEmail of Object.keys(partnerIds).slice(0, 6)) {
    const partnerId = partnerIds[partnerEmail];
    const amount = Math.floor(Math.random() * 5000000) + 500000;
    const platformFee = Math.floor(amount * 0.1);
    const status = ['pending', 'approved', 'processing', 'paid'][Math.floor(Math.random() * 4)] as any;

    await supabase.from('payouts').insert({
      partner_id: partnerId,
      amount: amount,
      platform_fee: platformFee,
      net_amount: amount - platformFee,
      status: status,
      payment_method: 'bank_transfer',
      approved_conversions: Math.floor(Math.random() * 20) + 5,
      transaction_id: status === 'paid' ? `TXN${uuid().substring(0, 12).toUpperCase()}` : null,
    });
  }

  console.log('  ✅ Payouts created');
  console.log('');

  // ============================================
  // 10. SEED WEBHOOKS
  // ============================================
  console.log('🪝 Seeding webhooks...');

  if (userIds['admin@cuanpintar.com']) {
    await supabase.from('webhooks').insert([
      {
        user_id: userIds['admin@cuanpintar.com'],
        name: 'Prudential Webhook',
        url: 'https://prudential.co.id/webhooks/cuanpintar',
        secret: 'whsec_prudential_secret_key_123',
        events: ['conversion.created', 'conversion.validated', 'payout.approved'],
        active: true,
        total_deliveries: 45,
        success_rate: 97.8,
        failed_deliveries: 1,
      },
      {
        user_id: userIds['admin@cuanpintar.com'],
        name: 'Tunaiku Webhook',
        url: 'https://tunaiku.com/api/webhooks/affiliate',
        secret: 'whsec_tunaiku_secret_key_456',
        events: ['conversion.created', 'conversion.validated'],
        active: true,
        total_deliveries: 123,
        success_rate: 99.2,
        failed_deliveries: 1,
      },
    ]);
  }

  console.log('  ✅ Webhooks created');
  console.log('');

  // ============================================
  // 11. SEED SUPPORT TICKETS
  // ============================================
  console.log('🎫 Seeding support tickets...');

  const ticketSubjects = [
    'Conversion not credited',
    'Payment pending for 5 days',
    'API integration question',
    'Account verification issue',
    'Payout amount discrepancy',
  ];

  for (let i = 0; i < 5; i++) {
    const userId = Object.values(userIds)[Math.floor(Math.random() * Object.values(userIds).length)] as string;

    await supabase.from('support_tickets').insert({
      user_id: userId,
      ticket_number: `TKT-${Date.now().toString(36).toUpperCase()}`,
      subject: ticketSubjects[i],
      category: ['billing', 'account', 'technical', 'payout'][Math.floor(Math.random() * 4)] as any,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      status: ['open', 'pending', 'in_progress'][Math.floor(Math.random() * 3)] as any,
    });
  }

  console.log('  ✅ Support tickets created');
  console.log('');

  // ============================================
  // 12. SEED ANNOUNCEMENTS
  // ============================================
  console.log('📢 Seeding announcements...');

  await supabase.from('announcements').insert([
    {
      title: 'Platform Maintenance',
      content: 'Scheduled maintenance on July 15, 2024 from 02:00-04:00 WIB.',
      type: 'info',
      target_roles: null,
      is_published: true,
      is_dismissible: true,
      published_at: daysAgo(1),
    },
    {
      title: 'New Payout Options Available',
      content: 'We now support DANA and LinkAja for faster payouts!',
      type: 'success',
      target_roles: ['partner'],
      is_published: true,
      is_dismissible: true,
      published_at: daysAgo(3),
    },
  ]);

  console.log('  ✅ Announcements created');
  console.log('');

  // ============================================
  // 13. SEED FRAUD BLOCKLIST
  // ============================================
  console.log('🚫 Seeding fraud blocklist...');

  await supabase.from('fraud_blocklist').insert([
    { type: 'ip', value: '192.168.1.100', reason: 'Test IP', is_active: true },
    { type: 'ip', value: '10.0.0.50', reason: 'Known VPN exit node', is_active: true },
    { type: 'email_domain', value: 'tempmail.com', reason: 'Disposable email provider', is_active: true },
    { type: 'device', value: 'blocked-device-001', reason: 'Fraudulent device', is_active: true },
  ]);

  console.log('  ✅ Fraud blocklist entries created');
  console.log('');

  // ============================================
  // 14. SEED USER PREFERENCES
  // ============================================
  console.log('⚙️ Seeding user preferences...');

  for (const userId of Object.values(userIds)) {
    await supabase.from('user_preferences').upsert({
      user_id: userId as string,
      theme: 'system',
      language: 'id',
      timezone: 'Asia/Jakarta',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
    }, { onConflict: 'user_id' });
  }

  console.log('  ✅ User preferences created');
  console.log('');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database seeding completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Summary:');
  console.log(`  • Users: ${Object.keys(userIds).length}`);
  console.log(`  • Advertisers: ${Object.keys(advertiserIds).length}`);
  console.log(`  • Partners: ${Object.keys(partnerIds).length}`);
  console.log(`  • Programs: ${programIds.length}`);
  console.log(`  • Clicks: 100`);
  console.log(`  • Conversions: 150`);
  console.log('');
  console.log('Demo Accounts:');
  console.log('  Admin: admin@cuanpintar.com');
  console.log('  Advertiser: sarah@tunaiku.com');
  console.log('  Partner: budi@jakselnews.com');
  console.log('');
}

// Run seed
seed().catch(console.error);
