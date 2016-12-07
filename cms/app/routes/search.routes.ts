import { RouterConfig } from '@angular/router';

import {SearchIndexComponent} from '../components/search/search.index.component';

export const SearchRoutes: RouterConfig = [
    {
        path: 'search',
        component: SearchIndexComponent,
        children: [
            {
                path: '',
                component: SearchIndexComponent
            },
            {
                path: ':searchTerm/:page',
                component: SearchIndexComponent
            }
        ]
    }
];