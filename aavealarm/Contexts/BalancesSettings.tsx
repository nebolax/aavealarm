import { useContext, createContext, useState, ReactNode } from 'react';

export interface BalancesSettings {
  showZeroBalances: boolean;
}

export interface BalancesSettingsContextType {
  balancesSettings: BalancesSettings;
  setBalancesSettings: React.Dispatch<React.SetStateAction<BalancesSettings>>;
}

const BalancesSettingsContext = createContext<BalancesSettingsContextType | undefined>(undefined);
const { Provider } = BalancesSettingsContext;

export function BalancesSettingsProvider({ children }: { children: ReactNode }) {
  const [balancesSettings, setBalancesSettings] = useState<BalancesSettings>({
    showZeroBalances: false,
  });

  return (
    <Provider value={{ balancesSettings, setBalancesSettings }}>
      {children}
    </Provider>
  );
}

export function useBalancesSettings() {
  const context = useContext(BalancesSettingsContext);
  if (context === undefined) {
    throw new Error(
      'useBalancesSettings must be used within a BalancesSettingsProvider'
    );
  }
  return context;
}
