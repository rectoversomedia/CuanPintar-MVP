/**
 * CuanPintar - Auth Module
 * Phase 1: Auth & Identity
 *
 * Re-exports all auth utilities
 */

export * from './password';
export * from './totp';
export { logAuthEvent, logLoginSuccess, logLoginFailed, logAccountLocked, log2FASuccess, log2FAFailed, logSessionCreated, logSessionRevoked, logSuspiciousActivity, getUserAuditLogs, getClientIP, parseUserAgent, generateFingerprint } from './audit';
export { createSession, validateSession, getUserSessions, revokeSession, revokeAllSessions, revokeSessionsByIP, cleanupExpiredSessions, getSessionCount, isMultiDeviceLogin } from './sessions';
export { has2FAEnabled, get2FAMethods, setupTOTP, verifyAndEnableTOTP, verify2FAForLogin, verifyRecoveryCode as verify2FARecoveryCode, disable2FA, getRecoveryCodesCount, regenerateRecoveryCodes } from './two-factor';
