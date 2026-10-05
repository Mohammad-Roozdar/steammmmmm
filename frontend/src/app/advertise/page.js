'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Megaphone, Check, Upload, Info } from 'lucide-react';

const positions = [
  { value: 'home_top', label: 'بالای صفحه اصلی', size: '1200x200', price: 5000000 },
  { value: 'home_middle', label: 'وسط صفحه اصلی', size: '1200x200', price: 4000000 },
  { value: 'home_bottom', label: 'پایین صفحه اصلی', size: '1200x200', price: 3000000 },
  { value: 'game_detail', label: 'صفحه جزئیات بازی', size: '800x150', price: 3500000 },
  { value: 'sidebar', label: 'نوار کناری', size: '300x600', price: 2500000 }
];

export default function AdvertisePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    company: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    image: '',
    link: '',
    position: 'home_top',
    startDate: '',
    endDate: ''
  });
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const selectedPos = positions.find((p) => p.value === form.position);
  const days = form.startDate && form.endDate
    ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000))
    : 1;
  const totalPrice = (selectedPos?.price || 0) * days;

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/upload?type=billboards', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ ...form, image: data.url });
    } catch {
      alert('خطا در آپلود');
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!getUser()) return router.push('/login?next=/advertise');
    if (!form.title || !form.company || !form.image || !form.contactPhone) {
      return alert('فیلدهای ستاره‌دار الزامی است');
    }
    try {
      await api.post('/billboards', { ...form, price: totalPrice });
      setDone(true);
    } catch (e) {
      alert(e.response?.data?.error || 'خطا');
    }
  };

  if (done) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-4">درخواست ثبت شد ✅</h1>
        <p className="text-gray-400 mb-6">
          تیم ما تا ۲۴ ساعت آینده با شما تماس می‌گیرد. پس از تایید و پرداخت، بیلبورد شما فعال می‌شود.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-[#66c0f4] text-[#171a21] font-bold px-8 py-3 rounded-lg"
        >
          بازگشت به خانه
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* هدر */}
      <div className="bg-gradient-to-l from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
          <Megaphone size={36} /> رزرو بیلبورد تبلیغاتی
        </h1>
        <p className="text-white/90 text-lg">
          کسب‌وکارت رو در پربازدیدترین جای سایت به هزاران کاربر معرفی کن
        </p>
      </div>

      {/* مراحل */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= n ? 'bg-[#66c0f4] text-[#171a21]' : 'bg-[#2a475e] text-gray-400'
            }`}>{n}</div>
            {n < 3 && (
              <div className={`flex-1 h-1 mx-2 ${step > n ? 'bg-[#66c0f4]' : 'bg-[#2a475e]'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#171a21] border border-[#2a475e] rounded-xl p-6">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-4">📍 انتخاب موقعیت</h2>
              <div className="space-y-3">
                {positions.map((p) => (
                  <label
                    key={p.value}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                      form.position === p.value
                        ? 'border-[#66c0f4] bg-[#66c0f4]/10'
                        : 'border-[#2a475e] hover:border-[#66c0f4]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="position"
                      value={p.value}
                      checked={form.position === p.value}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-bold">{p.label}</div>
                      <div className="text-xs text-gray-500 mt-1">اندازه: {p.size}</div>
                    </div>
                    <div className="text-[#66c0f4] font-bold text-sm">
                      {p.price.toLocaleString()} <span className="text-xs">ت/روز</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">تاریخ شروع</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">تاریخ پایان</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!form.startDate || !form.endDate}
                className="w-full bg-[#66c0f4] text-[#171a21] font-bold py-3 rounded-lg hover:bg-[#4fa8d8] disabled:opacity-50"
              >
                مرحله بعد →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-4">📝 اطلاعات تبلیغ</h2>

              <div>
                <label className="text-xs text-gray-400 block mb-2">عنوان تبلیغ *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3"
                  placeholder="مثلا: تخفیف ویژه فروشگاه XYZ"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">نام شرکت *</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">تصویر بیلبورد *</label>
                <div className="flex gap-3 items-center">
                  <label className="cursor-pointer bg-[#2a475e] hover:bg-[#3a5a78] px-4 py-3 rounded-lg flex items-center gap-2">
                    <Upload size={16} /> {uploading ? 'در حال آپلود...' : 'آپلود عکس'}
                    <input type="file" accept="image/*" onChange={upload} className="hidden" />
                  </label>
                  {form.image && (
                    <img src={form.image} className="h-16 rounded border border-[#2a475e]" />
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  اندازه پیشنهادی: {selectedPos?.size}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">لینک مقصد</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3"
                  placeholder="https://example.com"
                />
              </div>

              <div className="border-t border-[#2a475e] pt-5">
                <h3 className="font-bold mb-3">📞 اطلاعات تماس</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="نام و نام خانوادگی"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="bg-[#0f1922] border border-[#2a475e] rounded p-3"
                  />
                  <input
                    placeholder="شماره تماس *"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="bg-[#0f1922] border border-[#2a475e] rounded p-3"
                  />
                  <input
                    placeholder="ایمیل"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="md:col-span-2 bg-[#0f1922] border border-[#2a475e] rounded p-3"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-[#2a475e] py-3 rounded-lg hover:bg-[#3a5a78]"
                >
                  ← مرحله قبل
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#66c0f4] text-[#171a21] font-bold py-3 rounded-lg hover:bg-[#4fa8d8]"
                >
                  مرحله بعد →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-4">✅ تایید نهایی</h2>

              <div className="bg-[#0f1922] border border-[#2a475e] rounded-lg p-4 space-y-3 text-sm">
                <Row label="موقعیت" value={selectedPos?.label} />
                <Row label="عنوان" value={form.title} />
                <Row label="شرکت" value={form.company} />
                <Row label="شماره تماس" value={form.contactPhone} />
                <Row
                  label="تاریخ"
                  value={`${form.startDate} تا ${form.endDate} (${days} روز)`}
                />
              </div>

              {form.image && (
                <div>
                  <div className="text-xs text-gray-400 mb-2">پیش‌نمایش:</div>
                  <img src={form.image} className="w-full rounded border border-[#2a475e]" />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-[#2a475e] py-3 rounded-lg hover:bg-[#3a5a78]"
                >
                  ← ویرایش
                </button>
                <button
                  onClick={submit}
                  className="flex-1 bg-green-600 hover:bg-green-700 font-bold py-3 rounded-lg"
                >
                  ثبت درخواست
                </button>
              </div>
            </div>
          )}
        </div>

        {/* خلاصه هزینه */}
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 h-fit sticky top-20">
          <h3 className="font-bold mb-4">💰 خلاصه هزینه</h3>
          <div className="space-y-3 text-sm">
            <Row label="موقعیت" value={selectedPos?.label} />
            <Row label="قیمت روزانه" value={`${(selectedPos?.price || 0).toLocaleString()} ت`} />
            <Row label="تعداد روز" value={days} />
            <div className="border-t border-[#2a475e] pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold">مجموع:</span>
                <span className="text-2xl font-bold text-[#66c0f4]">
                  {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4 text-xs text-yellow-200 flex gap-2">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>پس از ثبت، تیم ما با شما تماس می‌گیرد و پس از پرداخت، بیلبورد فعال می‌شود.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}:</span>
      <span className="text-white font-medium">{value || '—'}</span>
    </div>
  );
}