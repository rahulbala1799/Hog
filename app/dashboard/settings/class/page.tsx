'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface ClassTiming {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export default function ClassSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maxPersons, setMaxPersons] = useState(10)
  const [classTimings, setClassTimings] = useState<ClassTiming[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setMaxPersons(data.settings.maxPersonsPerClass)
        setClassTimings(
          data.settings.classTimings.map((t: any) => ({
            dayOfWeek: t.dayOfWeek,
            startTime: t.startTime,
            endTime: t.endTime,
          }))
        )
      } else {
        setError('Failed to load settings')
      }
    } catch (err) {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxPersonsPerClass: maxPersons,
          classTimings: classTimings,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to save settings')
      }
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const addTiming = () => {
    setClassTimings([
      ...classTimings,
      { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' },
    ])
  }

  const removeTiming = (index: number) => {
    setClassTimings(classTimings.filter((_, i) => i !== index))
  }

  const updateTiming = (index: number, field: string, value: string | number) => {
    const updated = [...classTimings]
    updated[index] = { ...updated[index], [field]: value }
    setClassTimings(updated)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Class Settings</h1>
              <p className="text-xs text-gray-600">Configure class parameters</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355] mx-auto"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Max Persons Per Class */}
            <div className="card p-5 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Max Persons Per Class
              </h2>
              <div>
                <label
                  htmlFor="maxPersons"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Maximum number of students per class
                </label>
                <input
                  type="number"
                  id="maxPersons"
                  min="1"
                  value={maxPersons}
                  onChange={(e) => setMaxPersons(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                />
              </div>
            </div>

            {/* Class Timings */}
            <div className="card p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Class Timings
                </h2>
                <button
                  onClick={addTiming}
                  className="px-4 py-2 bg-[#8B7355] text-white rounded-lg text-sm font-medium hover:bg-[#6B5645] transition-colors"
                >
                  + Add Timing
                </button>
              </div>

              {classTimings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No class timings set</p>
                  <p className="text-xs mt-1">Add a timing to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classTimings.map((timing, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg space-y-3"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Day of Week
                        </label>
                        <select
                          value={timing.dayOfWeek}
                          onChange={(e) =>
                            updateTiming(index, 'dayOfWeek', parseInt(e.target.value))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base bg-white"
                        >
                          {DAYS.map((day, dayIndex) => (
                            <option key={dayIndex} value={dayIndex}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={timing.startTime}
                            onChange={(e) =>
                              updateTiming(index, 'startTime', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={timing.endTime}
                            onChange={(e) =>
                              updateTiming(index, 'endTime', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => removeTiming(index)}
                        className="w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full btn-primary"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </>
        )}
      </main>
    </div>
  )
}
