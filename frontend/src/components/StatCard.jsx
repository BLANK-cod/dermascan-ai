export default function StatCard({ label, value, icon: Icon, accent = "scan", suffix = "" }) {
  const accentClasses = {
    scan: "text-scan-400 border-scan-500/30 bg-scan-500/10",
    coral: "text-clinic-coral border-clinic-coral/30 bg-clinic-coral/10",
    amber: "text-clinic-amber border-clinic-amber/30 bg-clinic-amber/10",
  }[accent];

  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-mist-500">{label}</p>
        <p className="mt-2 font-display text-2xl font-semibold text-mist-100">
          {value}
          {suffix}
        </p>
      </div>
      {Icon && (
        <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${accentClasses}`}>
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}
