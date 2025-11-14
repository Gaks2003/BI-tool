import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'

type Props = {
  dashboardId: string
}

export default function ShareDashboard({ dashboardId }: Props) {
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/shared/${dashboardId}`

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={() => setShowShare(true)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', borderRadius: '4px', fontWeight: '600' }}
      >
        <Share2 size={20} />
        Share
      </button>

      {showShare && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Share Dashboard</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Public Link</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', background: '#f9fafb' }}
                />
                <button
                  onClick={copyLink}
                  style={{ padding: '0.75rem', background: '#667eea', color: 'white', borderRadius: '4px' }}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowShare(false)}
              style={{ width: '100%', padding: '0.75rem', background: '#ddd', borderRadius: '4px', fontWeight: '600' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
