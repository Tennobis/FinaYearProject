import { create } from 'zustand';
import axios from 'axios';

export interface Project {
  id: string;
  name: string;
  description: string;
  template: 'react' | 'nextjs' | 'express' | 'vue' | 'svelte';
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  cloneProject: (id: string, newName: string) => Promise<Project>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/projects`);
      set({ projects: response.data, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch projects';
      set({ error: message, loading: false });
    }
  },

  createProject: async (projectData) => {
    const optimisticProject: Project = {
      id: `temp-${Date.now()}`,
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    set((state) => ({
      projects: [optimisticProject, ...state.projects],
    }));

    try {
      const response = await axios.post(`${API_URL}/projects`, projectData);
      const newProject = response.data;

      // Replace temporary project with real one
      set((state) => ({
        projects: state.projects.map((p) => (p.id === optimisticProject.id ? newProject : p)),
      }));

      return newProject;
    } catch (error) {
      // Rollback on error
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== optimisticProject.id),
        error: error instanceof Error ? error.message : 'Failed to create project',
      }));
      throw error;
    }
  },

  updateProject: async (id, updates) => {
    const currentProjects = get().projects;
    const originalProject = currentProjects.find((p) => p.id === id);

    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));

    try {
      await axios.patch(`${API_URL}/projects/${id}`, updates);
    } catch (error) {
      // Rollback on error
      if (originalProject) {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? originalProject : p
          ),
          error: error instanceof Error ? error.message : 'Failed to update project',
        }));
      }
      throw error;
    }
  },

  deleteProject: async (id) => {
    const currentProjects = get().projects;
    const projectToDelete = currentProjects.find((p) => p.id === id);

    // Optimistic delete
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));

    try {
      await axios.delete(`${API_URL}/projects/${id}`);
    } catch (error) {
      // Rollback on error
      if (projectToDelete) {
        set((state) => ({
          projects: [...state.projects, projectToDelete],
          error: error instanceof Error ? error.message : 'Failed to delete project',
        }));
      }
      throw error;
    }
  },

  cloneProject: async (id, newName) => {
    try {
      const response = await axios.post(`${API_URL}/projects/${id}/clone`, {
        name: newName,
      });
      const clonedProject = response.data;

      set((state) => ({
        projects: [clonedProject, ...state.projects],
      }));

      return clonedProject;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clone project';
      set({ error: message });
      throw error;
    }
  },
}));
