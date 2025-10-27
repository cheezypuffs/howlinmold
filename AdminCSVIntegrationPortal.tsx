// FIX: Added React import to solve JSX errors.
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from '../motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { enqueueCSVUpload } from '../../utils/db';
import type { SpotifyTrackData } from '../../types';
import { 
  Upload, 
  Music, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database, 
  Disc3, 
  Sparkles,
  FileText,
  BarChart3 as BarChart,
  Cog as Settings,
  Archive,
  Brain,
  Waves,
  Crown,
  Zap,
  Loader2,
} from '../Icons';
import { useToast } from '../../hooks/use-toast';
import { Tooltip } from '../ui/Tooltip';

interface AdminCSVIntegrationPortalProps {
  onDataChange: () => void;
  isAdminUser: boolean;
}

interface VinylProcessingOptions {
  rarityAlgorithm: 'ai_enhanced' | 'audio_features' | 'popularity_based' | 'manual';
  enableMysticProperties: boolean;
  generateFrequencyProfiles: boolean;
  createConsciousnessRatings: boolean;
  enableQuantumRarity: boolean;
  batchSize: number;
  priceMultiplier: number;
  enforceQualityThreshold: boolean;
  qualityThreshold: number;
}

interface UploadBatch {
  id: string;
  filename: string;
  totalRows: number;
  processedRows: number;
  validatedRows: number;
  status: 'parsing' | 'validating' | 'processing' | 'completed' | 'failed';
  options: VinylProcessingOptions;
  startTime: string;
  endTime?: string;
  error?: string;
  warnings: string[];
  results?: {
    vinylRecordsCreated: number;
    rarityDistribution: Record<string, number>;
    avgPrice: number;
    totalValue: number;
    mysticPropertiesGenerated: number;
  };
}

const DEFAULT_OPTIONS: VinylProcessingOptions = {
  rarityAlgorithm: 'ai_enhanced',
  enableMysticProperties: true,
  generateFrequencyProfiles: true,
  createConsciousnessRatings: true,
  enableQuantumRarity: true,
  batchSize: 100,
  priceMultiplier: 1.0,
  enforceQualityThreshold: true,
  qualityThreshold: 30
};

const RARITY_LEVELS = [
  { name: 'Common', weight: 0.45, basePrice: 15, color: '#6b7280' },
  { name: 'Uncommon', weight: 0.25, basePrice: 25, color: '#22c55e' },
  { name: 'Rare', weight: 0.15, basePrice: 45, color: '#3b82f6' },
  { name: 'Epic', weight: 0.10, basePrice: 85, color: '#a855f7' },
  { name: 'Legendary', weight: 0.04, basePrice: 150, color: '#f59e0b' },
  { name: 'Mythic', weight: 0.01, basePrice: 300, color: '#ef4444' }
];

const MYSTIC_PROPERTIES = [
  'Temporal Resonance', 'Quantum Entanglement', 'Consciousness Amplifier',
  'Reality Anchor', 'Frequency Stabilizer', 'Memory Crystallizer',
  'Dimensional Bridge', 'Sonic Catalyst', 'Harmonic Convergence',
  'Neural Synchronizer', 'Psychedelic Gateway', 'Sacred Geometry'
];

const RarityBarChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
    const sortedData = Object.entries(data).sort((a, b) => Number(b[1]) - Number(a[1]));
    const total = sortedData.reduce((sum, item) => sum + Number(item[1]), 0);
    if (total === 0) return null;

    return (
        <div className="space-y-2">
            {sortedData.map(([rarity, count]) => {
                const rarityInfo = RARITY_LEVELS.find(r => r.name === rarity);
                const percentage = (Number(count) / total) * 100;
                return (
                    <div key={rarity} className="flex items-center gap-2 text-sm">
                        <span className="w-24 font-mono text-slate-400">{rarity}</span>
                        <div className="flex-grow bg-slate-700/50 rounded-full h-4">
                             <Tooltip text={`${Number(count)} records (${percentage.toFixed(1)}%)`}>
                                <div
                                    className="h-4 rounded-full transition-all"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: rarityInfo?.color || '#ffffff',
                                    }}
                                />
                            </Tooltip>
                        </div>
                        <span className="w-12 text-right font-mono text-slate-300">{String(count)}</span>
                    </div>
                );
            })}
        </div>
    );
};

const AdminCSVIntegrationPortal: React.FC<AdminCSVIntegrationPortalProps> = ({ 
  onDataChange, 
  isAdminUser 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<UploadBatch | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadBatch[]>([]);
  const [options, setOptions] = useState<VinylProcessingOptions>(DEFAULT_OPTIONS);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
    const analyticsData = useMemo(() => {
        if (uploadHistory.length === 0) return null;

        const completedBatches = uploadHistory.filter(b => b.status === 'completed' && b.results);
        if (completedBatches.length === 0) return null;

        const totalBatches = uploadHistory.length;
        const totalSuccess = completedBatches.length;
        const totalFailed = uploadHistory.filter(b => b.status === 'failed').length;

        const totalRecordsCreated = completedBatches.reduce((sum, b) => sum + (b.results?.vinylRecordsCreated || 0), 0);
        const totalValue = completedBatches.reduce((sum, b) => sum + (b.results?.totalValue || 0), 0);
        const totalMysticProps = completedBatches.reduce((sum, b) => sum + (b.results?.mysticPropertiesGenerated || 0), 0);

        const rarityDistribution = completedBatches.reduce((acc, b) => {
            if (b.results?.rarityDistribution) {
                for (const rarity in b.results.rarityDistribution) {
                    acc[rarity] = (acc[rarity] || 0) + b.results.rarityDistribution[rarity];
                }
            }
            return acc;
        }, {} as Record<string, number>);

        return {
            totalBatches,
            totalSuccess,
            totalFailed,
            successRate: totalBatches > 0 ? (totalSuccess / totalBatches) * 100 : 0,
            totalRecordsCreated,
            totalValue,
            totalMysticProps,
            avgPrice: totalRecordsCreated > 0 ? totalValue / totalRecordsCreated : 0,
            rarityDistribution,
        };
    }, [uploadHistory]);

  // Admin-only access check
  if (!isAdminUser) {
    return (
      <Card className="bg-black/40 border-red-500/30">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-400 mb-2">Admin Access Required</h3>
          <p className="text-white/70">
            Vinyl Archive management is restricted to administrators only.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const normalizeCSVData = (headers: string[], row: string[]): Record<string, string> => {
    const normalized: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
      normalized[normalizedHeader] = (row[index] || '').trim();
    });
    
    return normalized;
  };

  const calculateVinylRarity = (track: any, algorithm: string): string => {
    switch (algorithm) {
      case 'ai_enhanced':
        // Advanced AI-based rarity calculation
        const aiScore = (
          (track.popularity || 50) * 0.3 +
          (track.danceability || 0.5) * 100 * 0.2 +
          (track.energy || 0.5) * 100 * 0.2 +
          (track.valence || 0.5) * 100 * 0.15 +
          (track.acousticness || 0.5) * 100 * 0.15
        ) / 100;
        
        // Quantum randomness factor
        const quantumFactor = options.enableQuantumRarity ? Math.random() * 0.2 - 0.1 : 0;
        const finalScore = Math.max(0, Math.min(1, aiScore + quantumFactor));
        
        if (finalScore > 0.95) return 'Mythic';
        if (finalScore > 0.85) return 'Legendary';
        if (finalScore > 0.70) return 'Epic';
        if (finalScore > 0.50) return 'Rare';
        if (finalScore > 0.30) return 'Uncommon';
        return 'Common';
        
      case 'audio_features':
        // Based on audio characteristics
        const uniqueness = Math.abs(0.5 - (track.danceability || 0.5)) +
                          Math.abs(0.5 - (track.energy || 0.5)) +
                          Math.abs(0.5 - (track.valence || 0.5));
        
        if (uniqueness > 1.2) return 'Legendary';
        if (uniqueness > 0.9) return 'Epic';
        if (uniqueness > 0.6) return 'Rare';
        if (uniqueness > 0.3) return 'Uncommon';
        return 'Common';
        
      case 'popularity_based':
        // Inverse popularity (rare = less popular)
        const popularity = track.popularity || 50;
        if (popularity < 10) return 'Mythic';
        if (popularity < 25) return 'Legendary';
        if (popularity < 40) return 'Epic';
        if (popularity < 60) return 'Rare';
        if (popularity < 80) return 'Uncommon';
        return 'Common';
        
      default:
        return 'Common';
    }
  };

  const generateMysticProperties = (track: any): string[] => {
    if (!options.enableMysticProperties) return [];
    
    const properties: string[] = [];
    const numProperties = Math.floor(Math.random() * 3) + 1; // 1-3 properties
    
    // Select random mystic properties based on audio features
    const availableProperties = [...MYSTIC_PROPERTIES];
    for (let i = 0; i < numProperties && availableProperties.length > 0; i++) {
      const index = Math.floor(Math.random() * availableProperties.length);
      properties.push(availableProperties.splice(index, 1)[0]);
    }
    
    return properties;
  };

  const convertToEnhancedVinylFormat = (csvRow: Record<string, string>, index: number): SpotifyTrackData => {
    const trackName = csvRow.track_name || csvRow.track || csvRow.title || csvRow.song || `Track ${index}`;
    const artistName = csvRow.artist_name || csvRow.artist || csvRow.primary_artist || 'Unknown Artist';
    const albumName = csvRow.album_name || csvRow.album || csvRow.release_name || 'Unknown Album';
    const releaseDate = csvRow.release_date || csvRow.date || csvRow.year || '1970-01-01';
    
    // Enhanced audio features parsing
    const popularity = Math.max(0, Math.min(100, parseInt(csvRow.popularity || '50') || 50));
    const danceability = Math.max(0, Math.min(1, parseFloat(csvRow.danceability || String(Math.random()))));
    const energy = Math.max(0, Math.min(1, parseFloat(csvRow.energy || String(Math.random()))));
    const valence = Math.max(0, Math.min(1, parseFloat(csvRow.valence || String(Math.random()))));
    const acousticness = Math.max(0, Math.min(1, parseFloat(csvRow.acousticness || String(Math.random()))));
    const instrumentalness = Math.max(0, Math.min(1, parseFloat(csvRow.instrumentalness || String(Math.random()))));
    
    // Create base track data
    const baseTrack:Partial<SpotifyTrackData> = {
      id: csvRow.spotify_id || csvRow.track_id || `vinyl_${Date.now()}_${index}`,
      name: trackName,
      artists: [{ name: artistName }],
      album: {
        name: albumName,
        artists: [{ name: csvRow.album_artist || artistName }],
        release_date: releaseDate.match(/^\d{4}$/) ? `${releaseDate}-01-01` : releaseDate,
        images: csvRow.cover_art_url || csvRow.album_art || csvRow.image_url 
          ? [{ url: csvRow.cover_art_url || csvRow.album_art || csvRow.image_url }] 
          : []
      },
      duration_ms: parseInt(csvRow.duration_ms || '180000'),
      preview_url: csvRow.preview_url || null,
      external_ids: csvRow.isrc ? { isrc: csvRow.isrc } : {},
      popularity,
      explicit: csvRow.explicit === 'true' || csvRow.explicit === '1',
      danceability,
      energy,
      valence,
      acousticness,
      instrumentalness
    };

    // Calculate vinyl-specific properties
    const rarity = calculateVinylRarity(baseTrack, options.rarityAlgorithm);
    const rarityInfo = RARITY_LEVELS.find(r => r.name === rarity) || RARITY_LEVELS[0];
    const mysticProperties = generateMysticProperties(baseTrack);
    
    // Calculate enhanced pricing
    const basePrice = rarityInfo.basePrice * options.priceMultiplier;
    const mysticBonus = mysticProperties.length * 10;
    const qualityBonus = Math.max(0, (popularity - 50) / 10) * 5;
    const finalPrice = Math.round((basePrice + mysticBonus + qualityBonus) * 100) / 100;

    // Add vinyl-specific metadata
    (baseTrack as any).vinyl_metadata = {
      rarity,
      rarity_color: rarityInfo.color,
      base_price: finalPrice,
      mystic_properties: mysticProperties,
      consciousness_rating: options.createConsciousnessRatings ? Math.floor(Math.random() * 100) + 1 : null,
      frequency_profile: options.generateFrequencyProfiles ? {
        low: Math.random(),
        mid: Math.random(),
        high: Math.random(),
        sub: Math.random()
      } : null,
      quantum_signature: options.enableQuantumRarity ? `QS${Date.now().toString(36).toUpperCase()}` : null,
      archive_date: new Date().toISOString(),
      catalog_number: `HM${Date.now().toString(36).toUpperCase()}-${index.toString().padStart(4, '0')}`
    };

    return baseTrack as SpotifyTrackData;
  };

  const validateVinylData = (tracks: SpotifyTrackData[]): { valid: SpotifyTrackData[], warnings: string[] } => {
    const valid: SpotifyTrackData[] = [];
    const warnings: string[] = [];

    tracks.forEach((track, index) => {
      let isValid = true;

      // Quality threshold check
      if (options.enforceQualityThreshold && (track.popularity || 0) < options.qualityThreshold) {
        warnings.push(`Track ${index + 1} (${track.name}) below quality threshold (${track.popularity})`);
        isValid = false;
      }

      // Required field validation
      if (!track.name || track.name.trim().length === 0) {
        warnings.push(`Track ${index + 1} missing track name`);
        isValid = false;
      }

      if (!track.artists || track.artists.length === 0 || !track.artists[0].name) {
        warnings.push(`Track ${index + 1} missing artist information`);
        isValid = false;
      }

      if (isValid) {
        valid.push(track);
      }
    });

    return { valid, warnings };
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file containing Spotify data');
      toast({ title: '❌ Invalid file format', description: 'Only CSV files are supported for vinyl archive uploads', type: 'error' });
      return;
    }

    setError(null);
    
    const batchId = `vinyl_batch_${Date.now()}`;
    const batch: UploadBatch = {
      id: batchId,
      filename: file.name,
      totalRows: 0,
      processedRows: 0,
      validatedRows: 0,
      status: 'parsing',
      options: { ...options },
      startTime: new Date().toISOString(),
      warnings: []
    };
    
    setCurrentBatch(batch);
    toast({ title: '🎵 Processing Spotify vinyl archive data...', description: 'Parsing CSV and applying consciousness algorithms' });

    try {
      // Read and parse CSV
      const csvText = await file.text();
      const lines = csvText.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      const headers = parseCSVLine(lines[0]);
      const dataRows = lines.slice(1);
      
      batch.totalRows = dataRows.length;
      batch.status = 'validating';
      setCurrentBatch({ ...batch });

      // Convert CSV data to enhanced vinyl format
      const vinylTracks: SpotifyTrackData[] = [];
      
      for (let i = 0; i < dataRows.length; i++) {
        try {
          const row = parseCSVLine(dataRows[i]);
          if (row.length < headers.length / 2) continue;
          
          const csvData = normalizeCSVData(headers, row);
          const vinylTrack = convertToEnhancedVinylFormat(csvData, i);
          vinylTracks.push(vinylTrack);
          
          batch.processedRows = i + 1;
          setCurrentBatch({ ...batch });
          
        } catch (rowError) {
          batch.warnings.push(`Row ${i + 1}: ${rowError}`);
        }
      }

      // Validate vinyl data
      batch.status = 'processing';
      setCurrentBatch({ ...batch });
      
      const { valid: validTracks, warnings } = validateVinylData(vinylTracks);
      batch.warnings.push(...warnings);
      batch.validatedRows = validTracks.length;

      if (validTracks.length === 0) {
        throw new Error('No valid vinyl records could be created from the CSV data');
      }

      // Calculate results
      const rarityDistribution: Record<string, number> = {};
      let totalValue = 0;
      let mysticPropertiesCount = 0;

      validTracks.forEach(track => {
        const metadata = (track as any).vinyl_metadata;
        if (metadata) {
          rarityDistribution[metadata.rarity] = (rarityDistribution[metadata.rarity] || 0) + 1;
          totalValue += metadata.base_price;
          mysticPropertiesCount += metadata.mystic_properties?.length || 0;
        }
      });

      // Enqueue for vinyl archive processing
      await enqueueCSVUpload(file.name, validTracks);
      
      // Complete batch
      batch.status = 'completed';
      batch.endTime = new Date().toISOString();
      batch.results = {
        vinylRecordsCreated: validTracks.length,
        rarityDistribution,
        avgPrice: Math.round((totalValue / validTracks.length) * 100) / 100,
        totalValue: Math.round(totalValue * 100) / 100,
        mysticPropertiesGenerated: mysticPropertiesCount
      };
      
      setCurrentBatch({ ...batch });
      setUploadHistory(prev => [batch, ...prev.slice(0, 9)]);
      onDataChange();

      // Success notification
      toast({
        title: '🎵 Vinyl archive successfully populated!',
        description: `${validTracks.length} vinyl records added to the consciousness marketplace`,
        type: 'success',
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred during processing.';
      setError(errorMessage);
      toast({ title: '❌ Upload Failed', description: errorMessage, type: 'error' });
      setCurrentBatch(prev => {
        if (!prev) return null;
        const failedBatch = { ...prev, status: 'failed' as const, error: errorMessage, endTime: new Date().toISOString() };
        setUploadHistory(h => [failedBatch, ...h.slice(0, 9)]);
        return failedBatch;
      });
    }
  };
  
  // The component's JSX return statement was missing, this is a plausible reconstruction.
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upload">Upload & Process</TabsTrigger>
        <TabsTrigger value="history">Upload History</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <div 
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop} 
          className={`p-8 border-2 border-dashed rounded-lg ${dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600'}`}
        >
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
            <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-white">Drag and drop a CSV file</h3>
                <p className="mt-1 text-xs text-slate-500">or</p>
                <Button onClick={() => fileInputRef.current?.click()} className="mt-2">Select file</Button>
            </div>
        </div>
        {error && <Alert variant="destructive" className="mt-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </TabsContent>
      <TabsContent value="history">
        {uploadHistory.map(batch => <div key={batch.id}>{batch.filename} - {batch.status}</div>)}
      </TabsContent>
       <TabsContent value="analytics">
        {analyticsData && <div>Total Records: {analyticsData.totalRecordsCreated}</div>}
      </TabsContent>
    </Tabs>
  );
};
export default AdminCSVIntegrationPortal;