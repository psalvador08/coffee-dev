# Coffee.Dev — Philip's portfolio

Personal portfolio of **Philip**, WordPress Developer | Website Developer (6+ years, WeDigital PH Digital Solutions Inc. since 2020).
Plain **HTML5, CSS3 and vanilla JavaScript**. No framework and no build step. It deploys as-is to GitHub Pages, Vercel or any static host.

## What's inside

```
coffee-dev-portfolio/
├── index.html              Home: hero, about, skills, services, 4 featured projects, contact, footer
├── projects.html           All 12 projects, with filters (All / Corporate / E-commerce / Industrial)
├── style.css               Design system and every shared component (both pages)
├── projects.css            Extra styles for projects.html
├── script.js               Shared behaviour + SITE_CONFIG (social links). Used by both pages
├── projects.js             Project filters on projects.html
├── favicon.svg
├── assets/
│   ├── images/
│   │   ├── hero-character.svg     Hero illustration (Philip at his laptop)
│   │   ├── about-workspace.svg    About-section workspace illustration
│   │   ├── logo-mark.svg          Coffee.Dev logo mark
│   │   ├── og-image.png           1200×630 social-sharing image
│   │   ├── favicon-32.png, apple-touch-icon.png
│   │   └── projects/              Screenshots saved by tools/capture-screenshots.mjs
│   ├── icons/                     Technology logos (Devicon, MIT; Simple Icons, CC0)
│   └── fonts/                     Plus Jakarta Sans (SIL Open Font License), self-hosted
├── cv/Philip-CV.pdf        "Download CV" file
├── tools/                  Screenshot helper (not deployed; see .vercelignore)
└── .vercelignore
```

## Before you go live: things only you can fill in

| What | Where | Notes |
|---|---|---|
| **Formspree form ID** | `index.html`, the form's `action="https://formspree.io/f/mjgzaedj"` | Create a form at formspree.io and paste its ID. Until then the form tells visitors to email you instead. |
| **Social profile links** | `script.js`, `SITE_CONFIG.social` at the top | GitHub, LinkedIn, Behance, YouTube. **An icon stays hidden until its link is set**, so no dead links are shown. |
| **Updated CV** | replace `cv/Philip-CV.pdf` (keep the name) | The current file is your 2024 CV. It still says "more than four years" and shows your full name. |
| **Project screenshots as files** | run the screenshot tool (below) | Optional but recommended. |
| **Social-sharing image address** | `og:image` in both HTML files | Change `assets/images/og-image.png` to the full address once deployed, e.g. `https://your-domain.com/assets/images/og-image.png`. |

## Project screenshots

Each project card shows a **real screenshot of the live website**. Until you save them as files, they come from **WordPress.com mShots** (`s.wordpress.com/mshots/v1/<url>`), a free service that captures the real page. The first visit to a new address can take a few seconds while mShots captures it. The page shows the site's domain in the meantime and swaps the image in automatically.

To store the screenshots in the project itself (faster, and they no longer depend on mShots):

```bash
cd tools
npm install
npx playwright install chromium
npm run capture                 # all 12 sites
npm run capture -- --only presidium,sinoroof   # just some
```

The tool saves `assets/images/projects/<slug>.jpg` (1280×800) for each site and updates the `<img>` tags in both pages. Check each image for cookie banners or pop-ups before committing. To use your own image instead, save it under the same name.

## Editing content

* **Featured projects (homepage):** the four `<article class="project-card">` blocks in the `#projects` section of `index.html`. Copy a card from `projects.html` to swap one in. Keep `target="_blank" rel="noopener noreferrer"`.
* **All projects:** `projects.html`. Each card's `data-category` controls the filters (`corporate`, `ecommerce`, `industrial`; several are allowed). The counts update themselves.
* **Skills:** the `<ul class="skill-list">` in `index.html`; icons are in `assets/icons/`.
* **Hero / about images:** swap `assets/images/hero-character.svg` or `about-workspace.svg` for your own (e.g. an AI-generated avatar or a workspace photo). Update the `src`, `alt`, `width` and `height` in `index.html`.
* **Colours, fonts, spacing:** CSS variables at the top of `style.css` (`:root`).

### Technology labels on the projects
`WordPress` and `Elementor` labels are shown only where they could be confirmed: each of those sites loads files from `/wp-content/` and declares Elementor in its page code. `Online Store` is shown where the site has a shop, cart and checkout. **acloudtechnologies.com blocks automated reading, so its technologies could not be checked and only "Corporate Website" is shown.** Add the right labels if you know them.

## Run locally

Open `index.html` directly, or serve the folder (recommended, so it behaves exactly like the live site):

```bash
python3 -m http.server 8080      # then open http://localhost:8080
```

## Deploy

**Vercel:** push the folder to a GitHub repository, then in Vercel choose *Add New → Project*, import the repository, select **Framework Preset: Other**, leave the build command empty and the output directory as the root, and deploy.
**GitHub Pages:** *Settings → Pages → Deploy from a branch → main / root*.

## Features

* Sticky header, smooth scrolling, active section highlighting, mobile menu (Esc closes it; focus returns to the button)
* Scroll-reveal animations (Intersection Observer) and floating hero details; all motion turns off when the visitor prefers reduced motion
* Content is fully visible without JavaScript
* Formspree contact form: POST, required-field and email validation, loading state, success and error messages, duplicate-submit protection, spam honeypot (`_gotcha`), 15-second timeout
* Project filters on `projects.html`, kept in the address (`projects.html?type=ecommerce`)
* Every project opens the real website in a new tab (`target="_blank" rel="noopener noreferrer"`)
* Download CV, back-to-top button, automatic copyright year
* SEO: titles, descriptions, Open Graph/Twitter tags, schema.org Person data, semantic headings, alt text, lazy-loaded images
* Responsive at 1440, 1280, 768, 430 and 375 px with no horizontal scrolling

## Credits

* Font: Plus Jakarta Sans (SIL Open Font License, `assets/fonts/OFL.txt`)
* Icons: [Devicon](https://devicon.dev) (MIT) and [Simple Icons](https://simpleicons.org) (CC0); logos remain trademarks of their owners
* Illustrations, logo and layout: made for Coffee.Dev
