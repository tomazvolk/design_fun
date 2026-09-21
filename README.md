# Pixeldoro

A simple pixel art pomodoro timer. Plain HTML, CSS and JS, no build step.

- 25 min work, 5 min short break, 15 min long break (every 4th session)
- Pixel progress bar, 8-bit chime when a session ends
- Keyboard: `Space` start/pause, `R` reset
- Completed pomodoro count is saved in `localStorage`

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Deploy to Vercel

Option 1, CLI:

```sh
npm i -g vercel
vercel
```

Option 2, Git: push this repo to GitHub, then import it at https://vercel.com/new.
Vercel detects it as a static site; leave the build command empty and the output directory as the root.
