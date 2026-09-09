# Supporting organization artwork

Keep original artwork and transparency. Use original SVGs where available;
increasing a raster's dimensions does not recover detail. The page measures the
visible mark at build time so transparent canvas padding does not affect centering.

Sources refreshed in September 2026:

| Asset | Original source | Resolution |
| --- | --- | --- |
| `hkace.webp` | Archived supplied artwork, `src/legacy/assets/legacy-wp/uploads/2022/10/HKACE.png` | 785 × 350, lossless WebP |
| `python_asia.webp` | https://pythonasia.org/static/pao/01-Main2.png (official site header) | 1216 × 397, lossless WebP |
| `eduhk_math_it_dept.svg` | https://www.eduhk.hk/mit/assets/img/logo_mit.svg (official department header) | Native vector |

The previous EdUHK WebP remains available for existing image URLs. All six CMS
locales and the fallback data use the SVG.

The following supplied rasters remain only 320 × 320: Agile HK, AWS User Group
Hong Kong, Codeaholics, GDG Cloud Hong Kong, GDG Hong Kong, and Raspberry JAM
Tokyo. They still need better original artwork for sharp rendering at high pixel
densities. Do not substitute a parent organization's logo or AI-redraw the mark.

CityU CSSC is 447 × 447; larger originals would also help at high pixel densities.
Other current supporting logos are SVG or at least 609 pixels on their shortest
canvas side. Canvas size alone does not guarantee fine detail: check the visible
artwork at the rendered size before replacing assets.
