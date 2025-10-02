const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkSpecies() {
  const { data, error } = await supabase
    .from('species')
    .select('id, name_swedish')
    .order('name_swedish')
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Species in database:')
    data.forEach(s => console.log(`  - ${s.name_swedish}`))
  }
}

checkSpecies()
