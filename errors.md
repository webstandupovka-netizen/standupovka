[09:42:20.755] Running build in Washington, D.C., USA (East) – iad1
[09:42:20.755] Build machine configuration: 2 cores, 8 GB
[09:42:20.777] Cloning github.com/webstandupovka-netizen/standupovka (Branch: main, Commit: fe917b3)
[09:42:21.258] Cloning completed: 480.000ms
[09:42:25.135] Restored build cache from previous deployment (DRHLy3CZc5KbGYZD6VtJ3xuegCgr)
[09:42:25.898] Running "vercel build"
[09:42:26.287] Vercel CLI 47.0.4
[09:42:26.613] Installing dependencies...
[09:42:28.198] 
[09:42:28.199] up to date in 1s
[09:42:28.199] 
[09:42:28.199] 199 packages are looking for funding
[09:42:28.199]   run `npm fund` for details
[09:42:28.230] Detected Next.js version: 15.4.5
[09:42:28.235] Running "npm run build"
[09:42:28.526] 
[09:42:28.527] > standup@0.1.0 build
[09:42:28.527] > next build
[09:42:28.527] 
[09:42:29.756]    ▲ Next.js 15.4.5
[09:42:29.758] 
[09:42:29.793]    Creating an optimized production build ...
[09:42:41.928]  ✓ Compiled successfully in 7.0s
[09:42:41.934]    Skipping linting
[09:42:41.935]    Checking validity of types ...
[09:42:51.003] Failed to compile.
[09:42:51.004] 
[09:42:51.004] ./src/types/database.ts:1:1
[09:42:51.004] Type error: Cannot find name 's'.
[09:42:51.005] 
[09:42:51.005] [0m[31m[1m>[22m[39m[90m 1 |[39m s[90m// types/database.ts[39m
[09:42:51.005]  [90m   |[39m [31m[1m^[22m[39m
[09:42:51.005]  [90m 2 |[39m [36mexport[39m [36minterface[39m [33mDatabase[39m {
[09:42:51.005]  [90m 3 |[39m   [36mpublic[39m[33m:[39m {
[09:42:51.005]  [90m 4 |[39m     [33mTables[39m[33m:[39m {[0m
[09:42:51.032] Next.js build worker exited with code: 1 and signal: null
[09:42:51.055] Error: Command "npm run build" exited with 1