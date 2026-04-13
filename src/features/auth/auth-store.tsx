import {
  PropsWithChildren,
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AppRole,
  AuthTokens,
  AuthUser,
  loginRequest,
  loginWithOtpRequest,
  meRequest,
  registerRequest,
  registerWithOtpRequest,
  setAuthToken,
} from '../../services/api';

type AuthState = AuthUser;

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: AppRole;
  city?: string;
}

interface AuthContextValue {
  user: AuthState | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthState>;
  loginWithOtp: (recipient: string, otp: string) => Promise<AuthState>;
  register: (payload: RegisterInput) => Promise<AuthState>;
  registerWithOtp: (payload: RegisterInput & { recipient: string; otp: string }) => Promise<AuthState>;
  logout: () => void;
}

const STORAGE_KEY = 'washflow-auth';

interface StoredSession {
  user: AuthState;
  tokens: AuthTokens;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setIsLoading(false);
      return;
    }

    const session = JSON.parse(raw) as StoredSession;
    setAuthToken(session.tokens.accessToken);

    void meRequest()
      .then((currentUser) => {
        setUser(currentUser);
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...session, user: currentUser }),
        );
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const response = await loginRequest({ email, password });
        setAuthToken(response.tokens.accessToken);
        const session: StoredSession = { user: response.user, tokens: response.tokens };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        startTransition(() => setUser(response.user));
        return response.user;
      },
      loginWithOtp: async (recipient, otp) => {
        const response = await loginWithOtpRequest({ recipient, otp });
        setAuthToken(response.tokens.accessToken);
        const session: StoredSession = { user: response.user, tokens: response.tokens };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        startTransition(() => setUser(response.user));
        return response.user;
      },
      register: async (payload) => {
        const response = await registerRequest(payload);
        setAuthToken(response.tokens.accessToken);
        const session: StoredSession = { user: response.user, tokens: response.tokens };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        startTransition(() => setUser(response.user));
        return response.user;
      },
      registerWithOtp: async (payload) => {
        const response = await registerWithOtpRequest(payload);
        setAuthToken(response.tokens.accessToken);
        const session: StoredSession = { user: response.user, tokens: response.tokens };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        startTransition(() => setUser(response.user));
        return response.user;
      },
      logout: () => {
        window.localStorage.removeItem(STORAGE_KEY);
        setAuthToken(null);
        setUser(null);
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
