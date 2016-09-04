import {Const} from '../const/const';

type ApiTarget = 'suggest' | 'search' | 'qa';

export class Utils {
    static get(target:ApiTarget, input:string, callback:Function) {
        var xhr = new XMLHttpRequest(),
            endpoint = Const.API_URL + '/' + target;
        if (input) endpoint += '/?input=' + input;
        xhr.onload = () => {
            callback(JSON.parse(xhr.responseText));
        };
        xhr.open('GET', endpoint);
        xhr.send();
    }
}