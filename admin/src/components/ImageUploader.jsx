import { useState } from 'react';
import api from '../api';
import { Upload, X, Loader } from 'lucide-react';

export default function ImageUploader({ value, onChange, type = 'games', label = 'تصویر' }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم فایل باید کمتر از ۵ مگابایت باشد');
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const { data } = await api.post(`/upload?type=${type}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange(data.url);
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در آپلود');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-xs text-gray-400 block mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img
              src={value}
              className="w-24 h-24 rounded-lg object-cover border border-[#2a475e]"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className="w-24 h-24 border-2 border-dashed border-[#2a475e] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#66c0f4] transition">
            {uploading ? (
              <Loader size={20} className="animate-spin text-[#66c0f4]" />
            ) : (
              <>
                <Upload size={20} className="text-gray-500 mb-1" />
                <span className="text-[10px] text-gray-500">آپلود</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={upload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
        {value && (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-[#0f1922] border border-[#2a475e] rounded p-2 text-xs"
            placeholder="یا لینک مستقیم"
          />
        )}
      </div>
    </div>
  );
}