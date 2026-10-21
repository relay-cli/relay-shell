export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface StatusSegment {
  text: string;
  /** Which end of the bar the segment sits at. Defaults to `left`. */
  side?: 'left' | 'right';
  tone?: StatusTone;
  /** Lower numbers sit closer to the bar's edge. Equal values keep mount order. */
  order?: number;
}

export interface StatusNotice {
  message: string;
  tone: StatusTone;
}

export interface NotifyOptions {
  tone?: StatusTone;
  /** How long the notice stays visible. `0` keeps it until the next notice or `dismiss()`. */
  durationMs?: number;
}

export interface StatusSnapshot {
  left: readonly StatusSegment[];
  right: readonly StatusSegment[];
  notice?: StatusNotice;
}

interface StoredSegment {
  segment: StatusSegment;
  sequence: number;
}

const sameSegment = (left: StatusSegment, right: StatusSegment): boolean =>
  left.text === right.text &&
  left.side === right.side &&
  left.tone === right.tone &&
  left.order === right.order;

/**
 * Collects the segments components publish to the status bar and the one
 * transient notice that temporarily replaces the left side.
 */
export class StatusStore {
  #segments = new Map<string, StoredSegment>();
  #sequence = 0;
  #notice: StatusNotice | undefined;
  #timer: ReturnType<typeof setTimeout> | undefined;
  #listeners = new Set<() => void>();
  #snapshot: StatusSnapshot = {left: [], right: []};

  set(id: string, segment: StatusSegment): void {
    const existing = this.#segments.get(id);
    if (existing !== undefined && sameSegment(existing.segment, segment)) return;
    if (existing === undefined) this.#sequence += 1;
    this.#segments.set(id, {segment, sequence: existing?.sequence ?? this.#sequence});
    this.#changed();
  }

  remove(id: string): void {
    if (this.#segments.delete(id)) this.#changed();
  }

  notify(message: string, options: NotifyOptions = {}): void {
    const {tone = 'info', durationMs = 4000} = options;
    this.#clearTimer();
    this.#notice = {message, tone};
    if (durationMs > 0) {
      this.#timer = setTimeout(() => this.dismiss(), durationMs);
      this.#timer.unref();
    }
    this.#changed();
  }

  dismiss(): void {
    this.#clearTimer();
    if (this.#notice === undefined) return;
    this.#notice = undefined;
    this.#changed();
  }

  snapshot(): StatusSnapshot {
    return this.#snapshot;
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /** Cancel a pending notice timer, for example when the application exits. */
  dispose(): void {
    this.#clearTimer();
  }

  #clearTimer(): void {
    if (this.#timer !== undefined) clearTimeout(this.#timer);
    this.#timer = undefined;
  }

  #changed(): void {
    const sorted = [...this.#segments.values()].sort(
      (left, right) =>
        (left.segment.order ?? 0) - (right.segment.order ?? 0) || left.sequence - right.sequence,
    );
    const segments = sorted.map((stored) => stored.segment);
    this.#snapshot = {
      left: segments.filter((segment) => segment.side !== 'right'),
      // The right side reads from the edge inwards, so the lowest order is last.
      right: segments.filter((segment) => segment.side === 'right').reverse(),
      ...(this.#notice === undefined ? {} : {notice: this.#notice}),
    };
    for (const listener of this.#listeners) listener();
  }
}
