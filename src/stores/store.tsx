/**
 * Unified App Store
 *
 * Centralized state management combining:
 * - UI State (sidebar, modals, toasts)
 * - App State (demo mode, selections, filters)
 * - Auth State (user, loading, authenticated)
 */

'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode, Dispatch } from 'react';

// ============================================
// TYPES
// ============================================

// UI State
export interface UIState {
  sidebarCollapsed: boolean;
  notificationsOpen: boolean;
  modalOpen: string | null;
  toast: ToastState;
}

export interface ToastPayload {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface ToastState extends ToastPayload {
  show: boolean;
}

// App State
export interface AppState {
  isDemoMode: boolean;
  selectedPartnerId: string | null;
  selectedProgramId: string | null;
  dateRange: DateRange;
  filters: Record<string, string | null>;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

// Auth State
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'advertiser' | 'partner' | 'admin';
  companyName?: string;
  avatar?: string;
  phone?: string;
  status?: 'active' | 'pending' | 'suspended';
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Combined State
export interface StoreState extends UIState, AppState, AuthState {}

// ============================================
// ACTIONS
// ============================================

type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'SET_NOTIFICATIONS_OPEN'; payload: boolean }
  | { type: 'OPEN_MODAL'; payload: string }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SHOW_TOAST'; payload: ToastPayload }
  | { type: 'HIDE_TOAST' };

type AppAction =
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'SET_SELECTED_PARTNER'; payload: string | null }
  | { type: 'SET_SELECTED_PROGRAM'; payload: string | null }
  | { type: 'SET_DATE_RANGE'; payload: DateRange }
  | { type: 'SET_FILTER'; payload: { key: string; value: string | null } }
  | { type: 'CLEAR_FILTERS' };

type AuthAction =
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGOUT' };

type StoreAction = UIAction | AppAction | AuthAction;

// ============================================
// REDUCERS
// ============================================

const initialUIState: UIState = {
  sidebarCollapsed: false,
  notificationsOpen: false,
  modalOpen: null,
  toast: {
    show: false,
    message: '',
    type: 'info',
  },
};

const initialAppState: AppState = {
  isDemoMode: true,
  selectedPartnerId: null,
  selectedProgramId: null,
  dateRange: {
    from: null,
    to: null,
  },
  filters: {},
};

const initialAuthState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_SIDEBAR':
      return { ...state, sidebarCollapsed: action.payload };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notificationsOpen: !state.notificationsOpen };
    case 'SET_NOTIFICATIONS_OPEN':
      return { ...state, notificationsOpen: action.payload };
    case 'OPEN_MODAL':
      return { ...state, modalOpen: action.payload };
    case 'CLOSE_MODAL':
      return { ...state, modalOpen: null };
    case 'SHOW_TOAST':
      return { ...state, toast: { ...action.payload, show: true } };
    case 'HIDE_TOAST':
      return { ...state, toast: { ...state.toast, show: false } };
    default:
      return state;
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DEMO_MODE':
      return { ...state, isDemoMode: action.payload };
    case 'SET_SELECTED_PARTNER':
      return { ...state, selectedPartnerId: action.payload };
    case 'SET_SELECTED_PROGRAM':
      return { ...state, selectedProgramId: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'CLEAR_FILTERS':
      return { ...state, filters: {} };
    default:
      return state;
  }
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

function combinedReducer(state: StoreState, action: StoreAction): StoreState {
  return {
    // UI State
    ...uiReducer(
      {
        sidebarCollapsed: state.sidebarCollapsed,
        notificationsOpen: state.notificationsOpen,
        modalOpen: state.modalOpen,
        toast: state.toast,
      },
      action as UIAction
    ),
    // App State
    ...appReducer(
      {
        isDemoMode: state.isDemoMode,
        selectedPartnerId: state.selectedPartnerId,
        selectedProgramId: state.selectedProgramId,
        dateRange: state.dateRange,
        filters: state.filters,
      },
      action as AppAction
    ),
    // Auth State
    ...authReducer(
      {
        user: state.user,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
      },
      action as AuthAction
    ),
  };
}

// ============================================
// CONTEXT
// ============================================

interface StoreContextType {
  // State
  state: StoreState;
  dispatch: Dispatch<StoreAction>;

  // UI Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleNotifications: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  showToast: (message: string, type?: ToastState['type']) => void;
  hideToast: () => void;

  // App Actions
  setDemoMode: (isDemo: boolean) => void;
  selectPartner: (partnerId: string | null) => void;
  selectProgram: (programId: string | null) => void;
  setDateRange: (from: Date | null, to: Date | null) => void;
  setFilter: (key: string, value: string | null) => void;
  clearFilters: () => void;

  // Auth Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialState: StoreState = {
  ...initialUIState,
  ...initialAppState,
  ...initialAuthState,
};

// ============================================
// PROVIDER
// ============================================

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(combinedReducer, initialState);

  // UI Actions
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const setSidebarCollapsed = useCallback(
    (collapsed: boolean) => dispatch({ type: 'SET_SIDEBAR', payload: collapsed }),
    []
  );
  const toggleNotifications = useCallback(() => dispatch({ type: 'TOGGLE_NOTIFICATIONS' }), []);
  const openModal = useCallback(
    (modalId: string) => dispatch({ type: 'OPEN_MODAL', payload: modalId }),
    []
  );
  const closeModal = useCallback(() => dispatch({ type: 'CLOSE_MODAL' }), []);
  const showToast = useCallback(
    (message: string, type: ToastState['type'] = 'info') => {
      dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
      setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 5000);
    },
    []
  );
  const hideToast = useCallback(() => dispatch({ type: 'HIDE_TOAST' }), []);

  // App Actions
  const setDemoMode = useCallback(
    (isDemo: boolean) => dispatch({ type: 'SET_DEMO_MODE', payload: isDemo }),
    []
  );
  const selectPartner = useCallback(
    (partnerId: string | null) =>
      dispatch({ type: 'SET_SELECTED_PARTNER', payload: partnerId }),
    []
  );
  const selectProgram = useCallback(
    (programId: string | null) =>
      dispatch({ type: 'SET_SELECTED_PROGRAM', payload: programId }),
    []
  );
  const setDateRange = useCallback(
    (from: Date | null, to: Date | null) =>
      dispatch({ type: 'SET_DATE_RANGE', payload: { from, to } }),
    []
  );
  const setFilter = useCallback(
    (key: string, value: string | null) =>
      dispatch({ type: 'SET_FILTER', payload: { key, value } }),
    []
  );
  const clearFilters = useCallback(() => dispatch({ type: 'CLEAR_FILTERS' }), []);

  // Auth Actions
  const setUser = useCallback(
    (user: AuthUser | null) => dispatch({ type: 'SET_USER', payload: user }),
    []
  );
  const setLoading = useCallback(
    (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    []
  );
  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('cp_user');
    localStorage.removeItem('cp_session');
  }, []);

  const value: StoreContextType = {
    state,
    dispatch,
    toggleSidebar,
    setSidebarCollapsed,
    toggleNotifications,
    openModal,
    closeModal,
    showToast,
    hideToast,
    setDemoMode,
    selectPartner,
    selectProgram,
    setDateRange,
    setFilter,
    clearFilters,
    setUser,
    setLoading,
    logout,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// ============================================
// HOOKS
// ============================================

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// Convenience hooks for specific state slices
export function useUI() {
  const { state, toggleSidebar, setSidebarCollapsed, toggleNotifications, openModal, closeModal, showToast, hideToast } = useStore();
  return {
    ...state,
    toggleSidebar,
    setSidebarCollapsed,
    toggleNotifications,
    openModal,
    closeModal,
    showToast,
    hideToast,
  };
}

export function useApp() {
  const { state, setDemoMode, selectPartner, selectProgram, setDateRange, setFilter, clearFilters } = useStore();
  return {
    isDemoMode: state.isDemoMode,
    selectedPartnerId: state.selectedPartnerId,
    selectedProgramId: state.selectedProgramId,
    dateRange: state.dateRange,
    filters: state.filters,
    setDemoMode,
    selectPartner,
    selectProgram,
    setDateRange,
    setFilter,
    clearFilters,
  };
}

export function useAuthStore() {
  const { state, setUser, setLoading, logout } = useStore();
  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    setUser,
    setLoading,
    logout,
  };
}
