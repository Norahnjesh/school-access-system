import React, { useState, useEffect } from 'react';
import { 
  UtensilsIcon,
  CalendarIcon,
  DownloadIcon,
  FilterIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  PieChartIcon,
  HeartIcon,
  ShieldAlertIcon
} from 'lucide-react';
import Charts from './Charts';
import { formatNumber, formatCurrency, formatPercentage, formatDate } from '../utils/formatters';
import { LunchReport as ReportType, Meal, LunchAttendance, DietaryTag } from '../types/lunch.types';

// Lunch report data interfaces
interface LunchReportData {
  summary: {
    total_meals_served: number;
    unique_students: number;
    total_revenue: number;
    average_meal_cost: number;
    dietary_compliance_rate: number;
    waste_percentage: number;
    satisfaction_score: number;
    change_percentage: number;
  };
  meal_consumption: MealConsumption[];
  dietary_distribution: DietaryDistribution[];
  revenue_trends: RevenueTrend[];
  popular_meals: PopularMeal[];
  nutritional_analysis: NutritionalAnalysis;
  waste_tracking: WasteData[];
  alerts: LunchAlert[];
}

interface MealConsumption {
  meal_id: string;
  meal_name: string;
  total_served: number;
  revenue: number;
  rating: number;
  waste_amount: number;
  cost_per_serving: number;
}

interface DietaryDistribution {
  diet_type: DietaryTag;
  student_count: number;
  meal_count: number;
  percentage: number;
  compliance_rate: number;
}

interface RevenueTrend {
  date: string;
  breakfast_revenue: number;
  lunch_revenue: number;
  snack_revenue: number;
  total_revenue: number;
  meal_count: number;
}

interface PopularMeal {
  meal_id: string;
  meal_name: string;
  meal_type: string;
  times_served: number;
  revenue: number;
  rating: number;
  trend: 'up' | 'down' | 'stable';
}

interface NutritionalAnalysis {
  average_calories: number;
  average_protein: number;
  average_carbs: number;
  average_fat: number;
  vitamin_adequacy: number;
  mineral_adequacy: number;
  recommended_intake_met: number;
}

interface WasteData {
  date: string;
  total_waste_kg: number;
  waste_cost: number;
  waste_percentage: number;
  main_reasons: string[];
}

interface LunchAlert {
  id: string;
  type: 'inventory' | 'dietary' | 'waste' | 'quality' | 'financial' | 'health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  meal_id?: string;
  meal_name?: string;
  timestamp: string;
  resolved: boolean;
  action_required?: boolean;
}

interface LunchReportProps {
  onNavigate?: (path: string) => void;
}

interface ReportFilters {
  date_from: string;
  date_to: string;
  meal_types: string[];
  diet_types: string[];
  grades: string[];
  include_weekends: boolean;
  include_nutrition: boolean;
  include_waste: boolean;
}

const LunchReport: React.FC<LunchReportProps> = ({ onNavigate }) => {
  const [reportData, setReportData] = useState<LunchReportData | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  
  const [filters, setFilters] = useState<ReportFilters>({
    date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    meal_types: ['breakfast', 'lunch', 'snack'],
    diet_types: [],
    grades: [],
    include_weekends: true,
    include_nutrition: true,
    include_waste: true
  });

  // Load report data
  const loadReportData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      // Mock API calls - replace with actual endpoints
      setReportData(mockReportData);
      setMeals(mockMeals);

    } catch (err: any) {
      setError('Failed to load lunch report data');
      console.error('Lunch report error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadReportData(false);
  };

  const handleExportReport = () => {
    console.log('Exporting lunch report with filters:', filters);
  };

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    const now = new Date();
    let fromDate = new Date();

    switch (range) {
      case '1d':
        fromDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        fromDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        fromDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        fromDate.setDate(now.getDate() - 90);
        break;
      default:
        fromDate.setDate(now.getDate() - 7);
    }

    setFilters(prev => ({
      ...prev,
      date_from: fromDate.toISOString().split('T')[0],
      date_to: now.toISOString().split('T')[0]
    }));
  };

  const getAlertIcon = (type: string, severity: string) => {
    const iconClass = severity === 'critical' ? 'text-red-600' :
                     severity === 'high' ? 'text-orange-600' :
                     severity === 'medium' ? 'text-amber-600' : 'text-blue-600';

    switch (type) {
      case 'inventory':
        return <AlertTriangleIcon className={`w-4 h-4 ${iconClass}`} />;
      case 'dietary':
        return <HeartIcon className={`w-4 h-4 ${iconClass}`} />;
      case 'waste':
        return <AlertTriangleIcon className={`w-4 h-4 ${iconClass}`} />;
      case 'health':
        return <ShieldAlertIcon className={`w-4 h-4 ${iconClass}`} />;
      case 'financial':
        return <DollarSignIcon className={`w-4 h-4 ${iconClass}`} />;
      default:
        return <AlertTriangleIcon className={`w-4 h-4 ${iconClass}`} />;
    }
  };

  const getDietTypeColor = (dietType: string) => {
    const colors = {
      'normal': 'bg-blue-100 text-blue-800',
      'vegetarian': 'bg-green-100 text-green-800',
      'vegan': 'bg-emerald-100 text-emerald-800',
      'halal': 'bg-purple-100 text-purple-800',
      'gluten_free': 'bg-amber-100 text-amber-800',
      'dairy_free': 'bg-orange-100 text-orange-800',
      'nut_free': 'bg-red-100 text-red-800',
      'special': 'bg-pink-100 text-pink-800'
    };
    return colors[dietType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-xl h-32" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to Load Report</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => loadReportData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <UtensilsIcon className="w-5 h-5 text-white" />
                </div>
                Lunch Report
              </h1>
              <p className="text-slate-600 mt-1">
                Lunch service analytics, nutrition, and consumption metrics
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                <DownloadIcon className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
              >
                <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <UtensilsIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                reportData.summary.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {reportData.summary.change_percentage >= 0 ? 
                  <TrendingUpIcon className="w-4 h-4" /> : 
                  <TrendingDownIcon className="w-4 h-4" />
                }
                {formatPercentage(Math.abs(reportData.summary.change_percentage))}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatNumber(reportData.summary.total_meals_served)}
            </div>
            <div className="text-sm text-slate-600 mb-3">Meals Served</div>
            <div className="text-xs text-slate-500">
              Students: {formatNumber(reportData.summary.unique_students)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSignIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatCurrency(reportData.summary.total_revenue)}
            </div>
            <div className="text-sm text-slate-600 mb-3">Total Revenue</div>
            <div className="text-xs text-slate-500">
              Avg: {formatCurrency(reportData.summary.average_meal_cost)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatPercentage(reportData.summary.dietary_compliance_rate)}
            </div>
            <div className="text-sm text-slate-600 mb-3">Dietary Compliance</div>
            <div className="text-xs text-slate-500">
              Satisfaction: {reportData.summary.satisfaction_score.toFixed(1)}/5.0
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatPercentage(reportData.summary.waste_percentage)}
            </div>
            <div className="text-sm text-slate-600 mb-3">Food Waste</div>
            <div className="text-xs text-slate-500">
              Needs improvement
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Charts
            type="area"
            title="Daily Revenue Trends"
            data={{
              labels: reportData.revenue_trends.map(trend => 
                formatDate(trend.date, 'short')
              ),
              datasets: [
                {
                  label: 'Breakfast',
                  data: reportData.revenue_trends.map(trend => trend.breakfast_revenue),
                  borderColor: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)'
                },
                {
                  label: 'Lunch',
                  data: reportData.revenue_trends.map(trend => trend.lunch_revenue),
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)'
                },
                {
                  label: 'Snack',
                  data: reportData.revenue_trends.map(trend => trend.snack_revenue),
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)'
                }
              ]
            }}
            height={300}
          />

          <Charts
            type="pie"
            title="Dietary Distribution"
            data={{
              labels: reportData.dietary_distribution.map(diet => diet.diet_type),
              datasets: [{
                data: reportData.dietary_distribution.map(diet => diet.student_count),
                backgroundColor: [
                  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
                  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'
                ]
              }]
            }}
            height={300}
          />
        </div>

        {/* Alerts */}
        {reportData.alerts.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Lunch Service Alerts</h3>
            <div className="space-y-3">
              {reportData.alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                  alert.severity === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  {getAlertIcon(alert.type, alert.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{alert.message}</span>
                      {alert.meal_name && (
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                          {alert.meal_name}
                        </span>
                      )}
                      {alert.resolved && (
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatDate(alert.timestamp, 'relative')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data
const mockReportData: LunchReportData = {
  summary: {
    total_meals_served: 6789,
    unique_students: 1102,
    total_revenue: 339450,
    average_meal_cost: 50,
    dietary_compliance_rate: 98.7,
    waste_percentage: 8.3,
    satisfaction_score: 4.2,
    change_percentage: 5.8
  },
  meal_consumption: [
    { meal_id: '1', meal_name: 'Chicken Rice', total_served: 1456, revenue: 72800, rating: 4.8, waste_amount: 5.2, cost_per_serving: 50 }
  ],
  dietary_distribution: [
    { diet_type: 'normal', student_count: 856, meal_count: 4280, percentage: 77.7, compliance_rate: 99.1 }
  ],
  revenue_trends: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
    breakfast_revenue: Math.floor(Math.random() * 15000) + 25000,
    lunch_revenue: Math.floor(Math.random() * 25000) + 35000,
    snack_revenue: Math.floor(Math.random() * 8000) + 12000,
    total_revenue: 0,
    meal_count: Math.floor(Math.random() * 200) + 800
  })),
  popular_meals: [
    { meal_id: '1', meal_name: 'Chicken Rice', meal_type: 'lunch', times_served: 1456, revenue: 72800, rating: 4.8, trend: 'up' }
  ],
  nutritional_analysis: {
    average_calories: 425,
    average_protein: 18.5,
    average_carbs: 52.3,
    average_fat: 14.2,
    vitamin_adequacy: 87.5,
    mineral_adequacy: 82.3,
    recommended_intake_met: 89.1
  },
  waste_tracking: [],
  alerts: [
    {
      id: '1',
      type: 'inventory',
      severity: 'high',
      message: 'Rice stock running low - reorder required',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: false,
      action_required: true
    }
  ]
};

const mockMeals: Meal[] = [
  {
    id: '1',
    name: 'Chicken Rice',
    type: 'lunch',
    description: 'Grilled chicken with jasmine rice',
    ingredients: ['chicken', 'rice', 'vegetables'],
    allergens: [],
    dietary_tags: ['normal'],
    cost: 50,
    available: true,
    created_at: '',
    updated_at: ''
  }
];

export default LunchReport;
