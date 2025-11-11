import { useState, useRef, useEffect } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../../firebase";
// -------------------------------------------------------------------------

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

// --- Custom Data Structure for Calendar Events ---
interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string; // Used for color/category (e.g., 'interview', 'reminder')
    description?: string;
    scheduledTime?: string;
    recipientName?: string;
  };
}

const Calendar: React.FC = () => {
  // State management for local calendar operations
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  // ⭐ EVENTS: Will be populated from Firestore
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);
  // NOTE: Assuming useModal is imported and functional
  const { isOpen, openModal, closeModal } = useModal();

  // Mapping Firestore types to Calendar colors
  const getEventColor = (type: string) => {
    switch (type) {
      case 'Interview': return 'danger';
      case 'Meeting': return 'primary';
      case 'Reminder': return 'warning';
      default: return 'success'; // General
    }
  };

  // Helper object mapping for color classes (needed for FullCalendar styling)
  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
    General: "success"
  };

  // =================================================================
  // 🎯 FIREBASE FETCH LOGIC: Get Notifications and Map to Events
  // =================================================================
  useEffect(() => {
    const fetchAndMapNotifications = async () => {
      setLoading(true);
      try {
        // Fetch all notifications (or those scheduled in the future/near past)
        const notifQuery = query(collection(db, "notifications"));
        const snapshot = await getDocs(notifQuery);

        const calendarEvents: CalendarEvent[] = snapshot.docs.map(doc => {
          const data = doc.data();
          const eventType = data.type || 'General';
          const eventDate = data.scheduledDate; // YYYY-MM-DD
          const eventTime = data.scheduledTime || ''; // HH:MM

          // Construct the full date/time string for FullCalendar
          const startDateTime = eventTime
            ? `${eventDate}T${eventTime}:00`
            : eventDate;

          return {
            id: doc.id,
            title: data.title || 'Untitled Event',
            start: startDateTime, // Use the scheduled date/time
            // NOTE: Calendar events are typically instantaneous or 1-day events unless 'end' is defined
            allDay: !eventTime, // If no time is specified, treat as all day event

            extendedProps: {
              calendar: eventType, // Store the type here
              description: data.description,
              scheduledTime: eventTime,
              recipientName: data.recipientName || 'Applicant', // Placeholder
            },
            // Define styling based on the event type
            className: `fc-bg-${getEventColor(eventType).toLowerCase()}`
          };
        });

        setEvents(calendarEvents);
      } catch (err) {
        console.error("Error fetching calendar events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMapNotifications();
  }, []);

  // FullCalendar Handlers
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // This is for creating NEW events by dragging/selecting a range in the calendar UI
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    // FullCalendar provides endStr one day after for allDay events, handle that if you allow multi-day
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    // This handles clicking an EXISTING event
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    // Note: FullCalendar returns ISO strings, we extract the date part for the input field
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  // NOTE: This function currently only updates the local state and DOES NOT update Firestore.
  const handleAddOrUpdateEvent = () => {
    if (eventTitle.trim() === '') return;

    // TODO: Here you would integrate Firestore ADD/UPDATE logic 
    // to persist changes back to the 'notifications' collection.

    // Local state update (maintaining previous behavior)
    if (selectedEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
              ...event,
              title: eventTitle,
              start: eventStartDate,
              end: eventEndDate,
              extendedProps: { calendar: eventLevel },
            }
            : event
        )
      );
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta title="IAIN" description="IAIN Calendar Page" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">

        {loading && (
          <div className="text-center py-10 text-gray-500">Loading scheduled events...</div>
        )}

        <div className={`custom-calendar ${loading ? 'opacity-50' : ''}`}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Add Event +",
                click: openModal,
              },
            }}
          />
        </div>

        {/* Modal for Adding/Editing Events */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] p-6 lg:p-10"
        >
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div>
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                {selectedEvent ? "Edit Interview/Reminder" : "Add New Event"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This modal is for adding or editing scheduled notifications.
              </p>
            </div>
            <div className="mt-8">
              <div>
                {/* Event Title (Maps to Notification Title) */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Notification Title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Type (Color)
                </label>
                {/* Event Type Radio Buttons */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(calendarsEvents).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div
                        className={`form-check form-check-${value} form-check-inline`}
                      >
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                          htmlFor={`modal${key}`}
                        >
                          <span className="relative">
                            <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="event-level"
                              value={key}
                              id={`modal${key}`}
                              checked={eventLevel === key}
                              onChange={() => setEventLevel(key)}
                            />
                            <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                              <span
                                className={`h-2 w-2 rounded-full bg-white ${eventLevel === key ? "block" : "hidden"
                                  }`}
                              ></span>
                            </span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    id="event-start-date"
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>

              {/* End Date (Keep for FullCalendar compatibility, even if usually 1-day) */}
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  End Date (Optional)
                </label>
                <div className="relative">
                  <input
                    id="event-end-date"
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                disabled={!eventTitle || !eventStartDate || !eventLevel}
              >
                {selectedEvent ? "Update Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

// --- FullCalendar Event Content Renderer ---
const renderEventContent = (eventInfo: any) => {
  // Determine color class based on the extendedProps.calendar (which holds the notification type)
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  const timeText = eventInfo.event.extendedProps.scheduledTime ? eventInfo.event.extendedProps.scheduledTime : '';

  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      {timeText && <div className="fc-event-time">{timeText}</div>}
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;