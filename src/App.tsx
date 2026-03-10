import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  Trello, 
  Camera, 
  Eye,
  EyeOff,
  LogOut, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Timer,
  Search,
  X,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InfrastructureEvent, User, Sector } from './types';

const SECTORS: Sector[] = [
  'Internação', 
  'Carga Nacional/Paletizada', 
  'Exportação', 
  'Recebimento', 
  'Liberação'
];

const STATUS_COLORS = {
  'Pendente': 'bg-red-100 text-red-700 border-red-200',
  'Em Andamento': 'bg-amber-100 text-amber-700 border-amber-200',
  'Concluído': 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'register' | 'track'>('register');
  const [trackView, setTrackView] = useState<'list' | 'kanban' | 'table'>('list');
  const [events, setEvents] = useState<InfrastructureEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<InfrastructureEvent | null>(null);

  // Login State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('kaizen_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedEvents = localStorage.getItem('kaizen_events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Client-side validation for Vercel compatibility
    if (loginForm.username === "admin" && loginForm.password === "admin") {
      const userData = { name: "Admin Líder", role: "leader" };
      setUser(userData);
      localStorage.setItem('kaizen_user', JSON.stringify(userData));
    } else {
      setLoginError("Credenciais inválidas");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kaizen_user');
  };

  const handleRegisterEvent = (eventData: InfrastructureEvent) => {
    const newEvents = [eventData, ...events];
    setEvents(newEvents);
    localStorage.setItem('kaizen_events', JSON.stringify(newEvents));
  };

  const handleUpdateStatus = (id: number, status: string) => {
    const newEvents = events.map(e => 
      e.id === id ? { ...e, status: status as any } : e
    );
    setEvents(newEvents);
    localStorage.setItem('kaizen_events', JSON.stringify(newEvents));
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-neutral-50 flex items-center justify-center p-6 font-sans overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-black/20">
              <LayoutDashboard className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Gestão Kaizen</h1>
            <p className="text-neutral-500 text-sm">Controle de Infraestrutura Operacional</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">Usuário</label>
              <input 
                type="text" 
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-100 border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-4 py-3 bg-neutral-100 border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {loginError && <p className="text-red-500 text-xs font-medium text-center">{loginError}</p>}
            <button 
              type="submit"
              className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg shadow-black/20 active:scale-[0.98] transition-transform mt-4"
            >
              Entrar no Sistema
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">Gestão Kaizen</h2>
              <div className="flex items-center text-neutral-500 text-xs mt-0.5">
                <UserIcon size={12} className="mr-1" />
                <span>{user.name}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 bg-neutral-100 rounded-full text-neutral-500 active:bg-neutral-200 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-xl max-w-md">
            <button 
              onClick={() => setActiveTab('register')}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'register' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
            >
              <PlusCircle size={16} className="mr-2" />
              Registrar
            </button>
            <button 
              onClick={() => setActiveTab('track')}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'track' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
            >
              <ListTodo size={16} className="mr-2" />
              Acompanhar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'register' ? (
            <RegistrationForm 
              user={user} 
              onSuccess={(newEvent) => {
                handleRegisterEvent(newEvent);
                setActiveTab('track');
              }} 
            />
          ) : (
            <TrackingView 
              events={events} 
              view={trackView} 
              setView={setTrackView}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={setSelectedEvent}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedEvent && (
            <DetailsModal 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function RegistrationForm({ user, onSuccess }: { user: User, onSuccess: (event: InfrastructureEvent) => void }) {
  const initialForm = {
    name: '',
    description: '',
    sector: SECTORS[0],
    supervisor: '',
    os_vinci: '',
    photo: ''
  };

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-calculated fields
  const [autoFields, setAutoFields] = useState({
    code: '',
    date: '',
    shift: ''
  });

  const generateAutoFields = () => {
    // Get current time in Manaus (UTC-4)
    const now = new Date();
    const manausTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Manaus" }));
    
    const dateStr = manausTime.toLocaleDateString('pt-BR');
    const hours = manausTime.getHours();
    
    let shift = '';
    if (hours >= 6 && hours < 14) shift = '1º Turno';
    else if (hours >= 14 && hours < 22) shift = '2º Turno';
    else shift = '3º Turno';

    const randomCode = 'OS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setAutoFields({
      code: randomCode,
      date: dateStr,
      shift: shift
    });
  };

  useEffect(() => {
    generateAutoFields();
  }, []);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description) return;

    setSubmitting(true);
    try {
      const newEvent: InfrastructureEvent = {
        id: Date.now(),
        ...form,
        ...autoFields,
        leader: user.name,
        status: 'Pendente'
      };
      
      // Visual feedback
      setShowSuccess(true);
      
      // Clear form
      setForm(initialForm);
      generateAutoFields();

      // Delay to show success before switching or just let the user see it
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess(newEvent);
      }, 1500);
      
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 space-y-4"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-xl font-bold text-neutral-900">Registrado com Sucesso!</h3>
        <p className="text-neutral-500">A ocorrência foi salva localmente.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 space-y-6"
    >
      <div 
        className="bg-white border border-neutral-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100 shadow-sm overflow-hidden"
        style={{ width: '100%', maxWidth: '500px' }}
      >
        <div className="px-4 py-3 flex items-center space-x-3">
          <div className="p-2 bg-neutral-50 rounded-lg shrink-0">
            <FileText size={14} className="text-neutral-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Código OSK</p>
            <p className="font-mono font-bold text-black text-sm leading-tight truncate">{autoFields.code}</p>
          </div>
        </div>
        <div className="px-4 py-3 flex items-center space-x-3">
          <div className="p-2 bg-neutral-50 rounded-lg shrink-0">
            <Timer size={14} className="text-neutral-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Turno</p>
            <p className="font-sans font-semibold text-neutral-700 text-sm leading-tight truncate">{autoFields.shift}</p>
          </div>
        </div>
        <div className="px-4 py-3 flex items-center space-x-3">
          <div className="p-2 bg-neutral-50 rounded-lg shrink-0">
            <Clock size={14} className="text-neutral-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Data</p>
            <p className="font-sans font-semibold text-neutral-700 text-sm leading-tight truncate">{autoFields.date}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5 md:col-span-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Nome da Abertura</label>
            <input 
              required
              type="text" 
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-[14px]"
              style={{ fontFamily: 'Arial' }}
              placeholder="Ex: Portão da expedição quebrado"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Descrição Detalhada</label>
            <textarea 
              required
              rows={4}
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all resize-none text-[14px] font-normal"
              style={{ fontFamily: 'Arial' }}
              placeholder="Descreva o ocorrido com detalhes..."
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Setor</label>
            <select 
              value={form.sector}
              onChange={e => setForm({...form, sector: e.target.value as Sector})}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all appearance-none text-[14px]"
              style={{ fontFamily: 'Arial' }}
            >
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Supervisor</label>
            <input 
              type="text" 
              value={form.supervisor}
              onChange={e => setForm({...form, supervisor: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-[14px]"
              style={{ fontFamily: 'Arial' }}
              placeholder="Nome do Sup."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">OS Vinci</label>
            <input 
              type="text" 
              value={form.os_vinci}
              onChange={e => setForm({...form, os_vinci: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-[14px]"
              style={{ fontFamily: 'Arial' }}
              placeholder="Número da OS Vinci"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Foto da Ocorrência</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
            >
              {form.photo ? (
                <>
                  <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white" />
                  </div>
                </>
              ) : (
                <>
                  <Camera className="text-neutral-400 mb-2" size={32} />
                  <p className="text-xs font-medium text-neutral-500">Toque para tirar foto</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              ref={fileInputRef}
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <button 
            type="submit"
            disabled={submitting}
            className="mx-auto bg-black text-white font-bold py-4 rounded-xl shadow-lg shadow-black/20 active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center"
            style={{ width: '305.5px' }}
          >
            {submitting ? 'Enviando...' : 'Registrar Ocorrência'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function TrackingView({ 
  events, 
  view, 
  setView, 
  searchTerm, 
  setSearchTerm,
  onUpdateStatus,
  onViewDetails
}: { 
  events: InfrastructureEvent[], 
  view: 'list' | 'kanban' | 'table', 
  setView: (v: 'list' | 'kanban' | 'table') => void,
  searchTerm: string,
  setSearchTerm: (s: string) => void,
  onUpdateStatus: (id: number, status: string) => void,
  onViewDetails: (event: InfrastructureEvent) => void
}) {
  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = (id: number, status: string) => {
    onUpdateStatus(id, status);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 space-y-4"
    >
      {/* Search and View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por OSK, nome ou setor..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition-all"
          />
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-lg w-full md:w-auto md:min-w-[320px]">
          <button 
            onClick={() => setView('list')}
            className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-bold transition-all ${view === 'list' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
          >
            <ListTodo size={14} className="mr-1.5" />
            Cards
          </button>
          <button 
            onClick={() => setView('table')}
            className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-bold transition-all ${view === 'table' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
          >
            <LayoutDashboard size={14} className="mr-1.5" />
            Tabela
          </button>
          <button 
            onClick={() => setView('kanban')}
            className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-bold transition-all ${view === 'kanban' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
          >
            <Trello size={14} className="mr-1.5" />
            Kanban
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100">{event.code}</span>
                    <h3 className="text-sm font-bold text-neutral-900 mt-1">{event.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_COLORS[event.status]}`}>
                    {event.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-[11px] mt-3">
                  <div className="flex items-center text-neutral-500">
                    <MapPin size={12} className="mr-1.5" />
                    {event.sector}
                  </div>
                  <div className="flex items-center text-neutral-500">
                    <Clock size={12} className="mr-1.5" />
                    {event.shift}
                  </div>
                  <div className="flex items-center text-neutral-500">
                    <UserIcon size={12} className="mr-1.5" />
                    {event.leader}
                  </div>
                  <div className="flex items-center text-neutral-500">
                    <FileText size={12} className="mr-1.5" />
                    {event.date}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-50 flex gap-2">
                {event.status === 'Pendente' && (
                  <button 
                    onClick={() => updateStatus(event.id!, 'Em Andamento')}
                    className="flex-1 bg-amber-50 text-amber-700 text-[10px] font-bold py-2 rounded-lg border border-amber-100 active:scale-95 transition-transform"
                  >
                    Iniciar
                  </button>
                )}
                {event.status === 'Em Andamento' && (
                  <button 
                    onClick={() => updateStatus(event.id!, 'Concluído')}
                    className="flex-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold py-2 rounded-lg border border-emerald-100 active:scale-95 transition-transform"
                  >
                    Concluir
                  </button>
                )}
                <button 
                  onClick={() => onViewDetails(event)}
                  className="flex-1 bg-neutral-50 text-neutral-600 text-[10px] font-bold py-2 rounded-lg border border-neutral-100 active:scale-95 transition-transform"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : view === 'table' ? (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-bottom border-neutral-200">
                  <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Código</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Ocorrência</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Setor</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Líder</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100">{event.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-neutral-900">{event.name}</p>
                      <p className="text-[10px] text-neutral-500 truncate max-w-[200px]">{event.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-medium text-neutral-600">{event.sector}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-medium text-neutral-600">{event.leader}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-medium text-neutral-600">{event.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[event.status]}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {event.status === 'Pendente' && (
                          <button 
                            onClick={() => updateStatus(event.id!, 'Em Andamento')}
                            className="p-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors"
                            title="Iniciar"
                          >
                            <Timer size={12} />
                          </button>
                        )}
                        {event.status === 'Em Andamento' && (
                          <button 
                            onClick={() => updateStatus(event.id!, 'Concluído')}
                            className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
                            title="Concluir"
                          >
                            <CheckCircle2 size={12} />
                          </button>
                        )}
                        <button 
                          onClick={() => onViewDetails(event)}
                          className="p-1.5 bg-neutral-50 text-neutral-600 rounded-lg border border-neutral-100 hover:bg-neutral-100 transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Pendente', 'Em Andamento', 'Concluído'].map(status => {
            const statusEvents = filteredEvents.filter(e => e.status === status);
            return (
              <div key={status} className="space-y-3 bg-neutral-100/50 p-3 rounded-2xl border border-neutral-200/50">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center">
                    {status === 'Pendente' && <AlertCircle size={14} className="text-red-500 mr-1.5" />}
                    {status === 'Em Andamento' && <Timer size={14} className="text-amber-500 mr-1.5" />}
                    {status === 'Concluído' && <CheckCircle2 size={14} className="text-emerald-500 mr-1.5" />}
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{status}</h4>
                  </div>
                  <span className="text-[10px] font-bold bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full">{statusEvents.length}</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {statusEvents.length === 0 ? (
                    <div className="w-full py-8 border-2 border-dashed border-neutral-200 rounded-2xl flex items-center justify-center text-neutral-400 text-[10px] font-medium italic bg-white/50">
                      Nenhuma ocorrência
                    </div>
                  ) : (
                    statusEvents.map(event => (
                      <div key={event.id} className="bg-white p-3 rounded-2xl border border-neutral-100 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono font-bold text-neutral-400">{event.code}</span>
                          <span className="text-[9px] font-bold text-neutral-400">{event.date}</span>
                        </div>
                        <h5 className="text-xs font-bold text-neutral-900 line-clamp-1">{event.name}</h5>
                        <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">{event.description}</p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => onViewDetails(event)}
                              className="p-1.5 bg-neutral-100 text-neutral-600 rounded-lg active:scale-90 transition-transform"
                            >
                              <Maximize2 size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                if (event.status === 'Pendente') updateStatus(event.id!, 'Em Andamento');
                                else if (event.status === 'Em Andamento') updateStatus(event.id!, 'Concluído');
                              }}
                              className="p-1.5 bg-neutral-900 text-white rounded-lg active:scale-90 transition-transform"
                            >
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <AlertCircle size={40} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">Nenhum registro encontrado</p>
        </div>
      )}
    </motion.div>
  );
}

function DetailsModal({ event, onClose }: { event: InfrastructureEvent, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-neutral-50 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Handle */}
        <div className="sm:hidden flex justify-center py-3 bg-white">
          <div className="w-12 h-1.5 bg-neutral-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-neutral-400 tracking-wider">{event.code}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[event.status as keyof typeof STATUS_COLORS]}`}>
                  {event.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-neutral-900 leading-tight">Detalhes da Ocorrência</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
          {/* Hero Section with Photo */}
          {event.photo ? (
            <div className="relative aspect-video sm:aspect-[21/9] w-full bg-neutral-900 group">
              <img 
                src={event.photo} 
                alt="Evidência" 
                className="w-full h-full object-cover opacity-90" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Evidência Fotográfica</p>
                <h4 className="text-white text-lg font-bold truncate">{event.name}</h4>
              </div>
            </div>
          ) : (
            <div className="px-6 py-8 bg-neutral-900 text-white">
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Ocorrência</p>
              <h4 className="text-white text-2xl font-bold leading-tight">{event.name}</h4>
            </div>
          )}

          <div className="p-6 space-y-8">
            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-black rounded-full" />
                <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Descrição do Evento</h5>
              </div>
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">{event.description}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Setor</p>
                  <p className="text-sm font-bold text-neutral-900">{event.sector}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400">
                  <UserIcon size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Líder</p>
                  <p className="text-sm font-bold text-neutral-900">{event.leader}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400">
                  <Timer size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Turno / Data</p>
                  <p className="text-sm font-bold text-neutral-900">{event.shift} • {event.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">OS Vinci / Sup.</p>
                  <p className="text-sm font-bold text-neutral-900">{event.os_vinci || 'N/A'} • {event.supervisor || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-100 bg-white flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-neutral-100 text-neutral-600 text-sm font-bold rounded-2xl active:scale-[0.98] transition-all"
          >
            Voltar
          </button>
          <button 
            onClick={onClose}
            className="flex-[2] py-4 bg-black text-white text-sm font-bold rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-black/20"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
