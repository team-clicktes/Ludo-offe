import React, { useState } from 'react';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { AppLanguage } from '../game/types';
import { useOnlineStatus } from '../pwa/useOnlineStatus';
import { usePWAInstall } from '../pwa/usePWAInstall';

interface PWAInstallButtonProps {
  language?: AppLanguage;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language = 'en',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        return;
      }
      return;
    }
    setShowGuideModal(true);
  };

  const isUr = language === 'ur';

  return (
    <>
      <button
        type="button"
        data-testid="pwa-install-btn"
        onClick={handleClick}
        aria-label={isUr ? 'ایپ انسٹال کریں' : 'Install App'}
        className={`btn-emerald-3d rounded-full flex items-center justify-center gap-0.5 px-1 text-[9.5px] font-black tracking-tight whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 ${className}`}
      >
        <Download className="w-2.5 h-2.5 shrink-0" />
        <span>{isUr ? 'انسٹال' : 'Install'}</span>
      </button>

      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Install LUDO STAR App"
          data-testid="pwa-install-guide"
          className="fixed inset-0 z-50 bg-indigo-950/85 flex items-center justify-center p-4"
        >
          <div className="royal-card w-full max-w-[340px] rounded-2xl p-4 flex flex-col gap-3 border-2 border-amber-300 text-left">
            <div className="flex items-center justify-between border-b border-amber-300/25 pb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-300 shrink-0" />
                <h2 className="font-display font-black text-base text-amber-300">
                  {isUr ? 'موبائل میں ایپ انسٹال کریں' : 'Install LUDO STAR'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Close install guide"
                className="w-8 h-8 rounded-lg bg-indigo-900 border border-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="rounded-xl bg-indigo-950/80 border border-indigo-400/30 p-3 text-xs text-indigo-100 leading-relaxed space-y-2">
                <p className="font-bold text-amber-200 flex items-center gap-1.5">
                  <Share className="w-4 h-4 shrink-0" />
                  {isUr ? 'آئی فون / سفاری میں انسٹال کرنے کا طریقہ:' : 'Install on iPhone / iPad (Safari):'}
                </p>
                <p>
                  {isUr
                    ? '1. نیچے Safari کے Share بٹن پر ٹیپ کریں۔'
                    : '1. Tap the Share button in the Safari toolbar.'}
                </p>
                <p>
                  {isUr
                    ? '2. اسکرول کریں اور "Add to Home Screen" منتخب کریں۔'
                    : '2. Scroll down and tap "Add to Home Screen".'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-indigo-950/80 border border-indigo-400/30 p-3 text-xs text-indigo-100 leading-relaxed space-y-2">
                <p className="font-bold text-amber-200">
                  {isUr
                    ? 'اینڈرائیڈ کروم / براؤزر سے انسٹال کرنے کا طریقہ:'
                    : 'Install on Android / Browser:'}
                </p>
                <p>
                  {isUr
                    ? '1. براؤزر کے اوپر دائیں مینو (⋮) پر ٹیپ کریں۔'
                    : '1. Tap your browser menu (⋮) in the top-right corner.'}
                </p>
                <p>
                  {isUr
                    ? '2. "Install app" یا "Add to Home screen" پر ٹیپ کریں۔ انسٹال ہونے کے بعد گیم 100% آف لائن چلے گی!'
                    : '2. Tap "Install app" or "Add to Home screen". Once installed, LUDO STAR runs 100% offline!'}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="btn-gold-3d w-full h-10 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              {isUr ? 'ٹھیک ہے' : 'Got It!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineReadyBadge: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      data-testid="offline-indicator"
      className="pointer-events-none absolute top-[8.2%] left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-full bg-amber-500 border border-amber-100 px-3 py-1 text-[10px] font-black text-indigo-950 shadow-lg whitespace-nowrap"
    >
      <WifiOff className="w-3 h-3 shrink-0" />
      <span>Offline Mode — Ready to Play</span>
    </div>
  );
};
