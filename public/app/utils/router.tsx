import * as React from 'react';
import {createHashHistory} from 'history'
import * as EventEmitter from 'wolfy87-eventemitter';
import {Const} from "../const/const";

export interface RouterConfig {
    component: any,
    route: string
}

class DefaultComponent extends React.Component<{}, {}> {
    render() {
        return <link />
    }
}

export class ReactRouter {
    private history = createHashHistory();
    private app: any;
    private baseRoute: string;
    constructor(private configs: Array<RouterConfig>, private eventEngine: EventEmitter) {
        this.navigated = this.navigated.bind(this);
        window.onhashchange = this.navigated; // modern browsers only
    }

    public assignAppInstance(appInstance:any) {
        this.app = appInstance;
        this.navigated();
    }

    public setPath(path:string, param?:string) {
        path = param ? path + '/' + encodeURIComponent(param) : path;
        this.history.push(path);
    }

    public getParam() {
        return ReactRouter.getPathParam();
    }

    public getPath() {
        return ReactRouter.getBaseRoute();
    }

    private navigated() {
        this.app.setState({Elem: this.getCurrentComponent()});
        this.eventEngine.emitEvent(Const.UPDATE_VIEW, []);
        this.eventEngine.emitEvent(Const.DID_NAVIGATE, []);
    }

    private getCurrentComponent() {
        var baseRoute = ReactRouter.getBaseRoute();
        var component:React.Component<any, any> = null;
        if (this.baseRoute !== baseRoute) {
            // we are navigating to a new area (context),
            // so remove UPDATE_VIEW listeners from current context
            this.eventEngine.removeAllListeners(Const.UPDATE_VIEW);
            this.baseRoute = baseRoute;
        }
        this.configs.forEach((config) => {
            if (config.route === this.baseRoute) {
                component = config.component;
            }
        });
        return component ? component : DefaultComponent;
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
     Take the browser's URL e.g. http://localhost:3000/#/qa/6a2f4b73
     and return string 'qa' i.e. the top-level path
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
}