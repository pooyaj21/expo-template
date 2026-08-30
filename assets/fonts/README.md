# Fonts

Drop `.ttf` / `.otf` files here, one folder per script:

```
assets/fonts/en/Inter-Regular.ttf
assets/fonts/ar/IBMPlexSansArabic-Regular.ttf
```

Then register them in `src/common/presentation/theme/AppFont.ts` — add each face
to `FontFiles` and name it in `AppFonts.en` / `AppFonts.ar`. Until you do, both
languages render in the platform font.

Load every language's faces at once (the provider already does). Loading only
the active set flips `loaded` back to false on a language switch, which unmounts
and remounts the whole tree mid-switch.
