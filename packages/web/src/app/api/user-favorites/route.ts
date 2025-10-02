import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing userId parameter' },
      { status: 400 }
    )
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get user's top 5 most caught species
    const { data, error } = await supabase
      .from('catches')
      .select('species_id, species(id, name_swedish, name_english, name_latin, category, continent)')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user catches:', error)
      return NextResponse.json({ favorites: [] })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ favorites: [] })
    }

    // Count catches per species
    type SpeciesData = {
      id: string
      name_swedish: string
      name_english: string
      name_latin: string
      category: string
      continent: string
    }
    const speciesCount = new Map<string, { count: number; species: SpeciesData | SpeciesData[] | null }>()

    data.forEach((catch_item) => {
      const speciesId = catch_item.species_id
      if (speciesCount.has(speciesId)) {
        speciesCount.get(speciesId)!.count++
      } else {
        speciesCount.set(speciesId, {
          count: 1,
          species: catch_item.species
        })
      }
    })

    // Sort by count and take top 5
    const favorites = Array.from(speciesCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.species)

    return NextResponse.json({ favorites })

  } catch (error) {
    console.error('User favorites request failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites', favorites: [] },
      { status: 500 }
    )
  }
}
