// This module is aliased in place of "@heroui/react" (see vite.config.ts).
//
// Every existing `import { Button, Select, ... } from "@heroui/react"` across the
// app is silently redirected here, so a handful of components can get a
// consistent default size/font everywhere they're already used — without
// editing hundreds of individual call sites.
//
// "@heroui/react-real" is a package.json alias (npm:@heroui/react@<version>)
// pointing at the *actual* @heroui/react package under a different import
// specifier. We have to reach it that way instead of writing
// `from "@heroui/react"` here, because that string is exactly what the Vite
// alias below intercepts — importing it directly from this file would just
// re-enter this same shim.
//
// Any call site that already passes its own `size`/`classNames`/`listboxProps`
// keeps exactly what it asked for: extendVariants only fills in a default for
// props a given usage didn't already specify, it never overrides an explicit
// prop. See https://www.heroui.com/docs/customization/customize-theme#extend-variants
import {
  Button as HeroButton,
  Select as HeroSelect,
  DropdownMenu as HeroDropdownMenu,
  extendVariants,
} from "@heroui/react-real";

export * from "@heroui/react-real";

// App-wide default: "sm" (matches the Leads page and most of the app already).
// A Button that explicitly sets size="lg"/"md" is untouched.
export const Button = extendVariants(HeroButton, {
  defaultVariants: {
    size: "sm",
  },
});

// App-wide default: compact "sm" trigger + 12.5px trigger/label/option text,
// matching the NewSelect wrapper's convention. A Select that already passes
// its own `size`, `classNames`, or `listboxProps` (like NewSelect does) is
// untouched.
export const Select = extendVariants(HeroSelect, {
  defaultVariants: {
    size: "sm",
    classNames: {
      value: "text-[12.5px]",
      label: "text-[12.5px]",
    },
    listboxProps: {
      itemClasses: {
        title: "text-[12.5px]",
        description: "text-[11.5px]",
      },
    },
  },
});

// DropdownMenu's `itemClasses` cascades down to every DropdownItem it renders,
// so this one override brings every dropdown menu's item text in line with
// the rest of the app's 12.5px convention without touching DropdownItem itself.
export const DropdownMenu = extendVariants(HeroDropdownMenu, {
  defaultVariants: {
    itemClasses: {
      title: "text-[12.5px]",
      description: "text-[11.5px]",
    },
  },
});
