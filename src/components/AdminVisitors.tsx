import React, { useState, useEffect } from 'react';
import { VisitorLog } from '../types';
import { 
  Users, 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Clock, 
  RefreshCw, 
  Trash2, 
  Search, 
  ExternalLink,
  Eye,
  Calendar,
  CheckCircle2,
  Shield,
  Activity,
  Layers
} from 'lucide-react';

interface AdminVisitorsProps {
  isDarkMode?: boolean;
  onAskConfirm?: (title: string, message: string, onConfirm: () => void) => void;
}

export default function AdminVisitors({ 
  isDarkMode = false,
  onAskConfirm
}: AdminVisitorsProps) {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'All' | 'Desktop' | 'Mobile' | 'Tablet'>('All');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorLog | null>(null);

  const fetchVisitors = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/visitors');
      const data = await res.json();
      if (data.success && Array.isArray(data.visitors)) {
        setVisitors(data.visitors);
      }
    } catch (err) {
      console.error('Failed to fetch visitors:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(() => {
      fetchVisitors();
    }, 15000); // Auto refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleClearHistory = () => {
    const doClear = async () => {
      try {
        const res = await fetch('/api/visitors/clear', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setVisitors([]);
        }
      } catch (err) {
        console.error('Failed to clear visitors:', err);
      }
    };

    if (onAskConfirm) {
      onAskConfirm(
        'Hapus Semua Riwayat Pengunjung',
        'Apakah Anda yakin ingin mengosongkan seluruh catatan log pengunjung website portofolio?',
        doClear
      );
    } else if (window.confirm('Hapus seluruh riwayat pengunjung?')) {
      doClear();
    }
  };

  // Format Duration
  const formatDuration = (secs?: number) => {
    if (!secs || secs < 1) return '< 1 mnt';
    if (secs < 60) return `${secs} dtk`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // Format Time
  const formatTime = (iso?: string) => {
    if (!iso) return '-';
    try {
      const date = new Date(iso);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch {
      return iso;
    }
  };

  const getRelativeTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Baru saja';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} menit yang lalu`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr} jam yang lalu`;
      const diffDay = Math.floor(diffHr / 24);
      return `${diffDay} hari yang lalu`;
    } catch {
      return '';
    }
  };

  // Filtered Visitors
  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = 
      (v.ip || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.country || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.browser || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.os || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.referrer || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDevice = deviceFilter === 'All' || v.deviceType === deviceFilter;

    return matchesSearch && matchesDevice;
  });

  // Calculate stats
  const totalVisitors = visitors.length;
  const totalVisits = visitors.reduce((sum, v) => sum + (v.visitCount || 1), 0);
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayVisitors = visitors.filter(v => (v.timestamp || '').startsWith(todayDateStr)).length;
  const desktopCount = visitors.filter(v => v.deviceType === 'Desktop').length;
  const mobileCount = visitors.filter(v => v.deviceType === 'Mobile').length;

  return (
    <div className={`space-y-6 animate-[fade-in_0.3s_ease-out] ${isDarkMode ? 'text-[#dce3f0]' : 'text-slate-700'}`}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-[#00c2ff] pl-4 py-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-[#00c2ff] uppercase">
              Real-time Traffic & Visitor Analytics
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Tracking
            </span>
          </div>
          <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>
            Daftar Pengunjung Portofolio
          </h2>
          <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'}`}>
            Melihat riwayat pengunjung website, perangkat, lokasi kota, browser, bagian yang dilihat, dan durasi kunjungan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchVisitors(true)}
            disabled={refreshing}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-[#111827] hover:bg-[#1a212e] border-[#2e353f] text-[#00c2ff]' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-sky-600 shadow-sm'
            }`}
            title="Perbarui Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
          </button>

          {visitors.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center gap-2 transition-all cursor-pointer"
              title="Kosongkan Catatan"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Unique Visitors */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode 
            ? 'bg-[#0f1422] border-[#202b3f] shadow-sm' 
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Pengunjung
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-[#00c2ff] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {totalVisitors}
          </p>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span>Perangkat unik terdeteksi</span>
          </div>
        </div>

        {/* Total Pageviews / Sessions */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode 
            ? 'bg-[#0f1422] border-[#202b3f] shadow-sm' 
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Sesi Kunjungan
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {totalVisits}
          </p>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span>Termasuk kunjungan berulang</span>
          </div>
        </div>

        {/* Today's Visitors */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode 
            ? 'bg-[#0f1422] border-[#202b3f] shadow-sm' 
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pengunjung Hari Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {todayVisitors}
          </p>
          <div className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Aktif hari ini</span>
          </div>
        </div>

        {/* Device Ratio */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode 
            ? 'bg-[#0f1422] border-[#202b3f] shadow-sm' 
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Platform Perangkat
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {desktopCount} <span className="text-xs font-normal text-slate-400">Desktop</span> / {mobileCount} <span className="text-xs font-normal text-slate-400">Mobile</span>
          </p>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span>Rasio Desktop vs Seluler</span>
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#0f1422] border-[#202b3f]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari IP, kota, browser, OS..."
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border outline-none transition-all ${
              isDarkMode 
                ? 'bg-[#151c2d] border-[#2e3b55] text-white focus:border-[#00c2ff]' 
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500'
            }`}
          />
        </div>

        {/* Device type filter pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Desktop', 'Mobile', 'Tablet'] as const).map(dev => (
            <button
              key={dev}
              type="button"
              onClick={() => setDeviceFilter(dev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                deviceFilter === dev 
                  ? 'bg-[#00c2ff] text-slate-950 shadow-sm' 
                  : isDarkMode 
                    ? 'bg-[#151c2d] text-slate-400 hover:text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dev === 'All' ? 'Semua Perangkat' : dev}
            </button>
          ))}
        </div>
      </div>

      {/* Visitors List Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-[#0f1422] border-[#202b3f]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-[#00c2ff] animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-semibold">Memuat riwayat pengunjung portofolio...</p>
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-sky-500/10 text-[#00c2ff] flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Belum Ada Log Pengunjung Terdeteksi
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-medium">
              Data pengunjung akan otomatis terekam secara rapi begitu ada yang membuka website portofolio Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${
                  isDarkMode 
                    ? 'border-[#202b3f] bg-[#121a2c] text-slate-400' 
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  <th className="py-3 px-4">Waktu Kunjungan</th>
                  <th className="py-3 px-4">Lokasi & IP</th>
                  <th className="py-3 px-4">Perangkat & OS</th>
                  <th className="py-3 px-4">Browser</th>
                  <th className="py-3 px-4">Bagian Dilihat</th>
                  <th className="py-3 px-4">Durasi & Sesi</th>
                  <th className="py-3 px-4 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredVisitors.map((vis) => {
                  const isMobile = vis.deviceType === 'Mobile';
                  const isTablet = vis.deviceType === 'Tablet';

                  return (
                    <tr 
                      key={vis.id}
                      className={`hover:bg-slate-500/5 transition-colors ${
                        isDarkMode ? 'hover:bg-[#151e33]' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatTime(vis.timestamp)}
                        </div>
                        <div className="text-[10px] text-sky-500 dark:text-[#00c2ff] font-semibold mt-0.5">
                          {getRelativeTime(vis.lastActive || vis.timestamp)}
                        </div>
                      </td>

                      {/* Location & IP */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{vis.city || 'Indonesia'}{vis.region ? `, ${vis.region}` : ''}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          IP: {vis.ip || '127.0.0.1'}
                        </div>
                      </td>

                      {/* Device & OS */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          {isMobile ? (
                            <Smartphone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          ) : isTablet ? (
                            <Tablet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          )}
                          <span>{vis.deviceType || 'Desktop'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          OS: {vis.os || 'Windows/Android'}
                        </div>
                      </td>

                      {/* Browser */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {vis.browser || 'Chrome/Safari'}
                        </span>
                        {vis.screenResolution && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {vis.screenResolution}
                          </div>
                        )}
                      </td>

                      {/* Visited Sections */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {vis.visitedSections && vis.visitedSections.length > 0 ? (
                            vis.visitedSections.map((sec, sIdx) => (
                              <span 
                                key={sIdx}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00c2ff]/10 text-sky-600 dark:text-[#00c2ff] border border-sky-500/20 whitespace-nowrap"
                              >
                                {sec}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">Beranda</span>
                          )}
                        </div>
                      </td>

                      {/* Duration & Visits */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{formatDuration(vis.durationSeconds)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {vis.visitCount && vis.visitCount > 1 
                            ? `${vis.visitCount}x kunjungan` 
                            : '1x kunjungan'}
                        </div>
                      </td>

                      {/* Detail action */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedVisitor(vis)}
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-[#00c2ff] transition-colors cursor-pointer"
                          title="Lihat Rincian Pengunjung"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Visitor Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className={`border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-[scale-up_0.2s_ease-out] ${
            isDarkMode ? 'bg-[#0f1422] border-[#202b3f]' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between ${
              isDarkMode ? 'border-[#202b3f] bg-[#121a2c]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00c2ff]/15 text-[#00c2ff] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Rincian Kunjungan Pengunjung
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    ID: {selectedVisitor.visitorId || selectedVisitor.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#151e33] border-[#25324d]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Waktu Masuk</span>
                  <p className="font-extrabold mt-1">{formatTime(selectedVisitor.timestamp)}</p>
                  <span className="text-[10px] text-sky-500 font-semibold">{getRelativeTime(selectedVisitor.timestamp)}</span>
                </div>

                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#151e33] border-[#25324d]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Durasi Total</span>
                  <p className="font-extrabold mt-1">{formatDuration(selectedVisitor.durationSeconds)}</p>
                  <span className="text-[10px] text-emerald-500 font-semibold">{selectedVisitor.visitCount || 1}x kunjungan</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-2.5 ${isDarkMode ? 'bg-[#151e33] border-[#25324d]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Alamat IP:</span>
                  <span className="font-mono font-bold text-sky-500">{selectedVisitor.ip || '127.0.0.1'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Lokasi Kota & Wilayah:</span>
                  <span className="font-bold">{selectedVisitor.city || 'Indonesia'}{selectedVisitor.region ? `, ${selectedVisitor.region}` : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Negara:</span>
                  <span className="font-bold">{selectedVisitor.country || 'Indonesia'} ({selectedVisitor.countryCode || 'ID'})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Tipe Perangkat:</span>
                  <span className="font-bold">{selectedVisitor.deviceType || 'Desktop'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Sistem Operasi:</span>
                  <span className="font-bold">{selectedVisitor.os || 'Windows/Linux'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Browser:</span>
                  <span className="font-bold">{selectedVisitor.browser || 'Google Chrome'}</span>
                </div>
                {selectedVisitor.screenResolution && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Resolusi Layar:</span>
                    <span className="font-mono font-bold">{selectedVisitor.screenResolution}</span>
                  </div>
                )}
                {selectedVisitor.referrer && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Rujukan Masuk:</span>
                    <span className="font-bold text-sky-500 truncate max-w-[200px]">{selectedVisitor.referrer}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Halaman & Bagian yang Ditelusuri:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVisitor.visitedSections && selectedVisitor.visitedSections.length > 0 ? (
                    selectedVisitor.visitedSections.map((sec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-[#00c2ff]/15 text-[#00c2ff] border border-[#00c2ff]/30"
                      >
                        {sec}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">Beranda (Home)</span>
                  )}
                </div>
              </div>

            </div>

            <div className={`p-4 border-t flex justify-end ${
              isDarkMode ? 'border-[#202b3f] bg-[#121a2c]' : 'border-slate-200 bg-slate-50'
            }`}>
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="px-4 py-2 rounded-xl bg-[#00c2ff] hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
