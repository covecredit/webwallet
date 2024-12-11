import { Buffer } from 'buffer';
import process from 'process';
import 'fast-text-encoding';
import { EventEmitter } from 'events';
import stream from 'stream-browserify';
import util from 'util';

// Buffer polyfill
window.Buffer = Buffer;

// Process polyfill
window.process = process;

// EventEmitter polyfill
window.EventEmitter = EventEmitter;

// Stream polyfill
window.Stream = stream;

// Util polyfill
window.util = util;

// Global type declarations
declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: typeof process;
    EventEmitter: typeof EventEmitter;
    Stream: typeof stream;
    util: typeof util;
  }
}