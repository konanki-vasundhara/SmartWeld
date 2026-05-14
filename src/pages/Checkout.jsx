import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import useAuthStore from '../store/useAuthStore';
import useBookingStore from '../store/useBookingStore';

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { booking, setBooking } = useBookingStore();
  const [paid, setPaid] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const selectedMethod = booking.paymentMethod || 'GPay';
  const paymentAmount = booking.amount ?? 0;
  
  // USER'S REAL UPI ID
  const upiId = '9346274968@ybl'; 
  
  const upiParams = new URLSearchParams({
    pa: upiId,
    pn: 'Smart Weld Portal',
    am: Number(paymentAmount).toFixed(2),
    cu: 'INR',
    tn: `Smart Weld Service - ${booking.issue || 'Emergency'}`
  }).toString();
  
  const upiUri = `upi://pay?${upiParams}`;
  const jobId = booking.transactionId || 'SW-PENDING';

  const handleSelectMethod = (method) => {
    setBooking({ paymentMethod: method });
  };

  const handlePay = () => {
    setBooking({ 
      status: 'pending-payment', 
      transactionId: booking.transactionId || `TXN${Date.now()}` 
    });
    setPaymentStarted(true);
    window.location.href = upiUri;
  };

  const handleOpenUpi = () => {
    window.location.href = upiUri;
  };

  useEffect(() => {
    if (!upiUri) return;

    QRCode.toDataURL(upiUri, { width: 240, margin: 1 })
      .then((url) => setQrCodeUrl(url))
      .catch((error) => {
        console.warn('QR code generation failed:', error);
        setQrCodeUrl('');
      });
  }, [upiUri]);

  useEffect(() => {
    const onFocus = () => {
      if (paymentStarted && booking.status === 'pending-payment') {
        setPaid(true);
        setBooking({ status: 'paid' });
      }
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [booking.status, paymentStarted, setBooking]);

  return (
    <>
      <TopAppBar
        title="Secure Checkout"
        showBack={true}
        rightElement={<span className="material-symbols-outlined text-on-surface-variant dark:text-outline-variant" data-icon="lock">lock</span>}
      />
      {/* Guest Login Prompt */}
      {!isAuthenticated && (
        <div className="bg-amber-50 border-b border-amber-200 px-margin-mobile md:px-margin-desktop py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-xl">info</span>
            <p className="text-sm text-amber-800 font-medium">Log in to save your order history and access faster checkout.</p>
          </div>
          <button onClick={() => navigate('/login')} className="shrink-0 text-sm font-bold text-white bg-amber-600 px-4 py-1.5 rounded-full hover:opacity-90">
            Log In
          </button>
        </div>
      )}
      {/* Payment Success Toast */}
      {paid && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          Payment Successful! Redirecting...
        </div>
      )}

      <main className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-base">
        <section className="py-md flex flex-col gap-xs">
          <div className="flex items-center gap-xs text-primary-container">
            <span className="material-symbols-outlined text-[18px]" data-icon="lock" data-weight="fill" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>lock</span>
            <span className="font-label-bold text-label-bold uppercase tracking-widest">Secure Checkout</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Payment Details</h2>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-7 flex flex-col gap-gutter">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
              <div className="flex justify-between items-start mb-md">
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface-variant uppercase mb-xs">Service Summary</p>
                  <h3 className="font-headline-lg text-[24px] text-on-surface">{booking.issue || 'Emergency Repair'}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Job ID: {jobId}</p>
                </div>
                <div className="bg-secondary-container p-sm rounded-lg">
                  <span className="material-symbols-outlined text-on-secondary-container" data-icon="engineering">engineering</span>
                </div>
              </div>
              <div className="border-t border-outline-variant pt-md space-y-sm">
                {booking.lineItems?.map((item) => (
                  <div key={item.label} className="flex justify-between font-body-sm">
                    <span className="text-on-surface-variant">{item.label}</span>
                    <span className="text-on-surface font-semibold">₹ {item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-lg pt-md border-t-2 border-dashed border-outline-variant flex justify-between items-center">
                <span className="font-headline-lg text-[20px]">Total Amount</span>
                <span className="font-headline-xl text-[36px] text-safety-orange">₹ {paymentAmount}</span>
              </div>
              <div className="mt-md border-t border-outline-variant pt-md text-body-sm text-on-surface-variant">
                <p><span className="font-semibold text-on-surface">Location:</span> {booking.locationName || 'Not yet set'}</p>
                <p><span className="font-semibold text-on-surface">Asset ID:</span> {booking.assetId || 'N/A'}</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg p-md bg-primary-container text-on-primary">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-safety-orange opacity-20 blur-[60px]"></div>
              <div className="relative z-10 flex items-center gap-md">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <span className="material-symbols-outlined text-white" data-icon="verified">verified</span>
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-primary-fixed opacity-80 mb-xs">SMART WELD PROTECTION</p>
                  <p className="font-body-sm text-body-sm">This transaction is covered by our Industrial Quality Guarantee. All welds analyzed by AI for structural integrity.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col gap-gutter">
            <div className="bg-surface-container border border-outline-variant rounded-lg p-md flex flex-col gap-md">
              <p className="font-label-bold text-label-bold text-on-surface-variant uppercase">Select Payment Method</p>
              <div className="space-y-sm">
                <p className="font-body-sm font-semibold text-on-surface">Unified Payments Interface (UPI)</p>
                <div className="grid grid-cols-3 gap-xs">
                  {[
                    { key: 'GPay', label: 'G-Pay', icon: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' },
                    { key: 'PhonePe', label: 'PhonePe', icon: 'https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png' },
                    { key: 'Paytm', label: 'Paytm', icon: 'https://download.logo.wine/logo/Paytm/Paytm-Logo.wine.png' }
                  ].map((method) => (
                    <button
                      key={method.key}
                      type="button"
                      onClick={() => {
                        handleSelectMethod(method.key);
                        setTimeout(() => handlePay(), 100);
                      }}
                      className={`flex flex-col items-center justify-center gap-xs p-base rounded-lg transition-all border-2 ${selectedMethod === method.key ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-lowest hover:border-primary'}`}
                    >
                      <div className="w-16 h-10 flex items-center justify-center bg-white rounded-md p-1.5 shadow-sm overflow-hidden border border-slate-100">
                        <img alt={method.label} className="w-full h-full object-contain" src={method.icon} />
                      </div>
                      <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handlePay} disabled={paid} className="mt-md w-full bg-safety-orange text-white h-[56px] rounded-lg font-button-text text-button-text flex items-center justify-center gap-base shadow-lg transition-transform active:scale-95 disabled:opacity-70">
                <span className="material-symbols-outlined" data-icon="lock" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                Pay with {selectedMethod} ₹ {paymentAmount}
              </button>

              <button onClick={handleOpenUpi} type="button" className="mt-3 w-full bg-white border border-outline-variant text-on-surface h-[56px] rounded-lg font-semibold transition-all hover:bg-surface-container-high">
                Open {selectedMethod} / UPI app
              </button>

              {qrCodeUrl && (
                <div className="mt-4 rounded-3xl bg-surface-container-lowest border border-outline-variant p-md text-center">
                  <p className="font-label-bold text-on-surface-variant uppercase tracking-[0.24em] mb-3">Scan or Tap to pay</p>
                  <a href={upiUri} className="inline-block cursor-pointer hover:opacity-80 transition-opacity">
                    <img src={qrCodeUrl} alt="UPI QR code" className="mx-auto w-52 h-52" />
                  </a>
                  <p className="text-body-sm text-on-surface-variant mt-3">Scan with any UPI app or tap the QR code to open your payment app directly.</p>
                </div>
              )}
            </div>
            
            <div className="relative h-32 w-full rounded-lg overflow-hidden group">
              <img alt="Industrial Precision" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJu6UMkwvTminDIda8Y3cZx8XxZq0kFq3TNk2GsDQ855Fzg9fNpF0Tv8fecpLHIx8QDwr3pr61fK4GwBD5T7ypv9pK4D8J-PBhXzlu8P6WMIqPViMhJl8cI36lhoLZX2BvufwihZQQj_gvC21Avf1_orp1JWgGJFl_DsJZAdVM1OtA5u7KrGtxpkDjF7wQiKCh9sxVrk2t0GVT0Oj9vFEn7uNY_PhavyJnvZCL_AU5oS71YZfammedrJUhJDV8AfzzZRNcZtJfT4JW" />
              <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                <p className="text-white font-label-bold text-center px-md text-[10px] tracking-widest uppercase">Precision Engineering Meets Digital Security</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
