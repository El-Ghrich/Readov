// This file provides a fallback definition for the global Deno namespace
// It silences "Cannot find name 'Deno'" errors if the Deno extension is not active.
// Once the "denoland.vscode-deno" extension is installed and active, this file is redundant but harmless.

declare const Deno: {
  env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
  // Add other minimal Deno APIs used in the code
  [key: string]: any;
};
