import {Const} from '../const/const';

type ApiTarget = 'suggest' | 'search' | 'qa';

export class Utils {
    static get(target:ApiTarget, input:string, callback:Function) {
        var endpoint = Const.API_URL + '/' + target;
        if (input) endpoint += '/' + input;
        Utils.doXhr(endpoint, callback);
    }

    static search(input:string, page:number, callback:Function) {
        var endpoint = Const.API_URL + '/search/' + input + '/' + page;
        Utils.doXhr(endpoint, callback);
    }

    static doXhr(endpoint:string, callback:Function) {
        var xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            } else {
                console && console.error(xhr.statusText, xhr.responseText);
            }
        };
        xhr.open('GET', endpoint);
        xhr.send();
    }
}