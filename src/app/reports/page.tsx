// src/app/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import TicketVolumeChart from '@/components/charts/TicketVolumeChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import AgentPerformanceChart from '@/components/charts/AgentPerformanceChart';
import { exportUtils } from '@/lib/utils/exportUtils';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reports?type=comprehensive&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: 'excel' | 'csv' | 'pdf', dataType: string) => {
    if (!reportData) return;
    
    const data = exportUtils.formatDataForExport(reportData[dataType], dataType);
    const filename = `${dataType}_report_${dateRange.startDate}_to_${dateRange.endDate}`;
    
    switch (type) {
      case 'excel':
        exportUtils.exportToExcel(data, filename);
        break;
      case 'csv':
        exportUtils.exportToCSV(data, filename);
        break;
      case 'pdf':
        exportUtils.exportToPDF(data, filename, `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Report`);
        break;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'volume', label: 'Ticket Volume' },
    { id: 'agents', label: 'Agent Performance' },
    { id: 'sla', label: 'SLA Analysis' },
    { id: 'categories', label: 'Categories' },
    { id: 'satisfaction', label: 'Satisfaction' }
  ];

  if (loading) {
    return (
      <div className="tickets-container">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
        
        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">From:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">To:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1"
            />
          </div>
          
          <button
            onClick={loadReportData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            Refresh Data
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Report Content */}
      {reportData && (
        <div className="space-y-6">
          {/* Executive Summary */}
          {activeTab === 'overview' && reportData.executiveSummary && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.executiveSummary.totalTickets}</p>
                    </div>
                    <div className={`text-sm ${reportData.executiveSummary.ticketVolumeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.executiveSummary.ticketVolumeChange >= 0 ? '+' : ''}{reportData.executiveSummary.ticketVolumeChange}%
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.executiveSummary.resolutionRate}%</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {reportData.executiveSummary.resolvedTickets}/{reportData.executiveSummary.totalTickets}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.executiveSummary.slaComplianceRate}%</p>
                    </div>
                    <div className="text-sm text-red-600">
                      {reportData.executiveSummary.slaBreachedTickets} breaches
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.executiveSummary.avgSatisfaction}/5</p>
                    </div>
                    <div className={`text-sm ${reportData.executiveSummary.satisfactionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.executiveSummary.satisfactionChange >= 0 ? '+' : ''}{reportData.executiveSummary.satisfactionChange}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Ticket Volume Trend</h3>
                  <TicketVolumeChart data={reportData.volumeData} height={250} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Category Distribution</h3>
                  <CategoryPieChart data={reportData.categoryDistribution} height={250} />
                </div>
              </div>
            </div>
          )}

          {/* Ticket Volume Analysis */}
          {activeTab === 'volume' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Ticket Volume Over Time</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('excel', 'volumeData')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={() => handleExport('csv', 'volumeData')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              <TicketVolumeChart data={reportData.volumeData} height={400} />
            </div>
          )}

          {/* Agent Performance */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Agent Performance</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport('excel', 'agentPerformance')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Export Excel
                    </button>
                    <button
                      onClick={() => handleExport('pdf', 'agentPerformance')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
                <AgentPerformanceChart data={reportData.agentPerformance} height={400} />
              </div>

              {/* Agent Performance Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-medium">Detailed Agent Metrics</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Resolution</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA Breaches</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.agentPerformance.map((agent: any) => (
                        <tr key={agent.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.totalAssigned}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.resolvedTickets}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.resolutionRate}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.avgResponseHours.toFixed(1)}h</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.avgResolutionHours.toFixed(1)}h</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{agent.slaBreaches}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.avgSatisfaction.toFixed(1)}/5</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Similar sections for SLA, Categories, and Satisfaction tabs... */}
        </div>
      )}
    </div>
  );
}