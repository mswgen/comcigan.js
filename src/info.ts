import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import { InfoError } from './types.js';
import type { SchoolInfo } from './types.js';

export async function getSchoolInfo(schoolCode: number): Promise<SchoolInfo> {
    const stuPage = iconv.decode(Buffer.from(await fetch('http://112.186.146.81:4082/st').then(res => res.arrayBuffer())), 'euc-kr');
    const schoolCodeEndpoint = stuPage.match(/function school_ra\(sc\){\$\.ajax\(\{ url:'\.\/[0-9]+\?[0-9]+l\'/g);
    if (!schoolCodeEndpoint) {
        throw new InfoError(0);
    }
    const schoolCodeURI = schoolCodeEndpoint[0].match(/[0-9]+/g);
    if (!schoolCodeURI || schoolCodeURI.length !== 2) {
        throw new InfoError(0);
    }
    const endpoint = `http://112.186.146.81:4082/${schoolCodeURI[0]}`;
    const scData = stuPage.match(/sc_data\('[0-9]+_',sc,[0-1],'[0-9]'\)/g);
    if (!scData) {
        throw new InfoError(0);
    }
    const scDataCode = scData[0].match(/[0-9]+_/g);
    if (!scDataCode) {
        throw new InfoError(0);
    }
    const rawData = JSON.parse((await fetch(endpoint + '?' + Buffer.from(`${scDataCode[0]}${schoolCode}_0_1`).toString('base64')).then(res => res.text())).replace(/\0/g, ''));
    if (Object.keys(rawData).length === 0) {
        throw new InfoError(1);
    }
    const updatedTimeNameCode = stuPage.match(/\$\('#수정일'\)\.text\('수정일: '\+H시간표\.자료[0-9]+\);/g);
    if (!updatedTimeNameCode) {
        throw new InfoError(0);
    }
    const updatedTimeName = updatedTimeNameCode[0].match(/[0-9]+/g);
    if (!updatedTimeName) {
        throw new InfoError(0);
    }
    return {
        lastUpdated: new Date(rawData['자료' + updatedTimeName].replace(' ', 'T') + '.000+0900'),
        data: {
            code: schoolCode,
            grades: rawData.학급수.length - 1,
            classes: rawData.학급수.map((x: number, i: number) => x - rawData.가상학급수[i]).slice(1)
        }
    }
}