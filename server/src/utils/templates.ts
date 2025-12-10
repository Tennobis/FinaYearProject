import { Templates } from '@prisma/client';

export interface FileStructure {
  [key: string]: {
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileStructure;
  };
}

export interface TemplateFileContent {
  [filename: string]: {
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: {
      [key: string]: any;
    };
  };
}

/**
 * Generate default file structure for React template
 */
const getReactTemplate = (): TemplateFileContent => {
  return {
    'package.json': {
      name: 'package.json',
      type: 'file',
      content: JSON.stringify(
        {
          name: 'react-app',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.0.0',
            vite: '^4.0.0',
          },
        },
        null,
        2
      ),
    },
    'index.html': {
      name: 'index.html',
      type: 'file',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
    },
    'src': {
      name: 'src',
      type: 'folder',
      children: {
        'main.tsx': {
          name: 'main.tsx',
          type: 'file',
          content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        },
        'App.tsx': {
          name: 'App.tsx',
          type: 'file',
          content: `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Welcome to React</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}

export default App`,
        },
      },
    },
  };
};

/**
 * Generate default file structure for Express template
 */
const getExpressTemplate = (): TemplateFileContent => {
  return {
    'package.json': {
      name: 'package.json',
      type: 'file',
      content: JSON.stringify(
        {
          name: 'express-app',
          version: '1.0.0',
          type: 'module',
          scripts: {
            start: 'node src/index.js',
            dev: 'nodemon src/index.js',
          },
          dependencies: {
            express: '^4.18.2',
          },
          devDependencies: {
            nodemon: '^3.0.0',
          },
        },
        null,
        2
      ),
    },
    'src': {
      name: 'src',
      type: 'folder',
      children: {
        'index.js': {
          name: 'index.js',
          type: 'file',
          content: `import express from 'express'
import routes from './routes/index.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', routes)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`,
        },
        'routes': {
          name: 'routes',
          type: 'folder',
          children: {
            'index.js': {
              name: 'index.js',
              type: 'file',
              content: `import express from 'express'

const router = express.Router()

/**
 * GET /api/hello
 */
router.get('/hello', (req, res) => {
  res.status(200).json({ message: 'Hello from Express!' })
})

/**
 * GET /api/users
 */
router.get('/users', (req, res) => {
  res.status(200).json({
    users: [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
    ],
  })
})

export default router`,
            },
          },
        },
      },
    },
  };
};

/**
 * Generate default file structure for Next.js template
 */
const getNextJsTemplate = (): TemplateFileContent => {
  return {
    'package.json': {
      name: 'package.json',
      type: 'file',
      content: JSON.stringify(
        {
          name: 'nextjs-app',
          version: '1.0.0',
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
            lint: 'next lint',
          },
          dependencies: {
            next: '^14.0.0',
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
        },
        null,
        2
      ),
    },
    'app': {
      name: 'app',
      type: 'folder',
      children: {
        'layout.tsx': {
          name: 'layout.tsx',
          type: 'file',
          content: `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
        },
        'page.tsx': {
          name: 'page.tsx',
          type: 'file',
          content: `'use client'

import { useState } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <main style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Welcome to Next.js</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </main>
  )
}`,
        },
      },
    },
  };
};

/**
 * Generate default file structure for Vue template
 */
const getVueTemplate = (): TemplateFileContent => {
  return {
    'package.json': {
      name: 'package.json',
      type: 'file',
      content: JSON.stringify(
        {
          name: 'vue-app',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
          },
          dependencies: {
            vue: '^3.0.0',
          },
          devDependencies: {
            '@vitejs/plugin-vue': '^4.0.0',
            vite: '^4.0.0',
          },
        },
        null,
        2
      ),
    },
    'index.html': {
      name: 'index.html',
      type: 'file',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>`,
    },
    'src': {
      name: 'src',
      type: 'folder',
      children: {
        'main.ts': {
          name: 'main.ts',
          type: 'file',
          content: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
        },
        'App.vue': {
          name: 'App.vue',
          type: 'file',
          content: `<template>
  <div class="container">
    <h1>Welcome to Vue</h1>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
}
</style>`,
        },
      },
    },
  };
};

/**
 * Generate default file structure for Hono template
 */
const getHonoTemplate = (): TemplateFileContent => {
  return {
    'package.json': {
      name: 'package.json',
      type: 'file',
      content: JSON.stringify(
        {
          name: 'hono-app',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'wrangler dev',
            deploy: 'wrangler deploy',
          },
          dependencies: {
            hono: '^3.0.0',
          },
          devDependencies: {
            wrangler: '^3.0.0',
          },
        },
        null,
        2
      ),
    },
    'src': {
      name: 'src',
      type: 'folder',
      children: {
        'index.ts': {
          name: 'index.ts',
          type: 'file',
          content: `import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Hello from Hono!' })
})

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello API' })
})

export default app`,
        },
      },
    },
  };
};

/**
 * Generate default file structure for Angular template
 */
const getAngularTemplate = (): TemplateFileContent => {
  return {
    'package.json': {
      name: 'package.json',
      type: 'file',
      content: JSON.stringify(
        {
          name: 'angular-app',
          version: '1.0.0',
          scripts: {
            ng: 'ng',
            start: 'ng serve',
            build: 'ng build',
          },
          dependencies: {
            '@angular/core': '^17.0.0',
            '@angular/common': '^17.0.0',
            '@angular/platform-browser': '^17.0.0',
            '@angular/platform-browser-dynamic': '^17.0.0',
            'rxjs': '^7.8.0',
          },
          devDependencies: {
            '@angular/cli': '^17.0.0',
            'typescript': '^5.0.0',
          },
        },
        null,
        2
      ),
    },
    'src': {
      name: 'src',
      type: 'folder',
      children: {
        'main.ts': {
          name: 'main.ts',
          type: 'file',
          content: `import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'

bootstrapApplication(AppComponent).catch(err => console.error(err))`,
        },
        'app': {
          name: 'app',
          type: 'folder',
          children: {
            'app.component.ts': {
              name: 'app.component.ts',
              type: 'file',
              content: `import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div style="padding: 20px;">
      <h1>Welcome to Angular</h1>
      <p>Count: {{ count }}</p>
      <button (click)="increment()">Increment</button>
    </div>
  \`,
})
export class AppComponent {
  count = 0

  increment() {
    this.count++
  }
}`,
            },
          },
        },
      },
    },
  };
};

/**
 * Generate template files based on template type
 */
export const generateTemplateFiles = (template: Templates): TemplateFileContent => {
  switch (template) {
    case 'REACT':
      return getReactTemplate();
    case 'EXPRESS':
      return getExpressTemplate();
    case 'NEXTJS':
      return getNextJsTemplate();
    case 'VUE':
      return getVueTemplate();
    case 'HONO':
      return getHonoTemplate();
    case 'ANGULAR':
      return getAngularTemplate();
    default:
      return getReactTemplate();
  }
};

/**
 * Get file tree structure from template
 */
export const getFileTree = (template: Templates): FileStructure => {
  const files = generateTemplateFiles(template);

  const buildTree = (
    fileContent: TemplateFileContent,
    level: number = 0
  ): FileStructure => {
    const result: FileStructure = {};

    for (const [key, file] of Object.entries(fileContent)) {
      result[key] = {
        name: file.name,
        type: file.type,
        ...(file.content && { content: file.content }),
        ...(file.children && { children: buildTree(file.children, level + 1) }),
      };
    }

    return result;
  };

  return buildTree(files);
};

/**
 * Get all available templates
 */
export const getAvailableTemplates = (): Array<{
  name: Templates;
  label: string;
  description: string;
}> => {
  return [
    {
      name: 'REACT',
      label: 'React',
      description: 'React with Vite',
    },
    {
      name: 'NEXTJS',
      label: 'Next.js',
      description: 'Next.js with App Router',
    },
    {
      name: 'EXPRESS',
      label: 'Express',
      description: 'Express.js backend',
    },
    {
      name: 'VUE',
      label: 'Vue',
      description: 'Vue 3 with Vite',
    },
    {
      name: 'HONO',
      label: 'Hono',
      description: 'Hono - Lightweight web framework',
    },
    {
      name: 'ANGULAR',
      label: 'Angular',
      description: 'Angular standalone components',
    },
  ];
};
