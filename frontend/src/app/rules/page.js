import { AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-gradient-to-l from-[#66c0f4] to-[#4fa8d8] text-[#171a21] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
          📋 قوانین و مقررات
        </div>
        <h1 className="text-4xl font-bold mb-4">قوانین استفاده از SteamClub</h1>
        <p className="text-gray-400">آخرین به‌روزرسانی: ۱۴۰۴/۰۷/۱۵</p>
      </div>

      <div className="space-y-6">
        <Section
          icon={<CheckCircle className="text-green-400" />}
          title="✅ چیزهایی که مجاز است"
          items={[
            'خرید بازی از هر ریجن موجود در سایت',
            'ثبت نظر و امتیاز برای بازی‌های خریداری‌شده',
            'اشتراک‌گذاری لینک بازی‌ها با دوستان',
            'استفاده از کدهای تخفیف',
            'درخواست بازگشت وجه در صورت عدم تحویل'
          ]}
        />

        <Section
          icon={<XCircle className="text-red-400" />}
          title="❌ چیزهایی که ممنوع است"
          items={[
            'استفاده از اکانت دیگران بدون اجازه',
            'تلاش برای هک یا نفوذ به سایت',
            'ثبت سفارشات جعلی یا تکراری',
            'ارسال محتوای توهین‌آمیز در نظرات',
            'استفاده تجاری از محتوای سایت'
          ]}
        />

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-yellow-400">
            <AlertTriangle /> ⚠️ نکات مهم
          </h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-[#66c0f4]">•</span>
              <span>
                <b className="text-white">اطلاعات اکانت استیم:</b> اطلاعات شما با رمزنگاری AES-256 ذخیره می‌شود و فقط برای فعال‌سازی بازی استفاده می‌شود.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#66c0f4]">•</span>
              <span>
                <b className="text-white">زمان تحویل:</b> معمولاً ۱۰ دقیقه تا ۲ ساعت. در ساعات شلوغی ممکن است تا ۲۴ ساعت طول بکشد.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#66c0f4]">•</span>
              <span>
                <b className="text-white">تغییر پسورد:</b> بعد از فعال‌سازی، حتماً پسورد استیم خود را عوض کنید.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#66c0f4]">•</span>
              <span>
                <b className="text-white">بازگشت وجه:</b> در صورت عدم تحویل تا ۴۸ ساعت، وجه شما کامل بازگردانده می‌شود.
              </span>
            </li>
          </ul>
        </div>

        <Section
          icon={<FileText className="text-[#66c0f4]" />}
          title="📞 ارتباط با ما"
          items={[
            'برای هرگونه سوال یا شکایت با پشتیبانی آنلاین تماس بگیرید',
            'شماره تماس: ۰۲۱-۱۲۳۴۵۶۷۸',
            'ایمیل: support@steamclub.ir'
          ]}
        />
      </div>
    </div>
  );
}

function Section({ icon, title, items }) {
  return (
    <div className="bg-[#171a21] border border-[#2a475e] rounded-2xl p-6">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      <ul className="space-y-2 text-sm text-gray-300">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[#66c0f4]">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}