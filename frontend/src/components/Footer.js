import Link from 'next/link';
import { Gamepad2, Send, Phone, Mail, MessageCircle, Camera, Play } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#171a21] border-t border-[#2a475e] mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* برند */}
          <div>
            <div className="flex items-center gap-2 text-[#66c0f4] font-bold text-2xl mb-4">
              <Gamepad2 size={28} /> IranSteam
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              فروشگاه تخصصی بازی‌های استیم با بهترین قیمت و سریع‌ترین تحویل. 
              بیش از ۱۰,۰۰۰ کاربر به ما اعتماد کردن.
            </p>
            <div className="flex gap-2">
              <a href="#" className="w-10 h-10 rounded-full bg-[#2a475e] hover:bg-[#66c0f4] hover:text-[#171a21] flex items-center justify-center transition">
                <Send size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#2a475e] hover:bg-[#66c0f4] hover:text-[#171a21] flex items-center justify-center transition">
                <Camera size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#2a475e] hover:bg-[#66c0f4] hover:text-[#171a21] flex items-center justify-center transition">
                <Play size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#2a475e] hover:bg-[#66c0f4] hover:text-[#171a21] flex items-center justify-center transition">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* لینک‌های سریع */}
          <div>
            <h4 className="font-bold mb-4 text-[#66c0f4]">لینک‌های سریع</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-[#66c0f4] transition">خانه</Link></li>
              <li><Link href="/games" className="hover:text-[#66c0f4] transition">فروشگاه</Link></li>
              <li><Link href="/advertise" className="hover:text-[#66c0f4] transition">رزرو تبلیغات</Link></li>
              <li><Link href="/about" className="hover:text-[#66c0f4] transition">درباره ما</Link></li>
              <li><Link href="/contact" className="hover:text-[#66c0f4] transition">تماس با ما</Link></li>
            </ul>
          </div>

          {/* پشتیبانی */}
          <div>
            <h4 className="font-bold mb-4 text-[#66c0f4]">پشتیبانی</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/faq" className="hover:text-[#66c0f4] transition">سوالات متداول</Link></li>
              <li><Link href="/rules" className="hover:text-[#66c0f4] transition">قوانین و مقررات</Link></li>
              <li><Link href="/orders" className="hover:text-[#66c0f4] transition">پیگیری سفارش</Link></li>
              <li><Link href="/profile" className="hover:text-[#66c0f4] transition">حساب کاربری</Link></li>
            </ul>
          </div>

          {/* تماس */}
          <div>
            <h4 className="font-bold mb-4 text-[#66c0f4]">تماس با ما</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#66c0f4]" />
                ۰۲۱-۱۲۳۴۵۶۷۸
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#66c0f4]" />
                info@steamclub.ir
              </div>
            </div>
            <div className="mt-4 bg-[#0f1922] border border-[#2a475e] rounded-lg p-3 text-xs text-gray-400">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <b className="text-white">پشتیبانی آنلاین فعال</b>
              </div>
              آماده پاسخگویی ۲۴ ساعته
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a475e] py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>© 1405 IranSteam - تمام حقوق محفوظ است</div>
          <div className="flex items-center gap-4">
            <span>ساخته شده با ❤️ برای گیمرهای ایرانی</span>
          </div>
        </div>
      </div>
    </footer>
  );
}