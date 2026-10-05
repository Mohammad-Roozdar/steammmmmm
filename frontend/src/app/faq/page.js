'use client';
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'چطور بازی بخرم؟',
    a: 'کافیه وارد سایت بشی، بازی مورد نظرت رو انتخاب کنی، ریجن رو مشخص کنی و اطلاعات استیمت رو وارد کنی. بعد از پرداخت، ادمین‌های ما بازی رو روی اکانتت فعال می‌کنن.'
  },
  {
    q: 'چه مدت طول می‌کشه تا بازی فعال بشه؟',
    a: 'معمولاً بین ۱۰ دقیقه تا ۲ ساعت. ولی در ساعات شلوغی ممکنه تا ۲۴ ساعت هم طول بکشه. برای پیگیری، از بخش "سفارشات من" استفاده کن.'
  },
  {
    q: 'اطلاعات اکانت استیمم امنه؟',
    a: 'بله! اطلاعات شما با الگوریتم AES-256 رمزنگاری می‌شه و فقط توسط ادمین‌های تاییدشده برای فعال‌سازی بازی استفاده می‌شه. بعد از فعال‌سازی هم بلافاصله پاک می‌شه.'
  },
  {
    q: 'اگه بازی فعال نشد چی؟',
    a: 'اگه تا ۴۸ ساعت بازی فعال نشه، وجه شما کامل به کیف پولت برمی‌گرده. یا می‌تونی از پشتیبانی آنلاین درخواست پیگیری کنی.'
  },
  {
    q: 'چطور می‌تونم از تخفیف‌ها باخبر بشم؟',
    a: 'توی صفحه اصلی، بخش "پیشنهادهای شگفت‌انگیز" رو دنبال کن. همچنین اگه عضو باشی، نوتیف تخفیف‌ها برات ارسال می‌شه.'
  },
  {
    q: 'چطور کیف پولم رو شارژ کنم؟',
    a: 'برو به پروفایل → تب کیف پول → مبلغ مورد نظر رو انتخاب کن و روی شارژ بزن. موجودی بلافاصله اضافه می‌شه.'
  },
  {
    q: 'آیا امکان مرجوع کردن بازی هست؟',
    a: 'بعد از فعال‌سازی موفق روی اکانت، بازی قابل مرجوع نیست. ولی اگه بازی مشکل داشت، توی ۲۴ ساعت اول با پشتیبانی تماس بگیر.'
  },
  {
    q: 'چند ریجن دارید؟',
    a: 'ما از ریجن‌های ترکیه، هند، آرژانتین، اوکراین، برزیل، روسیه و چین خرید می‌کنیم. قیمت هر ریجن متفاوته و توی صفحه بازی نمایش داده می‌شه.'
  }
];

export default function FAQPage() {
  const [open, setOpen] = useState(0);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-gradient-to-l from-[#66c0f4] to-[#4fa8d8] text-[#171a21] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
          <HelpCircle size={14} className="inline ml-1" /> سوالات متداول
        </div>
        <h1 className="text-4xl font-bold mb-4">چی می‌خوای بدونی؟</h1>
        <p className="text-gray-400">جواب سوالات پرتکرار کاربران اینجاست</p>
      </div>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div
            key={i}
            className={`bg-[#171a21] border rounded-xl overflow-hidden transition ${
              open === i ? 'border-[#66c0f4]' : 'border-[#2a475e] hover:border-[#66c0f4]/50'
            }`}
          >
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full text-right p-5 flex items-center justify-between hover:bg-[#2a475e]/30 transition"
            >
              <span className="font-bold">{f.q}</span>
              <ChevronDown
                size={20}
                className={`text-[#66c0f4] transition-transform ${
                  open === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-gray-300 leading-relaxed animate-fade-in">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-l from-[#66c0f4] to-[#2a475e] rounded-2xl p-6 text-white text-center">
        <div className="font-bold mb-2">جواب سوالت رو پیدا نکردی؟</div>
        <p className="text-sm opacity-90 mb-4">پشتیبانی آنلاین ۲۴ ساعته آماده کمکه</p>
        <a
          href="/contact"
          className="inline-block bg-white text-[#171a21] font-bold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition"
        >
          تماس با ما
        </a>
      </div>
    </div>
  );
}