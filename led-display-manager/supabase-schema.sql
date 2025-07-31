-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Displays table
CREATE TABLE IF NOT EXISTS public.displays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    vnnox_terminal_id TEXT NOT NULL,
    vnnox_secret TEXT NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media table
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- for videos in seconds
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    preview_url TEXT NOT NULL,
    template_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content schedules table
CREATE TABLE IF NOT EXISTS public.content_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_id UUID NOT NULL REFERENCES public.displays(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('media', 'template')),
    content_id UUID NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    repeat_days TEXT[], -- Array of days: ['monday', 'tuesday', etc.]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_displays_user_id ON public.displays(user_id);
CREATE INDEX idx_media_user_id ON public.media(user_id);
CREATE INDEX idx_content_schedules_display_id ON public.content_schedules(display_id);
CREATE INDEX idx_content_schedules_active ON public.content_schedules(is_active);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.displays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own displays
CREATE POLICY "Users can view own displays" ON public.displays
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own displays" ON public.displays
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own displays" ON public.displays
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own displays" ON public.displays
    FOR DELETE USING (auth.uid() = user_id);

-- Users can manage their own media
CREATE POLICY "Users can view own media" ON public.media
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media" ON public.media
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media" ON public.media
    FOR DELETE USING (auth.uid() = user_id);

-- Template policies
CREATE POLICY "Anyone can view public templates" ON public.templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own templates" ON public.templates
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create templates" ON public.templates
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON public.templates
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates" ON public.templates
    FOR DELETE USING (auth.uid() = created_by);

-- Content schedule policies
CREATE POLICY "Users can view schedules for own displays" ON public.content_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.displays
            WHERE displays.id = content_schedules.display_id
            AND displays.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create schedules for own displays" ON public.content_schedules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.displays
            WHERE displays.id = content_schedules.display_id
            AND displays.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update schedules for own displays" ON public.content_schedules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.displays
            WHERE displays.id = content_schedules.display_id
            AND displays.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete schedules for own displays" ON public.content_schedules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.displays
            WHERE displays.id = content_schedules.display_id
            AND displays.user_id = auth.uid()
        )
    );

-- Functions

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_displays_updated_at BEFORE UPDATE ON public.displays
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_schedules_updated_at BEFORE UPDATE ON public.content_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();