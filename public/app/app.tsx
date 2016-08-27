/// <reference path="../../typings/index.d.ts" />

import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';

import { Heading } from './components/heading/heading.component';
import { SearchForm } from './components/forms/search';
import { SearchResults } from './components/forms/search-reults.component';
import { Router, Route, IndexRoute, Link, hashHistory, browserHistory } from 'react-router';
import * as ReactDOM from 'react-dom';

var ee: EventEmitter = new EventEmitter();

export class App extends React.Component<{}, {}> {
    render() {
        return <div className="container-fluid">
            <Heading logoUrl="/img/logo.png" greeting="Welcome to QADB!" />
            {this.props.children}
        </div>;
    }
}

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={() => (<SearchForm eventEngine={ee} availableQAs={3450}/>)} />
            <Route path="search" component={() => (<SearchResults eventEngine={ee} />)} />
        </Route>
    </Router>
), document.getElementById('qadb-app'));