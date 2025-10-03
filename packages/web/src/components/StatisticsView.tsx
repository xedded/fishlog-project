'use client'

import { useState, useEffect } from 'react'
import { Catch } from '@/types/catch'
import { useLanguage } from '@/contexts/LanguageContext'
import { Fish, TrendingUp, Award, Hash, MapPin, CloudRain, Clock, Trophy } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface StatisticsViewProps {
  catches: Catch[]
  darkMode?: boolean
  showFilters?: boolean
  showOnlyRecords?: boolean
}

export default function StatisticsView({ catches, darkMode = false, showOnlyRecords = false }: StatisticsViewProps) {
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
      return (kg * 2.20462).toFixed(2)
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
        longestLength: 0,
        speciesId: speciesId
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
    speciesId: string
  }>)

  // Sort species by count (most caught first)
  const sortedSpecies = Object.values(speciesStats).sort((a, b) => b.count - a.count)

  // PB Lista (Personal Bests)
  const personalBests = sortedSpecies.map(species => ({
    name: species.name,
    weight: species.biggestWeight,
    length: species.longestLength
  })).filter(pb => pb.weight > 0 || pb.length > 0)

  // Catches over time (monthly)
  const catchesByMonth = catches.reduce((acc, catchItem) => {
    const date = new Date(catchItem.caught_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, count: 0, totalWeight: 0 }
    }

    acc[monthKey].count += catchItem.quantity || 1
    if (catchItem.weight) {
      acc[monthKey].totalWeight += catchItem.weight
    }

    return acc
  }, {} as Record<string, { month: string; count: number; totalWeight: number }>)

  const monthlyData = Object.values(catchesByMonth)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => ({
      month: d.month,
      count: d.count,
      avgWeight: d.totalWeight / d.count
    }))

  // Catches by location
  const catchesByLocation = catches.reduce((acc, catchItem) => {
    const location = catchItem.location_name
    if (!acc[location]) {
      acc[location] = 0
    }
    acc[location] += catchItem.quantity || 1
    return acc
  }, {} as Record<string, number>)

  const allLocations = Object.entries(catchesByLocation)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }))

  const topLocations = allLocations.slice(0, 5)

  // Weather correlation
  const weatherStats = catches
    .filter(c => c.weather_data)
    .reduce((acc, catchItem) => {
      const temp = catchItem.weather_data?.temperature
      const desc = catchItem.weather_data?.weather_desc || 'unknown'

      if (!acc[desc]) {
        acc[desc] = { count: 0, totalTemp: 0 }
      }

      acc[desc].count += catchItem.quantity || 1
      if (temp) acc[desc].totalTemp += temp

      return acc
    }, {} as Record<string, { count: number; totalTemp: number }>)

  const weatherData = Object.entries(weatherStats)
    .map(([condition, data]) => ({
      condition,
      count: data.count,
      avgTemp: data.totalTemp / data.count
    }))
    .sort((a, b) => b.count - a.count)

  // Time patterns (hour of day)
  const catchesByHour = catches.reduce((acc, catchItem) => {
    const hour = new Date(catchItem.caught_at).getHours()
    if (!acc[hour]) {
      acc[hour] = 0
    }
    acc[hour] += catchItem.quantity || 1
    return acc
  }, {} as Record<number, number>)

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    count: catchesByHour[i] || 0
  }))

  // Pie chart colors - brighter for better contrast in dark mode
  const COLORS = ['#60a5fa', '#a78bfa', '#f87171', '#fbbf24', '#34d399', '#f472b6', '#22d3ee', '#fb923c']

  // Custom label for pie chart
  const renderCustomLabel = (props: { name?: string; value?: number }) => {
    if (!props.name || !props.value) return ''
    return `${props.name}: ${props.value}`
  }

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

  // If showOnlyRecords is true, render only Personal Bests section
  if (showOnlyRecords) {
    return (
      <div className="space-y-6">
        {/* Personal Bests (PB) */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className={`w-6 h-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {language === 'en' ? 'Personal Bests' : 'Personliga rekord'}
            </h3>
          </div>
          {personalBests.length === 0 ? (
            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} py-8`}>
              {language === 'en' ? 'No records yet - add weight or length data to your catches!' : 'Inga rekord än - lägg till vikt- eller längddata på dina fångster!'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalBests.map((pb, index) => (
                <div key={index} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 hover:shadow-md transition-shadow`}>
                  <h4 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {pb.name}
                  </h4>
                  <div className="space-y-2">
                    {pb.weight > 0 && (
                      <div className="flex items-center gap-2">
                        <Award className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {language === 'en' ? 'Weight:' : 'Vikt:'}
                        </span>
                        <span className={`ml-auto font-bold text-lg ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          {convertWeight(pb.weight)} {weightUnit}
                        </span>
                      </div>
                    )}
                    {pb.length > 0 && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {language === 'en' ? 'Length:' : 'Längd:'}
                        </span>
                        <span className={`ml-auto font-bold text-lg ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                          {pb.length} cm
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Charts Row 1: Catches over time + Species distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catches Over Time */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            {language === 'en' ? 'Catches Over Time' : 'Fångster över tid'}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  color: darkMode ? '#ffffff' : '#000000'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name={language === 'en' ? 'Catches' : 'Fångster'} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Species Distribution */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            {language === 'en' ? 'Species Distribution' : 'Artfördelning'}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sortedSpecies.slice(0, 8)}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={renderCustomLabel}
                labelLine={{ stroke: darkMode ? '#9ca3af' : '#6b7280' }}
              >
                {sortedSpecies.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  color: darkMode ? '#ffffff' : '#000000'
                }}
              />
              <Legend
                wrapperStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Top Locations + Time of Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {language === 'en' ? `Top Locations (${topLocations.length})` : `Bästa platserna (${topLocations.length})`}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(250, topLocations.length * 25)}>
            <BarChart data={topLocations} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis type="number" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  color: darkMode ? '#ffffff' : '#000000'
                }}
              />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time of Day Pattern */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {language === 'en' ? 'Best Time of Day' : 'Bästa tid på dygnet'}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="hour" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weather Correlation */}
      {weatherData.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <CloudRain className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {language === 'en' ? 'Weather Conditions' : 'Väderförhållanden'}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {weatherData.slice(0, 4).map((weather, index) => (
              <div key={index} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {weather.count}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 capitalize`}>
                  {weather.condition}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  {weather.avgTemp.toFixed(1)}°C avg
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per Species Table */}
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
