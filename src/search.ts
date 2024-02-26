import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import { SearchError } from './types';

export async function searchSchool(schoolName: string, schoolOrd: string): Promise<number | SearchError> {
    const stuPage = iconv.decode(Buffer.from(await fetch('http://112.186.146.81:4082/st').then(res => res.arrayBuffer())), 'euc-kr');
    const schoolCodeEndpoint = stuPage.match(/function school_ra\(sc\){\$\.ajax\(\{ url:'\.\/[0-9]+\?[0-9]+l\'/g);
    if (!schoolCodeEndpoint) {
        return new SearchError(0);
    }
    const schoolCodeURI = schoolCodeEndpoint[0].match(/[0-9]+/g);
    if (!schoolCodeURI || schoolCodeURI.length !== 2) {
        return new SearchError(0);
    }
    const endpoint = `http://112.186.146.81:4082/${schoolCodeURI[0]}`;
    const schoolList = await fetch(endpoint + `?${schoolCodeURI[1]}l${iconv.encode(schoolName, 'euc-kr').toString('hex').toUpperCase().match(/[0-9A-Z]{2}/g)?.map(x => '%' + x).join('')}`).then(res => res.text());
    const schools = JSON.parse(schoolList.replace(/\0/g, '')).학교검색;
    if (schools.length === 0) {
        return new SearchError(1);
    }
    if (parseInt(schoolOrd) > schools.length) {
        return new SearchError(1);
    }
    const schoolCode = schools[parseInt(schoolOrd) - 1][3];
    return schoolCode;
}