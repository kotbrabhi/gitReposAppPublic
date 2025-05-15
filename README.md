# GitHub Explorer – Technical Test

## 🚀 Getting Started

To run the project locally:

```bash
git clone https://github.com/kotbrabhi/gitReposAppPublic.git
cd gitReposAppPublic
npm install
npm start
```

## Project Architecture

The application follows a modular and scalable structure, using best practices of Angular 19:

```bash
src/
├── app/
│   ├── core/
│   │   └── services/
│   ├── shared/
│   │   ├── components/
│   │   ├── pipes/
│   │   ├── models/
│   ├── features/
│   │   ├── repos/
│   │   └── commits/
│   └── app.routes.ts
├── environments/
```


## Features Implemented

This Angular app consists of two lazy-loaded routes: /repos and /commits.

```bash
📌 /repos – Repository Search
Search GitHub repositories:
by name
optionally by language and minimum stars
by keyword inside issue titles (open/closed)
Table displays:
repository name
owner's avatar
creation date
Clicking a row redirects to /commits for the selected repository.
📌 /commits – Commit History
Search and display commits of a selected repository
Table includes:
commit author
commit message
commit URL
```

## Tools & Techniques Used

```bash
RxJS : Used in Github.service.ts to handle data retrieval and transformations using observable operators.
Signals : Used in the /repos and /commits components to manage search form states and display results reactively.
Reusable Search Component : search-form.component.ts created to provide a consistent and reusable interface for search inputs.
Recursive Pipe : A custom pipe that allows deep searching inside nested objects, enabling flexible filtering across complex data structures.
Infinite Scroll : Implemented to fetch additional results automatically as the user scrolls.
LocalStorage with Expiry : A dedicated service stores the last search results with a 15-minute expiration to provide continuity between sessions.
GitHub Token Management : The GitHub token is externalized in the environment.ts file and never committed to version control. This ensures sensitive credentials remain secure.
Angular Material : Used for a polished and accessible UI through ready-to-use Material components.
```
