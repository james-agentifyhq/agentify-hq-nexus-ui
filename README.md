<a name="readme-top"></a>

# Collaborate with your team in this Slack clone built using Next.js

![Collaborate with your team in this Slack clone built using Next.js](/.github/images/img_main.png 'Collaborate with your team in this Slack clone built using Next.js')

<!-- Table of Contents -->
<details>

<summary>

# :notebook_with_decorative_cover: Table of Contents

</summary>

- [Getting Started](#toolbox-getting-started)
- [Tech Stack](#gear-tech-stack)
- [Stats](#wrench-stats)
- [Contribute](#raised_hands-contribute)
- [Acknowledgements](#gem-acknowledgements)
- [Follow Me](#rocket-follow-me)
- [Learn More](#books-learn-more)
- [Deploy on Vercel](#page_with_curl-deploy-on-vercel)

</details>

<br />

## :toolbox: Getting Started

1. Make sure **Git** and **NodeJS** is installed.
2. Clone this repository to your local computer.
3. Create `.env.local` file in **root** directory.
4. Contents of `.env.local`:

```env
# .env.local

# disabled next.js telemetry
NEXT_TELEMETRY_DISABLED=1

# deployment used by `npx convex dev` or `bunx convex dev`
CONVEX_DEPLOYMENT=dev:<deployment-name> # team: <team-name>, project: <project-name>

# convex public url
NEXT_PUBLIC_CONVEX_URL="https://<deployment-name>.convex.cloud"

```

5. Convex Deployment

- Visit the Convex website: [https://convex.dev](https://convex.dev)
- Log in to your Convex account or sign up if you don't have one.
- Once logged in, navigate to the "Deployments" section.
- Create a new deployment or select an existing one.
- Replace `<deployment-name>`, `<team-name>`, and `<project-name>` in the `.env.local` file with your Convex deployment details.
- In the Convex dashboard, find the public URL associated with your deployment.
- Replace `<your-convex-url>` in the `.env.local` file with your Convex public URL.

6. Initialise Convex Auth Development Keys

- Run the initialization command: `npx @convex-dev/auth` or `bunx @convex-dev/auth` to setup your project for authenticating via the library.
- Make sure your **SITE_URL** environment variable is set correctly. This is the URL where your app is hosted, e.g., `http://localhost:3000` for development.
- Your project authentication is setup for logging in with credentials.

7. Setting Up Google OAuth

**Step 1: Create a Google Cloud Project**

- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- Create a new project (if you don’t have one) by clicking on **Select a project** > **New Project**, and give it a name.
- Enable the **Google OAuth 2.0** API by navigating to **APIs & Services > Library** and searching for **Google OAuth 2.0**.

**Step 2: Create OAuth Credentials**

- In the **APIs & Services > Credentials** section, click **Create Credentials** and choose **OAuth 2.0 Client IDs**.
- Select **Web Application** as the application type.
- Set the **Authorized Redirect URI** to your Convex callback URL. The origin (domain) of the callback URL is your Convex backend's **HTTP Actions URL**. You can find it in your Convex dashboard and it is similar to your `CONVEX_URL`, but with `.site` instead of `.cloud`.

- After setting the redirect URI, click **Create**. You’ll be provided with a **Client ID** and **Client Secret**.

**Step 3: Set Google OAuth Environment Variables in Convex**
To configure Google OAuth in your Convex backend, run the following commands with your actual values:

```bash
npx convex env set AUTH_GOOGLE_CLIENT_ID your-google-client-id
npx convex env set AUTH_GOOGLE_CLIENT_SECRET your-google-client-secret
```

OR

```bash
bunx convex env set AUTH_GOOGLE_CLIENT_ID your-google-client-id
bunx convex env set AUTH_GOOGLE_CLIENT_SECRET your-google-client-secret
```

8. Setting Up GitHub OAuth

**Step 1: Create a GitHub OAuth Application**

- Go to [GitHub Developer Settings](https://github.com/settings/developers).
- Under **OAuth Apps**, click **New OAuth App**.
- Fill in the following:

  - **Application Name**: Name your app (e.g., "Slack Clone").
  - **Homepage URL**: Your app’s homepage URL, like `http://localhost:3000` for local development.
  - **Authorization Callback URL**: Set this to your Convex callback URL (Similar to Google OAuth **Authorized Redirect URI**).

- After registering the app, you’ll get a **Client ID** and **Client Secret**.

**Step 2: Set GitHub OAuth Environment Variables in Convex**

- To configure GitHub OAuth in your Convex backend, run the following commands with your actual values:

```bash
npx convex env set AUTH_GITHUB_ID your-github-client-id
npx convex env set AUTH_GITHUB_SECRET your-github-client-secret
```

OR

```bash
bunx convex env set AUTH_GITHUB_ID your-github-client-id
bunx convex env set AUTH_GITHUB_SECRET your-github-client-secret
```

9. Install Project Dependencies using `npm install --legacy-peer-deps` or `yarn install --legacy-peer-deps` or `bun install --legacy-peer-deps`.

10. Now app is fully configured 👍 and you can start using this app using either one of `npm run dev` or `yarn dev` or `bun dev`.

**NOTE:** Please make sure to keep your API keys and configuration values secure and do not expose them publicly.

## :gear: Tech Stack

[![React JS](https://skillicons.dev/icons?i=react 'React JS')](https://react.dev/ 'React JS') [![Next JS](https://skillicons.dev/icons?i=next 'Next JS')](https://nextjs.org/ 'Next JS') [![Typescript](https://skillicons.dev/icons?i=ts 'Typescript')](https://www.typescriptlang.org/ 'Typescript') [![Tailwind CSS](https://skillicons.dev/icons?i=tailwind 'Tailwind CSS')](https://tailwindcss.com/ 'Tailwind CSS') [![Vercel](https://skillicons.dev/icons?i=vercel 'Vercel')](https://vercel.app/ 'Vercel')

## :wrench: Stats

[![Stats for Slack Clone](/.github/images/stats.svg 'Stats for Slack Clone')](https://pagespeed.web.dev/analysis?url=https://app-slack.vercel.app/ 'Stats for Slack Clone')

## :raised_hands: Contribute

You might encounter some bugs while using this app. You are more than welcome to contribute. Just submit changes via pull request and I will review them before merging. Make sure you follow community guidelines.

## :gem: Acknowledgements

Useful resources and dependencies that are used in Slack Clone.

- Thanks to CodeWithAntonio: https://codewithantonio.com/
- [@auth/core](https://www.npmjs.com/package/@auth/core): ^0.34.2
- [@convex-dev/auth](https://www.npmjs.com/package/@convex-dev/auth): ^0.0.65
- [@radix-ui/react-alert-dialog](https://www.npmjs.com/package/@radix-ui/react-alert-dialog): ^1.1.1
- [@radix-ui/react-avatar](https://www.npmjs.com/package/@radix-ui/react-avatar): ^1.1.0
- [@radix-ui/react-dialog](https://www.npmjs.com/package/@radix-ui/react-dialog): ^1.1.1
- [@radix-ui/react-dropdown-menu](https://www.npmjs.com/package/@radix-ui/react-dropdown-menu): ^2.1.1
- [@radix-ui/react-popover](https://www.npmjs.com/package/@radix-ui/react-popover): ^1.1.1
- [@radix-ui/react-separator](https://www.npmjs.com/package/@radix-ui/react-separator): ^1.1.0
- [@radix-ui/react-slot](https://www.npmjs.com/package/@radix-ui/react-slot): ^1.1.0
- [@radix-ui/react-tooltip](https://www.npmjs.com/package/@radix-ui/react-tooltip): ^1.1.2
- [@radix-ui/react-visually-hidden](https://www.npmjs.com/package/@radix-ui/react-visually-hidden): ^1.1.0
- [class-variance-authority](https://www.npmjs.com/package/class-variance-authority): ^0.7.0
- [clsx](https://www.npmjs.com/package/clsx): ^2.1.1
- [cmdk](https://www.npmjs.com/package/cmdk): 1.0.0
- [convex](https://www.npmjs.com/package/convex): ^1.15.0
- [date-fns](https://www.npmjs.com/package/date-fns): ^4.1.0
- [emoji-picker-react](https://www.npmjs.com/package/emoji-picker-react): ^4.12.0
- [jotai](https://www.npmjs.com/package/jotai): ^2.9.3
- [lucide-react](https://www.npmjs.com/package/lucide-react): ^0.439.0
- [next](https://www.npmjs.com/package/next): 14.2.8
- [next-themes](https://www.npmjs.com/package/next-themes): ^0.3.0
- [nuqs](https://www.npmjs.com/package/nuqs): ^1.19.1
- [quill](https://www.npmjs.com/package/quill): ^2.0.2
- [react](https://www.npmjs.com/package/react): ^18
- [react-dom](https://www.npmjs.com/package/react-dom): ^18
- [react-icons](https://www.npmjs.com/package/react-icons): ^5.3.0
- [react-resizable-panels](https://www.npmjs.com/package/react-resizable-panels): ^2.1.2
- [react-use](https://www.npmjs.com/package/react-use): ^17.5.1
- [react-verification-input](https://www.npmjs.com/package/react-verification-input): ^4.1.2
- [sonner](https://www.npmjs.com/package/sonner): ^1.5.0
- [tailwind-merge](https://www.npmjs.com/package/tailwind-merge): ^2.5.2
- [tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate): ^1.0.7
- [@babel/eslint-parser](https://www.npmjs.com/package/@babel/eslint-parser): ^7.25.1
- [@trivago/prettier-plugin-sort-imports](https://www.npmjs.com/package/@trivago/prettier-plugin-sort-imports): ^4.3.0
- [@types/node](https://www.npmjs.com/package/@types/node): ^20
- [@types/react](https://www.npmjs.com/package/@types/react): ^18
- [@types/react-dom](https://www.npmjs.com/package/@types/react-dom): ^18
- [eslint](https://www.npmjs.com/package/eslint): ^8
- [eslint-config-next](https://www.npmjs.com/package/eslint-config-next): 14.2.8
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier): ^9.1.0
- [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier): ^5.2.1
- [postcss](https://www.npmjs.com/package/postcss): ^8
- [prettier-plugin-tailwindcss](https://www.npmjs.com/package/prettier-plugin-tailwindcss): ^0.6.6
- [tailwindcss](https://www.npmjs.com/package/tailwindcss): ^3.4.1
- [typescript](https://www.npmjs.com/package/typescript): ^5

## :rocket: Follow Me

[![Follow Me](https://img.shields.io/github/followers/farhanmasood-se?style=social&label=Follow&maxAge=2592000)](https://github.com/farhanmasood-se 'Follow Me')

## :books: Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## :page_with_curl: Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
