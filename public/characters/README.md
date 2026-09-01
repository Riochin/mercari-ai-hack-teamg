# Character artwork

The app uses 12 optimized character images for Persona selection and negotiation identity.

- Source branch: `Mmm-uu-patch-1`
- Source commit: `49a75331979c9fbe756d1f0c9214ca5cb159f90b`
- Runtime output: `public/characters/art/*.webp`
- Conversion: longest edge 384 px, aspect ratio preserved, Lanczos resampling, sRGB RGB output, WebP quality 85, metadata omitted

The source branch contains nine additional outfits that are intentionally not shipped in this slice. Character framing remains controlled by `focus` and `object-fit: cover` in the existing UI.
