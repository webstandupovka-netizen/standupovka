[13:03:31.773] Running build in Washington, D.C., USA (East) – iad1
[13:03:31.774] Build machine configuration: 2 cores, 8 GB
[13:03:31.789] Cloning github.com/webstandupovka-netizen/standupovka (Branch: main, Commit: 880392b)
[13:03:31.802] Skipping build cache, deployment was triggered without cache.
[13:03:32.127] Cloning completed: 338.000ms
[13:03:32.444] Running "vercel build"
[13:03:32.836] Vercel CLI 46.0.2
[13:03:33.227] Installing dependencies...
[13:03:51.934] 
[13:03:51.934] added 621 packages in 18s
[13:03:51.935] 
[13:03:51.936] 199 packages are looking for funding
[13:03:51.936]   run `npm fund` for details
[13:03:52.344] Detected Next.js version: 15.4.5
[13:03:52.351] Running "npm run build"
[13:03:52.575] 
[13:03:52.576] > standup@0.1.0 build
[13:03:52.576] > next build
[13:03:52.576] 
[13:03:54.154] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[13:03:54.157] This information is used to shape Next.js' roadmap and prioritize features.
[13:03:54.158] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[13:03:54.158] https://nextjs.org/telemetry
[13:03:54.158] 
[13:03:54.449]    ▲ Next.js 15.4.5
[13:03:54.454] 
[13:03:54.488]    Creating an optimized production build ...
[13:04:13.126] <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (108kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
[13:04:13.402]  ⚠ Compiled with warnings in 2000ms
[13:04:13.403] 
[13:04:13.404] ./node_modules/@supabase/supabase-js/dist/module/index.js
[13:04:13.404] A Node.js API is used (process.version at line: 17) which is not supported in the Edge Runtime.
[13:04:13.404] Learn more: https://nextjs.org/docs/api-reference/edge-runtime
[13:04:13.404] 
[13:04:13.404] Import trace for requested module:
[13:04:13.405] ./node_modules/@supabase/supabase-js/dist/module/index.js
[13:04:13.405] ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
[13:04:13.405] ./node_modules/@supabase/ssr/dist/module/index.js
[13:04:13.405] ./src/lib/supabase-middleware.ts
[13:04:13.405] 
[13:04:13.405] ./node_modules/@supabase/supabase-js/dist/module/index.js
[13:04:13.405] A Node.js API is used (process.version at line: 18) which is not supported in the Edge Runtime.
[13:04:13.405] Learn more: https://nextjs.org/docs/api-reference/edge-runtime
[13:04:13.405] 
[13:04:13.405] Import trace for requested module:
[13:04:13.405] ./node_modules/@supabase/supabase-js/dist/module/index.js
[13:04:13.405] ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
[13:04:13.405] ./node_modules/@supabase/ssr/dist/module/index.js
[13:04:13.406] ./src/lib/supabase-middleware.ts
[13:04:13.406] 
[13:04:13.406] ./node_modules/@supabase/supabase-js/dist/module/index.js
[13:04:13.406] A Node.js API is used (process.version at line: 21) which is not supported in the Edge Runtime.
[13:04:13.406] Learn more: https://nextjs.org/docs/api-reference/edge-runtime
[13:04:13.406] 
[13:04:13.406] Import trace for requested module:
[13:04:13.406] ./node_modules/@supabase/supabase-js/dist/module/index.js
[13:04:13.406] ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
[13:04:13.407] ./node_modules/@supabase/ssr/dist/module/index.js
[13:04:13.407] ./src/lib/supabase-middleware.ts
[13:04:13.407] 
[13:04:23.982]  ✓ Compiled successfully in 25.0s
[13:04:23.988]    Skipping linting
[13:04:23.989]    Checking validity of types ...
[13:04:32.159] Failed to compile.
[13:04:32.159] 
[13:04:32.159] src/app/api/admin/users/[id]/route.ts
[13:04:32.159] Type error: Route "src/app/api/admin/users/[id]/route.ts" has an invalid "PATCH" export:
[13:04:32.160]   Type "{ params: { id: string; }; }" is not a valid type for the function's second argument.
[13:04:32.160] 
[13:04:32.184] Next.js build worker exited with code: 1 and signal: null
[13:04:32.204] Error: Command "npm run build" exited with 1