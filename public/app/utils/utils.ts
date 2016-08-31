import {Const} from '../const/const';

type ApiTarget = 'suggest' | 'search' | 'qa';

export class Utils {
    static get(target:ApiTarget, input:string, callback:Function) {
        var xhr = new XMLHttpRequest(),
            endpoint = Const.API_URL + '/' + target;
        if (input) endpoint += '/?input=' + input;
        xhr.onload = () => callback(JSON.parse(xhr.responseText));
        xhr.open('GET', endpoint);
        xhr.send();
    }

    /*
        Take the browser's URL e.g. http://localhost:3000/#/search/search%20term?_k=l985t5
        and return string 'search term'.
     */
    static getPathQuery():string {
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
}