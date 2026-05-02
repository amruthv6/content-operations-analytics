import { useState } from "react";
import { useListCalendarEvents, getListCalendarEventsQueryKey, useCreateCalendarEvent } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, addDays, getMonth, getYear, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useListCalendarEvents({
    month: getMonth(currentDate) + 1,
    year: getYear(currentDate)
  });

  const createEvent = useCreateCalendarEvent();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  
  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createEvent.mutate({
      data: {
        title: formData.get("title") as string,
        date: formData.get("date") as string,
        type: formData.get("type") as any,
        status: "pending",
      }
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
        toast({ title: "Event added" });
      }
    });
  };

  const renderCalendarDays = () => {
    const start = startOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), { weekStartsOn: 1 });
    const days = [];
    
    for (let i = 0; i < 35; i++) {
      const date = addDays(start, i);
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const dayEvents = events?.filter(e => isSameDay(new Date(e.date), date)) || [];
      
      days.push(
        <div 
          key={i} 
          className={`min-h-[120px] p-2 border border-border/40 ${isCurrentMonth ? 'bg-card' : 'bg-muted/20 text-muted-foreground'}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isSameDay(date, new Date()) ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
              {date.getDate()}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className="text-xs px-2 py-1 rounded truncate border"
                style={{ 
                  backgroundColor: event.color ? `${event.color}20` : 'var(--primary-20)',
                  borderColor: event.color ? `${event.color}40` : 'var(--primary-40)',
                  color: event.color || 'var(--primary)'
                }}
              >
                <span className="font-semibold capitalize mr-1">[{event.type}]</span>
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Plan and schedule your content pipeline.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Calendar Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" required placeholder="E.g., Shoot video, Publish blog..." />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select name="type" defaultValue="publish">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish">Publish</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createEvent.isPending}>Save Event</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-muted/20">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft className="w-4 h-4" /></Button>
            <h2 className="text-xl font-bold min-w-[150px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
        </CardHeader>
        <div className="grid grid-cols-7 border-b border-border/40 bg-muted/40">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        {isLoading ? (
          <div className="p-8 flex justify-center"><Skeleton className="w-full h-[600px]" /></div>
        ) : (
          <div className="grid grid-cols-7 bg-card">
            {renderCalendarDays()}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
