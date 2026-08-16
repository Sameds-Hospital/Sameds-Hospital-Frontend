import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  Wallet, Copy, Eye, EyeOff, RefreshCw, AlertTriangle,
  CheckCircle, ExternalLink, Download, Shield, Zap, Plus,
} from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { Badge } from '../components/ui/Badge'

// ── Stellar keypair generation using Web Crypto + base32 ────────────────────
// Stellar public keys are Ed25519 keys encoded in Stellar's base32 format
// We generate them purely in the browser using the Web Crypto API

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(bytes: Uint8Array): string {
  let bits = 0, value = 0, output = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  return output
}

function crc16(bytes: Uint8Array): Uint8Array {
  let crc = 0x0000
  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i++) {
      if (crc & 1) crc = (crc >>> 1) ^ 0x8408
      else crc >>>= 1
    }
  }
  return new Uint8Array([crc & 0xff, (crc >> 8) & 0xff])
}

function encodeAccountId(rawKey: Uint8Array): string {
  const versionByte = 6 << 3 // 0x30 = account ID
  const payload = new Uint8Array([versionByte, ...rawKey])
  const checksum = crc16(payload)
  return base32Encode(new Uint8Array([...payload, ...checksum]))
}

function encodeSecretSeed(rawKey: Uint8Array): string {
  const versionByte = 18 << 3 // 0x90 = seed
  const payload = new Uint8Array([versionByte, ...rawKey])
  const checksum = crc16(payload)
  return base32Encode(new Uint8Array([...payload, ...checksum]))
}

async function generateStellarKeypair(): Promise<{ publicKey: string; secretKey: string }> {
  const keypair = await window.crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify'],
  )
  const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keypair.privateKey)
  // Ed25519 private key in PKCS8 is 48 bytes; raw seed is last 32 bytes
  const pkcs8 = new Uint8Array(privateKeyBuffer)
  const seed = pkcs8.slice(pkcs8.length - 32)

  const publicKeyBuffer = await window.crypto.subtle.exportKey('raw', keypair.publicKey)
  const rawPublic = new Uint8Array(publicKeyBuffer)

  return {
    publicKey: encodeAccountId(rawPublic),
    secretKey: encodeSecretSeed(seed),
  }
}

// ── Horizon balance fetch ────────────────────────────────────────────────────
interface HorizonBalance { asset_type: string; balance: string }
interface HorizonAccount { balances: HorizonBalance[] }

async function fetchBalance(address: string, network: 'testnet' | 'mainnet'): Promise<string> {
  const base = network === 'testnet'
    ? 'https://horizon-testnet.stellar.org'
    : 'https://horizon.stellar.org'
  const res = await fetch(`${base}/accounts/${address}`)
  if (!res.ok) return 'Not funded'
  const data = await res.json() as HorizonAccount
  const xlm = data.balances?.find(b => b.asset_type === 'native')
  return xlm ? `${parseFloat(xlm.balance).toFixed(4)} XLM` : '0 XLM'
}

// ── Saved wallets stored in localStorage ────────────────────────────────────
const WALLET_STORAGE_KEY = 'hms-wallets-v1'

interface SavedWallet {
  id: string
  label: string
  publicKey: string
  secretKey: string  // encrypted in real use; stored raw for demo
  network: 'testnet' | 'mainnet'
  createdAt: string
  isHospitalWallet: boolean
}

function loadWallets(): SavedWallet[] {
  try { return JSON.parse(localStorage.getItem(WALLET_STORAGE_KEY) ?? '[]') as SavedWallet[] }
  catch { return [] }
}

function saveWallets(wallets: SavedWallet[]) {
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallets))
}

// ── Component ────────────────────────────────────────────────────────────────
export function WalletManager() {
  const { currentUser } = useHMS()
  const [wallets, setWallets] = useState<SavedWallet[]>(loadWallets)
  const [generating, setGenerating] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newNetwork, setNewNetwork] = useState<'testnet' | 'mainnet'>('mainnet')
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [fetchingBalance, setFetchingBalance] = useState<string | null>(null)
  const [activeWallet, setActiveWallet] = useState<SavedWallet | null>(null)
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [genResult, setGenResult] = useState<SavedWallet | null>(null)

  // Auto-load balances for funded wallets on mount
  useEffect(() => {
    wallets.forEach(w => {
      if (w.publicKey.startsWith('G') && w.publicKey.length === 56) {
        void getBalance(w)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persist = (updated: SavedWallet[]) => {
    setWallets(updated)
    saveWallets(updated)
  }

  const generate = async () => {
    if (!newLabel.trim()) return
    setGenerating(true)
    try {
      const kp = await generateStellarKeypair()
      const wallet: SavedWallet = {
        id: `W-${Date.now()}`,
        label: newLabel.trim(),
        publicKey: kp.publicKey,
        secretKey: kp.secretKey,
        network: newNetwork,
        createdAt: new Date().toISOString(),
        isHospitalWallet: currentUser?.role === 'Admin',
      }
      persist([...wallets, wallet])
      setGenResult(wallet)
      setActiveWallet(wallet)
      setNewLabel('')
      setShowGenerateForm(false)
    } catch (err) {
      alert('Key generation failed: ' + String(err))
    }
    setGenerating(false)
  }

  const getBalance = async (wallet: SavedWallet) => {
    setFetchingBalance(wallet.id)
    try {
      const bal = await fetchBalance(wallet.publicKey, wallet.network)
      setBalances(b => ({ ...b, [wallet.id]: bal }))
    } catch {
      setBalances(b => ({ ...b, [wallet.id]: 'Error' }))
    }
    setFetchingBalance(null)
  }

  const copyToClipboard = (text: string, key: string) => {
    void navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const exportWallet = (wallet: SavedWallet) => {
    const data = {
      label: wallet.label,
      network: wallet.network,
      publicKey: wallet.publicKey,
      secretKey: wallet.secretKey,
      createdAt: wallet.createdAt,
      warning: 'KEEP THIS FILE SECURE. Anyone with the secret key can access your funds.',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `stellar-wallet-${wallet.label.replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const deleteWallet = (id: string) => {
    if (!confirm('Delete this wallet? The keys will be removed from this browser. Make sure you have a backup.')) return
    persist(wallets.filter(w => w.id !== id))
    if (activeWallet?.id === id) setActiveWallet(null)
  }

  const fundTestnet = (addr: string) => {
    window.open(`https://laboratory.stellar.org/#account-creator?network=test&accountId=${addr}`, '_blank')
  }

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Cashier'

  return (
    <div className="module-page">
      <PageHeader
        title="Stellar Wallet Manager"
        subtitle="Generate and manage XLM wallet addresses for hospital payment collection"
        icon={<Wallet size={22} />}
        actions={isAdmin ? (
          <button type="button" className="btn btn--primary" onClick={() => setShowGenerateForm(p => !p)}>
            <Plus size={15} /> Generate Wallet
          </button>
        ) : undefined}
      />

      {/* Security warning */}
      <div className="wallet-warning">
        <AlertTriangle size={16} />
        <div>
          <strong>Security Notice:</strong> Secret keys are stored in browser localStorage for demo purposes.
          In production, use a Hardware Security Module (HSM) or encrypted key vault.
          Never share your secret key.
        </div>
      </div>

      {/* Generate form */}
      {showGenerateForm && (
        <SectionCard title="Create New Wallet">
          <div className="wallet-gen-form">
            <div className="form-field">
              <label className="form-label">Wallet Label</label>
              <input
                className="form-control"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="e.g. Sameds Hospital Main Collection"
                onKeyDown={e => e.key === 'Enter' && void generate()}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Network</label>
              <select className="form-control" value={newNetwork} onChange={e => setNewNetwork(e.target.value as 'testnet' | 'mainnet')}>
                <option value="mainnet">Mainnet (Live — real XLM)</option>
                <option value="testnet">Testnet (Safe for testing — no real money)</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowGenerateForm(false)}>Cancel</button>
              <button type="button" className="btn btn--primary" onClick={() => void generate()} disabled={generating || !newLabel.trim()}>
                {generating ? <><RefreshCw size={13} className="spin" /> Generating…</> : <><Zap size={13} /> Generate Keypair</>}
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* New wallet generated notice */}
      {genResult && (
        <div className="wallet-gen-notice">
          <CheckCircle size={16} />
          <div>
            <strong>Wallet created: {genResult.label}</strong>
            <p>Save your secret key immediately. It will not be shown again in a production system.</p>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setGenResult(null)}>Dismiss</button>
        </div>
      )}

      <div className="wallet-layout">
        {/* Wallet list */}
        <SectionCard title={`My Wallets (${wallets.length})`}>
          {wallets.length === 0 && (
            <div className="empty-hint">
              No wallets yet. Click "Generate Wallet" to create your first Stellar address.
            </div>
          )}
          <div className="wallet-list">
            {wallets.map(w => (
              <div
                key={w.id}
                className={`wallet-card${activeWallet?.id === w.id ? ' wallet-card--active' : ''}`}
                onClick={() => setActiveWallet(w)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setActiveWallet(w)}
              >
                <div className="wallet-card__top">
                  <div className="wallet-card__icon"><Wallet size={18} /></div>
                  <div className="wallet-card__info">
                    <strong>{w.label}</strong>
                    <span className="wallet-card__addr">{w.publicKey.slice(0, 8)}…{w.publicKey.slice(-6)}</span>
                  </div>
                  <div className="wallet-card__badges">
                    <Badge variant={w.network === 'testnet' ? 'yellow' : 'green'}>{w.network}</Badge>
                    {w.isHospitalWallet && <Badge variant="blue">Hospital</Badge>}
                  </div>
                </div>
                <div className="wallet-card__balance">
                  <span>{balances[w.id] ?? '—'}</span>
                  <button type="button" className="icon-btn" title="Refresh balance"
                    onClick={e => { e.stopPropagation(); void getBalance(w) }}
                    disabled={fetchingBalance === w.id}>
                    <RefreshCw size={12} className={fetchingBalance === w.id ? 'spin' : ''} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Wallet detail */}
        {activeWallet && (
          <SectionCard title={activeWallet.label}>
            <div className="wallet-detail">
              {/* QR Code */}
              <div className="wallet-qr-wrap">
                <QRCodeSVG
                  value={activeWallet.publicKey}
                  size={180}
                  level="H"
                  includeMargin
                />
                <p className="wallet-qr-label">Scan to send XLM to this address</p>
              </div>

              {/* Keys */}
              <div className="wallet-keys">
                <div className="wallet-key-row">
                  <label className="form-label">
                    <Shield size={12} /> Public Key (Share freely — receiving address)
                  </label>
                  <div className="wallet-key-box">
                    <code className="wallet-key-val">{activeWallet.publicKey}</code>
                    <button type="button" className="icon-btn" title="Copy"
                      onClick={() => copyToClipboard(activeWallet.publicKey, 'pub-' + activeWallet.id)}>
                      {copied === 'pub-' + activeWallet.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="wallet-key-row">
                  <label className="form-label">
                    <AlertTriangle size={12} style={{ color: 'var(--red)' }} /> Secret Key (NEVER share — keep offline)
                  </label>
                  <div className="wallet-key-box">
                    <code className="wallet-key-val wallet-key-val--secret">
                      {showSecret[activeWallet.id] ? activeWallet.secretKey : '•'.repeat(56)}
                    </code>
                    <button type="button" className="icon-btn" title="Toggle visibility"
                      onClick={() => setShowSecret(s => ({ ...s, [activeWallet.id]: !s[activeWallet.id] }))}>
                      {showSecret[activeWallet.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {showSecret[activeWallet.id] && (
                      <button type="button" className="icon-btn" title="Copy secret"
                        onClick={() => copyToClipboard(activeWallet.secretKey, 'sec-' + activeWallet.id)}>
                        {copied === 'sec-' + activeWallet.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="wallet-detail-meta">
                  <span>Network: <Badge variant={activeWallet.network === 'testnet' ? 'yellow' : 'green'}>{activeWallet.network}</Badge></span>
                  <span>Created: {new Date(activeWallet.createdAt).toLocaleDateString()}</span>
                  <span>Balance: <strong>{balances[activeWallet.id] ?? '—'}</strong></span>
                </div>

                <div className="wallet-detail-actions">
                  <button type="button" className="btn btn--ghost btn--sm"
                    onClick={() => void getBalance(activeWallet)} disabled={fetchingBalance === activeWallet.id}>
                    <RefreshCw size={13} className={fetchingBalance === activeWallet.id ? 'spin' : ''} /> Check Balance
                  </button>

                  {activeWallet.network === 'testnet' && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => fundTestnet(activeWallet.publicKey)}>
                      <Zap size={13} /> Fund on Testnet ↗
                    </button>
                  )}

                  <a
                    className="btn btn--ghost btn--sm"
                    href={`https://stellar.expert/explorer/${activeWallet.network}/account/${activeWallet.publicKey}`}
                    target="_blank" rel="noopener noreferrer"
                  >
                    <ExternalLink size={13} /> View on Explorer
                  </a>

                  {isAdmin && (
                    <>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => exportWallet(activeWallet)}>
                        <Download size={13} /> Export Keys
                      </button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => deleteWallet(activeWallet.id)}>
                        Delete Wallet
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
        )}
      </div>

      {/* How to receive payments */}
      <SectionCard title="How to Receive Payments">
        <div className="wallet-howto">
          <div className="howto-step">
            <span className="howto-num">1</span>
            <div>
              <strong>Generate a wallet</strong>
              <p>Click "Generate Wallet" above. A unique Stellar public/secret keypair is created securely in your browser.</p>
            </div>
          </div>
          <div className="howto-step">
            <span className="howto-num">2</span>
            <div>
              <strong>Share your public key</strong>
              <p>Give patients your <strong>public key</strong> (starts with G). They send XLM to this address. You can also show them the QR code.</p>
            </div>
          </div>
          <div className="howto-step">
            <span className="howto-num">3</span>
            <div>
              <strong>Fund the wallet (mainnet)</strong>
              <p>This wallet defaults to mainnet. To receive live XLM, fund the address from an exchange or another Stellar account. DO NOT share your secret key.</p>
            </div>
          </div>
          <div className="howto-step">
            <span className="howto-num">4</span>
            <div>
              <strong>Use in Stellar Billing</strong>
              <p>Go to <strong>Stellar / XLM</strong> module and use your public key as the hospital receiving address on invoices.</p>
            </div>
          </div>
          <div className="howto-step">
            <span className="howto-num">5</span>
            <div>
              <strong>Monitor on Explorer</strong>
              <p>Click "View on Explorer" to see all incoming transactions on the Stellar blockchain in real time.</p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
