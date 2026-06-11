-- Clean up existing tables to avoid "already exists" errors
DROP TABLE IF EXISTS public.expense_splits CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.settlements CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.friends CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    split_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING ( auth.uid() = id );

-- Create friends table
CREATE TABLE public.friends (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'bound', -- 'bound', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, friend_id),
    CHECK (user_id != friend_id)
);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friends."
    ON public.friends FOR SELECT
    USING ( auth.uid() = user_id OR auth.uid() = friend_id );

CREATE POLICY "Users can insert friends."
    ON public.friends FOR INSERT
    WITH CHECK ( auth.uid() = user_id OR auth.uid() = friend_id );

CREATE POLICY "Users can delete friends."
    ON public.friends FOR DELETE
    USING ( auth.uid() = user_id );

-- Create groups table
CREATE TABLE public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create group_members table
CREATE TABLE public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Group policies
DROP POLICY IF EXISTS "Group members can view groups." ON public.groups;
CREATE POLICY "Group members can view groups."
    ON public.groups FOR SELECT
    USING ( auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid()) );

DROP POLICY IF EXISTS "Users can create groups." ON public.groups;
CREATE POLICY "Users can create groups."
    ON public.groups FOR INSERT
    WITH CHECK ( auth.uid() = created_by );

DROP POLICY IF EXISTS "Group members can view group members." ON public.group_members;
CREATE POLICY "Authenticated users can view group members."
    ON public.group_members FOR SELECT
    USING ( auth.uid() IS NOT NULL );

DROP POLICY IF EXISTS "Users can add members to their groups." ON public.group_members;
CREATE POLICY "Users can add members to their groups."
    ON public.group_members FOR INSERT
    WITH CHECK ( auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid()) );

-- Create expenses table
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category TEXT DEFAULT 'Others',
    receipt_url TEXT,
    notes TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view expenses."
    ON public.expenses FOR SELECT
    USING ( EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.expenses.group_id AND user_id = auth.uid()) );

CREATE POLICY "Group members can insert expenses."
    ON public.expenses FOR INSERT
    WITH CHECK ( EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.expenses.group_id AND user_id = auth.uid()) );

-- Create expense_splits table
CREATE TABLE public.expense_splits (
    expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    percentage DECIMAL(5,2),
    PRIMARY KEY (expense_id, user_id)
);

ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view expense splits."
    ON public.expense_splits FOR SELECT
    USING ( EXISTS (
        SELECT 1 FROM public.expenses e
        JOIN public.group_members gm ON e.group_id = gm.group_id
        WHERE e.id = expense_id AND gm.user_id = auth.uid()
    ));

CREATE POLICY "Group members can insert expense splits."
    ON public.expense_splits FOR INSERT
    WITH CHECK ( EXISTS (
        SELECT 1 FROM public.expenses e
        JOIN public.group_members gm ON e.group_id = gm.group_id
        WHERE e.id = expense_id AND gm.user_id = auth.uid()
    ));

-- Create settlements table
CREATE TABLE public.settlements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    paid_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    paid_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view settlements."
    ON public.settlements FOR SELECT
    USING ( EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.settlements.group_id AND user_id = auth.uid()) );

CREATE POLICY "Users involved can create settlements."
    ON public.settlements FOR INSERT
    WITH CHECK ( auth.uid() = paid_by );

-- Create Function to Generate Split ID
CREATE OR REPLACE FUNCTION generate_split_id()
RETURNS TRIGGER AS $$
DECLARE
    new_id TEXT;
    done BOOLEAN := false;
BEGIN
    WHILE NOT done LOOP
        new_id := 'SPT-' || upper(substr(md5(random()::text), 1, 6));
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE split_id = new_id) THEN
            done := true;
        END IF;
    END LOOP;
    NEW.split_id := new_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_split_id ON public.profiles;
CREATE TRIGGER trigger_generate_split_id
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    WHEN (NEW.split_id IS NULL)
    EXECUTE FUNCTION generate_split_id();

-- Create Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Receipts are viewable by everyone" ON storage.objects;
CREATE POLICY "Receipts are viewable by everyone"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'receipts' );

DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
CREATE POLICY "Authenticated users can upload receipts"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'receipts' AND auth.uid() IS NOT NULL );

-- Auto-create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
