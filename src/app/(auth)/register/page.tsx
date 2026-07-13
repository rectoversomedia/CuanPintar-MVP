'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Buildings,
  Users,
  Envelope,
  Lock,
  User,
  Phone,
  ArrowLeft,
  CheckCircle,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';

type Role = 'advertiser' | 'partner';

function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState<'role' | 'form' | 'success'>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
  });

  const roles = [
    {
      id: 'advertiser' as Role,
      title: 'Advertiser',
      description: 'Launch campaigns and manage partners',
      icon: <Buildings size={32} weight="duotone" />,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      id: 'partner' as Role,
      title: 'Partner',
      description: 'Discover programs and earn commissions',
      icon: <Users size={32} weight="duotone" />,
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('form');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password harus mengandung huruf besar, kecil, angka, dan karakter spesial';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    if (!formData.phone || !/^(\+62|62|0)[0-9]{9,12}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Format nomor HP tidak valid (contoh: 081234567890)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedRole) return;

    setIsLoading(true);

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: selectedRole,
        companyName: formData.companyName,
        phone: formData.phone,
      });

      if (result.success) {
        setStep('success');
      } else {
        setErrors({ submit: result.error || 'Registrasi gagal' });
      }
    } catch (error) {
      setErrors({ submit: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Success State
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-green-600" weight="fill" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registrasi Berhasil!</h1>
          <p className="text-gray-600 mb-6">
            Kami telah mengirim link verifikasi ke email <strong>{formData.email}</strong>.
            Silakan cek email kamu untuk mengaktifkan akun.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="w-full h-12 bg-gradient-to-r from-[#FF6B35] to-[#EC4899] hover:opacity-90"
          >
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a1628] via-[#1a2a4a] to-[#0a1628] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <Link href="/">
              <span className="text-3xl font-bold">
                <span className="text-[#FF6B35]">cuan</span>
                <span className="text-[#0066FF]">pintar</span>
              </span>
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Bergabung dengan CuanPintar.
            <br />
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#EC4899] bg-clip-text text-transparent">
              Mulai hasilkan cuan hari ini.
            </span>
          </h1>

          <div className="space-y-4 mt-12">
            <h3 className="text-lg font-semibold text-white">Keuntungan Bergabung</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#0066FF]" />
                {selectedRole === 'advertiser' ? 'Jangkau 100+ partner terverifikasi' : 'Akses 50+ program dari advertiser'}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                {selectedRole === 'advertiser' ? 'Real-time tracking & fraud detection' : 'Payout transparan dan cepat'}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                {selectedRole === 'advertiser' ? 'Multi-channel distribution' : 'Dashboard analytics lengkap'}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                {selectedRole === 'advertiser' ? 'Dukungan dedicated account manager' : 'Training dan resources eksklusif'}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <blockquote className="text-gray-400 italic">
            &ldquo;Sistem tracking yang transparan bikin kita bisa optimize budget dengan lebih baik.&rdquo;
          </blockquote>
          <p className="text-white mt-2 font-medium">Budi Santoso</p>
          <p className="text-gray-500 text-sm">CEO, JakselNews Media</p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/">
              <span className="text-2xl font-bold">
                <span className="text-[#FF6B35]">cuan</span>
                <span className="text-[#0066FF]">pintar</span>
              </span>
            </Link>
          </div>

          {step === 'role' ? (
            <>
              {/* Role Selection */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Peran Anda</h2>
                <p className="text-gray-500">Siapa kamu dalam ekosistem CuanPintar?</p>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="w-full p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#0066FF] hover:shadow-xl transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}
                      >
                        {role.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{role.title}</h3>
                        <p className="text-gray-500 text-sm">{role.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Already have account */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-[#0066FF] hover:underline font-medium">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Registration Form */}
              <button
                onClick={() => {
                  setStep('role');
                  setSelectedRole(null);
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
              >
                <ArrowLeft size={18} />
                Kembali ke pilihan peran
              </button>

              <div className="text-center mb-8">
                <div
                  className={`w-16 h-16 rounded-2xl mx-auto mb-4 bg-gradient-to-br ${
                    selectedRole === 'advertiser'
                      ? 'from-blue-500 to-blue-600'
                      : 'from-purple-500 to-purple-600'
                  } flex items-center justify-center text-white shadow-lg`}
                >
                  {selectedRole === 'advertiser' ? (
                    <Buildings size={32} weight="duotone" />
                  ) : (
                    <Users size={32} weight="duotone" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Daftar sebagai {selectedRole === 'advertiser' ? 'Advertiser' : 'Partner'}
                </h2>
                <p className="text-gray-500">Lengkapi data di bawah untuk mendaftar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className={`pl-10 h-12 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Envelope size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="email@contoh.com"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className={`pl-10 h-12 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor HP <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="081234567890"
                      value={formData.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className={`pl-10 h-12 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedRole === 'advertiser' ? 'Nama Perusahaan' : 'Nama Brand/Channel'}
                  </label>
                  <Input
                    type="text"
                    placeholder={selectedRole === 'advertiser' ? 'PT ABC Indonesia' : 'JakselNews Media'}
                    value={formData.companyName}
                    onChange={(e) => updateForm('companyName', e.target.value)}
                    className="h-12 border-gray-200"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Minimal 8 karakter"
                      value={formData.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      className={`pl-10 h-12 ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  <p className="text-gray-500 text-xs mt-1">
                    Minimal 8 karakter dengan huruf besar, kecil, angka, dan karakter spesial
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Masukkan password lagi"
                      value={formData.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      className={`pl-10 h-12 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center">
                  Dengan mendaftar, kamu menyetujui{' '}
                  <a href="#" className="text-[#0066FF] hover:underline">Syarat & Ketentuan</a>{' '}
                  dan{' '}
                  <a href="#" className="text-[#0066FF] hover:underline">Kebijakan Privasi</a>
                </p>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#FF6B35] to-[#EC4899] hover:opacity-90 text-white font-semibold shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 0h12a8 8 0 010 16z" />
                      </svg>
                      Mendaftar...
                    </span>
                  ) : (
                    'Daftar'
                  )}
                </Button>
              </form>

              {/* Already have account */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-[#0066FF] hover:underline font-medium">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-gray-500">Loading...</span></div>}>
      <RegisterPage />
    </Suspense>
  );
}
