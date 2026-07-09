/**
 * CuanPintar - Wallet Service
 * Phase 2: Payments & Billing
 *
 * Wallet operations for advertisers and partners
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type WalletType = 'advertiser' | 'partner';
export type TransactionType = 'topup' | 'withdrawal' | 'earning' | 'payout' | 'refund' | 'fee' | 'adjustment' | 'charge';

export interface Wallet {
  id: string;
  owner_id: string;
  owner_type: WalletType;
  currency: string;
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  total_spent: number;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  fee: number;
  net_amount: number;
  reference_type?: string;
  reference_id?: string;
  description?: string;
  idempotency_key?: string;
  created_at: string;
}

export interface WalletResult {
  success: boolean;
  wallet?: Wallet;
  transaction?: WalletTransaction;
  error?: string;
}

/**
 * Get wallet by owner ID
 */
export async function getWallet(ownerId: string, ownerType: WalletType): Promise<Wallet | null> {
  if (!isSupabaseConfigured()) {
    // Demo mode
    return {
      id: 'demo-wallet',
      owner_id: ownerId,
      owner_type: ownerType,
      currency: 'IDR',
      balance: ownerType === 'partner' ? 5000000 : 100000000,
      pending_balance: 0,
      total_earned: 7500000,
      total_withdrawn: 2500000,
      total_spent: 0,
    };
  }

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('owner_type', ownerType)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Wallet;
}

/**
 * Create a new wallet
 */
export async function createWallet(ownerId: string, ownerType: WalletType): Promise<Wallet | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: 'demo-wallet-' + Date.now(),
      owner_id: ownerId,
      owner_type: ownerType,
      currency: 'IDR',
      balance: 0,
      pending_balance: 0,
      total_earned: 0,
      total_withdrawn: 0,
      total_spent: 0,
    };
  }

  const { data, error } = await supabase
    .from('wallets')
    .insert({
      owner_id: ownerId,
      owner_type: ownerType,
      currency: 'IDR',
      balance: 0,
      pending_balance: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create wallet:', error);
    return null;
  }

  return data as Wallet;
}

/**
 * Get or create wallet
 */
export async function getOrCreateWallet(ownerId: string, ownerType: WalletType): Promise<Wallet | null> {
  let wallet = await getWallet(ownerId, ownerType);

  if (!wallet) {
    wallet = await createWallet(ownerId, ownerType);
  }

  return wallet;
}

/**
 * Add funds to wallet (advertiser topup)
 */
export async function topupWallet(
  walletId: string,
  amount: number,
  options?: {
    idempotencyKey?: string;
    referenceType?: string;
    referenceId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<WalletResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      wallet: {
        id: walletId,
        owner_id: 'demo',
        owner_type: 'advertiser',
        currency: 'IDR',
        balance: amount,
        pending_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        total_spent: 0,
      },
    };
  }

  try {
    // Get current wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (walletError || !wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    const balanceBefore = Number(wallet.balance);
    const balanceAfter = balanceBefore + amount;

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        type: 'topup',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        fee: 0,
        net_amount: amount,
        reference_type: options?.referenceType || 'manual',
        reference_id: options?.referenceId,
        description: options?.description || 'Wallet topup',
        idempotency_key: options?.idempotencyKey,
        metadata: options?.metadata || null,
      })
      .select()
      .single();

    if (txError) {
      if (txError.code === '23505') {
        return { success: false, error: 'Duplicate transaction' };
      }
      console.error('Failed to create transaction:', txError);
      return { success: false, error: 'Failed to process topup' };
    }

    // Update wallet balance (trigger handles this, but let's be explicit)
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallets')
      .update({
        balance: balanceAfter,
        total_earned: Number(wallet.total_earned) + amount,
      })
      .eq('id', walletId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update wallet:', updateError);
      return { success: false, error: 'Failed to update balance' };
    }

    return {
      success: true,
      wallet: updatedWallet as Wallet,
      transaction: transaction as WalletTransaction,
    };
  } catch (err) {
    console.error('Topup error:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Deduct from wallet (advertiser charge for conversions)
 */
export async function chargeWallet(
  walletId: string,
  amount: number,
  options?: {
    idempotencyKey?: string;
    referenceType?: string;
    referenceId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<WalletResult> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    // Get current wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (walletError || !wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    const balanceBefore = Number(wallet.balance);

    // Check sufficient balance
    if (balanceBefore < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    const balanceAfter = balanceBefore - amount;

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        type: 'charge',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        fee: 0,
        net_amount: amount,
        reference_type: options?.referenceType || 'conversion',
        reference_id: options?.referenceId,
        description: options?.description || 'Conversion charge',
        idempotency_key: options?.idempotencyKey,
        metadata: options?.metadata || null,
      })
      .select()
      .single();

    if (txError) {
      if (txError.code === '23505') {
        return { success: false, error: 'Duplicate transaction' };
      }
      console.error('Failed to create transaction:', txError);
      return { success: false, error: 'Failed to process charge' };
    }

    // Update wallet balance
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallets')
      .update({
        balance: balanceAfter,
        total_spent: Number(wallet.total_spent) + amount,
      })
      .eq('id', walletId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: 'Failed to update balance' };
    }

    return {
      success: true,
      wallet: updatedWallet as Wallet,
      transaction: transaction as WalletTransaction,
    };
  } catch (err) {
    console.error('Charge error:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Add earnings to partner wallet
 */
export async function addEarning(
  walletId: string,
  amount: number,
  options?: {
    idempotencyKey?: string;
    referenceType?: string;
    referenceId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<WalletResult> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (walletError || !wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    const balanceBefore = Number(wallet.pending_balance);
    const pendingAfter = balanceBefore + amount;

    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        type: 'earning',
        amount,
        balance_before: balanceBefore,
        balance_after: pendingAfter,
        fee: 0,
        net_amount: amount,
        reference_type: options?.referenceType || 'conversion',
        reference_id: options?.referenceId,
        description: options?.description || 'Conversion earning',
        idempotency_key: options?.idempotencyKey,
        metadata: options?.metadata || null,
      })
      .select()
      .single();

    if (txError) {
      if (txError.code === '23505') {
        return { success: false, error: 'Duplicate transaction' };
      }
      return { success: false, error: 'Failed to record earning' };
    }

    await supabase
      .from('wallets')
      .update({
        pending_balance: pendingAfter,
        total_earned: Number(wallet.total_earned) + amount,
      })
      .eq('id', walletId);

    return {
      success: true,
      transaction: transaction as WalletTransaction,
    };
  } catch (err) {
    console.error('Earning error:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Release pending earnings to available balance (after validation)
 */
export async function releaseEarnings(
  walletId: string,
  amount: number,
  options?: {
    referenceType?: string;
    referenceId?: string;
  }
): Promise<WalletResult> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .single();

    if (error || !wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    if (Number(wallet.pending_balance) < amount) {
      return { success: false, error: 'Insufficient pending balance' };
    }

    const newPending = Number(wallet.pending_balance) - amount;
    const newBalance = Number(wallet.balance) + amount;

    await supabase
      .from('wallets')
      .update({
        pending_balance: newPending,
        balance: newBalance,
      })
      .eq('id', walletId);

    await supabase.from('wallet_transactions').insert({
      wallet_id: walletId,
      type: 'adjustment',
      amount,
      balance_before: Number(wallet.balance),
      balance_after: newBalance,
      fee: 0,
      net_amount: amount,
      reference_type: options?.referenceType,
      reference_id: options?.referenceId,
      description: 'Earnings released to balance',
    });

    return { success: true };
  } catch (err) {
    console.error('Release earnings error:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Get wallet transactions with pagination
 */
export async function getWalletTransactions(
  walletId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: TransactionType;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<{ transactions: WalletTransaction[]; total: number }> {
  if (!isSupabaseConfigured()) {
    return { transactions: [], total: 0 };
  }

  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  let query = supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact' })
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.dateFrom) {
    query = query.gte('created_at', options.dateFrom);
  }

  if (options?.dateTo) {
    query = query.lte('created_at', options.dateTo);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to get transactions:', error);
    return { transactions: [], total: 0 };
  }

  return {
    transactions: (data || []) as WalletTransaction[],
    total: count || 0,
  };
}

/**
 * Check if wallet has sufficient balance
 */
export async function hasSufficientBalance(
  walletId: string,
  amount: number
): Promise<boolean> {
  const wallet = await getWallet(walletId.split('-')[0], 'advertiser');
  if (!wallet) return false;
  return wallet.balance >= amount;
}

export default {
  getWallet,
  createWallet,
  getOrCreateWallet,
  topupWallet,
  chargeWallet,
  addEarning,
  releaseEarnings,
  getWalletTransactions,
  hasSufficientBalance,
};
