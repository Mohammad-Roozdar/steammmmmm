import { Gamepad2, Users, Zap, Shield, Award, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-gradient-to-l from-[#66c0f4] to-[#4fa8d8] text-[#171a21] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
          🎮 درباره SteamClub
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          فروشگاه تخصصی بازی‌های استیم
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          ما با بیش از ۵ سال تجربه در زمینه فروش بازی‌های دیجیتال، بهترین قیمت و سریع‌ترین تحویل رو به شما ارائه می‌دیم
        </p>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatBox icon="👥" value="۱۰,۰۰۰+" label="کاربر فعال" />
        <StatBox icon="🎮" value="۵,۰۰۰+" label="بازی موجود" />
        <StatBox icon="⚡" value="۱۰ دقیقه" label="میانگین تحویل" />
        <StatBox icon="⭐" value="۴.۸/۵" label="رضایت مشتریان" />
      </div>

      {/* مزایا */}
      <h2 className="text-2xl font-bold mb-6">چرا SteamClub؟</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <Feature
          icon={<Zap />}
          title="تحویل فوری"
          desc="فعال‌سازی روی اکانت استیم شما در کمتر از ۱۰ دقیقه"
        />
        <Feature
          icon={<Shield />}
          title="امنیت کامل"
          desc="اطلاعات شما با رمزنگاری AES-256 محافظت می‌شود"
        />
        <Feature
          icon={<Award />}
          title="ضمانت بازگشت"
          desc="اگر بازی فعال نشد، پول شما کامل برمی‌گردد"
        />
        <Feature
          icon={<TrendingUp />}
          title="بهترین قیمت"
          desc="خرید از ریجن‌های ارزان‌تر با بالاترین تخفیف"
        />
      </div>

      {/* داستان */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-4">📖 داستان ما</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          SteamClub از سال ۱۳۹۸ فعالیت خود را با هدف ارائه بازی‌های استیم با قیمت مناسب آغاز کرد. 
          در این مدت، با تلاش تیم متخصص و پشتیبانی ۲۴ ساعته، توانستیم اعتماد هزاران گیمر ایرانی رو جلب کنیم.
        </p>
        <p className="text-gray-300 leading-relaxed">
          ما مستقیماً از ریجن‌های ارزان‌تر (هند، ترکیه، آرژانتین و...) خرید می‌کنیم و 
          بازی‌ها را روی اکانت استیم خودتان فعال می‌کنیم. این یعنی شما بدون نیاز به VPN، 
          با قیمت کمتر بازی مورد علاقه‌تان را دریافت می‌کنید.
        </p>
      </div>

      {/* تیم */}
      <h2 className="text-2xl font-bold mb-6">👨‍💻 تیم ما</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'محمد', role: 'مدیرعامل', emoji: '👨‍💼' },
          { name: 'علی', role: 'پشتیبانی', emoji: '🧑‍💻' },
          { name: 'رضا', role: 'فنی', emoji: '👨‍🔧' },
          { name: 'سارا', role: 'مالی', emoji: '👩‍💼' }
        ].map((m, i) => (
          <div key={i} className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 text-center hover:border-[#66c0f4] transition">
            <div className="text-5xl mb-3">{m.emoji}</div>
            <div className="font-bold">{m.name}</div>
            <div className="text-xs text-gray-500 mt-1">{m.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ icon, value, label }) {
  return (
    <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-5 text-center hover:border-[#66c0f4] transition">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-[#66c0f4]">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-5 flex gap-4 hover:border-[#66c0f4] transition">
      <div className="w-12 h-12 rounded-lg bg-[#66c0f4]/10 flex items-center justify-center text-[#66c0f4] shrink-0">
        {icon}
      </div>
      <div>
        <div className="font-bold mb-1">{title}</div>
        <div className="text-sm text-gray-400 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}