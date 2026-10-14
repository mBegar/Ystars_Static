# Young Stars

Static website for GitHub Pages. No database. Services, brands, photos, phones, and hours are all in the HTML and image files.

## Publish

1. Create an empty GitHub repository.
2. From this folder:

```bash
git init
git add .
git commit -m "Add Young Stars static site"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

3. On GitHub: Settings → Pages → Deploy from branch → `main` → `/ (root)` → Save.
4. Open `https://YOUR_USER.github.io/YOUR_REPO/`.

To use youngstars.salon, add a file named `CNAME` containing `youngstars.salon`, then point the domain's DNS at GitHub Pages. Do that only when you are ready to leave the current Vercel site.

## Edit later

- Service text is in `index.html`, `services/index.html`, `services/mens/index.html`, and `services/womens/index.html`.
- Brand logos are in `brand-logos/`. The brand page is `brands/index.html`.
- Founder photos are `assets/founder-1.png` and `assets/founder-2.png`.
