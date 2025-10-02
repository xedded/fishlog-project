# Skapa Testanvändare i Supabase

## Metod 1: Via Supabase Dashboard (Enklast)

1. **Gå till Supabase Dashboard**
   - Öppna ditt projekt på [supabase.com](https://supabase.com)
   - Gå till **Authentication** → **Users**

2. **Skapa ny användare**
   - Klicka **"Add user"** → **"Create new user"**

3. **Fyll i uppgifter:**
   - **Email:** `test@fishlog.se` (eller din egen email)
   - **Password:** `testpassword123`
   - ✅ **Auto Confirm User** (viktigt - bocka i denna!)

4. **Klicka "Create user"**

5. **Kopiera User ID**
   - Klicka på den skapade användaren
   - Kopiera **User UID** (t.ex. `550e8400-e29b-41d4-a716-446655440001`)

6. **Skapa user profile i databasen**
   - Gå till **SQL Editor**
   - Kör detta (använd din kopierade UID):
   ```sql
   INSERT INTO public.users (id, email, name, created_at)
   VALUES (
     'DIN-USER-UID-HÄR',
     'test@fishlog.se',
     'Test Fiskare',
     NOW()
   )
   ON CONFLICT (id) DO NOTHING;
   ```

Nu kan du logga in med:
- **Email:** `test@fishlog.se`
- **Lösenord:** `testpassword123`

## Metod 2: Använd Din Egen Email

Om du vill använda din egen email istället:

1. **Skapa användare med din email**
   - Email: `din@email.se`
   - Password: `testpassword123`
   - ✅ Auto Confirm User

2. **Logga in på appen**
   - Användarprofilen skapas automatiskt i databasen

3. **Generera demodata** (valfritt)
   - Klicka på "Generera demodata" i appen
   - Får 10 slumpmässiga fångster

## Metod 3: SQL (Avancerat)

Om du vill skapa användare via SQL:

```sql
-- OBS: Detta kräver Supabase Service Role åtkomst
-- Kör i Supabase SQL Editor med "RUN AS SERVICE ROLE" checkad

-- 1. Skapa auth user (Detta fungerar bara med service role)
SELECT auth.uid() as current_user_id; -- Kolla din nuvarande user

-- 2. Använd istället Dashboard-metoden ovan
-- SQL-metoden är komplicerad pga bcrypt password hashing
```

## Felsökning

**"Invalid login credentials"**
- Kontrollera att "Auto Confirm User" var ibockad
- Försök återställa lösenordet via Supabase Dashboard

**"User not found in database"**
- Kör SQL-queryn ovan för att skapa user profile
- Eller logga in en gång så skapas profilen automatiskt

**"Email already registered"**
- Ta bort användaren i Authentication → Users
- Skapa ny med samma email och "Auto Confirm User"
