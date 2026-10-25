# LinkedIn Content Planner

Plan, write and track LinkedIn posts in one place: a draft library, a content calendar, a LinkedIn-style preview, and help from Google Gemini with ideas and rewrites.

## The problem

Posting on LinkedIn regularly means juggling ideas, half-written drafts and a posting plan across notes apps and documents. It is easy to lose track of what is ready, what is planned for which day, and what has already gone out. This app keeps every post in one place with its status, category and date, and adds AI help for the writing step.

## Features

**Accounts and data**
- Email and password sign-up and sign-in through Supabase Auth.
- Posts and categories are stored in Supabase Postgres and loaded per user.
- New users get four color-coded categories: Product Updates, Marketing, Thought Leadership and Company News.

**Dashboard**
- Counts of total, draft, scheduled and published posts. Clicking a count opens the Posts or Calendar view.
- A bar chart of posts created on each of the last 7 days.
- The next 5 scheduled posts, with "in 2 days" style countdowns. Past-due posts are marked "overdue" in red.
- The 6 most recently updated posts, plus "this week" and "this month" counts.
- A trending-topics panel (see AI features below).

**Post editor**
- A 3,000-character limit with a live counter that turns amber near the limit and red over it.
- A formatting toolbar for bold, italic, bullet points, hashtags, mentions and links. Keyboard shortcuts: Ctrl/Cmd+B, Ctrl/Cmd+I, and Ctrl/Cmd+S to save.
- A side-by-side preview styled like a LinkedIn post, with highlighted hashtags, mentions and links.
- A category picker, and a choice between saving as a draft or scheduling with a date and time picker (minimum one hour from now).

**Calendar**
- A month grid that shows scheduled posts on their day, colored by category (up to 3 per day, then "+N more").
- Click a day to list its posts below the grid. Double-click a day to open the editor with that date prefilled at 09:00.
- Previous/next month and "Today" navigation.

**Posts library**
- A card grid of all posts, newest update first.
- Search by text, and filter by status (defaults to Drafts) and by category.
- Edit, duplicate (as a new draft), delete (with confirmation) and mark as published.

**AI features (Google Gemini)**
- **Trending topics:** asks Gemini for 10 LinkedIn topic ideas for today's date. Each comes with a category, hashtags and a suggested angle. These are ideas written by the model, not live trend data.
- **Generate a post from a topic:** in the editor, pick a topic and Gemini drafts a 150 to 300 word post with hashtags.
- **Refine content:** eight rewrite modes: improve clarity, make more engaging, professional tone, add storytelling, add a call to action, optimize hashtags, make concise, and add more detail. You see the rewrite below the original and choose to use it, go back, or try another mode.
- **Image generation (mocked):** "From content" asks Gemini to describe a suitable image. The image itself is a random stock photo from picsum.photos. "Custom prompt" does not call Gemini at all. See [Status and limitations](#status-and-limitations).

## How it works

The app is a single-page React app with no backend of its own. The browser talks directly to two services:

- **Supabase** for sign-in (`supabase.auth`) and for reading and writing the `posts` and `categories` tables through `@supabase/supabase-js`. Every query filters by the signed-in user's ID.
- **Google Gemini** (`gemini-1.5-flash`, through `@google/generative-ai`) for topic ideas, post drafts, rewrites and image descriptions. All prompts live in `src/lib/gemini.ts`.

Inside the app:

- `App.tsx` shows the sign-in form until Supabase reports a session, then renders the main shell.
- `AppContext` (React Context with `useReducer`) holds the current view (dashboard, calendar or posts), the selected calendar date and the status filter. It also exposes the `usePosts` and `useCategories` hooks, which own all database reads and writes. There is no router; views switch through context state.
- Small hooks keep logic out of the components: `use-dashboard-stats` (counts, chart data, upcoming and recent posts), `use-calendar` and `use-calendar-posts` (month grid and posts by day), `use-post-filters` (search and filters), `use-post-actions` (save, duplicate, delete, publish) and `use-text-formatting` (toolbar edits at the cursor).
- Dates for the calendar and the scheduling picker are handled in Indian Standard Time (`Asia/Kolkata`) in `src/utils/date-utils.ts`.

**Data model** (`supabase/setup.sql`)

| Table | Columns |
| --- | --- |
| `categories` | `id`, `name`, `color`, `user_id`, `created_at` |
| `posts` | `id`, `content`, `category` (references `categories`), `scheduled_date`, `status` (`draft`, `scheduled` or `published`), `media_type`, `media_url`, `media_alt`, `user_id`, `created_at`, `updated_at` |

## Tech stack

- React 18 and TypeScript
- Vite 5
- Tailwind CSS 3
- lucide-react icons
- Supabase (Auth and Postgres) with `@supabase/supabase-js` v2
- Google Gemini with `@google/generative-ai`
- ESLint 9 with `typescript-eslint` and React Hooks rules

## Getting started

### Prerequisites

- Node.js 18 or newer, and npm
- A Supabase project
- A Google Gemini API key (optional; only the AI features need it)

### 1. Install

```bash
git clone <this-repo-url>
cd linkedin-content-planner
npm install
```

### 2. Set environment variables

```bash
cp .env.example .env
```

Then fill in `.env`:

| Variable | Required | Where to get it |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Your Supabase project's API settings (Project URL) |
| `VITE_SUPABASE_ANON_KEY` | Yes | The same page: the `anon` public key (newer projects call it the publishable key). Never use the `service_role` or secret key here. |
| `VITE_GEMINI_API_KEY` | No | Google AI Studio, "Get API key" |

The app stops at startup if either Supabase variable is missing. Without the Gemini key it still runs, and the AI panels show a "Gemini API not configured" message.

All three values are read in the browser (`VITE_` prefix), so they end up in the built JavaScript. That is expected for the Supabase anon key. See the limitations below about the Gemini key.

### 3. Set up the database

1. Open your Supabase project and go to the SQL Editor.
2. Run the contents of [`supabase/setup.sql`](supabase/setup.sql). It creates the `categories` and `posts` tables.
3. Recommended: turn on Row Level Security so each user can only reach their own rows. `setup.sql` does not do this for you.

   ```sql
   alter table categories enable row level security;
   alter table posts enable row level security;

   create policy "Users manage their own categories" on categories
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

   create policy "Users manage their own posts" on posts
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
   ```

4. Supabase asks new users to confirm their email by default, and the app does not show a "check your inbox" message after sign-up. For local testing, either click the confirmation link or turn off email confirmation in the Authentication settings.

### 4. Run

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server (http://localhost:5173 by default) |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

Sign up on the first screen. Your default categories are created on first load.

## Project structure

```
.
├── index.html
├── supabase/
│   └── setup.sql                  # Table definitions
└── src/
    ├── App.tsx                    # Auth gate and view switch
    ├── main.tsx
    ├── context/
    │   └── AppContext.tsx         # View, date and filter state; posts and categories hooks
    ├── components/
    │   ├── AuthForm.tsx           # Sign in / sign up
    │   ├── Header.tsx             # Navigation and sign out
    │   ├── Dashboard.tsx          # Stats, activity chart, upcoming and recent posts
    │   ├── Calendar.tsx           # Month view (calendar-grid, calendar-header, selected-date-posts)
    │   ├── Posts.tsx              # Library (posts-header, posts-filters, posts-grid, PostCard)
    │   ├── PostEditor.tsx         # Editor modal (formatting-toolbar, character-counter)
    │   ├── linkedin-post-preview.tsx
    │   ├── TrendingTopics.tsx     # Gemini topic ideas
    │   ├── ContentRefinement.tsx  # Gemini rewrites
    │   ├── ImageGenerator.tsx     # Image picker (placeholder images)
    │   └── ...                    # Smaller dashboard cards and empty states
    ├── hooks/                     # Data hooks (usePosts, useCategories, useAuth, useTrendingTopics) and UI logic hooks
    ├── lib/
    │   ├── supabase.ts            # Supabase client and table types
    │   └── gemini.ts              # Gemini client, prompts, refinement options
    ├── types/index.ts             # Post, Category, ViewMode, PostFilter
    └── utils/
        ├── date-utils.ts          # Relative dates and IST helpers
        └── format-linkedin-content.ts  # Preview formatting
```

## Status and limitations

This is a working personal project, not a finished product. There are no automated tests; it has been checked by hand.

**What it does not do**
- It does not connect to LinkedIn. Nothing is posted for you. "Scheduled" is a planning label, and "Mark as published" only changes the status in the database.
- Image generation is a placeholder. The saved image is a random photo from picsum.photos, and the style choice is not used. Saved images are also not shown on post cards or in the preview.
- Trending topics are ideas generated by Gemini from a prompt. They do not come from LinkedIn or any live trend source.

**Known gaps**
- On the dashboard, the "Create Post" and "Analytics" quick actions, opening an upcoming or recent post, and picking a trending topic are not wired up. They log to the console, or switch to the Posts view without opening the editor. Generating a post from a topic works inside the editor.
- There is no screen for adding or renaming categories, only the four defaults. (`useCategories` has an `addCategory` function that no screen calls yet.)
- The "Forgot password?" link does nothing.
- In `setup.sql`, `scheduled_date` is a `date` column, so the time picked in the editor is not stored. Changing it to `timestamptz` would keep it.
- Times are fixed to Indian Standard Time.
- The editor offers only Draft and Scheduled, so opening a published post in the editor sets it back to Scheduled.
- The `Post` type has fields for AI image metadata and refinement history, but there are no database columns for them, so they are not saved.
- `PostPreview.tsx` (a 210-character "See more" preview) is not used anywhere.

**Security and configuration**
- `setup.sql` does not enable Row Level Security. The app filters every query by user ID, but only the database can enforce that. Run the policy snippet in step 3 before storing real data.
- Gemini is called from the browser, so `VITE_GEMINI_API_KEY` ships in the client bundle. That is fine for local use. For a public deployment, move the Gemini calls behind a server function.
- The model name `gemini-1.5-flash` is hard-coded in `src/lib/gemini.ts`. Google retires older Gemini models over time, so you may need to change it to a current model.
- The preview builds HTML from the post text without escaping it first.
- Bold and italic use Markdown-style `**` and `*` markers. LinkedIn does not render Markdown, so these only look bold or italic in the preview.
