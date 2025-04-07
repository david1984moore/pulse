import { useState } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, ChevronRight, Plus, Home, Zap,
  Wifi, Phone, Droplet, ShoppingCart, Car, CreditCard, Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useBillFormState } from "@/hooks/use-bill-form-state";
import EditBillModal from "@/components/ui/edit-bill-modal";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths
} from "date-fns";

// Helper function to get the ordinal suffix for a date number
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// Helper function to get the appropriate icon for a bill type
function getBillIcon(billName: string) {
  const iconMap: Record<string, JSX.Element> = {
    'Rent': <Home className="h-3.5 w-3.5 text-white" />,
    'Electric': <Zap className="h-3.5 w-3.5 text-white" />,
    'Water': <Droplet className="h-3.5 w-3.5 text-white" />,
    'Internet': <Wifi className="h-3.5 w-3.5 text-white" />,
    'Phone Service': <Phone className="h-3.5 w-3.5 text-white" />,
    'Car Payment': <Car className="h-3.5 w-3.5 text-white" />,
    'Credit Card': <CreditCard className="h-3.5 w-3.5 text-white" />,
    'Insurance': <Landmark className="h-3.5 w-3.5 text-white" />,
    'Groceries': <ShoppingCart className="h-3.5 w-3.5 text-white" />
  };
  
  return iconMap[billName] || <CreditCard className="h-3.5 w-3.5 text-white" />;
}

interface CalendarViewProps {
  bills: Bill[];
  onAddBill?: () => void;
}

export default function CalendarView({ bills, onAddBill }: CalendarViewProps) {
  const { t } = useLanguage();
  const { setSelectedDueDate } = useBillFormState();
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map(day => t(day));
  
  // State for edit bill modal
  const [isEditBillModalOpen, setIsEditBillModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
  // Get all days in the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate the starting day of the week (0-6)
  const startDayOfWeek = monthStart.getDay();
  
  // Create array of placeholder elements for days before the month starts
  const placeholders = Array.from({ length: startDayOfWeek }, (_, i) => (
    <div key={`empty-${i}`} className="h-12 bg-white rounded-md border border-gray-200"></div>
  ));
  
  // Function to check if a day has a bill due
  const getBillForDay = (day: number) => {
    return bills.filter(bill => bill.due_date === day);
  };
  
  // Handle month navigation
  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Handle closing edit bill modal
  const handleEditBillModalClose = (open: boolean) => {
    setIsEditBillModalOpen(open);
    if (!open) {
      setSelectedBill(null);
    }
  };
  
  // We don't need to handle closing the add bill modal locally
  // as it's now done in the parent component
  
  // Handle clicking on a day
  const handleDayClick = (day: number, dayBills: Bill[]) => {
    if (dayBills.length > 0) {
      // If there are bills, select the first one to edit
      setSelectedBill(dayBills[0]);
      setIsEditBillModalOpen(true);
      console.log("Opening edit modal for bill:", dayBills[0]);
    } else if (onAddBill) {
      // If no bills and onAddBill is provided, open the standardized add bill modal
      setSelectedDueDate(day);
      onAddBill(); // Use the parent component's add bill handler
      console.log("Opening add bill modal with due date:", day);
    }
  };
  
  return (
    <>
      {/* Edit Bill Modal */}
      <EditBillModal 
        open={isEditBillModalOpen} 
        onOpenChange={handleEditBillModalClose} 
        bill={selectedBill} 
      />
      
      <Card className="border border-gray-200 shadow-md">
        <CardHeader className="pb-3 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-gray-800">
              {t('paymentCalendar')}
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={previousMonth}
                className="rounded-md h-8 w-8 p-0 border border-gray-300 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextMonth}
                className="rounded-md h-8 w-8 p-0 border border-gray-300 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {onAddBill && (
                <Button
                  variant="default"
                  size="icon"
                  onClick={onAddBill}
                  className="rounded-md h-8 w-8 p-0 bg-red-500 hover:bg-red-600 shadow"
                >
                  <Plus className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 capitalize pb-2">
                {t(format(currentDate, "MMMM").toLowerCase())} {format(currentDate, "yyyy")}
              </h3>
              <div className="h-0.5 w-32 bg-primary/30 rounded-full"></div>
            </div>
            
            {/* Day headers in a more cohesive row */}
            <div className="flex w-full bg-gray-100 rounded-md border border-gray-200 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex-1 text-xs uppercase font-bold text-gray-700 text-center py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {/* Empty placeholders */}
              {placeholders.map((placeholder, index) => (
                <div key={`empty-${index}`} className="h-12 bg-white rounded-md border border-gray-200"></div>
              ))}
              
              {/* Day cells */}
              {days.map((day) => {
                const dayOfMonth = day.getDate();
                const isToday = isSameDay(day, new Date());
                const dayBills = getBillForDay(dayOfMonth);
                const hasBills = dayBills.length > 0;
                
                return (
                  <div 
                    key={day.toString()}
                    className={`
                      relative h-12 rounded-md border border-gray-200 cursor-pointer transition-colors
                      ${isToday 
                        ? "bg-primary/10 text-primary-600 border-primary/20" 
                        : hasBills
                          ? "bg-red-50 border-gray-200 hover:bg-red-100"
                          : "bg-white hover:bg-gray-50"
                      }
                    `}
                    onClick={() => handleDayClick(dayOfMonth, dayBills)}
                  >
                    <span className={`text-sm absolute top-1.5 left-1.5 ${isToday ? "font-bold text-primary-700" : ""} ${hasBills ? "font-semibold text-gray-800" : "font-medium text-gray-700"}`}>
                      {dayOfMonth}
                    </span>
                    
                    {/* Bill indicators */}
                    {hasBills && (
                      <div className="absolute bottom-1.5 right-1.5 flex flex-wrap justify-center gap-1.5">
                        {dayBills.slice(0, 3).map((bill) => (
                          <div 
                            key={bill.id}
                            className={`
                              flex items-center justify-center w-5 h-5 rounded-full 
                              ${bill.name === 'Rent' ? 'bg-gray-600' : 
                                bill.name === 'Electric' ? 'bg-yellow-500' : 
                                bill.name === 'Water' ? 'bg-blue-500' : 
                                bill.name === 'Internet' ? 'bg-blue-400' : 
                                bill.name === 'Phone Service' ? 'bg-slate-500' : 
                                bill.name === 'Car Payment' ? 'bg-gray-600' :
                                bill.name === 'Credit Card' ? 'bg-purple-500' :
                                bill.name === 'Insurance' ? 'bg-indigo-500' :
                                bill.name === 'Groceries' ? 'bg-green-500' :
                                'bg-red-500'} 
                              hover:opacity-90 transition-colors
                            `}
                            title={`${bill.name}: $${Number(bill.amount).toFixed(2)} - Due on the ${bill.due_date}${getOrdinalSuffix(bill.due_date)}`}
                          >
                            {dayBills.length > 3 && bill === dayBills[2] ? (
                              <span className="text-[9px] font-bold text-white">+{dayBills.length - 2}</span>
                            ) : (
                              getBillIcon(bill.name)
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">{t('calendarLegend')}</h4>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center bg-white px-3 py-1.5 rounded-md border border-gray-200">
                  <div className="w-5 h-5 bg-gray-600 rounded-full mr-2 flex items-center justify-center">
                    <Home className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700">Rent</span>
                </div>
                
                <div className="flex items-center bg-white px-3 py-1.5 rounded-md border border-gray-200">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full mr-2 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700">Electric</span>
                </div>
                
                <div className="flex items-center bg-white px-3 py-1.5 rounded-md border border-gray-200">
                  <div className="w-5 h-5 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
                    <Droplet className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700">Water</span>
                </div>
                
                <div className="flex items-center bg-white px-3 py-1.5 rounded-md border border-gray-200">
                  <div className="w-5 h-5 bg-blue-400 rounded-full mr-2 flex items-center justify-center">
                    <Wifi className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700">Internet</span>
                </div>
                
                <div className="flex items-center bg-white px-3 py-1.5 rounded-md border border-gray-200">
                  <div className="w-5 h-5 bg-slate-500 rounded-full mr-2 flex items-center justify-center">
                    <Phone className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700">Phone</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
