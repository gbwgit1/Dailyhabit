
import React from 'react';
import { Habit } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';

interface CalendarViewProps {
  habits: Habit[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ habits, selectedDate, setSelectedDate }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getCompletionForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const total = habits.length;
    if (total === 0) return 0;
    const done = habits.filter(h => h.completedDays.includes(dateStr)).length;
    return done / total;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="glass p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
              <i className="fa-solid fa-chevron-left text-slate-400"></i>
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
              <i className="fa-solid fa-chevron-right text-slate-400"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const isSelected = isSameDay(day, new Date(selectedDate));
            const completion = getCompletionForDate(day);
            const isCurrentMonth = format(day, 'MM') === format(currentMonth, 'MM');

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(format(day, 'yyyy-MM-dd'))}
                className={`relative aspect-square flex items-center justify-center text-sm font-semibold rounded-2xl transition-all ${!isCurrentMonth ? 'text-slate-200' : 'text-slate-600'} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:bg-slate-50'}`}
              >
                {format(day, 'd')}
                {completion > 0 && (
                   <div 
                    className="absolute bottom-1.5 w-1 h-1 rounded-full bg-indigo-500"
                    style={{ opacity: completion }}
                  />
                )}
                {isToday(day) && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass p-6 rounded-3xl">
         <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
           Entries for {format(new Date(selectedDate), 'MMM do')}
         </h4>
         <div className="space-y-2">
           {habits.map(h => {
             const done = h.completedDays.includes(selectedDate);
             return (
               <div key={h.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                 <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${done ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300'}`}>
                     <i className={`fa-solid ${h.icon} text-xs`}></i>
                   </div>
                   <span className={`text-sm font-medium ${done ? 'text-slate-800' : 'text-slate-400'}`}>{h.title}</span>
                 </div>
                 <i className={`fa-solid ${done ? 'fa-circle-check text-indigo-500' : 'fa-circle text-slate-200'}`}></i>
               </div>
             );
           })}
           {habits.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No habits defined</p>}
         </div>
      </div>
    </div>
  );
};

export default CalendarView;
