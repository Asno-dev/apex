import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../AppContext';
import { Block, ChartType } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble } from 'react-chartjs-2';
import {
  BarChart2,
  Plus,
  Trash2,
  Palette,
  Settings,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Grid,
  Type,
  TrendingUp,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title
);

const DEFAULT_COLORS = [
  '#5e81ac', '#a3be8c', '#ebcb8b', '#bf616a', '#88c0d0',
  '#b48ead', '#d08770', '#8fbcbb', '#81a1c1', '#4c566a',
  '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff',
  '#ff9f40', '#c9cbcf', '#e7e9ed', '#7cb5ec', '#f15c80',
  '#e4d354', '#2b908f', '#f45b5b', '#91e8e1', '#7798bf',
  '#aaeeee', '#ff0066', '#eeaaee', '#55bf3b', '#df5353',
  '#7798bf', '#aaeeee', '#1aadce', '#492970', '#f28f43',
  '#77a1e5', '#a6c96a', '#2f7ed8', '#0d233a', '#8bbc21',
  '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5',
  '#c42525', '#a6c96a', '#2f7ed8', '#0d233a', '#8bbc21'
];

const CHART_CATEGORIES: { label: string; types: { type: ChartType; name: string }[] }[] = [
  {
    label: 'Bar Charts',
    types: [
      { type: 'bar', name: 'Vertical Bar' },
      { type: 'horizontal-bar', name: 'Horizontal Bar' },
      { type: 'stacked-bar', name: 'Stacked Bar' },
      { type: 'grouped-bar', name: 'Grouped Bar' },
      { type: 'floating-bar', name: 'Floating Bar' },
      { type: 'comparison-bar', name: 'Comparison' },
      { type: 'diverging-bar', name: 'Diverging' },
      { type: 'lollipop', name: 'Lollipop' },
    ]
  },
  {
    label: 'Line Charts',
    types: [
      { type: 'line', name: 'Line' },
      { type: 'area', name: 'Area' },
      { type: 'stepped-line', name: 'Stepped' },
      { type: 'multi-line', name: 'Multi-Line' },
      { type: 'sparkline', name: 'Sparkline' },
      { type: 'stacked-area', name: 'Stacked Area' },
      { type: 'slope', name: 'Slope' },
      { type: 'bump', name: 'Bump' },
      { type: 'stream', name: 'Stream' },
    ]
  },
  {
    label: 'Circular Charts',
    types: [
      { type: 'pie', name: 'Pie' },
      { type: 'doughnut', name: 'Doughnut' },
      { type: 'donut-half', name: 'Half Donut' },
      { type: 'polar-area', name: 'Polar Area' },
      { type: 'nightingale', name: 'Nightingale' },
      { type: 'sunburst', name: 'Sunburst' },
    ]
  },
  {
    label: 'Statistical',
    types: [
      { type: 'radar', name: 'Radar' },
      { type: 'scatter', name: 'Scatter' },
      { type: 'bubble', name: 'Bubble' },
      { type: 'histogram', name: 'Histogram' },
      { type: 'box-plot', name: 'Box Plot' },
      { type: 'dot-plot', name: 'Dot Plot' },
      { type: 'heatmap-grid', name: 'Heatmap' },
    ]
  },
  {
    label: 'KPI & Progress',
    types: [
      { type: 'number-card', name: 'Number Card' },
      { type: 'gauge', name: 'Gauge' },
      { type: 'progress-bar', name: 'Progress Bar' },
      { type: 'progress-ring', name: 'Progress Ring' },
      { type: 'bullet', name: 'Bullet' },
      { type: 'waffle', name: 'Waffle' },
      { type: 'icon-grid', name: 'Icon Grid' },
      { type: 'pictograph', name: 'Pictograph' },
    ]
  },
  {
    label: 'Mixed & Advanced',
    types: [
      { type: 'mixed-bar-line', name: 'Bar + Line' },
      { type: 'multi-axis', name: 'Multi-Axis' },
      { type: 'funnel', name: 'Funnel' },
      { type: 'pyramid', name: 'Pyramid' },
      { type: 'waterfall', name: 'Waterfall' },
      { type: 'treemap', name: 'Treemap' },
      { type: 'radial-bar', name: 'Radial Bar' },
      { type: 'stacked-100', name: 'Stacked 100%' },
      { type: 'timeline-chart', name: 'Timeline' },
      { type: 'calendar-heat', name: 'Calendar Heat' },
      { type: 'parallel', name: 'Parallel' },
    ]
  },
];

interface ChartBlockAdvancedProps {
  block: Block;
  pageId: string;
}

export const ChartBlockAdvanced: React.FC<ChartBlockAdvancedProps> = ({ block, pageId }) => {
  const { updateBlock } = useApp();
  const chartType: ChartType = (block.properties?.chartType as ChartType) || (() => {
    if (block.type === 'chart-bar') return 'bar';
    if (block.type === 'chart-line') return 'line';
    if (block.type === 'chart-pie') return 'pie';
    if (block.type === 'chart-gauge') return 'gauge';
    if (block.type === 'chart-radar') return 'radar';
    return 'bar';
  })();
  const data = block.properties?.chartData || [
    { label: 'Mon', value: 120, color: '#5e81ac' },
    { label: 'Tue', value: 190, color: '#a3be8c' },
    { label: 'Wed', value: 300, color: '#ebcb8b' },
    { label: 'Thu', value: 500, color: '#bf616a' },
    { label: 'Fri', value: 200, color: '#88c0d0' },
  ];
  const secondaryData = block.properties?.chartSecondaryData || [];
  const chartTitle = block.properties?.chartTitle || '';
  const showLegend = block.properties?.chartShowLegend !== false;
  const showGrid = block.properties?.chartShowGrid !== false;
  const showAnimation = block.properties?.chartShowAnimation !== false;

  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[data.length % DEFAULT_COLORS.length]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editColor, setEditColor] = useState('');

  const colors = data.map((d, i) => d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newValue) return;
    const updated = [...data, { label: newLabel, value: Number(newValue), color: newColor }];
    updateBlock(pageId, block.id, { properties: { chartData: updated } });
    setNewLabel('');
    setNewValue('');
    setNewColor(DEFAULT_COLORS[updated.length % DEFAULT_COLORS.length]);
  };

  const handleRemove = (idx: number) => {
    const updated = data.filter((_, i) => i !== idx);
    updateBlock(pageId, block.id, { properties: { chartData: updated } });
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditLabel(data[idx].label);
    setEditValue(String(data[idx].value));
    setEditColor(data[idx].color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]);
  };

  const handleSaveEdit = () => {
    if (editingIdx === null) return;
    const updated = [...data];
    updated[editingIdx] = { label: editLabel, value: Number(editValue), color: editColor };
    updateBlock(pageId, block.id, { properties: { chartData: updated } });
    setEditingIdx(null);
  };

  const setChartType = (t: ChartType) => {
    updateBlock(pageId, block.id, { properties: { chartType: t } });
    setTypeSelectorOpen(false);
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: showAnimation ? { duration: 800 } : false,
    plugins: {
      legend: { display: showLegend, position: 'bottom' as const, labels: { color: 'var(--text-primary)', usePointStyle: true, padding: 12 } },
      title: chartTitle ? { display: true, text: chartTitle, color: 'var(--text-primary)', font: { size: 14, weight: '600' } } : { display: false },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, cornerRadius: 6 },
    },
    scales: (chartType.includes('pie') || chartType.includes('doughnut') || chartType.includes('polar') || chartType === 'radar' || chartType === 'nightingale' || chartType === 'sunburst' || chartType.includes('donut') || chartType === 'number-card' || chartType === 'gauge' || chartType.includes('progress') || chartType === 'waffle' || chartType === 'icon-grid' || chartType === 'pictograph') ? undefined : {
      x: { grid: { display: showGrid, color: 'rgba(128,128,128,0.1)' }, ticks: { color: 'var(--text-muted)' } },
      y: { grid: { display: showGrid, color: 'rgba(128,128,128,0.1)' }, ticks: { color: 'var(--text-muted)' }, beginAtZero: true },
    }
  };

  // ==================== RENDER CHART ====================
  const renderChart = () => {
    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);
    const bgColors = colors;
    const borderColors = colors.map(c => c);

    // --- BAR TYPES ---
    if (chartType === 'bar' || chartType === 'grouped-bar' || chartType === 'comparison-bar') {
      const datasets: any[] = [
        { label: chartTitle || 'Dataset 1', data: values, backgroundColor: bgColors.map(c => c + 'cc'), borderColor: borderColors, borderWidth: 1, borderRadius: 4 }
      ];
      if ((chartType === 'grouped-bar' || chartType === 'comparison-bar') && secondaryData.length > 0) {
        datasets.push({ label: 'Dataset 2', data: secondaryData.map(d => d.value), backgroundColor: secondaryData.map((d, i) => (d.color || DEFAULT_COLORS[(i + 5) % DEFAULT_COLORS.length]) + 'cc'), borderWidth: 1, borderRadius: 4 });
      }
      return <Bar data={{ labels, datasets }} options={chartOptions} />;
    }

    if (chartType === 'horizontal-bar') {
      const opts = { ...chartOptions, indexAxis: 'y' as const };
      return <Bar data={{ labels, datasets: [{ label: chartTitle || 'Values', data: values, backgroundColor: bgColors.map(c => c + 'cc'), borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }} options={opts} />;
    }

    if (chartType === 'stacked-bar' || chartType === 'stacked-100') {
      const opts = { ...chartOptions, scales: { ...chartOptions.scales, x: { ...chartOptions.scales?.x, stacked: true }, y: { ...chartOptions.scales?.y, stacked: true } } };
      const datasets: any[] = [
        { label: 'Series A', data: values, backgroundColor: bgColors.map(c => c + 'cc'), borderWidth: 0, borderRadius: 2 }
      ];
      if (secondaryData.length > 0) {
        datasets.push({ label: 'Series B', data: secondaryData.map(d => d.value), backgroundColor: secondaryData.map((d, i) => (d.color || DEFAULT_COLORS[(i + 5) % DEFAULT_COLORS.length]) + 'cc'), borderWidth: 0, borderRadius: 2 });
      }
      return <Bar data={{ labels, datasets }} options={opts} />;
    }

    if (chartType === 'floating-bar') {
      const floatingData = values.map(v => [Math.max(0, v - 50), v]);
      return <Bar data={{ labels, datasets: [{ label: chartTitle || 'Range', data: floatingData as any, backgroundColor: bgColors.map(c => c + 'cc'), borderWidth: 1, borderRadius: 4 }] }} options={chartOptions} />;
    }

    if (chartType === 'diverging-bar') {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const diverged = values.map(v => v - avg);
      const divColors = diverged.map(v => v >= 0 ? '#a3be8c' + 'cc' : '#bf616a' + 'cc');
      return <Bar data={{ labels, datasets: [{ label: chartTitle || 'Divergence', data: diverged, backgroundColor: divColors, borderWidth: 0, borderRadius: 3 }] }} options={chartOptions} />;
    }

    if (chartType === 'lollipop') {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Bar data={{ labels, datasets: [{ label: chartTitle || 'Values', data: values, backgroundColor: bgColors, borderColor: bgColors, borderWidth: 2, barThickness: 3, borderRadius: 0 }] }} options={chartOptions} />
          <Scatter data={{ labels, datasets: [{ label: '', data: values.map((v, i) => ({ x: i, y: v })), backgroundColor: bgColors, pointRadius: 8, pointHoverRadius: 10 }] }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
        </div>
      );
    }

    // --- LINE TYPES ---
    if (chartType === 'line' || chartType === 'multi-line' || chartType === 'sparkline' || chartType === 'slope' || chartType === 'bump') {
      const isSparkline = chartType === 'sparkline';
      const opts = isSparkline ? { ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } } : chartOptions;
      const datasets: any[] = [
        { label: chartTitle || 'Dataset 1', data: values, borderColor: colors[0], backgroundColor: colors[0] + '20', pointBackgroundColor: colors[0], pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: isSparkline ? 0 : 4, tension: 0.3, fill: false, borderWidth: isSparkline ? 1.5 : 2 }
      ];
      if ((chartType === 'multi-line' || chartType === 'bump') && secondaryData.length > 0) {
        datasets.push({ label: 'Dataset 2', data: secondaryData.map(d => d.value), borderColor: DEFAULT_COLORS[3], backgroundColor: DEFAULT_COLORS[3] + '20', pointRadius: 4, tension: 0.3, fill: false, borderWidth: 2 });
      }
      return <Line data={{ labels, datasets }} options={opts} />;
    }

    if (chartType === 'area' || chartType === 'stacked-area' || chartType === 'stream') {
      const stacked = chartType === 'stacked-area' || chartType === 'stream';
      const opts = stacked ? { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales?.y, stacked: true } } } : chartOptions;
      const datasets: any[] = [
        { label: chartTitle || 'Area', data: values, borderColor: colors[0], backgroundColor: colors[0] + '40', fill: true, tension: chartType === 'stream' ? 0.5 : 0.3, borderWidth: 2, pointRadius: 3 }
      ];
      if (stacked && secondaryData.length > 0) {
        datasets.push({ label: 'Series B', data: secondaryData.map(d => d.value), borderColor: DEFAULT_COLORS[2], backgroundColor: DEFAULT_COLORS[2] + '40', fill: true, tension: chartType === 'stream' ? 0.5 : 0.3, borderWidth: 2 });
      }
      return <Line data={{ labels, datasets }} options={opts} />;
    }

    if (chartType === 'stepped-line') {
      return <Line data={{ labels, datasets: [{ label: chartTitle || 'Stepped', data: values, borderColor: colors[0], backgroundColor: colors[0] + '20', stepped: true, fill: true, borderWidth: 2, pointRadius: 4 }] }} options={chartOptions} />;
    }

    // --- CIRCULAR TYPES ---
    if (chartType === 'pie') {
      return <Pie data={{ labels, datasets: [{ data: values, backgroundColor: bgColors, borderColor: '#fff', borderWidth: 2 }] }} options={chartOptions} />;
    }

    if (chartType === 'doughnut' || chartType === 'donut-half') {
      const opts = {
        ...(chartType === 'donut-half' ? { ...chartOptions, rotation: -90, circumference: 180 } : chartOptions),
        cutout: '60%'
      } as any;
      return <Doughnut data={{ labels, datasets: [{ data: values, backgroundColor: bgColors, borderColor: '#fff', borderWidth: 2 }] }} options={opts} />;
    }

    if (chartType === 'polar-area' || chartType === 'nightingale') {
      return <PolarArea data={{ labels, datasets: [{ data: values, backgroundColor: bgColors.map(c => c + '80'), borderColor: bgColors, borderWidth: 1 }] }} options={chartOptions} />;
    }

    // --- STATISTICAL ---
    if (chartType === 'radar') {
      return <Radar data={{ labels, datasets: [{ label: chartTitle || 'Values', data: values, backgroundColor: colors[0] + '30', borderColor: colors[0], borderWidth: 2, pointBackgroundColor: colors[0] }] }} options={chartOptions} />;
    }

    if (chartType === 'scatter' || chartType === 'dot-plot') {
      const scatterData = values.map((v, i) => ({ x: i + 1, y: v }));
      return <Scatter data={{ datasets: [{ label: chartTitle || 'Points', data: scatterData, backgroundColor: bgColors, pointRadius: 6, pointHoverRadius: 8 }] }} options={chartOptions} />;
    }

    if (chartType === 'bubble') {
      const bubbleData = values.map((v, i) => ({ x: i + 1, y: v, r: Math.max(5, v / 30) }));
      return <Bubble data={{ datasets: [{ label: chartTitle || 'Bubbles', data: bubbleData, backgroundColor: bgColors.map(c => c + '80'), borderColor: bgColors, borderWidth: 1 }] }} options={chartOptions} />;
    }

    if (chartType === 'histogram') {
      return <Bar data={{ labels, datasets: [{ label: chartTitle || 'Frequency', data: values, backgroundColor: colors[0] + 'cc', borderColor: colors[0], borderWidth: 1, barPercentage: 1, categoryPercentage: 1 }] }} options={chartOptions} />;
    }

    // --- MIXED ---
    if (chartType === 'mixed-bar-line' || chartType === 'multi-axis') {
      const datasets: any[] = [
        { type: 'bar' as const, label: 'Bar Data', data: values, backgroundColor: bgColors.map(c => c + 'cc'), borderColor: borderColors, borderWidth: 1, borderRadius: 4, order: 2 },
        { type: 'line' as const, label: 'Line Trend', data: secondaryData.length > 0 ? secondaryData.map(d => d.value) : values.map(v => v * 0.8), borderColor: DEFAULT_COLORS[3], backgroundColor: DEFAULT_COLORS[3] + '20', borderWidth: 2, pointRadius: 4, tension: 0.3, order: 1, fill: false }
      ];
      return <Bar data={{ labels, datasets }} options={chartOptions} />;
    }

    // --- KPI & PROGRESS (SVG-based custom renders) ---
    if (chartType === 'number-card') {
      const total = values.reduce((a, b) => a + b, 0);
      const avg = (total / values.length).toFixed(1);
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.length, 4)}, 1fr)`, gap: '12px', padding: '8px', width: '100%' }}>
          {data.map((d, i) => (
            <div key={i} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', textAlign: 'center', borderTop: `3px solid ${d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}` }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}>{d.value.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600, textTransform: 'uppercase' }}>{d.label}</div>
            </div>
          ))}
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', textAlign: 'center', borderTop: '3px solid var(--accent-color)' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-color)' }}>{total.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Total</div>
          </div>
        </div>
      );
    }

    if (chartType === 'gauge') {
      const val = data[0]?.value || 0;
      const max = Math.max(...values, 100);
      const pct = Math.min((val / max) * 100, 100);
      const angle = (pct / 100) * 180;
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', width: '100%' }}>
          <svg viewBox="0 0 200 120" width="280" height="160">
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--border-color)" strokeWidth="14" strokeLinecap="round" />
            <path d={`M 20 100 A 80 80 0 ${angle > 180 ? 1 : 0} 1 ${100 + 80 * Math.cos((180 - angle) * Math.PI / 180)} ${100 - 80 * Math.sin((180 - angle) * Math.PI / 180)}`} fill="none" stroke={data[0]?.color || '#5e81ac'} strokeWidth="14" strokeLinecap="round" />
            <text x="100" y="85" textAnchor="middle" fill="var(--text-primary)" fontSize="24" fontWeight="800">{val}</text>
            <text x="100" y="105" textAnchor="middle" fill="var(--text-muted)" fontSize="10">{data[0]?.label || 'Score'}</text>
          </svg>
        </div>
      );
    }

    if (chartType === 'progress-bar') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px', width: '100%' }}>
          {data.map((d, i) => {
            const maxVal = Math.max(...values);
            const pct = Math.min((d.value / maxVal) * 100, 100);
            const c = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '70px', textAlign: 'right', color: 'var(--text-primary)' }}>{d.label}</span>
                <div style={{ flexGrow: 1, height: '20px', background: 'var(--bg-primary)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${c}, ${c}aa)`, borderRadius: '10px', transition: 'width 0.6s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px' }}>
                    <span style={{ fontSize: '9px', color: '#fff', fontWeight: 700 }}>{d.value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (chartType === 'progress-ring') {
      const val = data[0]?.value || 0;
      const max = data.length > 1 ? data[1].value : 100;
      const pct = Math.min((val / max) * 100, 100);
      const circumference = 2 * Math.PI * 50;
      const offset = circumference - (pct / 100) * circumference;
      const c = data[0]?.color || '#5e81ac';
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <svg width="160" height="160" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke={c} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            <text x="60" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="800">{Math.round(pct)}%</text>
            <text x="60" y="72" textAnchor="middle" fill="var(--text-muted)" fontSize="9">{data[0]?.label || 'Progress'}</text>
          </svg>
        </div>
      );
    }

    if (chartType === 'bullet') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px', width: '100%' }}>
          {data.map((d, i) => {
            const maxVal = Math.max(...values) * 1.2;
            const pct = (d.value / maxVal) * 100;
            const c = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <div key={i}>
                <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{d.label}: {d.value}</div>
                <div style={{ position: 'relative', height: '18px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'var(--bg-tertiary)', opacity: 0.5 }} />
                  <div style={{ position: 'absolute', width: `${Math.min(pct * 1.1, 100)}%`, height: '100%', background: c + '30' }} />
                  <div style={{ position: 'absolute', width: `${pct}%`, height: '60%', top: '20%', background: c, borderRadius: '2px' }} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (chartType === 'funnel' || chartType === 'pyramid') {
      const sorted = chartType === 'funnel' ? [...data].sort((a, b) => b.value - a.value) : [...data].sort((a, b) => a.value - b.value);
      const maxVal = Math.max(...sorted.map(d => d.value));
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '16px', width: '100%' }}>
          {sorted.map((d, i) => {
            const widthPct = (d.value / maxVal) * 100;
            const c = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <div key={i} style={{ width: `${widthPct}%`, minWidth: '60px', padding: '8px 12px', background: c + 'cc', borderRadius: '4px', textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: '12px', transition: 'width 0.4s ease' }}>
                {d.label}: {d.value}
              </div>
            );
          })}
        </div>
      );
    }

    if (chartType === 'waterfall') {
      let cumulative = 0;
      const waterfallData = values.map((v, i) => {
        const start = cumulative;
        cumulative += v;
        return [start, cumulative];
      });
      const waterfallColors = values.map(v => v >= 0 ? '#a3be8c' + 'cc' : '#bf616a' + 'cc');
      return <Bar data={{ labels, datasets: [{ label: chartTitle || 'Waterfall', data: waterfallData as any, backgroundColor: waterfallColors, borderWidth: 0, borderRadius: 3 }] }} options={chartOptions} />;
    }

    if (chartType === 'treemap') {
      const total = values.reduce((a, b) => a + b, 0);
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', padding: '8px', width: '100%', minHeight: '160px' }}>
          {data.map((d, i) => {
            const pct = (d.value / total) * 100;
            const c = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <div key={i} style={{ flex: `${pct} 1 ${Math.max(pct, 15)}%`, minHeight: '60px', background: c + 'cc', borderRadius: '6px', padding: '8px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: '11px', fontWeight: 600 }}>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>{d.value}</div>
                <div>{d.label}</div>
              </div>
            );
          })}
        </div>
      );
    }

    if (chartType === 'radial-bar') {
      const maxVal = Math.max(...values);
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            {data.map((d, i) => {
              const r = 85 - i * 18;
              const circ = 2 * Math.PI * r;
              const pct = d.value / maxVal;
              const offset = circ - pct * circ;
              const c = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
              return (
                <g key={i}>
                  <circle cx="100" cy="100" r={r} fill="none" stroke="var(--border-color)" strokeWidth="12" opacity="0.2" />
                  <circle cx="100" cy="100" r={r} fill="none" stroke={c} strokeWidth="12" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 100 100)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                  <text x="196" y={100 - r + 4} fill="var(--text-muted)" fontSize="8" textAnchor="end">{d.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
      );
    }

    if (chartType === 'waffle') {
      const total = values.reduce((a, b) => a + b, 0);
      const cells: { color: string; label: string }[] = [];
      data.forEach((d, i) => {
        const count = Math.round((d.value / total) * 100);
        for (let j = 0; j < count; j++) {
          cells.push({ color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length], label: d.label });
        }
      });
      while (cells.length < 100) cells.push({ color: 'var(--bg-tertiary)', label: '' });
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '3px', padding: '8px', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
          {cells.slice(0, 100).map((cell, i) => (
            <div key={i} style={{ aspectRatio: '1', background: cell.color, borderRadius: '3px', minWidth: '8px' }} title={cell.label} />
          ))}
        </div>
      );
    }

    if (chartType === 'heatmap-grid') {
      const maxVal = Math.max(...values);
      const rows = Math.ceil(Math.sqrt(data.length));
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${rows}, 1fr)`, gap: '4px', padding: '8px', width: '100%' }}>
          {data.map((d, i) => {
            const intensity = d.value / maxVal;
            const c = d.color || '#5e81ac';
            return (
              <div key={i} style={{ aspectRatio: '1', background: c, opacity: 0.2 + intensity * 0.8, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700, minHeight: '40px' }} title={`${d.label}: ${d.value}`}>
                {d.value}
              </div>
            );
          })}
        </div>
      );
    }

    // Default fallback: bar chart
    return <Bar data={{ labels, datasets: [{ label: chartTitle || 'Data', data: values, backgroundColor: bgColors.map(c => c + 'cc'), borderColor: borderColors, borderWidth: 1, borderRadius: 4 }] }} options={chartOptions} />;
  };

  const currentTypeName = CHART_CATEGORIES.flatMap(c => c.types).find(t => t.type === chartType)?.name || chartType;

  return (
    <><div style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', background: 'var(--bg-secondary)', margin: '14px 0' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={16} style={{ color: 'var(--accent-color)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700 }}>{chartTitle || 'Advanced Chart'}</span>
          <span style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--accent-color)', color: '#fff', borderRadius: '10px', fontWeight: 600 }}>{currentTypeName}</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="cover-btn" onClick={() => setTypeSelectorOpen(!typeSelectorOpen)} style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> Type {typeSelectorOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
          <button className="cover-btn" onClick={() => setShowValues(!showValues)} style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {showValues ? <EyeOff size={12} /> : <Eye size={12} />} Values
          </button>
          <button className="cover-btn" onClick={() => setSettingsOpen(!settingsOpen)} style={{ padding: '3px 8px', fontSize: '11px' }}>
            <Settings size={12} />
          </button>
          <button className="cover-btn" onClick={() => setIsFullscreen(!isFullscreen)} style={{ padding: '3px 8px', fontSize: '11px' }}>
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Type Selector Dropdown */}
      {typeSelectorOpen && (
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', maxHeight: '260px', overflowY: 'auto' }}>
          {CHART_CATEGORIES.map(cat => (
            <div key={cat.label} style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>{cat.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {cat.types.map(t => (
                  <button key={t.type} onClick={() => setChartType(t.type)} className="cover-btn" style={{ padding: '3px 8px', fontSize: '10px', background: chartType === t.type ? 'var(--accent-color)' : 'transparent', color: chartType === t.type ? '#fff' : 'inherit', fontWeight: chartType === t.type ? 700 : 500 }}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Panel */}
      {settingsOpen && (
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Type size={12} />
            <input type="text" value={chartTitle} onChange={e => updateBlock(pageId, block.id, { properties: { chartTitle: e.target.value } })} placeholder="Chart title..." style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '3px 8px', fontSize: '12px', width: '140px', color: 'inherit', outline: 'none' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showLegend} onChange={e => updateBlock(pageId, block.id, { properties: { chartShowLegend: e.target.checked } })} />
            Legend
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showGrid} onChange={e => updateBlock(pageId, block.id, { properties: { chartShowGrid: e.target.checked } })} />
            Grid
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showAnimation} onChange={e => updateBlock(pageId, block.id, { properties: { chartShowAnimation: e.target.checked } })} />
            Animation
          </label>
        </div>
      )}

      {/* Chart Canvas */}
      <div style={{ padding: '16px', background: 'var(--bg-primary)', minHeight: '200px', maxHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {data.length === 0 ? (
          <div style={{ color: 'var(--text-placeholder)', fontStyle: 'italic', fontSize: '13px' }}>Add data points below to render chart.</div>
        ) : renderChart()}
      </div>

      {/* Data Editor */}
      {showValues && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
          {/* Data points list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {data.map((d, idx) => (
              <div key={idx} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length], cursor: 'pointer' }} onClick={() => handleEdit(idx)} />
                {editingIdx === idx ? (
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)} style={{ width: '60px', padding: '1px 4px', fontSize: '10px', border: '1px solid var(--border-color)', borderRadius: '3px', background: 'var(--bg-secondary)', color: 'inherit', outline: 'none' }} />
                    <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} style={{ width: '50px', padding: '1px 4px', fontSize: '10px', border: '1px solid var(--border-color)', borderRadius: '3px', background: 'var(--bg-secondary)', color: 'inherit', outline: 'none' }} />
                    <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} style={{ width: '20px', height: '16px', padding: 0, border: 'none', cursor: 'pointer' }} />
                    <button onClick={handleSaveEdit} style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '3px', padding: '1px 6px', fontSize: '9px', cursor: 'pointer', fontWeight: 700 }}>✓</button>
                  </div>
                ) : (
                  <>
                    <strong style={{ cursor: 'pointer' }} onClick={() => handleEdit(idx)}>{d.label}</strong>
                    <span>{d.value}</span>
                  </>
                )}
                <button onClick={() => handleRemove(idx)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, fontSize: '12px', fontWeight: 700 }}>&times;</button>
              </div>
            ))}
          </div>

          {/* Add new data */}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label" style={{ flexGrow: 1, padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-primary)', color: 'inherit', outline: 'none' }} />
            <input type="number" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Value" style={{ width: '80px', padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-primary)', color: 'inherit', outline: 'none' }} />
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} style={{ width: '28px', height: '24px', padding: 0, border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }} />
            <button type="submit" className="cover-btn" style={{ padding: '4px 12px', fontSize: '11px', fontWeight: 600 }}>
              <Plus size={12} /> Add
            </button>
          </form>
        </div>
      )}
    </div>

    {/* ponytail: fullscreen overlay, native DOM portal not needed, fixed position */}
    {isFullscreen && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'var(--bg-primary)',
        display: 'flex', flexDirection: 'column',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button className="cover-btn" onClick={() => setIsFullscreen(false)} style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Minimize2 size={14} /> Close
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
          {data.length === 0 ? (
            <div style={{ color: 'var(--text-placeholder)', fontStyle: 'italic' }}>No data.</div>
          ) : renderChart()}
        </div>
      </div>
    )}
  </>);
};
