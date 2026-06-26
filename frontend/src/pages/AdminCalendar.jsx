import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  ChevronLeft, ChevronRight, X, Calendar, 
  User, Laptop, Clock, AlertTriangle, ShieldCheck
} from 'lucide-react';

const AdminCalendar = () => {
  const { showToast } = useToast();
  const [rentals, setRentals] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRental, setSelectedRental] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await api.get('/rentals');
        setRentals(res.data);
      } catch (err) {
        showToast('Failed to fetch calendar bookings.', 'error');
      }
    };
    fetchRentals();
  }, [showToast]);

  // Calendar Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create weeks array
  const calendarCells = [];
  // Fill empty spaces for first day offset
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Fill actual dates
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(year, month, d));
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get status color coding
  const getEventStyle = (rental) => {
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = rental.status === 'Overdue' || (rental.status === 'Active' && rental.end_date < today);
    const isDueSoon = rental.status === 'Active' && rental.end_date >= today && 
      (new Date(rental.end_date) - new Date(today)) <= 24*60*60*1000;

    if (rental.status === 'Returned') {
      return 'bg-emerald-500 border-emerald-600 text-white';
    }
    if (isOverdue) {
      return 'bg-red-500 border-red-600 text-white';
    }
    if (isDueSoon) {
      return 'bg-amber-500 border-amber-600 text-white'; // Due Soon
    }
    return 'bg-blue-500 border-blue-600 text-white'; // Active
  };

  // Find rentals falling on a specific date
  const getRentalsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return rentals.filter(r => {
      // Show event if the date falls inside the rental window [start, end]
      return r.start_date <= dateStr && r.end_date >= dateStr;
    });
  };

  const handleEventClick = (rental) => {
    setSelectedRental(rental);
    setShowDetailModal(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 text-slate-700 animate-fade-in h-full flex flex-col justify-between">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Rental Schedule Calendar</h1>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Active</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Returned</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Overdue</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Due Soon</span>
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-650 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-black text-slate-800 uppercase tracking-widest min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-650 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid Calendar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm flex-1 flex flex-col">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d}>{d}</span>)}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
          {calendarCells.map((cell, idx) => {
            const cellRentals = getRentalsForDate(cell);
            const isToday = cell && cell.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={idx} 
                className={`min-h-[90px] border border-slate-100 rounded-2xl p-2 flex flex-col justify-between transition-all duration-200 ${
                  cell ? 'bg-slate-50/40 hover:bg-slate-50' : 'bg-transparent border-none'
                } ${isToday ? 'bg-cyan-50/30 border-cyan-300' : ''}`}
              >
                {cell ? (
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-cyan-500 text-white font-black' : 'text-slate-550'
                    }`}>
                      {cell.getDate()}
                    </span>
                    {cellRentals.length > 0 && (
                      <span className="text-[8px] bg-slate-900 text-white font-black px-1.5 py-0.25 rounded-md uppercase">
                        {cellRentals.length} Item{cellRentals.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                ) : null}

                {/* Render Events */}
                <div className="space-y-1 overflow-y-auto flex-1 max-h-[70px]">
                  {cell && cellRentals.slice(0, 2).map((rental) => (
                    <div
                      key={rental.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(rental);
                      }}
                      className={`px-2 py-0.5 border text-[9px] font-bold rounded-lg truncate cursor-pointer uppercase shadow-sm select-none ${getEventStyle(rental)}`}
                      title={`${rental.customer_name} - ${rental.device_name}`}
                    >
                      {rental.device_name}
                    </div>
                  ))}
                  {cellRentals.length > 2 && (
                    <p className="text-[8px] text-slate-400 font-bold text-center mt-0.5">+{cellRentals.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── BOOKING DETAILS DIALOG ─── */}
      {showDetailModal && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-sm w-full p-6 sm:p-8 shadow-2xl relative">
            <button className="absolute top-5 right-5 text-slate-400 hover:text-slate-600" onClick={() => setShowDetailModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Rental Invoice Summary</h2>
            <p className="text-xs text-slate-500 mb-6">Booking ID: #{String(selectedRental.id).padStart(5, '0')}</p>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
                <Laptop className="text-cyan-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Device details</p>
                  <p className="font-bold text-slate-900 uppercase">{selectedRental.device_name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">S/N: {selectedRental.device_serial}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
                <User className="text-cyan-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Customer Profile</p>
                  <p className="font-bold text-slate-900 uppercase">{selectedRental.customer_name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{selectedRental.customer_phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
                <Clock className="text-cyan-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Lease Term</p>
                  <p className="font-bold text-slate-900">
                    {new Date(selectedRental.start_date).toLocaleDateString()} to {new Date(selectedRental.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">Status: {selectedRental.status}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="text-cyan-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Payment Summary</p>
                  <p className="font-bold text-slate-800">Rental Amount: ₹{selectedRental.rental_amount}</p>
                  <p className="text-slate-500">Security Deposit: ₹{selectedRental.deposit_amount}</p>
                  <p className="text-[10px] text-slate-450 uppercase mt-0.5">Status: {selectedRental.payment_status} ({selectedRental.payment_method})</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
