"use client";

import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { PromotedBrands } from "@/components/sections/promoted-brands";

export const metadata = {
  title: "Most Lovable Brands — Pilotaż dla sellerów FashionHero",
  description: "Pierwszy płatny placement na homepage FashionHero. CPC, 500 zł kredytu na start, ryzyko po naszej stronie. Pilotaż dla 30 sellerów.",
};

function track(event: string, payload: Record<string, unknown> = {}) {
  const evt = { event, timestamp: new Date().toISOString(), ...payload };
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(evt);
  }
  console.log("[pilot_mlb_event]", evt);
}

export default function PilotMLB() {
  const formRef = useRef<HTMLDivElement>(null);
  const formScrollLogged = useRef(false);

  useEffect(() => {
    track("page_view", { page: "/pilot-mlb" });
  }, []);

  useEffect(() => {
    if (!formRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !formScrollLogged.current) {
            formScrollLogged.current = true;
            track("scroll_to_form");
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(formRef.current);
    return () => obs.disconnect();
  }, []);

  const scrollToForm = () => {
    track("hero_cta_click");
    const el = document.getElementById("form") ?? formRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <Hero onCta={scrollToForm} />
      <StatStrip />
      <SectionWhatItIs />
      <SectionDashboard />
      <SectionForWho />
      <SectionOffer />
      <SectionForm ref={formRef} />
      <SectionFAQ />
      <BottomBar />
    </div>
  );
}

function TopBar() {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-30">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        <span className="text-[22px] leading-none tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", fontWeight: 400 }}>FashionHero</span>
        <span className="uppercase text-[10px] px-2.5 py-1 border" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "2px", borderColor: "#e8d28a", color: "#8a6d1f" }}>
          Pilot · Most Lovable Brands
        </span>
      </div>
    </header>
  );
}

function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-10 md:pb-14">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        <div>
          <h1 className="uppercase text-[44px] md:text-[64px] leading-[0.95]" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.005em" }}>
            Pokaż swoją markę 2,4 mln kupujących. Płać tylko za kliki.
          </h1>
          <p className="mt-7 text-[17px] md:text-[19px] leading-[1.6] text-muted-foreground font-light max-w-[520px]">
            Most Lovable Brands to pierwszy płatny placement na homepage FashionHero, w którym płacisz tylko za realne kliknięcia. Dołącz do pilotażu jako jeden z pierwszych 30 sellerów.
          </p>
          <div className="mt-9 flex flex-col items-start gap-3">
            <button type="button" onClick={onCta} className="uppercase font-medium bg-foreground text-background py-4 px-10 text-[11px] hover:opacity-90 transition-opacity" style={{ letterSpacing: "0.25em" }}>
              Zapisz się do pilotażu
            </button>
            <p className="text-[13px] text-muted-foreground">30 sellerów · 500 zł kredytu na start · ryzyko po naszej stronie</p>
          </div>
        </div>
        <div className="flex justify-center md:justify-end"><SampleTile /></div>
      </div>
    </section>
  );
}

function SampleTile() {
  const accent = "#7a3b5c";
  return (
    <div className="relative bg-card border border-border w-full max-w-[360px] flex flex-col" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <span className="absolute top-2.5 right-2.5 z-10 bg-background uppercase font-semibold px-2 py-1 border" style={{ fontSize: "9px", letterSpacing: "1px", borderColor: "#e8d28a", color: "#8a6d1f" }}>PROMOTED</span>
      <div className="aspect-square flex items-center justify-center px-6" style={{ background: `linear-gradient(180deg, ${accent}10 0%, ${accent}22 100%)` }}>
        <div className="text-center" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "26px", letterSpacing: "-0.5px", color: accent, lineHeight: 1.1 }}>Twoja marka</div>
      </div>
      <div className="p-5 flex flex-col gap-4 flex-1">
        <p style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: "14px", fontWeight: 400, lineHeight: 1.5, color: "#6b6b6b" }}>Twój claim, Twoja kolekcja, kuratorska sekcja na homepage.</p>
        <span className="uppercase border border-foreground/80 text-foreground rounded-full px-5 py-2.5 mt-auto self-start" style={{ fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}>Zobacz kolekcję</span>
      </div>
    </div>
  );
}

function StatStrip() {
  const stats = [
    { v: "1 619 zł", d: "średni miesięczny external spend sellera" },
    { v: "54%", d: "sellerów płaci za marketing poza platformą" },
    { v: "2,4 mln", d: "aktywnych kupujących FashionHero" },
  ];
  return (
    <section className="border-y border-border bg-background">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 md:py-10 grid grid-cols-1 md:grid-cols-3 md:divide-x divide-border">
        {stats.map((s, i) => (
          <div key={s.v} className={`flex flex-col gap-1.5 md:px-8 ${i === 0 ? "md:pl-0" : ""} ${i === stats.length - 1 ? "md:pr-0" : ""} py-3 md:py-0`}>
            <div className="uppercase text-[28px] md:text-[34px] leading-[0.95] text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{s.v}</div>
            <p className="text-[13px] leading-[1.45] text-muted-foreground font-light max-w-[260px]">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionShell({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "soft" }) {
  return (
    <section className={`border-t border-border ${tone === "soft" ? "bg-secondary" : "bg-background"}`}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-14 md:py-16">{children}</div>
    </section>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="uppercase text-[36px] md:text-[52px] leading-[0.95] mb-8 max-w-[860px] text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{children}</h2>;
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[16px] md:text-[17px] leading-[1.65] text-foreground/80 font-light max-w-[760px]">{children}</p>;
}

function SectionWhatItIs() {
  return (
    <SectionShell tone="soft">
      <H2>Twoja marka w promowanej sekcji na stronie głównej</H2>
      <div className="mt-2">
        <div className="border border-border bg-background overflow-hidden pointer-events-none select-none" aria-hidden="true">
          <PromotedBrands />
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground text-center">Tak Twoja marka będzie wyglądać dla naszych 2,4 mln aktywnych kupujących.</p>
      </div>
    </SectionShell>
  );
}

function SectionDashboard() {
  return (
    <SectionShell tone="soft">
      <H2>Pełna atrybucja, nie zgadywanie</H2>
      <Lead>
        Po starcie placementu codziennie widzisz w dashboardzie: ile kliknięć przyszło z MLB, ile kosztowały, ile sprzedaży i zwrotów wygenerowały, jaki jest ROI net. Możesz porównać MLB z Twoim aktualnym wydatkiem na marketing zewnętrzny i zdecydować, co działa lepiej.
      </Lead>
      <div className="mt-10">
        <PreviewFrame src="/mlb-dashboard" caption="Tak wygląda Twój panel wyników po pierwszym tygodniu placementu." height={760} />
      </div>
    </SectionShell>
  );
}

function SectionForWho() {
  const items = [
    "Wydajesz na marketing zewnętrzny — Instagram, agencje, paid social, influencerzy",
    "Chcesz wiedzieć, czy ten budżet faktycznie Ci się zwraca w sprzedaży",
    "Aspirujesz do bycia rozpoznawalną marką, nie tylko wystawcą produktu",
  ];
  return (
    <SectionShell>
      <H2>MLB jest dla Ciebie, jeśli oczekujesz od wydatku na reklamę więcej</H2>
      <Lead>Pilotaż MLB ma sens dla Ciebie, jeśli:</Lead>
      <ul className="mt-8 space-y-4 max-w-[820px]">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-4">
            <span className="shrink-0 mt-[8px] w-2 h-2" style={{ background: "#8a6d1f" }} />
            <span className="text-[16px] leading-[1.55] text-foreground/90 font-light">{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-[15px] leading-[1.6] text-muted-foreground max-w-[760px]">Jeśli to Ty — zapisz się poniżej.</p>
    </SectionShell>
  );
}

function SectionOffer() {
  const cards = [
    { v: "30 sellerów", d: "Limit miejsc w pierwszej fali" },
    { v: "500 zł", d: "Kredyt od FashionHero na pierwsze 30 dni" },
    { v: "Bez zobowiązań", d: "Kontynuujesz tylko, jeśli widzisz wartość" },
    { v: "Start: czerwiec 2026", d: "Rekrutacja do 31 maja" },
  ];
  return (
    <SectionShell tone="soft">
      <H2>Pilotaż: pierwsze 30 sellerów</H2>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.v} className="border border-border bg-background p-6 flex flex-col gap-3">
            <div className="uppercase text-[26px] leading-[1.0] text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{c.v}</div>
            <p className="text-[13px] leading-[1.5] text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="uppercase text-[10px] text-background/60" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "2px" }}>{label}{required && " *"}</span>
      {children}
    </div>
  );
}

const SectionForm = forwardRef<HTMLDivElement>((_props, ref) => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [shop, setShop] = useState("");
  const [spend, setSpend] = useState("");
  const [ahaText, setAhaText] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedShop = shop.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) { setError("Podaj poprawny adres email."); return; }
    if (!trimmedShop) { setError("Podaj nazwę sklepu."); return; }
    if (!spend) { setError("Wybierz miesięczne wydatki na marketing."); return; }
    if (!consent) { setError("Potwierdź zgodę na kontakt."); return; }
    setError(null);
    const payload = { email: trimmedEmail, shop: trimmedShop, marketing_spend: spend, aha_text: ahaText.trim() || null, submitted_at: new Date().toISOString() };
    try {
      const existing = JSON.parse(localStorage.getItem("pilot_mlb_signups") || "[]");
      existing.push(payload);
      localStorage.setItem("pilot_mlb_signups", JSON.stringify(existing));
    } catch { /* ignore */ }
    track("form_submit", payload);
    setSubmitted(true);
  };

  return (
    <section id="form" ref={ref} className="border-t border-border bg-foreground text-background">
      <div className="max-w-[760px] mx-auto px-6 md:px-8 py-14 md:py-16">
        {!submitted ? (
          <>
            <h2 className="uppercase text-[36px] md:text-[52px] leading-[0.95] mb-4 text-background" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Zarezerwuj miejsce</h2>
            <p className="text-[16px] leading-[1.6] text-background/70 mb-10 font-light">Wypełnij formularz, wracamy do Ciebie w ciągu 48h z potwierdzeniem i terminem onboardingu.</p>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <Field label="Email" required>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="w-full bg-transparent border-b border-background/30 px-0 py-3 text-[16px] placeholder:text-background/30 focus:outline-none focus:border-background transition-colors" placeholder="ty@twojamarka.pl" />
              </Field>
              <Field label="Nazwa sklepu na FashionHero" required>
                <input type="text" required value={shop} onChange={(e) => setShop(e.target.value)} maxLength={120} className="w-full bg-transparent border-b border-background/30 px-0 py-3 text-[16px] placeholder:text-background/30 focus:outline-none focus:border-background transition-colors" placeholder="np. Maison Noir" />
              </Field>
              <Field label="Średnie miesięczne wydatki na marketing zewnętrzny" required>
                <select value={spend} onChange={(e) => setSpend(e.target.value)} required className={`w-full bg-transparent border-b border-background/30 px-0 py-3 text-[16px] focus:outline-none focus:border-background transition-colors appearance-none ${spend ? "text-background" : "text-background/50"}`}>
                  <option value="" className="text-foreground bg-background">Wybierz…</option>
                  <option value="prefer_not_to_say" className="text-foreground bg-background">Wolę nie podawać</option>
                  <option value="none" className="text-foreground bg-background">Nie wydaję</option>
                  <option value="0-500" className="text-foreground bg-background">do 500 zł</option>
                  <option value="500-2000" className="text-foreground bg-background">500–2 000 zł</option>
                  <option value="2000-5000" className="text-foreground bg-background">2 000–5 000 zł</option>
                  <option value="5000+" className="text-foreground bg-background">powyżej 5 000 zł</option>
                </select>
              </Field>
              <Field label="Dlaczego zainteresował Cię pilotaż MLB? (opcjonalnie)">
                <textarea value={ahaText} onChange={(e) => setAhaText(e.target.value)} maxLength={1000} rows={3} className="w-full bg-transparent border-b border-background/30 px-0 py-3 text-[16px] placeholder:text-background/30 focus:outline-none focus:border-background transition-colors resize-none" placeholder="Co Cię najbardziej zaciekawiło w tej propozycji?" />
              </Field>
              <label className="flex items-start gap-3 text-[14px] text-background/80 cursor-pointer font-light">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-[3px] w-4 h-4 accent-white" required />
                <span>Zgadzam się na kontakt w sprawie pilotażu Most Lovable Brands.</span>
              </label>
              {error && <p className="text-[13px]" style={{ color: "var(--destructive)" }}>{error}</p>}
              <button type="submit" className="uppercase font-medium bg-background text-foreground py-4 px-10 text-[11px] hover:opacity-90 transition-opacity" style={{ letterSpacing: "0.25em" }}>Zarezerwuj miejsce w pilotażu</button>
            </form>
          </>
        ) : (
          <div className="py-6">
            <h2 className="uppercase text-[40px] md:text-[56px] leading-[0.95] mb-4 text-background" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Dziękujemy!</h2>
            <p className="text-[16px] leading-[1.65] text-background/75 max-w-[560px] font-light">Twoje miejsce jest zarezerwowane. Wracamy do Ciebie w ciągu 48h z dalszymi informacjami o pilotażu MLB.</p>
          </div>
        )}
      </div>
    </section>
  );
});
SectionForm.displayName = "SectionForm";

function SectionFAQ() {
  const items = [
    { q: "Co jeśli nie wykorzystam całych 500 zł kredytu?", a: "Niewykorzystany budżet wygasa po 30 dniach. Decydujesz, czy kontynuować placement własnymi pieniędzmi — bez presji." },
    { q: "Czy mogę zrezygnować w dowolnym momencie?", a: "Tak, w każdej chwili po starcie pilotażu. Bez kar, bez opłat za wcześniejsze zakończenie. Płacisz tylko za faktyczne kliknięcia, które już się wydarzyły." },
    { q: "Kto decyduje, które marki pojawiają się w sekcji MLB?", a: "W pilotażu rotacja jest manualna — zespół FashionHero zapewnia, że każdy seller w pilotażu dostaje sprawiedliwy udział wyświetleń. Po pilotażu wprowadzimy aukcyjny model rotacji." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SectionShell>
      <H2>Najczęstsze pytania</H2>
      <ul className="mt-6 divide-y divide-border border-y border-border max-w-[860px]">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <li key={it.q}>
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-6 py-5 text-left">
                <span className="uppercase text-[20px] md:text-[24px] leading-snug text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{it.q}</span>
                <span className="shrink-0 text-[20px] leading-none transition-transform text-foreground" style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }} aria-hidden>+</span>
              </button>
              {isOpen && <p className="pb-6 pr-10 text-[15px] leading-[1.65] text-muted-foreground font-light">{it.a}</p>}
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

function BottomBar() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8 flex items-center justify-between text-[12px] text-muted-foreground">
        <span className="uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "2px" }}>FashionHero · Most Lovable Brands</span>
        <span>© {new Date().getFullYear()} FashionHero, Inc.</span>
      </div>
    </footer>
  );
}

function PreviewFrame({ src, caption, height = 720 }: { src: string; caption: string; height?: number }) {
  return (
    <figure className="space-y-4">
      <div className="border border-border bg-background overflow-hidden">
        <iframe src={src} title={caption} loading="lazy" className="w-full block" style={{ height, border: 0 }} />
      </div>
      <figcaption className="text-[13px] text-muted-foreground text-center">{caption}</figcaption>
    </figure>
  );
}
