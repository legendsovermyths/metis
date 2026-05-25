# qpdf sidecar binaries

Place platform-specific qpdf binaries here, named with the Tauri target triple:

  qpdf-aarch64-apple-darwin   (macOS Apple Silicon)
  qpdf-x86_64-apple-darwin    (macOS Intel)
  qpdf-x86_64-pc-windows-msvc (Windows)
  qpdf-x86_64-unknown-linux-gnu (Linux)

Download prebuilt binaries from: https://github.com/qpdf/qpdf/releases
Extract the qpdf binary from the release archive and rename it accordingly.

During development, a system qpdf (brew install qpdf) is used as fallback.
