export default function Settings() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">⚙️ تنظیمات</h1>
      <div className="bg-[#171a21] p-6 rounded-xl border border-[#2a475e] space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-2">نام سایت</label>
          <input defaultValue="SteamClub" className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3" />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-2">شماره پشتیبانی</label>
          <input defaultValue="021-12345678" className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3" />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-2">متن فوتر</label>
          <textarea rows={3} defaultValue="© تمام حقوق محفوظ است" className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3" />
        </div>
        <button className="bg-[#66c0f4] text-[#0f1922] px-6 py-2 rounded font-bold">ذخیره</button>
      </div>
    </div>
  )
}