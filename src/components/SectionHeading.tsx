export default function SectionHeading({
  eyebrow,
  title,
  accent,
  sub,
  light = false,
  center = false,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  sub?: string;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`eyebrow ${light ? "!text-gold-400" : ""}`}>{eyebrow}</p>
      <h2
        className={`font-display mt-3 text-4xl leading-[1.05] font-medium md:text-5xl ${light ? "text-ivory" : "text-espresso-900"}`}
      >
        {title} {accent && <em className="text-gold-500">{accent}</em>}
      </h2>
      {sub && <p className={`mt-4 text-[15px] leading-relaxed ${light ? "text-ivory/65" : "text-muted"}`}>{sub}</p>}
    </div>
  );
}
