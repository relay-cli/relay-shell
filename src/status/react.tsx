import {createContext, useContext, useEffect, useId, useState, useSyncExternalStore} from 'react';
import type {ReactNode} from 'react';
import {StatusStore} from './store.js';
import type {NotifyOptions, StatusSegment, StatusSnapshot} from './store.js';

const StatusContext = createContext<StatusStore | undefined>(undefined);

export interface StatusProviderProps {
  /** Supply a store to publish status from outside React. */
  store?: StatusStore;
  children?: ReactNode;
}

export const StatusProvider = ({store, children}: StatusProviderProps) => {
  const [owned] = useState(() => store ?? new StatusStore());
  useEffect(() => () => owned.dispose(), [owned]);
  return <StatusContext.Provider value={owned}>{children}</StatusContext.Provider>;
};

export const useStatusStore = (): StatusStore => {
  const store = useContext(StatusContext);
  if (store === undefined) throw new Error('Status must be used inside <StatusProvider>.');
  return store;
};

/** Show a segment in the status bar for as long as the component is mounted. */
export const useStatusSegment = (segment: StatusSegment | undefined): void => {
  const store = useStatusStore();
  const id = useId();
  useEffect(() => () => store.remove(id), [store, id]);
  useEffect(() => {
    if (segment === undefined) store.remove(id);
    else store.set(id, segment);
  });
};

/** Show a short message in the status bar, such as "Saved" or "Connection lost". */
export const useNotify = (): ((message: string, options?: NotifyOptions) => void) => {
  const store = useStatusStore();
  return (message, options) => store.notify(message, options);
};

export const useStatusSnapshot = (): StatusSnapshot => {
  const store = useStatusStore();
  return useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.snapshot(),
  );
};
