import type {Key} from 'ink';
import {chordFromInput, chordsEqual, formatChord, parseKeySpec} from './chord.js';
import type {KeyChord} from './chord.js';

/** How strongly a set of bindings claims keys. Higher layers are asked first. */
export const keyLayers = {
  /** Application-wide bindings such as quit and help. */
  global: 0,
  /** Bindings that belong to the focused pane. */
  pane: 10,
  /** Overlays and dialogs that sit above everything else. */
  overlay: 20,
} as const;

export interface KeyBinding {
  /** One spec or several alternatives, such as `['q', 'ctrl+c']`. */
  keys: string | readonly string[];
  /** Shown in help and status hints. Bindings without one are not listed. */
  description?: string;
  /** Heading the binding is listed under in help. */
  group?: string;
  /** Return `false` to let the key continue to lower layers. */
  run: () => unknown;
}

export interface KeyHandlerOptions {
  layer?: number;
  /** Stop keys that no binding here handles from reaching lower layers. */
  exclusive?: boolean;
  /**
   * Called with keys that no binding in this set matched, before lower layers.
   * Return `true` when the key was used, for example by a text field.
   */
  fallback?: (input: string, key: Key) => boolean;
}

export interface ResolvedBinding {
  chords: readonly KeyChord[];
  labels: readonly string[];
  description?: string;
  group?: string;
  run: () => unknown;
}

export interface ListedBinding {
  keys: string;
  description: string;
  group?: string;
  layer: number;
}

interface Entry {
  id: number;
  layer: number;
  exclusive: boolean;
  bindings: readonly ResolvedBinding[];
  fallback?: (input: string, key: Key) => boolean;
}

export const resolveBinding = (binding: KeyBinding): ResolvedBinding => {
  const specs = typeof binding.keys === 'string' ? [binding.keys] : binding.keys;
  const chords = specs.map(parseKeySpec);
  return {
    chords,
    labels: chords.map(formatChord),
    run: binding.run,
    ...(binding.description === undefined ? {} : {description: binding.description}),
    ...(binding.group === undefined ? {} : {group: binding.group}),
  };
};

/**
 * Holds every active set of bindings and routes each key press to the
 * highest layer that handles it. Within a layer the most recently registered
 * set wins, so a pane mounted inside another pane takes precedence.
 */
export class KeyRegistry {
  #entries = new Map<number, Entry>();
  #nextId = 1;
  #listeners = new Set<() => void>();
  #version = 0;
  #listed: readonly ListedBinding[] = [];

  register(bindings: readonly KeyBinding[], options: KeyHandlerOptions = {}): number {
    const id = this.#nextId;
    this.#nextId += 1;
    this.#entries.set(id, this.#entry(id, bindings, options));
    this.#changed();
    return id;
  }

  update(id: number, bindings: readonly KeyBinding[], options: KeyHandlerOptions = {}): void {
    if (!this.#entries.has(id)) return;
    const before = this.#signature();
    this.#entries.set(id, this.#entry(id, bindings, options));
    if (this.#signature() !== before) this.#changed();
  }

  unregister(id: number): void {
    if (this.#entries.delete(id)) this.#changed();
  }

  /** Route one key press. Returns `true` when a binding or fallback used it. */
  dispatch(input: string, key: Key): boolean {
    const chord = chordFromInput(input, key);
    for (const entry of this.#ordered()) {
      if (chord !== undefined) {
        for (const binding of entry.bindings) {
          if (!binding.chords.some((candidate) => chordsEqual(candidate, chord))) continue;
          if (binding.run() !== false) return true;
        }
      }
      if (entry.fallback?.(input, key) === true) return true;
      if (entry.exclusive) return false;
    }
    return false;
  }

  /** Bindings with a description that a key press can reach, highest layer first. */
  list(): readonly ListedBinding[] {
    return this.#listed;
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  get version(): number {
    return this.#version;
  }

  #entry(id: number, bindings: readonly KeyBinding[], options: KeyHandlerOptions): Entry {
    return {
      id,
      layer: options.layer ?? keyLayers.global,
      exclusive: options.exclusive ?? false,
      bindings: bindings.map(resolveBinding),
      ...(options.fallback === undefined ? {} : {fallback: options.fallback}),
    };
  }

  #ordered(): Entry[] {
    return [...this.#entries.values()].sort(
      (left, right) => right.layer - left.layer || right.id - left.id,
    );
  }

  #computeList(): readonly ListedBinding[] {
    const seen = new Set<string>();
    const listed: ListedBinding[] = [];
    for (const entry of this.#ordered()) {
      const advertises = entry.bindings.some((binding) => binding.description !== undefined);
      for (const binding of entry.bindings) {
        const labels = binding.labels.filter((label) => !seen.has(label));
        for (const label of binding.labels) seen.add(label);
        if (binding.description === undefined || labels.length === 0) continue;
        listed.push({
          keys: labels.join(' / '),
          description: binding.description,
          layer: entry.layer,
          ...(binding.group === undefined ? {} : {group: binding.group}),
        });
      }
      // An exclusive set that lists its own keys, such as a dialog, hides the
      // keys beneath it. One that lists nothing, such as a help screen, does not.
      if (entry.exclusive && advertises) break;
    }
    return listed;
  }

  #signature(): string {
    return JSON.stringify(this.#computeList());
  }

  #changed(): void {
    this.#listed = this.#computeList();
    this.#version += 1;
    for (const listener of this.#listeners) listener();
  }
}
