import { Wrench, ShieldCheck, Clock, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

const RepairTracker = () => {
  const repairs = [
    {
      id: 'REP-0822',
      device: 'Apple MacBook Pro 16" M4 Max',
      serial: 'MBP4M-9088-2026',
      issue: 'Liquid damage diagnosis & keyboard replacement',
      status: 'Repairing', // 'Inspection', 'Awaiting Parts', 'Repairing', 'Completed'
      progress: 65,
      cost: '₹14,500',
      diagnostic: 'Liquid trace found near top deck. System board cleaned. Key caps replaced. Run hardware tests.',
      timeline: [
        { label: 'Completed diagnostic & cleaning', date: 'June 21, 2026', done: true },
        { label: 'Received replacement keyboard part', date: 'June 22, 2026', done: true },
        { label: 'Keyboard soldering & assembly', date: 'June 23, 2026', done: true },
        { label: 'Run final Apple Diagnostics testing suite', date: 'Expected June 24, 2026', done: false },
      ]
    },
    {
      id: 'REP-0798',
      device: 'Sony A1 II',
      serial: 'SNY-A1-7055-MX',
      issue: 'Sensor calibration & shutter mechanism inspection',
      status: 'Awaiting Parts',
      progress: 35,
      cost: '₹8,900',
      diagnostic: 'Shutter unit showing wear. Ordered replacement OEM shutter blades from Sony India service hub.',
      timeline: [
        { label: 'Diagnostics & sensor dust cleaning completed', date: 'June 18, 2026', done: true },
        { label: 'Awaiting OEM shutter component delivery', date: 'Expected June 26, 2026', done: false },
        { label: 'Install shutter blades and run focus test', date: 'TBD', done: false },
      ]
    },
    {
      id: 'REP-0744',
      device: 'Samsung Odyssey Ark 2',
      serial: 'SS-OD-ARK-1088',
      issue: 'Cockpit orientation motor mount lubrication & logic board repair',
      status: 'Completed',
      progress: 100,
      cost: '₹4,000',
      diagnostic: 'Orientation sensor reset. Motor mounts greased. Vertical cockpit rotate confirmed stable.',
      timeline: [
        { label: 'Initial cockpit rotate failure log check', date: 'June 14, 2026', done: true },
        { label: 'Diagnostics and motor cleaning', date: 'June 15, 2026', done: true },
        { label: 'Reset sensor calibration and test', date: 'June 16, 2026', done: true },
        { label: 'Final hardware sign-off and return to inventory', date: 'June 17, 2026', done: true },
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Repairing': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse';
      case 'Awaiting Parts': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
            <Wrench size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Fleet Repair & Diagnostic Tracker</h1>
            <p className="text-xs text-slate-400">Track device health diagnostics, repair progress, and maintenance timelines.</p>
          </div>
        </div>

        <div className="space-y-6">
          {repairs.map((rep) => (
            <div key={rep.id} className="glass-card rounded-2xl p-6 border-slate-800 space-y-6">
              {/* Device Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/5 px-2 py-0.5 border border-cyan-500/10 rounded">{rep.id}</span>
                    <span className="text-xs text-slate-500">Serial: {rep.serial}</span>
                  </div>
                  <h2 className="text-base font-bold text-white leading-snug">{rep.device}</h2>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(rep.status)}`}>
                    {rep.status}
                  </span>
                  <span className="text-sm font-bold text-slate-300">{rep.cost}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                  <span>Repair Progress</span>
                  <span>{rep.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${rep.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Diagnostics Box */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 border-t border-slate-800/80 pt-5">
                <div className="md:col-span-3 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Issue Reported</h3>
                    <p className="text-xs text-slate-200 font-semibold">{rep.issue}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Diagnostic Report</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{rep.diagnostic}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="md:col-span-2 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Service Timeline</h3>
                  <div className="space-y-3">
                    {rep.timeline.map((step, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <div className={`mt-1 w-3 h-3 rounded-full flex items-center justify-center border shrink-0 ${
                          step.done 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-slate-900 text-slate-600 border-slate-800'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${step.done ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                        </div>
                        <div>
                          <p className={`text-xs ${step.done ? 'text-slate-300 font-semibold' : 'text-slate-500 font-medium'}`}>{step.label}</p>
                          <p className="text-[9px] text-slate-500">{step.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepairTracker;
