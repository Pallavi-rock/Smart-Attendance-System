import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isAttendanceMethodAllowed,
  getMethodRestrictions,
} from '../client/src/features/attendance/services/attendance-methods.js';

test('QR-only sessions allow QR but reject code', () => {
  assert.equal(isAttendanceMethodAllowed('qr', 'qr'), true);
  assert.equal(isAttendanceMethodAllowed('qr', 'code'), false);
});

test('Code-only sessions allow code but reject QR', () => {
  assert.equal(isAttendanceMethodAllowed('code', 'code'), true);
  assert.equal(isAttendanceMethodAllowed('code', 'qr'), false);
});

test('Both sessions allow either method', () => {
  assert.equal(isAttendanceMethodAllowed('both', 'qr'), true);
  assert.equal(isAttendanceMethodAllowed('both', 'code'), true);
});

test('Method restrictions map correctly per session method', () => {
  assert.deepEqual(getMethodRestrictions('qr'), { qr: true, code: false });
  assert.deepEqual(getMethodRestrictions('code'), { qr: false, code: true });
  assert.deepEqual(getMethodRestrictions('both'), { qr: true, code: true });
});
