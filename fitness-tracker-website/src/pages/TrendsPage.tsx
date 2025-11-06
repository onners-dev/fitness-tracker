import React, { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { trendService } from '../services/trendApi.js'
import './TrendsPage.css'

type NutritionTrend = {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fats: number
}

type WorkoutTrend = {
  date: string
  total_workout_count: number
  total_calories_burned: number
}

const formatDate = (isoDateString: string): string => {
  const date = new Date(isoDateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const TrendsPage: React.FC = () => {
  const [nutritionTrends, setNutritionTrends] = useState<NutritionTrend[]>([])
  const [workoutTrends, setWorkoutTrends] = useState<WorkoutTrend[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<7 | 30 | 90>(30)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true)
        setError(null)

        const [nutritionData, workoutData] = await Promise.all([
          trendService.getNutritionTrends(timeframe),
          trendService.getWorkoutTrends(timeframe)
        ])

        setNutritionTrends(nutritionData || [])
        setWorkoutTrends(workoutData || [])
      } catch (error: any) {
        setError(`Failed to load trends: ${error.message}`)
        setNutritionTrends([])
        setWorkoutTrends([])
      } finally {
        setLoading(false)
      }
    }
    fetchTrends()
  }, [timeframe])

  const renderTrendChart = <T extends { date: string }>(
    data: T[],
    dataKey: keyof T,
    color: string,
    title: string
  ) => {
    const dataValues = data.map(item => Number(item[dataKey]) || 0)
    const minValue = Math.min(...dataValues)
    const maxValue = Math.max(...dataValues)

    const YAxisTick: React.FC<any> = ({ x, y, payload }) => (
      <text
        x={x}
        y={y}
        fill="#666"
        textAnchor="end"
        dominantBaseline="middle"
      >
        {new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short'
        }).format(payload.value)}
      </text>
    )

    return (
      <div className="trend-chart">
        <h3>{title}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#666' }}
              tickFormatter={formatDate}
            />
            <YAxis
              tick={<YAxisTick />}
              domain={[
                Math.max(0, minValue * 0.8),
                maxValue * 1.2
              ]}
              width={80}
              tickFormatter={value =>
                new Intl.NumberFormat('en-US').format(Math.round(Number(value)))
              }
            />
            <Tooltip
              formatter={(value, name) =>
                [
                  new Intl.NumberFormat('en-US').format(Math.round(Number(value))),
                  String(name)
                ]
              }
              contentStyle={{
                background: 'white',
                border: `1px solid ${color}`,
                borderRadius: '8px'
              }}
              labelFormatter={formatDate}
            />
            <Area
              type="monotone"
              dataKey={dataKey as string}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (loading) return <div className="loading">Loading trends...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="trends-page">
      <div className="page-header">
        <h1>Your Fitness Insights</h1>
        <div className="timeframe-selector">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              className={timeframe === days ? 'active' : ''}
              onClick={() => setTimeframe(days as 7 | 30 | 90)}
              type="button"
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      <div className="trends-section nutrition-trends">
        <h2>Nutrition Trends</h2>
        {nutritionTrends.length === 0 ? (
          <p className="no-data">No nutrition data available</p>
        ) : (
          <div className="charts-grid">
            {renderTrendChart(nutritionTrends, 'total_calories', '#FF6384', 'Daily Calories')}
            {renderTrendChart(nutritionTrends, 'total_protein', '#36A2EB', 'Protein Intake')}
            {renderTrendChart(nutritionTrends, 'total_carbs', '#FFCE56', 'Carbohydrate Intake')}
            {renderTrendChart(nutritionTrends, 'total_fats', '#4BC0C0', 'Fat Intake')}
          </div>
        )}
      </div>

      <div className="trends-section workout-trends">
        <h2>Workout Trends</h2>
        {workoutTrends.length === 0 ? (
          <p className="no-data">No workout data available</p>
        ) : (
          <div className="charts-grid">
            {renderTrendChart(
              workoutTrends,
              'total_workout_count',
              '#9966FF',
              'Workout Frequency'
            )}
            {renderTrendChart(
              workoutTrends,
              'total_calories_burned',
              '#FF9F40',
              'Calories Burned'
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TrendsPage
