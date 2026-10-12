import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider, SignIn, useAuth, UserButton } from '@clerk/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import App from './App';

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!clerkKey || !convexUrl) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY or VITE_CONVEX_URL');
}
const convex = new ConvexReactClient(convexUrl);

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #11111b; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #11111b; }
  ::-webkit-scrollbar-thumb { background: #313244; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #45475a; }
`;
document.head.appendChild(style);

function ProtectedApp() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <SignIn routing="hash" />
    </div>
  );
  return <>
    <div style={{ position: 'fixed', top: 10, right: 12, zIndex: 1000 }}>
      <UserButton />
    </div>
    <App />
  </>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ProtectedApp />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
);
