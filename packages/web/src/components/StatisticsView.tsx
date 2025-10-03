'use client'

import { useState, useEffect } from 'react'
import { Catch } from '@/types/catch'
import { useLanguage } from '@/contexts/LanguageContext'
import { Fish, TrendingUp, Award, Hash } from 'lucide-react'

interface StatisticsViewProps {
  catches: Catch[]
  darkMode?: boolean
}

export default function StatisticsView({ catches, darkMode = false }: StatisticsViewProps) {
  const { language } = useLanguage()
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric')

  useEffect(() => {
    const saved = localStorage.getItem('fishlog-unit-system')
    if (saved === 'imperial' || saved === 'metric') {
      setUnitSystem(saved)
    }
  }, [])

  // Convert weight based on unit system
  const convertWeight = (kg: number | null) => {
    if (!kg) return null
    if (unitSystem === 'imperial') {
      return (kg * 2.20462).toFixed(2) // Convert to pounds
    }
    return kg.toFixed(2)
  }

  const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg'

  // Calculate total statistics
  const totalCatches = catches.reduce((sum, c) => sum + (c.quantity || 1), 0)
  const totalSpecies = new Set(catches.map(c => c.species_id)).size

  // Find biggest catch by weight
  const biggestByWeight = catches
    .filter(c => c.weight !== null)
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))[0]

  // Find longest catch
  const longestCatch = catches
    .filter(c => c.length !== null)
    .sort((a, b) => (b.length || 0) - (a.length || 0))[0]

  // Statistics per species
  const speciesStats = catches.reduce((acc, catchItem) => {
    const speciesId = catchItem.species_id
    const speciesName = language === 'en'
      ? catchItem.species.name_english
      : catchItem.species.name_swedish

    if (!acc[speciesId]) {
      acc[speciesId] = {
        name: speciesName,
        latinName: catchItem.species.name_latin,
        count: 0,
        totalWeight: 0,
        biggestWeight: 0,
        longestLength: 0
      }
    }

    acc[speciesId].count += catchItem.quantity || 1
    if (catchItem.weight) {
      acc[speciesId].totalWeight += catchItem.weight
      acc[speciesId].biggestWeight = Math.max(acc[speciesId].biggestWeight, catchItem.weight)
    }
    if (catchItem.length) {
      acc[speciesId].longestLength = Math.max(acc[speciesId].longestLength, catchItem.length)
    }

    return acc
  }, {} as Record<string, {
    name: string
    latinName: string
    count: number
    totalWeight: number
    biggestWeight: number
    longestLength: number
  }>)

  // Sort species by count (most caught first)
  const sortedSpecies = Object.values(speciesStats)
    .sort((a, b) => b.count - a.count)

  if (catches.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center`}>
        <Fish className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {language === 'en' ? 'No catches yet - start logging to see statistics!' : 'Inga fångster än - börja logga för att se statistik!'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Catches */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'en' ? 'Total Catches' : 'Totala fångster'}
            </h3>
            <Hash className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalCatches}
          </p>
        </div>

        {/* Species Count */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'en' ? 'Species' : 'Arter'}
            </h3>
            <Fish className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalSpecies}
          </p>
        </div>

        {/* Biggest Catch */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'en' ? 'Biggest Catch' : 'Största fångst'}
            </h3>
            <Award className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
          {biggestByWeight ? (
            <>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {convertWeight(biggestByWeight.weight)} {weightUnit}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {language === 'en' ? biggestByWeight.species.name_english : biggestByWeight.species.name_swedish}
              </p>
            </>
          ) : (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'en' ? 'No weight data' : 'Ingen viktdata'}
            </p>
          )}
        </div>

        {/* Longest Catch */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'en' ? 'Longest Catch' : 'Längsta fångst'}
            </h3>
            <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          {longestCatch ? (
            <>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {longestCatch.length} cm
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {language === 'en' ? longestCatch.species.name_english : longestCatch.species.name_swedish}
              </p>
            </>
          ) : (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'en' ? 'No length data' : 'Ingen längddata'}
            </p>
          )}
        </div>
      </div>

      {/* Per Species Statistics */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
        <div className="p-6 border-b border-gray-700">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {language === 'en' ? 'Statistics per Species' : 'Statistik per art'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                  {language === 'en' ? 'Species' : 'Art'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                  {language === 'en' ? 'Count' : 'Antal'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                  {language === 'en' ? 'Total Weight' : 'Total vikt'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                  {language === 'en' ? 'Biggest' : 'Största'}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                  {language === 'en' ? 'Longest' : 'Längsta'}
                </th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {sortedSpecies.map((species, index) => (
                <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {species.name}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {species.latinName}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {species.count}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {species.totalWeight > 0 ? `${convertWeight(species.totalWeight)} ${weightUnit}` : '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {species.biggestWeight > 0 ? `${convertWeight(species.biggestWeight)} ${weightUnit}` : '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {species.longestLength > 0 ? `${species.longestLength} cm` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
