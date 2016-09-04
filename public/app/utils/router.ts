import * as React from 'react';
import {createHashHistory} from 'history'
import * as EventEmitter from 'wolfy87-eventemitter';
import {Const} from "../const/const";

export interface RouterConfig {
    component: any,
    route: string
}

export class ReactRouter {
    private history = createHashHistory();
    /* configs example
     [{
         component: SearchResults,
         route: '/search/:term'
     },
     {
         component: QuestionAnswer,
         route: '/qa/:id'
     }]
     */
    constructor(private configs: Array<RouterConfig>, private eventEngine: EventEmitter) {

    }

    getCurrentComponent() {
        var baseRoute = ReactRouter.getBaseRoute();
        var component:React.Component<any, any> = null;
        this.configs.forEach((config) => {
            var route = ReactRouter.getBaseRouteFromConfig(config.route);
            if (route === baseRoute) {
                component = config.component;
            }
        });
        return component;
    }

    getParam() {
        return ReactRouter.getPathParam();
    }

    setPath(path:string, param?:string) {
        this.eventEngine.removeAllListeners(Const.UPDATE_VIEW);
        path = param ? path + '/' + encodeURIComponent(param) : path;
        this.history.push(path);
        this.eventEngine.emitEvent('UPDATE_VIEW', []);
    }

    /*
     Take the browser's URL e.g. http://localhost:3000/#/search/search%20term
     and return string 'search term'.
     */
    static getPathParam():string {
        try {
            var path = window.location.hash.split('/');
            var str = decodeURIComponent(path[path.length - 1]);
            str = str.replace(/\?.*/, '');
            return str;
        }
        catch(ex) {
            return '';
        }
    }

    /*
     Take the browser's URL e.g. http://localhost:3000/#/search/search%20term
     and return string 'search' i.e. the top-level path
     */
    static getBaseRoute():string {
        try {
            var path = window.location.hash.split('/');
            return path[1];
        }
        catch(ex) {
            return '';
        }
    }

    static getBaseRouteFromConfig(route:string) {
        try {
            var path = route.split('/');
            return path[0] ? path[0] : path[1];
        }
        catch(ex) {
            return '';
        }
    }
}