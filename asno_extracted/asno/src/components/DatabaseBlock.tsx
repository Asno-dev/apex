import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { DatabaseRow, DatabaseView, DatabaseProperty, DatabasePropertyOption } from '../types';
import { ModalPeek } from './ModalPeek';
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
import { Bar, Line, Doughnut } from 'react-chartjs-2';

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
import { 
  Plus, 
  Table as TableIcon, 
  Columns as BoardIcon, 
  Calendar as CalendarIcon, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Settings, 
  Maximize2,
  CalendarDays,
  PlusSquare,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Eye,
  EyeOff,
  BarChart2,
  Mail,
  Phone,
  Link2,
  Globe,
  PlusCircle as PlusIcon,
  Maximize,
  Map as MapIcon,
  LayoutGrid,
  List as ListIcon,
  Activity,
  PieChart,
  FileText,
  Edit,
  Sliders,
  Check,
  CheckSquare,
  CalendarRange,
  Users,
  Copy,
  Clock,
  Info,
  ChevronRight as CollapseIcon,
  ChevronLeft as ExpandIcon
} from 'lucide-react';

interface DatabaseBlockProps {
  pageId: string;
  blockId: string;
}

const GEO_CACHE: Record<string, [number, number]> = {
  'new york': [40.7128, -74.0060],
  'london': [51.5074, -0.1278],
  'paris': [48.8566, 2.3522],
  'tokyo': [35.6762, 139.6503],
  'san francisco': [37.7749, -122.4194],
  'los angeles': [34.0522, -118.2437],
  'chicago': [41.8781, -87.6298],
  'berlin': [52.5200, 13.4050],
  'sydney': [-33.8688, 151.2093],
  'mumbai': [19.0760, 72.8777],
  'bangalore': [12.9716, 77.5946],
};

const getCoordsForAddress = (address: string): [number, number] => {
  const clean = (address || '').toLowerCase();
  for (const key of Object.keys(GEO_CACHE)) {
    if (clean.includes(key)) return GEO_CACHE[key];
  }
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = 40.7128 + ((hash % 100) / 1000);
  const lng = -74.0060 + (((hash >> 8) % 100) / 1000);
  return [lat, lng];
};

export const DatabaseBlock: React.FC<DatabaseBlockProps> = ({ pageId, blockId }) => {
  const {
    pages,
    updatePage,
    addDatabaseRow,
    updateDatabaseRowCell,
    deleteDatabaseRow,
    addDatabaseProperty,
    deleteDatabaseProperty,
    updateDatabaseProperty,
    addDatabaseView,
    updateDatabaseView,
    deleteDatabaseView,
    fullPageBlockId,
    setFullPageBlockId,
    updateBlock,
    addPage
  } = useApp();

  const activePage = pages.find((p) => p.id === pageId);
  const block = activePage?.content.find((b) => b.id === blockId);
  const dbPageId = block?.properties?.databaseId;
  const dbPage = pages.find((p) => p.id === dbPageId);

  const [activeViewIdx, setActiveViewIdx] = useState(0);
  const [activeRowIdPeek, setActiveRowIdPeek] = useState<string | null>(null);
  const [showAddViewPopover, setShowAddViewPopover] = useState(false);
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editingViewName, setEditingViewName] = useState('');
  
  // Custom Cell Popover Editors State
  const [activeCellEdit, setActiveCellEdit] = useState<{ rowId: string; propId: string } | null>(null);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // Property Visibility State
  const [showPropVisibilityMenu, setShowPropVisibilityMenu] = useState(false);

  // Column calculations state
  const [colCalcs, setColCalcs] = useState<Record<string, string>>({});
  const [activeCalcSelector, setActiveCalcSelector] = useState<string | null>(null);

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [filterPropId, setFilterPropId] = useState('');
  const [filterOperator, setFilterOperator] = useState('contains');
  const [filterValue, setFilterValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ propertyId: string; operator: string; value: string }[]>([]);
  const [sortPropId, setSortPropId] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Property Creator state
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<DatabaseProperty['type']>('text');
  const [propEditorOpen, setPropEditorOpen] = useState(false);
  const [showFilterBuilder, setShowFilterBuilder] = useState(false);
  const [showSortBuilder, setShowSortBuilder] = useState(false);

  // Kanban grouping & card states
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [kanbanGroupBy, setKanbanGroupBy] = useState<string>('');

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Timeline zoom level
  const [timelineZoom, setTimelineZoom] = useState<'days' | 'weeks' | 'months'>('days');

  // Dashboard customization state
  const [dashboardGroupProp, setDashboardGroupProp] = useState('');
  const [dashboardMetricProp, setDashboardMetricProp] = useState('');
  const [dashboardMetricType, setDashboardMetricType] = useState<'count' | 'sum' | 'avg'>('count');

  // Gallery Card size state
  const [galleryCardSize, setGalleryCardSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Form View state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [formAccessBanner, setFormAccessBanner] = useState('🔐 Only members at AOT can fill out this form.');
  const [formActiveTab, setFormActiveTab] = useState<'questions' | 'responses'>('questions');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Leaflet map hooks
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [geocodedCoords, setGeocodedCoords] = useState<Record<string, [number, number]>>({});
  const [mapSearchQuery, setMapSearchQuery] = useState('');

  if (!dbPage) {
    return (
      <div className="db-block-error">
        <Clock size={16} className="spin" />
        <span>Connecting to database view portal...</span>
      </div>
    );
  }

  const views = dbPage.dbViews || [];
  const activeView = views[activeViewIdx] || views[0] || { type: 'table', visibleProperties: [] };
  const schema = dbPage.dbSchema || { properties: [] };
  const rows = dbPage.dbRows || [];

  const viewOptions = [
    { type: 'table' as const, label: 'Table', name: 'Table View', icon: <TableIcon size={16} /> },
    { type: 'board' as const, label: 'Board', name: 'Board View', icon: <BoardIcon size={16} /> },
    { type: 'gallery' as const, label: 'Gallery', name: 'Gallery View', icon: <LayoutGrid size={16} /> },
    { type: 'list' as const, label: 'List', name: 'List View', icon: <ListIcon size={16} /> },
    { type: 'dashboard' as const, label: 'Dashboard', name: 'Dashboard Stats', icon: <BarChart2 size={16} /> },
    { type: 'timeline' as const, label: 'Timeline', name: 'Timeline View', icon: <CalendarDays size={16} /> },
    { type: 'feed' as const, label: 'Feed', name: 'Timeline Feed', icon: <Activity size={16} /> },
    { type: 'map' as const, label: 'Map', name: 'Map Portal', icon: <MapIcon size={16} /> },
    { type: 'calendar' as const, label: 'Calendar', name: 'Calendar View', icon: <CalendarIcon size={16} /> },
    { type: 'form' as const, label: 'Form', name: 'Form View', icon: <Edit size={16} /> }
  ];

  // Leaflet CDNs Load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).L) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.body.appendChild(script);
  }, []);

  // Resolve address coordinates dynamically (caching geocoded results)
  const resolveCoords = (address: string): [number, number] => {
    const clean = (address || '').toLowerCase().trim();
    if (GEO_CACHE[clean]) return GEO_CACHE[clean];
    if (geocodedCoords[clean]) return geocodedCoords[clean];
    
    // Hash fallback
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = clean.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = 40.7128 + ((hash % 100) / 1000);
    const lng = -74.0060 + (((hash >> 8) % 100) / 1000);
    return [lat, lng];
  };

  // Dynamic Geocoder Loop Effect
  useEffect(() => {
    if (activeView.type !== 'map' || !dbPage) return;
    
    const textProps = schema.properties.filter(p => p.type === 'text');
    const addressProp = textProps.find(p => p.name.toLowerCase().includes('address') || p.name.toLowerCase().includes('location')) || textProps[0];
    if (!addressProp) return;
    
    const fetchCoords = async () => {
      const newCoords = { ...geocodedCoords };
      let updated = false;
      
      for (const r of rows) {
        const address = String(r.cells[addressProp.id] || '').trim();
        if (!address) continue;
        
        const cleanAddr = address.toLowerCase();
        if (GEO_CACHE[cleanAddr] || newCoords[cleanAddr]) continue;
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`);
          const data = await res.json();
          if (data && data.length > 0) {
            newCoords[cleanAddr] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            updated = true;
          }
        } catch (err) {
          console.error("Geocoding failed for address:", address, err);
        }
      }
      
      if (updated) {
        setGeocodedCoords(newCoords);
      }
    };
    
    fetchCoords();
  }, [rows, activeView.type, schema.properties]);

  // Leaflet Map Initialization & Interactive Handlers
  useEffect(() => {
    if (activeView.type !== 'map' || !dbPage) return;
    
    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;
      
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }
      
      const textProps = schema.properties.filter(p => p.type === 'text');
      const addressProp = textProps.find(p => p.name.toLowerCase().includes('address') || p.name.toLowerCase().includes('location')) || textProps[0];
      const validPins = rows.map(r => {
        const address = addressProp ? r.cells[addressProp.id] : '';
        return address ? resolveCoords(address) : null;
      }).filter(Boolean) as [number, number][];
      
      const center: [number, number] = validPins.length > 0 ? validPins[0] : [40.7128, -74.0060];
      const map = L.map(mapContainerRef.current).setView(center, 12);
      leafletMapRef.current = map;
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      
      // Add existing pins
      rows.forEach(r => {
        const name = r.cells[schema.properties[0]?.id] || 'Untitled Item';
        const address = addressProp ? r.cells[addressProp.id] : '';
        if (address) {
          const coords = resolveCoords(address);
          
          const popupContent = document.createElement('div');
          popupContent.style.fontFamily = 'var(--font-sans)';
          popupContent.innerHTML = `
            <div style="font-weight: 700; font-size: 13px;">${name}</div>
            <div style="font-size: 11px; color: #666; margin: 4px 0 8px;">${address}</div>
            <button id="popup-peek-btn-${r.id}" style="
              background: var(--accent-color, #7053ff);
              color: white;
              border: none;
              padding: 4px 8px;
              font-size: 10px;
              font-weight: 600;
              border-radius: 4px;
              cursor: pointer;
              width: 100%;
            ">Edit Notes / Details</button>
          `;
          
          const marker = L.marker(coords).addTo(map);
          marker.bindPopup(popupContent);
          
          marker.on('popupopen', () => {
            const btn = document.getElementById(`popup-peek-btn-${r.id}`);
            if (btn) {
              btn.onclick = () => {
                setActiveRowIdPeek(r.id);
                map.closePopup();
              };
            }
          });
        }
      });

      // Add click listener to map to geocode and drop pin/add row
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          
          const popupDiv = document.createElement('div');
          popupDiv.innerHTML = `
            <div style="font-weight: 700; font-size: 13px;">Drop Pin Here?</div>
            <div style="font-size: 10px; color: #666; margin: 4px 0 8px;">${address}</div>
            <button id="map-click-add-btn" style="
              background: var(--accent-color, #7053ff);
              color: white;
              border: none;
              padding: 4px 8px;
              font-size: 11px;
              font-weight: 600;
              border-radius: 4px;
              cursor: pointer;
              width: 100%;
            ">Add Location</button>
          `;
          
          L.popup()
            .setLatLng(e.latlng)
            .setContent(popupDiv)
            .openOn(map);
            
          setTimeout(() => {
            const btn = document.getElementById('map-click-add-btn');
            if (btn) {
              btn.onclick = () => {
                const titlePropId = schema.properties[0]?.id || 'prop-name';
                const rowData: Record<string, any> = {
                  [titlePropId]: address.split(',')[0] || 'New Location',
                  [addressProp.id]: address
                };
                
                const cleanAddr = address.toLowerCase();
                setGeocodedCoords(prev => ({
                  ...prev,
                  [cleanAddr]: [lat, lng]
                }));
                
                addDatabaseRow(dbPage.id, rowData);
                map.closePopup();
              };
            }
          }, 100);
        } catch (err) {
          console.error("Reverse geocoding failed", err);
        }
      });
    };

    const L = (window as any).L;
    if (L) {
      initMap();
    } else {
      const interval = setInterval(() => {
        if ((window as any).L) {
          initMap();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [activeViewIdx, rows, schema, activeView.type, mapCollapsed, geocodedCoords]);



  const isPropVisible = (propId: string) => {
    if (!activeView.visibleProperties || activeView.visibleProperties.length === 0) return true;
    return activeView.visibleProperties.includes(propId);
  };

  const togglePropertyVisibility = (propId: string) => {
    const current = activeView.visibleProperties || schema.properties.map(p => p.id);
    let next;
    if (current.includes(propId)) {
      next = current.filter(id => id !== propId);
    } else {
      next = [...current, propId];
    }
    updateDatabaseView(dbPage.id, activeView.id, { visibleProperties: next });
  };

  const getProcessedRows = () => {
    let result = [...rows];
    if (searchQuery.trim()) {
      const lowQ = searchQuery.toLowerCase();
      result = result.filter(row => {
        return Object.values(row.cells).some(val => 
          val && String(val).toLowerCase().includes(lowQ)
        );
      });
    }

    activeFilters.forEach(f => {
      if (!f.propertyId) return;
      result = result.filter(row => {
        const val = row.cells[f.propertyId];
        const filterVal = f.value.toLowerCase();
        
        if (f.operator === 'is-empty') {
          return !val || (Array.isArray(val) && val.length === 0);
        }
        if (!val) return false;
        if (f.operator === 'contains') {
          return String(val).toLowerCase().includes(filterVal);
        }
        if (f.operator === 'is') {
          return String(val).toLowerCase() === filterVal;
        }
        if (f.operator === 'is-checked') {
          return val === true || String(val) === 'true';
        }
        return true;
      });
    });

    const activeSortProp = sortPropId || activeView.sortPropertyId;
    const activeSortDir = sortPropId ? sortDirection : (activeView.sortDirection || 'asc');
    if (activeSortProp) {
      const isAsc = activeSortDir !== 'desc';
      result.sort((a, b) => {
        const valA = a.cells[activeSortProp];
        const valB = b.cells[activeSortProp];
        if (valA == null) return isAsc ? 1 : -1;
        if (valB == null) return isAsc ? -1 : 1;
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return isAsc ? valA - valB : valB - valA;
        }
        return isAsc 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA));
      });
    }
    return result;
  };

  const processedRows = getProcessedRows();

  const handleAddRow = (defaults: Record<string, any> = {}) => {
    const newId = addDatabaseRow(dbPage.id, defaults);
    return newId;
  };

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName.trim()) return;
    addDatabaseProperty(dbPage.id, newPropName, newPropType);
    setNewPropName('');
    setPropEditorOpen(false);
  };

  const handleDragStart = (rowId: string) => {
    setDraggedCardId(rowId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverColId(colId);
  };

  const handleDrop = (colOptionId: string) => {
    const targetGroupProp = kanbanGroupBy || activeView.groupByPropertyId || 'prop-status';
    if (draggedCardId && targetGroupProp) {
      updateDatabaseRowCell(dbPage.id, draggedCardId, targetGroupProp, colOptionId);
    }
    setDraggedCardId(null);
    setDragOverColId(null);
  };

  const addFilter = () => {
    if (!filterPropId) return;
    setActiveFilters([...activeFilters, { propertyId: filterPropId, operator: filterOperator, value: filterValue }]);
    setFilterValue('');
    setShowFilterBuilder(false);
  };

  const removeFilter = (idx: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== idx));
  };

  const handleAddTagOption = (prop: DatabaseProperty, tagText: string, color: string) => {
    if (!tagText.trim()) return;
    const currentOptions = prop.options || [];
    const newOption = {
      id: `opt-${Math.random().toString(36).substring(2, 9)}`,
      name: tagText,
      color: color || '#e9ecef'
    };
    updateDatabaseProperty(dbPage.id, prop.id, {
      options: [...currentOptions, newOption]
    });
  };

  const enableKanbanStatuses = () => {
    const newPropId = `prop-${Math.random().toString(36).substring(2, 9)}`;
    const newProperty: DatabaseProperty = {
      id: newPropId,
      name: 'Status',
      type: 'status',
      options: [
        { id: 'kb-todo', name: 'To Do', color: '#ffb3ba' },
        { id: 'kb-doing', name: 'In Progress', color: '#ffdfba' },
        { id: 'kb-done', name: 'Completed', color: '#baffc9' }
      ]
    };
    
    // Add property to page schema
    const updatedProperties = [...(dbPage.dbSchema?.properties || []), newProperty];
    updatePage(dbPage.id, {
      dbSchema: { properties: updatedProperties }
    });

    // Update active board view to group by this new property
    updateDatabaseView(dbPage.id, activeView.id, {
      groupByPropertyId: newPropId
    });
    setKanbanGroupBy(newPropId);
  };

  const getColCalculation = (propId: string) => {
    const calcType = colCalcs[propId] || 'none';
    if (calcType === 'none') return '';
    
    const prop = schema.properties.find(p => p.id === propId);
    const vals = processedRows.map(r => r.cells[propId]);
    
    if (calcType === 'count') {
      return `Count: ${vals.filter(v => v !== null && v !== undefined && v !== '').length}`;
    }
    
    if (prop?.type === 'checkbox') {
      const checkedCount = vals.filter(v => !!v).length;
      const total = vals.length;
      if (calcType === 'checked') return `Checked: ${checkedCount}`;
      if (calcType === 'unchecked') return `Unchecked: ${total - checkedCount}`;
      if (calcType === 'percent-checked') return `Checked: ${total ? Math.round((checkedCount / total) * 100) : 0}%`;
    }
    
    if (prop?.type === 'number') {
      const nums = vals.filter(v => v !== null && v !== undefined && v !== '').map(v => Number(v)).filter(v => !isNaN(v));
      if (nums.length === 0) return '0';
      if (calcType === 'sum') return `Sum: ${nums.reduce((a, b) => a + b, 0).toFixed(1)}`;
      if (calcType === 'avg') return `Avg: ${(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)}`;
      if (calcType === 'min') return `Min: ${Math.min(...nums)}`;
      if (calcType === 'max') return `Max: ${Math.max(...nums)}`;
    }
    return '';
  };

  const handleCellPopoverTagSelect = (rowId: string, propId: string, value: string, isMulti: boolean, currentVal: any) => {
    if (isMulti) {
      const arr = Array.isArray(currentVal) ? currentVal : [];
      const updated = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      updateDatabaseRowCell(dbPage.id, rowId, propId, updated);
    } else {
      updateDatabaseRowCell(dbPage.id, rowId, propId, value);
      setActiveCellEdit(null);
    }
  };

  const renderCellDisplay = (rowId: string, prop: DatabaseProperty, val: any) => {
    if (prop.type === 'checkbox') {
      return (
        <input 
          type="checkbox" 
          checked={!!val} 
          onChange={(e) => updateDatabaseRowCell(dbPage.id, rowId, prop.id, e.target.checked)} 
        />
      );
    }

    if (prop.type === 'select' || prop.type === 'status') {
      const opt = prop.options?.find(o => o.id === val);
      return (
        <span 
          style={{
            display: 'inline-flex',
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: opt?.color || 'var(--bg-tertiary)',
            color: val ? '#000' : 'var(--text-placeholder)',
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          {opt?.name || 'Empty'}
        </span>
      );
    }

    if (prop.type === 'multi-select') {
      const arr = Array.isArray(val) ? val : [];
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
          {arr.map(t => {
            const opt = prop.options?.find(o => o.id === t);
            return (
              <span key={t} style={{ display: 'inline-flex', padding: '1px 6px', borderRadius: '12px', backgroundColor: opt?.color || 'var(--bg-tertiary)', color: '#000', fontSize: '10px', fontWeight: 500 }}>
                {opt?.name || t}
              </span>
            );
          })}
          {arr.length === 0 && <span style={{ color: 'var(--text-placeholder)', fontSize: '12px' }}>Empty</span>}
        </div>
      );
    }

    if (prop.type === 'url' && val) {
      return <a href={val} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent-color)', fontSize: '12px', textDecoration: 'underline' }}>{val}</a>;
    }
    if (prop.type === 'email' && val) {
      return <a href={`mailto:${val}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--accent-color)', fontSize: '12px', textDecoration: 'underline' }}>{val}</a>;
    }
    if (prop.type === 'phone' && val) {
      return <a href={`tel:${val}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--accent-color)', fontSize: '12px' }}>{val}</a>;
    }

    return <span style={{ fontSize: '13px', color: val ? 'var(--text-primary)' : 'var(--text-placeholder)' }}>{val || 'Empty'}</span>;
  };

  // ---------------- TABLE VIEW RENDER ----------------
  const renderTableView = () => {
    const visibleProps = schema.properties.filter(p => isPropVisible(p.id));
    
    return (
      <div className="db-table-wrapper" style={{ marginTop: '12px', overflowX: 'auto' }}>
        <table className="db-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '40px' }} />
              {visibleProps.map((prop) => (
                <th key={prop.id} style={{ minWidth: '130px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{prop.name}</span>
                    {prop.id !== 'prop-name' && prop.id !== 'prop-title' && prop.id !== 'b-title' && (
                      <button 
                        className="db-prop-del-btn"
                        onClick={() => deleteDatabaseProperty(dbPage.id, prop.id)}
                        title="Delete column"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {/* Image 2: Add Column Header far right */}
              <th style={{ width: '40px', textAlign: 'center', background: 'var(--bg-tertiary)', borderLeft: '1px solid var(--border-color)' }}>
                <button 
                  onClick={() => setPropEditorOpen(true)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Add new column"
                >
                  <Plus size={14} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {processedRows.map((row) => (
              <tr key={row.id}>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    className="db-row-peek-trigger"
                    onClick={() => setActiveRowIdPeek(row.id)}
                    title="Open Page"
                  >
                    <Maximize2 size={12} />
                  </button>
                </td>
                {visibleProps.map((prop) => {
                  const val = row.cells[prop.id];
                  const isEditing = activeCellEdit?.rowId === row.id && activeCellEdit?.propId === prop.id;

                  return (
                    <td key={prop.id} style={{ position: 'relative' }}>
                      <div 
                        onClick={() => {
                          if (prop.type === 'checkbox') return;
                          setActiveCellEdit({ rowId: row.id, propId: prop.id });
                        }}
                        style={{ cursor: prop.type === 'checkbox' ? 'default' : 'pointer', minHeight: '22px', display: 'flex', alignItems: 'center' }}
                      >
                        {renderCellDisplay(row.id, prop, val)}
                      </div>

                      {/* Custom Float Popover Editor */}
                      {isEditing && (
                        <>
                          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setActiveCellEdit(null)} />
                          <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 999, minWidth: '220px', padding: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: 'var(--shadow-md)' }}>
                            
                            {/* Option list select / status popover */}
                            {(prop.type === 'select' || prop.type === 'status' || prop.type === 'multi-select') && (
                              <>
                                <input 
                                  type="text"
                                  placeholder="Filter tags..."
                                  value={tagSearchQuery}
                                  onChange={e => setTagSearchQuery(e.target.value)}
                                  style={{ width: '100%', padding: '5px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                />
                                <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                                  {prop.options?.filter(o => o.name.toLowerCase().includes(tagSearchQuery.toLowerCase())).map(o => {
                                    const isChecked = prop.type === 'multi-select' ? (Array.isArray(val) ? val.includes(o.id) : false) : val === o.id;
                                    return (
                                      <button
                                        key={o.id}
                                        onClick={() => handleCellPopoverTagSelect(row.id, prop.id, o.id, prop.type === 'multi-select', val)}
                                        style={{ border: 'none', background: isChecked ? 'var(--accent-light)' : 'transparent', width: '100%', display: 'flex', alignItems: 'center', gap: '6px', padding: '5px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '11px', textAlign: 'left' }}
                                      >
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: o.color }} />
                                        <span>{o.name}</span>
                                        {isChecked && <Check size={11} style={{ marginLeft: 'auto', color: 'var(--accent-color)' }} />}
                                      </button>
                                    );
                                  })}
                                </div>
                                {tagSearchQuery.trim() && (
                                  <button
                                    onClick={() => {
                                      const randColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                                      handleAddTagOption(prop, tagSearchQuery, randColor);
                                      setTagSearchQuery('');
                                    }}
                                    style={{ border: 'none', background: 'transparent', width: '100%', color: 'var(--accent-color)', fontSize: '11px', cursor: 'pointer', textAlign: 'left', padding: '6px 4px', fontWeight: 600 }}
                                  >
                                    + Create tag "{tagSearchQuery}"
                                  </button>
                                )}
                              </>
                            )}

                            {/* Date Picker Popover */}
                            {prop.type === 'date' && (
                              <input 
                                type="date"
                                value={val || ''}
                                onChange={e => {
                                  updateDatabaseRowCell(dbPage.id, row.id, prop.id, e.target.value);
                                  setActiveCellEdit(null);
                                }}
                                style={{ border: '1px solid var(--border-color)', padding: '5px', fontSize: '11px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                autoFocus
                              />
                            )}

                            {/* Text / Numeric Standard Input Popover */}
                            {prop.type !== 'select' && prop.type !== 'status' && prop.type !== 'multi-select' && prop.type !== 'date' && (
                              <input 
                                type={prop.type === 'number' ? 'number' : 'text'}
                                value={val || ''}
                                onChange={e => updateDatabaseRowCell(dbPage.id, row.id, prop.id, e.target.value)}
                                style={{ border: '1px solid var(--border-color)', padding: '5px', fontSize: '11px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                onKeyDown={e => e.key === 'Enter' && setActiveCellEdit(null)}
                                autoFocus
                              />
                            )}

                          </div>
                        </>
                      )}
                    </td>
                  );
                })}
                {/* Empty spacer under the Add Column Far right header */}
                <td style={{ borderLeft: '1px solid var(--border-color)' }} />
              </tr>
            ))}

            {/* Calculations Row footer */}
            <tr style={{ background: 'var(--bg-secondary)', fontWeight: 600 }}>
              <td style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-placeholder)' }}>Σ</td>
              {visibleProps.map(prop => (
                <td key={`calc-${prop.id}`} style={{ fontSize: '11px', position: 'relative' }}>
                  <div 
                    onClick={() => setActiveCalcSelector(activeCalcSelector === prop.id ? null : prop.id)}
                    style={{ cursor: 'pointer', minHeight: '18px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                  >
                    {getColCalculation(prop.id) || <span style={{ opacity: 0.35 }}>Calculate</span>}
                  </div>
                  
                  {activeCalcSelector === prop.id && (
                    <>
                      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setActiveCalcSelector(null)} />
                      <div className="glass" style={{ position: 'absolute', bottom: '100%', left: 0, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', zIndex: 1000, display: 'flex', flexDirection: 'column', width: '130px', boxShadow: 'var(--shadow-md)' }}>
                        <button onClick={() => { setColCalcs({...colCalcs, [prop.id]: 'none'}); setActiveCalcSelector(null); }} className="calc-opt-btn">None</button>
                        <button onClick={() => { setColCalcs({...colCalcs, [prop.id]: 'count'}); setActiveCalcSelector(null); }} className="calc-opt-btn">Count</button>
                        {prop.type === 'checkbox' && (
                          <>
                            <button onClick={() => { setColCalcs({...colCalcs, [prop.id]: 'checked'}); setActiveCalcSelector(null); }} className="calc-opt-btn">Checked</button>
                            <button onClick={() => { setColCalcs({...colCalcs, [prop.id]: 'unchecked'}); setActiveCalcSelector(null); }} className="calc-opt-btn">Unchecked</button>
                            <button onClick={() => { setColCalcs({...colCalcs, [prop.id]: 'percent-checked'}); setActiveCalcSelector(null); }} className="calc-opt-btn">Percent Checked</button>
                          </>
                        )}
                        {prop.type === 'number' && (
                          <>
                            <button onClick={() => { setColCalcs({...colCalcs, [prop.id]: 'sum'}); setActiveCalcSelector(null); }} className="calc-opt-btn">Sum</button>
                            <button onClick={() => { setColCalcs({...colCalcs, [prop.id]: 'avg'}); setActiveCalcSelector(null); }} className="calc-opt-btn">Average</button>
                            <button onClick={() => { setColCalcs({...colCalcs, [prop.id]: 'min'}); setActiveCalcSelector(null); }} className="calc-opt-btn">Min</button>
                            <button onClick={() => { setColCalcs({...colCalcs, [prop.id]: 'max'}); setActiveCalcSelector(null); }} className="calc-opt-btn">Max</button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </td>
              ))}
              <td style={{ borderLeft: '1px solid var(--border-color)' }} />
            </tr>
          </tbody>
        </table>
        
        {/* Bottom blank row trigger */}
        <div 
          onClick={() => handleAddRow()}
          style={{ padding: '8px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-placeholder)', fontSize: '13px', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Plus size={14} />
          <span>+ Add new row</span>
        </div>
      </div>
    );
  };

  // ---------------- BOARD VIEW RENDER ----------------
  const renderBoardView = () => {
    const groupByPropId = kanbanGroupBy || activeView.groupByPropertyId || 'prop-status';
    const groupProp = schema.properties.find(p => p.id === groupByPropId);
    
    // Image 3: If no valid status/select column is present, display setup button helper
    if (!groupProp || (groupProp.type !== 'select' && groupProp.type !== 'status')) {
      return (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
          <Info size={24} style={{ color: 'var(--accent-color)' }} />
          <div style={{ fontWeight: 600 }}>Kanban Board Status Option Missing</div>
          <p style={{ fontSize: '13px', margin: 0, maxWidth: '400px' }}>To use the Kanban Board layout, you need a select/status property to group cards by.</p>
          <button 
            className="cover-btn" 
            onClick={enableKanbanStatuses}
            style={{ background: 'var(--accent-color)', color: 'white', border: 'none', fontWeight: 600 }}
          >
            Enable Board View (Add Status Property)
          </button>
        </div>
      );
    }

    const columns = groupProp.options || [];
    const visibleProps = schema.properties.filter(p => p.id !== schema.properties[0]?.id && isPropVisible(p.id));

    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>GROUP BY:</span>
          <select 
            value={groupByPropId}
            onChange={(e) => setKanbanGroupBy(e.target.value)}
            style={{ padding: '2px 6px', fontSize: '11px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}
          >
            {schema.properties.filter(p => p.type === 'select' || p.type === 'status').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="db-kanban-board">
          {columns.map((col) => {
            const colCards = processedRows.filter(r => r.cells[groupByPropId] === col.id);
            const isDragOver = dragOverColId === col.id;

            return (
              <div 
                key={col.id} 
                className="db-kanban-column"
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={() => handleDrop(col.id)}
              >
                <div className="db-kanban-column-header">
                  <span className="db-kanban-column-tag" style={{ backgroundColor: col.color || 'var(--bg-tertiary)', color: '#000', fontWeight: 600 }}>
                    {col.name} ({colCards.length})
                  </span>
                  <button 
                    className="db-col-add-quick"
                    onClick={() => {
                      const rowId = handleAddRow({ [groupByPropId]: col.id });
                      setActiveRowIdPeek(rowId);
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className={`db-kanban-cards-list ${isDragOver ? 'dragover' : ''}`} style={{ minHeight: '200px' }}>
                  {colCards.map((card) => {
                    const titlePropId = schema.properties[0]?.id || 'prop-name';
                    const titleText = card.cells[titlePropId] || 'Untitled Item';
                    const cardBgColor = card.cells['row-color'] || 'var(--bg-secondary)';

                    return (
                      <div 
                        key={card.id}
                        className="db-kanban-card"
                        draggable
                        onDragStart={() => handleDragStart(card.id)}
                        onClick={() => setActiveRowIdPeek(card.id)}
                        style={{ backgroundColor: cardBgColor }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.3 }}>{titleText}</span>
                          <Maximize2 size={11} style={{ opacity: 0.5 }} />
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {visibleProps.map(prop => {
                            const pVal = card.cells[prop.id];
                            if (!pVal) return null;
                            return (
                              <span 
                                key={prop.id} 
                                style={{ 
                                  fontSize: '10px', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  backgroundColor: (prop.type === 'select' || prop.type === 'status') ? (prop.options?.find(o => o.id === pVal)?.color || 'var(--bg-tertiary)') : 'var(--bg-tertiary)',
                                  color: (prop.type === 'select' || prop.type === 'status') ? '#000' : 'var(--text-muted)'
                                }}
                              >
                                {(prop.type === 'select' || prop.type === 'status') ? prop.options?.find(o => o.id === pVal)?.name : pVal}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {colCards.length === 0 && (
                    <div className="db-kanban-empty">Drop cards here</div>
                  )}
                </div>

                <button
                  className="db-col-add-card-btn"
                  onClick={() => {
                    const rowId = handleAddRow({ [groupByPropId]: col.id });
                    setActiveRowIdPeek(rowId);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    marginTop: '8px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--border-radius-md)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textAlign: 'left'
                  }}
                >
                  <Plus size={14} />
                  <span>Add card</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ---------------- CALENDAR VIEW RENDER ----------------
  const renderCalendarView = () => {
    const dateProp = schema.properties.find(p => p.type === 'date') || { id: 'prop-due', name: 'Due Date' };
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const daysGrid = [];
    for (let i = 0; i < firstDayIndex; i++) {
      daysGrid.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      daysGrid.push(i);
    }

    const changeMonth = (val: number) => {
      setCurrentDate(new Date(year, month + val, 1));
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formatDayString = (dayNum: number) => {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(dayNum).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    };

    const todayStr = new Date().toISOString().split('T')[0];

    return (
      <div className="db-calendar-container" style={{ marginTop: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
        <div className="db-calendar-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
          <h4 className="heading-font" style={{ margin: 0, fontSize: '15px' }}>{monthNames[month]} {year}</h4>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="cover-btn" style={{ padding: '3px 8px' }} onClick={() => changeMonth(-1)}><ChevronLeft size={14} /></button>
            <button className="cover-btn" style={{ padding: '3px 8px', fontSize: '12px' }} onClick={() => setCurrentDate(new Date())}>Today</button>
            <button className="cover-btn" style={{ padding: '3px 8px' }} onClick={() => changeMonth(1)}><ChevronRight size={14} /></button>
          </div>
        </div>

        <div className="db-calendar-week-days" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        <div className="db-calendar-grid" style={{ gridTemplateRows: 'repeat(5, minmax(100px, auto))', background: 'var(--border-color)' }}>
          {daysGrid.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="db-calendar-cell empty" style={{ background: 'var(--bg-primary)', opacity: 0.5 }} />;
            }

            const dayStr = formatDayString(day);
            const dayCards = processedRows.filter(r => r.cells[dateProp.id] === dayStr);
            const isToday = dayStr === todayStr;

            return (
              <div 
                key={`day-${day}`} 
                className="db-calendar-cell"
                style={{ background: 'var(--bg-primary)', minHeight: '100px', display: 'flex', flexDirection: 'column', position: 'relative' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedCardId) {
                    updateDatabaseRowCell(dbPage.id, draggedCardId, dateProp.id, dayStr);
                    setDraggedCardId(null);
                  }
                }}
                onClick={() => {
                  const newId = handleAddRow({ [dateProp.id]: dayStr });
                  setActiveRowIdPeek(newId);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
                  <div 
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: isToday ? 'var(--accent-color)' : 'transparent',
                      color: isToday ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    {day}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', flexGrow: 1, padding: '4px', marginTop: '2px' }}>
                  {dayCards.map(c => {
                    const titlePropId = schema.properties[0]?.id || 'prop-name';
                    const titleText = c.cells[titlePropId] || 'Untitled';
                    const customColor = c.cells['row-color'] || 'var(--accent-color)';

                    return (
                      <div 
                        key={c.id} 
                        className="db-calendar-card-pill"
                        draggable
                        onDragStart={() => handleDragStart(c.id)}
                        style={{ backgroundColor: customColor, color: '#fff', borderLeft: '3px solid rgba(0,0,0,0.15)', cursor: 'grab', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRowIdPeek(c.id);
                        }}
                      >
                        {titleText}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ---------------- TIMELINE VIEW RENDER ----------------
  const renderTimelineView = () => {
    const dateProp = schema.properties.find(p => p.type === 'date') || { id: 'prop-due', name: 'Due Date' };
    
    // Zoom configurations
    const columnsCount = timelineZoom === 'days' ? 14 : timelineZoom === 'weeks' ? 8 : 6;
    const dateObjects: Date[] = [];
    const headers: string[] = [];
    
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 3);

    for (let i = 0; i < columnsCount; i++) {
      const d = new Date(baseDate);
      if (timelineZoom === 'days') {
        d.setDate(d.getDate() + i);
        headers.push(`${d.getMonth() + 1}/${d.getDate()}`);
      } else if (timelineZoom === 'weeks') {
        d.setDate(d.getDate() + i * 7);
        headers.push(`W${i + 1}`);
      } else {
        d.setMonth(d.getMonth() + i);
        headers.push(d.toLocaleString('default', { month: 'short' }));
      }
      dateObjects.push(d);
    }

    const formatDateString = (d: Date) => {
      return d.toISOString().split('T')[0];
    };

    const handleGanttDrag = (e: React.MouseEvent, rowId: string, type: 'move' | 'start' | 'end', startVal: string, endVal: string) => {
      e.preventDefault();
      const startX = e.clientX;
      const initialStart = new Date(startVal || new Date());
      const initialEnd = new Date(endVal || initialStart);
      
      const handleMouseMove = (mv: MouseEvent) => {
        const diffX = mv.clientX - startX;
        const daysDiff = Math.round(diffX / 60);
        if (daysDiff === 0) return;
        
        let nextStart = new Date(initialStart);
        let nextEnd = new Date(initialEnd);
        
        if (type === 'move') {
          nextStart.setDate(nextStart.getDate() + daysDiff);
          nextEnd.setDate(nextEnd.getDate() + daysDiff);
        } else if (type === 'start') {
          nextStart.setDate(nextStart.getDate() + daysDiff);
          if (nextStart > nextEnd) {
            nextStart = new Date(nextEnd);
          }
        } else if (type === 'end') {
          nextEnd.setDate(nextEnd.getDate() + daysDiff);
          if (nextEnd < nextStart) {
            nextEnd = new Date(nextStart);
          }
        }
        
        const startStr = formatDateString(nextStart);
        const endStr = formatDateString(nextEnd);
        const newVal = startStr === endStr ? startStr : `${startStr} to ${endStr}`;
        updateDatabaseRowCell(dbPage.id, rowId, dateProp.id, newVal);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ZOOM:</span>
          {(['days', 'weeks', 'months'] as const).map(z => (
            <button 
              key={z} 
              className={`cover-btn ${timelineZoom === z ? 'active' : ''}`}
              style={{ padding: '2px 8px', fontSize: '10px', textTransform: 'capitalize' }}
              onClick={() => setTimelineZoom(z)}
            >
              {z}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items</div>
            {processedRows.map(row => {
              const nameProp = schema.properties[0]?.id || 'prop-name';
              return (
                <div key={row.id} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => setActiveRowIdPeek(row.id)}>
                  {row.cells[nameProp] || 'Untitled Item'}
                </div>
              );
            })}
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnsCount}, 60px)`, borderBottom: '1px solid var(--border-color)', minWidth: `${columnsCount * 60}px` }}>
              {headers.map((lbl, idx) => (
                <div key={`lbl-${idx}`} style={{ padding: '8px 4px', fontSize: '10px', fontWeight: 700, textAlign: 'center', color: 'var(--text-muted)', borderRight: '1px solid var(--border-color)' }}>
                  {lbl}
                </div>
              ))}
            </div>

            {processedRows.map(row => {
              const rowDate = row.cells[dateProp.id];
              let start = '';
              let end = '';
              if (rowDate) {
                if (String(rowDate).includes(' to ')) {
                  const parts = String(rowDate).split(' to ');
                  start = parts[0]?.trim();
                  end = parts[1]?.trim();
                } else {
                  start = String(rowDate).trim();
                  end = start;
                }
              }

              let startIdx = -1;
              let endIdx = -1;

              if (start && end) {
                const startD = new Date(start);
                const endD = new Date(end);
                
                startIdx = dateObjects.findIndex(d => formatDateString(d) === start);
                endIdx = dateObjects.findIndex(d => formatDateString(d) === end);
                
                const gridStart = dateObjects[0];
                const gridEnd = dateObjects[dateObjects.length - 1];
                
                if (startIdx === -1 && startD <= gridEnd) {
                  if (startD < gridStart) startIdx = 0;
                }
                if (endIdx === -1 && endD >= gridStart) {
                  if (endD > gridEnd) endIdx = columnsCount - 1;
                }
              }

              const customColor = row.cells['row-color'] || 'var(--accent-color)';

              return (
                <div key={`gantt-${row.id}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${columnsCount}, 60px)`, height: '39px', position: 'relative', borderBottom: '1px solid var(--border-color)', minWidth: `${columnsCount * 60}px` }}>
                  {dateObjects.map((_, idx) => (
                    <div key={`line-${idx}`} style={{ borderRight: '1px solid var(--border-color)', height: '100%' }} />
                  ))}

                  {startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: `${startIdx * 60 + 4}px`,
                        width: `${(endIdx - startIdx + 1) * 60 - 8}px`,
                        top: '6px',
                        height: '27px',
                        borderRadius: '6px',
                        backgroundColor: customColor,
                        opacity: 0.9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 600,
                        boxShadow: 'var(--shadow-sm)',
                        padding: '0 8px',
                        cursor: 'grab',
                        userSelect: 'none',
                        border: '1px solid rgba(0,0,0,0.1)',
                        zIndex: 2
                      }}
                      onMouseDown={(e) => handleGanttDrag(e, row.id, 'move', start, end)}
                      title={`Drag to shift dates (${start} to ${end})`}
                    >
                      {/* Left Resize Handle */}
                      <div 
                        style={{
                          width: '6px',
                          height: '100%',
                          cursor: 'ew-resize',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.7,
                          marginLeft: '-6px',
                          padding: '0 4px',
                          fontWeight: 'bold'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleGanttDrag(e, row.id, 'start', start, end);
                        }}
                      >
                        ⋮
                      </div>

                      {/* Title inside bar */}
                      <span 
                        style={{
                          flexGrow: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textAlign: 'center',
                          pointerEvents: 'none',
                          padding: '0 4px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          fontSize: '10px'
                        }}
                      >
                        {row.cells[schema.properties[0]?.id || 'prop-name'] || 'Untitled Item'}
                      </span>

                      {/* Right Resize Handle */}
                      <div 
                        style={{
                          width: '6px',
                          height: '100%',
                          cursor: 'ew-resize',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.7,
                          marginRight: '-6px',
                          padding: '0 4px',
                          fontWeight: 'bold'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleGanttDrag(e, row.id, 'end', start, end);
                        }}
                      >
                        ⋮
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ---------------- DASHBOARD VIEW RENDER ----------------
  const renderDashboardView = () => {
    const totalCount = rows.length;
    const numProps = schema.properties.filter(p => p.type === 'number');
    const selectProps = schema.properties.filter(p => p.type === 'select' || p.type === 'status' || p.type === 'text');
    const dateProps = schema.properties.filter(p => p.type === 'date');
    
    const selectedGroup = dashboardGroupProp || selectProps[0]?.id || '';
    const selectedMetric = dashboardMetricProp || numProps[0]?.id || '';

    const groupProp = schema.properties.find(p => p.id === selectedGroup);
    const metricProp = schema.properties.find(p => p.id === selectedMetric);

    const statsSummary = numProps.map(p => {
      const vals = rows.map(r => Number(r.cells[p.id])).filter(v => !isNaN(v));
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length > 0 ? (sum / vals.length) : 0;
      const max = vals.length > 0 ? Math.max(...vals) : 0;
      const min = vals.length > 0 ? Math.min(...vals) : 0;
      return { id: p.id, name: p.name, sum, avg: Number(avg.toFixed(1)), max, min };
    });

    const groupedData: { label: string; value: number; color?: string }[] = [];
    if (groupProp) {
      if (groupProp.type === 'select' || groupProp.type === 'status') {
        const options = groupProp.options || [];
        options.forEach(opt => {
          const matchingRows = rows.filter(r => r.cells[groupProp.id] === opt.id);
          let val = 0;
          if (dashboardMetricType === 'count') {
            val = matchingRows.length;
          } else if (dashboardMetricType === 'sum' && metricProp) {
            val = matchingRows.map(r => Number(r.cells[metricProp.id])).filter(v => !isNaN(v)).reduce((a, b) => a + b, 0);
          } else if (dashboardMetricType === 'avg' && metricProp) {
            const numbers = matchingRows.map(r => Number(r.cells[metricProp.id])).filter(v => !isNaN(v));
            val = numbers.length ? (numbers.reduce((a, b) => a + b, 0) / numbers.length) : 0;
          }
          groupedData.push({ label: opt.name, value: Number(val.toFixed(1)), color: opt.color });
        });
      } else {
        const uniqueVals = Array.from(new Set(rows.map(r => String(r.cells[groupProp.id] || '')).filter(Boolean)));
        uniqueVals.forEach(uText => {
          const matchingRows = rows.filter(r => String(r.cells[groupProp.id] || '') === uText);
          let val = 0;
          if (dashboardMetricType === 'count') {
            val = matchingRows.length;
          } else if (dashboardMetricType === 'sum' && metricProp) {
            val = matchingRows.map(r => Number(r.cells[metricProp.id])).filter(v => !isNaN(v)).reduce((a, b) => a + b, 0);
          } else if (dashboardMetricType === 'avg' && metricProp) {
            const numbers = matchingRows.map(r => Number(r.cells[metricProp.id])).filter(v => !isNaN(v));
            val = numbers.length ? (numbers.reduce((a, b) => a + b, 0) / numbers.length) : 0;
          }
          groupedData.push({ label: uText, value: Number(val.toFixed(1)) });
        });
      }
    }

    const chartColorsList = [
      '#7053ff', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4',
      '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6', '#64748b'
    ];

    const chartLabels = groupedData.map(d => d.label);
    const chartValues = groupedData.map(d => d.value);
    const chartBgColors = groupedData.map((d, i) => d.color || chartColorsList[i % chartColorsList.length]);

    const breakdownData = {
      labels: chartLabels,
      datasets: [
        {
          label: dashboardMetricType === 'count' ? 'Record Count' : `${dashboardMetricType.toUpperCase()} of ${metricProp?.name || ''}`,
          data: chartValues,
          backgroundColor: chartBgColors,
          borderWidth: 1,
          hoverOffset: 4
        }
      ]
    };

    const barOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { cornerRadius: 6 }
      },
      scales: {
        x: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { color: 'rgba(128,128,128,0.1)' }, beginAtZero: true }
      }
    };

    const doughnutOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { color: 'var(--text-primary)', boxWidth: 10, font: { size: 10 } } },
        tooltip: { cornerRadius: 6 }
      }
    };

    let timeLabels: string[] = [];
    let timeValues: number[] = [];
    if (dateProps.length > 0) {
      const activeDateProp = dateProps[0];
      const dateMap: Record<string, number> = {};
      
      rows.forEach(r => {
        const rawDate = r.cells[activeDateProp.id];
        if (rawDate) {
          const dStr = String(rawDate).split(' to ')[0]?.trim();
          if (dStr) {
            dateMap[dStr] = (dateMap[dStr] || 0) + 1;
          }
        }
      });
      
      const sortedDates = Object.keys(dateMap).sort();
      timeLabels = sortedDates.map(d => {
        const parts = d.split('-');
        return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d;
      });
      timeValues = sortedDates.map(d => dateMap[d]);
    }

    const timeSeriesData = {
      labels: timeLabels.length > 0 ? timeLabels : ['No Date Data'],
      datasets: [
        {
          label: 'Records added',
          data: timeValues.length > 0 ? timeValues : [0],
          borderColor: 'var(--accent-color)',
          backgroundColor: 'rgba(112, 83, 255, 0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 4
        }
      ]
    };

    const lineOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { cornerRadius: 6 }
      },
      scales: {
        x: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: 'var(--text-muted)', font: { size: 10 }, stepSize: 1 }, grid: { color: 'rgba(128,128,128,0.1)' }, beginAtZero: true }
      }
    };

    return (
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
        
        {/* KPI Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          
          <div className="glass" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(112, 83, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)', flexShrink: 0 }}>
              <LayoutGrid size={20} />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Rows</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{totalCount}</div>
            </div>
          </div>

          {statsSummary.slice(0, 3).map((stat, idx) => {
            const colors = ['var(--success-color)', 'var(--warning-color)', 'var(--danger-color)'];
            const lightBgs = ['rgba(165,190,140,0.15)', 'rgba(235,203,139,0.15)', 'rgba(191,97,106,0.15)'];
            return (
              <div key={stat.id} className="glass" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: lightBgs[idx % 3], display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors[idx % 3], flexShrink: 0 }}>
                  <BarChart2 size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px', display: 'block' }}>Avg {stat.name}</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{stat.avg}</div>
                  <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>Sum: {stat.sum.toLocaleString()}</span>
                </div>
              </div>
            );
          })}

          {statsSummary.length === 0 && (
            <div className="glass" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-placeholder)', fontSize: '12px', fontStyle: 'italic', flexGrow: 1 }}>
              Add a 'Number' column (like Price, Quantity) to see mathematical KPIs here.
            </div>
          )}
        </div>

        {selectProps.length > 0 && (
          <div className="glass" style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)' }}><Settings size={13} /> Dashboard Query Builder</span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Group By:</span>
              <select 
                value={selectedGroup} 
                onChange={e => setDashboardGroupProp(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', outline: 'none' }}
              >
                {selectProps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calculation:</span>
              <select 
                value={dashboardMetricType}
                onChange={e => setDashboardMetricType(e.target.value as any)}
                style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', outline: 'none' }}
              >
                <option value="count">Count (number of items)</option>
                <option value="sum">Sum of values</option>
                <option value="avg">Average of values</option>
              </select>
            </div>

            {dashboardMetricType !== 'count' && numProps.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Numeric Property:</span>
                <select 
                  value={selectedMetric}
                  onChange={e => setDashboardMetricProp(e.target.value)}
                  style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', outline: 'none' }}
                >
                  {numProps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {groupedData.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            
            {/* Chart 1: Bar Aggregations */}
            <div className="glass" style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '260px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Group Aggregations (Bar Chart)</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{groupProp?.name}</span>
              </div>
              <div style={{ flexGrow: 1, position: 'relative', height: '200px' }}>
                <Bar data={breakdownData} options={barOptions} />
              </div>
            </div>

            {/* Chart 2: Doughnut Breakdown */}
            <div className="glass" style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '260px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Breakdown Percentage (Doughnut)</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{groupProp?.name}</span>
              </div>
              <div style={{ flexGrow: 1, position: 'relative', height: '200px' }}>
                <Doughnut data={breakdownData} options={doughnutOptions} />
              </div>
            </div>

            {/* Chart 3: Time Series line chart */}
            {dateProps.length > 0 && (
              <div className="glass" style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '250px', gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Session Records Creation Timeline</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Indexed by: {dateProps[0]?.name}</span>
                </div>
                <div style={{ flexGrow: 1, position: 'relative', height: '180px' }}>
                  <Line data={timeSeriesData} options={lineOptions} />
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="glass" style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-placeholder)', fontStyle: 'italic' }}>
            No groupings available to render charts.
          </div>
        )}
      </div>
    );
  };

  // ---------------- MAP VIEW RENDER ----------------
  const renderMapView = () => {
    const textProps = schema.properties.filter(p => p.type === 'text');
    const addressProp = textProps.find(p => p.name.toLowerCase().includes('address') || p.name.toLowerCase().includes('location')) || textProps[0];
    
    const pins = rows.map(r => {
      const name = r.cells[schema.properties[0]?.id] || 'Untitled Pinned Item';
      const address = addressProp ? r.cells[addressProp.id] : '';
      return { id: r.id, name, address };
    }).filter(p => p.address);

    const handleMapSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!mapSearchQuery.trim()) return;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(mapSearchQuery)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([lat, lon], 14, { animate: true });
            
            const L = (window as any).L;
            const tempMarker = L.marker([lat, lon], {
              icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })
            }).addTo(leafletMapRef.current);
            
            const popupDiv = document.createElement('div');
            popupDiv.innerHTML = `
              <div style="font-weight: 700; font-size: 13px;">${mapSearchQuery}</div>
              <div style="font-size: 10px; color: #666; margin: 4px 0 8px;">Found address. Do you want to add this place to your database?</div>
              <button id="temp-add-btn" style="
                background: #10b981;
                color: white;
                border: none;
                padding: 4px 8px;
                font-size: 11px;
                font-weight: 600;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
              ">Add Place to List</button>
            `;
            tempMarker.bindPopup(popupDiv).openPopup();
            
            setTimeout(() => {
              const btn = document.getElementById('temp-add-btn');
              if (btn) {
                btn.onclick = () => {
                  const titlePropId = schema.properties[0]?.id || 'prop-name';
                  const rowData: Record<string, any> = {
                    [titlePropId]: mapSearchQuery,
                    [addressProp.id]: mapSearchQuery
                  };
                  
                  const cleanAddr = mapSearchQuery.toLowerCase();
                  setGeocodedCoords(prev => ({
                    ...prev,
                    [cleanAddr]: [lat, lon]
                  }));
                  
                  addDatabaseRow(dbPage.id, rowData);
                  tempMarker.remove();
                };
              }
            }, 100);
          }
        }
      } catch (err) {
        console.error("Map search failed", err);
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        
        {/* Search Map Bar */}
        <form onSubmit={handleMapSearch} className="glass" style={{ display: 'flex', gap: '8px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', alignItems: 'center' }}>
          <MapPin size={16} style={{ color: 'var(--accent-color)' }} />
          <input 
            type="text" 
            placeholder="Search any place in the world to pan and drop a pin..." 
            value={mapSearchQuery}
            onChange={e => setMapSearchQuery(e.target.value)}
            className="search-input"
            style={{ flexGrow: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--text-primary)' }}
          />
          <button type="submit" className="cover-btn" style={{ padding: '4px 12px', background: 'var(--accent-color)', color: 'white', fontWeight: 600 }}>Search Map</button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: mapCollapsed ? '1fr' : '1.3fr 260px', gap: '12px', minHeight: '350px', position: 'relative' }}>
          
          {/* Map canvas */}
          <div style={{ position: 'relative', height: '100%', minHeight: '350px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '350px', zIndex: 1 }} />
            
            <button
              onClick={() => setMapCollapsed(!mapCollapsed)}
              className="cover-btn"
              style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, padding: '6px', borderRadius: '50%' }}
              title={mapCollapsed ? "Expand Pins List" : "Collapse Pins List"}
            >
              {mapCollapsed ? <ExpandIcon size={14} /> : <CollapseIcon size={14} />}
            </button>
          </div>

          {/* Sidebar */}
          {!mapCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', maxHeight: '350px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PINNED PLACES ({pins.length})</span>
              {pins.map(p => (
                <div 
                  key={p.id} 
                  className="glass hover-bg"
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => {
                    setActiveRowIdPeek(p.id);
                    if (leafletMapRef.current) {
                      const coords = resolveCoords(p.address);
                      leafletMapRef.current.setView(coords, 14, { animate: true });
                    }
                  }}
                >
                  <MapPin size={14} style={{ color: 'red' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '200px', whiteSpace: 'nowrap' }}>{p.address}</div>
                  </div>
                </div>
              ))}
              {pins.length === 0 && (
                <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-placeholder)', textAlign: 'center', padding: '20px' }}>
                  Click on the map or search places to drop a pin marker.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------------- GALLERY GRID VIEW ----------------
  const renderGalleryView = () => {
    const visibleProps = schema.properties.filter(p => p.id !== schema.properties[0]?.id && isPropVisible(p.id));
    const cardSizePx = galleryCardSize === 'sm' ? '150px' : galleryCardSize === 'lg' ? '250px' : '200px';

    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>CARD SIZE:</span>
          {(['sm', 'md', 'lg'] as const).map(s => (
            <button 
              key={s} 
              className={`cover-btn ${galleryCardSize === s ? 'active' : ''}`}
              style={{ padding: '2px 8px', fontSize: '10px', textTransform: 'uppercase' }}
              onClick={() => setGalleryCardSize(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div 
          className="db-gallery-grid" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(auto-fill, minmax(${cardSizePx}, 1fr))`, 
            gap: '16px', 
            padding: '4px',
            backgroundColor: 'var(--bg-primary)' 
          }}
        >
          {processedRows.map(row => {
            const titlePropId = schema.properties[0]?.id || 'prop-name';
            const titleText = row.cells[titlePropId] || 'Untitled Item';
            const imageVal = row.cells['prop-cover'] || row.cells['cover'] || '';
            const hasCover = !!imageVal;
            const cardBgColor = row.cells['row-color'] || 'var(--bg-secondary)';

            return (
              <div 
                key={row.id} 
                className="db-gallery-card glass hover-bg"
                style={{ 
                  borderRadius: 'var(--border-radius-lg)', 
                  overflow: 'hidden', 
                  border: '1px solid var(--border-color)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  minHeight: '180px',
                  backgroundColor: cardBgColor
                }}
                onClick={() => setActiveRowIdPeek(row.id)}
              >
                <div 
                  style={{ 
                    height: '90px', 
                    background: hasCover 
                      ? `url("${imageVal}") center/cover no-repeat` 
                      : 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-tertiary) 100%)', 
                    position: 'relative' 
                  }} 
                />
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', lineHeight: 1.3 }}>{titleText}</span>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                    {visibleProps.map(prop => {
                      const pVal = row.cells[prop.id];
                      if (!pVal || prop.type === 'checkbox') return null;
                      return (
                        <span 
                          key={prop.id} 
                          style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            backgroundColor: (prop.type === 'select' || prop.type === 'status') ? (prop.options?.find(o => o.id === pVal)?.color || 'var(--bg-tertiary)') : 'var(--bg-tertiary)',
                            color: (prop.type === 'select' || prop.type === 'status') ? '#000' : 'var(--text-muted)'
                          }}
                        >
                          {(prop.type === 'select' || prop.type === 'status') ? prop.options?.find(o => o.id === pVal)?.name : pVal}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div 
            className="db-gallery-card glass hover-bg"
            style={{ 
              borderRadius: 'var(--border-radius-lg)', 
              border: '1px dashed var(--border-color)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '180px', 
              flexDirection: 'column', 
              color: 'var(--text-muted)',
              background: 'transparent'
            }}
            onClick={() => handleAddRow()}
          >
            <Plus size={24} style={{ marginBottom: '6px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Add Card</span>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- LIST VIEW RENDER ----------------
  const renderListView = () => {
    const visibleProps = schema.properties.filter(p => p.id !== schema.properties[0]?.id && isPropVisible(p.id));

    return (
      <div className="db-list-container" style={{ padding: '4px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--bg-primary)', marginTop: '12px' }}>
        {processedRows.map(row => {
          const titlePropId = schema.properties[0]?.id || 'prop-name';
          const titleText = row.cells[titlePropId] || 'Untitled Item';
          const rowBgColor = row.cells['row-color'] || 'var(--bg-primary)';

          return (
            <div 
              key={row.id} 
              className="glass hover-bg"
              style={{ 
                padding: '10px 16px', 
                borderRadius: 'var(--border-radius-md)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                cursor: 'pointer', 
                border: '1px solid var(--border-color)',
                backgroundColor: rowBgColor
              }}
              onClick={() => setActiveRowIdPeek(row.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>📄</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{titleText}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {visibleProps.map(prop => {
                  const pVal = row.cells[prop.id];
                  if (!pVal) return null;
                  return (
                    <span 
                      key={prop.id} 
                      style={{ 
                        fontSize: '11px', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        backgroundColor: (prop.type === 'select' || prop.type === 'status') ? (prop.options?.find(o => o.id === pVal)?.color || 'var(--bg-tertiary)') : 'var(--bg-tertiary)',
                        color: (prop.type === 'select' || prop.type === 'status') ? '#000' : 'var(--text-muted)'
                      }}
                    >
                      {(prop.type === 'select' || prop.type === 'status') ? prop.options?.find(o => o.id === pVal)?.name : pVal}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
        <button className="cover-btn" onClick={() => handleAddRow()} style={{ width: 'fit-content', marginTop: '4px' }}>
          + Add new item
        </button>
      </div>
    );
  };

  // ---------------- TIMELINE FEED VIEW ----------------
  const renderFeedView = () => {
    return (
      <div className="db-feed-container" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-primary)', marginTop: '12px' }}>
        {processedRows.map((row, idx) => {
          const titlePropId = schema.properties[0]?.id || 'prop-name';
          const titleText = row.cells[titlePropId] || 'Untitled Entry';
          const dateVal = row.cells['prop-due'] || row.cells['date'] || 'Today';

          return (
            <div 
              key={row.id} 
              className="db-feed-item"
              style={{ display: 'flex', gap: '16px', position: 'relative' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', border: '2px solid var(--bg-primary)' }} />
                {idx < processedRows.length - 1 && <div style={{ width: '2px', flexGrow: 1, backgroundColor: 'var(--border-color)', margin: '4px 0' }} />}
              </div>
              
              <div 
                className="glass hover-bg"
                style={{ flexGrow: 1, padding: '14px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                onClick={() => setActiveRowIdPeek(row.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{titleText}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-placeholder)' }}>{dateVal}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Logged database record activity. Click to read inner sub-blocks and collaborative logs.
                </p>
              </div>
            </div>
          );
        })}
        {processedRows.length === 0 && (
          <div style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--text-placeholder)', padding: '20px' }}>Feed is empty.</div>
        )}
        <button className="cover-btn" onClick={() => handleAddRow()} style={{ width: 'fit-content' }}>
          + Post new entry
        </button>
      </div>
    );
  };

  // ---------------- FORM VIEW RENDER ----------------
  const renderFormView = () => {
    const formTitle = dbPage.title || 'Database Intake Form';
    const formProps = schema.properties;
    const requiredProps = JSON.parse(dbPage.customProperties?.requiredProps || '[]') as string[];
    const titlePropId = schema.properties[0]?.id;

    const handleFormChange = (propId: string, val: any) => {
      setFormResponses({ ...formResponses, [propId]: val });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Check required validation
      for (const prop of formProps) {
        const isRequired = requiredProps.includes(prop.id) || prop.id === titlePropId;
        const val = formResponses[prop.id];
        if (isRequired) {
          if (val === undefined || val === null || String(val).trim() === '' || (Array.isArray(val) && val.length === 0)) {
            showToast(`"${prop.name}" is a required question.`, 'error');
            return;
          }
        }
      }

      const newRowCells: Record<string, any> = {};
      formProps.forEach(p => {
        const val = formResponses[p.id];
        if (val !== undefined) {
          newRowCells[p.id] = val;
        } else {
          newRowCells[p.id] = p.type === 'checkbox' ? false : p.type === 'multi-select' ? [] : null;
        }
      });
      addDatabaseRow(dbPage.id, newRowCells);
      setFormResponses({});
      setFormSubmitted(true);
      showToast("Response successfully submitted!", "success");
    };

    const renameOption = (prop: DatabaseProperty, optId: string, nextName: string) => {
      const nextOpts = (prop.options || []).map(o => o.id === optId ? { ...o, name: nextName } : o);
      updateDatabaseProperty(dbPage.id, prop.id, { options: nextOpts });
    };

    const changeOptionColor = (prop: DatabaseProperty, optId: string, color: string) => {
      const nextOpts = (prop.options || []).map(o => o.id === optId ? { ...o, color } : o);
      updateDatabaseProperty(dbPage.id, prop.id, { options: nextOpts });
    };

    const deleteOption = (prop: DatabaseProperty, optId: string) => {
      const nextOpts = (prop.options || []).filter(o => o.id !== optId);
      updateDatabaseProperty(dbPage.id, prop.id, { options: nextOpts });
      showToast("Option removed.", "info");
    };

    const addOption = (prop: DatabaseProperty) => {
      const nextOpts = [...(prop.options || []), {
        id: 'opt-' + Math.random().toString(36).substring(2, 9),
        name: 'Option ' + ((prop.options?.length || 0) + 1),
        color: '#e2e8f0'
      }];
      updateDatabaseProperty(dbPage.id, prop.id, { options: nextOpts });
      showToast("Option added.", "success");
    };

    const toggleRequired = (propId: string) => {
      const current = JSON.parse(dbPage.customProperties?.requiredProps || '[]') as string[];
      const next = current.includes(propId) ? current.filter(id => id !== propId) : [...current, propId];
      updatePage(dbPage.id, {
        customProperties: {
          ...(dbPage.customProperties || {}),
          requiredProps: JSON.stringify(next)
        }
      });
      showToast(next.includes(propId) ? "Question marked as required." : "Question marked as optional.", "info");
    };

    const renderPropertyAnalytics = (prop: DatabaseProperty) => {
      const vals = rows.map(r => r.cells[prop.id]);

      if (prop.type === 'number') {
        const nums = vals.map(v => Number(v)).filter(v => !isNaN(v) && v !== null && v !== undefined);
        if (nums.length === 0) {
          return <span style={{ fontSize: '13px', fontStyle: 'italic', color: '#70757a' }}>No responses.</span>;
        }
        const sum = nums.reduce((a, b) => a + b, 0);
        const avg = (sum / nums.length).toFixed(2);
        const min = Math.min(...nums);
        const max = Math.max(...nums);

        const chartData = {
          labels: nums.map((_, i) => `Resp ${i + 1}`),
          datasets: [{
            label: prop.name,
            data: nums,
            borderColor: '#673ab7',
            backgroundColor: 'rgba(103, 58, 183, 0.05)',
            fill: true,
            tension: 0.1,
            borderWidth: 2
          }]
        };

        const chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#70757a', fontWeight: 500 }}>AVERAGE</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#202124', marginTop: '2px' }}>{avg}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#70757a', fontWeight: 500 }}>SUM</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#202124', marginTop: '2px' }}>{sum}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#70757a', fontWeight: 500 }}>MIN</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#202124', marginTop: '2px' }}>{min}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#70757a', fontWeight: 500 }}>MAX</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#202124', marginTop: '2px' }}>{max}</div>
              </div>
            </div>
            <div style={{ height: '180px', position: 'relative' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        );
      }

      if (prop.type === 'select' || prop.type === 'status') {
        const counts: Record<string, number> = {};
        let filledCount = 0;
        vals.forEach(val => {
          if (val) {
            counts[val] = (counts[val] || 0) + 1;
            filledCount++;
          }
        });

        if (filledCount === 0) {
          return <span style={{ fontSize: '13px', fontStyle: 'italic', color: '#70757a' }}>No responses.</span>;
        }

        const dataLabels = prop.options?.map(o => o.name) || [];
        const dataValues = prop.options?.map(o => counts[o.id] || 0) || [];
        const colors = prop.options?.map(o => o.color || '#e2e8f0') || [];

        const chartData = {
          labels: dataLabels,
          datasets: [{
            data: dataValues,
            backgroundColor: colors,
            borderWidth: 1
          }]
        };

        const chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right' as const } }
        };

        return (
          <div style={{ height: '180px', position: 'relative' }}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        );
      }

      if (prop.type === 'multi-select') {
        const counts: Record<string, number> = {};
        let filledCount = 0;
        vals.forEach(val => {
          if (Array.isArray(val) && val.length > 0) {
            val.forEach((v: string) => {
              counts[v] = (counts[v] || 0) + 1;
              filledCount++;
            });
          }
        });

        if (filledCount === 0) {
          return <span style={{ fontSize: '13px', fontStyle: 'italic', color: '#70757a' }}>No responses.</span>;
        }

        const dataLabels = prop.options?.map(o => o.name) || [];
        const dataValues = prop.options?.map(o => counts[o.id] || 0) || [];
        const colors = prop.options?.map(o => o.color || '#673ab7') || [];

        const chartData = {
          labels: dataLabels,
          datasets: [{
            label: 'Responses',
            data: dataValues,
            backgroundColor: colors,
            borderWidth: 1
          }]
        };

        const chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y' as const,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
        };

        return (
          <div style={{ height: '180px', position: 'relative' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        );
      }

      if (prop.type === 'checkbox') {
        let yesCount = 0;
        let noCount = 0;
        vals.forEach(v => {
          if (v === true || v === 'true') {
            yesCount++;
          } else {
            noCount++;
          }
        });

        const chartData = {
          labels: ['Yes', 'No'],
          datasets: [{
            data: [yesCount, noCount],
            backgroundColor: ['#4caf50', '#f44336']
          }]
        };

        const chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right' as const } }
        };

        return (
          <div style={{ height: '180px', position: 'relative' }}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        );
      }

      // Default lists (text, date, url, email, phone)
      const texts = vals.map(v => String(v || '').trim()).filter(Boolean);
      if (texts.length === 0) {
        return <span style={{ fontSize: '13px', fontStyle: 'italic', color: '#70757a' }}>No responses.</span>;
      }

      return (
        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {texts.map((t, idx) => (
            <div 
              key={idx} 
              style={{ 
                background: '#f8f9fa', 
                border: '1px solid #f1f3f4', 
                borderRadius: '6px', 
                padding: '10px 14px', 
                fontSize: '13px', 
                color: '#202124',
                lineHeight: 1.4
              }}
            >
              {t}
            </div>
          ))}
        </div>
      );
    };

    const renderPreviewForm = () => {
      return (
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formProps.map(prop => {
            const val = formResponses[prop.id];
            const isRequired = requiredProps.includes(prop.id) || prop.id === titlePropId;
            
            return (
              <div 
                key={prop.id} 
                style={{ 
                  border: '1px solid #dadce0', 
                  borderRadius: '8px', 
                  padding: '24px', 
                  background: '#ffffff', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <label style={{ fontSize: '15px', fontWeight: 500, color: '#202124', display: 'flex', alignItems: 'center' }}>
                  {prop.name}
                  {isRequired && <span style={{ color: '#d93025', marginLeft: '4px', fontSize: '16px' }}>*</span>}
                </label>
                
                {prop.type === 'checkbox' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <input 
                      type="checkbox" 
                      id={`form-chk-${prop.id}`}
                      checked={!!val} 
                      onChange={e => handleFormChange(prop.id, e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor={`form-chk-${prop.id}`} style={{ fontSize: '14px', color: '#202124', cursor: 'pointer' }}>Yes</label>
                  </div>
                ) : prop.type === 'select' || prop.type === 'status' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    {(prop.options || []).map(o => (
                      <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#202124' }}>
                        <input
                          type="radio"
                          name={`form-radio-${prop.id}`}
                          checked={val === o.id}
                          onChange={() => handleFormChange(prop.id, o.id)}
                          style={{ width: '16px', height: '16px', accentColor: '#673ab7' }}
                        />
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: o.color || '#e2e8f0',
                          fontSize: '12px',
                          fontWeight: 500
                        }}>{o.name}</span>
                      </label>
                    ))}
                    {(prop.options || []).length === 0 && (
                      <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#999' }}>No options configured.</span>
                    )}
                  </div>
                ) : prop.type === 'multi-select' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    {(prop.options || []).map(o => {
                      const currentList = Array.isArray(val) ? val : [];
                      const isChecked = currentList.includes(o.id);
                      return (
                        <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#202124' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                handleFormChange(prop.id, [...currentList, o.id]);
                              } else {
                                handleFormChange(prop.id, currentList.filter(id => id !== o.id));
                              }
                            }}
                            style={{ width: '16px', height: '16px', accentColor: '#673ab7' }}
                          />
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: o.color || '#e2e8f0',
                            fontSize: '12px',
                            fontWeight: 500
                          }}>{o.name}</span>
                        </label>
                      );
                    })}
                    {(prop.options || []).length === 0 && (
                      <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#999' }}>No options configured.</span>
                    )}
                  </div>
                ) : (
                  <input
                    type={prop.type === 'number' ? 'number' : prop.type === 'date' ? 'date' : 'text'}
                    value={val || ''}
                    onChange={e => handleFormChange(prop.id, e.target.value)}
                    style={{ 
                      padding: '10px 0', 
                      border: 'none',
                      borderBottom: '1px solid #dadce0', 
                      background: 'transparent',
                      color: '#202124', 
                      outline: 'none', 
                      width: '100%', 
                      fontSize: '14px',
                      transition: 'border-bottom-color 0.2s'
                    }}
                    placeholder="Your answer"
                    onFocus={e => e.target.style.borderBottomColor = '#673ab7'}
                    onBlur={e => e.target.style.borderBottomColor = '#dadce0'}
                  />
                )}
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <button 
              type="submit" 
              style={{ 
                padding: '10px 24px', 
                background: '#673ab7', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                fontWeight: 600, 
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              Submit Response
            </button>
            <button 
              type="button" 
              onClick={() => {
                setFormResponses({});
                showToast("Form cleared", "info");
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#673ab7',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Clear Form
            </button>
          </div>
        </form>
      );
    };

    const renderResponsesTab = () => {
      if (rows.length === 0) {
        return (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 24px', 
            background: 'white', 
            border: '1px solid #dadce0', 
            borderRadius: '8px', 
            color: '#70757a',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#202124' }}>No responses yet</h3>
            <p style={{ margin: 0, fontSize: '13px' }}>Preview the form to start collecting responses.</p>
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Header Card */}
          <div style={{ 
            border: '1px solid #dadce0', 
            borderRadius: '8px', 
            padding: '24px', 
            background: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#202124' }}>
                {rows.length}
              </div>
              <div style={{ fontSize: '14px', color: '#5f6368', fontWeight: 500 }}>
                {rows.length === 1 ? 'response' : 'responses'}
              </div>
            </div>
            
            {showConfirmClear ? (
              <div style={{ 
                background: '#fce8e6', 
                border: '1px solid #fad2cf', 
                borderRadius: '8px', 
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '12px', color: '#c5221f', fontWeight: 600 }}>Delete all responses?</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => {
                      rows.forEach(r => deleteDatabaseRow(dbPage.id, r.id));
                      setShowConfirmClear(false);
                      showToast("All responses cleared.", "info");
                    }}
                    style={{ background: '#d93025', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Yes, clear
                  </button>
                  <button 
                    onClick={() => setShowConfirmClear(false)}
                    style={{ background: 'white', color: '#5f6368', border: '1px solid #dadce0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                style={{
                  border: '1px solid #dadce0',
                  background: 'white',
                  color: '#d93025',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} /> Clear all responses
              </button>
            )}
          </div>

          {/* Cards for each field summary */}
          {formProps.map(prop => {
            return (
              <div 
                key={prop.id} 
                style={{ 
                  border: '1px solid #dadce0', 
                  borderRadius: '8px', 
                  padding: '24px', 
                  background: '#ffffff', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ borderBottom: '1px solid #f1f3f4', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#202124', fontWeight: 600 }}>{prop.name}</h4>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: '#f1f3f4',
                    color: '#5f6368',
                    fontWeight: 500,
                    textTransform: 'uppercase'
                  }}>{prop.type}</span>
                </div>

                {renderPropertyAnalytics(prop)}
              </div>
            );
          })}
        </div>
      );
    };

    if (formSubmitted) {
      return (
        <div style={{
          background: '#f0ebf8',
          padding: '32px 16px',
          borderRadius: '12px',
          fontFamily: 'var(--font-sans)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          minHeight: '400px',
          margin: '16px 0 0 0'
        }}>
          <div style={{ 
            maxWidth: '650px', 
            width: '100%', 
            border: '1px solid #dadce0', 
            borderRadius: '8px', 
            padding: '32px', 
            background: '#ffffff', 
            borderTop: '10px solid #673ab7',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontSize: '48px' }}>🎉</div>
            <h2 style={{ margin: 0, color: '#202124' }}>Response Submitted!</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#5f6368' }}>Your response has been recorded in the database.</p>
            <button 
              className="cover-btn" 
              onClick={() => setFormSubmitted(false)}
              style={{ width: 'fit-content', alignSelf: 'center', background: '#673ab7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              Submit Another Response
            </button>
          </div>

          {/* Toast notifications container */}
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {toasts.map(toast => (
              <div 
                key={toast.id} 
                style={{
                  padding: '12px 20px',
                  background: '#ffffff',
                  color: '#202124',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  borderLeft: toast.type === 'success' ? '6px solid #2e7d32' : toast.type === 'error' ? '6px solid #c62828' : '6px solid #1a73e8',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  minWidth: '280px',
                  animation: 'formToastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
              >
                <span style={{ fontSize: '16px' }}>
                  {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <div style={{ flexGrow: 1, textAlign: 'left' }}>{toast.message}</div>
                <button 
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#999', padding: 0 }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes formToastSlideIn {
              from { transform: translateX(120%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      );
    }

    return (
      <div style={{
        background: '#f0ebf8',
        padding: '32px 16px',
        borderRadius: '12px',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '500px',
        margin: '16px 0 0 0',
        position: 'relative'
      }}>
        {/* Dual Tab Navigation (Questions vs Responses) */}
        <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid #dadce0', background: 'white', padding: '0 16px', borderRadius: '8px 8px 0 0', margin: '-32px -16px 16px -16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <button
            onClick={() => setFormActiveTab('questions')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: 600,
              color: formActiveTab === 'questions' ? '#673ab7' : '#5f6368',
              borderBottom: formActiveTab === 'questions' ? '3px solid #673ab7' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s'
            }}
          >
            Questions
          </button>
          <button
            onClick={() => setFormActiveTab('responses')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: 600,
              color: formActiveTab === 'responses' ? '#673ab7' : '#5f6368',
              borderBottom: formActiveTab === 'responses' ? '3px solid #673ab7' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s'
            }}
          >
            Responses {rows.length > 0 && `(${rows.length})`}
          </button>
        </div>

        {/* Edit / Preview mode toggle for questions tab */}
        {formActiveTab === 'questions' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: !isPreviewMode ? '#673ab7' : 'white',
                color: !isPreviewMode ? 'white' : '#5f6368',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Editor Mode
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewMode(true)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: isPreviewMode ? '#673ab7' : 'white',
                color: isPreviewMode ? 'white' : '#5f6368',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Preview Mode
            </button>
          </div>
        )}

        <div style={{ maxWidth: '650px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Card */}
          <div style={{ 
            border: '1px solid #dadce0', 
            borderRadius: '8px', 
            padding: '24px', 
            background: '#ffffff', 
            borderTop: '10px solid #673ab7',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {isPreviewMode || formActiveTab === 'responses' ? (
              <>
                <h1 style={{ margin: 0, color: '#202124', fontSize: '32px', fontWeight: 'bold' }}>{formTitle}</h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#5f6368' }}>
                  {dbPage.customProperties?.formDescription || 'Please fill out this form to record data.'}
                </p>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={dbPage.title || ''}
                  onChange={e => updatePage(dbPage.id, { title: e.target.value })}
                  placeholder="Form Title"
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderBottom: '1px solid transparent',
                    width: '100%',
                    padding: '4px 0 8px',
                    background: 'transparent',
                    outline: 'none',
                    color: '#202124'
                  }}
                  onFocus={e => e.target.style.borderBottomColor = '#673ab7'}
                  onBlur={e => e.target.style.borderBottomColor = 'transparent'}
                />
                <textarea
                  value={dbPage.customProperties?.formDescription || ''}
                  onChange={e => updatePage(dbPage.id, {
                    customProperties: {
                      ...(dbPage.customProperties || {}),
                      formDescription: e.target.value
                    }
                  })}
                  placeholder="Form description"
                  rows={2}
                  style={{
                    fontSize: '14px',
                    border: 'none',
                    borderBottom: '1px solid transparent',
                    width: '100%',
                    padding: '4px 0',
                    background: 'transparent',
                    outline: 'none',
                    color: '#5f6368',
                    resize: 'none'
                  }}
                  onFocus={e => e.target.style.borderBottomColor = '#673ab7'}
                  onBlur={e => e.target.style.borderBottomColor = 'transparent'}
                />
              </>
            )}
          </div>

          {/* Active Tab rendering */}
          {formActiveTab === 'responses' ? (
            renderResponsesTab()
          ) : isPreviewMode ? (
            renderPreviewForm()
          ) : (
            /* Questions Edit Builder */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formProps.map(prop => {
                const isRequired = requiredProps.includes(prop.id) || prop.id === titlePropId;
                
                return (
                  <div 
                    key={prop.id} 
                    style={{ 
                      border: '1px solid #dadce0', 
                      borderRadius: '8px', 
                      padding: '24px', 
                      background: '#ffffff', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <div style={{ flexGrow: 1, minWidth: '200px' }}>
                        <input
                          type="text"
                          value={prop.name}
                          onChange={e => updateDatabaseProperty(dbPage.id, prop.id, { name: e.target.value })}
                          placeholder="Question Name"
                          style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            border: 'none',
                            borderBottom: '1px solid #dadce0',
                            padding: '12px 8px',
                            background: '#f8f9fa',
                            borderRadius: '4px 4px 0 0',
                            width: '100%',
                            outline: 'none',
                            color: '#202124'
                          }}
                        />
                      </div>
                      
                      <div>
                        <select
                          value={prop.type}
                          onChange={e => updateDatabaseProperty(dbPage.id, prop.id, { type: e.target.value as any })}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '4px',
                            border: '1px solid #dadce0',
                            background: 'white',
                            color: '#202124',
                            outline: 'none',
                            fontSize: '14px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            minWidth: '160px'
                          }}
                        >
                          <option value="text">Short Answer</option>
                          <option value="number">Number</option>
                          <option value="select">Multiple Choice</option>
                          <option value="multi-select">Checkboxes</option>
                          <option value="status">Status</option>
                          <option value="checkbox">Yes / No Checkbox</option>
                          <option value="date">Date</option>
                          <option value="url">URL Address</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                        </select>
                      </div>
                    </div>

                    {/* Builder Input Preview & Option Configuration */}
                    <div style={{ paddingLeft: '8px' }}>
                      {prop.type === 'checkbox' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                          <input type="checkbox" disabled style={{ width: '16px', height: '16px' }} />
                          <span style={{ fontSize: '14px', color: '#70757a' }}>Checkbox (Yes/No response)</span>
                        </div>
                      ) : prop.type === 'select' || prop.type === 'multi-select' || prop.type === 'status' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                          {(prop.options || []).map((opt, oIdx) => (
                            <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: '#70757a', fontSize: '14px' }}>
                                {prop.type === 'multi-select' ? '⬜' : '⚪'}
                              </span>
                              <input
                                type="text"
                                value={opt.name}
                                onChange={e => renameOption(prop, opt.id, e.target.value)}
                                placeholder={`Option ${oIdx + 1}`}
                                style={{
                                  border: 'none',
                                  borderBottom: '1px solid transparent',
                                  padding: '4px 0',
                                  fontSize: '14px',
                                  outline: 'none',
                                  color: '#202124',
                                  flexGrow: 1
                                }}
                                onFocus={e => e.target.style.borderBottom = '1px solid #dadce0'}
                                onBlur={e => e.target.style.borderBottom = '1px solid transparent'}
                              />
                              <input
                                type="color"
                                value={opt.color.startsWith('#') ? opt.color : '#e2e8f0'}
                                onChange={e => changeOptionColor(prop, opt.id, e.target.value)}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  border: 'none',
                                  borderRadius: '50%',
                                  cursor: 'pointer',
                                  padding: 0,
                                  background: 'transparent'
                                }}
                                title="Choose color badge"
                              />
                              <button
                                onClick={() => deleteOption(prop, opt.id)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  color: '#5f6368',
                                  fontSize: '20px',
                                  lineHeight: 1,
                                  padding: '0 4px'
                                }}
                                title="Remove option"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(prop)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#673ab7',
                              fontSize: '14px',
                              cursor: 'pointer',
                              padding: '6px 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              width: 'fit-content',
                              fontWeight: 600
                            }}
                          >
                            <PlusCircle size={14} /> Add option
                          </button>
                        </div>
                      ) : (
                        <input
                          type="text"
                          disabled
                          placeholder={
                            prop.type === 'number' ? 'Numerical response' :
                            prop.type === 'date' ? 'Date picker' :
                            prop.type === 'url' ? 'URL Link address' :
                            prop.type === 'email' ? 'Email address' :
                            prop.type === 'phone' ? 'Phone number' : 'Short answer text'
                          }
                          style={{
                            border: 'none',
                            borderBottom: '1px dashed #ccc',
                            padding: '8px 0',
                            width: '60%',
                            fontSize: '14px',
                            background: 'transparent',
                            color: '#70757a'
                          }}
                        />
                      )}
                    </div>

                    {/* Footer Controls */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '16px',
                      marginTop: '8px',
                      paddingTop: '16px',
                      borderTop: '1px solid #f1f3f4'
                    }}>
                      <button
                        onClick={() => {
                          deleteDatabaseProperty(dbPage.id, prop.id);
                          showToast(`Deleted question "${prop.name}".`, "info");
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#5f6368',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px'
                        }}
                        title="Delete question"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <div style={{ height: '20px', width: '1px', background: '#dadce0' }} />
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#5f6368', fontWeight: 500 }}>Required</span>
                        <input
                          type="checkbox"
                          checked={isRequired}
                          disabled={prop.id === titlePropId}
                          onChange={() => toggleRequired(prop.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: prop.id === titlePropId ? 'not-allowed' : 'pointer',
                            accentColor: '#673ab7'
                          }}
                        />
                      </div>
                    </div>

                  </div>
                );
              })}

              {/* Add Question Card Button */}
              <div 
                onClick={() => {
                  addDatabaseProperty(dbPage.id, 'New Question', 'text');
                  showToast("Created a new text question.", "success");
                }}
                style={{ 
                  border: '1px dashed #673ab7', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  background: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#673ab7',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9f6fc'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <Plus size={18} />
                <span>Add Question</span>
              </div>
            </div>
          )}
        </div>

        {/* Toast notifications container */}
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              style={{
                padding: '12px 20px',
                background: '#ffffff',
                color: '#202124',
                borderRadius: '8px',
                border: '1px solid #dadce0',
                borderLeft: toast.type === 'success' ? '6px solid #2e7d32' : toast.type === 'error' ? '6px solid #c62828' : '6px solid #1a73e8',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13.5px',
                fontWeight: 500,
                minWidth: '280px',
                animation: 'formToastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <div style={{ flexGrow: 1, textAlign: 'left' }}>{toast.message}</div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#999', padding: 0 }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes formToastSlideIn {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  };;

  const getActiveTabIcon = (type: DatabaseView['type']) => {
    switch (type) {
      case 'board': return <BoardIcon size={14} />;
      case 'calendar': return <CalendarIcon size={14} />;
      case 'gallery': return <LayoutGrid size={14} />;
      case 'list': return <ListIcon size={14} />;
      case 'feed': return <Activity size={14} />;
      case 'timeline': return <CalendarDays size={14} />;
      case 'dashboard': return <BarChart2 size={14} />;
      case 'map': return <MapIcon size={14} />;
      case 'form': return <Edit size={14} />;
      default: return <TableIcon size={14} />;
    }
  };

  return (
    <div className="db-block-container" style={{ padding: '12px 0', background: 'transparent' }}>
      
      {/* Scrollable Views Toolbar - Notch Style */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', flexGrow: 1, whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
          {views.map((v, idx) => {
            const isEditing = editingViewId === v.id;
            return (
              <div key={v.id} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingViewName}
                    onChange={(e) => setEditingViewName(e.target.value)}
                    onBlur={() => {
                      if (editingViewName.trim()) {
                        updateDatabaseView(dbPage.id, v.id, { name: editingViewName });
                      }
                      setEditingViewId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingViewName.trim()) {
                          updateDatabaseView(dbPage.id, v.id, { name: editingViewName });
                        }
                        setEditingViewId(null);
                      }
                    }}
                    autoFocus
                    style={{ fontSize: '12px', padding: '3px 6px', border: '1px solid var(--accent-color)', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', width: '100px' }}
                  />
                ) : (
                  <button 
                    className={`db-view-tab ${idx === activeViewIdx ? 'active' : ''}`}
                    onClick={() => setActiveViewIdx(idx)}
                    onDoubleClick={() => {
                      setEditingViewId(v.id);
                      setEditingViewName(v.name);
                    }}
                    style={{
                      border: 'none',
                      background: idx === activeViewIdx ? 'var(--bg-primary)' : 'transparent',
                      color: idx === activeViewIdx ? 'var(--text-primary)' : 'var(--text-muted)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {getActiveTabIcon(v.type)}
                    <span>{v.name}</span>
                    
                    {idx === activeViewIdx && (
                      <span 
                        style={{ fontSize: '9px', opacity: 0.5, marginLeft: '2px', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const confirmDel = confirm(`Delete view "${v.name}"?`);
                          if (confirmDel) deleteDatabaseView(dbPage.id, v.id);
                        }}
                        title="Delete this view"
                      >
                        &times;
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
          
          <button 
            className="db-view-add-btn"
            onClick={() => setShowAddViewPopover(!showAddViewPopover)}
            style={{ padding: '6px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-placeholder)' }}
          >
            <Plus size={14} />
          </button>
          
          {showAddViewPopover && (
            <>
              <div 
                onClick={() => setShowAddViewPopover(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
              />
              <div 
                className="glass"
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '10px',
                  zIndex: 100,
                  width: '240px',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-placeholder)', padding: '4px 6px' }}>CREATE VIEW</div>
                {viewOptions.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      addDatabaseView(dbPage.id, opt.name, opt.type);
                      setShowAddViewPopover(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ color: 'var(--accent-color)' }}>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Header Tools */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          
          {/* Properties Visibility Config */}
          <div style={{ position: 'relative' }}>
            <button 
              className="cover-btn" 
              onClick={() => setShowPropVisibilityMenu(!showPropVisibilityMenu)}
              style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
            >
              <Eye size={12} /> Hide/Show Columns
            </button>
            {showPropVisibilityMenu && (
              <>
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={() => setShowPropVisibilityMenu(false)} />
                <div className="glass" style={{ position: 'absolute', right: 0, top: '28px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', zIndex: 100, width: '180px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: 'var(--shadow-md)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-placeholder)', padding: '4px' }}>SHOW COLUMNS</div>
                  {schema.properties.map(p => {
                    const isVisible = isPropVisible(p.id);
                    return (
                      <button 
                        key={p.id}
                        onClick={() => togglePropertyVisibility(p.id)}
                        style={{ border: 'none', background: 'transparent', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)', fontSize: '11px' }}
                      >
                        <span style={{ color: isVisible ? 'var(--success-color)' : 'var(--text-placeholder)', display: 'inline-flex' }}>
                          {isVisible ? <CheckSquare size={13} /> : <Sliders size={13} />}
                        </span>
                        <span>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <button className="cover-btn" onClick={() => setPropEditorOpen(!propEditorOpen)} style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}>
            <Settings size={12} /> Add Property
          </button>
          
          <button className="cover-btn" style={{ padding: '4px' }} onClick={() => setFullPageBlockId(fullPageBlockId === blockId ? null : blockId)} title="Toggle Fullscreen View">
            <Maximize size={12} />
          </button>
        </div>
      </div>

      {/* Notion style Search & Filter Bar */}
      <div style={{ padding: '8px 0', background: 'transparent', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', width: searchExpanded ? '240px' : '32px', transition: 'width 0.25s ease', flexGrow: searchExpanded ? 1 : 0, maxWidth: '280px' }}>
          {searchExpanded ? (
            <>
              <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--accent-color)' }} />
              <input
                type="text"
                placeholder="Search cells..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                onBlur={() => { if (!searchQuery) setSearchExpanded(false); }}
                className="search-input"
                style={{ width: '100%', padding: '4px 8px 4px 28px', fontSize: '12px', border: '1px solid var(--accent-color)', borderRadius: '6px', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSearchExpanded(false); }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', position: 'absolute', right: '6px', color: 'var(--text-placeholder)', fontSize: '14px', fontWeight: 'bold' }}
                >
                  &times;
                </button>
              )}
            </>
          ) : (
            <button 
              className="cover-btn"
              onClick={() => setSearchExpanded(true)}
              style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: searchQuery ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', background: searchQuery ? 'var(--accent-light)' : 'transparent', color: searchQuery ? 'var(--accent-color)' : 'inherit' }}
              title="Search database"
            >
              <Search size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            className="cover-btn" 
            style={{ 
              padding: '3px 8px', 
              fontSize: '11px', 
              gap: '4px',
              backgroundColor: activeFilters.length > 0 ? 'var(--accent-light)' : 'transparent',
              borderColor: activeFilters.length > 0 ? 'var(--accent-color)' : 'var(--border-color)',
              color: activeFilters.length > 0 ? 'var(--accent-color)' : 'inherit',
              fontWeight: activeFilters.length > 0 ? 600 : 500
            }} 
            onClick={() => { setShowFilterBuilder(!showFilterBuilder); setShowSortBuilder(false); }}
          >
            <Filter size={11} /> Filter {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}
          </button>
          <button 
            className="cover-btn" 
            style={{ 
              padding: '3px 8px', 
              fontSize: '11px', 
              gap: '4px',
              backgroundColor: sortPropId ? 'var(--accent-light)' : 'transparent',
              borderColor: sortPropId ? 'var(--accent-color)' : 'var(--border-color)',
              color: sortPropId ? 'var(--accent-color)' : 'inherit',
              fontWeight: sortPropId ? 600 : 500
            }} 
            onClick={() => { setShowSortBuilder(!showSortBuilder); setShowFilterBuilder(false); }}
          >
            <ArrowUpDown size={11} /> Sort {sortPropId ? `(${sortDirection === 'asc' ? 'Asc' : 'Desc'})` : ''}
          </button>
        </div>

      </div>

      {/* Filter Builder Panel */}
      {showFilterBuilder && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', borderRadius: '4px', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700 }}>Filter:</span>
          <select value={filterPropId} onChange={e => setFilterPropId(e.target.value)} style={{ padding: '3px 6px', fontSize: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}>
            <option value="">-- Choose Column --</option>
            {schema.properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select value={filterOperator} onChange={e => setFilterOperator(e.target.value)} style={{ padding: '3px 6px', fontSize: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}>
            <option value="contains">contains</option>
            <option value="is">is</option>
            <option value="is-empty">is empty</option>
            <option value="is-checked">is checked</option>
          </select>
          {filterOperator !== 'is-empty' && filterOperator !== 'is-checked' && (
            <input
              type="text"
              placeholder="value..."
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
              className="search-input"
              style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '3px 6px', fontSize: '12px', width: '120px' }}
            />
          )}
          <button onClick={addFilter} className="cover-btn" style={{ padding: '4px 10px', fontSize: '11px', background: 'var(--accent-color)', color: '#fff', border: 'none' }}>Add</button>
        </div>
      )}

      {/* Sort Builder Panel */}
      {showSortBuilder && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', borderRadius: '4px', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700 }}>Sort By:</span>
          <select value={sortPropId} onChange={e => setSortPropId(e.target.value)} style={{ padding: '3px 6px', fontSize: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}>
            <option value="">-- Choose Column --</option>
            {schema.properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select value={sortDirection} onChange={e => setSortDirection(e.target.value as any)} style={{ padding: '3px 6px', fontSize: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      )}

      {/* Active Filter Badges */}
      {activeFilters.length > 0 && (
        <div style={{ padding: '6px 0', background: 'transparent', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {activeFilters.map((f, idx) => {
            const propName = schema.properties.find(p => p.id === f.propertyId)?.name || f.propertyId;
            return (
              <span key={idx} style={{ fontSize: '11px', background: 'var(--accent-light)', color: 'var(--accent-color)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                {propName} {f.operator} {f.value ? `"${f.value}"` : ''}
                <button onClick={() => removeFilter(idx)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', fontWeight: 700, padding: 0, fontSize: '11px' }}>&times;</button>
              </span>
            );
          })}
        </div>
      )}

      {/* Column Schema Creator Panel */}
      {propEditorOpen && (
        <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', marginTop: '8px' }}>
          <form onSubmit={handleAddProperty} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>New Column:</span>
            <input 
              type="text" 
              placeholder="e.g. Due Date, Priority" 
              className="search-input"
              style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', width: '150px' }}
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
            />
            <select
              value={newPropType}
              onChange={(e) => setNewPropType(e.target.value as any)}
              style={{ padding: '4px', borderRadius: '4px', fontSize: '13px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select dropdown</option>
              <option value="multi-select">Multi-Select tags</option>
              <option value="status">Status tag</option>
              <option value="checkbox">Checkbox</option>
              <option value="date">Date</option>
              <option value="url">URL Address</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
            <button type="submit" className="cover-btn" style={{ padding: '4px 10px', fontSize: '12px', border: 'none', background: 'var(--accent-color)', color: '#fff' }}>Add Property</button>
            <button type="button" className="cover-btn" style={{ padding: '4px 10px', fontSize: '12px', background: 'rgba(239,68,68,0.1)', color: 'red', border: 'none' }} onClick={() => setPropEditorOpen(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* Database Render Body */}
      {activeView.type === 'board' ? renderBoardView() : 
       activeView.type === 'calendar' ? renderCalendarView() : 
       activeView.type === 'timeline' ? renderTimelineView() :
       activeView.type === 'dashboard' ? renderDashboardView() :
       activeView.type === 'map' ? renderMapView() :
       activeView.type === 'gallery' ? renderGalleryView() : 
       activeView.type === 'list' ? renderListView() : 
       activeView.type === 'feed' ? renderFeedView() : 
       activeView.type === 'form' ? renderFormView() : 
       renderTableView()}

      {/* Modal peek edit details overlay */}
      {activeRowIdPeek && (
        <ModalPeek 
          dbPageId={dbPage.id}
          rowId={activeRowIdPeek}
          onClose={() => setActiveRowIdPeek(null)}
        />
      )}

      <style>{`
        .db-block-error {
          padding: 30px;
          text-align: center;
          font-style: italic;
          color: var(--text-placeholder);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .calc-opt-btn {
          border: none;
          background: transparent;
          text-align: left;
          padding: 6px 12px;
          font-size: 11px;
          cursor: pointer;
          color: var(--text-primary);
          transition: background 0.15s;
        }
        .calc-opt-btn:hover {
          background: var(--bg-tertiary);
        }
        .db-prop-del-btn {
          border: none;
          background: transparent;
          color: var(--danger-color);
          font-size: 14px;
          cursor: pointer;
          font-weight: 700;
          padding: 0 4px;
        }
        .db-row-peek-trigger {
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }
        .db-row-peek-trigger:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .db-input-cell {
          border: none;
          background: transparent;
          width: 100%;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 14px;
        }
        .db-select-cell {
          border: none;
          padding: 3px 6px;
          border-radius: var(--border-radius-sm);
          font-size: 12px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }
        .db-col-add-quick {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
        }
        .db-col-add-quick:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .db-kanban-empty {
          padding: 12px;
          text-align: center;
          font-size: 12px;
          color: var(--text-placeholder);
          font-style: italic;
          border: 1px dashed var(--border-color);
          border-radius: var(--border-radius-md);
        }
        .db-calendar-week-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-weight: 600;
          font-size: 12px;
          color: var(--text-muted);
          padding: 8px 0;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};
