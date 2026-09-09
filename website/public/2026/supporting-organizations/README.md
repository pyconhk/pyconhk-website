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
| `aws_ug_hk.svg` | [2025 organizer-supplied original](https://drive.google.com/file/d/1SBHyTOONAoOX6qbW1z7AW95WEoY7nmtG/view) | Native vector |
| `japan_rpi_ug.svg` | [2025 organizer-supplied original](https://drive.google.com/file/d/1NAqfH-DBMlognJBkowikup89FPplhW1a/view) | Native vector |

The previous WebPs remain available for existing image URLs. All six CMS
locales and the fallback data use the new originals.

The following transparent rasters remain only 320 × 320: Agile HK, Codeaholics,
GDG Cloud Hong Kong and GDG Hong Kong. They still need better original artwork for sharp rendering at high pixel
densities. Do not substitute a parent organization's logo or AI-redraw the mark.

The 2025 Drive includes a 1400 × 700 GDG Cloud PNG with an opaque white background.
Its GDG HK SVG contains an embedded raster and a white background; the SVG
extension alone does not make it a usable transparent vector replacement.

CityU CSSC is 447 × 447; larger originals would also help at high pixel densities.
Other current supporting logos are SVG or at least 609 pixels on their shortest
canvas side. Canvas size alone does not guarantee fine detail: check the visible
artwork at the rendered size before replacing assets.
