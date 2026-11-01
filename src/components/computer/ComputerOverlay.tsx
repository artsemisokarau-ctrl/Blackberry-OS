import { useState, type FormEvent } from 'react';
import { ArrowLeft, Coins, Lock, Search, ShoppingBag, TrendingUp, Wallet, X } from 'lucide-react';
import StoreSite from '@/components/apps/store/StoreSite';
import TechExchangePage from '@/components/computer/TechExchangePage';
import WalletPage from '@/components/computer/WalletPage';
import type { StoreController } from '@/hooks/useStore';
import type { WalletController } from '@/hooks/useWallet';
import { formatDb } from '@/lib/store';

type Page = 'home' | 'store' | 'exchange' | 'wallet';

const PAGE_ADDRESS: Record<Exclude<Page, 'home'>, string> = {
  store: 'doomstore.com',
  exchange: 'techexchange.com',
  wallet: 'wallet.doomberry',
};

const ADDRESS_ALIASES: Record<string, Page> = {
  '': 'home',
  doomstore: 'store',
  'doomstore.com': 'store',
  'www.doomstore.com': 'store',
  techexchange: 'exchange',
  'techexchange.com': 'exchange',
  'www.techexchange.com': 'exchange',
  wallet: 'wallet',
  'wallet.doomberry': 'wallet',
};

const BOOKMARKS: { label: string; page: Exclude<Page, 'home' | 'wallet'>; icon: typeof ShoppingBag }[] = [
  { label: 'DOOMSTORE.COM', page: 'store', icon: ShoppingBag },
  { label: 'TECH EXCHANGE', page: 'exchange', icon: TrendingUp },
];

function resolvePage(input: string): Page | null {
  const value = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  return ADDRESS_ALIASES[value] ?? null;
}

interface ComputerOverlayProps {
  store: StoreController;
  wallet: WalletController;
  canClose: boolean;
  onUnbox: (orderId: string) => void;
  onClose: () => void;
}

export default function ComputerOverlay({ store, wallet, canClose, onUnbox, onClose }: ComputerOverlayProps) {
  const [page, setPage] = useState<Page>('home');
  const [address, setAddress] = useState('');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');

  const navigate = (input: string) => {
    const target = resolvePage(input);
    if (target === null) {
      setNotice('This computer can only reach DOOMSTORE.COM, TECH EXCHANGE and your wallet.');
      return;
    }
    setNotice('');
    setPage(target);
    setAddress(target === 'home' ? '' : PAGE_ADDRESS[target]);
    setQuery('');
    if (target === 'store') wallet.bump('storeVisits');
    if (target === 'exchange') wallet.bump('exchangeVisits');
  };

  const submitAddress = (event: FormEvent) => {
    event.preventDefault();
    navigate(address);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(query);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Computer" className="fixed inset-0 z-40 flex flex-col bg-zinc-950 text-zinc-100">
      <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <button
          type="button"
          aria-label="Back to computer desktop"
          disabled={page === 'home'}
          onClick={() => navigate('')}
          className="rounded-full p-1.5 text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <form onSubmit={submitAddress} className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-zinc-800 px-4 py-1.5 ring-1 ring-zinc-700 focus-within:ring-zinc-400">
          {page === 'home' ? <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" /> : <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
          <input
            aria-label="Address bar"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Search or type DOOMSTORE.COM"
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
        </form>
        <button
          type="button"
          onClick={onClose}
          disabled={!canClose}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <X className="h-3.5 w-3.5" />
          {canClose ? 'Close computer' : 'Order to continue'}
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-1.5">
        {BOOKMARKS.map(({ label, page: target, icon: Icon }) => (
          <button
            key={target}
            type="button"
            onClick={() => navigate(PAGE_ADDRESS[target])}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800"
          >
            <Icon className="h-3.5 w-3.5 text-zinc-400" />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => navigate('wallet')}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-100 ring-1 ring-zinc-700 transition hover:ring-zinc-400"
        >
          <Coins className="h-3.5 w-3.5 text-amber-400" />
          {formatDb(wallet.state.balance)}
        </button>
      </div>

      {!canClose && (
        <p className="bg-amber-400 px-4 py-2 text-xs font-semibold tracking-wide text-zinc-950">
          Order your first phone from DOOMSTORE.COM to continue.
        </p>
      )}

      {notice && (
        <p role="status" className="bg-amber-950 px-4 py-1.5 text-xs text-amber-200">
          {notice}
        </p>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto bg-zinc-950">
        {page === 'home' && (
          <div className="flex h-full flex-col items-center justify-center gap-8 px-6 pb-24">
            <div className="text-center">
              <h1 className="text-5xl font-black tracking-tight text-zinc-100">DOOMBERRY</h1>
              <p className="mt-2 text-xs tracking-[0.35em] text-zinc-400">COMPUTER</p>
            </div>
            <form
              onSubmit={submitSearch}
              className="flex w-full max-w-xl items-center gap-3 rounded-full bg-zinc-900 px-5 py-3 ring-1 ring-zinc-700 focus-within:ring-zinc-400"
            >
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                aria-label="Search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search or type DOOMSTORE.COM"
                className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              />
            </form>
            <button
              type="button"
              onClick={() => navigate('wallet')}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-400 transition hover:text-zinc-100"
            >
              <Wallet className="h-3.5 w-3.5" />
              My wallet and rewards
            </button>
          </div>
        )}
        {page === 'store' && (
          <div className="flex justify-center p-6">
            <div
              style={{ zoom: 1.4 }}
              className="flex h-[460px] w-[440px] flex-col overflow-hidden rounded-xl shadow-xl ring-1 ring-black/15"
            >
              <StoreSite store={store} onUnbox={onUnbox} />
            </div>
          </div>
        )}
        {page === 'exchange' && <TechExchangePage wallet={wallet} />}
        {page === 'wallet' && <WalletPage wallet={wallet} />}
      </main>
    </div>
  );
}
