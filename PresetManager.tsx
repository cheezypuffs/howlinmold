import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getPresets, savePreset, deletePreset, restoreDefaults, type FxPreset, type FxSetting } from '../services/PresetAPI';
import type { DeckId, Effect, MasterFxType, Action } from '../types';
import { Button } from './ui/button';
import * as Icons from './Icons';
import { useToast } from '../hooks/use-toast';
import { cn } from '../utils/cn';
import { Input } from './ui/input';

interface PresetManagerProps {
  type: 'deck' | 'master';
  deckId?: DeckId;
  currentEffects: (Effect & { enabled: boolean })[] | (Effect & { enabled: boolean; type: MasterFxType })[];
  dispatch: React.Dispatch<Action>;
}

const PresetManager: React.FC<PresetManagerProps> = ({ type, deckId, currentEffects, dispatch }) => {
  const [presets, setPresets] = useState<(FxPreset | null)[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const refreshPresets = useCallback(() => {
    setPresets(getPresets(type));
  }, [type]);

  useEffect(() => {
    refreshPresets();
  }, [refreshPresets]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoadPreset = (preset: FxPreset) => {
    if (type === 'deck' && deckId) {
      dispatch({ type: 'LOAD_DECK_PRESET', deckId, preset });
    } else if (type === 'master') {
      dispatch({ type: 'LOAD_MASTER_PRESET', preset });
    }
    toast({ title: "Preset Loaded", description: `"${preset.name}" applied.`, type: 'success' });
    setIsMenuOpen(false);
  };

  const handleSaveCurrent = (slotIndex: number, name: string) => {
    const chain: [FxSetting | null, FxSetting | null] = [null, null];
    
    currentEffects.slice(0, 2).forEach((effect, index) => {
      if (effect && effect.enabled) {
        const { id, enabled, ...params } = effect;
        chain[index] = { type: effect.type, params };
      }
    });

    const newPreset: FxPreset = {
      id: `${type}-${slotIndex}`,
      name: name,
      type: type,
      isDefault: false,
      chain: chain,
    };
    savePreset(newPreset, slotIndex);
    refreshPresets();
    toast({ title: "Preset Saved", description: `"${name}" saved to slot ${slotIndex + 1}.`, type: 'success' });
  };
  
  const handleRestoreDefaults = () => {
      if (window.confirm(`Are you sure you want to restore all ${type} presets to their defaults? This will overwrite any custom presets.`)) {
          restoreDefaults(type);
          refreshPresets();
          toast({ title: "Defaults Restored", description: `${type.charAt(0).toUpperCase() + type.slice(1)} presets have been restored.`, type: 'success' });
          setIsMenuOpen(false);
      }
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="outline" onClick={() => setIsMenuOpen(!isMenuOpen)} className="border-slate-600">
        Presets
      </Button>

      {isMenuOpen && (
        <div className="absolute z-10 bottom-full mb-2 right-0 w-64 bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-lg shadow-xl p-2">
          <p className="text-xs font-bold text-slate-400 uppercase px-2 py-1">Load Preset</p>
          <div className="max-h-48 overflow-y-auto">
            {presets.map((p, i) => (
              p ? (
                <button key={p.id} onClick={() => handleLoadPreset(p)} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-slate-700">
                  {p.name} {p.isDefault && <span className="text-xs text-slate-500">(Default)</span>}
                </button>
              ) : null
            ))}
          </div>
          <div className="border-t border-slate-700 my-2" />
          <button onClick={() => { setIsSaveModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-slate-700 font-semibold">
            Save Current Chain...
          </button>
           <button onClick={handleRestoreDefaults} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-slate-700 text-yellow-400">
            Restore Defaults
          </button>
        </div>
      )}
      
      {isSaveModalOpen && (
        <SavePresetModal 
            presets={presets}
            onSave={handleSaveCurrent}
            onClose={() => setIsSaveModalOpen(false)}
        />
      )}
    </div>
  );
};

const SavePresetModal: React.FC<{
    presets: (FxPreset | null)[],
    onSave: (slotIndex: number, name: string) => void,
    onClose: () => void,
}> = ({ presets, onSave, onClose }) => {
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [name, setName] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleSelectSlot = (index: number) => {
        setSelectedSlot(index);
        setName(presets[index]?.name || '');
    };
    
    const handleConfirmSave = () => {
        if (selectedSlot === null || !name) {
            alert("Please select a slot and provide a name.");
            return;
        }
        const existing = presets[selectedSlot];
        if (existing && !window.confirm(`This will overwrite "${existing.name}". Are you sure?`)) {
            return;
        }
        onSave(selectedSlot, name);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
            <div ref={modalRef} className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-96 p-6">
                <h3 className="text-lg font-bold mb-4">Save Preset</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400">1. Select a Slot</label>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                            {presets.map((p, i) => (
                                <button key={i} onClick={() => handleSelectSlot(i)} className={cn("w-full text-left p-2 rounded border-2", selectedSlot === i ? "border-purple-500 bg-purple-500/10" : "border-slate-600 hover:bg-slate-700")}>
                                    <span className="font-semibold">Slot {i + 1}</span>
                                    <span className="text-sm text-slate-400 ml-2">{p ? `- ${p.name}` : '(Empty)'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                     {selectedSlot !== null && (
                        <div>
                            <label className="text-xs font-bold text-slate-400">2. Name Your Preset</label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Vocal Wash" className="mt-2 bg-slate-900 border-slate-600"/>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-700">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirmSave} disabled={selectedSlot === null || !name}>
                        {presets[selectedSlot ?? -1] ? 'Overwrite' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default PresetManager;