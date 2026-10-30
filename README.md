# My Tasks

A small personal task manager built with React, React Router, Supabase, and plain CSS. No separate backend server or CSS framework.

## Run the project

Use Node.js 22.12+ (Node 24 also works).

```powershell
npm.cmd install
Copy-Item .env.example .env.local
```

1. Create a project at https://supabase.com.
2. Copy your project URL and publishable key from its Connect dialog into `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Use the publishable key (or the older anon key), never a secret/service_role key. Vite variables are included in the browser bundle.

3. Open Supabase SQL Editor. Paste and run `supabase-setup.sql` once. This creates the tasks table and ownership policies. No manual users table is needed.
4. In Authentication settings, enable Email sign-in and keep email confirmation enabled.
5. In Authentication → URL Configuration, set Site URL to `http://localhost:5173` and add `http://localhost:5173/` to Redirect URLs.
6. Start the app:

```powershell
npm.cmd run dev
```

Open http://localhost:5173. Restart Vite after changing `.env.local`.

Without environment variables the app displays setup instructions. It does not simulate login or store fake tasks.

## Features

- Signup with name, email, password, and password confirmation.
- Email confirmation, login, logout, and persisted sessions.
- Protected dashboard displaying the user's name and email.
- Create, read, edit, and delete tasks with title, description, due date, and status.
- Filter by status and see total, pending, and completed counts.
- Loading states, validation, error messages, and responsive CSS.
- Supabase Row Level Security: each user can only access their own tasks.

## Files to understand

```text
src/
  App.jsx                       Routes and missing-configuration screen
  main.jsx                      React entry point
  index.css                     All styling, including mobile rules
  lib/supabase.js                One shared Supabase client
  context/AuthContext.jsx        Shared user and session-loading state
  components/ProtectedRoute.jsx  Redirects logged-out visitors
  pages/AuthPage.jsx             Signup and login forms
  pages/Dashboard.jsx            Task form, task list, CRUD, filters, logout
supabase-setup.sql               Table, constraints, ownership policies
```

## Test before the interview

1. While logged out, open `/dashboard`. You should arrive at `/login`.
2. Try signup with mismatched passwords, then a valid signup using an email you can access.
3. Confirm your email and log in. Check the dashboard name/email.
4. Add a task with all fields. Refresh; it should remain saved.
5. Edit its title and status. Check the filter and summary counts.
6. Cancel an edit; the form should return to Add a task.
7. Delete a task; cancel the confirmation first, then confirm it.
8. Log out. Try an incorrect password, then log in correctly.
9. Create a second account and check that it cannot see the first account's tasks. For a stronger ownership check, try selecting/updating the first user's task ID with the second user's client session; the database should return no row.
10. Check the layout on a narrow screen and use Tab to navigate inputs and buttons.

## Production build

```powershell
npm.cmd run build
npm.cmd run preview
```

Stop the development server before previewing; both use port 5173. Production files are in `dist/`. A deployed host needs a fallback to `index.html` for React Router paths. Add the deployed origin to Supabase's Site URL and redirect allowlist, and supply the environment variables before building.

## Interview explanation

“I built a personal task manager using React and Supabase. React handles the pages and form state. Supabase handles authentication and stores tasks. Context shares the current user, and a protected route redirects users who are not logged in. Each task has a user_id, and database policies restrict access to that user.”

- **useState:** stores form values, tasks, filters, and loading/error state.
- **useEffect:** subscribes to auth changes or loads tasks when the dashboard opens. Cleanup removes the subscription or prevents stale fetch results from updating state.
- **Context:** avoids passing the user through every component.
- **Controlled inputs:** input values come from React state and change through onChange.
- **CRUD:** insert adds a task, select reads, update edits, delete removes.
- **Session persistence:** Supabase restores the browser session and refreshes tokens. The app never saves passwords itself.
- **Security:** the route guard controls navigation. Row Level Security protects the actual data. User metadata is used for a display name, not permissions.
- **Updating the list:** after adding, editing, or deleting a task, loadTasks fetches the latest list from Supabase. The browser page does not reload.
- **CSS:** simple classes, flexbox, grid, and two media queries. No styling library.

Read the files and change a few styles yourself before presenting. Be ready to explain the code and which setup steps you completed.

## Common errors

- **Email not confirmed:** open the signup email before logging in.
- **Invalid API key / failed to fetch:** check the project URL and key, project availability, and network connection; restart Vite after editing the environment file.
- **Table tasks not found:** run `supabase-setup.sql` in the same Supabase project used in `.env.local`.
- **No access / row-level security error:** check that you are logged in and that all four policies from the SQL file exist. Do not disable RLS to fix it.
- **Confirmation redirects to the wrong page:** verify Site URL and Redirect URLs in Supabase.

References: https://supabase.com/docs/guides/auth/quickstarts/react and https://supabase.com/docs/reference/javascript/auth-onauthstatechange

