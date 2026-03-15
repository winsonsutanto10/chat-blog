import { BlogPost } from "@/types/blog";

export const mockPosts: BlogPost[] = [
  {
    id: "1",
    slug: "getting-started-with-nextjs-14",
    title: "Getting Started with Next.js 14: The App Router Revolution",
    excerpt:
      "Explore the powerful new App Router in Next.js 14 and learn how it transforms the way we build React applications with server components, streaming, and more.",
    content: `
## Introduction

Next.js 14 brings a paradigm shift in how we think about React applications. The App Router, now stable and production-ready, changes everything from how we structure our code to how data flows through our components.

## What is the App Router?

The App Router is built on top of React Server Components (RSC), a new paradigm that allows components to render on the server without sending any JavaScript to the client. This results in smaller bundle sizes and faster page loads.

\`\`\`tsx
// app/page.tsx - This runs on the server by default
async function HomePage() {
  const data = await fetch('https://api.example.com/posts');
  const posts = await data.json();

  return (
    <main>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </main>
  );
}
\`\`\`

## Server vs Client Components

One of the biggest mental shifts is understanding when to use server vs client components:

- **Server Components** (default): Great for data fetching, accessing backend resources directly, keeping sensitive data on the server
- **Client Components** (add 'use client'): Needed for interactivity, browser APIs, React hooks like useState and useEffect

## Streaming with Suspense

Next.js 14 makes streaming first-class with React's Suspense boundary:

\`\`\`tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SlowComponent />
    </Suspense>
  );
}
\`\`\`

## Conclusion

The App Router represents the future of React development. While the learning curve exists, the benefits in performance and developer experience make it well worth the investment.
    `,
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    author: {
      name: "Sarah Chen",
      avatar: "https://i.pravatar.cc/150?img=47",
      bio: "Full-stack developer passionate about React and TypeScript.",
    },
    publishedAt: "2024-11-15",
    readingTime: 8,
    tags: ["Next.js", "React", "TypeScript"],
    featured: true,
  },
  {
    id: "2",
    slug: "mastering-tailwind-css-v4",
    title: "Mastering Tailwind CSS v4: New Features and Workflows",
    excerpt:
      "Tailwind CSS v4 is here with a completely new engine, faster builds, and a refreshed configuration approach. Here's everything you need to know to upgrade.",
    content: `
## What's New in Tailwind CSS v4?

Tailwind CSS v4 is a ground-up rewrite built on a new high-performance engine. The biggest changes affect how you configure and use the framework.

## The New CSS-First Configuration

Gone are the days of \`tailwind.config.js\`. Tailwind v4 moves configuration directly into your CSS file using the \`@theme\` directive:

\`\`\`css
@import "tailwindcss";

@theme {
  --color-brand: #FB5607;
  --color-accent: #3A86FF;
  --font-display: "Inter", sans-serif;
}
\`\`\`

## Performance Improvements

The new Oxide engine is written in Rust, making builds significantly faster:

- **Full build**: Up to 5x faster
- **Incremental builds**: Up to 100x faster
- **Lightning CSS**: Built-in for transforms and prefixes

## New Utilities

v4 introduces several new utilities worth knowing:

### Text Shadows
\`\`\`html
<h1 class="text-shadow-lg text-shadow-black/25">Hello</h1>
\`\`\`

### Masking
\`\`\`html
<div class="mask-radial-from-black mask-radial-to-transparent">...</div>
\`\`\`

## Migration Guide

Migrating from v3 is straightforward with the official codemod:

\`\`\`bash
npx @tailwindcss/upgrade
\`\`\`

## Conclusion

Tailwind CSS v4 is a massive leap forward. The CSS-first configuration is more intuitive, and the performance improvements make the developer experience even better.
    `,
    coverImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    author: {
      name: "Marcus Rivera",
      avatar: "https://i.pravatar.cc/150?img=12",
      bio: "UI/UX engineer and open source contributor.",
    },
    publishedAt: "2024-10-28",
    readingTime: 6,
    tags: ["Tailwind CSS", "CSS", "Frontend"],
  },
  {
    id: "3",
    slug: "typescript-5-decorators-deep-dive",
    title: "TypeScript 5 Decorators: A Deep Dive into the New Standard",
    excerpt:
      "TypeScript 5 finally ships with the ECMAScript standard decorators. Learn how they differ from the legacy decorators and how to use them effectively.",
    content: `
## The Long Wait is Over

After years of experimental decorator support, TypeScript 5 implements the official ECMAScript decorator proposal. This brings decorators into the standard and makes them production-safe.

## Class Decorators

The new class decorators receive the class itself and can return a new class or modify the original:

\`\`\`typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}
\`\`\`

## Method Decorators

Method decorators are perfect for cross-cutting concerns like logging and timing:

\`\`\`typescript
function loggedMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(\`Calling \${propertyKey} with\`, args);
    const result = original.apply(this, args);
    console.log(\`Result:\`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @loggedMethod
  add(a: number, b: number) {
    return a + b;
  }
}
\`\`\`

## Key Differences from Legacy Decorators

1. **Execution order**: New decorators run after the class is fully defined
2. **No \`experimentalDecorators\`**: No more tsconfig flag needed
3. **Metadata**: Handled via the \`Symbol.metadata\` API

## Conclusion

Standard decorators are a game-changer for TypeScript developers. They enable cleaner, more declarative code while following the ECMAScript spec.
    `,
    coverImage:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
    author: {
      name: "Aiko Tanaka",
      avatar: "https://i.pravatar.cc/150?img=25",
      bio: "TypeScript enthusiast and compiler contributor.",
    },
    publishedAt: "2024-10-10",
    readingTime: 10,
    tags: ["TypeScript", "JavaScript", "Programming"],
  },
  {
    id: "4",
    slug: "building-real-time-apps-with-websockets",
    title: "Building Real-Time Apps with WebSockets in Next.js",
    excerpt:
      "Real-time features are increasingly expected in modern apps. This guide walks you through building WebSocket-powered features like live chat and notifications.",
    content: `
## Why Real-Time?

Users now expect instant feedback. Whether it's a live feed, a collaborative editor, or instant notifications — real-time features are a competitive necessity.

## WebSockets vs Server-Sent Events

| Feature | WebSockets | SSE |
|---|---|---|
| Direction | Bi-directional | Server → Client |
| Protocol | ws:// | HTTP |
| Reconnection | Manual | Automatic |
| Use case | Chat, gaming | Notifications, feeds |

## Setting Up a WebSocket Server

Using the \`ws\` package with a custom Next.js server:

\`\`\`typescript
// server.ts
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000);
\`\`\`

## The React Hook

\`\`\`typescript
function useWebSocket(url: string) {
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    return () => ws.current?.close();
  }, [url]);

  const send = (message: string) => {
    ws.current?.send(message);
  };

  return { messages, send };
}
\`\`\`

## Conclusion

WebSockets are the backbone of real-time applications. Combined with Next.js, you can build powerful, interactive experiences that feel instant.
    `,
    coverImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    author: {
      name: "Jordan Lee",
      avatar: "https://i.pravatar.cc/150?img=33",
      bio: "Backend engineer specializing in distributed systems.",
    },
    publishedAt: "2024-09-22",
    readingTime: 12,
    tags: ["WebSockets", "Next.js", "Real-Time"],
  },
  {
    id: "5",
    slug: "postgres-with-drizzle-orm",
    title: "PostgreSQL with Drizzle ORM: Type-Safe Databases Made Simple",
    excerpt:
      "Drizzle ORM offers a refreshingly simple approach to database queries. Learn how to set up Drizzle with PostgreSQL and enjoy fully type-safe database operations.",
    content: `
## Why Drizzle?

Drizzle ORM occupies a sweet spot between raw SQL and heavyweight ORMs like Prisma. It's lightweight, type-safe, and gives you full control without sacrificing developer experience.

## Setting Up Drizzle

\`\`\`bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
\`\`\`

## Defining Your Schema

\`\`\`typescript
// db/schema.ts
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content'),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
});
\`\`\`

## Querying Data

\`\`\`typescript
// Get all published posts with authors
const publishedPosts = await db
  .select()
  .from(posts)
  .leftJoin(authors, eq(posts.authorId, authors.id))
  .where(eq(posts.published, true))
  .orderBy(desc(posts.createdAt));
\`\`\`

## Migrations

\`\`\`bash
npx drizzle-kit generate
npx drizzle-kit migrate
\`\`\`

## Conclusion

Drizzle is an excellent choice for Next.js projects that need type-safe database access without the overhead of heavier ORMs.
    `,
    coverImage:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
    author: {
      name: "Priya Sharma",
      avatar: "https://i.pravatar.cc/150?img=44",
      bio: "Database architect and open source maintainer.",
    },
    publishedAt: "2024-09-05",
    readingTime: 7,
    tags: ["PostgreSQL", "Drizzle ORM", "Database"],
  },
  {
    id: "6",
    slug: "react-19-new-hooks-guide",
    title: "React 19 New Hooks: useActionState, useOptimistic, and More",
    excerpt:
      "React 19 ships with a suite of powerful new hooks that streamline form handling, server actions, and optimistic UI updates. Here's your complete guide.",
    content: `
## React 19 is Here

React 19 represents one of the most significant updates since hooks were introduced. The new hooks are tightly integrated with the new concurrent features and server actions.

## useActionState

Replaces the older \`useFormState\`, \`useActionState\` simplifies handling form submissions with server actions:

\`\`\`tsx
'use client';
import { useActionState } from 'react';
import { submitForm } from './actions';

function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitForm,
    { message: '' }
  );

  return (
    <form action={formAction}>
      <input name="email" type="email" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Submit'}
      </button>
      {state.message && <p>{state.message}</p>}
    </form>
  );
}
\`\`\`

## useOptimistic

Update the UI immediately while an async operation is in progress:

\`\`\`tsx
function LikeButton({ post }) {
  const [optimisticPost, addOptimisticLike] = useOptimistic(
    post,
    (state) => ({ ...state, likes: state.likes + 1 })
  );

  async function handleLike() {
    addOptimisticLike(); // Update UI instantly
    await likePost(post.id); // Then actually do it
  }

  return (
    <button onClick={handleLike}>
      ❤️ {optimisticPost.likes}
    </button>
  );
}
\`\`\`

## use()

The new \`use()\` API can read promises and context in render:

\`\`\`tsx
const data = use(fetchUserData(userId));
const theme = use(ThemeContext);
\`\`\`

## Conclusion

React 19's new hooks make server actions and async UI feel native and ergonomic. They're the building blocks for the next generation of React apps.
    `,
    coverImage:
      "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80",
    author: {
      name: "Sarah Chen",
      avatar: "https://i.pravatar.cc/150?img=47",
      bio: "Full-stack developer passionate about React and TypeScript.",
    },
    publishedAt: "2024-08-18",
    readingTime: 9,
    tags: ["React", "JavaScript", "Hooks"],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return mockPosts.find((post) => post.slug === slug);
}

export function getFeaturedPost(): BlogPost | undefined {
  return mockPosts.find((post) => post.featured);
}

export function getPostById(id: string): BlogPost | undefined {
  return mockPosts.find((post) => post.id === id);
}

export function getRecentPosts(exclude?: string): BlogPost[] {
  return mockPosts.filter((post) => post.slug !== exclude);
}
