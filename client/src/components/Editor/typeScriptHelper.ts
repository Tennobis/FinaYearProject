/**
 * TypeScript Helper for Monaco Editor
 *
 * Provides utilities for TypeScript language support, type definitions,
 * and advanced editor features.
 */

export interface TypeScriptLibConfig {
  version: string;
  contents: string;
}

/**
 * Configure TypeScript diagnostics and compiler options
 */
export const configureTypeScript = (monaco: typeof import('monaco-editor')) => {
  try {
    // Set TypeScript compiler options
    const defaults = (monaco.languages.typescript as any).typescriptDefaults;
    defaults.setCompilerOptions({
      target: 7, // ES2020
      module: 99, // ESNext
      jsx: 4, // React
      jsxFactory: 'React.createElement',
      jsxFragmentFactory: 'React.Fragment',
      strict: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictBindCallApply: true,
      strictPropertyInitialization: true,
      noImplicitAny: true,
      alwaysStrict: true,
      noUnusedLocals: true,
      noUnusedParameters: false,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      noImplicitThis: true,
      moduleResolution: 2, // NodeJs
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      isolatedModules: true,
      sourceMap: true,
      declaration: true,
      declarationMap: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      allowJs: true,
      checkJs: false,
    });

    // Configure diagnostics options
    defaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      onlyVisible: false,
    });
  } catch (error) {
    console.warn('Error configuring TypeScript:', error);
  }
};

/**
 * Add type definitions for common libraries
 */
export const addLibraryDefinitions = (
  monaco: typeof import('monaco-editor')
) => {
  try {
    const defaults = (monaco.languages.typescript as any).typescriptDefaults;
    
    // React types
    defaults.addExtraLib(
      getReactTypes(),
      'ts:react.d.ts'
    );

    // React DOM types
    defaults.addExtraLib(
      getReactDomTypes(),
      'ts:react-dom.d.ts'
    );

    // DOM types
    defaults.addExtraLib(
      getDomTypes(),
      'ts:dom.d.ts'
    );

    // Console API
    defaults.addExtraLib(
      getConsoleTypes(),
      'ts:console.d.ts'
    );

    // Promise/async types
    defaults.addExtraLib(
      getPromiseTypes(),
      'ts:promise.d.ts'
    );
  } catch (error) {
    console.warn('Error adding library definitions:', error);
  }
};

/**
 * Basic React types for auto-completion
 */
function getReactTypes(): string {
  return `
declare module 'react' {
  export const React: any;
  export const useState: <T>(initial: T) => [T, (value: T) => void];
  export const useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
  export const useContext: <T>(context: any) => T;
  export const useReducer: <S, A>(reducer: (state: S, action: A) => S, initial: S) => [S, (action: A) => void];
  export const useCallback: <T extends (...args: any[]) => any>(fn: T, deps: any[]) => T;
  export const useMemo: <T>(fn: () => T, deps: any[]) => T;
  export const useRef: <T>(initial: T) => { current: T };
  export function FC<P = {}>(props: P & { children?: React.ReactNode }): JSX.Element | null;
  export type CSSProperties = Record<string, string | number>;
}
  `;
}

/**
 * React DOM types
 */
function getReactDomTypes(): string {
  return `
declare module 'react-dom' {
  import * as React from 'react';
  export function render(
    element: React.ReactElement<any>,
    container: Element | Document | DocumentFragment | null,
    callback?: () => void
  ): void;
  export function createRoot(
    container: Element | DocumentFragment,
    options?: any
  ): any;
}
  `;
}

/**
 * DOM API types
 */
function getDomTypes(): string {
  return `
declare global {
  interface Window {
    [key: string]: any;
  }
  const window: Window;
  const document: Document;
  const location: Location;
  const navigator: Navigator;
  const history: History;
  const localStorage: Storage;
  const sessionStorage: Storage;
}

declare class Element {
  className: string;
  id: string;
  style: CSSStyleDeclaration;
  addEventListener(type: string, listener: (ev: any) => any): void;
  appendChild<T extends Node>(node: T): T;
  removeChild<T extends Node>(node: T): T;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  textContent: string | null;
  innerHTML: string;
}

declare class Document {
  getElementById(id: string): Element | null;
  querySelector(selectors: string): Element | null;
  querySelectorAll(selectors: string): Element[];
  createElement(tagName: string): Element;
  addEventListener(type: string, listener: (ev: any) => any): void;
  body: Element;
  head: Element;
}

declare interface CSSStyleDeclaration {
  [key: string]: string | number;
}

declare interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}
  `;
}

/**
 * Console API types
 */
function getConsoleTypes(): string {
  return `
declare global {
  const console: {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
    debug(...args: any[]): void;
    table(data: any, columns?: string[]): void;
    time(label?: string): void;
    timeEnd(label?: string): void;
    group(label?: string): void;
    groupEnd(): void;
    clear(): void;
    assert(value: any, message?: string): void;
    count(label?: string): void;
    trace(): void;
  };
}
  `;
}

/**
 * Promise and async/await types
 */
function getPromiseTypes(): string {
  return `
declare global {
  class Promise<T> {
    constructor(executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void);
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
      onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
    ): Promise<TResult1 | TResult2>;
    catch<TResult = never>(
      onrejected?: (reason: any) => TResult | PromiseLike<TResult>
    ): Promise<T | TResult>;
    finally(onfinally?: () => void): Promise<T>;
  }

  interface PromiseConstructor {
    resolve<T>(value: T | PromiseLike<T>): Promise<T>;
    reject<T = never>(reason?: any): Promise<T>;
    all<T extends readonly unknown[]>(
      values: T
    ): Promise<{ [P in keyof T]: Awaited<T[P]> }>;
    race<T extends readonly unknown[]>(values: T): Promise<Awaited<T[number]>>;
  }

  const Promise: PromiseConstructor;

  type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;
}
  `;
}

/**
 * Configure JavaScript support
 */
export const configureJavaScript = (
  monaco: typeof import('monaco-editor')
) => {
  try {
    // Add type definitions
    addLibraryDefinitions(monaco);
  } catch (error) {
    console.warn('Error configuring JavaScript:', error);
  }
};
