# mdBook setup

The documentation website uses mdBook. If you wish to build the book locally for testing purposes, you must download it using the instructions [here](https://rust-lang.github.io/mdBook/guide/installation.html).

If you have a Rust toolchain installed, use `cargo install mdbook`. If you have homebrew, `brew install mdbook` will work. Otherwise, you can get binaries for your platform [here](https://github.com/rust-lang/mdBook/releases).

After installation, use `just doc serve-book` to open it.
