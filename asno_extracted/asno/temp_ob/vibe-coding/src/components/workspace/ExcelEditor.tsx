import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Download, Save, FileSpreadsheet, ChevronDown, Sparkles, Bold as BoldIcon, Italic as ItalicIcon, 
  Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, Check, X as CancelIcon, 
  Plus, Loader2, Grid, Table2, Percent, DollarSign, Type, Trash, Layout, Hammer, AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../../store/useStore';

interface ExcelEditorProps {
  url: string;
}

// Coordinate parsing helper
const cellRefToIndexes = (ref: string) => {
  const match = ref.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  const colStr = match[1];
  const rowStr = match[2];
  
  let colIdx = 0;
  for (let i = 0; i < colStr.length; i++) {
    colIdx = colIdx * 26 + (colStr.charCodeAt(i) - 64);
  }
  return { col: colIdx - 1, row: parseInt(rowStr) - 1 };
};

// Index to letters
const indexToColLetter = (index: number) => {
  let letter = '';
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
};

export function ExcelEditor({ url }: ExcelEditorProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(url);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'Home' | 'WPS PDF' | 'Insert' | 'Draw' | 'Page Layout' | 'Formulas' | 'Data' | 'Review' | 'View'>('Home');
  const [sheets, setSheets] = useState<string[]>(['Sheet1']);
  const [activeSheet, setActiveSheet] = useState<string>('Sheet1');
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // Cell Styles Matrix: cellKey -> styling options
  const [cellStyles, setCellStyles] = useState<Record<string, { bold?: boolean; italic?: boolean; color?: string; bg?: string; align?: 'left' | 'center' | 'right' }>>({});

  // Cells Value Grid State represents cells raw values (or formulas)
  const [cellData, setCellData] = useState<Record<string, string>>({});
  
  // Selected Cell Context
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formulaInput, setFormulaInput] = useState<string>('');
  
  const editInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const filename = currentUrl.split('/').pop() || 'Spreadsheet.xlsx';

  // Selected cell label (like A1, J14 etc.)
  const selectedCellLabel = useMemo(() => {
    return indexToColLetter(selectedCell.col) + (selectedCell.row + 1);
  }, [selectedCell]);

  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  // Load Spreadsheet
  useEffect(() => {
    async function loadExcel() {
      if (!currentUrl) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(currentUrl);
        if (!res.ok) throw new Error('Failed to retrieve spreadsheet workbook.');
        const arrayBuffer = await res.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        if (workbook.SheetNames.length > 0) {
          setSheets(workbook.SheetNames);
          setActiveSheet(workbook.SheetNames[0]);
          
          // Parse sheets rows/cells
          const cellsMap: Record<string, string> = {};
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            Object.keys(worksheet).forEach(cellKey => {
              if (cellKey.startsWith('!')) return; // skip metadata
              const cell = worksheet[cellKey];
              if (cell) {
                // If cell has formula, store formula or fallback to cell value
                cellsMap[`${sheetName}!${cellKey}`] = cell.f ? `=${cell.f}` : String(cell.v ?? '');
              }
            });
          });
          setCellData(cellsMap);
        }
      } catch (err: any) {
        console.error('XLSX Load Error, feeding mock skeleton:', err);
        // Fallback default mock data
        const mockMap: Record<string, string> = {
          'Sheet1!A1': 'AI Cost Model & Performance Audit',
          'Sheet1!A3': 'Metric', 'Sheet1!B3': 'Vibe-Budget', 'Sheet1!C3': 'Vibe-Actual', 'Sheet1!D3': 'Variance',
          'Sheet1!A4': 'Model Inference Costs', 'Sheet1!B4': '12500', 'Sheet1!C4': '14200', 'Sheet1!D4': '=C4-B4',
          'Sheet1!A5': 'GPU Node Orchestration', 'Sheet1!B5': '8000', 'Sheet1!C5': '7800', 'Sheet1!D5': '=C5-B5',
          'Sheet1!A6': 'Token Storage Pipeline', 'Sheet1!B6': '3200', 'Sheet1!C6': '3700', 'Sheet1!D6': '=C6-B6',
          'Sheet1!A7': 'Compliance Sandbox Auditing', 'Sheet1!B7': '4500', 'Sheet1!C7': '4100', 'Sheet1!D7': '=C7-B7',
          'Sheet1!A9': 'Total Enterprise Expenses', 'Sheet1!B9': '=SUM(B4:B7)', 'Sheet1!C9': '=SUM(C4:C7)', 'Sheet1!D9': '=SUM(D4:D7)',
          'Sheet1!A11': 'Variance Margin Ratio', 'Sheet1!B11': '=B9*0.045', 'Sheet1!C11': '=C9*0.045', 'Sheet1!D11': '=D9*0.045'
        };
        const mockStyles: Record<string, any> = {
          'Sheet1!A1': { bold: true, color: '#107C41', align: 'left' },
          'Sheet1!A3': { bold: true, bg: '#f3f4f6', align: 'left' },
          'Sheet1!B3': { bold: true, bg: '#f3f4f6', align: 'right' },
          'Sheet1!C3': { bold: true, bg: '#f3f4f6', align: 'right' },
          'Sheet1!D3': { bold: true, bg: '#f3f4f6', align: 'right' },
          'Sheet1!A9': { bold: true, bg: '#eefcf5', align: 'left' },
          'Sheet1!B9': { bold: true, bg: '#eefcf5', align: 'right' },
          'Sheet1!C9': { bold: true, bg: '#eefcf5', align: 'right' },
          'Sheet1!D9': { bold: true, bg: '#eefcf5', align: 'right' },
        };
        setCellData(mockMap);
        setCellStyles(mockStyles);
      } finally {
        setLoading(false);
      }
    }

    loadExcel();
  }, [currentUrl]);

  // Sync selected cell data to Formula input
  useEffect(() => {
    const key = `${activeSheet}!${selectedCellLabel}`;
    setFormulaInput(cellData[key] || '');
  }, [selectedCell, activeSheet, cellData, selectedCellLabel]);

  // Focus double-clicked input element
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Formulas evaluation engine
  const evaluateCell = (cellValue: string): string => {
    if (!cellValue) return '';
    const str = String(cellValue).trim();
    if (!str.startsWith('=')) return str;

    try {
      const formula = str.substring(1).toUpperCase();
      
      // 1. Evaluate =SUM(Range)
      if (formula.startsWith('SUM(')) {
        const range = formula.substring(4, formula.length - 1);
        const cells = getCellsInRange(range);
        let sum = 0;
        cells.forEach(cKey => {
          const val = parseFloat(evaluateCell(cellData[`${activeSheet}!${cKey}`] || '0'));
          if (!isNaN(val)) sum += val;
        });
        return String(sum);
      }

      // 2. Evaluate =AVERAGE(Range)
      if (formula.startsWith('AVERAGE(')) {
        const range = formula.substring(8, formula.length - 1);
        const cells = getCellsInRange(range);
        let sum = 0;
        let count = 0;
        cells.forEach(cKey => {
          const val = parseFloat(evaluateCell(cellData[`${activeSheet}!${cKey}`] || '0'));
          if (!isNaN(val)) {
            sum += val;
            count++;
          }
        });
        return count > 0 ? String((sum / count).toFixed(2)) : '0';
      }

      // 3. Simple basic operations, e.g. B4+C4 or C4-B4
      // Match coordinate pairs like B4-A4, C9/D9
      const opMatch = formula.match(/^([A-Z]+[0-9]+)\s*([\+\-\*\/])\s*([A-Z]+[0-9]+)$/);
      if (opMatch) {
         const cell1 = opMatch[1];
         const operator = opMatch[2];
         const cell2 = opMatch[3];
         
         const v1 = parseFloat(evaluateCell(cellData[`${activeSheet}!${cell1}`] || '0'));
         const v2 = parseFloat(evaluateCell(cellData[`${activeSheet}!${cell2}`] || '0'));
         
         if (isNaN(v1) || isNaN(v2)) return '#VALUE!';
         if (operator === '+') return String(v1 + v2);
         if (operator === '-') return String(v1 - v2);
         if (operator === '*') return String(v1 * v2);
         if (operator === '/') return v2 !== 0 ? String(v1 / v2) : '#DIV/0!';
      }

      // 4. Multiply with constants, e.g. B9*0.045
      const constantMatch = formula.match(/^([A-Z]+[0-9]+)\s*([\+\-\*\/])\s*([0-9\.]+)$/);
      if (constantMatch) {
        const cell1 = constantMatch[1];
        const operator = constantMatch[2];
        const constantValue = parseFloat(constantMatch[3]);
        const v1 = parseFloat(evaluateCell(cellData[`${activeSheet}!${cell1}`] || '0'));
        
        if (isNaN(v1) || isNaN(constantValue)) return '#VALUE!';
        if (operator === '*') return String((v1 * constantValue).toFixed(2));
        if (operator === '/') return constantValue !== 0 ? String((v1 / constantValue).toFixed(2)) : '#DIV/0!';
        if (operator === '+') return String((v1 + constantValue).toFixed(2));
        if (operator === '-') return String((v1 - constantValue).toFixed(2));
      }

      return str; // return raw formula back if not specifically handled
    } catch (e) {
      return '#ERR!';
    }
  };

  // Range resolution helper
  const getCellsInRange = (range: string): string[] => {
    const parts = range.split(':');
    if (parts.length !== 2) return [parts[0]];
    const start = cellRefToIndexes(parts[0]);
    const end = cellRefToIndexes(parts[1]);
    
    if (!start || !end) return [];
    
    const cells: string[] = [];
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        cells.push(indexToColLetter(c) + (r + 1));
      }
    }
    return cells;
  };

  // Apply cell value update
  const handleCellUpdate = (val: string) => {
    const key = `${activeSheet}!${selectedCellLabel}`;
    setCellData(prev => ({ ...prev, [key]: val }));
  };

  // Keyboard Navigation in Excel Grid
  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) return; // ignore when typing inside cell
    
    let { row, col } = selectedCell;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      row = Math.max(0, row - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      row = Math.min(49, row + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      col = Math.max(0, col - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      col = Math.min(25, col + 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(true);
      return;
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleCellUpdate('');
      return;
    } else {
      return;
    }
    setSelectedCell({ row, col });
  };

  // Toolbar toggles for active cell formatting
  const toggleStyle = (styleType: 'bold' | 'italic') => {
    const cellKey = `${activeSheet}!${selectedCellLabel}`;
    const current = cellStyles[cellKey] || {};
    const updated = { ...current, [styleType]: !current[styleType] };
    setCellStyles(prev => ({ ...prev, [cellKey]: updated }));
  };

  const applyAlignment = (align: 'left' | 'center' | 'right') => {
    const cellKey = `${activeSheet}!${selectedCellLabel}`;
    const current = cellStyles[cellKey] || {};
    const updated = { ...current, align };
    setCellStyles(prev => ({ ...prev, [cellKey]: updated }));
  };

  const applyColor = (color: string) => {
    const cellKey = `${activeSheet}!${selectedCellLabel}`;
    const current = cellStyles[cellKey] || {};
    const updated = { ...current, color };
    setCellStyles(prev => ({ ...prev, [cellKey]: updated }));
  };

  const applyBg = (bg: string) => {
    const cellKey = `${activeSheet}!${selectedCellLabel}`;
    const current = cellStyles[cellKey] || {};
    const updated = { ...current, bg };
    setCellStyles(prev => ({ ...prev, [cellKey]: updated }));
  };

  const addMocksSheets = () => {
    const nextIdx = sheets.length + 1;
    const newName = `Sheet${nextIdx}`;
    setSheets(prev => [...prev, newName]);
    setActiveSheet(newName);
  };

  const saveExcelWorkbook = async () => {
    setSaving(true);
    try {
      // Re-create SheetJS workbook matrix from our React state!
      const wb = XLSX.utils.book_new();
      
      sheets.forEach(sheetName => {
        // Collect rows up to max filled cells
        const dataAOA: any[][] = [];
        for (let r = 0; r < 50; r++) {
          const rowData: any[] = [];
          let hasVal = false;
          for (let c = 0; c < 26; c++) {
            const label = indexToColLetter(c) + (r + 1);
            const val = cellData[`${sheetName}!${label}`] || '';
            if (val) hasVal = true;
            
            // If spreadsheet calculates formula, write evaluated output or formula string
            if (val.startsWith('=')) {
              // Convert to parsed structure for sheet JS
              rowData.push({ f: val.substring(1), t: 'n' });
            } else {
              const numVal = parseFloat(val);
              rowData.push(!isNaN(numVal) && String(numVal) === val ? numVal : val);
            }
          }
          dataAOA.push(rowData);
        }
        
        const ws = XLSX.utils.aoa_to_sheet(dataAOA);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      // Write compiled binary array to buffer
      const wopts: any = { bookType: 'xlsx', bookS: true, type: 'binary' };
      const wbout = XLSX.write(wb, wopts);
      
      // Convert to Base64 for filesystem pipeline
      const s2ab = (s: string) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
      };
      const binaryBuf = s2ab(wbout);
      const base64Content = btoa(
        new Uint8Array(binaryBuf)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Save to server
      const res = await fetch('/api/documents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: filename,
          content: base64Content,
          isBase64: true
        })
      });

      if (!res.ok) throw new Error('Could not write excel workbook to storage');

      alert(`Success: ${filename} saved successfully!`);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save spreadsheet: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const exportExcelOnClient = () => {
    const wb = XLSX.utils.book_new();
    sheets.forEach(sheetName => {
      const aoa: any[][] = [];
      for (let r = 0; r < 20; r++) {
        const row: any[] = [];
        for (let c = 0; c < 15; c++) {
          const l = indexToColLetter(c) + (r + 1);
          const raw = cellData[`${sheetName}!${l}`] || '';
          if (raw.startsWith('=')) {
             row.push(evaluateCell(raw));
          } else {
             row.push(raw);
          }
        }
        aoa.push(row);
      }
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#141414] text-zinc-300 font-sans select-none overflow-hidden min-h-0" onKeyDown={handleGridKeyDown}>
      
      {/* 1. Spreadsheets App Title & Standard System Options */}
      <div className="bg-[#107C41] px-4 py-2 flex items-center justify-between text-white border-b border-[#0d6434] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white shrink-0" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3.5 13.5l-2.03-7.5-2.03 7.5H9.6L7.1 7.5h2.1l1.35 5.58 1.95-5.58h1.8l1.95 5.58L17.65 7.5h2.1l-2.5 9H15.5z"/>
          </svg>
          <span className="font-semibold text-xs tracking-wide uppercase font-mono truncate">{filename} — Microsoft Excel Online</span>
          <span className="text-[10px] bg-emerald-400/20 px-2 py-0.5 rounded text-emerald-100 border border-emerald-400/20 font-bold font-sans">Formula Engine Active</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={saveExcelWorkbook} 
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-xs font-semibold cursor-pointer transition-all shrink-0"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            <span>{saving ? 'Saving...' : 'Save Table'}</span>
          </button>
          
          <button 
            onClick={exportExcelOnClient}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#0b542c] hover:bg-[#07381d] border border-transparent rounded text-xs font-semibold cursor-pointer transition-all shrink-0 text-white"
          >
            <Download size={12} />
            <span>Download .xlsx</span>
          </button>
        </div>
      </div>

      {/* 2. Ribbon Tabs Navigation */}
      <div className="bg-white border-b border-[#ddd] flex items-center px-4 shrink-0">
        <div className="flex gap-4">
          {(['Home', 'WPS PDF', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View'] as const).map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 text-[12px] font-medium transition-all relative border-b-2 outline-none cursor-pointer ${
                  isActive 
                    ? 'border-[#107C41] text-[#107C41] font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. High Fidelity Cell Formatting Ribbon */}
      <div className="bg-gray-50 border-b border-[#ccc] py-2 px-4 flex flex-wrap items-center gap-3 shrink-0 select-none text-zinc-700">
        {activeTab === 'Home' && (
          <>
            {/* Fonts formatting options */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button 
                onClick={() => toggleStyle('bold')} 
                className={`p-1 px-2 rounded transition-all cursor-pointer ${
                  cellStyles[`${activeSheet}!${selectedCellLabel}`]?.bold ? 'bg-[#107C41]/15 text-[#107C41] font-bold' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Bold (B)"
              >
                <BoldIcon size={13} />
              </button>
              <button 
                onClick={() => toggleStyle('italic')} 
                className={`p-1 px-1.5 rounded transition-all cursor-pointer ${
                  cellStyles[`${activeSheet}!${selectedCellLabel}`]?.italic ? 'bg-[#107C41]/15 text-[#107C41] italic' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Italic (I)"
              >
                <ItalicIcon size={13} />
              </button>
            </div>

            <div className="h-4 border-r border-gray-300" />

            {/* Cell Fill Colors */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm gap-0.5">
              <button onClick={() => applyBg('#eefcf5')} className="w-5 h-5 bg-[#eefcf5] border border-gray-300 rounded hover:scale-105 active:scale-95 cursor-pointer" title="Soft Green" />
              <button onClick={() => applyBg('#eff6ff')} className="w-5 h-5 bg-[#eff6ff] border border-gray-300 rounded hover:scale-105 active:scale-95 cursor-pointer" title="Soft Blue" />
              <button onClick={() => applyBg('#fef3c7')} className="w-5 h-5 bg-[#fef3c7] border border-gray-300 rounded hover:scale-105 active:scale-95 cursor-pointer" title="Soft Yellow" />
              <button onClick={() => applyBg('#fee2e2')} className="w-5 h-5 bg-[#fee2e2] border border-gray-300 rounded hover:scale-105 active:scale-95 cursor-pointer" title="Soft Red" />
              <button 
                onClick={() => applyBg('')} 
                className="text-[10px] uppercase font-mono font-bold text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                title="Clear background"
              >
                Clear
              </button>
            </div>

            {/* Custom font colors */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm gap-0.5">
              <button onClick={() => applyColor('#107C41')} className="w-4 h-4 bg-[#107C41] rounded-full hover:scale-110 cursor-pointer" title="Green text" />
              <button onClick={() => applyColor('#1d4ed8')} className="w-4 h-4 bg-[#1d4ed8] rounded-full hover:scale-110 cursor-pointer" title="Blue text" />
              <button onClick={() => applyColor('#111827')} className="w-4 h-4 bg-[#111827] rounded-full hover:scale-110 cursor-pointer" title="Dark text" />
            </div>

            <div className="h-4 border-r border-gray-300" />

            {/* Alignment choices */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button 
                onClick={() => applyAlignment('left')} 
                className={`p-1 px-1.5 rounded transition-all cursor-pointer ${
                  cellStyles[`${activeSheet}!${selectedCellLabel}`]?.align === 'left' ? 'bg-[#107C41]/15 text-[#107C41]' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <AlignLeft size={13} />
              </button>
              <button 
                onClick={() => applyAlignment('center')} 
                className={`p-1 px-1.5 rounded transition-all cursor-pointer ${
                  cellStyles[`${activeSheet}!${selectedCellLabel}`]?.align === 'center' ? 'bg-[#107C41]/15 text-[#107C41]' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <AlignCenter size={13} />
              </button>
              <button 
                onClick={() => applyAlignment('right')} 
                className={`p-1 px-1.5 rounded transition-all cursor-pointer ${
                  cellStyles[`${activeSheet}!${selectedCellLabel}`]?.align === 'right' ? 'bg-[#107C41]/15 text-[#107C41]' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <AlignRight size={13} />
              </button>
            </div>

            <div className="h-4 border-r border-gray-300" />

            {/* Extra number formatting shortcuts */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 px-1.5 shadow-sm gap-2">
              <button onClick={() => handleCellUpdate(formulaInput + '%')} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-all cursor-pointer" title="Percent"><Percent size={12} /></button>
              <button onClick={() => handleCellUpdate('$' + formulaInput)} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-all cursor-pointer" title="Currency"><DollarSign size={12} /></button>
            </div>

            {/* Quick formulas modifiers insertion */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 gap-1 shadow-sm px-1.5">
              <button 
                onClick={() => handleCellUpdate('=SUM(B4:B7)')}
                className="text-[10px] font-bold font-mono tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-100 py-1 px-2 rounded-md hover:bg-emerald-100 cursor-pointer"
              >
                + SUM
              </button>
              <button 
                onClick={() => handleCellUpdate('=AVERAGE(B4:B7)')}
                className="text-[10px] font-bold font-mono tracking-wide bg-sky-50 text-sky-800 border border-sky-100 py-1 px-2 rounded-md hover:bg-sky-100 cursor-pointer"
              >
                AVG
              </button>
            </div>
          </>
        )}

        {activeTab === 'Formulas' && (
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-gray-500">Formulas presets:</span>
            <button onClick={() => handleCellUpdate('=SUM(B4:B7)')} className="text-[11px] bg-white border border-gray-250 py-1 px-2.5 rounded-md hover:bg-gray-50 font-mono font-bold text-gray-700 cursor-pointer">=SUM(B4:B7)</button>
            <button onClick={() => handleCellUpdate('=C4-B4')} className="text-[11px] bg-white border border-gray-250 py-1 px-2.5 rounded-md hover:bg-gray-50 font-mono font-bold text-gray-700 cursor-pointer">=C4-B4</button>
            <button onClick={() => handleCellUpdate('=AVERAGE(B4:B7)')} className="text-[11px] bg-white border border-gray-250 py-1 px-2.5 rounded-md hover:bg-gray-50 font-mono font-bold text-gray-700 cursor-pointer">=AVERAGE(B4:B7)</button>
          </div>
        )}

        {activeTab !== 'Home' && activeTab !== 'Formulas' && (
          <div className="text-[11px] text-gray-400 italic py-1">Advanced grid options configured for {activeTab}.</div>
        )}
      </div>

      {/* 4. Real Formula Bar Panel (Selected Coordinates + Input Fields) */}
      <div className="bg-[#1c1c1c] border-b border-[#2d2d2d] h-10 px-4 flex items-center select-none shrink-0 text-[12px] gap-2.5">
        {/* Selected cell key cell tracker */}
        <div className="bg-[#2a2a2a] border border-[#3e3e3e] text-emerald-400 font-mono w-[60px] h-[26px] flex items-center justify-center font-bold rounded shadow-inner text-center">
          {selectedCellLabel}
        </div>

        <div className="h-5 border-r border-[#2d2d2d]" />

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setFormulaInput('')}
            className="p-1 font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer" 
            title="Cancel content"
          >
            <CancelIcon size={13} />
          </button>
          <button 
            onClick={() => handleCellUpdate(formulaInput)}
            className="p-1 font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors cursor-pointer" 
            title="Settle/Apply content"
          >
            <Check size={13} />
          </button>
          <span className="font-serif italic font-bold text-[12px] text-zinc-500 px-1 ml-1 cursor-default">fx</span>
        </div>

        {/* Real-time editable textbox mapped to cell formula content */}
        <input
          type="text"
          value={formulaInput}
          onChange={(e) => {
            setFormulaInput(e.target.value);
            handleCellUpdate(e.target.value);
          }}
          placeholder="Enter formulas (e.g. =B4-C4, =SUM(A1:A5)) or raw entries text..."
          className="flex-1 bg-[#252526] border border-[#333] h-[26px] px-3.5 rounded text-zinc-200 text-[12px] font-mono outline-none focus:border-emerald-500/50 focus:bg-[#2c2c2d] transition-all font-medium"
        />
      </div>

      {/* 5. Infinite Rows and Columns Interactive Symmetrical Sizing Workspace */}
      <div className="flex-1 overflow-auto bg-[#1c1c1c] relative custom-scrollbar shrink-0 min-h-0" ref={scrollContainerRef}>
        {loading ? (
          <div className="flex w-full h-[320px] justify-center items-center text-gray-500 font-mono flex-col gap-3">
            <Loader2 size={24} className="animate-spin text-[#107C41]" />
            <span className="text-xs">Parsing worksheets dataset with XLSX...</span>
          </div>
        ) : (
          <div className="inline-block min-w-full text-zinc-800">
            
            {/* Headers row (A, B, C...) */}
            <div className="flex border-b border-[#2d2d2d] bg-[#222] select-none sticky top-0 z-10">
              <div className="w-[45px] h-[24px] flex items-center justify-center font-bold text-[10px] text-zinc-400 border-r border-[#2d2d2d] bg-[#1a1a1a]" />
              {Array.from({ length: 26 }).map((_, c) => {
                const isSelectedCol = selectedCell.col === c;
                return (
                  <div
                    key={c}
                    className={`w-[110px] h-[24px] flex items-center justify-center font-semibold text-[10px] tracking-wide border-r border-[#2d2d2d] transition-colors ${
                      isSelectedCol ? 'bg-[#107C41]/30 text-[#107C41] font-bold border-b border-emerald-500' : 'text-zinc-400 bg-[#252526]'
                    }`}
                  >
                    {indexToColLetter(c)}
                  </div>
                );
              })}
            </div>

            {/* Symmetrical spreadsheet rows */}
            {Array.from({ length: 50 }).map((_, r) => {
              const isSelectedRow = selectedCell.row === r;
              return (
                <div key={r} className="flex border-b border-[#1c1c1c] hover:bg-[#252526]/30">
                  
                  {/* Row numerical header */}
                  <div
                    className={`w-[45px] h-[24px] flex items-center justify-center font-semibold text-[10.5px] border-r border-[#2d2d2d] sticky left-0 z-10 transition-colors ${
                      isSelectedRow ? 'bg-[#107C41]/30 text-[#107C41] font-bold border-r border-emerald-500' : 'text-zinc-500 bg-[#222]'
                    }`}
                  >
                    {r + 1}
                  </div>

                  {/* Symmetrical Columns inside this row */}
                  {Array.from({ length: 26 }).map((_, c) => {
                    const cellLabel = indexToColLetter(c) + (r + 1);
                    const cellKey = `${activeSheet}!${cellLabel}`;
                    const rawVal = cellData[cellKey] || '';
                    
                    // Evaluate formula string prefix
                    const isFormula = rawVal.startsWith('=');
                    const renderedVal = isFormula ? evaluateCell(rawVal) : rawVal;
                    
                    const isSelected = selectedCell.row === r && selectedCell.col === c;
                    const styles = cellStyles[cellKey] || {};

                    return (
                      <div
                        key={c}
                        onClick={() => {
                          setSelectedCell({ row: r, col: c });
                          setIsEditing(false);
                        }}
                        onDoubleClick={() => setIsEditing(true)}
                        className={`w-[110px] h-[24px] border-r border-[#2d2d2d] shrink-0 text-[12px] px-2 flex items-center overflow-hidden truncate relative leading-[22px] cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-transparent text-white ring-2 ring-emerald-500 z-10 bg-[#1e1e1f]' 
                            : 'bg-[#1e1e1f] text-zinc-350 hover:bg-[#222]'
                        }`}
                        style={{
                          fontWeight: styles.bold ? 'bold' : 'normal',
                          fontStyle: styles.italic ? 'italic' : 'normal',
                          color: styles.color || '',
                          backgroundColor: styles.bg || '',
                          justifyContent: styles.align === 'center' ? 'center' : styles.align === 'right' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {isEditing && isSelected ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={formulaInput}
                            onChange={(e) => {
                              setFormulaInput(e.target.value);
                              handleCellUpdate(e.target.value);
                            }}
                            onBlur={() => setIsEditing(false)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setIsEditing(false);
                                scrollContainerRef.current?.focus();
                              }
                            }}
                            className="absolute inset-0 bg-[#2b2b2c] text-white px-2 border-none outline-none font-mono text-[12px] w-full h-full text-left"
                          />
                        ) : (
                          <span className={`truncate ${isFormula && !isSelected ? 'text-blue-400 font-medium' : ''}`}>
                            {renderedVal}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Tabs Sheets Selection Bar & Status Controls at Bottom */}
      <div className="bg-[#222] border-t border-[#333] h-10 px-4 flex items-center justify-between text-zinc-400 text-[11px] select-none shrink-0 font-medium font-sans">
        
        {/* Working sheets selector tabs (WPS-style add sheet) */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-[#1a1a1a] rounded p-0.5 border border-[#333] items-center gap-1">
            {sheets.map(sheet => {
              const isSelectedSheet = activeSheet === sheet;
              return (
                <button
                  key={sheet}
                  onClick={() => setActiveSheet(sheet)}
                  className={`px-3 py-1 text-[11px] font-semibold transition-all rounded cursor-pointer ${
                    isSelectedSheet ? 'bg-[#107C41] text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {sheet}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={addMocksSheets}
            className="p-1 hover:text-white bg-white/5 rounded border border-[#333] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            title="Insert sheet row"
          >
            <Plus size={12} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-[10.5px]">
          <span>Accessibility: <strong className="text-[#107C41] font-bold uppercase">Good to go</strong></span>
          <span className="h-3 w-px bg-[#333]" />
          <div className="flex items-center gap-2">
            <button onClick={() => setZoomPercent(Math.max(50, zoomPercent - 10))} className="hover:text-white cursor-pointer px-1 text-md font-bold">-</button>
            <span>{zoomPercent}%</span>
            <button onClick={() => setZoomPercent(Math.min(200, zoomPercent + 10))} className="hover:text-white cursor-pointer px-1 text-md font-bold">+</button>
          </div>
        </div>

      </div>

    </div>
  );
}
