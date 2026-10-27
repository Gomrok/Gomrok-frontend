# Gomrok homepage

React implementation of the Persian, right-to-left Gomrok homepage and its design-preview flows.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Vite prints the local URL. Create a production build with `npm run build`, or serve that build locally with `npm run preview`.

## Stack

- React 19 with JavaScript and JSX
- Vite 8 for development and production builds
- Native CSS, with the supplied brand styling and RTL layout

The Vite base path is relative so the production bundle can be hosted from a GitHub Pages project path. `data-figma` attributes on major frames and components retain recognizable names for a later design handoff.

## Project layout

```text
src/
  components/      shared dialog, icon, and mobile navigation components
  data/            editable province boundary data
  features/         quote, customs, market, AI-preview, and driver interactions
  pages/            homepage and concept-flow pages
  sections/         page structure and brand content
  styles.css        supplied design styles
public/assets/      supplied logo, photographs, icons, map, and source attribution
```

The homepage includes the freight quote form, customs introduction, market preview, interactive province map, sample driver list, articles, and responsive navigation. The `?view=quote`, `?view=customs`, and `?view=chat` paths show the related preview flows.

## Data and integrations

This repository implements the design and local interaction states only. Rates, market figures, drivers, and assistant replies are labeled sample content. Forms do not submit data to a backend; preview values are stored in tab-scoped session storage rather than the URL. No authentication, database, live availability, tariff calculation, or AI service is connected.

The supplied Gomrok logo is preserved. Asset sources and licenses are documented in [`public/assets/sources/README.md`](public/assets/sources/README.md). The Vazirmatn font is loaded from Google Fonts for preview rendering; an internet connection is required to fetch it.

## Build

```sh
npm ci
npm run build
npm run preview
```
