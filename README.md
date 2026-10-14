# Young Stars — static site

A static copy of [youngstars.salon](https://www.youngstars.salon) for GitHub Pages. Pages, phone numbers, hours, founder photos, and brand logos come from the live Vercel site. The old Supabase host in that build (`qojvnaqbkouazpystefg.supabase.co`) does not resolve anymore, so the service menu, brand blurbs, and gallery are filled from the salon's published copy until you connect a live project.

## Pages

- Home, About, Services (men and women), Brands, Founder, Gallery, Contact, Book
- Privacy Policy and Terms of Service (the old site linked these, but they were not built)

Booking stays phone-only, the same as the original:

- Men's section: +91 70719 06906, Tue–Sun 8:30 AM – 9:00 PM
- Women's section: +91 75067 67367, Tue–Sun 10:00 AM – 8:30 PM
- Proprietor, Mr. Jayendra G Bhandary: +91 98213 46856
- Monday is a holiday

## Connect Supabase

Edit `js/config.js` and set `supabaseUrl` and `supabaseAnonKey` from your project (Settings → API). The anon key is a public browser key.

The site reads these tables when they are reachable:

| Table | Used on |
| --- | --- |
| `services` | Home and men's / women's service pages |
| `brands` | Brands page |
| `gallery_images` | Gallery |
| `testimonials` | Home reviews (`is_featured = true`) |

Expected service columns: `name`, `category`, `description`, `gender_target` (`mens`, `womens`, or `unisex`), `is_active`, `image_url`, `duration_minutes`.

If the request fails, the pages keep the built-in menu. Prices are quoted on the phone, which matches the original cards (they did not show a price).

## Publish on GitHub Pages

1. Create a new empty GitHub repository.
2. From this folder:

```bash
git init
git add .
git commit -m "Add Young Stars static site"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

3. On GitHub: Settings → Pages → Build and deployment → Deploy from branch → `main` → `/ (root)` → Save.
4. The site will be at `https://YOUR_USER.github.io/YOUR_REPO/`.

To use `youngstars.salon` instead of Vercel, add a `CNAME` file containing `youngstars.salon`, then point the domain's DNS at GitHub Pages. Do that only when you are ready to leave the Vercel deployment.
