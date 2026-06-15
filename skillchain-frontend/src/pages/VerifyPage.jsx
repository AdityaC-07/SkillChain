import React from 'react'
import { Link } from 'react-router-dom'
import {
  Fingerprint,
  Info,
  Search,
  Shield,
  ShieldCheck,
  History,
  Landmark,
  XCircle,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react'

const MOCK_VERIFY_DB = {
  "SKILLCHAIN-2025-WLD-00142": {
    status: "VALID",
    learner_name: "Ravi Kumar",
    course_name: "Welding Technology — NSQF Level 4",
    institution: "Government ITI, Delhi",
    completion_date: "2025-05-20",
    grade: "A",
    token_id: "1042",
    tx_hash: "0x7a3f5a2b8c9d1e0f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    contract_address: "0x4B2c8E681A7b9d10F3a4b5C6d7e8f9A0b1c2d3e4",
    ipfs_hash: "QmXoyp1eg2fodz6TXDW25v26ydW5yZAbGdYZc7agH27ul3",
    issued_on_chain: "Polygon Amoy Testnet"
  },
  "SKILLCHAIN-2025-ELC-00089": { 
    status: "VALID", 
    learner_name: "Priya Sharma",
    course_name: "Electrical Wiring — NSQF Level 3",
    institution: "ITI Pune",
    completion_date: "2025-04-10",
    grade: "B",
    token_id: "0891",
    tx_hash: "0x9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
    contract_address: "0x4B2c8E681A7b9d10F3a4b5C6d7e8f9A0b1c2d3e4",
    ipfs_hash: "QmYwAPJrh3tiJ2QA8WQQkL1cq4pyvwT9kw4796B871H252",
    issued_on_chain: "Polygon Amoy Testnet"
  },
  "SKILLCHAIN-2025-PLM-00203": {
    status: "VALID",
    learner_name: "Amit Verma",
    course_name: "Plumbing & Pipefitting — NSQF Level 3",
    institution: "Govt ITI, Lucknow",
    completion_date: "2026-06-01",
    grade: "A",
    token_id: "0203",
    tx_hash: "0x2f8a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a",
    contract_address: "0x4B2c8E681A7b9d10F3a4b5C6d7e8f9A0b1c2d3e4",
    ipfs_hash: "QmZ3P7t4YJd1K5XF9N8s3w2eG6q4D7u8H9z0x1c2v3b4",
    issued_on_chain: "Polygon Amoy Testnet"
  },
  "FAKE-00000": { status: "INVALID" }
};

export default function VerifyPage() {
  const [searchId, setSearchId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [searched, setSearched] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qId = params.get('id');
    if (qId) {
      setSearchId(qId);
      setLoading(true);
      setResult(null);
      setSearched(true);
      setTimeout(() => {
        const matched = MOCK_VERIFY_DB[qId];
        if (matched) {
          setResult(matched);
        } else {
          setResult({ status: "INVALID" });
        }
        setLoading(false);
      }, 1200);
    }
  }, []);

  const truncateHash = (str, start = 6, end = 4) => {
    if (!str) return '';
    if (str.length <= start + end) return str;
    return `${str.substring(0, start)}...${str.substring(str.length - end)}`;
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setResult(null);
    setSearched(true);

    setTimeout(() => {
      const cleanId = searchId.trim();
      const matched = MOCK_VERIFY_DB[cleanId];
      if (matched) {
        setResult(matched);
      } else {
        setResult({ status: "INVALID" });
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col pt-4 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FFEFE0] rounded-full blur-[120px] -z-10 opacity-70"></div>
      
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold text-[#1A1816] leading-tight tracking-tight mb-4">
          Validate <span className="text-[#8B4513]">Achievement.</span>
        </h1>
        <p className="text-[#5C5854] text-lg max-w-2xl leading-relaxed">
          Enter a certificate ID to instantly verify vocational credentials on the blockchain. 
          Our decentralized ledger ensures that every skill is tamper-proof and authentic.
        </p>
      </div>

      <div className="bg-white border border-[#EAE3DC] rounded-3xl p-8 mb-8 shadow-sm">
        <label className="block text-[11px] font-bold text-[#5C5854] tracking-wider uppercase mb-4">
          CERTIFICATE ID VERIFICATION
        </label>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 flex items-center border border-[#EAE3DC] rounded-xl px-4 bg-[#FDFBFA]">
            <Fingerprint className="w-5 h-5 text-[#8B8276] mr-3 shrink-0" />
            <input 
              type="text" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Try: SKILLCHAIN-2025-WLD-00142" 
              className="flex-1 bg-transparent border-none focus:outline-none py-4 text-[#1A1816] placeholder-[#8B8276]"
            />
          </div>
          <button type="submit" className="bg-[#8B4513] text-white px-8 py-4 md:py-0 rounded-xl font-bold hover:bg-[#8B4513] transition-colors whitespace-nowrap">
            Verify Now
          </button>
        </form>
        <div className="flex flex-col lg:flex-row lg:justify-between text-xs text-[#8B8276] mt-4 gap-2">
          <div className="flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Searching live blockchain node: SkillChain-Mainnet-v2
          </div>
          <div className="font-medium text-left">
            Demo mode — try the sample certificate ID:{" "}
            <button 
              type="button" 
              onClick={() => setSearchId("SKILLCHAIN-2025-WLD-00142")}
              className="font-bold text-[#A0522D] hover:underline cursor-pointer"
            >
              SKILLCHAIN-2025-WLD-00142
            </button>
          </div>
        </div>
      </div>

      <div className="mb-20">
        {loading && (
          <div className="border border-[#EAE3DC] bg-white rounded-3xl p-12 flex flex-col items-center justify-center min-h-[240px] shadow-sm animate-fade-in">
            <Loader2 className="w-10 h-10 text-[#8B4513] animate-spin mb-4" />
            <p className="text-[#1A1816] font-bold text-lg animate-pulse">Checking blockchain ledger...</p>
            <p className="text-xs text-[#8B8276] mt-2">Querying decentralized smart contract state</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="border border-dashed border-[#D2C8BC] rounded-3xl h-48 flex flex-col items-center justify-center bg-transparent">
            <Search className="w-8 h-8 text-[#8B8276] mb-4" strokeWidth={1.5} />
            <p className="text-[#5C5854] text-sm font-medium">Enter a certificate ID above to begin</p>
          </div>
        )}

        {!loading && searched && result && result.status === "VALID" && (
          <div className="bg-white border border-[#EAE3DC] rounded-3xl p-8 shadow-sm animate-fade-in">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-[#EAE3DC] pb-6 mb-6">
              <div className="flex items-center space-x-2 bg-[#F2F4E6] px-4 py-2 rounded-full border border-green-200">
                <ShieldCheck className="w-5 h-5 text-[#6B7240]" strokeWidth={2} />
                <span className="text-[11px] font-black tracking-widest text-[#6B7240] uppercase">VERIFIED</span>
              </div>
              <span className="text-xs font-bold text-[#8B8276]">{result.issued_on_chain}</span>
            </div>

            {/* Learner Name */}
            <div className="mb-6">
              <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-wider mb-1">LEARNER NAME</p>
              <h2 className="text-3xl font-extrabold text-[#1A1816]">{result.learner_name}</h2>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-[#FDFBFA] border border-[#EAE3DC] rounded-2xl">
                <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-wider mb-1">COURSE NAME</p>
                <p className="text-sm font-extrabold text-[#1A1816]">{result.course_name}</p>
              </div>

              <div className="p-4 bg-[#FDFBFA] border border-[#EAE3DC] rounded-2xl">
                <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-wider mb-1">ISSUING INSTITUTION</p>
                <p className="text-sm font-extrabold text-[#1A1816]">{result.institution}</p>
              </div>

              <div className="p-4 bg-[#FDFBFA] border border-[#EAE3DC] rounded-2xl">
                <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-wider mb-1">DATE OF COMPLETION</p>
                <p className="text-sm font-extrabold text-[#1A1816]">{result.completion_date}</p>
              </div>

              <div className="p-4 bg-[#FDFBFA] border border-[#EAE3DC] rounded-2xl">
                <p className="text-[#8B8276] text-[10px] font-bold uppercase tracking-wider mb-1">GRADE / EVALUATION</p>
                <p className="text-sm font-extrabold text-[#1A1816]">{result.grade}</p>
              </div>
            </div>

            {/* Blockchain Metadata Panel */}
            <div className="bg-[#F5F1EB] rounded-2xl p-6 border border-[#EAE3DC]">
              <div className="flex items-center space-x-2 mb-4 border-b border-[#EAE3DC] pb-3">
                <ShieldCheck className="w-4 h-4 text-[#4F6C8A]" />
                <span className="text-[10px] font-bold tracking-wider text-[#4F6C8A] uppercase">BLOCKCHAIN SECURE DATA</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[#8B8276] text-[9px] font-bold uppercase tracking-wider">NFT TOKEN ID</p>
                  <p className="font-mono text-[#1A1816] mt-0.5">{result.token_id}</p>
                </div>

                <div>
                  <p className="text-[#8B8276] text-[9px] font-bold uppercase tracking-wider">CONTRACT ADDRESS</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono text-[#1A1816]">{truncateHash(result.contract_address)}</span>
                    <button 
                      type="button" 
                      onClick={() => handleCopy(result.contract_address, 'contract')} 
                      className="text-[#8B8276] hover:text-[#1A1816] transition-colors p-1 rounded hover:bg-[#EAE3DC]"
                    >
                      {copiedField === 'contract' ? (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1 rounded animate-fade-in">Copied!</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 font-bold cursor-pointer" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[#8B8276] text-[9px] font-bold uppercase tracking-wider">TRANSACTION HASH</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono text-[#1A1816]">{truncateHash(result.tx_hash)}</span>
                    <a 
                      href="#" 
                      onClick={(e) => e.preventDefault()}
                      className="text-[#8B8276] hover:text-[#4F6C8A] transition-colors p-1 rounded hover:bg-[#EAE3DC] flex items-center"
                      title="View on Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 cursor-pointer" />
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-[#8B8276] text-[9px] font-bold uppercase tracking-wider">IPFS STORAGE HASH</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono text-[#1A1816]">{truncateHash(result.ipfs_hash)}</span>
                    <button 
                      type="button" 
                      onClick={() => handleCopy(result.ipfs_hash, 'ipfs')} 
                      className="text-[#8B8276] hover:text-[#1A1816] transition-colors p-1 rounded hover:bg-[#EAE3DC]"
                    >
                      {copiedField === 'ipfs' ? (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1 rounded animate-fade-in">Copied!</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 font-bold cursor-pointer" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link
                to="/fraud"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B4513] hover:text-[#8B4513] transition-colors"
              >
                Suspicious? Run a fraud scan <span className="text-base leading-none">→</span>
              </Link>
            </div>
          </div>
        )}

        {!loading && searched && result && result.status === "INVALID" && (
          <div className="bg-[#FDFBFA] border border-red-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm animate-fade-in">
            <XCircle className="w-16 h-16 text-[#C93C3C] mb-4" strokeWidth={1.5} />
            <h3 className="font-extrabold text-[#1A1816] text-xl mb-2">Certificate Not Found</h3>
            <p className="text-[#C93C3C] font-semibold text-sm max-w-md">
              Certificate not found on blockchain.
            </p>
            <p className="text-xs text-[#8B8276] mt-4 max-w-sm">
              The credentials matching this ID could not be retrieved from the decentralized ledger. Please double-check for errors, or verify with the issuing institute.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4 pb-20">
        {[
          { icon: Shield, label: 'ISO 27001 CERTIFIED' },
          { icon: ShieldCheck, label: 'GDPR COMPLIANT' },
          { icon: History, label: 'IMMUTABLE LOGS' },
          { icon: Landmark, label: 'GOV APPROVED' },
        ].map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#F5F1EB] rounded-full flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-[#8B8276]" strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-bold text-[#8B8276] tracking-wide uppercase">{feat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  )
}
