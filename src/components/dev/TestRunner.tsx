// src/components/dev/TestRunner.tsx
'use client';

import { useState } from 'react';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  executionTime: number;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  totalTime: number;
}

export default function TestRunner() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [running, setRunning] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const runTests = async () => {
    setRunning(true);
    setResults([]);
    setSummary(null);

    try {
      const response = await fetch('/api/admin/test-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setSummary(data.summary);
      } else {
        console.error('Test execution failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Workflow Tests</h3>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">DEV ONLY</span>
      </div>

      <button
        onClick={runTests}
        disabled={running}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {running ? 'Running Tests...' : 'Run Assignment Tests'}
      </button>

      {summary && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">Summary</h4>
          <div className="text-sm space-y-1">
            <div>Total: {summary.total}</div>
            <div className="text-green-600">Passed: {summary.passed}</div>
            <div className="text-red-600">Failed: {summary.failed}</div>
            <div>Total Time: {summary.totalTime}ms</div>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {results.map((result, index) => (
          <div 
            key={index}
            className={`p-2 rounded text-sm ${
              result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{result.testName}</span>
              <span className={`text-xs ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                {result.passed ? '✓' : '✗'} {result.executionTime}ms
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1">{result.details}</div>
          </div>
        ))}
      </div>
    </div>
  );
}