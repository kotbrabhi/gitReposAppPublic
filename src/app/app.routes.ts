import { Routes } from '@angular/router';

export const routes: Routes = [
    {
      path: 'repos',
      loadComponent: () =>
        import('./features/repos/repos.component').then((c) => c.ReposComponent),
    },
    {
        path: 'commits/:owner/:repo',
        loadComponent: () =>
        import('./features/commits/commits.component').then((c) => c.CommitsComponent),
    },
    { path: '', redirectTo: '/repos', pathMatch: 'full' },
    { path: '**', redirectTo: '/repos' },
  ];