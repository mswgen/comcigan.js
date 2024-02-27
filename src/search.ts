import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import { SearchError } from './types.js';
import type { SchoolList } from './types.js';

export async function searchSchool(schoolName: string): Promise<SchoolList> {
    const stuPage = iconv.decode(Buffer.from(await fetch('http://112.186.146.81:4082/st').then(res => res.arrayBuffer())), 'euc-kr');
    const schoolCodeEndpoint = stuPage.match(/function school_ra\(sc\){\$\.ajax\(\{ url:'\.\/[0-9]+\?[0-9]+l\'/g);
    if (!schoolCodeEndpoint) {
        throw new SearchError(0);
    }
    const schoolCodeURI = schoolCodeEndpoint[0].match(/[0-9]+/g);
    if (!schoolCodeURI || schoolCodeURI.length !== 2) {
        throw new SearchError(0);
    }
    const endpoint = `http://112.186.146.81:4082/${schoolCodeURI[0]}`;
    const schoolListRaw = await fetch(endpoint + `?${schoolCodeURI[1]}l${iconv.encode(schoolName, 'euc-kr').toString('hex').toUpperCase().match(/[0-9A-Z]{2}/g)?.map(x => '%' + x).join('')}`).then(res => res.text());
    const schools = JSON.parse(schoolListRaw.replace(/\0/g, '')).학교검색;
    if (schools.length === 0) {
        throw new SearchError(1);
    }
    const schoolList: SchoolList = schools.map((x: [number, string, string, number]) => ({ name: x[2], code: x[3] }));
    return schoolList;
}
