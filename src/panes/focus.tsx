import {createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore} from 'react';
import type {ReactNode} from 'react';
import {useKeybindings} from '../keys/index.js';

interface FocusEntry {
  id: string;
  order: number;
  sequence: number;
}

/**
 * Tracks which panes can take focus and which one has it. Panes are visited
 * in `order`, then in the order they mounted.
 */
export class PaneFocus {
  #entries = new Map<string, FocusEntry>();
  #sequence = 0;
  #focused: string | undefined;
  #preferred: string | undefined;
  #listeners = new Set<() => void>();

  constructor(initial?: string) {
    this.#preferred = initial;
  }

  get focused(): string | undefined {
    return this.#focused;
  }

  /** Pane ids in focus order. */
  get ids(): readonly string[] {
    return [...this.#entries.values()]
      .sort((left, right) => left.order - right.order || left.sequence - right.sequence)
      .map((entry) => entry.id);
  }

  register(id: string, order = 0): () => void {
    if (this.#entries.has(id)) throw new Error(`A pane with id "${id}" is already mounted.`);
    this.#sequence += 1;
    this.#entries.set(id, {id, order, sequence: this.#sequence});
    if (id === this.#preferred) {
      this.#preferred = undefined;
      this.#focused = id;
    } else if (this.#focused === undefined) {
      this.#focused = id;
    }
    this.#emit();
    return () => {
      const ids = this.ids;
      this.#entries.delete(id);
      if (this.#focused === id) {
        const index = ids.indexOf(id);
        const remaining = this.ids;
        this.#focused = remaining[Math.min(index, remaining.length - 1)];
      }
      this.#emit();
    };
  }

  /** Focus a pane. A pane that has not mounted yet takes focus when it does. */
  focus(id: string): void {
    if (!this.#entries.has(id)) {
      this.#preferred = id;
      return;
    }
    this.#preferred = undefined;
    if (this.#focused === id) return;
    this.#focused = id;
    this.#emit();
  }

  next(): void {
    this.#move(1);
  }

  previous(): void {
    this.#move(-1);
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #move(step: number): void {
    const ids = this.ids;
    if (ids.length === 0) return;
    const index = this.#focused === undefined ? -1 : ids.indexOf(this.#focused);
    const target = ids[(index + step + ids.length) % ids.length];
    if (target !== undefined) this.focus(target);
  }

  #emit(): void {
    for (const listener of this.#listeners) listener();
  }
}

const PaneFocusContext = createContext<PaneFocus | undefined>(undefined);

export interface PaneFocusProviderProps {
  /** The pane focused first. Defaults to the first pane that mounts. */
  initialFocus?: string;
  /** Keys that move focus forward and backward. Pass `false` to bind them yourself. */
  keys?: {next: string | readonly string[]; previous: string | readonly string[]} | false;
  /** Called whenever another pane takes focus. */
  onFocusChange?: (id: string | undefined) => void;
  children?: ReactNode;
}

const defaultFocusKeys = {next: 'tab', previous: 'shift+tab'};

/** Owns pane focus and binds `Tab` and `Shift+Tab` to move it. */
export const PaneFocusProvider = ({
  initialFocus,
  keys = defaultFocusKeys,
  onFocusChange,
  children,
}: PaneFocusProviderProps) => {
  const [focus] = useState(() => new PaneFocus(initialFocus));
  const focused = useSyncExternalStore(
    (listener) => focus.subscribe(listener),
    () => focus.focused,
  );
  useEffect(() => {
    onFocusChange?.(focused);
  }, [focused, onFocusChange]);
  useKeybindings(
    keys === false
      ? []
      : [
          {keys: keys.next, description: 'Next pane', group: 'Panes', run: () => focus.next()},
          {
            keys: keys.previous,
            description: 'Previous pane',
            group: 'Panes',
            hint: false,
            run: () => focus.previous(),
          },
        ],
  );
  return <PaneFocusContext.Provider value={focus}>{children}</PaneFocusContext.Provider>;
};

export const usePaneFocus = (): PaneFocus => {
  const focus = useContext(PaneFocusContext);
  if (focus === undefined) throw new Error('Panes must be used inside <PaneFocusProvider>.');
  return focus;
};

/** The id of the focused pane, updated as focus moves. */
export const useFocusedPane = (): string | undefined => {
  const focus = usePaneFocus();
  return useSyncExternalStore(
    (listener) => focus.subscribe(listener),
    () => focus.focused,
  );
};

/** Register a focusable pane and report whether it has focus. */
export const usePaneRegistration = (id: string, options: {order?: number; focusable?: boolean}) => {
  const focus = usePaneFocus();
  const {order = 0, focusable = true} = options;
  useEffect(
    () => (focusable ? focus.register(id, order) : undefined),
    [focus, id, order, focusable],
  );
  const focused = useFocusedPane() === id;
  return useMemo(() => ({focused, focus: () => focus.focus(id)}), [focus, focused, id]);
};
