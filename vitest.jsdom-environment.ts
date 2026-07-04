import { builtinEnvironments } from "vitest/environments";

const jsdom = builtinEnvironments.jsdom;

/**
 * A jsdom environment that bridges `AbortSignal`s across the Node/jsdom boundary.
 *
 * React Router v8 builds a `Request` (with an `AbortSignal`) for every client
 * navigation and submission. Node's `Request` (undici) only accepts its own
 * native `AbortSignal`, but jsdom overrides the global `AbortController`/
 * `AbortSignal` with its own DOM implementation. That mismatch makes undici
 * throw an error along the lines of `Expected signal ... to be an instance of
 * AbortSignal` on every submission test.
 *
 * We can't simply keep Node's native globals either: jsdom's DOM
 * `EventTarget.addEventListener(type, listener, { signal })` rejects a native
 * signal for the same reason, in reverse. Instead we keep jsdom's globals (so
 * DOM code keeps working) and translate a jsdom `AbortSignal` into a native one
 * only where undici's `Request` needs it.
 */
export default {
  name: "jsdom",
  transformMode: "web",
  async setup(global: any, options: any) {
    // Node's native implementations, captured before jsdom installs its own.
    const NativeAbortController = global.AbortController;
    const NativeAbortSignal = global.AbortSignal;
    const OriginalRequest = global.Request;

    // The whole bridge below assumes these are Node's real globals. If they're
    // missing or already replaced (e.g. a polyfill loaded first), `toNativeSignal`
    // would build non-undici signals and `class Request extends undefined` would
    // throw a cryptic error. Fail loudly with an actionable message instead.
    if (
      typeof NativeAbortController !== "function" ||
      typeof NativeAbortSignal !== "function" ||
      typeof OriginalRequest !== "function"
    ) {
      throw new Error(
        "vitest.jsdom-environment: expected native AbortController/AbortSignal/Request " +
          "globals before jsdom setup. This environment must load before any " +
          "Request/AbortSignal polyfill.",
      );
    }

    const result = await jsdom.setup(global, options);

    const toNativeSignal = (signal: any) => {
      if (!signal || signal instanceof NativeAbortSignal) return signal;
      const controller = new NativeAbortController();
      if (signal.aborted) {
        controller.abort(signal.reason);
      } else {
        signal.addEventListener(
          "abort",
          () => controller.abort(signal.reason),
          { once: true },
        );
      }
      return controller.signal;
    };

    global.Request = class Request extends OriginalRequest {
      constructor(input: any, init?: any) {
        if (init && init.signal) {
          super(input, { ...init, signal: toNativeSignal(init.signal) });
        } else {
          super(input, init);
        }
      }
    };

    return result;
  },
} satisfies typeof jsdom;
