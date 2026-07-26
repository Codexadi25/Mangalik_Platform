import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullAddress: '',
    city: '',
    pincode: '',
    state: '',
    contactNo: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // signUp sends a confirmation link (Magic Link)
    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: crypto.randomUUID(), // Dummy password for passwordless flow
      options: {
        emailRedirectTo: window.location.origin + '/account',
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_address: formData.fullAddress,
          city: formData.city,
          pincode: formData.pincode,
          state: formData.state,
          contact_no: formData.contactNo,
        },
      }
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '100px' }}>
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none fixed">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-orange-100 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-red-100 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-yellow-100 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden p-10 border border-white/50 relative z-10 transition-all duration-300">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">Create an Account</h2>
        <p className="text-gray-500 text-center mb-10 font-medium">Join us to get started</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4 mb-6 shadow-sm">
            {error}
          </div>
        )}

        {success ? (
           <div className="text-center space-y-5 py-8">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-500 mb-2 shadow-sm border border-green-100">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
             </div>
             <h3 className="text-2xl font-bold text-gray-800">Check your email</h3>
             <p className="text-gray-500 leading-relaxed">
               We've sent a magic link to <br/><span className="font-semibold text-gray-800">{formData.email}</span><br/>Click the link to verify your account and log in automatically.
             </p>
           </div>
        ) : (
          <form onSubmit={handleSendMagicLink} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E33C24]/20 focus:border-[#E33C24] transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E33C24]/20 focus:border-[#E33C24] transition-all shadow-sm" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E33C24]/20 focus:border-[#E33C24] transition-all shadow-sm" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact No.</label>
                <input required type="tel" name="contactNo" value={formData.contactNo} onChange={handleInputChange} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E33C24]/20 focus:border-[#E33C24] transition-all shadow-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                <textarea required name="fullAddress" rows={2} value={formData.fullAddress} onChange={handleInputChange} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E33C24]/20 focus:border-[#E33C24] transition-all shadow-sm resize-none" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E33C24]/20 focus:border-[#E33C24] transition-all shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E33C24]/20 focus:border-[#E33C24] transition-all shadow-sm" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E33C24]/20 focus:border-[#E33C24] transition-all shadow-sm" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E33C24] hover:bg-[#C62B16] text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E33C24]/30 mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Processing...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div className="mt-10 text-center text-sm text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-[#E33C24] hover:text-[#C62B16] font-bold transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
