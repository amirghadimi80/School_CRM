import { cn } from '@/lib/utils';

const week = [
  { d: 'ش', v: 72 },
  { d: 'ی', v: 84 },
  { d: 'د', v: 76 },
  { d: 'س', v: 92 },
  { d: 'چ', v: 86 },
  { d: 'پ', v: 74 },
  { d: 'ج', v: 95 },
];

export function SchoolBackdrop() {
  return (
    <svg viewBox="0 0 680 520" className="h-full w-full" fill="none" aria-hidden>
      <circle cx="560" cy="92" r="42" fill="#f5c451" />
      <path d="M48 430 92 250l44 180H48Z" fill="#14c4d4" opacity="0.85" />
      <path d="M560 438 598 268l38 170h-76Z" fill="#0e8f9c" />
      <path d="M150 230 330 78l180 152" stroke="#7eebf2" strokeWidth="10" strokeLinejoin="round" />
      <rect x="176" y="228" width="308" height="214" rx="8" fill="#16384e" />
      <rect x="210" y="268" width="52" height="70" rx="3" fill="#14c4d4" />
      <rect x="278" y="268" width="52" height="70" rx="3" fill="#e8fffb" />
      <rect x="346" y="268" width="52" height="70" rx="3" fill="#14c4d4" />
      <rect x="414" y="268" width="40" height="70" rx="3" fill="#7eebf2" />
      <rect x="292" y="360" width="64" height="82" fill="#0c1b2a" />
      <rect x="470" y="310" width="150" height="130" rx="16" fill="#243eae" opacity="0.45" />
    </svg>
  );
}

export function CommandCenter() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="landing-drift pointer-events-none absolute -left-16 -right-8 -top-16 hidden h-[118%] lg:block">
        <SchoolBackdrop />
      </div>

      <div className="relative z-10 overflow-hidden rounded-[28px] border border-white/15 bg-[#10283a]/92 p-3 shadow-[0_40px_90px_-28px_rgba(0,0,0,0.7)] ring-1 ring-[#14c4d4]/20 backdrop-blur-md sm:p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f5c451]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3ddc97]" />
          </div>
          <p className="text-xs font-medium text-white/70">داشبورد مدیر</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { k: 'دانش‌آموز', v: '۳۲۴', tone: 'text-[#082028] bg-[#14c4d4]' },
            { k: 'حضور امروز', v: '۹۶٪', tone: 'text-white bg-[#243eae]' },
            { k: 'میانگین نمره', v: '۱۸٫۴', tone: 'text-[#082028] bg-[#f5c451]' },
          ].map((item) => (
            <div key={item.k} className={cn('rounded-2xl px-2 py-3 text-center sm:px-3', item.tone)}>
              <p className="text-xl font-extrabold leading-none sm:text-2xl">{item.v}</p>
              <p className="mt-1 text-[10px] font-medium opacity-80 sm:text-xs">{item.k}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-5">
          <div className="rounded-2xl bg-[#f7f4ee] p-3 sm:col-span-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#0c6670]">حضور این هفته</p>
              <span className="text-[10px] text-slate-500">درصد کلاس‌ها</span>
            </div>
            <div className="mt-3 flex h-28 items-end gap-1.5">
              {week.map((day) => (
                <div key={day.d} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#1d3a9e] to-[#14c4d4]"
                    style={{ height: `${day.v}%` }}
                  />
                  <span className="text-[10px] text-slate-500">{day.d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-[#0c1b2a] p-3 text-white sm:col-span-2">
            <p className="text-xs text-white/60">زنگ بعدی</p>
            <div>
              <p className="text-xl font-extrabold">ریاضی</p>
              <p className="text-xs text-[#9cf4f8]">کلاس سوم، زنگ دوم</p>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[10px] text-white/50">
                <span>پیشرفت جلسه</span>
                <span>۶۶٪</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-[#14c4d4]" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-[11px] text-white/50">غیبت ثبت‌شده</p>
            <p className="text-sm font-bold text-white">۲ نفر در کلاس سوم</p>
          </div>
          <div className="rounded-2xl border border-[#14c4d4]/30 bg-[#14c4d4]/10 px-3 py-2.5">
            <p className="text-[11px] text-[#9cf4f8]">شهریه این ماه</p>
            <p className="text-sm font-bold text-white">۱۲ مورد تسویه‌شده</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScatteredDesk() {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-md" aria-hidden>
      <div className="absolute inset-x-10 top-6 h-56 -rotate-6 rounded-3xl border border-[#102033]/10 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="h-2.5 w-20 rounded-full bg-[#102033]/10" />
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">ناقص</span>
        </div>
        <div className="space-y-2.5">
          <span className="block h-2 rounded-full bg-[#102033]/10" />
          <span className="block h-2 w-5/6 rounded-full bg-[#102033]/10" />
          <span className="block h-2 w-2/3 rounded-full bg-[#102033]/10" />
          <span className="block h-2 w-4/5 rounded-full bg-red-200" />
        </div>
        <p className="mt-5 text-xs text-slate-500">دفتر نمره، فایل جدا</p>
      </div>

      <div className="absolute inset-x-4 top-36 rotate-3 rounded-[28px] bg-[#102033] p-5 text-white shadow-[0_24px_50px_-20px_rgba(12,27,42,0.7)]">
        <p className="text-xs font-semibold text-[#7eebf2]">پرونده سپاد</p>
        <p className="mt-1 text-2xl font-extrabold leading-snug">یک پرونده برای کل کلاس</p>
        <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
          {['حضور', 'نمره', 'برنامه', 'شهریه'].map((item) => (
            <span key={item} className="rounded-xl bg-white/10 px-3 py-2.5 font-medium">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const sceneFrame =
  'h-full w-full';

export function ClassroomScene() {
  return (
    <svg viewBox="0 0 400 280" className={sceneFrame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="280" fill="#14344a" />
      <rect x="28" y="28" width="150" height="110" rx="8" fill="#0c1b2a" />
      <rect x="40" y="40" width="126" height="78" rx="4" fill="#14c4d4" />
      <path d="M52 92h100M52 78h72" stroke="#0c1b2a" strokeWidth="4" strokeLinecap="round" />
      <rect x="210" y="36" width="160" height="100" rx="10" fill="#f5c451" />
      <rect x="226" y="52" width="128" height="68" fill="#fff8e4" />
      <path d="M36 250h90l-10-46H46l-10 46Z" fill="#243eae" />
      <path d="M150 250h90l-10-46h-70l-10 46Z" fill="#0e8f9c" />
      <path d="M264 250h90l-10-46h-70l-10 46Z" fill="#243eae" />
      <circle cx="81" cy="168" r="16" fill="#f7f4ee" />
      <circle cx="195" cy="168" r="16" fill="#14c4d4" />
      <circle cx="309" cy="168" r="16" fill="#f5c451" />
    </svg>
  );
}

export function StudyScene() {
  return (
    <svg viewBox="0 0 400 280" className={sceneFrame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="280" fill="#f4f1ea" />
      <path d="M250 36h28l40 150H210L250 36Z" fill="#f5c451" />
      <rect x="196" y="186" width="140" height="14" rx="4" fill="#102033" />
      <path d="M48 210h300v28H48v-28Z" fill="#102033" />
      <path d="M70 210c20-70 50-70 78 0" fill="#fff" stroke="#102033" strokeWidth="6" />
      <path d="M148 210c22-78 58-78 86 0" fill="#14c4d4" stroke="#102033" strokeWidth="6" />
      <path d="M148 120h86" stroke="#102033" strokeWidth="4" />
      <circle cx="320" cy="78" r="28" fill="#243eae" />
    </svg>
  );
}

export function LibraryScene() {
  return (
    <svg viewBox="0 0 400 280" className={sceneFrame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="280" fill="#102033" />
      {[40, 110, 180].map((y) => (
        <g key={y}>
          <rect x="28" y={y} width="344" height="58" rx="6" fill="#1a3348" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <rect
              key={i}
              x={42 + i * 30}
              y={y + 8}
              width="22"
              height={34 + ((i * 7) % 12)}
              rx="2"
              fill={['#14c4d4', '#f5c451', '#f7f4ee', '#243eae', '#7eebf2'][i % 5]}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function LabScene() {
  return (
    <svg viewBox="0 0 400 280" className={sceneFrame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="280" fill="#e7f7f6" />
      <rect x="20" y="168" width="360" height="70" rx="12" fill="#102033" />
      {[40, 155, 270].map((x, i) => (
        <g key={x}>
          <rect x={x} y="46" width="96" height="70" rx="8" fill="#102033" />
          <rect x={x + 8} y="54" width="80" height="48" rx="4" fill={i === 1 ? '#14c4d4' : '#243eae'} />
          <rect x={x + 28} y="116" width="40" height="18" fill="#102033" />
        </g>
      ))}
      <path d="M48 196h70M155 196h70M270 196h70" stroke="#7eebf2" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function FamilyScene() {
  return (
    <svg viewBox="0 0 400 280" className={sceneFrame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="280" fill="#f7f4ee" />
      <circle cx="120" cy="108" r="36" fill="#14c4d4" />
      <path d="M62 230c8-52 28-72 58-72s50 20 58 72" fill="#243eae" />
      <circle cx="230" cy="124" r="28" fill="#f5c451" />
      <path d="M186 230c6-40 20-56 44-56s38 16 44 56" fill="#0e8f9c" />
      <rect x="250" y="48" width="120" height="150" rx="16" fill="#102033" />
      <rect x="264" y="66" width="92" height="70" rx="8" fill="#14c4d4" />
      <path d="M276 160h68M276 176h48" stroke="#f7f4ee" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function GraduationScene() {
  return (
    <svg viewBox="0 0 400 280" className={sceneFrame} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="280" fill="#0c1b2a" />
      <path d="M40 210c60-90 120-90 160 0" stroke="#14c4d4" strokeWidth="10" fill="none" />
      <path d="M200 210c40-70 90-70 150 0" stroke="#f5c451" strokeWidth="10" fill="none" />
      <path d="M70 150 200 86l130 64-130 48L70 150Z" fill="#14c4d4" />
      <path d="M200 134v62" stroke="#f7f4ee" strokeWidth="6" />
      <circle cx="200" cy="204" r="8" fill="#f5c451" />
      <rect x="250" y="168" width="86" height="58" rx="6" fill="#f7f4ee" />
      <path d="M262 186h62M262 202h42" stroke="#102033" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function RoleStage({ role }: { role: 'admin' | 'teacher' | 'student' | 'parent' }) {
  if (role === 'teacher') {
    const rows = [
      { name: 'سارا کریمی', state: 'حاضر', ok: true },
      { name: 'علی رضایی', state: 'غایب', ok: false },
      { name: 'نازنین موسوی', state: 'حاضر', ok: true },
      { name: 'کیان احمدی', state: 'تأخیر', ok: true },
    ];
    return (
      <div className="flex h-full flex-col bg-[#f7f4ee] p-5 sm:p-7">
        <p className="text-xs font-semibold text-[#0c6670]">نمونه پنل معلم</p>
        <p className="mt-1 text-lg font-extrabold text-[#102033]">حضور کلاس سوم، زنگ اول</p>
        <ul className="mt-5 space-y-2">
          {rows.map((row) => (
            <li key={row.name} className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm">
              <span className="text-sm font-medium text-[#102033]">{row.name}</span>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-bold',
                  row.ok ? 'bg-[#e5f8f2] text-[#0c6670]' : 'bg-red-50 text-red-600'
                )}
              >
                {row.state}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (role === 'student') {
    const cells = ['ریاضی', 'فارسی', 'علوم', 'ورزش', 'هنر', 'زبان'];
    return (
      <div className="flex h-full flex-col bg-[#102033] p-5 text-white sm:p-7">
        <p className="text-xs font-semibold text-[#7eebf2]">نمونه پنل دانش‌آموز</p>
        <p className="mt-1 text-lg font-extrabold">برنامه شنبه</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {cells.map((cell, i) => (
            <div
              key={cell}
              className={cn(
                'rounded-2xl px-3 py-4',
                i === 0 ? 'bg-[#14c4d4] text-[#082028]' : 'bg-white/10'
              )}
            >
              <p className="text-[10px] opacity-70">زنگ {['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'][i]}</p>
              <p className="text-sm font-bold">{cell}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (role === 'parent') {
    const notes = [
      { t: 'نمره ریاضی', d: '۱۸ از ۲۰', tone: 'bg-[#14c4d4] text-[#082028]' },
      { t: 'غیبت', d: 'موردی ثبت نشده', tone: 'bg-white text-[#102033]' },
      { t: 'شهریه آبان', d: 'تسویه شده', tone: 'bg-[#f5c451] text-[#082028]' },
    ];
    return (
      <div className="flex h-full flex-col bg-[#e7f4f3] p-5 sm:p-7">
        <p className="text-xs font-semibold text-[#0c6670]">نمونه نمای اولیا</p>
        <p className="mt-1 text-lg font-extrabold text-[#102033]">وضعیت این هفته</p>
        <ul className="mt-5 space-y-3">
          {notes.map((note) => (
            <li key={note.t} className={cn('rounded-2xl px-4 py-4', note.tone)}>
              <p className="text-xs opacity-70">{note.t}</p>
              <p className="text-base font-extrabold">{note.d}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#f7f4ee] p-5 sm:p-7">
      <p className="text-xs font-semibold text-[#0c6670]">نمونه داشبورد مدیر</p>
      <p className="mt-1 text-lg font-extrabold text-[#102033]">نمای امروز مدرسه</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {[
          { k: 'کلاس فعال', v: '۱۸' },
          { k: 'معلم حاضر', v: '۲۶' },
          { k: 'شهریه باز', v: '۷' },
          { k: 'پیام تازه', v: '۴' },
        ].map((item, i) => (
          <div
            key={item.k}
            className={cn('rounded-2xl px-3 py-4', i === 0 ? 'bg-[#102033] text-white' : 'bg-white text-[#102033]')}
          >
            <p className="text-2xl font-extrabold">{item.v}</p>
            <p className="text-xs opacity-70">{item.k}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-16 items-end gap-1 rounded-2xl bg-white px-3 py-2">
        {week.map((day) => (
          <div key={day.d} className="flex-1 rounded-t bg-[#14c4d4]" style={{ height: `${day.v}%` }} />
        ))}
      </div>
    </div>
  );
}
