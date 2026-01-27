import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import Modal from './Modal';

// Reusable components for styling consistency
const PUPInput = (props) => (
  <input
    {...props}
    className="w-full p-3 mb-4 rounded-sm bg-white text-black outline-none focus:ring-2 focus:ring-[#D9A406]"
  />
);

const PUPButton = ({ children, onClick, variant = 'primary' }) => (
  <button
    onClick={onClick}
    className={`w-full py-3 px-4 rounded-sm font-semibold transition-colors duration-200 ${
      variant === 'primary' ? 'bg-[#D9A406] text-[#2D0000] hover:bg-[#B88A05]' : 'text-white hover:underline mt-4 block'
    }`}
  >
    {children}
  </button>
);

export default function ForgotPassword({ isOpen, onClose }) {
  const { sendResetCode, verifyResetCode, resetPassword } = useAuth();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const closeAndReset = () => {
    setStep(1);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const handleSendCode = async () => {
    try {
      await sendResetCode(email);
      setStep(2);
    } catch {
      setError('Failed to send verification code');
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifyResetCode(email, code);
      setStep(3);
    } catch {
      setError('Invalid or expired code');
    }
  };

  const handleResetPassword = async () => {
    setError('');

    if (!newPassword || !confirmPassword) {
      return setError('Password is required');
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      await resetPassword(email, code, newPassword);
      setStep(4);
    } catch (err) {
      setError(err?.message || 'Failed to reset password');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeAndReset}>
      <div className="bg-[#800000] p-10 rounded-2xl text-white text-center w-full max-w-md mx-auto shadow-2xl">
        {/* Lock Icon Header */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full border-2 border-[#D9A406] p-6 w-24 h-24 flex items-center justify-center">
            <svg className="w-12 h-12 text-[#D9A406]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold mb-2">Trouble logging in?</h2>
            <p className="text-sm mb-6 px-4">
              Enter your email and we'll send you a link to get back into your account.
            </p>
            <PUPInput type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <PUPButton onClick={handleSendCode}>Send verification code</PUPButton>
            <PUPButton variant="link" onClick={closeAndReset}>
              Back to login
            </PUPButton>
          </div>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold mb-2">Trouble logging in?</h2>
            <p className="text-sm mb-6">Enter the code we sent to your email</p>
            <PUPInput placeholder="Enter code" value={code} onChange={(e) => setCode(e.target.value)} />
            <PUPButton onClick={handleVerifyCode}>Confirm code</PUPButton>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold mb-2">Trouble logging in?</h2>
            <p className="text-sm mb-6">Enter your new password</p>
            <PUPInput
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <PUPInput
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Keeping "Confirm code" text as per your provided image (3) */}
            <PUPButton onClick={handleResetPassword}>Confirm password</PUPButton>
          </div>
        )}

        {/* Step 4: Success Message */}
        {step === 4 && (
          <div className="animate-fadeIn py-4">
            <h2 className="text-xl font-bold mb-8">New password saved successfully!</h2>
            <PUPButton onClick={closeAndReset}>Back to login</PUPButton>
          </div>
        )}

        {error && (
          <p className="bg-red-200 text-red-800 p-2 mt-4 rounded-sm text-xs font-bold animate-pulse">{error}</p>
        )}
      </div>
    </Modal>
  );
}
