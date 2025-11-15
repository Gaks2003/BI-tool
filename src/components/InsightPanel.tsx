import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Brain, TrendingUp, AlertCircle } from 'lucide-react';

interface InsightPanelProps {
  chartData: any[];
  chartType: string;
  xField: string;
  yField: string;
}

interface Insight {
  type: 'trend' | 'outlier' | 'recommendation';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success';
}

export const InsightPanel: React.FC<InsightPanelProps> = ({
  chartData,
  chartType,
  xField,
  yField
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    generateInsights();
  }, [chartData, chartType, xField, yField]);

  const generateInsights = () => {
    if (!chartData.length) return;

    const newInsights: Insight[] = [];
    const numericValues = chartData
      .map(d => d[yField])
      .filter(v => typeof v === 'number');

    if (numericValues.length === 0) return;

    // Trend Analysis
    if (chartType === 'line' || chartType === 'area') {
      const trend = numericValues[numericValues.length - 1] > numericValues[0] ? 'increasing' : 'decreasing';
      const change = ((numericValues[numericValues.length - 1] - numericValues[0]) / numericValues[0] * 100).toFixed(1);
      
      newInsights.push({
        type: 'trend',
        title: `${trend.charAt(0).toUpperCase() + trend.slice(1)} Trend Detected`,
        description: `${yField} shows a ${trend} pattern with ${Math.abs(Number(change))}% change overall.`,
        severity: Number(change) > 0 ? 'success' : 'warning'
      });
    }

    // Statistical Analysis
    const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);
    
    // Outlier Detection
    const threshold = avg * 1.5;
    const outliers = chartData.filter(d => d[yField] > threshold || d[yField] < avg * 0.5);
    
    if (outliers.length > 0) {
      newInsights.push({
        type: 'outlier',
        title: `${outliers.length} Outlier${outliers.length > 1 ? 's' : ''} Found`,
        description: `Values significantly above/below average (${avg.toFixed(2)}). Review: ${outliers.map(o => o[xField]).join(', ')}.`,
        severity: 'warning'
      });
    }

    // Performance Recommendations
    if (chartType === 'bar' || chartType === 'pie') {
      const sorted = [...chartData].sort((a, b) => b[yField] - a[yField]);
      const topPerformer = sorted[0];
      const bottomPerformer = sorted[sorted.length - 1];
      
      if (topPerformer && bottomPerformer) {
        const gap = ((topPerformer[yField] - bottomPerformer[yField]) / bottomPerformer[yField] * 100).toFixed(1);
        
        newInsights.push({
          type: 'recommendation',
          title: 'Performance Gap Analysis',
          description: `${gap}% gap between top (${topPerformer[xField]}) and bottom (${bottomPerformer[xField]}) performers. Consider best practice sharing.`,
          severity: 'info'
        });
      }
    }

    // Data Quality Insights
    const nullCount = chartData.filter(d => d[yField] == null || d[yField] === '').length;
    if (nullCount > 0) {
      newInsights.push({
        type: 'recommendation',
        title: 'Data Quality Alert',
        description: `${nullCount} records have missing ${yField} values. Consider data validation improvements.`,
        severity: 'warning'
      });
    }

    setInsights(newInsights);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'outlier': return <AlertCircle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
      >
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-gray-900 dark:text-white">
            AI Insights ({insights.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
          {insights.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              No insights available for current data
            </p>
          ) : (
            insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex items-start space-x-2">
                  {getIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs opacity-90">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Use the AI Assistant for deeper analysis and strategic recommendations
            </p>
          </div>
        </div>
      )}
    </div>
  );
};