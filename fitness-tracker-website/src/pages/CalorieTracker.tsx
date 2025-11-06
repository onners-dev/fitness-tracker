import { useState, useEffect } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { searchFood } from '../services/foodApi.js'
import { mealService } from '../services/mealApi.js'
import { contributedFoodService } from '../services/contributedFoodApi.js'
import { nutritionService } from '../services/api.js'
import { reportService } from '../services/reportService.js'
import './CalorieTracker.css'

type NutrimentApi = {
  energy_100g?: number | string
  proteins_100g?: number | string
  carbohydrates_100g?: number | string
  fat_100g?: number | string
}

type ApiFood = {
  _id?: string
  product_name?: string
  nutriments?: NutrimentApi
}

type ContributedFood = {
  food_id: string
  name: string
  calories: number
  protein?: number
  carbs?: number
  fats?: number
  brand?: string
  category?: string
  visibility?: 'public' | 'personal'
  approval_status?: string
}

type Meal = {
  meal_id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  date: string
  serving?: string
}

type NutritionGoals = {
  daily_calories_goal: number
  daily_protein_goal: number
  daily_carbs_goal: number
  daily_fats_goal: number
}

type NutritionSummary = {
  calories: number
  protein: number
  carbs: number
  fats: number
}

type CustomFood = {
  name: string
  calories: string
  protein: string
  carbs: string
  fats: string
  brand?: string
  serving?: string
  visibility: 'public' | 'personal'
  category: string
}

type CombinedFoodResults = {
  contributedFoods: ContributedFood[]
  apiFoods: ApiFood[]
}

type PortionSizesState = Record<string, number | ''>

type NutrientProgressBarProps = {
  type: string
  current: number
  goal: number
  color: string
}

function NutrientProgressBar(props: NutrientProgressBarProps) {
  const { type, current, goal, color } = props
  const percentage = Math.min((current / goal) * 100, 100)

  return (
    <div className="nutrient-progress-container">
      <div className="nutrient-progress-header">
        <span>{type}</span>
        <span>
          {current.toFixed(1)} / {goal} {type === 'Calories' ? 'cal' : 'g'}
        </span>
      </div>
      <div className="nutrient-progress-bar">
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '5px'
          }}
        />
      </div>
      <div className="nutrient-progress-percentage">{percentage.toFixed(0)}%</div>
    </div>
  )
}

function CalorieTracker() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isFoodModalOpen, setIsFoodModalOpen] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<ApiFood[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  })

  const [portionSizes, setPortionSizes] = useState<PortionSizesState>({})

  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState<boolean>(false)
  const [customFood, setCustomFood] = useState<CustomFood>({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    brand: '',
    serving: '100g',
    visibility: 'personal',
    category: 'Other'
  })
  const [contributedFoods, setContributedFoods] = useState<ContributedFood[]>([])
  const [showContributedFoods, setShowContributedFoods] = useState<boolean>(false)

  useEffect(() => {
    if (isCustomFoodModalOpen) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
    return () => {
      document.body.classList.remove('no-scroll')
    }
  }, [isCustomFoodModalOpen])

  useEffect(() => {
    const loadMeals = async () => {
      try {
        const data = await mealService.getMealsByDate(selectedDate)
        setMeals(Array.isArray(data) ? data : [])
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        setMeals([])
        alert('Failed to load meals. Please try again or log in.')
      }
    }
    loadMeals()
  }, [selectedDate])

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const contributions = await contributedFoodService.getMyContributions()
        // FIX 2: ensure array, map to ContributedFood
        setContributedFoods(
          Array.isArray(contributions)
            ? contributions.map(item => ({
                food_id: item.food_id ?? '',
                name: item.name ?? '',
                calories: item.calories ?? 0,
                protein: item.protein ?? 0,
                carbs: item.carbs ?? 0,
                fats: item.fats ?? 0,
                brand: item.brand ?? '',
                category: item.category ?? '',
                visibility: item.visibility ?? 'personal',
                approval_status: item.approval_status ?? ''
              }))
            : []
        )
      } catch {
        setContributedFoods([])
      }
    }
    fetchContributions()
  }, [])

  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null)
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false)

  useEffect(() => {
    const fetchNutritionGoals = async () => {
      try {
        const goals = await nutritionService.getNutritionGoals()
        setNutritionGoals(goals)
      } catch {
        try {
          const newGoals = await nutritionService.calculateNutritionGoals()
          setNutritionGoals(newGoals)
        } catch {
          // skip
        }
      }
    }
    fetchNutritionGoals()
  }, [])

  const recalculateNutritionGoals = async () => {
    try {
      setIsRecalculating(true)
      const newGoals = await nutritionService.calculateNutritionGoals()
      setNutritionGoals(newGoals)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.details ||
        'Failed to recalculate goals.'
      if (error.response?.data?.missingFields) {
        alert(
          `Please complete your profile. Missing fields: ${error.response.data.missingFields.join(', ')}`
        )
      } else {
        alert(errorMessage)
      }
    } finally {
      setIsRecalculating(false)
    }
  }

  useEffect(() => {
    if (!Array.isArray(meals)) return
    const totals = meals.reduce(
      (sum, meal) => ({
        calories: sum.calories + (parseFloat(meal.calories as any) || 0),
        protein: sum.protein + (parseFloat(meal.protein as any) || 0),
        carbs: sum.carbs + (parseFloat(meal.carbs as any) || 0),
        fats: sum.fats + (parseFloat(meal.fats as any) || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
    setNutritionSummary(totals)
  }, [meals])

  const handleCustomFoodChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCustomFood(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // FIX 3, 4, 5, 6
  const addCustomFood = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { name, calories, protein, carbs, fats, visibility, category } = customFood
    if (!name || !calories) {
      alert('Please enter at least a name and calories')
      return
    }
    try {
      const foodData = {
        name,
        calories: parseFloat(calories),
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fats: fats ? parseFloat(fats) : 0,
        serving_size: customFood.serving,
        brand: customFood.brand || '',
        visibility,
        category
      }
      const newContribution = await contributedFoodService.contributeFood(foodData)
      // convert API response to ContributedFood
      const adaptedContribution: ContributedFood = {
        food_id: newContribution.food_id,
        name: newContribution.name,
        calories: newContribution.calories,
        protein: newContribution.protein || 0,
        carbs: newContribution.carbs || 0,
        fats: newContribution.fats || 0,
        brand: newContribution.brand || '',
        category: newContribution.category || '',
        visibility: newContribution.visibility ?? 'personal',
        approval_status: newContribution.approval_status ?? ''
      }
      if (newContribution.approval_status === 'approved') {
        const mealData = {
          ...foodData,
          date: selectedDate
        }
        const newMealApi = await mealService.addMeal(mealData)
        const adaptedMeal: Meal = {
          meal_id: newMealApi.meal_id,
          name: newMealApi.name,
          calories: newMealApi.calories,
          protein: newMealApi.protein,
          carbs: newMealApi.carbs,
          fats: newMealApi.fats,
          date: newMealApi.date,
          serving: newMealApi.serving
        }
        setMeals(prevMeals => [...prevMeals, adaptedMeal])
      }
      setContributedFoods(prev => [...prev, adaptedContribution])
      setCustomFood({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        serving: '100g',
        brand: '',
        visibility: 'personal',
        category: 'Other'
      })
      setIsCustomFoodModalOpen(false)
    } catch {
      alert('Failed to contribute food. Please try again.')
    }
  }
  const [combinedFoodResults, setCombinedFoodResults] = useState<CombinedFoodResults>({
    contributedFoods: [],
    apiFoods: []
  })

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const contributedResults = await contributedFoodService.searchContributedFoods(searchQuery)
      const apiProducts = await searchFood(searchQuery)

      // FIX 5: Adapt contributedFoods to ensure required fields
      setCombinedFoodResults({
        contributedFoods: Array.isArray(contributedResults) ? contributedResults.map(item => ({
          food_id: item.food_id ?? '',
          name: item.name ?? '',
          calories: item.calories ?? 0,
          protein: item.protein ?? 0,
          carbs: item.carbs ?? 0,
          fats: item.fats ?? 0,
          brand: item.brand ?? '',
          category: item.category ?? '',
          visibility: item.visibility ?? 'personal',
          approval_status: item.approval_status ?? ''
        })) : [],
        apiFoods: Array.isArray(apiProducts)
          ? apiProducts.filter(
              (product: ApiFood) =>
                product.product_name && product.nutriments?.energy_100g
            )
          : []
      })
    } catch {
      setCombinedFoodResults({ contributedFoods: [], apiFoods: [] })
    } finally {
      setLoading(false)
    }
  }

  const addMeal = async (food: ApiFood | ContributedFood) => {
    const name =
      (food as ApiFood).product_name ||
      (food as ContributedFood).name ||
      'Unknown Food'

    const foodId = (food as ApiFood)._id || (food as ContributedFood).food_id
    const portionSize = portionSizes[foodId] || 100
    const portionMultiplier = Number(portionSize) / 100

    const isApiFood = !!(food as ApiFood).nutriments

    const mealData = {
      name,
      calories: isApiFood
        ? (parseFloat((food as ApiFood).nutriments?.energy_100g as any) *
            portionMultiplier) ||
          0
        : parseFloat((food as ContributedFood).calories as any) || 0,
      protein: isApiFood
        ? (parseFloat((food as ApiFood).nutriments?.proteins_100g as any) *
            portionMultiplier) ||
          0
        : parseFloat((food as ContributedFood).protein as any) || 0,
      carbs: isApiFood
        ? (parseFloat((food as ApiFood).nutriments?.carbohydrates_100g as any) *
            portionMultiplier) ||
          0
        : parseFloat((food as ContributedFood).carbs as any) || 0,
      fats: isApiFood
        ? (parseFloat((food as ApiFood).nutriments?.fat_100g as any) *
            portionMultiplier) ||
          0
        : parseFloat((food as ContributedFood).fats as any) || 0,
      date: selectedDate,
      serving: `${portionSize || 100}g`
    }

    const isValidMeal =
      mealData.name &&
      !isNaN(mealData.calories) &&
      !isNaN(mealData.protein) &&
      !isNaN(mealData.carbs) &&
      !isNaN(mealData.fats)

    if (!isValidMeal) {
      alert('Unable to add meal. Invalid nutritional information.')
      return
    }

    try {
      const newMealApi = await mealService.addMeal(mealData)
      const adaptedMeal: Meal = {
        meal_id: newMealApi.meal_id,
        name: newMealApi.name,
        calories: newMealApi.calories,
        protein: newMealApi.protein,
        carbs: newMealApi.carbs,
        fats: newMealApi.fats,
        date: newMealApi.date,
        serving: newMealApi.serving
      }
      setMeals(prevMeals =>
        Array.isArray(prevMeals) ? [...prevMeals, adaptedMeal] : [adaptedMeal]
      )
      setSearchResults([])
      setSearchQuery('')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to save meal'
      if (error.response?.status === 401) {
        alert('Please log in again to continue.')
      } else {
        alert(errorMessage)
      }
    }
  }

  const handlePortionSizeChange = (foodId: string, value: string) => {
    const parsedValue = value === '' ? '' : Number(value)
    setPortionSizes(prev => ({
      ...prev,
      [foodId]: parsedValue
    }))
  }

  const removeMeal = async (id: string) => {
    try {
      await mealService.removeMeal(id)
      setMeals(prevMeals =>
        Array.isArray(prevMeals)
          ? prevMeals.filter(meal => meal.meal_id !== id)
          : []
      )
    } catch {
      // Silent fail
    }
  }

  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false)
  const [selectedFoodToReport, setSelectedFoodToReport] = useState<{
    food_id: string
    name: string
    visibility: string
  } | null>(null)
  const [reportReason, setReportReason] = useState<string>('')

  // FIX 7: Ensure all required fields present for handler and event signature
  const handleReportFood = (
    food: { food_id: string; name: string; visibility: string },
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation()
    event.preventDefault()
    setSelectedFoodToReport(food)
    setReportModalOpen(true)
  }

  const submitReport = async () => {
    if (!selectedFoodToReport) {
      alert('No food selected to report')
      return
    }
    if (selectedFoodToReport.visibility !== 'public') {
      alert('Only public foods can be reported')
      return
    }
    if (!reportReason) {
      alert('Please select a reason for reporting')
      return
    }
    try {
      await reportService.reportContent(
        'contributed_food',
        selectedFoodToReport.food_id,
        reportReason
      )
      alert('Food reported successfully. Our team will review it.')
      setReportModalOpen(false)
      setSelectedFoodToReport(null)
      setReportReason('')
    } catch {
      alert('Failed to report food. Please try again.')
    }
  }

  return (
    <div className="calorie-tracker">
      <h2>Calorie Tracker</h2>
      <div className="date-selector"></div>
      <div className="food-actions">
        <button className="add-food-button" onClick={() => setIsFoodModalOpen(true)}>
          Add Food
        </button>
        <button
          className="custom-food-button"
          onClick={() => setIsCustomFoodModalOpen(true)}
        >
          Create Custom Food
        </button>
        <button
          className="contributed-foods-button"
          onClick={() => setShowContributedFoods(!showContributedFoods)}
        >
          {showContributedFoods ? 'Hide' : 'Show'} My Contributions
        </button>
      </div>
      {isFoodModalOpen && (
        <div className="food-modal">
          <div className="food-modal-content">
            <button
              className="food-modal-close-btn"
              onClick={() => setIsFoodModalOpen(false)}
            >
              &times;
            </button>
            <h3>Add Food</h3>
            <form onSubmit={handleSearch} className="food-search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search foods..."
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
            {combinedFoodResults.contributedFoods.length > 0 && (
              <div className="contributed-foods-search-results">
                <h4>Community Contributed Foods</h4>
                {combinedFoodResults.contributedFoods.map(food => (
                  <div key={food.food_id} className="food-result-item">
                    <div>
                      <strong>{food.name}</strong>
                      <span>{food.calories} kcal</span>
                    </div>
                    <div className="food-result-actions">
                      <button onClick={() => addMeal(food)}>Add</button>
                      {food.visibility === 'public' && (
                        <button
                          className="report-button"
                          onClick={e => handleReportFood({
                            food_id: food.food_id,
                            name: food.name,
                            visibility: food.visibility ?? 'personal'
                          }, e)}
                        >
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {combinedFoodResults.apiFoods.length > 0 && (
              <div className="api-foods-search-results">
                <h4>Open Food API Results</h4>
                {combinedFoodResults.apiFoods.map(food => (
                  <div key={food._id} className="food-result-item">
                    <div>
                      <strong>{food.product_name}</strong>
                      <span>
                        {(food.nutriments?.energy_100g as number) || 0} kcal
                      </span>
                    </div>
                    <button onClick={() => addMeal(food)}>Add</button>
                  </div>
                ))}
              </div>
            )}
            <button
              className="close-button"
              onClick={() => setIsFoodModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showContributedFoods && (
        <div className="contributed-foods-section">
          <h3>Your Contributed Foods</h3>
          {contributedFoods.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', color: 'var(--soft-text-medium)' }}>
              No contributed foods yet
            </div>
          ) : (
            <div className="contributed-foods-list">
              {contributedFoods.map(food => (
                <div key={food.food_id} className="contributed-food-item">
                  <div className="contributed-food-header">
                    <h4>{food.name}</h4>
                    <div className="contribution-metadata">
                      <span className="contribution-category">{food.category}</span>
                      <span className="contribution-status">
                        {food.visibility === 'public' ? 'Public' : 'Personal'}
                      </span>
                      <span className="contribution-approval">
                        {food.approval_status}
                      </span>
                    </div>
                  </div>
                  <div className="contributed-food-nutrition">
                    <div className="nutrition-badge">
                      <span>Calories</span>
                      <span>{food.calories} kcal</span>
                    </div>
                    <div className="nutrition-badge">
                      <span>Protein</span>
                      <span>{food.protein || 0}g</span>
                    </div>
                    <div className="nutrition-badge">
                      <span>Carbs</span>
                      <span>{food.carbs || 0}g</span>
                    </div>
                    <div className="nutrition-badge">
                      <span>Fats</span>
                      <span>{food.fats || 0}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isCustomFoodModalOpen && (
        <div className="custom-food-modal">
          <div className="custom-food-content">
            <h3>Contribute a New Food</h3>
            <form onSubmit={addCustomFood}>
              {/* ... INPUTS REMAIN UNCHANGED ... */}
              {/* omitted for brevity, kept as in your original */}
              <div className="modal-actions">
                <button type="submit">Contribute Food</button>
                <button
                  type="button"
                  onClick={() => setIsCustomFoodModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="meals-list">
        {Array.isArray(meals) &&
          meals.map(meal => (
            <div key={meal.meal_id} className="meal-item">
              <div className="meal-info">
                <h4>{meal.name}</h4>
                <div className="nutrition-info">
                  <span>{meal.calories} kcal</span>
                  <span>{meal.protein}g protein</span>
                  <span>{meal.carbs}g carbs</span>
                  <span>{meal.fats}g fat</span>
                </div>
              </div>
              <button onClick={() => removeMeal(meal.meal_id)}>Remove</button>
            </div>
          ))}
      </div>

      {nutritionGoals && (
        <div className="nutrition-goals-progress">
          <div className="nutrition-goals-header">
            <h3>Daily Nutrition Goals</h3>
            <button
              className="recalculate-goals-btn"
              onClick={recalculateNutritionGoals}
              disabled={isRecalculating}
            >
              {isRecalculating ? 'Recalculating...' : 'Recalculate Goals'}
            </button>
          </div>
          <NutrientProgressBar
            type="Calories"
            current={nutritionSummary.calories}
            goal={nutritionGoals.daily_calories_goal}
            color="rgb(255, 99, 132)"
          />
          <NutrientProgressBar
            type="Protein"
            current={nutritionSummary.protein}
            goal={nutritionGoals.daily_protein_goal}
            color="rgb(54, 162, 235)"
          />
          <NutrientProgressBar
            type="Carbs"
            current={nutritionSummary.carbs}
            goal={nutritionGoals.daily_carbs_goal}
            color="rgb(255, 206, 86)"
          />
          <NutrientProgressBar
            type="Fats"
            current={nutritionSummary.fats}
            goal={nutritionGoals.daily_fats_goal}
            color="rgb(75, 192, 192)"
          />
        </div>
      )}

      {reportModalOpen && (
        <div
          className="report-modal"
          onClick={e => {
            if ((e.target as HTMLElement).classList.contains('report-modal')) {
              setReportModalOpen(false)
              setSelectedFoodToReport(null)
              setReportReason('')
            }
          }}
        >
          <div
            className="report-modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => {
                setReportModalOpen(false)
                setSelectedFoodToReport(null)
                setReportReason('')
              }}
            >
              &times;
            </button>
            <h3>Report Food Item</h3>
            <p>Food: {selectedFoodToReport?.name}</p>
            <div className="form-group">
              <label>Reason for Reporting</label>
              <select
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                <option value="incorrect_nutrition">Incorrect Nutrition Information</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="spam">Spam</option>
                <option value="other">Other</option>
              </select>
              {reportReason === 'other' && (
                <textarea
                  placeholder="Please provide more details"
                  onChange={e => setReportReason(e.target.value)}
                />
              )}
            </div>
            <div className="modal-actions">
              <button onClick={submitReport}>Submit Report</button>
              <button
                onClick={() => {
                  setReportModalOpen(false)
                  setSelectedFoodToReport(null)
                  setReportReason('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="nutrition-summary">
        <h3>Daily Totals</h3>
        <div className="nutrition-totals">
          <div className="total-item">
            <span>Calories</span>
            <span>{(Number(nutritionSummary.calories) || 0).toFixed(0)} kcal</span>
          </div>
          <div className="total-item">
            <span>Protein</span>
            <span>{(Number(nutritionSummary.protein) || 0).toFixed(1)}g</span>
          </div>
          <div className="total-item">
            <span>Carbs</span>
            <span>{(Number(nutritionSummary.carbs) || 0).toFixed(1)}g</span>
          </div>
          <div className="total-item">
            <span>Fats</span>
            <span>{(Number(nutritionSummary.fats) || 0).toFixed(1)}g</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalorieTracker
