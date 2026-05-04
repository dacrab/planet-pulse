import { Component, For, Show } from 'solid-js';
import { useStore } from '../stores/context';
import { Event } from '../types/events';
import { eventColors } from '../design-tokens';

export const EventFeed: Component = () => {
  const store = useStore();
  const events = () => store.aggregator.filteredEvents();

  return (
    <div class="event-feed">
      <div class="event-feed-header">
        <h2>Live Event Feed</h2>
        <div class="event-feed-meta">
          <div class="live-indicator">
            <div class="pulse-dot" />
            <span>LIVE</span>
          </div>
          <div class="event-count">{events().length}</div>
        </div>
      </div>
      
      <div class="event-feed-content">
        <Show when={events().length > 0} fallback={
          <div class="event-feed-empty">
            <div class="empty-icon">📡</div>
            <p class="empty-title">No events yet</p>
            <p class="empty-subtitle">Events will appear here as they happen</p>
          </div>
        }>
          <For each={events()}>
            {(event) => <EventCard event={event} />}
          </For>
        </Show>
      </div>
    </div>
  );
};

const EventCard: Component<{ event: Event }> = (props) => {
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getContent = () => {
    const e = props.event;
    switch (e.source) {
      case 'earthquake':
        return `M${e.magnitude.toFixed(1)} — ${e.place}`;
      case 'flight':
        return `${e.callsign.trim() || 'Unknown'} from ${e.origin_country}`;
      case 'iss':
        return `Orbiting at ${e.altitude.toFixed(0)}km altitude`;
      case 'weather':
        return `${e.temperature.toFixed(1)}°C, ${e.condition} in ${e.location}`;
      case 'crypto':
        const change = e.change_24h > 0 ? `+${e.change_24h.toFixed(2)}` : e.change_24h.toFixed(2);
        return `${e.symbol} $${e.price.toFixed(2)} (${change}%)`;
      case 'github':
        return `${e.type} in ${e.repo}`;
    }
  };

  return (
    <div class={`event-card event-${eventColors[props.event.source]}`}>
      <div class="event-dot" />
      <div class="event-content">
        <div class="event-text">{getContent()}</div>
        <div class="event-time">{formatTime(props.event.timestamp)}</div>
      </div>
    </div>
  );
};
