export default function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div className="flex items-start gap-4 min-w-0">
        {Icon && (
          <div className="h-12 w-12 shrink-0 rounded-2xl border border-white/10 bg-grad-primary/10 bg-scan-500/10 flex items-center justify-center text-scan-400 shadow-glow">
            <Icon size={22} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-mist-100">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-mist-500 max-w-xl">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
