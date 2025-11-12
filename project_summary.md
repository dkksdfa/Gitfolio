<!--
Each file summary should be structured as follows:

### `[File Path]`

[A brief description of the file's purpose and its main functionalities.]

---
-->

# Project Summary

This file contains a summary of all the files in the project.

---

### `.gitignore`

Specifies files and folders to be ignored by Git. This includes `node_modules`, `.next`, build outputs, local environment files (`.env.local`), and other miscellaneous files.

---

### `PROJECT_PLAN.md`

A markdown file outlining the project plan for an "AI Portfolio Builder". It describes:
-   **Main Page:** A landing page with login and "Create Portfolio" buttons.
-   **Portfolio Generation Flow:**
    1.  GitHub login.
    2.  An analysis page that shows a user's GitHub repositories with details like languages, contributors, and a new feature for a clickable GitHub link.
    3.  A template selection page with previews.
    4.  An optional feature for custom template creation.
    5.  Final generation of a downloadable static portfolio website.

---

### `README.md`

A standard README file for a project named "Gitfolio". It includes instructions on how to run the development server (`npm run dev`) and a brief feature list, including fetching GitHub data, generating a portfolio, and summarizing projects with AI.

---

### `package.json`

Defines the project's metadata, scripts, and dependencies.
-   **Name:** `ai`
-   **Scripts:** `dev`, `build`, `start`, `lint`.
-   **Dependencies:** It's a Next.js application using `@google/generative-ai` for AI features, `axios` for HTTP requests, `next`, `react`, `react-dom`, `ioredis` for Redis, and `cookies-next` for cookie management.
-   **Dev Dependencies:** Includes `typescript`, `tailwindcss`, and `autoprefixer`.

---

### `postcss.config.js`

Configuration file for PostCSS. It enables the `tailwindcss` and `autoprefixer` plugins to process CSS.

---

### `tailwind.config.js`

Configuration file for Tailwind CSS. It specifies the files to scan for Tailwind classes.

---

### `tsconfig.json`

TypeScript configuration file for the Next.js project. It includes path aliases (`@/*` for `src/*`), and specifies compiler options and files to include/exclude.

---

## `src/app` - Application Pages and APIs

### `src/app/layout.tsx`

The root layout for the Next.js application. It sets up the HTML structure, includes the `Header` and `Footer` components, and defines the site's metadata (title and description).

---

### `src/app/page.tsx`

The landing page component. It features a hero section and a features section. It checks if the user is logged in. If logged in, the "Start" button goes to the `/templates` page. If not, it shows a modal prompting the user to log in via GitHub.

---

### `src/app/analysis/page.tsx`

A client-side React component for the `/analysis` page. This is a core part of the application flow.
-   It fetches the user's GitHub data and a list of all their repositories.
-   It displays the repositories and allows the user to select which ones to include in their portfolio.
-   Users can edit the name and description of each repository.
-   It shows the selected portfolio template and allows the user to proceed to generate the portfolio, which pushes the selected data to `localStorage` and navigates to the preview page (`/portfolio/[template]`).

---

### `src/app/templates/page.tsx`

This page displays a list of all available portfolio templates, getting the data from `lib/templates.ts`. Each template is shown as a card with a title, description, and a thumbnail, linking to a preview page.

---

### `src/app/templates/[template]/page.tsx`

A dynamic page for previewing a specific portfolio template. It dynamically imports the template component based on the URL slug. It displays the template with sample data and has a button to "Select this template," which saves the choice to `localStorage` and redirects the user to the `/analysis` page.

---

### `src/app/portfolio/create/page.tsx`

A page for creating or editing a portfolio profile manually. It uses the `PortfolioForm` component.

---

### `src/app/portfolio/[template]/page.tsx`

A dynamic page that renders the final portfolio for preview and download.
-   It loads the user and repository data that was previously saved to `localStorage`.
-   It dynamically imports the selected template component.
-   It provides a "Download Portfolio" button that generates a complete, single-file HTML document of the rendered portfolio and initiates a download.

---

## `src/app/api` - API Routes

### `src/app/api/auth/`

-   `github/route.ts`: Initiates the GitHub OAuth flow by redirecting the user to GitHub's authorization URL.
-   `github/callback/route.ts`: The callback URL for GitHub OAuth. It exchanges the authorization code for an access token and saves the token in a secure, `httpOnly` cookie.
-   `logout/route.ts`: Logs the user out by deleting the `access_token` cookie.

---

### `src/app/api/github/`

-   `all-repos/route.ts`: A comprehensive API route that fetches all repositories associated with a user, including their own repos, collaborations, and repos they've contributed to via pull requests or commits. It augments this data with language statistics, contributor counts, and the user's commit count for each repo. It uses a cache (`lib/cache.ts`) to improve performance.
-   `contributions/route.ts`: Fetches repositories the user has contributed to by searching for their merged pull requests and commits.
-   `repos/route.ts`: Fetches the user's repositories. It seems to be an earlier or simpler version of the `all-repos` endpoint.

---

### `src/app/api/ai/summarize/route.ts`

An API route that uses the Google Generative AI (Gemini) to summarize a project.
-   It takes an `owner` and `repo` as input.
-   It fetches the repository's README, commits, and contributor list from GitHub.
-   It constructs a detailed prompt for the Gemini model, asking it to generate a project description and a summary of the user's role in Korean.
-   It returns the formatted summary as a JSON response.

---

### `src/app/api/user/`

-   `route.ts`: Fetches the basic profile of the currently authenticated user from the GitHub API.
-   `profile/route.ts`: A CRUD-like API for managing a user's portfolio profile. It stores the profile data in a local JSON file (`data/profiles.json`) and also uses the application cache.

---

### `src/app/api/metrics/route.ts`

An API route to expose internal application metrics (like API call counts and durations). It can return data in either JSON or Prometheus format and is protected by an API key.

---

## `src/components` - Reusable Components

-   `Header.tsx`: The site-wide header. It displays the "Gitfolio" brand link. If the user is logged in, it shows their avatar, name, and a logout link. Otherwise, it shows a login link.
-   `Footer.tsx`: A simple site-wide footer with a copyright notice.
-   `PortfolioForm.tsx`: A detailed form that allows users to manually create and edit their portfolio data. It includes fields for personal information, skills, projects, and career history. The data is saved to `localStorage`. It dynamically shows or hides fields based on the requirements of the selected template.

---

## `src/lib` - Core Libraries and Utilities

-   `cache.ts`: Implements a simple in-memory cache with TTL (Time To Live). It has an optional Redis backend that can be enabled by setting the `REDIS_URL` environment variable.
-   `fieldUtils.ts`: Provides a utility function `hasRequiredField` to check if a specific data field is required by the currently selected portfolio template.
-   `logger.ts`: A simple logging utility (`info`, `warn`, `error`) that automatically masks sensitive information like access tokens and API keys in the logs.
-   `metrics.ts`: A utility for tracking application performance metrics (e.g., API call counts, error counts, durations) using the caching layer.
-   `retry.ts`: Exports a `withRetry` utility function that can wrap an asynchronous function to automatically retry it on failure with an exponential backoff delay.
-   `templates.ts`: An array that defines the metadata for all available portfolio templates. Each template object includes a `slug`, `title`, `description`, a list of `requiredFields`, and a `thumbnail` image URL.

---

## `src/templates` - Portfolio Templates

This directory contains various React components, each representing a different portfolio template. These components are dynamically imported based on user selection. They receive `user` and `repos` data as props and are responsible for rendering the final portfolio layout.

Examples include:
-   `template-one.tsx`: A simple, clean layout.
-   `template-detailed.tsx`: A more comprehensive layout that includes case-study-like sections.
-   `template-minimal.tsx`: A minimal, resume-style layout.
-   `u-it.tsx`, `cdg-portfolio.tsx`, `april5.tsx`: Templates inspired by existing portfolio websites.

---

### `.gitignore`

Specifies files and folders to be ignored by Git. This includes `node_modules`, `.next`, build outputs, local environment files (`.env.local`), and other miscellaneous files.

---

### `PROJECT_PLAN.md`

A markdown file outlining the project plan for an "AI Portfolio Builder". It describes:
-   **Main Page:** A landing page with login and "Create Portfolio" buttons.
-   **Portfolio Generation Flow:**
    1.  GitHub login.
    2.  An analysis page that shows a user's GitHub repositories with details like languages, contributors, and a new feature for a clickable GitHub link.
    3.  A template selection page with previews.
    4.  An optional feature for custom template creation.
    5.  Final generation of a downloadable static portfolio website.

---

### `README.md`

A standard README file for a project named "Gitfolio". It includes instructions on how to run the development server (`npm run dev`) and a brief feature list, including fetching GitHub data, generating a portfolio, and summarizing projects with AI.

---

### `package.json`

Defines the project's metadata, scripts, and dependencies.
-   **Name:** `ai`
-   **Scripts:** `dev`, `build`, `start`, `lint`.
-   **Dependencies:** It's a Next.js application using `@google/generative-ai` for AI features, `axios` for HTTP requests, `next`, `react`, `react-dom`, `ioredis` for Redis, and `cookies-next` for cookie management.
-   **Dev Dependencies:** Includes `typescript`, `tailwindcss`, and `autoprefixer`.

---

### `postcss.config.js`

Configuration file for PostCSS. It enables the `tailwindcss` and `autoprefixer` plugins to process CSS.

---

### `tailwind.config.js`

Configuration file for Tailwind CSS. It specifies the files to scan for Tailwind classes.

---

### `tsconfig.json`

TypeScript configuration file for the Next.js project. It includes path aliases (`@/*` for `src/*`), and specifies compiler options and files to include/exclude.

---

## `src/app` - Application Pages and APIs

### `src/app/layout.tsx`

The root layout for the Next.js application. It sets up the HTML structure, includes the `Header` and `Footer` components, and defines the site's metadata (title and description).

---

### `src/app/page.tsx`

The landing page component. It features a hero section and a features section. It checks if the user is logged in. If logged in, the "Start" button goes to the `/templates` page. If not, it shows a modal prompting the user to log in via GitHub.

---

### `src/app/analysis/page.tsx`

A client-side React component for the `/analysis` page. This is a core part of the application flow.
-   It fetches the user's GitHub data and a list of all their repositories.
-   It displays the repositories and allows the user to select which ones to include in their portfolio.
-   Users can edit the name and description of each repository.
-   It shows the selected portfolio template and allows the user to proceed to generate the portfolio, which pushes the selected data to `localStorage` and navigates to the preview page (`/portfolio/[template]`).

---

### `src/app/templates/page.tsx`

This page displays a list of all available portfolio templates, getting the data from `lib/templates.ts`. Each template is shown as a card with a title, description, and a thumbnail, linking to a preview page.

---

### `src/app/templates/[template]/page.tsx`

A dynamic page for previewing a specific portfolio template. It dynamically imports the template component based on the URL slug. It displays the template with sample data and has a button to "Select this template," which saves the choice to `localStorage` and redirects the user to the `/analysis` page.

---

### `src/app/portfolio/create/page.tsx`

A page for creating or editing a portfolio profile manually. It uses the `PortfolioForm` component.

---

### `src/app/portfolio/[template]/page.tsx`

A dynamic page that renders the final portfolio for preview and download.
-   It loads the user and repository data that was previously saved to `localStorage`.
-   It dynamically imports the selected template component.
-   It provides a "Download Portfolio" button that generates a complete, single-file HTML document of the rendered portfolio and initiates a download.

---

## `src/app/api` - API Routes

### `src/app/api/auth/`

-   `github/route.ts`: Initiates the GitHub OAuth flow by redirecting the user to GitHub's authorization URL.
-   `github/callback/route.ts`: The callback URL for GitHub OAuth. It exchanges the authorization code for an access token and saves the token in a secure, `httpOnly` cookie.
-   `logout/route.ts`: Logs the user out by deleting the `access_token` cookie.

---

### `src/app/api/github/`

-   `all-repos/route.ts`: A comprehensive API route that fetches all repositories associated with a user, including their own repos, collaborations, and repos they've contributed to via pull requests or commits. It augments this data with language statistics, contributor counts, and the user's commit count for each repo. It uses a cache (`lib/cache.ts`) to improve performance.
-   `contributions/route.ts`: Fetches repositories the user has contributed to by searching for their merged pull requests and commits.
-   `repos/route.ts`: Fetches the user's repositories. It seems to be an earlier or simpler version of the `all-repos` endpoint.

---

### `src/app/api/ai/summarize/route.ts`

An API route that uses the Google Generative AI (Gemini) to summarize a project.
-   It takes an `owner` and `repo` as input.
-   It fetches the repository's README, commits, and contributor list from GitHub.
-   It constructs a detailed prompt for the Gemini model, asking it to generate a project description and a summary of the user's role in Korean.
-   It returns the formatted summary as a JSON response.

---

### `src/app/api/user/`

-   `route.ts`: Fetches the basic profile of the currently authenticated user from the GitHub API.
-   `profile/route.ts`: A CRUD-like API for managing a user's portfolio profile. It stores the profile data in a local JSON file (`data/profiles.json`) and also uses the application cache.

---

### `src/app/api/metrics/route.ts`

An API route to expose internal application metrics (like API call counts and durations). It can return data in either JSON or Prometheus format and is protected by an API key.

---

## `src/components` - Reusable Components

-   `Header.tsx`: The site-wide header. It displays the "Gitfolio" brand link. If the user is logged in, it shows their avatar, name, and a logout link. Otherwise, it shows a login link.
-   `Footer.tsx`: A simple site-wide footer with a copyright notice.
-   `PortfolioForm.tsx`: A detailed form that allows users to manually create and edit their portfolio data. It includes fields for personal information, skills, projects, and career history. The data is saved to `localStorage`. It dynamically shows or hides fields based on the requirements of the selected template.

---

## `src/lib` - Core Libraries and Utilities

-   `cache.ts`: Implements a simple in-memory cache with TTL (Time To Live). It has an optional Redis backend that can be enabled by setting the `REDIS_URL` environment variable.
-   `fieldUtils.ts`: Provides a utility function `hasRequiredField` to check if a specific data field is required by the currently selected portfolio template.
-   `logger.ts`: A simple logging utility (`info`, `warn`, `error`) that automatically masks sensitive information like access tokens and API keys in the logs.
-   `metrics.ts`: A utility for tracking application performance metrics (e.g., API call counts, error counts, durations) using the caching layer.
-   `retry.ts`: Exports a `withRetry` utility function that can wrap an asynchronous function to automatically retry it on failure with an exponential backoff delay.
-   `templates.ts`: An array that defines the metadata for all available portfolio templates. Each template object includes a `slug`, `title`, `description`, a list of `requiredFields`, and a `thumbnail` image URL.

---

## `src/templates` - Portfolio Templates

This directory contains various React components, each representing a different portfolio template. These components are dynamically imported based on user selection. They receive `user` and `repos` data as props and are responsible for rendering the final portfolio layout.

Examples include:
-   `template-one.tsx`: A simple, clean layout.
-   `template-detailed.tsx`: A more comprehensive layout that includes case-study-like sections.
-   `template-minimal.tsx`: A minimal, resume-style layout.
-   `u-it.tsx`, `cdg-portfolio.tsx`, `april5.tsx`: Templates inspired by existing portfolio websites.