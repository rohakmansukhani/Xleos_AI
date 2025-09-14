'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, User, Briefcase, CheckCircle, AlertCircle, Sparkles,
  ArrowRight, Users, Clock, Shield
} from 'lucide-react';
import PremiumButton from '../ui/PremiumButton';
import BlobBot from '../ui/BlobBot';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}
interface FormData {
  fullName: string;
  address: string;
  role: string;
  company: string;
  use: string;
}
interface FormErrors {
  fullName?: string;
  address?: string;
  role?: string;
  company?: string;
  use?: string;
}

const roles = [
  { value: 'content-creator', label: 'Content Creator' },
  { value: 'video-editor', label: 'Video Editor' },
  { value: 'marketer', label: 'Digital Marketer' },
  { value: 'business-owner', label: 'Business Owner' },
  { value: 'agency', label: 'Agency Professional' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'other', label: 'Other' }
];

const SuccessState: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ scale: 0.85, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.85, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 210, damping: 22 }}
    className="text-center py-8"
  >
    <motion.div layout className="mb-6 flex justify-center items-center">
      <span className="relative inline-block">
        <CheckCircle size={64} className="text-green-400 drop-shadow" />
        <motion.div
          className="absolute inset-0 bg-green-400/25 rounded-full blur-xl"
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0.8, scale: [1, 1.14, 1], transition: { repeat: Infinity, duration: 1.6 } }}
        />
      </span>
    </motion.div>
    <motion.h3
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="text-2xl font-bold text-white mb-4"
    >
      🎉 Welcome to XLEOS!
    </motion.h3>
    <motion.p
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.18, duration: 0.3 }}
      className="text-white/80 mb-2"
    >
      You&apos;re successfully added to our exclusive waitlist.
    </motion.p>
    <motion.p
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="text-sm text-white/60 mb-8"
    >
      We&apos;ll notify you as soon as early access is available.
    </motion.p>
    <motion.div
      initial={{ scale: 0.93, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.32, duration: 0.25 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-center gap-6 text-sm text-white/70">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-purple-300" />
          <span>10,000+ creators waiting</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-purple-300" />
          <span>Launch Q1 2025</span>
        </div>
      </div>
      <PremiumButton
        variant="glass"
        size="md"
        animations={['magnetic', 'glow']}
        onClick={onClose}
        className="mx-auto mt-4"
      >
        Got it!
      </PremiumButton>
    </motion.div>
  </motion.div>
);

const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    address: "",
    role: "",
    company: "",
    use: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Disable scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Validation
  function validateForm(): FormErrors {
    const n: FormErrors = {};
    if (!formData.fullName.trim())
      n.fullName = 'Name is required';
    else if (formData.fullName.length < 2)
      n.fullName = 'Name must be at least 2 characters';
    if (!formData.address.trim())
      n.address = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.address))
      n.address = 'Please enter a valid email address';
    if (!formData.role)
      n.role = 'Please select your role';
    if (!formData.use.trim())
      n.use = 'Please tell us how you plan to use XLEOS';
    else if (formData.use.length < 10)
      n.use = 'Please provide more details (at least 10 characters)';
    return n;
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      // Send to API
      const res = await fetch('/api/collect-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }
      setIsSuccess(true);
    } catch (e: unknown) {
      let message = 'Something went wrong. Please try again.';
      if (e instanceof Error) {
        message = e.message;
      }
      setErrors({ address: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Esc to close
  useEffect(() => {
    const cb = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", cb);
    return () => window.removeEventListener("keydown", cb);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-opacity-95 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.22 } }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
          style={{ background: "rgba(30, 18, 52, 0.88)", backdropFilter: "blur(16px)" }}
        >
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.93, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.32, duration: 0.58 } }}
            exit={{ opacity: 0, scale: 0.95, y: 50, transition: { duration: 0.29 } }}
            className="relative w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto bg-[rgba(34,28,52,0.94)] backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-8 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/16 flex items-center justify-center transition-colors group z-10"
            >
              <X size={16} className="text-white/70 group-hover:text-white" />
            </motion.button>

            {/* Animated Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.12 } }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-4">
                <BlobBot size={60} colors={["#7c5dfa","#a792fc"]} mouseFollow={false} intensity="medium" interactive={false} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Join the XLEOS Waitlist
              </h2>
              <div className="text-white/70 text-sm">
                Be among the first to experience the future of video editing
              </div>
            </motion.div>

            {isSuccess ? (
              <SuccessState onClose={onClose} />
            ) : (
              <motion.form onSubmit={handleSubmit} className="space-y-6" initial={false}>
                <motion.div className="mb-2" layout>
                  <label className="block text-sm font-medium text-white/90 mb-2">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={e => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full px-12 py-3 bg-white/5 border border-white/16 rounded-xl text-white placeholder:text-[#dfd7fa82] transition focus:outline-none focus:ring-2 focus:ring-[#b096f3]/35 ${errors.fullName ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {errors.fullName && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.fullName}</p>}
                </motion.div>
                <motion.div className="mb-2" layout>
                  <label className="block text-sm font-medium text-white/90 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                    <input
                      type="email"
                      value={formData.address}
                      onChange={e => handleInputChange('address', e.target.value)}
                      placeholder="your.email@example.com"
                      className={`w-full px-12 py-3 bg-white/5 border border-white/16 rounded-xl text-white placeholder:text-[#dfd7fa82] transition focus:outline-none focus:ring-2 focus:ring-[#b096f3]/35 ${errors.address ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {errors.address && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.address}</p>}
                </motion.div>
                <motion.div className="mb-2" layout>
                  <label className="block text-sm font-medium text-white/90 mb-2">Your Role *</label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                    <select
                      value={formData.role}
                      onChange={e => handleInputChange('role', e.target.value)}
                      className={`w-full px-12 py-3 bg-white/5 border border-white/16 rounded-xl text-white placeholder:text-[#dfd7fa82] transition focus:outline-none focus:ring-2 focus:ring-[#b096f3]/35 appearance-none ${errors.role ? 'border-red-400' : ''}`}
                    >
                      <option value="">Select your role</option>
                      {roles.map(role => (
                        <option key={role.value} value={role.value} className="bg-[#231a37] text-white">
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.role && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.role}</p>}
                </motion.div>
                <motion.div className="mb-2" layout>
                  <label className="block text-sm font-medium text-white/90 mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={e => handleInputChange('company', e.target.value)}
                    placeholder="Your company or organization"
                    className="w-full px-4 py-3 bg-white/5 border border-white/16 rounded-xl text-white placeholder:text-[#dfd7fa82] transition focus:outline-none focus:ring-2 focus:ring-[#b096f3]/35"
                  />
                </motion.div>
                <motion.div className="mb-1" layout>
                  <label className="block text-sm font-medium text-white/90 mb-2">How will you use XLEOS? *</label>
                  <textarea
                    value={formData.use}
                    onChange={e => handleInputChange('use', e.target.value)}
                    placeholder="Tell us about your video editing needs and how XLEOS could help..."
                    rows={3}
                    className={`w-full px-4 py-3 bg-white/5 border border-white/16 rounded-xl text-white placeholder:text-[#dfd7fa82] min-h-[50px] transition focus:outline-none focus:ring-2 focus:ring-[#b096f3]/35 resize-none ${errors.use ? 'border-red-400' : ''}`}
                  />
                  {errors.use && <p className="text-red-400 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.use}</p>}
                </motion.div>
                {/* Soft Info Row */}
                <motion.div className="bg-white/3 rounded-xl p-4 mb-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-white/70"><Shield size={14} className="text-purple-300" /><span>Your data is secure and never shared</span></div>
                  <div className="flex items-center gap-2 text-sm text-white/70"><Sparkles size={14} className="text-purple-300" /><span>Get exclusive early access</span></div>
                  <div className="flex items-center gap-2 text-sm text-white/70"><Clock size={14} className="text-purple-300" /><span>Be notified first when we launch</span></div>
                </motion.div>
                <motion.div layout>
                  <PremiumButton
                    type="submit"
                    variant="gradient"
                    size="lg"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    animations={['magnetic', 'glow', 'ripple']}
                    fullWidth
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                  >
                    {isSubmitting ? 'Joining Waitlist...' : 'Join Waitlist'}
                  </PremiumButton>
                </motion.div>
              </motion.form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default WaitlistModal;
