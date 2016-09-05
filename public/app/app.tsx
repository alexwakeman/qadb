/// <reference path="../../typings/index.d.ts" />

import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';
import * as ReactDOM from 'react-dom';

import { Heading } from './components/heading/heading.component';
import { SearchForm } from './components/forms/search';
import { SearchResults } from './components/forms/search-results.component';
import { QuestionAnswer } from './components/forms/qa.component';
import {ReactRouter, RouterConfig} from "./utils/router";
import {Const} from "./const/const";

let routeConfigs: Array<RouterConfig> = [
    {
        component: SearchResults,
        route: Const.SEARCH_PATH
    },
    {
        component: QuestionAnswer,
        route: Const.QA_PATH
    }
];
var ee: EventEmitter = new EventEmitter();
var router: ReactRouter = new ReactRouter(routeConfigs, ee);

interface AppState { Elem: any }

export class App extends React.Component<{}, AppState> {
    constructor() {
        super();
    }

    componentWillMount() {
        router.assignAppInstance(this);
    }

    render() {
        let Out = this.state.Elem;
        return (
            <div className="container-fluid">
                <Heading logoUrl="/img/logo.png" greeting="QADB" />
                <SearchForm eventEngine={ee} availableQAs={3450} router={router}/>
                <Out router={router} eventEngine={ee} />
            </div>
        );
    }
}

ReactDOM.render((
    <App />
), document.getElementById('qadb-app'));