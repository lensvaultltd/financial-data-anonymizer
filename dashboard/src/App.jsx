import React, { useState } from 'react';
import { Database, ShieldCheck, Play, ArrowRight } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const runPipeline = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/pipeline/run');
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const Table = ({ title, records, isSecure }) => (
    <div className={`flex-1 bg-slate-800 rounded-lg border overflow-hidden ${isSecure ? 'border-emerald-500/50' : 'border-red-500/50'}`}>
        <div className={`p-4 font-bold text-white flex justify-between items-center ${isSecure ? 'bg-emerald-900/50' : 'bg-red-900/50'}`}>
            {title}
            {isSecure && <ShieldCheck className="text-emerald-400 w-5 h-5"/>}
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-slate-400">
                    <tr>
                        <th className="p-3">Customer</th>
                        <th className="p-3">SSN</th>
                        <th className="p-3">Credit Card</th>
                        <th className="p-3">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map(r => (
                        <tr key={r.transaction_id} className="border-b border-slate-700 hover:bg-slate-700/30 font-mono">
                            <td className="p-3 text-xs">{r.customer_name}</td>
                            <td className={`p-3 text-xs ${isSecure ? 'text-emerald-400' : 'text-red-400'}`}>{r.ssn}</td>
                            <td className={`p-3 text-xs ${isSecure ? 'text-emerald-400' : 'text-red-400'}`}>{r.credit_card}</td>
                            <td className="p-3 text-xs">${r.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <Database className="text-blue-500 w-8 h-8"/>
          Financial ETL & Privacy Pipeline
        </h1>
        <button 
          onClick={runPipeline}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded flex items-center gap-2 transition"
        >
          {loading ? "Processing Pipeline..." : <><Play className="w-5 h-5" /> Execute ETL Pipeline</>}
        </button>
      </div>

      {!data && (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg text-slate-500">
              <Database className="w-12 h-12 mb-4 opacity-50"/>
              <p>Click "Execute ETL Pipeline" to ingest and mask sensitive banking data.</p>
          </div>
      )}

      {data && (
          <div className="flex gap-6 items-start">
              <Table title="Raw Ingestion (Highly Sensitive PII)" records={data.raw_data} isSecure={false} />
              
              <div className="flex flex-col items-center justify-center pt-32 text-slate-500">
                  <ArrowRight className="w-8 h-8 mb-2"/>
                  <span className="text-xs font-bold uppercase tracking-wider">Masking Engine</span>
              </div>

              <Table title="Transformed Output (Safe for Analytics)" records={data.anonymized_data} isSecure={true} />
          </div>
      )}
    </div>
  );
}
