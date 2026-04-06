import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Isolated Supabase client — no dependency on shared lib
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string
);

// Inline types — no imports from shared types files
interface Obj {
  id: string;
  version_id: string;
  label: string;
  image_url: string;
  sfx_url: string;
  x: number;
  y: number;
  size: number;
  created_at: string;
}

interface Version {
  id: string;
  scene_id: string;
  label: string;
  background_image_url: string;
  scene_objects: Obj[];
  scenes: { name: string } | null;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export default function AdminSceneEditor() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [objects, setObjects] = useState<Obj[]>([]);
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // ── Fetch all scene versions with nested scene name + objects ──────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from('scene_versions')
        .select('id, scene_id, label, background_image_url, scenes(name), scene_objects(*)');
      if (error) {
        setFetchError(error.message);
      } else {
        setVersions((data ?? []) as Version[]);
      }
      setLoading(false);
    }
    void load();
  }, []);

  // ── Sync objects when version selection changes ────────────────────────────
  useEffect(() => {
    if (!selectedVersionId) {
      setObjects([]);
      setSelectedObjId(null);
      return;
    }
    const v = versions.find(v => v.id === selectedVersionId);
    setObjects(v?.scene_objects ? [...v.scene_objects] : []);
    setSelectedObjId(null);
  }, [selectedVersionId, versions]);

  const selectedVersion = versions.find(v => v.id === selectedVersionId) ?? null;
  const selectedObj = objects.find(o => o.id === selectedObjId) ?? null;

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedObjId(id);
      const obj = objects.find(o => o.id === id);
      if (!obj) return;
      dragRef.current = {
        id,
        startClientX: e.clientX,
        startClientY: e.clientY,
        origX: obj.x,
        origY: obj.y,
      };
    },
    [objects]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current;
    if (!drag || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - drag.startClientX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.startClientY) / rect.height) * 100;
    const newX = Math.round(Math.max(0, Math.min(100, drag.origX + dxPct)));
    const newY = Math.round(Math.max(0, Math.min(100, drag.origY + dyPct)));
    setObjects(prev =>
      prev.map(o => (o.id === drag.id ? { ...o, x: newX, y: newY } : o))
    );
  }, []);

  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  // ── Manual field edit ──────────────────────────────────────────────────────
  const updateField = (field: 'x' | 'y' | 'size', raw: string) => {
    if (!selectedObjId) return;
    const val = Math.round(Math.max(0, Math.min(100, Number(raw))));
    setObjects(prev =>
      prev.map(o => (o.id === selectedObjId ? { ...o, [field]: val } : o))
    );
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      for (const obj of objects) {
        const { error } = await supabase
          .from('scene_objects')
          .update({ x: obj.x, y: obj.y, size: obj.size })
          .eq('id', obj.id);
        if (error) throw error;
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
    }
  };

  // ── Styles (all inline) ───────────────────────────────────────────────────
  const s = {
    root: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh',
      background: '#0d0d1a',
      color: '#e2e8f0',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      fontSize: 13,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '10px 20px',
      background: '#13132b',
      borderBottom: '1px solid #2d2d50',
      flexShrink: 0,
    },
    title: {
      fontWeight: 700,
      fontSize: 15,
      color: '#a78bfa',
      letterSpacing: 0.3,
    },
    select: {
      background: '#1e1e3a',
      color: '#e2e8f0',
      border: '1px solid #4a4a70',
      borderRadius: 6,
      padding: '6px 12px',
      fontSize: 13,
      cursor: 'pointer',
      minWidth: 280,
    },
    body: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    previewWrap: {
      flex: 1,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      background: '#0a0a14',
      padding: '32px 32px 0 32px',
      overflow: 'hidden',
    },
    placeholder: {
      color: '#3d3d60',
      fontSize: 16,
      userSelect: 'none' as const,
    },
    canvas: {
      position: 'relative' as const,
      width: 'calc(100vw - 180px - 64px - 264px)',
      maxWidth: '1216px',
      height: 'calc(100vh - 280px)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: 8,
      overflow: 'hidden',
      cursor: 'crosshair',
      userSelect: 'none' as const,
      boxShadow: '0 0 0 1px #2d2d50, 0 8px 32px rgba(0,0,0,0.6)',
    },
    objBox: (selected: boolean) => ({
      position: 'absolute' as const,
      transform: 'translate(-50%, -50%)',
      cursor: 'grab',
      boxSizing: 'border-box' as const,
      border: selected ? '2px solid #a78bfa' : '2px solid rgba(255,255,255,0.4)',
      borderRadius: 4,
      background: 'rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: selected ? '0 0 0 2px #7c3aed, 0 0 12px rgba(124,58,237,0.4)' : 'none',
      transition: 'border-color 0.1s, box-shadow 0.1s',
    }),
    objLabel: {
      position: 'absolute' as const,
      bottom: 1,
      left: 0,
      right: 0,
      textAlign: 'center' as const,
      fontSize: 9,
      color: '#fff',
      textShadow: '0 1px 3px #000',
      pointerEvents: 'none' as const,
      padding: '1px 2px',
      background: 'rgba(0,0,0,0.45)',
      lineHeight: 1.3,
    },
    panel: {
      width: 264,
      background: '#13132b',
      borderLeft: '1px solid #2d2d50',
      padding: 18,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 14,
      overflowY: 'auto' as const,
      flexShrink: 0,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: 700,
      color: '#6b6ba0',
      textTransform: 'uppercase' as const,
      letterSpacing: 1.2,
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
    },
    fieldLabel: {
      fontSize: 10,
      color: '#7070a0',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
    },
    fieldValue: {
      fontSize: 12,
      color: '#9090c0',
      wordBreak: 'break-all' as const,
      lineHeight: 1.5,
    },
    input: {
      background: '#1e1e3a',
      color: '#e2e8f0',
      border: '1px solid #4a4a70',
      borderRadius: 6,
      padding: '6px 10px',
      fontSize: 14,
      width: '100%',
      boxSizing: 'border-box' as const,
      outline: 'none',
    },
    divider: {
      borderTop: '1px solid #2d2d50',
      paddingTop: 12,
    },
    objListItem: (selected: boolean) => ({
      padding: '7px 10px',
      marginBottom: 3,
      borderRadius: 6,
      cursor: 'pointer',
      background: selected ? '#1f1445' : '#1a1a30',
      border: selected ? '1px solid #7c3aed' : '1px solid transparent',
      display: 'flex',
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      transition: 'background 0.1s',
    }),
    objListCoords: {
      fontSize: 10,
      color: '#5555aa',
      fontVariantNumeric: 'tabular-nums' as const,
    },
    saveBtn: (disabled: boolean) => ({
      width: '100%',
      padding: '10px 0',
      background: disabled ? '#4c1d95' : '#7c3aed',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.2s',
      opacity: disabled ? 0.7 : 1,
    }),
    statusMsg: (ok: boolean) => ({
      textAlign: 'center' as const,
      marginTop: 6,
      color: ok ? '#4ade80' : '#f87171',
      fontSize: 11,
    }),
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...s.root, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b6ba0' }}>Loading scene versions…</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ ...s.root, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#f87171' }}>Error: {fetchError}</div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      {/* ── Header ── */}
      <div style={s.header}>
        <span style={s.title}>Scene Object Editor</span>
        <select
          value={selectedVersionId}
          onChange={e => setSelectedVersionId(e.target.value)}
          style={s.select}
        >
          <option value="">— Select a scene version —</option>
          {versions.map(v => (
            <option key={v.id} value={v.id}>
              {v.scenes?.name ?? 'Unknown Scene'} / {v.label}
            </option>
          ))}
        </select>
        {selectedVersionId && (
          <span style={{ marginLeft: 'auto', color: '#6b6ba0', fontSize: 11 }}>
            {objects.length} object{objects.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div style={s.body}>
        {/* Preview canvas */}
        <div style={s.previewWrap}>
          {!selectedVersionId ? (
            <span style={s.placeholder}>Select a scene version to begin</span>
          ) : (
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              style={{
                ...s.canvas,
                backgroundImage: selectedVersion?.background_image_url
                  ? `url(${selectedVersion.background_image_url})`
                  : undefined,
                background: selectedVersion?.background_image_url ? undefined : '#1a1a30',
              }}
            >
              {objects.map(obj => (
                <div
                  key={obj.id}
                  onMouseDown={e => handleMouseDown(e, obj.id)}
                  style={{
                    ...s.objBox(selectedObjId === obj.id),
                    left: `${obj.x}%`,
                    top: `${obj.y}%`,
                    width: `${obj.size}%`,
                    height: `${obj.size}%`,
                  }}
                >
                  {obj.image_url && (
                    <img
                      src={obj.image_url}
                      alt={obj.label}
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    />
                  )}
                  <div style={s.objLabel}>{obj.label}</div>
                </div>
              ))}

              {/* Grid overlay hint */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                  backgroundSize: '10% 10%',
                }}
              />
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={s.panel}>
          {/* Properties */}
          <div style={s.sectionTitle}>Properties</div>

          {selectedObj ? (
            <>
              <div style={s.fieldGroup}>
                <span style={s.fieldLabel}>ID</span>
                <span style={s.fieldValue}>{selectedObj.id}</span>
              </div>
              <div style={s.fieldGroup}>
                <span style={s.fieldLabel}>Label</span>
                <span style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 500 }}>
                  {selectedObj.label}
                </span>
              </div>

              {(['x', 'y', 'size'] as const).map(field => (
                <div key={field} style={s.fieldGroup}>
                  <label style={s.fieldLabel}>
                    {field === 'x'
                      ? 'X  (0 – 100%)'
                      : field === 'y'
                      ? 'Y  (0 – 100%)'
                      : 'Size  (% of canvas)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={selectedObj[field]}
                    onChange={e => updateField(field, e.target.value)}
                    style={s.input}
                  />
                </div>
              ))}
            </>
          ) : (
            <div style={{ color: '#3d3d60', lineHeight: 1.6 }}>
              {selectedVersionId
                ? 'Click an object on the canvas to inspect it.'
                : 'Load a scene version first.'}
            </div>
          )}

          {/* Object list */}
          {objects.length > 0 && (
            <div style={s.divider}>
              <div style={{ ...s.sectionTitle, marginBottom: 8 }}>Objects</div>
              {objects.map(obj => (
                <div
                  key={obj.id}
                  onClick={() => setSelectedObjId(obj.id)}
                  style={s.objListItem(selectedObjId === obj.id)}
                >
                  <span style={{ color: selectedObjId === obj.id ? '#c4b5fd' : '#9090c0' }}>
                    {obj.label}
                  </span>
                  <span style={s.objListCoords}>
                    {obj.x}%, {obj.y}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Save */}
          {selectedVersionId && (
            <div style={{ marginTop: 'auto', ...s.divider }}>
              <button
                onClick={() => void handleSave()}
                disabled={saveStatus === 'saving'}
                style={s.saveBtn(saveStatus === 'saving')}
              >
                {saveStatus === 'saving' ? 'Saving…' : 'Save Positions'}
              </button>
              {saveStatus === 'success' && (
                <div style={s.statusMsg(true)}>All positions saved.</div>
              )}
              {saveStatus === 'error' && (
                <div style={s.statusMsg(false)}>Save failed — check console.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
