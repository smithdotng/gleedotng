export default function AuthCard({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-sand/60 px-4 py-16">
      <div className="card-luxe w-full max-w-md p-8 md:p-10">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-2 text-4xl text-espresso-900">{title}</h1>
        {sub && <p className="mt-2 text-sm text-muted">{sub}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
