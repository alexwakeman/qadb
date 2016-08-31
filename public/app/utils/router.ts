import {Utils} from "./utils";
export interface RouterConfig {
    component: any,
    route: string
}

export class ReactRouter {
    /*
     [{
         component: SearchResults,
         route: '/search/:term'
     },
     {
         component: QuestionAnswer,
         route: '/qa/:id'
     }]
     */
    constructor(private config: Array<RouterConfig>) {

    }

    getCurrentComponent() {
        var baseRoute = Utils.getBaseRoute();
        var comp:any = null;
        this.config.forEach((conf) => {
            var route = Utils.getBaseRouteFromConfig(conf.route);
            if (route === baseRoute) {
                comp = conf.component;
            }
        });
        return comp;
    }

    getParam() {
        return Utils.getPathParam();
    }
}