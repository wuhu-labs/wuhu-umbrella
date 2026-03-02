# Tuist + SPM Library Pattern

How to set up a repo that is both a **consumer-facing Swift Package** and a
**Tuist-managed development workspace** with a demo app.

Used in: [`wuhu-markdown-ui`](https://github.com/wuhu-labs/wuhu-markdown-ui)

## Why

- The repo root stays a clean Swift Package — downstream consumers just add it
  as a normal SPM dependency. No Tuist knowledge required.
- Developers get a full Xcode project with proper app targets, build settings,
  code signing, and InjectionNext support — all generated from declarative
  Swift manifests (no `.pbxproj` to maintain).
- The generated `.xcodeproj` / `.xcworkspace` are gitignored. Anyone with
  Tuist installed can regenerate them.

## Directory Structure

```
my-library/
├── Package.swift              ← consumer-facing SPM package (clean, no Tuist)
├── Sources/
│   └── MyLibrary/
├── Tuist.swift                ← Tuist root config
├── Tuist/
│   └── Package.swift          ← declares local package as an external dep
├── Demo/
│   ├── Project.swift          ← Tuist manifest — demo app targets
│   └── Sources/
│       └── DemoApp.swift
└── .gitignore                 ← ignores *.xcodeproj, *.xcworkspace, Derived/
```

## Key Files

### `Tuist.swift` (repo root)

Marks the Tuist project root and holds global configuration.

```swift
import ProjectDescription

let tuist = Tuist(
    project: .tuist()
)
```

### `Tuist/Package.swift`

This is Tuist's dependency manifest — it declares the root SPM package as a
local dependency so demo targets can reference it via `.external(name:)`.

```swift
// swift-tools-version: 6.0
import PackageDescription

#if TUIST
    import ProjectDescription

    let packageSettings = PackageSettings(
        productTypes: [
            "MyLibrary": .framework,
        ]
    )
#endif

let package = Package(
    name: "DemoDependencies",
    dependencies: [
        .package(path: ".."),  // the root SPM package
    ]
)
```

The `#if TUIST` block lets you configure how SPM products are mapped to Xcode
targets (static framework, dynamic framework, etc.). By default Tuist uses
`.staticFramework`.

### `Demo/Project.swift`

Defines the app targets. Reference the library via `.external(name:)`.

```swift
import ProjectDescription

let project = Project(
    name: "MyLibraryDemo",
    targets: [
        .target(
            name: "MyLibraryDemo",
            destinations: .macOS,
            product: .app,
            bundleId: "com.example.mylibrary-demo",
            deploymentTargets: .macOS("15.0"),
            infoPlist: .extendingDefault(with: [:]),
            sources: ["Sources/**"],
            dependencies: [
                .external(name: "MyLibrary"),
            ]
        ),
        // Add iOS target similarly with destinations: .iOS
    ]
)
```

### `.gitignore` additions

```gitignore
# Tuist-generated
*.xcodeproj/
*.xcworkspace/
Derived/
Tuist/.build/
```

## Workflow

```bash
# One-time (or after changing Tuist/Package.swift)
tuist install

# Generate and open
tuist generate --path Demo --no-open
open Demo/MyLibraryDemo.xcworkspace

# Or just:
tuist generate --path Demo    # opens automatically
```

## InjectionNext Support

To enable hot-reload with [InjectionNext](https://github.com/johnno1962/InjectionNext),
add `-Xlinker -interposable` to the demo target's linker flags in
`Demo/Project.swift`:

```swift
settings: .settings(base: [
    "OTHER_LDFLAGS": ["-Xlinker", "-interposable"],
])
```

This is a per-target build setting, not a package-level thing — which is one
of the advantages of having a real Xcode project instead of pure SPM.

## Notes

- `Package.swift` at the repo root and `Project.swift` in `Demo/` are in
  different directories — this avoids the Tuist conflict where it maps both
  to the same project (see [tuist/tuist#4624](https://github.com/tuist/tuist/issues/4624)).
- Tuist's SPM-native mode (running `tuist generate` at the package root) is
  an alternative but would require polluting `Package.swift` with demo targets.
  The subdirectory pattern keeps the package manifest clean.
- The library itself builds with plain `swift build` — no Tuist needed.
