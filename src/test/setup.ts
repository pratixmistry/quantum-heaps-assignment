import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { configureMockApi } from '@/services/mockApi/request';

beforeEach(() => {
  configureMockApi({ minLatency: 0, maxLatency: 0, sendFailureRate: 0 });
  localStorage.clear();
});

afterEach(() => cleanup());
