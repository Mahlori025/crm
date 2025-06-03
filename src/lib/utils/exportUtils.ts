// src/lib/utils/exportUtils.ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export const exportUtils = {
  // Export data to Excel
  exportToExcel: (data: any[], filename: string, sheetName: string = 'Report') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(row => 
        String(row[key] || '').length
      )) + 2
    }));
    ws['!cols'] = colWidths;
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
  },

  // Export data to CSV
  exportToCSV: (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${filename}.csv`);
  },

  // Export data to PDF
  exportToPDF: (data: any[], filename: string, title: string) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add table data
    let yPosition = 50;
    const lineHeight = 6;
    
    if (data.length > 0) {
      // Headers
      const headers = Object.keys(data[0]);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      
      headers.forEach((header, index) => {
        doc.text(header, 20 + (index * 30), yPosition);
      });
      
      yPosition += lineHeight;
      
      // Data rows
      doc.setFont(undefined, 'normal');
      data.forEach((row, rowIndex) => {
        if (yPosition > 280) { // New page if near bottom
          doc.addPage();
          yPosition = 20;
        }
        
        headers.forEach((header, colIndex) => {
          const value = String(row[header] || '');
          doc.text(value.substring(0, 15), 20 + (colIndex * 30), yPosition);
        });
        
        yPosition += lineHeight;
      });
    }
    
    doc.save(`${filename}.pdf`);
  },

  // Format data for export
  formatDataForExport: (data: any[], type: string) => {
    if (!data || data.length === 0) return [];
    
    switch (type) {
      case 'agents':
        return data.map(agent => ({
          'Agent Name': agent.name,
          'Total Assigned': agent.totalAssigned,
          'Resolved': agent.resolvedTickets,
          'Resolution Rate (%)': agent.resolutionRate,
          'Avg Response (hours)': agent.avgResponseHours?.toFixed(2),
          'Avg Resolution (hours)': agent.avgResolutionHours?.toFixed(2),
          'SLA Breaches': agent.slaBreaches,
          'Avg Satisfaction': agent.avgSatisfaction?.toFixed(2)
        }));
      
      case 'sla':
        return data.map(item => ({
          'Priority': item.priority,
          'Total Tickets': item.totalTickets,
          'SLA Met': item.slaMet,
          'SLA Breached': item.slaBreached,
          'Compliance Rate (%)': item.complianceRate,
          'Avg Response Time (hours)': item.avgResponseTime?.toFixed(2),
          'Avg Resolution Time (hours)': item.avgResolutionTime?.toFixed(2)
        }));
      
      case 'categories':
        return data.map(item => ({
          'Category': item.category,
          'Ticket Count': item.ticketCount,
          'Avg Resolution (hours)': item.avgResolutionHours?.toFixed(2),
          'SLA Breaches': item.slaBreaches,
          'Avg Satisfaction': item.avgSatisfaction?.toFixed(2)
        }));
      
      default:
        return data;
    }
  }
};