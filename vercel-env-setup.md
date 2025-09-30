# Vercel Environment Variables Setup

Your Fishlog app has been deployed to: https://fishlog-project-5jzhhk4ii-xeddeds-projects.vercel.app

## Environment Variables to Add in Vercel Dashboard

Go to: https://vercel.com/xeddeds-projects/fishlog-project/settings/environment-variables

Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://upufuptjzprlysvkecpt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdWZ1cHRqenBybHlzdmtlY3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTI0OTIsImV4cCI6MjA3NDcyODQ5Mn0.lq5qZp6g3TxK0az49KM0hDQ1SdDnDUU9AV7bHZtvwGY
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdWZ1cHRqenBybHlzdmtlY3B0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE1MjQ5MiwiZXhwIjoyMDc0NzI4NDkyfQ.1kQn_Riw5rlZcccYLUoF23gJ9mxaiYn3POFPzfCIrro
DATABASE_URL = postgresql://postgres:UjFF6cr6QZWa6LOn@db.upufuptjzprlysvkecpt.supabase.co:6543/postgres
NEXTAUTH_SECRET = fishlog-secret-key-2024-dev
NEXTAUTH_URL = https://fishlog-project-5jzhhk4ii-xeddeds-projects.vercel.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = AIzaSyDdSZyd1oz3oNA9yGmsamXvEezhMOhegn4
```

Set Environment: **Production, Preview, Development** for all variables

After adding these, redeploy the application.