/**
 * EventBus for two-way communication between Phaser 3 and React
 */

type Listener = (...args: any[]) => void;

class SimpleEventBus {
  private events: Record<string, Listener[]> = {};

  on(event: string, fn: Listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(fn);
  }

  off(event: string, fn: Listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== fn);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach((cb) => {
      try {
        cb(...args);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }
}

export const EventBus = new SimpleEventBus();
