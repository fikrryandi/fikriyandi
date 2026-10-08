import React, { useState } from 'react';
import { Publication } from '../types';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  X, 
  Edit2, 
  Check, 
  Search, 
  Copy, 
  CheckCheck, 
  FileText, 
  Sparkles, 
  Tag, 
  Bookmark, 
  Users, 
  Link as LinkIcon 
} from 'lucide-react';

interface AdminPublicationsProps {
  publications: Publication[];
  onAddPublication: (pub: Omit<Publication, 'id'>) => void;
  onUpdatePublication: (pub: Publication) => void;
  onDeletePublication: (id: string) => void;
  isDarkMode?: boolean;
}

export default function AdminPublications({
  publications = [],
  onAddPublication,
  onUpdatePublication,
  onDeletePublication,
  isDarkMode = false
}: AdminPublicationsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Fields - Add
  const [title, setTitle] = useState('');
  const [journal, setJournal] = useState('');
  const [authors, setAuthors] = useState('Fikrry Andi, et al.');
  const [year, setYear] = useState('2025');
  const [publisher, setPublisher] = useState('');
  const [doi, setDoi] = useState('');
  const [link, setLink] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [abstract, setAbstract] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Form Fields - Edit
  const [editTitle, setEditTitle] = useState('');
  const [editJournal, setEditJournal] = useState('');
  const [editAuthors, setEditAuthors] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editPublisher, setEditPublisher] = useState('');
  const [editDoi, setEditDoi] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editPdfUrl, setEditPdfUrl] = useState('');
  const [editAbstract, setEditAbstract] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');

  const handleCopyLink = (url: string, id: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !journal.trim() || !link.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onAddPublication({
      title: title.trim(),
      journal: journal.trim(),
      authors: authors.trim() || 'Fikrry Andi, et al.',
      year: year.trim() || `${new Date().getFullYear()}`,
      publisher: publisher.trim(),
      doi: doi.trim(),
      link: link.trim(),
      pdfUrl: pdfUrl.trim(),
      abstract: abstract.trim(),
      tags: tags.length > 0 ? tags : ['Teknik Industri', 'Optimasi', 'PPIC']
    });

    // Reset Form
    setTitle('');
    setJournal('');
    setAuthors('Fikrry Andi, et al.');
    setYear(`${new Date().getFullYear()}`);
    setPublisher('');
    setDoi('');
    setLink('');
    setPdfUrl('');
    setAbstract('');
    setTagsInput('');
    setShowAddForm(false);
  };

  const handleStartEdit = (pub: Publication) => {
    setEditingPub(pub);
    setEditTitle(pub.title);
    setEditJournal(pub.journal);
    setEditAuthors(pub.authors || '');
    setEditYear(pub.year || '');
    setEditPublisher(pub.publisher || '');
    setEditDoi(pub.doi || '');
    setEditLink(pub.link || '');
    setEditPdfUrl(pub.pdfUrl || '');
    setEditAbstract(pub.abstract || '');
    setEditTagsInput(pub.tags ? pub.tags.join(', ') : '');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPub || !editTitle.trim() || !editJournal.trim() || !editLink.trim()) return;

    const tags = editTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onUpdatePublication({
      ...editingPub,
      title: editTitle.trim(),
      journal: editJournal.trim(),
      authors: editAuthors.trim() || 'Fikrry Andi, et al.',
      year: editYear.trim() || `${new Date().getFullYear()}`,
      publisher: editPublisher.trim(),
      doi: editDoi.trim(),
      link: editLink.trim(),
      pdfUrl: editPdfUrl.trim(),
      abstract: editAbstract.trim(),
      tags: tags.length > 0 ? tags : ['Teknik Industri']
    });

    setEditingPub(null);
  };

  // Filtered publications
  const filteredPubs = publications.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchTitle = p.title.toLowerCase().includes(q);
    const matchJournal = p.journal.toLowerCase().includes(q);
    const matchAuthors = p.authors ? p.authors.toLowerCase().includes(q) : false;
    const matchYear = p.year.toLowerCase().includes(q);
    const matchTags = p.tags ? p.tags.some(t => t.toLowerCase().includes(q)) : false;
    return matchTitle || matchJournal || matchAuthors || matchYear || matchTags;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black tracking-tight flex items-center gap-3 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <BookOpen className="w-7 h-7 text-[#00c2ff]" />
            Publikasi Jurnal & Karya Ilmiah
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola publikasi paper, artikel ilmiah, jurnal nasional/internasional, dan sematkan tautan akses aslinya untuk tampil di halaman Tentang (About).
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPub(null);
            setShowAddForm(!showAddForm);
          }}
          className={`flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-lg transition-all scale-98 active:scale-95 cursor-pointer ${
            showAddForm
              ? 'bg-red-500/10 hover:bg-red-500/15 text-red-500 border border-red-500/20'
              : 'bg-[#00c2ff] hover:bg-[#00a8e0] text-slate-950 font-black shadow-md shadow-sky-500/20'
          }`}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Batalkan' : 'Tambah Publikasi Jurnal'}
        </button>
      </div>

      {/* Add Publication Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className={`p-6 rounded-2xl border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-[#0b0a14] border-[#1e1c3a] shadow-xl shadow-black/10' 
            : 'bg-white border-slate-200 shadow-xl shadow-slate-100'
        }`}>
          <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-500/10">
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
              isDarkMode ? 'text-sky-400' : 'text-slate-800'
            }`}>
              <Plus className="w-4 h-4 text-[#00c2ff]" /> Form Tambah Publikasi Jurnal Baru
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">* Wajib diisi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Judul Artikel / Jurnal */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Judul Artikel / Paper Ilmiah *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Analisis dan Optimasi Penjadwalan Pengiriman Ekspor Menggunakan Pendekatan Lean Manufacturing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                  isDarkMode 
                    ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                }`}
              />
            </div>

            {/* Nama Jurnal / Konferensi */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Nama Jurnal / Konferensi / Publisher *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Jurnal Rekayasa Sistem & Industri (JRSI)"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                  isDarkMode 
                    ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                }`}
              />
            </div>

            {/* Penulis */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Penulis (Authors)
              </label>
              <input
                type="text"
                placeholder="Contoh: Fikrry Andi, Dr. Ir. Pembimbing, M.T."
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                  isDarkMode 
                    ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                }`}
              />
            </div>

            {/* Tahun / Tanggal */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Tahun / Bulan Terbit *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 2025 atau Januari 2025"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                  isDarkMode 
                    ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                }`}
              />
            </div>

            {/* Edisi / Akreditasi / Volume */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Volume / Edisi / Akreditasi (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Vol. 12 No. 1 (2025) • SINTA 2"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                  isDarkMode 
                    ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                }`}
              />
            </div>

            {/* Link Jurnal URL */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <LinkIcon className="w-3.5 h-3.5" /> Tautan / URL Link Publikasi Jurnal *
                </span>
                <span className="text-[9px] text-slate-400 font-normal">Link website jurnal atau repositori</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://ejournal.undip.ac.id/index.php/jrsi/article/view/... atau https://doi.org/10.xxxx/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors font-mono ${
                  isDarkMode 
                    ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                }`}
              />
            </div>

            {/* DOI Number */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Digital Object Identifier (DOI) (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 10.25124/jrsi.v12i1.7821"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors font-mono ${
                  isDarkMode 
                    ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                }`}
              />
            </div>

            {/* Direct PDF Link */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Link Langsung File PDF (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://.../paper.pdf"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors font-mono ${
                  isDarkMode 
                    ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                }`}
              />
            </div>

            {/* Abstrak */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Abstrak / Ringkasan Singkat Penelitian
              </label>
              <textarea
                placeholder="Tuliskan intisari masalah, metode penelitian, serta temuan penting karya ilmiah ini..."
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={3}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors leading-relaxed ${
                  isDarkMode 
                    ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                }`}
              />
            </div>

            {/* Tags / Topik */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Topik / Kata Kunci (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                placeholder="Contoh: PPIC, Supply Chain Management, Line Balancing, Optimasi"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                  isDarkMode 
                    ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-dashed border-slate-300/20 flex gap-3 justify-end items-center">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className={`px-4 py-2.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00c2ff] hover:bg-[#00a8e0] text-slate-950 text-xs font-black rounded-lg scale-98 active:scale-95 transition-all text-center flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/20"
            >
              <Check className="w-4 h-4" /> Simpan Publikasi
            </button>
          </div>
        </form>
      )}

      {/* Edit Modal Form */}
      {editingPub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-3xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative ${
            isDarkMode ? 'bg-[#0d0c18] border-[#222144] text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button
              onClick={() => setEditingPub(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-800/20 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400 hover:text-red-500" />
            </button>

            <h3 className="text-base font-black mb-4 uppercase tracking-wider flex items-center gap-2 text-sky-400">
              <Edit2 className="w-4 h-4" /> Edit Data Publikasi Jurnal
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Judul Artikel / Paper *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Nama Jurnal / Konferensi *
                  </label>
                  <input
                    type="text"
                    required
                    value={editJournal}
                    onChange={(e) => setEditJournal(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Penulis (Authors)
                  </label>
                  <input
                    type="text"
                    value={editAuthors}
                    onChange={(e) => setEditAuthors(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Tahun / Periode
                  </label>
                  <input
                    type="text"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Volume / Edisi / Akreditasi
                  </label>
                  <input
                    type="text"
                    value={editPublisher}
                    onChange={(e) => setEditPublisher(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sky-400">
                      <LinkIcon className="w-3.5 h-3.5" /> Tautan / URL Link Publikasi *
                    </span>
                    {editLink && (
                      <a 
                        href={editLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                      >
                        Tes Buka Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    required
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors font-mono ${
                      isDarkMode 
                        ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    DOI Identifier
                  </label>
                  <input
                    type="text"
                    value={editDoi}
                    onChange={(e) => setEditDoi(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors font-mono ${
                      isDarkMode 
                        ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Link PDF Langsung
                  </label>
                  <input
                    type="url"
                    value={editPdfUrl}
                    onChange={(e) => setEditPdfUrl(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors font-mono ${
                      isDarkMode 
                        ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Abstrak / Ringkasan
                  </label>
                  <textarea
                    value={editAbstract}
                    onChange={(e) => setEditAbstract(e.target.value)}
                    rows={3}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors leading-relaxed ${
                      isDarkMode 
                        ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Topik / Tags (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={editTagsInput}
                    onChange={(e) => setEditTagsInput(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border focus:outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-[#151426] border-[#222144] focus:border-[#00c2ff] text-white' 
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-slate-600/30 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPub(null)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-lg border cursor-pointer ${
                    isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00c2ff] hover:bg-[#00a8e0] text-slate-950 text-xs font-black rounded-lg transition-colors cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  Perbarui Publikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Counter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari judul, jurnal, penulis, atau topik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-none transition-all ${
              isDarkMode 
                ? 'bg-[#0f0e1c] border-[#1e1c3a] focus:border-[#00c2ff] text-white placeholder-slate-500' 
                : 'bg-white border-slate-200 focus:border-sky-500 text-slate-800 placeholder-slate-400 shadow-sm'
            }`}
          />
        </div>

        <div className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full border ${
          isDarkMode ? 'bg-[#0b0a14] border-[#1e1c3a] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          Total: <span className="text-[#00c2ff] font-black">{publications.length}</span> Karya Ilmiah Terdaftar
        </div>
      </div>

      {/* Publications List */}
      {filteredPubs.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDarkMode ? 'bg-[#0b0a14] border-[#1e1c3a]' : 'bg-slate-50 border-slate-100'
        }`}>
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto opacity-40 mb-3 animate-pulse" />
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest text-center">
            {searchQuery ? 'Tidak Ada Publikasi Sesuai Pencarian' : 'Belum Ada Publikasi Jurnal'}
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {searchQuery 
              ? 'Silakan coba kata kunci lain untuk menemukan artikel ilmiah yang dicari.'
              : 'Gunakan tombol "Tambah Publikasi Jurnal" di atas untuk menyematkan karya ilmiah, paper, atau artikel jurnal Anda beserta link aksesnya.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPubs.map((pub, idx) => (
            <div
              key={pub.id || idx}
              className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                isDarkMode 
                  ? 'bg-[#0b0a14] border-[#1e1c3a] text-white hover:border-[#00c2ff]/40 shadow-lg shadow-black/20' 
                  : 'bg-white border-slate-200 text-slate-800 hover:shadow-xl hover:shadow-slate-150/60'
              }`}
            >
              {/* Header Badges: Journal, Year, Publisher */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isDarkMode 
                      ? 'bg-sky-950/60 border border-sky-500/30 text-sky-300' 
                      : 'bg-sky-50 border border-sky-200 text-sky-800'
                  }`}>
                    <Bookmark className="w-3 h-3 text-[#00c2ff]" />
                    {pub.journal}
                  </span>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {pub.year}
                  </span>

                  {pub.publisher && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isDarkMode ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {pub.publisher}
                    </span>
                  )}
                </div>

                {/* Actions: Test Link, Copy URL, Edit, Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {pub.link && (
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noreferrer"
                      title="Buka Tautan Jurnal di Tab Baru"
                      className="p-2 rounded-lg text-slate-400 hover:text-[#00c2ff] hover:bg-sky-500/10 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => handleCopyLink(pub.link, pub.id)}
                    title="Salin URL Tautan Jurnal"
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    {copiedId === pub.id ? (
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleStartEdit(pub)}
                    title="Edit Publikasi"
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeletePublication(pub.id)}
                    title="Hapus Publikasi"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-black tracking-tight leading-snug mb-2 pr-2">
                <a 
                  href={pub.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-[#00c2ff] transition-colors inline-flex items-center gap-1.5"
                >
                  {pub.title}
                </a>
              </h3>

              {/* Authors & DOI */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
                {pub.authors && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{pub.authors}</span>
                  </div>
                )}

                {pub.doi && (
                  <div className="flex items-center gap-1 text-[11px] font-mono text-sky-400/90">
                    <span className="font-bold">DOI:</span>
                    <a 
                      href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {pub.doi}
                    </a>
                  </div>
                )}
              </div>

              {/* Abstract */}
              {pub.abstract && (
                <p className={`text-xs leading-relaxed mb-3 ${isDarkMode ? 'text-slate-300/90' : 'text-slate-650'}`}>
                  {pub.abstract}
                </p>
              )}

              {/* Footer: Tags & Direct URL Link Preview */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-dashed border-slate-500/15">
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {pub.tags && pub.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold ${
                        isDarkMode ? 'bg-[#151426] text-slate-400 border border-[#222144]' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Tag className="w-2.5 h-2.5 text-[#00c2ff]" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Direct Link button */}
                {pub.link && (
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-lg border transition-all ${
                      isDarkMode 
                        ? 'bg-[#00c2ff]/10 hover:bg-[#00c2ff]/20 border-[#00c2ff]/30 text-[#00c2ff]' 
                        : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800'
                    }`}
                  >
                    <span>Kunjungi Jurnal Asli</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
