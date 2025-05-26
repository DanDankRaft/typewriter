# typewriter
typewriter (all lower case) is a word processor for U.S. legal professionals and law students. It aims to make the process of writing legal documents as seamless as posible.

## Available for
- Windows
- COMING SOON: Mac (as soon as i get a macbook)

There are no plans for official linux support, but you are more than welcome to compile it for the distro of choice. All of our dependencies are cross-platform and support linux.

## Planned Features
 - [ ] Rich citation support
    - [ ] built-in support for searchinig up sources as you type, allowing you to fill-in citations based on a rich database.
    - [ ] auto-detects when you start typing a citation.
    - [ ] auto-detects citation errors and suggests fixes.
    - [ ] supports caselaw, statutes, and other commonly cited documents.
    - [ ] keeps track of all of your citations, adapting them as your document develops and allowing you to auto-insert a table of authorities.
 - [ ] uses .docx, allowing you to easily share your work with colleagues who don't use typewriter.
 - [ ] sensible styling defaults for lawyers.
 - [ ] auto-insert cover pages, tables of authorities, etc..

## Building

This project uses [wails](https://wails.io), a cross-platform framework for building desktop applications. The frontend is written in [svelte](https://svelte.dev/) and [vite](https://github.com/sveltejs/vite-plugin-svelte) (**NOT** sveltekit. The backend is written in [go](https://go.dev).


To run in development mode, use `wails dev`.

To build an executible, use `wails build`.

Program icon [created by Freepik - Flaticon](https://www.flaticon.com/free-icons/type)
