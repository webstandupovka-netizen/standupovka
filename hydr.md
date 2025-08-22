Error: A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <link>
    <script>
    <script>
    <script>
    <script>
    <RootLayout>
      <html lang="ru" suppressHydrationWarning={true}>
        <body className="geist_e531...">
          <Providers>
            <QueryClientProvider client={{}}>
              <LayoutWithNavbar>
                <div className="min-h-scre...">
                  <Navbar user={null} onSignOut={function signOut}>
                    <header className="flex justi...">
                      <div className="w-[1200px]...">
                        <div className="flex items...">
                          <LinkComponent href="/" suppressHydrationWarning={true}>
                            <a suppressHydrationWarning={true} ref={function} onClick={function onClick} ...>
                              <img
                                src="/logo.svg"
                                alt="Logo"
+                               className="h-9 cursor-pointer"
-                               className="h-9"
                              >
                          ...
                        ...
                  ...
              ...

    at createConsoleError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_445d8acf._.js:1484:71)
    at handleConsoleError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_445d8acf._.js:2090:54)
    at console.error (http://localhost:3000/_next/static/chunks/node_modules_next_dist_445d8acf._.js:2243:57)
    at http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:3012:25
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:890:74)
    at emitPendingHydrationWarnings (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:3011:13)
    at completeWork (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:6234:102)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:890:131)
    at completeUnitOfWork (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:8301:23)
    at performUnitOfWork (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:8238:28)
    at workLoopConcurrentByScheduler (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:8232:58)
    at renderRootConcurrent (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:8214:71)
    at performWorkOnRoot (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:7846:176)
    at performWorkOnRootViaSchedulerTask (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1f56dc06._.js:8820:9)
    at MessagePort.performWorkUntilDeadline (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_0f1b9fd4._.js:2588:64)