/**
 * Test Data for E2E Tests
 *
 * Centralized test data for consistent E2E testing
 */

export const testData = {
  // Auth states storage paths
  authStates: {
    admin: 'src/tests/e2e/.auth/admin.json',
    advertiser: 'src/tests/e2e/.auth/advertiser.json',
    partner: 'src/tests/e2e/.auth/partner.json',
  },

  // Test users (for demo mode)
  users: {
    admin: {
      email: 'admin@cuanpintar.com',
      password: 'demo123',
      role: 'admin',
    },
    advertiser: {
      email: 'sarah@tunaiku.com',
      password: 'demo123',
      role: 'advertiser',
    },
    partner: {
      email: 'budi@jakselnews.com',
      password: 'demo123',
      role: 'partner',
    },
  },

  // Test advertisers
  advertisers: [
    {
      id: 'adv_1',
      name: 'Tunaiku',
      industry: 'Financial Services',
      email: 'sarah@tunaiku.com',
    },
    {
      id: 'adv_2',
      name: 'Prudential',
      industry: 'Insurance',
      email: 'marketing@prudential.co.id',
    },
  ],

  // Test partners
  partners: [
    {
      id: 'part_1',
      name: 'JakselNews Media Network',
      type: 'media',
      email: 'budi@jakselnews.com',
    },
    {
      id: 'part_2',
      name: 'Finance Creator Jakarta',
      type: 'creator',
      email: 'creator@finance.id',
    },
  ],

  // Test programs
  programs: [
    {
      id: 'prog_1',
      name: 'Tunaiku Download + Registration',
      advertiser: 'Tunaiku',
      payout: 25000,
      budget: 50000000,
    },
    {
      id: 'prog_2',
      name: 'PRULady Lead Form',
      advertiser: 'Prudential',
      payout: 50000,
      budget: 40000000,
    },
  ],

  // Test conversions
  conversions: [
    {
      id: 'conv_1',
      program: 'prog_1',
      partner: 'part_1',
      status: 'valid',
      payout: 25000,
    },
    {
      id: 'conv_2',
      program: 'prog_1',
      partner: 'part_2',
      status: 'pending',
      payout: 25000,
    },
    {
      id: 'conv_3',
      program: 'prog_2',
      partner: 'part_1',
      status: 'fraud',
      payout: 50000,
    },
  ],

  // Form test data
  forms: {
    newProgram: {
      name: 'E2E Test Program',
      description: 'Program created by automated E2E test',
      budget: '10000000',
      payout: '15000',
      targetVolume: '500',
    },
    payoutRequest: {
      amount: '500000',
      method: 'bank_transfer',
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolder: 'Test User',
    },
  },

  // Selectors for common elements
  selectors: {
    // Navigation
    sidebar: '[data-testid="sidebar"]',
    sidebarToggle: '[data-testid="sidebar-toggle"]',

    // Buttons
    primaryButton: 'button[type="submit"]',
    cancelButton: 'button:has-text("Cancel")',
    deleteButton: 'button:has-text("Delete")',

    // Forms
    form: 'form',
    input: 'input',
    select: 'select',
    textarea: 'textarea',

    // Tables
    table: 'table',
    tableRow: 'tbody tr',
    tableCell: 'td',

    // Feedback
    toast: '[data-testid="toast"]',
    alert: '[role="alert"]',
    loadingSpinner: '[data-testid="loading"]',

    // Modals
    modal: '[role="dialog"]',
    modalClose: 'button:has-text("Close")',
  },

  // Timeouts
  timeouts: {
    default: 10000,
    long: 30000,
    veryLong: 60000,
  },

  // Viewports
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    wide: { width: 1920, height: 1080 },
  },
};

export default testData;
