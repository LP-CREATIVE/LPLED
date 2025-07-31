# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Create new project with:
   - Name: `led-display-manager`
   - Database Password: (save this!)
   - Region: Choose closest to you

### 2. Set Up Database
1. In Supabase Dashboard, go to SQL Editor
2. Click "New query"
3. Copy ALL content from `supabase-schema.sql`
4. Paste and click "Run"
5. You should see "Success" messages

### 3. Get Your API Keys
1. In Supabase Dashboard, go to Settings → API
2. Copy these values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_KEY`

### 4. Configure Environment
1. Copy environment files:
```bash
cd led-display-manager
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
```

2. Edit `frontend/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Edit `backend/.env`:
```
SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_KEY=your_service_key_here
VNNOX_AK=contact_novastar_for_this
VNNOX_AS=contact_novastar_for_this
```

### 5. Install & Run
```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### 6. Access Your App
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 7. Create Your Account
1. Go to http://localhost:3000
2. Click "Get Started"
3. Register with:
   - Email: lucas@lpcreative.studio
   - Password: Believe118!
   - Full Name: Lucas
   - Company: LP Creative Studio

## 🎉 You're Ready!

### Next Steps:
1. **Add Sample Templates** (optional):
   - Go to Supabase SQL Editor
   - Run the SQL from `create-sample-templates.ts` output

2. **Get VNNOX Credentials**:
   - Contact Novastar support
   - Request API access for TB Series
   - Add credentials to `backend/.env`

3. **Add Your First Display**:
   - Login to dashboard
   - Click "Add Display"
   - Enter your TB controller details

## 📱 What You Can Do:
- ✅ Upload images and videos
- ✅ Use pre-designed templates
- ✅ Control brightness and volume
- ✅ Schedule content
- ✅ Monitor display status in real-time
- ✅ Manage multiple displays
- ✅ Power on/off remotely

## 🆘 Need Help?
- **Supabase Issues**: Check authentication settings
- **Can't Connect**: Verify all env variables are set
- **Display Not Found**: Ensure VNNOX credentials are correct

## 📝 Default Credentials
- Email: `lucas@lpcreative.studio`
- Password: `Believe118!`