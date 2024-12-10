// Required polyfills for XRPL.js
import { Buffer } from 'buffer';
import process from 'process';
import 'fast-text-encoding';
import { EventEmitter } from 'events';

// Buffer polyfill
window.Buffer = Buffer;

// Process polyfill
window.process = process;

// EventEmitter polyfill
window.EventEmitter = EventEmitter;

// Global type declarations
declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: typeof process;
    EventEmitter: typeof EventEmitter;
  }
}