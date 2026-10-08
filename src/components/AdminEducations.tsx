import React, { useState, useRef } from 'react';
import { Education } from '../types';
import { 
  Plus, 
  Trash2, 
  GraduationCap, 
  X, 
  Edit3,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Award,
  Calendar,
  Layers,
  BookOpen,
  Info,
  Check,
  CheckCircle2,
  Tag,
  ArrowUp,
  ArrowDown,
  FileText,
  ExternalLink
} from 'lucide-react';

interface AdminEducationsProps {
  educations: Education[];
  onAddEducation: (edu: Omit<Education, 'id'>) => void;
  onUpdateEducation: (edu: Education) => void;
  onDeleteEducation: (id: string) => void;
  isDarkMode?: boolean;
}

// Crisp LinkedIn Default School Logo SVG
export const DefaultSchoolLogoIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-[#e2e8f0] dark:bg-[#1e293b] border border-slate-300/70 dark:border-slate-700/70 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="currentColor" className="text-slate-200 dark:text-slate-800" />
      <circle cx="42" cy="58" r="26" fill="#94a3b8" fillOpacity="0.65" />
      <circle cx="62" cy="46" r="24" fill="#64748b" fillOpacity="0.8" />
    </svg>
  </div>
);

// High-Definition Logo Image Compressor
const compressLogoImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (!base64) {
        resolve('');
        return;
      }
      // If transparent PNG or SVG under 300KB, preserve original transparent data
      if ((file.type.includes('png') || file.type.includes('svg')) && file.size < 300000) {
        resolve(base64);
        return;
      }
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(base64);
        }
      };
      img.onerror = () => resolve(base64);
    };
    reader.readAsDataURL(file);
  });
};

const SUGGESTED_HARD_SKILLS = [
  'PPIC',
  'Lean Manufacturing',
  'Line Balancing',
  'Microsoft Excel',
  'Microsoft Word',
  'Microsoft Office',
  'Process Optimization',
  'Quality Control (QC/QA)',
  'Data Analysis',
  'Supply Chain Management',
  'Google Apps Script',
  'Web Development'
];

const SUGGESTED_SOFT_SKILLS = [
  'Kepemimpinan (Leadership)',
  'Komunikasi Efektif',
  'Problem Solving',
  'Critical Thinking',
  'Kerja Sama Tim (Teamwork)',
  'Negosiasi',
  'Manajemen Waktu',
  'Adaptabilitas'
];

const SUGGESTED_SKILLS = [...SUGGESTED_HARD_SKILLS, ...SUGGESTED_SOFT_SKILLS];

export default function AdminEducations({
  educations,
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation,
  isDarkMode = false
}: AdminEducationsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  // Form states for Add
  const [school, setSchool] = useState('');
  const [schoolEN, setSchoolEN] = useState('');
  const [stage, setStage] = useState('');
  const [stageEN, setStageEN] = useState('');
  const [years, setYears] = useState('');
  const [grade, setGrade] = useState('');
  const [activities, setActivities] = useState('');
  const [activitiesEN, setActivitiesEN] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEN, setDescriptionEN] = useState('');
  const [logo, setLogo] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [hardSkills, setHardSkills] = useState<string[]>([]);
  const [hardSkillInput, setHardSkillInput] = useState('');
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [softSkillInput, setSoftSkillInput] = useState('');

  // Form states for Edit
  const [editSchool, setEditSchool] = useState('');
  const [editSchoolEN, setEditSchoolEN] = useState('');
  const [editStage, setEditStage] = useState('');
  const [editStageEN, setEditStageEN] = useState('');
  const [editYears, setEditYears] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editActivities, setEditActivities] = useState('');
  const [editActivitiesEN, setEditActivitiesEN] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDescriptionEN, setEditDescriptionEN] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editSkillInput, setEditSkillInput] = useState('');
  const [editHardSkills, setEditHardSkills] = useState<string[]>([]);
  const [editHardSkillInput, setEditHardSkillInput] = useState('');
  const [editSoftSkills, setEditSoftSkills] = useState<string[]>([]);
  const [editSoftSkillInput, setEditSoftSkillInput] = useState('');

  // Diploma / Ijazah states for Add Form
  const [diplomaUrl, setDiplomaUrl] = useState('');
  const [diplomaType, setDiplomaType] = useState<'pdf' | 'image'>('image');
  const [diplomaName, setDiplomaName] = useState('');
  const [isUploadingDiploma, setIsUploadingDiploma] = useState(false);

  // Diploma / Ijazah states for Edit Form
  const [editDiplomaUrl, setEditDiplomaUrl] = useState('');
  const [editDiplomaType, setEditDiplomaType] = useState<'pdf' | 'image'>('image');
  const [editDiplomaName, setEditDiplomaName] = useState('');
  const [isUploadingEditDiploma, setIsUploadingEditDiploma] = useState(false);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const addDiplomaFileRef = useRef<HTMLInputElement>(null);
  const editDiplomaFileRef = useRef<HTMLInputElement>(null);

  // Upload Diploma / Ijazah document (PDF or Image)
  const handleDiplomaUpload = async (file: File, isEdit: boolean) => {
    if (!file) return;
    if (isEdit) setIsUploadingEditDiploma(true);
    else setIsUploadingDiploma(true);

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const docType: 'pdf' | 'image' = isPdf ? 'pdf' : 'image';
      const cleanName = file.name;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileData: base64Data, fileName: cleanName, folder: 'ijazah' })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              if (isEdit) {
                setEditDiplomaUrl(data.url);
                setEditDiplomaType(docType);
                setEditDiplomaName(cleanName);
              } else {
                setDiplomaUrl(data.url);
                setDiplomaType(docType);
                setDiplomaName(cleanName);
              }
              return;
            }
          }
        } catch (err) {
          console.error("Upload diploma failed, fallback to base64", err);
        }
        // Fallback
        if (isEdit) {
          setEditDiplomaUrl(base64Data);
          setEditDiplomaType(docType);
          setEditDiplomaName(cleanName);
        } else {
          setDiplomaUrl(base64Data);
          setDiplomaType(docType);
          setDiplomaName(cleanName);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      if (isEdit) setIsUploadingEditDiploma(false);
      else setIsUploadingDiploma(false);
    }
  };

  // Handle Logo Upload
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressLogoImage(file);
    let finalUrl = compressed;
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: compressed, fileName: file.name, folder: 'edu-logo' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) finalUrl = data.url;
      }
    } catch (err) {
      console.error("Education logo upload to server failed, using compressed fallback:", err);
    }
    if (isEdit) {
      setEditLogo(finalUrl);
    } else {
      setLogo(finalUrl);
    }
  };

  // Add Skill Tag
  const handleAddSkillTag = (skill: string, isEdit: boolean) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (isEdit) {
      if (!editSkills.includes(trimmed)) {
        setEditSkills([...editSkills, trimmed]);
      }
      setEditSkillInput('');
    } else {
      if (!skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
      }
      setSkillInput('');
    }
  };

  // Remove Skill Tag
  const handleRemoveSkillTag = (skillToRemove: string, isEdit: boolean) => {
    if (isEdit) {
      setEditSkills(editSkills.filter(s => s !== skillToRemove));
    } else {
      setSkills(skills.filter(s => s !== skillToRemove));
    }
  };

  // Add Hard Skill Tag
  const handleAddHardSkillTag = (skill: string, isEdit: boolean) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (isEdit) {
      if (!editHardSkills.includes(trimmed)) {
        setEditHardSkills([...editHardSkills, trimmed]);
      }
      setEditHardSkillInput('');
    } else {
      if (!hardSkills.includes(trimmed)) {
        setHardSkills([...hardSkills, trimmed]);
      }
      setHardSkillInput('');
    }
  };

  // Remove Hard Skill Tag
  const handleRemoveHardSkillTag = (skillToRemove: string, isEdit: boolean) => {
    if (isEdit) {
      setEditHardSkills(editHardSkills.filter(s => s !== skillToRemove));
    } else {
      setHardSkills(hardSkills.filter(s => s !== skillToRemove));
    }
  };

  // Add Soft Skill Tag
  const handleAddSoftSkillTag = (skill: string, isEdit: boolean) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (isEdit) {
      if (!editSoftSkills.includes(trimmed)) {
        setEditSoftSkills([...editSoftSkills, trimmed]);
      }
      setEditSoftSkillInput('');
    } else {
      if (!softSkills.includes(trimmed)) {
        setSoftSkills([...softSkills, trimmed]);
      }
      setSoftSkillInput('');
    }
  };

  // Remove Soft Skill Tag
  const handleRemoveSoftSkillTag = (skillToRemove: string, isEdit: boolean) => {
    if (isEdit) {
      setEditSoftSkills(editSoftSkills.filter(s => s !== skillToRemove));
    } else {
      setSoftSkills(softSkills.filter(s => s !== skillToRemove));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !stage || !years) {
      alert('Nama Sekolah, Jenjang/Jurusan, dan Tahun wajib diisi.');
      return;
    }

    onAddEducation({
      school,
      schoolEN: schoolEN || school,
      stage,
      stageEN: stageEN || stage,
      years,
      grade: grade.trim() || undefined,
      activities: activities.trim() || undefined,
      activitiesEN: activitiesEN.trim() || undefined,
      description: description.trim() || undefined,
      descriptionEN: descriptionEN.trim() || undefined,
      logo: logo.trim() || undefined,
      skills: skills.length > 0 ? skills : undefined,
      hardSkills: hardSkills.length > 0 ? hardSkills : undefined,
      softSkills: softSkills.length > 0 ? softSkills : undefined,
      diplomaUrl: diplomaUrl.trim() || undefined,
      diplomaType: diplomaUrl ? diplomaType : undefined,
      diplomaName: diplomaName.trim() || undefined
    });

    // Reset Form
    setSchool('');
    setSchoolEN('');
    setStage('');
    setStageEN('');
    setYears('');
    setGrade('');
    setActivities('');
    setActivitiesEN('');
    setDescription('');
    setDescriptionEN('');
    setLogo('');
    setSkills([]);
    setSkillInput('');
    setHardSkills([]);
    setHardSkillInput('');
    setSoftSkills([]);
    setSoftSkillInput('');
    setDiplomaUrl('');
    setDiplomaType('image');
    setDiplomaName('');
    setShowAddForm(false);
  };

  const handleStartEdit = (edu: Education) => {
    setEditingEducation(edu);
    setEditSchool(edu.school || '');
    setEditSchoolEN(edu.schoolEN || edu.school || '');
    setEditStage(edu.stage || '');
    setEditStageEN(edu.stageEN || edu.stage || '');
    setEditYears(edu.years || '');
    setEditGrade(edu.grade || '');
    setEditActivities(edu.activities || '');
    setEditActivitiesEN(edu.activitiesEN || edu.activities || '');
    setEditDescription(edu.description || '');
    setEditDescriptionEN(edu.descriptionEN || edu.description || '');
    setEditLogo(edu.logo || '');
    setEditSkills(edu.skills || []);
    setEditSkillInput('');
    setEditHardSkills(edu.hardSkills || []);
    setEditHardSkillInput('');
    setEditSoftSkills(edu.softSkills || []);
    setEditSoftSkillInput('');
    setEditDiplomaUrl(edu.diplomaUrl || '');
    setEditDiplomaType(edu.diplomaType || 'image');
    setEditDiplomaName(edu.diplomaName || '');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEducation || !editSchool || !editStage || !editYears) {
      alert('Nama Sekolah, Jenjang/Jurusan, dan Tahun wajib diisi.');
      return;
    }

    onUpdateEducation({
      ...editingEducation,
      school: editSchool,
      schoolEN: editSchoolEN || editSchool,
      stage: editStage,
      stageEN: editStageEN || editStage,
      years: editYears,
      grade: editGrade.trim() || undefined,
      activities: editActivities.trim() || undefined,
      activitiesEN: editActivitiesEN.trim() || undefined,
      description: editDescription.trim() || undefined,
      descriptionEN: editDescriptionEN.trim() || undefined,
      logo: editLogo.trim() || undefined,
      skills: editSkills.length > 0 ? editSkills : undefined,
      hardSkills: editHardSkills.length > 0 ? editHardSkills : undefined,
      softSkills: editSoftSkills.length > 0 ? editSoftSkills : undefined,
      diplomaUrl: editDiplomaUrl.trim() || undefined,
      diplomaType: editDiplomaUrl ? editDiplomaType : undefined,
      diplomaName: editDiplomaName.trim() || undefined
    });

    setEditingEducation(null);
  };

  return (
    <div className={`space-y-8 animate-[fade-in_0.3s_ease-out] ${isDarkMode ? 'text-[#dce3f0]' : 'text-slate-700'}`}>
      
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2.5 ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
              <GraduationCap className="w-5 h-5" />
            </div>
            Riwayat Pendidikan / Education (LinkedIn Style)
          </h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-[#8c909f]' : 'text-slate-500'}`}>
            Kelola data institusi, logo sekolah, jenjang/jurusan, nilai/IPK, aktivitas organisasi, deskripsi, dan keahlian terkait.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-sky-600/20 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Riwayat Pendidikan
        </button>
      </div>

      {/* Info Callout */}
      <div className={`p-4.5 rounded-2xl border flex items-start gap-3.5 text-xs sm:text-sm ${
        isDarkMode ? 'bg-[#0f1724]/90 border-sky-500/20 text-sky-200' : 'bg-sky-50/80 border-sky-200 text-sky-900'
      }`}>
        <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <p className="font-bold">Format Tampilan LinkedIn Style:</p>
          <p className="opacity-90">
            Jika logo sekolah dikosongkan, sistem secara otomatis menampilkan <strong>Foto Bawaan Sistem (Default System Avatar)</strong> berupa icon modern LinkedIn. Admin dapat mengubah semua teks, menambahkan logo sekolah HD, mengisi Nilai/IPK, kegiatan organisasi, dan keahlian relevan.
          </p>
        </div>
      </div>

      {/* Education List (LinkedIn Format) */}
      <div className={`rounded-3xl border overflow-hidden ${
        isDarkMode ? 'bg-[#111827]/80 border-[#2e353f]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
          isDarkMode ? 'border-[#2e353f] bg-[#0c121a]' : 'border-slate-200 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-500" />
            <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Daftar Pendidikan ({educations.length})
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Tampil di Menu Tentang Saya (About)
          </span>
        </div>

        {educations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <GraduationCap className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
            <p className="text-sm font-semibold text-slate-400">Belum ada data riwayat pendidikan.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-xs font-bold text-sky-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah sekarang
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {educations.map((edu, idx) => (
              <div 
                key={edu.id || idx} 
                className={`p-6 sm:p-7 transition-colors relative group text-left ${
                  isDarkMode ? 'hover:bg-[#151f2e]/40' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                  {/* School Logo or System Default */}
                  <div className="shrink-0">
                    {edu.logo ? (
                      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center overflow-hidden bg-white shadow-sm ${
                        isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200'
                      }`}>
                        <img 
                          src={edu.logo} 
                          alt={edu.school} 
                          className="w-full h-full object-contain p-1.5" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <DefaultSchoolLogoIcon className="w-14 h-14" />
                    )}
                  </div>

                  {/* Details Body */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Top Row: School & Action buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className={`text-lg sm:text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {edu.school}
                        </h4>
                        {edu.schoolEN && edu.schoolEN !== edu.school && (
                          <p className="text-xs text-slate-400 font-semibold">{edu.schoolEN}</p>
                        )}
                        <p className={`text-sm sm:text-base font-semibold mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          {edu.stage}
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {edu.years}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStartEdit(edu)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-slate-800 hover:bg-sky-500/20 border-slate-700 text-slate-300 hover:text-sky-400' 
                              : 'bg-white hover:bg-sky-50 border-slate-200 text-slate-600 hover:text-sky-600 shadow-sm'
                          }`}
                          title="Edit Pendidikan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus riwayat pendidikan "${edu.school}"?`)) {
                              onDeleteEducation(edu.id);
                            }
                          }}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-slate-800 hover:bg-rose-500/20 border-slate-700 text-slate-300 hover:text-rose-400' 
                              : 'bg-white hover:bg-rose-50 border-slate-200 text-slate-600 hover:text-rose-600 shadow-sm'
                          }`}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Grade if present */}
                    {edu.grade && (
                      <div className="flex items-center gap-2 pt-0.5 text-xs sm:text-sm font-semibold">
                        <span className={`font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                          Grade / IPK:
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                          isDarkMode 
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold shadow-xs'
                        }`}>
                          {edu.grade}
                        </span>
                      </div>
                    )}

                    {/* Diploma / Ijazah document badge if present */}
                    {edu.diplomaUrl && (
                      <div className="pt-1 flex items-center gap-2">
                        <a
                          href={edu.diplomaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                            isDarkMode 
                              ? 'bg-sky-950/80 text-sky-300 border border-sky-500/40 hover:border-sky-400' 
                              : 'bg-sky-50 text-sky-850 border border-sky-300 hover:bg-sky-100 text-sky-900'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>Dokumen Ijazah ({edu.diplomaType?.toUpperCase() || (edu.diplomaUrl.endsWith('.pdf') ? 'PDF' : 'FOTO')})</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </div>
                    )}

                    {/* Activities and societies if present */}
                    {edu.activities && (
                      <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <span className={`font-extrabold ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Aktivitas & Organisasi: </span>
                        {edu.activities}
                      </p>
                    )}

                    {/* Description if present */}
                    {edu.description && (
                      <p className={`text-xs sm:text-sm leading-relaxed pt-1 ${isDarkMode ? 'text-slate-300/90' : 'text-slate-600'}`}>
                        {edu.description}
                      </p>
                    )}

                    {/* Hard Skills Section if present */}
                    {edu.hardSkills && edu.hardSkills.length > 0 && (
                      <div className="pt-2 flex items-start gap-2 text-xs sm:text-sm font-semibold">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
                          🛠️ Hard Skill
                        </span>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {edu.hardSkills.map((hSkill, hIdx) => (
                            <span 
                              key={hIdx}
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                isDarkMode 
                                  ? 'bg-[#152336] text-blue-300 border border-blue-500/30' 
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {hSkill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Soft Skills Section if present */}
                    {edu.softSkills && edu.softSkills.length > 0 && (
                      <div className="pt-1.5 flex items-start gap-2 text-xs sm:text-sm font-semibold">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 shrink-0">
                          🤝 Soft Skill
                        </span>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {edu.softSkills.map((sSkill, sIdx) => (
                            <span 
                              key={sIdx}
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                isDarkMode 
                                  ? 'bg-[#231735] text-purple-300 border border-purple-500/30' 
                                  : 'bg-purple-50 text-purple-800 border border-purple-200'
                              }`}
                            >
                              {sSkill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills Diamond Line if present */}
                    {edu.skills && edu.skills.length > 0 && (!edu.hardSkills?.length && !edu.softSkills?.length) && (
                      <div className="pt-2.5 flex items-start gap-2 text-xs sm:text-sm font-semibold">
                        <span className="text-sm">💎</span>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {edu.skills.map((skill, sIdx) => (
                            <span 
                              key={sIdx}
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                isDarkMode 
                                  ? 'bg-[#18212e] text-sky-300 border border-sky-500/20' 
                                  : 'bg-sky-50 text-sky-800 border border-sky-200'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD EDUCATION */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className={`border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-[scale-up_0.2s_ease-out] ${
            isDarkMode ? 'bg-[#111827] border-[#2e353f]' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-6 border-b flex justify-between items-center sticky top-0 z-20 backdrop-blur-md ${
              isDarkMode ? 'border-[#2e353f] bg-[#0a0f16]/90' : 'border-slate-200 bg-slate-50/90'
            }`}>
              <h3 className={`font-bold text-lg flex items-center gap-2.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <GraduationCap className="text-sky-500 w-5 h-5" />
                Tambah Riwayat Pendidikan (LinkedIn Format)
              </h3>
              <button 
                onClick={() => setShowAddForm(false)} 
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode ? 'text-[#8c909f] hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6 text-left">
              
              {/* Logo School Section */}
              <div className={`p-5 rounded-2xl border space-y-3.5 ${
                isDarkMode ? 'bg-[#0f1724]/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-500">
                  Logo Sekolah / Universitas (Opsional)
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Logo Preview */}
                  <div className="shrink-0 text-center space-y-1.5">
                    {logo ? (
                      <div className="w-16 h-16 rounded-2xl border border-sky-500/40 bg-white p-1.5 shadow-md overflow-hidden flex items-center justify-center">
                        <img src={logo} alt="School Logo" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="relative">
                        <DefaultSchoolLogoIcon className="w-16 h-16" />
                        <span className="absolute -bottom-1 -right-1 bg-slate-700 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full">
                          Default
                        </span>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400">
                      {logo ? 'Logo Kustom' : 'Sistem Bawaan'}
                    </p>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap gap-2">
                      <input 
                        type="file" 
                        ref={addFileInputRef} 
                        onChange={(e) => handleLogoFileChange(e, false)} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Logo HD
                      </button>
                      {logo && (
                        <button
                          type="button"
                          onClick={() => setLogo('')}
                          className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus (Gunakan Bawaan)
                        </button>
                      )}
                    </div>
                    <input 
                      type="url"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      placeholder="Atau tempel URL gambar logo langsung (https://...)"
                      className={`w-full rounded-xl px-3.5 py-2 text-xs outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                          : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* School Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Nama Sekolah / Universitas (ID) *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Contoh: Sekolah Tinggi Teknologi Wastukancana"
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    School Name (English Translation)
                  </label>
                  <input 
                    type="text" 
                    value={schoolEN}
                    onChange={(e) => setSchoolEN(e.target.value)}
                    placeholder="Contoh: Wastukancana School of Technology Purwakarta"
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Stage & Major */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Jenjang & Jurusan (ID) *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    placeholder="Contoh: Sarjana Teknik, Industrial Engineering"
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Degree & Field of Study (English)
                  </label>
                  <input 
                    type="text" 
                    value={stageEN}
                    onChange={(e) => setStageEN(e.target.value)}
                    placeholder="Contoh: Bachelor of Engineering, Industrial Engineering"
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Period & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Tahun / Periode *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    placeholder="Contoh: May 2022 – Aug 2026 atau 2022 - 2026"
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Grade / Nilai / IPK (Opsional)
                  </label>
                  <input 
                    type="text" 
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Contoh: 3,63 atau 84 atau 3.75 / 4.00"
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Activities & Societies */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Activities and societies / Aktivitas & Organisasi (ID)
                  </label>
                  <textarea 
                    rows={2}
                    value={activities}
                    onChange={(e) => setActivities(e.target.value)}
                    placeholder="Contoh: Panitia MABIM sebagai Divisi Peralatan dan Panitia MUMAS sebagai Sekretaris..."
                    className={`w-full rounded-xl p-3.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Activities and societies (English)
                  </label>
                  <textarea 
                    rows={2}
                    value={activitiesEN}
                    onChange={(e) => setActivitiesEN(e.target.value)}
                    placeholder="Activities and societies in English..."
                    className={`w-full rounded-xl p-3.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Keterangan / Bio Akademik (ID)
                  </label>
                  <textarea 
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mahasiswa S1 Teknik Industri di Sekolah Tinggi Teknologi Wastukancana dengan minat pada..."
                    className={`w-full rounded-xl p-3.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Academic Description (English)
                  </label>
                  <textarea 
                    rows={3}
                    value={descriptionEN}
                    onChange={(e) => setDescriptionEN(e.target.value)}
                    placeholder="Academic bio or details in English..."
                    className={`w-full rounded-xl p-3.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Dokumentasi Ijazah (PDF atau Foto) Section */}
              <div className={`p-5 rounded-2xl border space-y-3.5 ${
                isDarkMode ? 'bg-[#0f1724]/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-500" />
                    <span>Dokumentasi Ijazah / Sertifikat Kelulusan (PDF atau Foto)</span>
                  </label>
                  {diplomaUrl && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                      Dokumen Terpasang ({diplomaType.toUpperCase()})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Unggah scan/foto ijazah asli atau dokumen kelulusan (PDF atau Foto JPG/PNG). Pengunjung portofolio dapat melihat atau mengunduh ijazah ini secara langsung.
                </p>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <input 
                      type="file" 
                      ref={addDiplomaFileRef} 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDiplomaUpload(file, false);
                      }} 
                      accept="application/pdf,image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      disabled={isUploadingDiploma}
                      onClick={() => addDiplomaFileRef.current?.click()}
                      className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingDiploma ? 'Mengunggah Dokumen...' : 'Pilih File Ijazah (PDF / Foto)'}
                    </button>

                    {diplomaUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setDiplomaUrl('');
                          setDiplomaName('');
                        }}
                        className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-rose-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus Dokumen
                      </button>
                    )}
                  </div>

                  {diplomaUrl && (
                    <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isDarkMode ? 'bg-sky-950/30 border-sky-500/30' : 'bg-sky-50 border-sky-200'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {diplomaName || 'Dokumen Ijazah Terlampir'}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">
                            Format: {diplomaType} • Tersimpan Aman
                          </p>
                        </div>
                      </div>
                      <a
                        href={diplomaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-500 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                      >
                        <span>Pratinjau</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <input 
                    type="url"
                    value={diplomaUrl}
                    onChange={(e) => {
                      setDiplomaUrl(e.target.value);
                      if (e.target.value.toLowerCase().endsWith('.pdf')) {
                        setDiplomaType('pdf');
                      } else {
                        setDiplomaType('image');
                      }
                    }}
                    placeholder="Atau tempel tautan URL Ijazah langsung (Google Drive / Cloud PDF / https://...)"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500'
                    }`}
                  />
                </div>
              </div>

              {/* Hard Skills Tags Section */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDarkMode ? 'bg-[#0f1724]/70 border-blue-900/40' : 'bg-blue-50/50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                    <span>🛠️</span> Kolom Hard Skill (Keahlian Teknis)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {hardSkills.length} hard skill ditambahkan
                  </span>
                </div>

                {/* Hard Skill Input */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={hardSkillInput}
                    onChange={(e) => setHardSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHardSkillTag(hardSkillInput, false);
                      }
                    }}
                    placeholder="Contoh: PPIC, Lean Manufacturing, Excel, AutoCAD..."
                    className={`flex-1 rounded-xl px-3.5 py-2 text-xs outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddHardSkillTag(hardSkillInput, false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                {/* Selected Hard Skills Chips */}
                {hardSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hardSkills.map((s, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      >
                        <span>{s}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveHardSkillTag(s, false)}
                          className="hover:text-rose-400 cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Quick Add Hard Skills Chips */}
                <div className="pt-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pilihan Cepat Hard Skill:</span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_HARD_SKILLS.filter(s => !hardSkills.includes(s)).slice(0, 8).map((suggested, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleAddHardSkillTag(suggested, false)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800 hover:bg-blue-900/40 text-slate-300 border-slate-700 hover:text-blue-300' 
                            : 'bg-white hover:bg-blue-50 text-slate-600 border-slate-200 hover:text-blue-700'
                        }`}
                      >
                        + {suggested}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Soft Skills Tags Section */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDarkMode ? 'bg-[#0f1724]/70 border-purple-900/40' : 'bg-purple-50/50 border-purple-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <span>🤝</span> Kolom Soft Skill (Keahlian Non-Teknis & Interpersonal)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {softSkills.length} soft skill ditambahkan
                  </span>
                </div>

                {/* Soft Skill Input */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={softSkillInput}
                    onChange={(e) => setSoftSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSoftSkillTag(softSkillInput, false);
                      }
                    }}
                    placeholder="Contoh: Kepemimpinan, Problem Solving, Komunikasi..."
                    className={`flex-1 rounded-xl px-3.5 py-2 text-xs outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-purple-500' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-purple-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSoftSkillTag(softSkillInput, false)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                {/* Selected Soft Skills Chips */}
                {softSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {softSkills.map((s, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30"
                      >
                        <span>{s}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveSoftSkillTag(s, false)}
                          className="hover:text-rose-400 cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Quick Add Soft Skills Chips */}
                <div className="pt-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pilihan Cepat Soft Skill:</span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_SOFT_SKILLS.filter(s => !softSkills.includes(s)).slice(0, 8).map((suggested, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleAddSoftSkillTag(suggested, false)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800 hover:bg-purple-900/40 text-slate-300 border-slate-700 hover:text-purple-300' 
                            : 'bg-white hover:bg-purple-50 text-slate-600 border-slate-200 hover:text-purple-700'
                        }`}
                      >
                        + {suggested}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills Tags Section (General) */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDarkMode ? 'bg-[#0f1724]/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1.5">
                    <span>💎</span> Keahlian Terkait Tambahan / Associated Skills
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {skills.length} keahlian ditambahkan
                  </span>
                </div>

                {/* Tag Input */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkillTag(skillInput, false);
                      }
                    }}
                    placeholder="Ketik keahlian umum lalu tekan Tambah / Enter..."
                    className={`flex-1 rounded-xl px-3.5 py-2 text-xs outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillTag(skillInput, false)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                {/* Selected Skills Chips */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.map((s, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30"
                      >
                        <span>{s}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveSkillTag(s, false)}
                          className="hover:text-rose-400 cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className={`px-5 py-2.5 border text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'border-[#2e353f] text-[#c2c6d6] hover:bg-[#1e2530]' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-sky-600/20 cursor-pointer active:scale-95 transition-all"
                >
                  Simpan Riwayat Pendidikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EDUCATION */}
      {editingEducation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className={`border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-[scale-up_0.2s_ease-out] ${
            isDarkMode ? 'bg-[#111827] border-[#2e353f]' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-6 border-b flex justify-between items-center sticky top-0 z-20 backdrop-blur-md ${
              isDarkMode ? 'border-[#2e353f] bg-[#0a0f16]/90' : 'border-slate-200 bg-slate-50/90'
            }`}>
              <h3 className={`font-bold text-lg flex items-center gap-2.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <GraduationCap className="text-sky-500 w-5 h-5" />
                Edit Riwayat Pendidikan / Edit Education
              </h3>
              <button 
                onClick={() => setEditingEducation(null)} 
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode ? 'text-[#8c909f] hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6 text-left">
              
              {/* Logo School Section */}
              <div className={`p-5 rounded-2xl border space-y-3.5 ${
                isDarkMode ? 'bg-[#0f1724]/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-500">
                  Logo Sekolah / Universitas (Opsional)
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Logo Preview */}
                  <div className="shrink-0 text-center space-y-1.5">
                    {editLogo ? (
                      <div className="w-16 h-16 rounded-2xl border border-sky-500/40 bg-white p-1.5 shadow-md overflow-hidden flex items-center justify-center">
                        <img src={editLogo} alt="School Logo" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="relative">
                        <DefaultSchoolLogoIcon className="w-16 h-16" />
                        <span className="absolute -bottom-1 -right-1 bg-slate-700 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full">
                          Default
                        </span>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400">
                      {editLogo ? 'Logo Kustom' : 'Sistem Bawaan'}
                    </p>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap gap-2">
                      <input 
                        type="file" 
                        ref={editFileInputRef} 
                        onChange={(e) => handleLogoFileChange(e, true)} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" /> Ganti Logo HD
                      </button>
                      {editLogo && (
                        <button
                          type="button"
                          onClick={() => setEditLogo('')}
                          className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus (Gunakan Bawaan)
                        </button>
                      )}
                    </div>
                    <input 
                      type="url"
                      value={editLogo}
                      onChange={(e) => setEditLogo(e.target.value)}
                      placeholder="Atau tempel URL gambar logo langsung (https://...)"
                      className={`w-full rounded-xl px-3.5 py-2 text-xs outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                          : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* School Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Nama Sekolah / Universitas (ID) *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    School Name (English Translation)
                  </label>
                  <input 
                    type="text" 
                    value={editSchoolEN}
                    onChange={(e) => setEditSchoolEN(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Stage & Major */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Jenjang & Jurusan (ID) *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Degree & Field of Study (English)
                  </label>
                  <input 
                    type="text" 
                    value={editStageEN}
                    onChange={(e) => setEditStageEN(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Period & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Tahun / Periode *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={editYears}
                    onChange={(e) => setEditYears(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Grade / Nilai / IPK (Opsional)
                  </label>
                  <input 
                    type="text" 
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    placeholder="Contoh: 3,63 atau 84"
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Activities & Societies */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Activities and societies / Aktivitas & Organisasi (ID)
                  </label>
                  <textarea 
                    rows={2}
                    value={editActivities}
                    onChange={(e) => setEditActivities(e.target.value)}
                    className={`w-full rounded-xl p-3.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Activities and societies (English)
                  </label>
                  <textarea 
                    rows={2}
                    value={editActivitiesEN}
                    onChange={(e) => setEditActivitiesEN(e.target.value)}
                    className={`w-full rounded-xl p-3.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Keterangan / Bio Akademik (ID)
                  </label>
                  <textarea 
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`w-full rounded-xl p-3.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                    Academic Description (English)
                  </label>
                  <textarea 
                    rows={3}
                    value={editDescriptionEN}
                    onChange={(e) => setEditDescriptionEN(e.target.value)}
                    className={`w-full rounded-xl p-3.5 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Dokumentasi Ijazah (PDF atau Foto) Section */}
              <div className={`p-5 rounded-2xl border space-y-3.5 ${
                isDarkMode ? 'bg-[#0f1724]/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-500" />
                    <span>Dokumentasi Ijazah / Sertifikat Kelulusan (PDF atau Foto)</span>
                  </label>
                  {editDiplomaUrl && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                      Dokumen Terpasang ({editDiplomaType.toUpperCase()})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Unggah scan/foto ijazah asli atau dokumen kelulusan (PDF atau Foto JPG/PNG).
                </p>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <input 
                      type="file" 
                      ref={editDiplomaFileRef} 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDiplomaUpload(file, true);
                      }} 
                      accept="application/pdf,image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      disabled={isUploadingEditDiploma}
                      onClick={() => editDiplomaFileRef.current?.click()}
                      className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingEditDiploma ? 'Mengunggah Dokumen...' : 'Pilih File Ijazah Baru (PDF / Foto)'}
                    </button>

                    {editDiplomaUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditDiplomaUrl('');
                          setEditDiplomaName('');
                        }}
                        className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-rose-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus Dokumen
                      </button>
                    )}
                  </div>

                  {editDiplomaUrl && (
                    <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isDarkMode ? 'bg-sky-950/30 border-sky-500/30' : 'bg-sky-50 border-sky-200'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {editDiplomaName || 'Dokumen Ijazah Terlampir'}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">
                            Format: {editDiplomaType} • Tersimpan Aman
                          </p>
                        </div>
                      </div>
                      <a
                        href={editDiplomaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-500 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                      >
                        <span>Pratinjau</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <input 
                    type="url"
                    value={editDiplomaUrl}
                    onChange={(e) => {
                      setEditDiplomaUrl(e.target.value);
                      if (e.target.value.toLowerCase().endsWith('.pdf')) {
                        setEditDiplomaType('pdf');
                      } else {
                        setEditDiplomaType('image');
                      }
                    }}
                    placeholder="Atau tempel tautan URL Ijazah langsung (https://...)"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500'
                    }`}
                  />
                </div>
              </div>

              {/* Hard Skills Tags Section */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDarkMode ? 'bg-[#0f1724]/70 border-blue-900/40' : 'bg-blue-50/50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                    <span>🛠️</span> Kolom Hard Skill (Keahlian Teknis)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {editHardSkills.length} hard skill ditambahkan
                  </span>
                </div>

                {/* Hard Skill Input */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={editHardSkillInput}
                    onChange={(e) => setEditHardSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHardSkillTag(editHardSkillInput, true);
                      }
                    }}
                    placeholder="Contoh: PPIC, Lean Manufacturing, Excel, AutoCAD..."
                    className={`flex-1 rounded-xl px-3.5 py-2 text-xs outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-blue-500' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddHardSkillTag(editHardSkillInput, true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                {/* Selected Hard Skills Chips */}
                {editHardSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editHardSkills.map((s, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      >
                        <span>{s}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveHardSkillTag(s, true)}
                          className="hover:text-rose-400 cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Quick Add Hard Skills Chips */}
                <div className="pt-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pilihan Cepat Hard Skill:</span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_HARD_SKILLS.filter(s => !editHardSkills.includes(s)).slice(0, 8).map((suggested, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleAddHardSkillTag(suggested, true)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800 hover:bg-blue-900/40 text-slate-300 border-slate-700 hover:text-blue-300' 
                            : 'bg-white hover:bg-blue-50 text-slate-600 border-slate-200 hover:text-blue-700'
                        }`}
                      >
                        + {suggested}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Soft Skills Tags Section */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDarkMode ? 'bg-[#0f1724]/70 border-purple-900/40' : 'bg-purple-50/50 border-purple-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <span>🤝</span> Kolom Soft Skill (Keahlian Non-Teknis & Interpersonal)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {editSoftSkills.length} soft skill ditambahkan
                  </span>
                </div>

                {/* Soft Skill Input */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={editSoftSkillInput}
                    onChange={(e) => setEditSoftSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSoftSkillTag(editSoftSkillInput, true);
                      }
                    }}
                    placeholder="Contoh: Kepemimpinan, Problem Solving, Komunikasi..."
                    className={`flex-1 rounded-xl px-3.5 py-2 text-xs outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-purple-500' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-purple-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSoftSkillTag(editSoftSkillInput, true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                {/* Selected Soft Skills Chips */}
                {editSoftSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editSoftSkills.map((s, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30"
                      >
                        <span>{s}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveSoftSkillTag(s, true)}
                          className="hover:text-rose-400 cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Quick Add Soft Skills Chips */}
                <div className="pt-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pilihan Cepat Soft Skill:</span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_SOFT_SKILLS.filter(s => !editSoftSkills.includes(s)).slice(0, 8).map((suggested, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleAddSoftSkillTag(suggested, true)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800 hover:bg-purple-900/40 text-slate-300 border-slate-700 hover:text-purple-300' 
                            : 'bg-white hover:bg-purple-50 text-slate-600 border-slate-200 hover:text-purple-700'
                        }`}
                      >
                        + {suggested}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills Tags Section (General) */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDarkMode ? 'bg-[#0f1724]/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1.5">
                    <span>💎</span> Keahlian Terkait Tambahan / Associated Skills
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {editSkills.length} keahlian ditambahkan
                  </span>
                </div>

                {/* Tag Input */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={editSkillInput}
                    onChange={(e) => setEditSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkillTag(editSkillInput, true);
                      }
                    }}
                    placeholder="Ketik keahlian umum lalu tekan Tambah / Enter..."
                    className={`flex-1 rounded-xl px-3.5 py-2 text-xs outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-[#181f2a] border border-[#2e353f] text-white focus:border-sky-500' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-sky-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillTag(editSkillInput, true)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                {/* Selected Skills Chips */}
                {editSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editSkills.map((s, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30"
                      >
                        <span>{s}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveSkillTag(s, true)}
                          className="hover:text-rose-400 cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setEditingEducation(null)}
                  className={`px-5 py-2.5 border text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'border-[#2e353f] text-[#c2c6d6] hover:bg-[#1e2530]' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-sky-600/20 cursor-pointer active:scale-95 transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
