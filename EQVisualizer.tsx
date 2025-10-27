import React, { useRef, useEffect } from 'react';
import { clamp } from '../utils/helpers';

interface EQVisualizerProps {
    lowGain: number;
    midGain: number;
    highGain: number;
    lowKill: boolean;
    midKill: boolean;
    highKill: boolean;
    color: string;
    width: number;
    height: number;
    mode: 'eq' | 'iso';
    lowMidCrossover: number;
    midHighCrossover: number;
    filterValue: number;
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({ lowGain, midGain, highGain, lowKill, midKill, highKill, color, width, height, mode, lowMidCrossover, midHighCrossover, filterValue }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (width <= 0 || height <= 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const FREQ_MIN = 20; const FREQ_MAX = 20000; const DB_MIN = -36; const DB_MAX = 6; const DB_KILL = -48;
        const LOW_SHELF_FREQ = 320; const MID_PEAK_FREQ = 1000; const HIGH_SHELF_FREQ = 3200; const MID_Q = 0.5;

        const freqToX = (freq: number) => ((Math.log(freq) - Math.log(FREQ_MIN)) / (Math.log(FREQ_MAX) - Math.log(FREQ_MIN))) * width;
        const dbToY = (db: number) => height - ((clamp(db, DB_MIN, DB_MAX) - DB_MIN) / (DB_MAX - DB_MIN)) * height;
        
        const getEqResponse = (freq: number) => {
            let totalGain = 0;
            const lg = lowKill ? DB_KILL : lowGain; const mg = midKill ? DB_KILL : midGain; const hg = highKill ? DB_KILL : highGain;
            totalGain += lg / (1.0 + Math.pow(freq / LOW_SHELF_FREQ, 2));
            const x_mid = Math.log(freq / MID_PEAK_FREQ) / Math.log(2);
            totalGain += mg * Math.exp(-0.5 * Math.pow(x_mid / (MID_Q * 2), 2));
            totalGain += hg / (1.0 + Math.pow(HIGH_SHELF_FREQ / freq, 2));
            return totalGain;
        };
        const getIsoResponse = (freq: number) => {
            const lg = lowKill ? DB_KILL : lowGain; const mg = midKill ? DB_KILL : midGain; const hg = highKill ? DB_KILL : highGain;
            const lin_lg_sq = Math.pow(10, lg / 10); const lin_mg_sq = Math.pow(10, mg / 10); const lin_hg_sq = Math.pow(10, hg / 10);
            const order = 4;
            const lp_power_resp = 1 / (1 + Math.pow(freq / lowMidCrossover, order));
            const hp_power_resp = 1 / (1 + Math.pow(midHighCrossover / freq, order));
            const bp_power_resp = (1 / (1 + Math.pow(lowMidCrossover / freq, order))) * (1 / (1 + Math.pow(freq / midHighCrossover, order)));
            const total_power = lp_power_resp * lin_lg_sq + bp_power_resp * lin_mg_sq + hp_power_resp * lin_hg_sq;
            if (total_power <= 0) return DB_MIN;
            return 10 * Math.log10(total_power);
        };
        const getFilterResponse = (freq: number) => {
            if (filterValue === 0) return 0;
            let fc: number, gain_db = 0;
            if (filterValue < 0) { fc = 20000 * Math.pow(10, filterValue * 3); gain_db = -10 * Math.log10(1 + Math.pow(freq / fc, 4)); }
            else { fc = 20 * Math.pow(1000, filterValue); gain_db = -10 * Math.log10(1 + Math.pow(fc / freq, 4)); }
            return gain_db;
        };
        const getResponse = (freq: number) => (mode === 'iso' ? getIsoResponse(freq) : getEqResponse(freq)) + getFilterResponse(freq);

        const zeroDbY = dbToY(0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(0, zeroDbY); ctx.lineTo(width, zeroDbY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, dbToY(getResponse(FREQ_MIN)));
        for (let x = 1; x < width; x++) {
          const logFreq = (x / width) * (Math.log10(FREQ_MAX) - Math.log10(FREQ_MIN)) + Math.log10(FREQ_MIN);
          const freq = Math.pow(10, logFreq); ctx.lineTo(x, dbToY(getResponse(freq)));
        }
        ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 4; ctx.stroke(); ctx.shadowBlur = 0;
        ctx.lineTo(width, zeroDbY); ctx.lineTo(0, zeroDbY); ctx.closePath();
        const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
        fillGradient.addColorStop(0, `${color}50`); fillGradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = fillGradient; ctx.fill();

    }, [lowGain, midGain, highGain, lowKill, midKill, highKill, color, width, height, mode, lowMidCrossover, midHighCrossover, filterValue]);

    return <canvas ref={canvasRef} style={{ width, height }} />;
};

export default EQVisualizer;