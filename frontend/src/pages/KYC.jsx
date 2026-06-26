import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, FileText, UploadCloud, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';

const KYC = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const [idType, setIdType] = useState('Aadhaar');
  const [idNum, setIdNum] = useState('');
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState('Not Started'); // 'Not Started', 'Pending', 'Verified', 'Rejected'
  const [kycData, setKycData] = useState(null);

  useEffect(() => {
    if (uid) {
      const saved = localStorage.getItem(`kyc_data_${uid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setKycStatus(parsed.status);
        setKycData(parsed);
      }
    }
  }, [uid]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!idNum) return;
    setSubmitting(true);
    
    setTimeout(() => {
      const record = {
        idType,
        idNum: idNum.replace(/.(?=.{4})/g, '*'), // Mask ID number
        status: 'Pending',
        submittedAt: new Date().toLocaleDateString(),
      };
      localStorage.setItem(`kyc_data_${uid}`, JSON.stringify(record));
      setKycStatus('Pending');
      setKycData(record);
      setSubmitting(false);

      // Auto approve after 10s for simulation purposes
      setTimeout(() => {
        const approvedRecord = { ...record, status: 'Verified' };
        localStorage.setItem(`kyc_data_${uid}`, JSON.stringify(approvedRecord));
        if (localStorage.getItem('rental_user')) {
          setKycStatus('Verified');
          setKycData(approvedRecord);
        }
      }, 10000);
    }, 2000);
  };

  const handleReset = () => {
    localStorage.removeItem(`kyc_data_${uid}`);
    setKycStatus('Not Started');
    setKycData(null);
    setIdNum('');
    setFrontFile(null);
    setBackFile(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="space-y-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Identity Verification (KYC)</h1>
            <p className="text-xs text-slate-400">Upload your government ID to unlock higher rental limits and wave deposit requirements.</p>
          </div>
        </div>

        {kycStatus === 'Verified' && (
          <div className="glass-card rounded-2xl p-6 border-emerald-500/20 bg-emerald-500/5 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30">
              <CheckCircle size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Your Profile is Verified!</h2>
              <p className="text-xs text-slate-400">Your KYC document has been processed and approved. You are ready to book unlimited premium rentals.</p>
            </div>
            <div className="inline-block bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-left text-xs text-slate-300">
              <p><span className="font-semibold text-slate-400">ID Type:</span> {kycData?.idType}</p>
              <p><span className="font-semibold text-slate-400">ID Number:</span> {kycData?.idNum}</p>
              <p><span className="font-semibold text-slate-400">Verified Date:</span> {kycData?.submittedAt}</p>
            </div>
            <div>
              <button onClick={handleReset} className="text-xs text-red-400 hover:underline font-semibold flex items-center gap-1 mx-auto"><RefreshCcw size={12} /> Reset KYC</button>
            </div>
          </div>
        )}

        {kycStatus === 'Pending' && (
          <div className="glass-card rounded-2xl p-6 border-yellow-500/20 bg-yellow-500/5 text-center space-y-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto text-yellow-400 border border-yellow-500/30 animate-pulse">
              <FileText size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Verification In Progress</h2>
              <p className="text-xs text-slate-400">Your documents are under review by our compliance team. This typically takes up to 2 hours.</p>
              <p className="text-[10px] text-cyan-400 font-bold animate-pulse mt-2">💡 Demo Mode: Auto-approving in 10 seconds...</p>
            </div>
            <div className="inline-block bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-left text-xs text-slate-300">
              <p><span className="font-semibold text-slate-400">ID Type:</span> {kycData?.idType}</p>
              <p><span className="font-semibold text-slate-400">ID Number:</span> {kycData?.idNum}</p>
              <p><span className="font-semibold text-slate-400">Submitted Date:</span> {kycData?.submittedAt}</p>
            </div>
            <div>
              <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-400 hover:underline font-semibold flex items-center gap-1 mx-auto"><RefreshCcw size={12} /> Start Over</button>
            </div>
          </div>
        )}

        {kycStatus === 'Not Started' && (
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Select Document Type *</label>
                  <select value={idType} onChange={e => setIdType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-sm text-white transition-colors">
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Document / ID Number *</label>
                  <input type="text" required value={idNum} onChange={e => setIdNum(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-sm text-white transition-colors" 
                    placeholder={idType === 'Aadhaar' ? '12-Digit Aadhaar' : idType === 'PAN' ? '10-Digit PAN Code' : 'Passport Number'} />
                </div>
              </div>

              {/* Upload Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Document Front View *</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-950/30 flex flex-col items-center justify-center min-h-[140px]"
                    onClick={() => document.getElementById('front-file-input').click()}>
                    <input type="file" id="front-file-input" className="hidden" onChange={e => setFrontFile(e.target.files[0])} accept="image/*,application/pdf" />
                    {frontFile ? (
                      <div className="text-xs font-semibold text-cyan-400 space-y-1">
                        <CheckCircle size={28} className="mx-auto text-emerald-400 mb-1" />
                        <p className="truncate max-w-[200px]">{frontFile.name}</p>
                        <p className="text-[10px] text-slate-500">{(frontFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="text-slate-600 mb-2" size={24} />
                        <p className="text-xs font-semibold text-slate-200">Upload Front Side</p>
                        <p className="text-[10px] text-slate-500 mt-1">JPEG, PNG, PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Document Back View *</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-950/30 flex flex-col items-center justify-center min-h-[140px]"
                    onClick={() => document.getElementById('back-file-input').click()}>
                    <input type="file" id="back-file-input" className="hidden" onChange={e => setBackFile(e.target.files[0])} accept="image/*,application/pdf" />
                    {backFile ? (
                      <div className="text-xs font-semibold text-cyan-400 space-y-1">
                        <CheckCircle size={28} className="mx-auto text-emerald-400 mb-1" />
                        <p className="truncate max-w-[200px]">{backFile.name}</p>
                        <p className="text-[10px] text-slate-500">{(backFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="text-slate-600 mb-2" size={24} />
                        <p className="text-xs font-semibold text-slate-200">Upload Back Side</p>
                        <p className="text-[10px] text-slate-500 mt-1">JPEG, PNG, PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b]/30 border border-slate-800 rounded-xl p-3 flex gap-2.5">
                <AlertCircle className="text-cyan-400 shrink-0 mt-0.5" size={15} />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  RentEase takes privacy seriously. Your uploaded documents are encrypted end-to-end and stored securely. They are strictly used for identity verification and fraud prevention.
                </p>
              </div>

              <button type="submit" disabled={submitting || !frontFile || !backFile || !idNum}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50">
                {submitting ? 'Submitting Documents...' : 'Submit KYC Documents'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYC;
