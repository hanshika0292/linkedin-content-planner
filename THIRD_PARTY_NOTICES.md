# Third-party notices

Content Planner for LinkedIn does not vendor, copy or fork any third-party source code, fonts,
images or data. Everything in this repository is original work under the [MIT License](LICENSE).

## Dependencies

The app's dependencies are installed from npm and keep their own licenses. They are not
included in this repository. The main runtime dependencies are:

| Package | License |
| --- | --- |
| [React](https://github.com/facebook/react) and React DOM | MIT |
| [@supabase/supabase-js](https://github.com/supabase/supabase-js) | MIT |
| [@google/genai](https://github.com/googleapis/js-genai) | Apache-2.0 |
| [lucide-react](https://github.com/lucide-icons/lucide) (icons) | ISC |

Build and test tools (Vite, TypeScript, Tailwind CSS, PostCSS, ESLint, Vitest) are dev dependencies under their
own licenses. A production build (`npm run build`) bundles the runtime dependencies into
`dist/`. If you redistribute a build, include their license notices; `npm ls` and each
package's `LICENSE` file in `node_modules/` list them.

## External services

The app calls these services at runtime. Their terms apply to your use of them:

- **Supabase** (your own project) for sign-in and the database.
- **Google Gemini API** (with your own API key) for topic ideas, drafts and rewrites.
- **Lorem Picsum** (`picsum.photos`) for the random placeholder photo used by the image picker.

## Trademarks

LinkedIn is a trademark of LinkedIn Corporation. Google and Gemini are trademarks of Google LLC.
Supabase is a trademark of Supabase, Inc. This project is not affiliated with, endorsed by or
sponsored by any of them. The names are used only to describe what the app works with.
