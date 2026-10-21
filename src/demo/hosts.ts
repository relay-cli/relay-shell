export interface DemoHost {
  name: string;
  region: string;
  status: 'healthy' | 'degraded' | 'down';
  cpu: number;
  uptime: string;
  events: readonly string[];
}

/** Fixed sample data so the demonstration looks the same on every run. */
export const demoHosts: readonly DemoHost[] = [
  {
    name: 'api-1',
    region: 'eu-west',
    status: 'healthy',
    cpu: 23,
    uptime: '41d 6h',
    events: ['09:12 deploy 2.14.0 finished', '09:10 deploy 2.14.0 started'],
  },
  {
    name: 'api-2',
    region: 'eu-west',
    status: 'degraded',
    cpu: 91,
    uptime: '41d 6h',
    events: ['09:31 cpu above 90% for 5m', '09:12 deploy 2.14.0 finished'],
  },
  {
    name: 'worker-1',
    region: 'us-east',
    status: 'healthy',
    cpu: 47,
    uptime: '12d 2h',
    events: ['08:55 queue drained', '08:40 queue depth 1,204'],
  },
  {
    name: 'worker-2',
    region: 'us-east',
    status: 'down',
    cpu: 0,
    uptime: '—',
    events: ['09:27 health check failed 3 times', '09:26 connection refused on :8080'],
  },
  {
    name: 'cache-1',
    region: 'eu-west',
    status: 'healthy',
    cpu: 8,
    uptime: '90d 1h',
    events: ['07:00 snapshot written'],
  },
];
