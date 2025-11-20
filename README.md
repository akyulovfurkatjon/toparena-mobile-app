# toparena-mobile-app
toparena uchun kerakli faylarni saqlash uchun foydalanamiz
import React, { useState, useEffect } from 'react';

// API'dan keladigan jamoa ma'lumotlari uchun (qisqacha)
interface TeamData {
  team_id: string;
  name: string;
  logo_url?: string;
}

// API'dan keladigan xatolik
interface ErrorData {
  detail: string;
}

// Komponentning TypeScript interfeysi
const JoinTeamScreen: React.FC = () => {
  // `screen_spec_join_team.json` dagi holatlar
  const [loading, setLoading] = useState(true); // Dastlabki ma'lumotni yuklash
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  
  const [isJoining, setIsJoining] = useState(false); // Tasdiqlash tugmasi bosilganda
  const [joinError, setJoinError] = useState<string | null>(null);
  
  // Taklifnoma tokenini URL'dan olish (simulyatsiya)
  // Haqiqiy ilovada bu 'react-router' dagi 'useParams' orqali olinadi
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // 1. Ekran ochilganda jamoa ma'lumotlarini yuklash (data_flow.on_load)
  useEffect(() => {
    // URL'dan 'token' ni olish (masalan: .../join?token=A1B2C3D4)
    const params = new URLSearchParams(window.location.search);
    let token = params.get('token'); // 'const' o'rniga 'let'
    
    // --- PREVIEW UCHUN VAQTINCHALIK O'ZGARTIRISH ---
    // Haqiqiy ilovada bu 'if' shartini olib tashlang.
    if (!token) {
      console.warn("URL'da token topilmadi. Preview uchun soxta token (A1B2C3D4) ishlatilmoqda.");
      token = "A1B2C3D4"; // Bizning backend'dagi soxta token (join_router.py)
    }
    // --- O'ZGARTIRISH TUGADI ---

    if (!token) {
      setError("Taklifnoma tokeni topilmadi.");
      setLoading(false);
      return;
    }
    
    setInviteToken(token);
    
    const fetchTeamData = async () => {
      setLoading(true);
      setError(null);
      try {
        // `GET /api/v1/join-team?token={{token}}` endpointini chaqirish
        
        // API manzilini Vercel'dagi maxfiy kalitdan o'qish
        const API_URL = process.env.REACT_APP_API_URL || 'https://toparena-mobile-app.vercel.app';
        const response = await fetch(`${API_URL}/api/v1/join-team?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Bu endpoint ochiq bo'lishi mumkin yoki o'yinchining tokenini talab qilishi mumkin
            'Authorization': 'Bearer fake-player-token' 
          },
        });

        if (!response.ok) {
          const errorData: ErrorData = await response.json();
          throw new Error(errorData.detail || 'Taklifnoma topilmadi yoki eskirgan.');
        }

        const data: TeamData = await response.json();
        setTeamData(data); // Jamoa ma'lumotlarini saqlash
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []); // Bu faqat bir marta, komponent ochilganda ishlaydi

  // 2. Jamoaga qo'shilishni tasdiqlash (confirm_button bosilganda)
  const handleConfirmJoin = async () => {
    if (!inviteToken) return;
    
    setIsJoining(true);
    setJoinError(null);
    
    try {
      // `POST /api/v1/join-team` endpointini chaqirish
      // (FastAPI'dagi `join_router.py` ga mos)
      
      // API manzilini Vercel'dagi maxfiy kalitdan o'qish
      const API_URL = process.env.REACT_APP_API_URL || 'https://toparena-mobile-app.vercel.app';
      const response = await fetch(`${API_URL}/api/v1/join-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-player-token' // Bu o'yinchi tokeni bo'lishi kerak
        },
        body: JSON.stringify({ invite_token: inviteToken }),
      });

      if (!response.ok) {
        const errorData: ErrorData = await response.json();
        // Masalan: "Siz allaqachon boshqa jamoa a'zosisiz."
        throw new Error(errorData.detail || "Jamoaga qo'shilishda xatolik.");
      }
      
      const result = await response.json();
      
      // Muvaffaqiyat!
      // Foydalanuvchini jamoa sahifasiga yo'naltirish
      alert(result.message); // "Siz 'Paxtakor' jamoasiga muvaffaqiyatli qo'shildingiz!"
      // window.location.href = `/teams/${teamData?.team_id}`;

    } catch (err: any) {
      setJoinError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  // 3. Bekor qilish (cancel_button bosilganda)
  const handleCancel = () => {
    // Asosiy sahifaga qaytarish
    window.location.href = '/';
  };

  // --- Komponentni chizish ---

  const renderContent = () => {
    // 1. Yuklanmoqda (loading_indicator)
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-400">Taklifnoma tekshirilmoqda...</p>
        </div>
      );
    }

    // 2. Xatolik (error_message)
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <span className="text-5xl mb-4">🛑</span>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Xatolik!</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      );
    }

    // 3. Tasdiqlash oynasi (confirmation_card)
    if (teamData) {
      return (
        <div className="text-center" aria-labelledby="confirmation-title">
          {/* team_logo */}
          <img 
            src={teamData.logo_url || 'https://placehold.co/100x100/3B82F6/FFFFFF?text=Logo'} 
            alt="Jamoa logotipi" 
            className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-blue-500"
          />
          
          {/* title_text */}
          <h2 id="confirmation-title" className="text-3xl font-bold text-white mb-2">
            Sizni jamoaga taklif qilishdi!
          </h2>
          
          {/* team_name_text */}
          <p className="text-lg text-gray-300 mb-8">
            Siz "<span className="font-bold text-blue-400">{teamData.name}</span>" jamoasiga qo'shilmoqchimisiz?
          </p>
          
          {joinError && <p className="text-red-400 text-sm text-center mb-4">{joinError}</p>}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* cancel_button */}
            <button
              onClick={handleCancel}
              disabled={isJoining}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-500 transition disabled:opacity-50"
              aria-label="Bekor qilish"
            >
              Bekor qilish
            </button>

            {/* confirm_button */}
            <button
              onClick={handleConfirmJoin}
              disabled={isJoining}
              className="w-full sm:w-auto flex justify-center items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:bg-blue-400"
              aria-label={`Ha, ${teamData.name} jamoasiga qo'shilish`}
            >
              {isJoining ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Ha, qo'shilish"
              )}
            </button>
          </div>
        </div>
      );
    }
    
    return null; // Hech qanday holatga tushmasa
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4 font-inter">
      <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-xl p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default JoinTeamScreen;
