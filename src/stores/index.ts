/**
 * Stores
 *
 * Global state management using React Context
 */

'use client';

import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// ============================================
// UI Store
// ============================================

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notificationsOpen: boolean;
  modalOpen: string | null;
  toast: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
}

type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'SET_NOTIFICATIONS_OPEN'; payload: boolean }
  | { type: 'OPEN_MODAL'; payload: string }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' | 'warning' } }
  | { type: 'HIDE_TOAST' };

const initialUIState: UIState = {
  sidebarCollapsed: false,
  theme: 'light',
  notificationsOpen: false,
  modalOpen: null,
  toast: {
    show: false,
    message: '',
    type: 'info',
  },
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_SIDEBAR':
      return { ...state, sidebarCollapsed: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notificationsOpen: !state.notificationsOpen };
    case 'SET_NOTIFICATIONS_OPEN':
      return { ...state, notificationsOpen: action.payload };
    case 'OPEN_MODAL':
      return { ...state, modalOpen: action.payload };
    case 'CLOSE_MODAL':
      return { ...state, modalOpen: null };
    case 'SHOW_TOAST':
      return { ...state, toast: { show: true, ...action.payload } };
    case 'HIDE_TOAST':
      return { ...state, toast: { ...state.toast, show: false } };
    default:
      return state;
  }
}

interface UIContextType {
  state: UIState;
  dispatch: Dispatch<UIAction>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleNotifications: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const setSidebarCollapsed = (collapsed: boolean) => dispatch({ type: 'SET_SIDEBAR', payload: collapsed });
  const setTheme = (theme: 'light' | 'dark') => dispatch({ type: 'SET_THEME', payload: theme });
  const toggleNotifications = () => dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
  const openModal = (modalId: string) => dispatch({ type: 'OPEN_MODAL', payload: modalId });
  const closeModal = () => dispatch({ type: 'CLOSE_MODAL' });
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 5000);
  };
  const hideToast = () => dispatch({ type: 'HIDE_TOAST' });

  return (
    <UIContext.Provider
      value={{
        state,
        dispatch,
        toggleSidebar,
        setSidebarCollapsed,
        setTheme,
        toggleNotifications,
        openModal,
        closeModal,
        showToast,
        hideToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

// ============================================
// App Store (Global app state)
// ============================================

interface AppState {
  isDemoMode: boolean;
  selectedPartnerId: string | null;
  selectedProgramId: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  filters: Record<string, string | null>;
}

type AppAction =
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'SET_SELECTED_PARTNER'; payload: string | null }
  | { type: 'SET_SELECTED_PROGRAM'; payload: string | null }
  | { type: 'SET_DATE_RANGE'; payload: { from: Date | null; to: Date | null } }
  | { type: 'SET_FILTER'; payload: { key: string; value: string | null } }
  | { type: 'CLEAR_FILTERS' };

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

interface AppContextType {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  setDemoMode: (isDemo: boolean) => void;
  selectPartner: (partnerId: string | null) => void;
  selectProgram: (programId: string | null) => void;
  setDateRange: (from: Date | null, to: Date | null) => void;
  setFilter: (key: string, value: string | null) => void;
  clearFilters: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  const setDemoMode = (isDemo: boolean) => dispatch({ type: 'SET_DEMO_MODE', payload: isDemo });
  const selectPartner = (partnerId: string | null) => dispatch({ type: 'SET_SELECTED_PARTNER', payload: partnerId });
  const selectProgram = (programId: string | null) => dispatch({ type: 'SET_SELECTED_PROGRAM', payload: programId });
  const setDateRange = (from: Date | null, to: Date | null) => dispatch({ type: 'SET_DATE_RANGE', payload: { from, to } });
  const setFilter = (key: string, value: string | null) => dispatch({ type: 'SET_FILTER', payload: { key, value } });
  const clearFilters = () => dispatch({ type: 'CLEAR_FILTERS' });

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        setDemoMode,
        selectPartner,
        selectProgram,
        setDateRange,
        setFilter,
        clearFilters,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
