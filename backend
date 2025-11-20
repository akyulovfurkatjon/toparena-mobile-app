from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Biz yaratgan barcha routerlarni import qilamiz
from backend.routers import team_router, join_router, payme_webhook, ml_router

# FastAPI ilovasini yaratamiz
app = FastAPI(
    title="O'zbekiston Futbol Ilovasi API",
    description="Backend API: Jamoalar, To'lovlar, ML va Jonli Statistika",
    version="0.1.0"
)

# --- Xavfsizlik (CORS) ---
# security_checklist.md (A05) ga asosan
# Hozircha '*' qo'yamiz, lekin production'da aniq domenni
# (masalan, "https://sizning-frontend-saytingiz.vercel.app") kiritishingiz kerak.
origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Barcha metodlarga ruxsat berish
    allow_headers=["*"], # Barcha sarlavhalarga ruxsat berish
)

# --- Barcha Routerlarni Ilovaga Ulash ---

# /api/v1/teams...
app.include_router(team_router.router)
# /api/v1/join-team...
app.include_router(join_router.router)
# /api/v1/webhooks/payme
app.include_router(payme_webhook.router)
# /api/v1/teams/{team_id}/suggest-lineup
app.include_router(ml_router.router)

# Asosiy endpoint (ishlayotganini tekshirish uchun)
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Assalomu alaykum! Futbol Ilovasi API'ga xush kelibsiz!"}
