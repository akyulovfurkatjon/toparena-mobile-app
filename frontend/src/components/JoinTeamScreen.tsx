import React, { useState, ChangeEvent } from 'react';

// O'zbekiston viloyatlari ro'yxati
const uzbekViloyatlar = [
  "Toshkent shahri", "Toshkent viloyati", "Andijon", "Buxoro", "Farg'ona", 
  "Jizzax", "Xorazm", "Namangan", "Navoiy", "Qashqadaryo", 
  "Samarqand", "Sirdaryo", "Surxondaryo", "Qoraqalpog'iston"
];

// API'ga yuboriladigan ma'lumotlar tipi (FastAPI'dagi TeamInput'ga mos)
interface TeamInputData {
  name: string;
  viloyat: string;
  logo_url?: string;
}

// Komponentning TypeScript interfeysi
const CreateTeamScreen: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [viloyat, setViloyat] = useState<string>(""); // Select uchun standart
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  // Validatsiya (tekshirish) funksiyasi
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string | null } = {};
    
    // US-201 AC: Jamoa nomi kamida 3 ta belgi
    if (teamName.length < 3) {
      newErrors.teamName = "Jamoa nomi kamida 3 ta belgidan iborat bo'lishi kerak.";
    }
    
    // US-201 AC: Viloyat tanlanishi shart
    if (!viloyat) {
      newErrors.viloyat = "Iltimos, viloyatni tanlang.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Logo tanlash (HTML input type='file' uchun)
  const handleSelectLogo = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setErrors(prev => ({ ...prev, logo: null }));
      
      // Rasm preview uchun
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  // Formani yuborish (screen_spec: submit_button)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Formaning an'anaviy yuborilishini to'xtatish
    if (!validateForm()) {
      return; // Validatsiyadan o'tmadi
    }
    
    setIsLoading(true);
    setErrors({});

    let uploadedLogoUrl = undefined;

    // 1. Rasmni yuklash (TODO: Bu yerda S3 ga yuklash mantig'i bo'lishi kerak)
    if (logoFile) {
      // Haqiqiy loyihada, avval S3 ga yuklab, URL olinadi.
      // Hozircha buni simulyatsiya qilamiz.
      // const formData = new FormData();
      // formData.append('file', logoFile);
      // const uploadResponse = await fetch('https://api.futapp.uz/api/v1/upload-logo', { ... });
      // const uploadData = await uploadResponse.json();
      // uploadedLogoUrl = uploadData.url;
      console.log("Rasm yuklanmoqda (simulyatsiya)...", logoFile.name);
      // Simulyatsiya qilingan URL
      uploadedLogoUrl = `https://s3.futapp.uz/logos/${logoFile.name}`;
    }
    
    const teamData: TeamInputData = {
      name: teamName,
      viloyat: viloyat!,
      logo_url: uploadedLogoUrl,
    };
    
    try {
      // 2. Backend (FastAPI) endpointini chaqirish
      // Bizning 'backend/routers/team_router.py' dagi POST /api/v1/teams
      
      // API manzilini Vercel'dagi maxfiy kalitdan o'qish
      const API_URL = process.env.REACT_APP_API_URL || 'https://toparena-mobile-app.vercel.app';
      const response = await fetch(`${API_URL}/api/v1/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-coach-token' 
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server xatoligi");
      }

      const newTeam = await response.json();
      
      // Muvaffaqiyat!
      console.log('Jamoa yaratildi:', newTeam);
      // Bu yerda foydalanuvchini yangi jamoa sahifasiga yo'naltirish kerak
      // Masalan: window.location.href = `/teams/${newTeam.team_id}`;
      alert("Jamoa muvaffaqiyatli yaratildi!");


    } catch (error: any) {
      console.error(error);
      setErrors({ form: error.message || "Jamoa yaratishda noma'lum xatolik." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4 font-inter">
      <div className="w-full max-w-2xl bg-gray-800 text-white rounded-lg shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-3xl font-bold text-center mb-6">Yangi Jamoa Yaratish</h1>

          {/* screen_spec: logo_uploader */}
          <div className="flex flex-col items-center space-y-2">
            <label 
              htmlFor="logo-upload" 
              className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-2 border-dashed border-blue-500 cursor-pointer hover:bg-gray-600 transition"
              aria-label="Jamoa logotipini yuklash"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Jamoa logotipi" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-gray-400 text-center text-sm">Logo Yuklash</span>
              )}
            </label>
            <input 
              id="logo-upload" 
              type="file" 
              accept="image/png, image/jpeg" 
              className="hidden" 
              onChange={handleSelectLogo}
            />
            {errors.logo && <p className="text-red-400 text-sm">{errors.logo}</p>}
          </div>

          {/* screen_spec: team_name_input */}
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-2">
              Jamoa nomi
            </label>
            <input
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Jamoa nomini kiriting (masalan, 'Paxtakor U-21')"
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${errors.teamName ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
              aria-invalid={!!errors.teamName}
            />
            {errors.teamName && <p className="text-red-400 text-sm mt-1">{errors.teamName}</p>}
          </div>

          {/* screen_spec: viloyat_picker (HTML Select) */}
          <div>
            <label htmlFor="viloyat" className="block text-sm font-medium text-gray-300 mb-2">
              Viloyat
            </label>
            <select
              id="viloyat"
              value={viloyat}
              onChange={(e) => setViloyat(e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${errors.viloyat ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
              aria-invalid={!!errors.viloyat}
            >
              <option value="" disabled className="text-gray-500">Viloyatni tanlang...</option>
              {uzbekViloyatlar.map((v) => (
                <option key={v} value={v} className="text-black">{v}</option>
              ))}
            </select>
            {errors.viloyat && <p className="text-red-400 text-sm mt-1">{errors.viloyat}</p>}
          </div>

          {/* screen_spec: description_input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Jamoa haqida (Ixtiyoriy)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jamoa haqida qisqacha..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* screen_spec: submit_button va loading_indicator */}
          <div>
            {errors.form && <p className="text-red-400 text-sm text-center mb-4">{errors.form}</p>}
            <button
              type="submit"
              disabled={isLoading || !teamName || !viloyat}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
              aria-label="Jamoani yaratish tugmasi"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Jamoani Yaratish"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamScreen;
