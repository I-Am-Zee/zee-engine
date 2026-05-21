# Keystatic Windows Junction Architecture & Patch

## The Problem: Local Media Staging vs. Git
This multi-tenant engine enforces a sovereign asset architecture. Media files must remain in the external master repository (`zee-media-production`) and are synced to Cloudflare R2 via Rclone. They must **never** be duplicated into the Astro Git repository.

To achieve this locally, we use a Windows Directory Junction:
`mklink /J "D:\Workspace\Zaviona_Ecommerce Astro\public\images" "D:\Workspace\zee-media-production\R2_Bucket_Media\zelia-vance"`

However, Keystatic's local GitHub mode uses `fs.readdir(path, { withFileTypes: true })`. On Windows, a Directory Junction is evaluated as a `SymbolicLink`. Keystatic's default logic ignores symbolic links, resulting in the CMS failing to see or read any media files located within the junctioned directory.

## The Solution: `nodeFs.statSync` Patch

To force Keystatic to resolve and traverse the Windows Junction, we patched `@keystatic/core`. 

We modified the `tree` generation logic inside Keystatic's local mode to fall back to `nodeFs.statSync(fullPath)` when a `dirent` is identified as a symbolic link.

### Patch Details
The patch was generated using `patch-package` and is permanently stored in `patches/@keystatic+core+0.5.50.patch`.

```javascript
// Inside @keystatic/core (dist files)
try {
    let isDir = dirent.isDirectory();
    let isFile = dirent.isFile();
    let isSymlink = dirent.isSymbolicLink();

    if (isSymlink) {
        // [Keystatic Debug] Following symlink
        const stat = nodeFs.statSync(fullPath);
        isDir = stat.isDirectory();
        isFile = stat.isFile();
    }
    // ... continues with isDir / isFile logic
}
```

### Persistence
1.  **`package.json`**: A `postinstall: "patch-package"` script ensures the patch is automatically applied to `node_modules` every time dependencies are installed.
2.  **Vite Cache**: Vite aggressively caches `@keystatic/core` in `node_modules/.vite`. If the patch is updated, this cache must be deleted to force Vite to serve the patched version.

## Astro Server Configuration
For Astro's Vite server to render images located outside the primary project root (via the junction), the target directory must be explicitly allowed.

```javascript
// astro.config.mjs
vite: {
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        // Allow Vite to serve media from the external production folder
        "D:/Workspace/zee-media-production/R2_Bucket_Media/zelia-vance"
      ],
    },
  },
}
```
*Note: The path in `fs.allow` MUST use forward slashes (`/`) and contain NO quotes.*