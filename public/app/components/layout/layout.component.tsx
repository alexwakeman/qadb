import * as React from "react";
import * as EventEmitter from 'wolfy87-eventemitter';

import { Heading } from '../heading/heading.component';
import { SearchForm } from '../forms/search';


export class Layout extends React.Component<{}, {}> {
    private ee: EventEmitter = new EventEmitter();
    render() {
        return  <div className="container-fluid">
                    <Heading logoUrl="/img/logo.png" greeting="Welcome to QADB!" />
                    <SearchForm availableQAs={3450} eventEngine={this.ee} />
                </div>;
    }
}