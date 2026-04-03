This is an Astro Ecommerce Website, which follows atomic design structure using Primitives (as atoms), UI (as Molecules) and Features (as organisms) for the website templates that are going to be used in main pages. 

The important thing is: 
- Primitives are the smallest building blocks like buttons, inputs, or headings. They only care about props and styles.
- UI components are combinations of Primitives These components should never import from your scripts/behavior folder. They might use a simple util (like a date formatter) from scripts/utils, but they don't "know" what the app is doing. They receive data via props and emit events via callbacks.
- The Features act as the actual organisms (the controllers). The Feature component imports the Behavior scripts, handles the state (e.g., fetching data, toggling a modal, or handling form submission), and passes data down into the UI components and listens for their events.

The Logic Folder is structured in a way that: 
- scripts/utils: 
  -- Pure functions (math, string parsing, formatting).
  -- Imported anywhere (Primitives, UI, or Features).
- scripts/behavior: 
  -- Business logic, API calls, state machines, complex event listeners.
  -- Imported into Features only.
