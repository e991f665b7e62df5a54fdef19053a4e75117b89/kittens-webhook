import type { Event, EventType } from "../types";
import { Logger } from "../utils/logger";

/**
 * Event Manager for handling GitHub webhook events
 */
export class EventManager {
  private static instance: EventManager;
  private events: Map<EventType, Event[]> = new Map();

  private constructor() {}

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  /**
   * Register event handlers
   */
  public register(events: Event[]): void {
    for (const event of events) {
      for (const eventType of event.events) {
        if (!this.events.has(eventType)) {
          this.events.set(eventType, []);
        }
        this.events.get(eventType)!.push(event);
        Logger.log(`Registered ${event.name} for ${eventType} events`);
      }
    }
  }

  /**
   * Emit event to registered handlers
   */
  public async emit(eventType: EventType, payload: any): Promise<void> {
    const handlers = this.events.get(eventType);
    
    if (!handlers || handlers.length === 0) {
      Logger.warn(`No handlers registered for event type: ${eventType}`);
      return;
    }

    Logger.log(`Processing ${eventType} event with ${handlers.length} handler(s)`);

    // Execute all handlers for this event type
    const promises = handlers.map(async (handler) => {
      try {
        await handler.execute(payload);
        Logger.log(`${handler.name} executed successfully`);
      } catch (error) {
        Logger.error(`${handler.name} failed: ${error}`);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get registered event types
   */
  public getRegisteredEvents(): EventType[] {
    return Array.from(this.events.keys());
  }

  /**
   * Get handlers for specific event type
   */
  public getHandlers(eventType: EventType): Event[] {
    return this.events.get(eventType) || [];
  }
}

// Export singleton instance
export const eventManager = EventManager.getInstance();
