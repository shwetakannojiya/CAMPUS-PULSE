import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import DashboardPage from './pages/DashboardPage';
import AllEventsPage from './pages/AllEventsPage';
import CalendarView from './components/events/CalendarView';
import ImportantPage from './pages/ImportantPage';
import SettingsPage from './pages/SettingsPage';
import EventDetailModal from './components/events/EventDetailModal';
import EditEventModal from './components/events/EditEventModal';
import ReviewCardModal from './components/parser/ReviewCardModal';
import WeeklyDigestModal from './components/digest/WeeklyDigestModal';
import {
  getEvents,
  saveEvent,
  updateEvent,
  deleteEvent,
  clearAllEvents,
  exportEventsJSON,
  checkDuplicate
} from './lib/storage';
import { getEventStatus } from './lib/status';
import { getNowInTimezone, isEventInNext7Days } from './lib/dateUtils';
import { APP_TIMEZONE } from './lib/constants';

// Initial starter events loaded only if localStorage is empty
const SEED_EVENTS = [
  {
    id: 'evt_seed_1',
    title: 'CodeStorm 2026: 36-Hour Hackathon',
    date: '2026-10-31',
    startTime: '09:00',
    endTime: '21:00',
    venue: 'Main Auditorium',
    category: 'Hackathons',
    description: 'National college hackathon with Rs 1,00,000 prize pool. Registrations close tonight.',
    registrationDeadline: '2026-10-31T23:59',
    instructions: ['Carry college ID', 'Bring team of 2-4 members', 'Extension board recommended'],
    isImportant: true,
    dateConfirmed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_seed_2',
    title: 'Hands-on AI Agents Workshop',
    date: '2026-11-06',
    startTime: '10:00',
    endTime: '16:00',
    venue: 'Central Computing Lab 3',
    category: 'Workshops',
    description: 'Build and deploy autonomous full-stack AI agents with Gemini.',
    registrationDeadline: '2026-11-04T23:59',
    instructions: ['Laptop required', 'Node.js pre-installed'],
    isImportant: false,
    dateConfirmed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_seed_3',
    title: 'Cultural Fest Secretary Briefing',
    date: '2026-05-04',
    startTime: '15:00',
    endTime: '16:30',
    venue: 'Seminar Hall 1',
    category: 'Cultural Events',
    description: 'Mandatory briefing session for all student club leaders.',
    registrationDeadline: null,
    instructions: ['Confirm attendance with Dean office'],
    isImportant: false,
    dateConfirmed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt_seed_4',
    title: 'Autumn Semester Midterm Examinations',
    date: '2026-10-15',
    startTime: '09:30',
    endTime: '12:30',
    venue: 'Examination Hall Block A',
    category: 'Academic',
    description: 'Completed midterm evaluations for all B.Tech branches.',
    registrationDeadline: null,
    instructions: [],
    isImportant: false,
    dateConfirmed: true,
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rawEvents, setRawEvents] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');

  // Modals state
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [extractedReviewData, setExtractedReviewData] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDigestModalOpen, setIsDigestModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    let saved = getEvents();
    if (saved.length === 0) {
      SEED_EVENTS.forEach((item) => saveEvent(item));
      saved = getEvents();
    }
    setRawEvents(saved);
  }, []);

  // Compute status dynamically for every event at current moment
  const { wallClock: now } = getNowInTimezone();
  const computedEvents = useMemo(() => {
    return rawEvents.map((evt) => {
      const { status, registrationClosed, isToday } = getEventStatus(evt, now);
      return {
        ...evt,
        computedStatus: status,
        registrationClosed,
        isToday
      };
    });
  }, [rawEvents, now]);

  // Events falling in the rolling next 7 days window
  const eventsThisWeek = useMemo(() => {
    return computedEvents.filter((evt) => evt.date && isEventInNext7Days(evt.date, now));
  }, [computedEvents, now]);

  // Notice Extraction handler
  const handleExtractNotice = async (text) => {
    setIsExtracting(true);
    setExtractError('');

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          referenceDate: now.toISOString().slice(0, 10),
          timezone: APP_TIMEZONE
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      if (!data.event) {
        throw new Error('Invalid extraction response from server.');
      }

      setExtractedReviewData({
        ...data.event,
        isDemoResult: Boolean(data.isDemoMode)
      });
      setIsReviewModalOpen(true);
    } catch (err) {
      console.error('[Notice Extraction Error]:', err);
      alert(`Extraction failed: ${err.message}\n\nPlease try again or verify your notice text.`);
    } finally {
      setIsExtracting(false);
    }
  };

  // Save reviewed event
  const handleSaveReviewedEvent = (newEvent) => {
    // Check for duplicates
    const duplicate = checkDuplicate(newEvent, rawEvents);
    if (duplicate) {
      const proceed = window.confirm(
        `Warning: An event matching "${newEvent.title}" on ${newEvent.date || 'same date'} already exists in your schedule.\n\nDo you still want to save this event?`
      );
      if (!proceed) return;
    }

    saveEvent(newEvent);
    setRawEvents(getEvents());
  };

  // Event handlers
  const handleToggleImportant = (id) => {
    const target = rawEvents.find((e) => e.id === id);
    if (!target) return;
    updateEvent(id, { isImportant: !target.isImportant });
    setRawEvents(getEvents());
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
      setRawEvents(getEvents());
      if (selectedEventForModal?.id === id) {
        setSelectedEventForModal(null);
      }
    }
  };

  const handleSaveEditedEvent = (updated) => {
    updateEvent(updated.id, updated);
    setRawEvents(getEvents());
  };

  const handleClearAllData = () => {
    clearAllEvents();
    setRawEvents([]);
  };

  const handleEditClick = (evt) => {
    setEventToEdit(evt);
    setIsEditModalOpen(true);
  };

  const counts = {
    total: computedEvents.length,
    important: computedEvents.filter((e) => e.isImportant).length
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={counts}
      />

      <div className="app-main">
        <Header isDemoMode={true} />

        {activeTab === 'dashboard' && (
          <DashboardPage
            events={computedEvents}
            onExtractNotice={handleExtractNotice}
            isLoading={isExtracting}
            onToggleImportant={handleToggleImportant}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditClick}
            onViewEventDetails={(evt) => setSelectedEventForModal(evt)}
            onOpenDigest={() => setIsDigestModalOpen(true)}
          />
        )}

        {activeTab === 'all-events' && (
          <AllEventsPage
            events={computedEvents}
            onToggleImportant={handleToggleImportant}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditClick}
            onViewEventDetails={(evt) => setSelectedEventForModal(evt)}
          />
        )}

        {activeTab === 'calendar' && (
          <div className="page-content">
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Campus Calendar
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Month-by-month interactive schedule of all confirmed college events.
              </p>
            </div>
            <CalendarView
              events={computedEvents}
              onSelectEvent={(evt) => setSelectedEventForModal(evt)}
            />
          </div>
        )}

        {activeTab === 'important' && (
          <ImportantPage
            events={computedEvents}
            onToggleImportant={handleToggleImportant}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditClick}
            onViewEventDetails={(evt) => setSelectedEventForModal(evt)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            isDemoMode={true}
            eventCount={computedEvents.length}
            onExportEvents={exportEventsJSON}
            onClearAllData={handleClearAllData}
          />
        )}
      </div>

      <MobileNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Review Extracted Event Modal */}
      {isReviewModalOpen && extractedReviewData && (
        <ReviewCardModal
          isOpen={isReviewModalOpen}
          extractedData={extractedReviewData}
          onClose={() => {
            setIsReviewModalOpen(false);
            setExtractedReviewData(null);
          }}
          onSave={handleSaveReviewedEvent}
        />
      )}

      {/* Event Details Inspector Modal */}
      {selectedEventForModal && (
        <EventDetailModal
          event={selectedEventForModal}
          onClose={() => setSelectedEventForModal(null)}
          onEdit={handleEditClick}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Edit Event Modal */}
      {isEditModalOpen && eventToEdit && (
        <EditEventModal
          event={eventToEdit}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEventToEdit(null);
          }}
          onSave={handleSaveEditedEvent}
          checkDuplicateFn={checkDuplicate}
        />
      )}

      {/* Weekly Digest Modal */}
      {isDigestModalOpen && (
        <WeeklyDigestModal
          isOpen={isDigestModalOpen}
          onClose={() => setIsDigestModalOpen(false)}
          eventsThisWeek={eventsThisWeek}
          allEvents={computedEvents}
          onSelectEvent={(evt) => setSelectedEventForModal(evt)}
          onScrollToNoticeInput={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
