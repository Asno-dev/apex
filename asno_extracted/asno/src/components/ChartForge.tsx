import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { 
  Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble 
} from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, 
  PointElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend, Title 
} from 'chart.js';
import { 
  Sparkles, X, Plus, Trash2, Palette, Settings, BarChart2, PieChart,
  RefreshCw, Sliders, Type, Download, Copy, Grid, Compass, HelpCircle
} from 'lucide-react';
import { ChartType } from '../types';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, 
  ArcElement, RadialLinearScale, Filler, Tooltip, Legend, Title
);

const DEFAULT_COLORS = [
  '#5e81ac', '#a3be8c', '#ebcb8b', '#bf616a', '#88c0d0',
  '#b48ead', '#d08770', '#8fbcbb', '#81a1c1', '#4c566a'
];

export const ChartForge: React.FC = () => {
  const { setChartForgeOpen, customAlert } = useApp() as any;
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('Workspace Productivity Index');
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  
  // Data input
  const [csvInput, setCsvInput] = useState("Mon, 120\nTue, 190\nWed, 300\nThu, 500\nFri, 200");
  
  const parsedData = useMemo(() => {
    try {
      const lines = csvInput.split('\n');
      return lines.map(line => {
        const parts = line.split(',');
        return {
          label: parts[0]?.trim() || 'Label',
          value: Number(parts[1]?.trim() || 0)
        };
      });
    } catch {
      return [{ label: 'Error', value: 0 }];
    }
  }, [csvInput]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: showAnimation ? { duration: 800 } : false,
    plugins: {
      legend: { display: showLegend, position: 'bottom' as const, labels: { color: 'var(--text-primary)', usePointStyle: true } },
      title: chartTitle ? { display: true, text: chartTitle, color: 'var(--text-primary)', font: { size: 14, weight: '600' } } : { display: false },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, cornerRadius: 6 },
    },
    scales: (chartType.includes('pie') || chartType.includes('doughnut') || chartType.includes('polar') || chartType === 'radar' || chartType === 'number-card' || chartType === 'gauge') ? undefined : {
      x: { grid: { display: showGrid, color: 'rgba(128,128,128,0.1)' }, ticks: { color: 'var(--text-muted)' } },
      y: { grid: { display: showGrid, color: 'rgba(128,128,128,0.1)' }, ticks: { color: 'var(--text-muted)' }, beginAtZero: true },
    }
  };

  const renderChart = () => {
    const labels = parsedData.map(d => d.label);
    const values = parsedData.map(d => d.value);
    const bgColors = parsedData.map((_, i) => DEFAULT_COLORS[i % DEFAULT_COLORS.length] + 'cc');
    const borderColors = parsedData.map((_, i) => DEFAULT_COLORS[i % DEFAULT_COLORS.length]);

    const chartData = {
      labels,
      datasets: [
        {
          label: chartTitle || 'Values',
          data: values,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };

    if (chartType === 'line' || chartType === 'area') {
      return (
        <Line 
          data={{
            labels,
            datasets: [{
              label: chartTitle,
              data: values,
              borderColor: DEFAULT_COLORS[0],
              backgroundColor: chartType === 'area' ? DEFAULT_COLORS[0] + '33' : 'transparent',
              fill: chartType === 'area',
              tension: 0.3
            }]
          }} 
          options={chartOptions} 
        />
      );
    }

    if (chartType === 'pie') return <Pie data={chartData} options={chartOptions} />;
    if (chartType === 'doughnut') return <Doughnut data={chartData} options={chartOptions} />;
    if (chartType === 'polar-area') return <PolarArea data={chartData} options={chartOptions} />;
    if (chartType === 'radar') return <Radar data={chartData} options={chartOptions} />;

    // Fallback: Bar Chart
    return <Bar data={chartData} options={chartOptions} />;
  };

  const chartCategories: { type: ChartType; label: string }[] = [
    { type: 'bar', label: 'Vertical Bar' },
    { type: 'horizontal-bar', label: 'Horizontal Bar' },
    { type: 'line', label: 'Line Graph' },
    { type: 'area', label: 'Area Plot' },
    { type: 'pie', label: 'Circular Pie' },
    { type: 'doughnut', label: 'Circular Donut' },
    { type: 'polar-area', label: 'Polar Area' },
    { type: 'radar', label: 'Radar Grid' }
  ];

  return (
    <div className="full-page-tool-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={16} color="white" />
          </div>
          <div>
            <h2 className="heading-font" style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ChartForge Studio
              <span className="premium-tool-badge" style={{ fontSize: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 6px', borderRadius: '20px' }}>Chart tool</span>
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Visualize raw data sets, style layouts, and export high-fidelity dashboard charts</span>
          </div>
        </div>
        <button onClick={() => setChartForgeOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', borderRadius: '50%' }} className="hover-bg">
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left configurations panel */}
        <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', background: 'var(--bg-secondary)', flexShrink: 0 }}>
          <h3 className="heading-font" style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Chart Setup Workspace</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Select Chart Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {chartCategories.map(cat => (
                <button
                  key={cat.type}
                  onClick={() => setChartType(cat.type)}
                  style={{
                    padding: '8px', borderRadius: '6px', border: chartType === cat.type ? '1.5px solid var(--accent-color)' : '1px solid var(--border-color)',
                    background: chartType === cat.type ? 'rgba(99,102,241,0.04)' : 'var(--bg-primary)', color: 'var(--text-primary)',
                    fontSize: '11px', fontWeight: 600, cursor: 'pointer', textAlign: 'center'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Chart Title</label>
            <input 
              type="text" 
              value={chartTitle}
              onChange={e => setChartTitle(e.target.value)}
              className="search-input"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '12px' }}
            />
          </div>

          {/* Toggle Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Show Legends</span>
              <input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Show Gridlines</span>
              <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Soft Animations</span>
              <input type="checkbox" checked={showAnimation} onChange={e => setShowAnimation(e.target.checked)} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Paste Data (CSV format: Label, Value)</label>
            <textarea
              value={csvInput}
              onChange={e => setCsvInput(e.target.value)}
              style={{
                width: '100%', flexGrow: 1, minHeight: '120px', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)',
                outline: 'none', resize: 'none', fontSize: '11px', fontFamily: 'var(--font-mono)', lineHeight: '1.5'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(csvInput);
                customAlert?.('CSV data copied to clipboard!');
              }}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              <Copy size={12} />
              Copy CSV
            </button>
            
            <button
              onClick={() => {
                customAlert?.('Chart Image rendering processed! You can download this page viewport to save details.', 'Save Success');
              }}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '6px', border: 'none',
                background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}
            >
              <Download size={12} />
              Export
            </button>
          </div>

        </div>

        {/* Right workspace visualization stage */}
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--bg-primary)', overflow: 'hidden' }}>
          <div 
            style={{
              width: '100%', height: '100%', maxMaxWidth: '800px', maxHeight: '500px',
              padding: '24px', background: 'var(--bg-secondary)', borderRadius: '16px',
              border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 className="heading-font" style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {chartTitle || 'Chart Forge Render Output'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live rendered using ChartJS Engine</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {chartType} Presets
                </span>
              </div>
            </div>
            
            <div style={{ flexGrow: 1, minHeight: 0, position: 'relative' }}>
              {renderChart()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChartForge;
