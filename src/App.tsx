import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DropdownMenuComplex } from '@/components/dropdown-menu-complex';
import NotFound from '@/pages/not-found';
import {
  ArrowUpRight,
  Check,
  Clipboard,
  Copy,
  FileText,
  FileUser,
  ImagePlus,
  Mail,
  MapPin,
  Menu,
  MoreHorizontal,
  Phone,
  Printer,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type DocType = 'resume' | 'resign';
type Resume = {
  profilePicture: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  about: string;
  education: string;
  skills: string;
  experience: string;
};
type Resign = {
  date: string;
  recipient: string;
  company: string;
  role: string;
  finalDay: string;
  reason: string;
  message: string;
};

const blankResume: Resume = { profilePicture: '', name: '', role: '', email: '', phone: '', location: '', about: '', education: '', skills: '', experience: '' };
const blankResign: Resign = { date: '', recipient: '', company: '', role: '', finalDay: '', reason: '', message: '' };
const resumeDemo: Resume = {
  profilePicture: '',
  name: 'Nur Aisyah Rahman',
  role: 'Product Designer',
  email: 'aisyah.rahman@mail.com',
  phone: '+60 12 884 2160',
  location: 'Kuala Lumpur, MY',
  about: 'Product designer dengan 5 tahun pengalaman menukar masalah kompleks menjadi pengalaman digital yang jelas, mesra dan berkesan.',
  education: 'B.A. (Hons) Graphic Design, UiTM\n2016 — 2019',
  skills: 'Product strategy, Figma, Design systems, User research, Prototyping',
  experience: 'Product Designer · Kembara Labs\n2022 — Kini\nMemimpin reka bentuk produk B2B yang digunakan oleh 18,000+ pengguna di Asia Tenggara.\n\nUX Designer · Saku Digital\n2020 — 2022\nMembina semula onboarding dan meningkatkan kadar pengaktifan pengguna sebanyak 24%.',
};
const resignDemo: Resign = {
  date: '12 Jun 2024',
  recipient: 'Puan Farah Nadia',
  company: 'Kembara Labs Sdn. Bhd.',
  role: 'Product Designer',
  finalDay: '12 Julai 2024',
  reason: 'Saya telah membuat keputusan untuk meneruskan peluang baharu yang lebih selari dengan hala tuju kerjaya saya.',
  message: 'Saya ingin merakamkan penghargaan atas kepercayaan, bimbingan dan pengalaman yang telah diberikan sepanjang saya bersama pasukan ini. Saya akan memastikan proses serah tugas berjalan lancar dalam tempoh notis.',
};

function readStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || fallback;
  } catch {
    return fallback;
  }
}

function Home() {
  const [doc, setDoc] = useState<DocType>(() => (localStorage.getItem('form-studio-doc') as DocType) || 'resume');
  const [resume, setResume] = useState<Resume>(() => readStored('form-studio-resume', blankResume));
  const [resign, setResign] = useState<Resign>(() => readStored('form-studio-resign', blankResign));
  const [mobileNav, setMobileNav] = useState(false);
  const [saved, setSaved] = useState(true);
  const [toast, setToast] = useState('');
  const [demoVisible, setDemoVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    localStorage.setItem('form-studio-doc', doc);
    localStorage.setItem('form-studio-resume', JSON.stringify(resume));
    localStorage.setItem('form-studio-resign', JSON.stringify(resign));
  }, [doc, resume, resign]);

  const current = doc === 'resume' ? resume : resign;
  const currentFilled = Object.values(current).some(Boolean);
  const setField = (field: string, value: string) => {
    setSaved(false);
    if (doc === 'resume') setResume((value_) => ({ ...value_, [field]: value }));
    else setResign((value_) => ({ ...value_, [field]: value }));
  };
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };
  const loadDemo = () => {
    if (doc === 'resume') setResume(resumeDemo);
    else setResign(resignDemo);
    setDemoVisible(false);
    setSaved(true);
    notify('Contoh dimuatkan. Anda boleh ubah apa sahaja.');
  };
  const reset = () => {
    if (doc === 'resume') setResume(blankResume);
    else setResign(blankResign);
    setSaved(true);
    notify('Dokumen dikosongkan.');
  };
  const copy = async () => {
    await navigator.clipboard?.writeText(doc === 'resume' ? resumeToText(resume) : resignToText(resign));
    notify('Kandungan disalin ke papan keratan.');
  };
  const save = () => {
    localStorage.setItem('form-studio-resume', JSON.stringify(resume));
    localStorage.setItem('form-studio-resign', JSON.stringify(resign));
    setSaved(true);
    notify('Disimpan pada peranti ini.');
  };
  const switchDoc = (next: DocType) => {
    setDoc(next);
    setMobileNav(false);
  };
  const setProfilePicture = (value: string) => {
    setSaved(false);
    setResume((value_) => ({ ...value_, profilePicture: value }));
  };
  const title = doc === 'resume' ? 'Resume interview' : 'Surat berhenti kerja';
  const subtitle = doc === 'resume' ? 'Tunjukkan nilai anda dengan jelas.' : 'Jaga hubungan baik, sampai ke penghujung.';

  return (
    <div className="app-noise min-h-[100dvh] bg-[hsl(var(--background))]">
      <aside className={`no-print fixed inset-y-0 left-0 z-40 flex w-[290px] flex-col bg-[hsl(var(--sidebar))] px-6 py-7 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <button data-testid="button-brand" onClick={() => switchDoc('resume')} className="flex items-center gap-3 text-left">
            <span className="flex h-9 w-9 items-center justify-center bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"><Sparkles size={18} strokeWidth={2.5} /></span>
            <span><b className="font-[var(--app-font-serif)] text-lg tracking-tight">Form Studio</b><small className="block font-mono text-[9px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground))]/45">ruang kerja peribadi</small></span>
          </button>
          <button data-testid="button-close-nav" onClick={() => setMobileNav(false)} className="text-[hsl(var(--sidebar-foreground))]/60 lg:hidden"><X size={19} /></button>
        </div>
        <div className="mt-12 px-2"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground))]/40">Form</p></div>
        <nav aria-label="Menu Form" className="mt-4 ml-2 space-y-1.5 border-l border-[hsl(var(--sidebar-foreground))]/10 pl-2">
          <button data-testid="button-switch-resume" onClick={() => switchDoc('resume')} className={`group flex w-full items-center gap-3 px-3.5 py-3.5 text-left text-sm transition ${doc === 'resume' ? 'bg-[hsl(var(--sidebar-foreground))]/10 text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-foreground))]/5 hover:text-[hsl(var(--sidebar-foreground))]'}`}>
            <FileUser size={18} className={doc === 'resume' ? 'text-[hsl(var(--secondary))]' : ''} /><span className="flex-1">Resume</span><ArrowUpRight size={14} className="opacity-40" />
          </button>
          <button data-testid="button-switch-resign" onClick={() => switchDoc('resign')} className={`group flex w-full items-center gap-3 px-3.5 py-3.5 text-left text-sm transition ${doc === 'resign' ? 'bg-[hsl(var(--sidebar-foreground))]/10 text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-foreground))]/5 hover:text-[hsl(var(--sidebar-foreground))]'}`}>
            <FileText size={18} className={doc === 'resign' ? 'text-[hsl(var(--secondary))]' : ''} /><span className="flex-1">Resign</span><ArrowUpRight size={14} className="opacity-40" />
          </button>
        </nav>
        <div className="mt-auto border-t border-[hsl(var(--sidebar-foreground))]/10 pt-5">
          <button data-testid="button-help" onClick={() => setShowHelp(true)} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-[hsl(var(--sidebar-foreground))]/60 hover:text-[hsl(var(--sidebar-foreground))]"><span className="flex h-5 w-5 items-center justify-center rounded-full border border-[hsl(var(--sidebar-foreground))]/35 text-[11px]">?</span> Cara menggunakan Form Studio</button>
          <div className="mt-6 flex items-center gap-3 border-t border-[hsl(var(--sidebar-foreground))]/10 pt-5"><Avatar src={resume.profilePicture} name={resume.name || 'NA'} size="small" /><div><p className="text-sm font-semibold">{resume.name || 'Profil anda'}</p><p className="font-mono text-[10px] text-[hsl(var(--sidebar-foreground))]/40">disimpan setempat</p></div><MoreHorizontal size={17} className="ml-auto text-[hsl(var(--sidebar-foreground))]/40" /></div>
        </div>
      </aside>
      {mobileNav && <button data-testid="button-overlay-nav" onClick={() => setMobileNav(false)} className="no-print fixed inset-0 z-30 bg-[hsl(var(--foreground))]/40 lg:hidden" aria-label="Tutup navigasi" />}
      <main className="min-h-[100dvh] lg:pl-[290px]">
        <header className="no-print sticky top-0 z-20 flex h-[82px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 md:px-10">
          <button data-testid="button-open-nav" onClick={() => setMobileNav(true)} className="text-[hsl(var(--muted-foreground))] lg:hidden"><Menu size={22} /></button>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenuComplex
              saved={saved}
              onReset={reset}
              onOpenDemo={() => setDemoVisible(true)}
              onSave={save}
            />
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] px-6 py-9 md:px-10 md:py-12">
          <div className="fade-up flex flex-col justify-between gap-5 border-b border-[hsl(var(--border))] pb-8 md:flex-row md:items-end">
            <div><h1 className="font-[var(--app-font-serif)] text-2xl font-extrabold tracking-[-.04em] md:text-[2.25rem]">{title}</h1><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] md:text-base">{subtitle}</p></div>
          </div>
          <div className="mt-10 grid gap-12 xl:grid-cols-[minmax(380px,500px)_minmax(540px,1fr)]">
            <section className="fade-up delay-1 space-y-8">
              <div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Maklumat {doc === 'resume' ? 'utama' : 'surat'}</p><span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{currentFilled ? '01 / 02' : '00 / 02'}</span></div>
              {doc === 'resume' ? <ResumeForm data={resume} setField={setField} setProfilePicture={setProfilePicture} /> : <ResignForm data={resign} setField={setField} />}
              <div className="border-l-2 border-[hsl(var(--secondary))] bg-[hsl(var(--secondary))]/25 px-4 py-3 text-xs leading-relaxed"><b className="font-semibold">Petua kecil</b><br />Tulis seperti anda bercakap dengan seseorang yang anda hormati. Jelas, ringkas, dan yakin.</div>
            </section>
            <section id="preview-panel" className="fade-up delay-2 min-w-0">
              <div className="mb-4 flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Pratonton dokumen</p><div className="flex gap-1"><button data-testid="button-copy-document" onClick={copy} className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><Clipboard size={14} /> Salin</button><button data-testid="button-print-document" onClick={() => window.print()} className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><Printer size={14} /> Cetak</button></div></div>
              {doc === 'resume' ? <ResumePreview data={resume} /> : <ResignPreview data={resign} />}
            </section>
          </div>
        </div>
      </main>
      {toast && <div data-testid="status-toast" className="no-print fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 bg-[hsl(var(--foreground))] px-4 py-3 text-xs font-semibold text-[hsl(var(--background))] shadow-xl"><Check size={15} className="text-[hsl(var(--secondary))]" /> {toast}</div>}
      {demoVisible && <Dialog title="Mulakan dengan contoh?" onClose={() => setDemoVisible(false)}><p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Kami akan isi ruang ini dengan contoh yang realistik. Anda boleh ubah atau padam semua maklumat selepas itu.</p><div className="mt-6 flex justify-end gap-2"><button data-testid="button-cancel-demo" onClick={() => setDemoVisible(false)} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">Batal</button><button data-testid="button-confirm-demo" onClick={loadDemo} className="bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))]">Muatkan contoh</button></div></Dialog>}
      {showHelp && <Dialog title="Cara menggunakan Form Studio" onClose={() => setShowHelp(false)}><div className="space-y-4 text-sm text-[hsl(var(--muted-foreground))]"><p><b className="text-[hsl(var(--foreground))]">1. Pilih dokumen</b><br />Tukar antara resume interview dan surat berhenti kerja di menu kiri.</p><p><b className="text-[hsl(var(--foreground))]">2. Isi maklumat</b><br />Taip pada ruang di sebelah kiri dan lihat perubahan pada pratonton secara langsung.</p><p><b className="text-[hsl(var(--foreground))]">3. Hantar dengan yakin</b><br />Salin kandungan atau cetak sebagai PDF. Data anda kekal pada peranti ini.</p></div></Dialog>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean }) {
  const Tag = multiline ? 'textarea' : 'input';
  return <label className="block"><span className="mb-2.5 block text-xs font-bold">{label}</span><Tag data-testid={`input-${label.toLowerCase().replace(/\s+/g, '-')}`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`w-full border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-3.5 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))]/60 focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/10 ${multiline ? 'min-h-[120px] resize-y leading-relaxed' : 'h-12'} ${multiline ? '' : 'text-base'}`} /></label>;
}

function ResumeForm({ data, setField, setProfilePicture }: { data: Resume; setField: (field: string, value: string) => void; setProfilePicture: (value: string) => void }) {
  const handlePicture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePicture(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = '';
  };
  return <div className="space-y-5"><div><span className="mb-2 block text-xs font-bold">Gambar profil</span><div className="flex items-center gap-4 border border-dashed border-[hsl(var(--input))] bg-[hsl(var(--card))] p-3"><Avatar src={data.profilePicture} name={data.name || 'NA'} size="large" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{data.profilePicture ? 'Gambar profil dipilih' : 'Tambahkan gambar profesional'}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">JPG atau PNG, sebaiknya gambar jelas dan berlatar kemas.</p><div className="mt-3 flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 bg-[hsl(var(--primary))] px-3 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] transition hover:opacity-90"><Upload size={14} /> {data.profilePicture ? 'Tukar gambar' : 'Muat naik gambar'}<input data-testid="input-profile-picture" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePicture} className="sr-only" /></label>{data.profilePicture && <button type="button" data-testid="button-remove-profile-picture" onClick={() => setProfilePicture('')} className="inline-flex items-center gap-2 border border-[hsl(var(--border))] px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--destructive))]"><Trash2 size={14} /> Buang</button>}</div></div></div></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Nama penuh" value={data.name} onChange={(value) => setField('name', value)} placeholder="Contoh: Nur Aisyah Rahman" /><Field label="Jawatan sasaran" value={data.role} onChange={(value) => setField('role', value)} placeholder="Contoh: Product Designer" /></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Emel" value={data.email} onChange={(value) => setField('email', value)} placeholder="nama@email.com" /><Field label="Telefon" value={data.phone} onChange={(value) => setField('phone', value)} placeholder="+60 12 345 6789" /></div><Field label="Lokasi" value={data.location} onChange={(value) => setField('location', value)} placeholder="Kuala Lumpur, MY" /><Field label="Tentang anda" value={data.about} onChange={(value) => setField('about', value)} placeholder="Satu ayat tentang cara anda memberi nilai..." multiline /><Field label="Pendidikan" value={data.education} onChange={(value) => setField('education', value)} placeholder={'Nama institusi\nKelulusan\nTahun'} multiline /><Field label="Kemahiran" value={data.skills} onChange={(value) => setField('skills', value)} placeholder="Pisahkan dengan koma" /><Field label="Pengalaman kerja" value={data.experience} onChange={(value) => setField('experience', value)} placeholder={'Jawatan · Syarikat\nTahun — Tahun\nPencapaian anda...'} multiline /></div>;
}

function Avatar({ src, name, size }: { src?: string; name: string; size: 'small' | 'large' }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'NA';
  return <div className={`relative shrink-0 overflow-hidden rounded-full bg-[hsl(var(--accent))] text-center font-bold text-white ${size === 'large' ? 'h-16 w-16 text-lg' : 'h-9 w-9 text-xs'}`}>{src ? <img src={src} alt={`Gambar profil ${name}`} className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center">{initials}</span>}</div>;
}

function ResignForm({ data, setField }: { data: Resign; setField: (field: string, value: string) => void }) {
  return <div className="space-y-6"><div className="grid gap-5 sm:grid-cols-2"><Field label="Tarikh surat" value={data.date} onChange={(value) => setField('date', value)} placeholder="12 Jun 2024" /><Field label="Tarikh akhir bekerja" value={data.finalDay} onChange={(value) => setField('finalDay', value)} placeholder="12 Julai 2024" /></div><Field label="Kepada" value={data.recipient} onChange={(value) => setField('recipient', value)} placeholder="Nama pengurus atau HR" /><Field label="Nama syarikat" value={data.company} onChange={(value) => setField('company', value)} placeholder="Nama syarikat" /><Field label="Jawatan anda" value={data.role} onChange={(value) => setField('role', value)} placeholder="Jawatan semasa" /><Field label="Sebab ringkas" value={data.reason} onChange={(value) => setField('reason', value)} placeholder="Peluang baharu yang lebih selari..." multiline /><Field label="Nota penghargaan" value={data.message} onChange={(value) => setField('message', value)} placeholder="Terima kasih atas segala pengalaman..." multiline /></div>;
}

function EmptyPreview({ type }: { type: DocType }) {
  return <div className="print-page flex min-h-[620px] items-center justify-center border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-[0_16px_40px_hsl(220_27%_16%/0.06)]"><div className="max-w-[250px]"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">{type === 'resume' ? <FileUser size={24} /> : <FileText size={24} />}</div><h3 className="font-[var(--app-font-serif)] text-lg font-bold">Pratonton anda akan muncul di sini</h3><p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Isi beberapa maklumat di sebelah kiri, atau mulakan dengan contoh.</p></div></div>;
}

function ResumePreview({ data }: { data: Resume }) {
  if (!Object.values(data).some(Boolean)) return <EmptyPreview type="resume" />;
  return <article className="print-page min-h-[620px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-[0_16px_40px_hsl(220_27%_16%/0.08)] sm:p-14"><div className="border-b-2 border-[hsl(var(--foreground))] pb-7"><div className="flex items-start gap-3"><div className="w-20 shrink-0"><Avatar src={data.profilePicture} name={data.name || 'NA'} size="large" /></div><div className="min-w-0 pt-1"><h2 data-testid="text-preview-name" className="font-[var(--app-font-serif)] text-lg font-bold">{data.name || 'Nama penuh anda'}</h2><p className="mt-1 text-base font-semibold text-[hsl(var(--primary))]">{data.role || 'Jawatan sasaran'}</p></div></div><div className="mt-5 text-[10px] leading-tight text-[hsl(var(--muted-foreground))]"><div className="flex flex-wrap items-center gap-x-5 gap-y-2"><ContactLine icon={<Phone size={11} />} value={data.phone} fallback="Telefon" /><ContactLine icon={<Mail size={11} />} value={data.email} fallback="Email" /></div><div className="mt-2"><ContactLine icon={<MapPin size={11} />} value={data.location} fallback="Alamat" /></div></div></div><PreviewBlock title="Profil" text={data.about} /><PreviewBlock title="Pendidikan" text={data.education} /><PreviewBlock title="Pengalaman" text={data.experience} /><PreviewBlock title="Kemahiran" text={data.skills} /></article>;
}

function ContactLine({ icon, value, fallback }: { icon: ReactNode; value: string; fallback: string }) {
  return <p className="flex min-w-0 items-center gap-1.5"><span className="shrink-0 text-[hsl(var(--accent))]">{icon}</span><span className={value ? 'truncate text-[hsl(var(--foreground))]' : 'italic'}>{value || fallback}</span></p>;
}

function PreviewBlock({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return <section className="mt-7"><h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--accent))]">{title}</h3><p className="whitespace-pre-line text-sm leading-7">{text}</p></section>;
}

function ResignPreview({ data }: { data: Resign }) {
  if (!Object.values(data).some(Boolean)) return <EmptyPreview type="resign" />;
  return <article className="print-page min-h-[620px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-[0_16px_40px_hsl(220_27%_16%/0.08)] sm:p-14"><div className="flex justify-between gap-5 border-b border-[hsl(var(--border))] pb-8"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">Surat rasmi</p><h2 className="mt-2 font-[var(--app-font-serif)] text-2xl font-extrabold">Notis peletakan jawatan</h2></div><p className="text-right text-xs text-[hsl(var(--muted-foreground))]">{data.date || 'Tarikh surat'}</p></div><div className="mt-8 text-[15px] leading-8"><p className="font-semibold">{data.recipient || 'Nama penerima'}</p><p>{data.company || 'Nama syarikat'}</p><p className="mt-7">Tuan/Puan,</p><p className="mt-5 font-bold">PER: PELETAKAN JAWATAN SEBAGAI {data.role || 'JAWATAN'}</p><p className="mt-5">Dengan segala hormatnya, saya ingin memaklumkan keputusan untuk meletakkan jawatan sebagai <b>{data.role || 'jawatan semasa'}</b> di {data.company || 'syarikat ini'}. Hari terakhir saya ialah <b>{data.finalDay || 'tarikh akhir'}</b>.</p><p className="mt-5">{data.reason || 'Saya telah membuat keputusan untuk meneruskan peluang baharu.'}</p><p className="mt-5">{data.message || 'Terima kasih atas segala kepercayaan dan pengalaman yang telah diberikan.'}</p><p className="mt-7">Sekian, terima kasih.</p><p className="mt-8 font-semibold">{data.recipient || 'Nama anda'}</p></div></article>;
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--foreground))]/45 p-5"><div className="fade-up w-full max-w-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl"><div className="flex items-start justify-between gap-5"><h2 className="font-[var(--app-font-serif)] text-xl font-extrabold">{title}</h2><button data-testid="button-close-dialog" onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" aria-label="Tutup dialog"><X size={18} /></button></div><div className="mt-4">{children}</div></div></div>;
}

function resumeToText(data: Resume) {
  return [data.name, data.role, [data.email, data.phone, data.location].filter(Boolean).join(' · '), data.about, data.education, data.experience, data.skills].filter(Boolean).join('\n\n');
}

function resignToText(data: Resign) {
  return `NOTIS PELETAKAN JAWATAN\n\n${data.date}\n${data.recipient}\n${data.company}\n\nTuan/Puan,\n\nPER: PELETAKAN JAWATAN SEBAGAI ${data.role}\n\n${data.reason}\n\n${data.message}\n\nHari terakhir: ${data.finalDay}`;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;