'use client';
import { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-gradient-to-l from-[#66c0f4] to-[#4fa8d8] text-[#171a21] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
          📞 تماس با ما
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">در خدمت شماییم</h1>
        <p className="text-gray-400">۲۴ ساعته، ۷ روز هفته پاسخگوی شما هستیم</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ContactCard
          icon={<Phone />}
          title="تلفن"
          lines={['۰۲۱-۱۲۳۴۵۶۷۸', '۰۹۱۲-۳۴۵-۶۷۸۹']}
        />
        <ContactCard
          icon={<Mail />}
          title="ایمیل"
          lines={['info@steamclub.ir', 'support@steamclub.ir']}
        />
        <ContactCard
          icon={<Clock />}
          title="ساعات پاسخگویی"
          lines={['شنبه تا پنجشنبه', '۹ صبح - ۹ شب']}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* فرم */}
        <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="text-[#66c0f4]" /> پیام بفرست
          </h2>

          {sent && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-3 rounded-lg mb-4 animate-fade-in">
              ✅ پیام شما ارسال شد. به زودی پاسخ می‌دهیم.
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <input
              required
              placeholder="نام شما"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#0f1922] border border-[#2a475e] rounded-lg p-3 focus:border-[#66c0f4] outline-none transition"
            />
            <input
              required
              type="email"
              placeholder="ایمیل"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-[#0f1922] border border-[#2a475e] rounded-lg p-3 focus:border-[#66c0f4] outline-none transition"
            />
            <input
              required
              placeholder="موضوع"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full bg-[#0f1922] border border-[#2a475e] rounded-lg p-3 focus:border-[#66c0f4] outline-none transition"
            />
            <textarea
              required
              rows={5}
              placeholder="پیام شما..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-[#0f1922] border border-[#2a475e] rounded-lg p-3 focus:border-[#66c0f4] outline-none transition"
            />
            <button className="w-full bg-[#66c0f4] text-[#171a21] font-bold py-3 rounded-lg hover:bg-[#4fa8d8] flex items-center justify-center gap-2 transition">
              <Send size={16} /> ارسال پیام
            </button>
          </form>
        </div>

        {/* اطلاعات */}
        <div className="space-y-6">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MapPin className="text-[#66c0f4]" /> آدرس
            </h3>
            <p className="text-gray-300">
              تهران، خیابان ولیعصر، برج فناوری، طبقه ۱۰، واحد ۱۰۰۲
            </p>
          </div>

          <div className="bg-gradient-to-l from-[#66c0f4] to-[#2a475e] rounded-2xl p-6 text-white">
            <h3 className="font-bold mb-2">💬 چت آنلاین</h3>
            <p className="text-sm opacity-90 mb-4">
              سریع‌ترین راه ارتباط، چت آنلاین سایت است. همین الان از گوشه پایین صفحه شروع کن!
            </p>
            <div className="text-xs opacity-75">
              میانگین پاسخ‌دهی: کمتر از ۵ دقیقه
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, lines }) {
  return (
    <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6 text-center hover:border-[#66c0f4] transition">
      <div className="w-14 h-14 rounded-full bg-[#66c0f4]/10 text-[#66c0f4] flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <div className="font-bold mb-2">{title}</div>
      {lines.map((l, i) => (
        <div key={i} className="text-sm text-gray-400">{l}</div>
      ))}
    </div>
  );
}