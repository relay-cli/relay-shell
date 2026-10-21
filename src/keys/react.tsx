import {createContext, useContext, useEffect, useRef, useState, useSyncExternalStore} from 'react';
import type {ReactNode} from 'react';
import {useInput} from 'ink';
import {KeyRegistry} from './registry.js';
import type {KeyBinding, KeyHandlerOptions, ListedBinding} from './registry.js';

const KeyRegistryContext = createContext<KeyRegistry | undefined>(undefined);

export interface KeymapProviderProps {
  /** Supply a registry to dispatch keys from outside React, for example in tests. */
  registry?: KeyRegistry;
  /** Stop reading the keyboard, for example while a child process owns the terminal. */
  active?: boolean;
  children?: ReactNode;
}

/** Reads the keyboard once and routes every key press through the registry. */
export const KeymapProvider = ({registry, active = true, children}: KeymapProviderProps) => {
  const [owned] = useState(() => registry ?? new KeyRegistry());
  useInput(
    (input, key) => {
      owned.dispatch(input, key);
    },
    {isActive: active},
  );
  return <KeyRegistryContext.Provider value={owned}>{children}</KeyRegistryContext.Provider>;
};

export const useKeyRegistry = (): KeyRegistry => {
  const registry = useContext(KeyRegistryContext);
  if (registry === undefined) throw new Error('Key bindings must be used inside <KeymapProvider>.');
  return registry;
};

export interface UseKeybindingsOptions extends KeyHandlerOptions {
  /** Inactive bindings are removed from dispatch and from help. */
  active?: boolean;
}

/**
 * Register bindings for as long as the component is mounted and active.
 * Handlers always see the latest props, so inline functions are fine.
 */
export const useKeybindings = (
  bindings: readonly KeyBinding[],
  options: UseKeybindingsOptions = {},
): void => {
  const registry = useKeyRegistry();
  const {active = true, ...handlerOptions} = options;
  const id = useRef<number | undefined>(undefined);
  const latest = useRef({bindings, handlerOptions});
  latest.current = {bindings, handlerOptions};

  useEffect(() => {
    if (!active) return;
    const registered = registry.register(latest.current.bindings, latest.current.handlerOptions);
    id.current = registered;
    return () => {
      registry.unregister(registered);
      id.current = undefined;
    };
  }, [registry, active]);

  useEffect(() => {
    if (id.current !== undefined) registry.update(id.current, bindings, handlerOptions);
  });
};

/** The bindings a key press can currently reach, for help screens and hints. */
export const useKeyHints = (): readonly ListedBinding[] => {
  const registry = useKeyRegistry();
  return useSyncExternalStore(
    (listener) => registry.subscribe(listener),
    () => registry.list(),
  );
};
