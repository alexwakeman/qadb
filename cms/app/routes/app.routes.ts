import { provideRouter, RouterConfig } from '@angular/router';
import { UsersRoutes } from '../routes/users.routes';
import { HomeRoutes } from '../routes/home.routes';
import { SearchRoutes } from '../routes/search.routes';

export const routes: RouterConfig = [
    ...UsersRoutes,
    ...HomeRoutes,
    ...SearchRoutes
];

export const AppRouterProviders = [
    provideRouter(routes)
];