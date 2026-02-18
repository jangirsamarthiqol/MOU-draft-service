# Getting started with Vercel Web Analytics

This guide will help you get started with using Vercel Web Analytics on your project, showing you how to enable it, add the package to your project, deploy your app to Vercel, and view your data in the dashboard.

## Prerequisites

- A Vercel account. If you don't have one, you can [sign up for free](https://vercel.com/signup).
- A Vercel project. If you don't have one, you can [create a new project](https://vercel.com/new).
- The Vercel CLI installed. If you don't have it, you can install it using the following command:

```bash
# Using npm
npm i vercel

# Using yarn
yarn i vercel

# Using pnpm
pnpm i vercel

# Using bun
bun i vercel
```

## Step 1: Enable Web Analytics in Vercel

On the [Vercel dashboard](https://vercel.com/dashboard), select your Project and then click the **Analytics** tab and click **Enable** from the dialog.

> **💡 Note:** Enabling Web Analytics will add new routes (scoped at `/_vercel/insights/*`) after your next deployment.

## Step 2: Add `@vercel/analytics` to your project

This project uses React with Vite. The `@vercel/analytics` package has already been added to the project dependencies.

If you need to install it manually or in a different project, use the package manager of your choice:

```bash
# Using npm
npm i @vercel/analytics

# Using yarn
yarn i @vercel/analytics

# Using pnpm
pnpm i @vercel/analytics

# Using bun
bun i @vercel/analytics
```

## Step 3: Add the Analytics component to your app

For this React application, the `Analytics` component has already been integrated into the main app file.

The Analytics component is a wrapper around the tracking script, offering more seamless integration with React.

**Implementation (already done in this project):**

```jsx
// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import MOUEditor from './pages/MOUEditor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mou" element={<MOUEditor />} />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
```

**💡 Note:** When using the plain React implementation with this setup, route tracking is automatically handled through the router integration.

## Step 4: Deploy your app to Vercel

Deploy your app using the following command:

```bash
vercel deploy
```

If you haven't already, we also recommend [connecting your project's Git repository](https://vercel.com/docs/git#deploying-a-git-repository), which will enable Vercel to deploy your latest commits to main without terminal commands.

Once your app is deployed, it will start tracking visitors and page views.

> **💡 Note:** If everything is set up properly, you should be able to see a Fetch/XHR request in your browser's Network tab from `/_vercel/insights/view` when you visit any page.

## Step 5: View your data in the dashboard

Once your app is deployed, and users have visited your site, you can view your data in the dashboard.

To do so, go to your [dashboard](https://vercel.com/dashboard), select your project, and click the **Analytics** tab.

After a few days of visitors, you'll be able to start exploring your data by viewing and [filtering](https://vercel.com/docs/analytics/filtering) the panels.

Users on Pro and Enterprise plans can also add [custom events](https://vercel.com/docs/analytics/custom-events) to their data to track user interactions such as button clicks, form submissions, or purchases.

Learn more about how Vercel supports [privacy and data compliance standards](https://vercel.com/docs/analytics/privacy-policy) with Vercel Web Analytics.

## Framework-Specific Implementation Notes

### React (Create React App / Vite)

The `Analytics` component should be added to your main app file:

```jsx
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <div>
      {/* your content */}
      <Analytics />
    </div>
  );
}
```

### Next.js (Pages Directory)

Add the Analytics component to your `pages/_app.tsx` or `pages/_app.js`:

```jsx
import { Analytics } from "@vercel/analytics/next";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp;
```

### Next.js (App Directory)

Add the Analytics component to your root layout (`app/layout.tsx` or `app/layout.jsx`):

```jsx
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Next.js</title>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Remix

Add the Analytics component to your root file (`app/root.tsx` or `app/root.jsx`):

```jsx
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/remix";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Analytics />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

### Nuxt

Add the Analytics component to your main component (`app.vue`):

```vue
<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';
</script>

<template>
  <Analytics />
  <NuxtPage />
</template>
```

### SvelteKit

Add the `injectAnalytics` function to the main layout (`src/routes/+layout.ts` or `src/routes/+layout.js`):

```js
import { dev } from "$app/environment";
import { injectAnalytics } from "@vercel/analytics/sveltekit";

injectAnalytics({ mode: dev ? "development" : "production" });
```

### Astro

Add the Analytics component to your base layout (`src/layouts/Base.astro`):

```astro
---
import Analytics from '@vercel/analytics/astro';
{/* ... */}
---

<html lang="en">
	<head>
    <meta charset="utf-8" />
    <!-- ... -->
    <Analytics />
	</head>
	<body>
		<slot />
  </body>
</html>
```

> **💡 Note:** The `Analytics` component is available in version `@vercel/analytics@1.4.0` and later.
> If you are using an earlier version, you must configure the `webAnalytics` property of the Vercel adapter in your `astro.config.mjs` file. For further information, see the [Astro adapter documentation](https://docs.astro.build/en/guides/integrations-guide/vercel/#webanalytics).

### Vue

Add the Analytics component to your main component (`src/App.vue`):

```vue
<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue';
</script>

<template>
  <Analytics />
  <!-- your content -->
</template>
```

> **💡 Note:** Route support is automatically enabled if you're using `vue-router`.

### Other / Plain JavaScript

For plain JavaScript projects, import the `inject` function from the package, which will add the tracking script to your app. **This should only be called once in your app, and must run in the client**.

```js
import { inject } from "@vercel/analytics";

inject();
```

> **💡 Note:** There is no route support with the `inject` function.

### Plain HTML

For plain HTML sites, you can add the following script to your `.html` files:

```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

> **💡 Note:** When using the HTML implementation, there is no need to install the `@vercel/analytics` package. However, there is no route support.

## Next steps

Now that you have Vercel Web Analytics set up, you can explore the following topics to learn more:

- [Learn how to use the `@vercel/analytics` package](https://vercel.com/docs/analytics/package)
- [Learn how to set up custom events](https://vercel.com/docs/analytics/custom-events)
- [Learn about filtering data](https://vercel.com/docs/analytics/filtering)
- [Read about privacy and compliance](https://vercel.com/docs/analytics/privacy-policy)
- [Explore pricing](https://vercel.com/docs/analytics/limits-and-pricing)
- [Troubleshooting](https://vercel.com/docs/analytics/troubleshooting)

## Custom Events (Optional)

For Pro and Enterprise plans, you can track custom events to monitor specific user interactions:

```jsx
import { track } from '@vercel/analytics';

// Track a button click
track('button_clicked', {
  location: 'header',
  label: 'Sign Up'
});

// Track form submission
track('form_submitted', {
  form_name: 'contact_us'
});
```

## Troubleshooting

### Analytics not showing up

1. Ensure you've enabled Analytics in your Vercel project dashboard
2. Deploy your app to Vercel (analytics only work in production)
3. Check the browser's Network tab for requests to `/_vercel/insights/view`
4. Wait a few minutes for data to appear in the dashboard

### Local Development

Analytics are disabled by default in development mode. To enable them for testing, you can pass the `mode` option:

```jsx
<Analytics mode="development" />
```

However, this will send test data to your production analytics, so use with caution.

## Best Practices

1. **Add Analytics once**: Only include the Analytics component once in your app, typically in the root component or layout.
2. **Production only**: Analytics are designed to work in production. Don't worry about development mode tracking.
3. **Privacy**: Vercel Analytics is privacy-friendly and doesn't use cookies or collect personal information.
4. **Performance**: The analytics script is lightweight and loaded asynchronously, so it won't affect your app's performance.
