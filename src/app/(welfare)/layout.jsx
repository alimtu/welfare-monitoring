import { WelfareProvider } from '@/lib/welfare/WelfareContext';
import { WelfareShell } from '@/components/welfare/WelfareShell';

/**
 * Layout for the welfare monitoring app. Wraps every welfare route in the
 * localStorage-backed provider and the shared shell (period selector + nav).
 */
export default function WelfareLayout({ children }) {
  return (
    <WelfareProvider>
      <WelfareShell>{children}</WelfareShell>
    </WelfareProvider>
  );
}
