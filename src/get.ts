import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import { TimetableError } from './types.js';
import type { Timetable } from './types.js';

export async function getTimetable(schoolCode: number, grade: number, classNum: number): Promise<Timetable> {
    const stuPage = iconv.decode(Buffer.from(await fetch('http://112.186.146.81:4082/st').then(res => res.arrayBuffer())), 'euc-kr');
    const schoolCodeEndpoint = stuPage.match(/function school_ra\(sc\){\$\.ajax\(\{ url:'\.\/[0-9]+\?[0-9]+l\'/g);
    if (!schoolCodeEndpoint) {
        throw new TimetableError(0);
    }
    const schoolCodeURI = schoolCodeEndpoint[0].match(/[0-9]+/g);
    if (!schoolCodeURI || schoolCodeURI.length !== 2) {
        throw new TimetableError(0);
    }
    const endpoint = `http://112.186.146.81:4082/${schoolCodeURI[0]}`;
    const scData = stuPage.match(/sc_data\('[0-9]+_',sc,[0-1],'[0-9]'\)/g);
    if (!scData) {
        throw new TimetableError(0);
    }
    const scDataCode = scData[0].match(/[0-9]+_/g);
    if (!scDataCode) {
        throw new TimetableError(0);
    }
    const timetable = JSON.parse((await fetch(endpoint + '?' + Buffer.from(`${scDataCode[0]}${schoolCode}_0_1`).toString('base64')).then(res => res.text())).replace(/\0/g, ''));
    if (Object.keys(timetable).length === 0) {
        throw new TimetableError(1);
    }
    const updatedTimeNameCode = stuPage.match(/\$\('#수정일'\)\.text\('수정일: '\+H시간표\.자료[0-9]+\);/g);
    if (!updatedTimeNameCode) {
        throw new TimetableError(0);
    }
    const updatedTimeName = updatedTimeNameCode[0].match(/[0-9]+/g);
    if (!updatedTimeName) {
        throw new TimetableError(0);
    }

    if (grade > timetable.학급수.length - 1) {
        throw new TimetableError(2);
    }
    if (classNum > timetable.학급수[grade] - timetable.가상학급수[grade]) {
        throw new TimetableError(3);
    }
    const separator = timetable.분리;
    const lastDataNameCode = stuPage.match(/원자료=Q자료\(자료\.자료[0-9]+\[학년\]\[반\]\[요일\]\[교시\]\);/g);
    if (!lastDataNameCode) {
        throw new TimetableError(0);
    }
    const lastDataName = lastDataNameCode[0].match(/[0-9]+/g);
    if (!lastDataName) {
        throw new TimetableError(0);
    }
    const currDataNameCode = stuPage.match(/일일자료=Q자료\(자료\.자료[0-9]+\[학년\]\[반\]\[요일\]\[교시\]\);/g);
    if (!currDataNameCode) {
        throw new TimetableError(0);
    }
    const currDataName = currDataNameCode[0].match(/[0-9]+/g);
    if (!currDataName) {
        throw new TimetableError(0);
    }
    const subjArrNameCode = stuPage.match(/자료\.자료[0-9]+\[sb\]/g);
    if (!subjArrNameCode) {
        throw new TimetableError(0);
    }
    const subjArrName = subjArrNameCode[0].match(/[0-9]+/g);
    if (!subjArrName) {
        throw new TimetableError(0);
    }
    const tcrArrNameCode = stuPage.match(/자료\.자료[0-9]+\[th\]/g);
    if (!tcrArrNameCode) {
        throw new TimetableError(0);
    }
    const tcrArrName = tcrArrNameCode[0].match(/[0-9]+/g);
    if (!tcrArrName) {
        throw new TimetableError(0);
    }
    const timeData = timetable['자료' + currDataName][grade][classNum];
    const timeDataArr = [];
    for (let i = 0; i < timeData[0]; i++) {
        timeDataArr.push(timeData[i + 1].slice(1));
    }
    const lastTimeData = timetable['자료' + lastDataName][grade][classNum];
    const lastTimeDataArr = [];
    for (let i = 0; i < lastTimeData[0]; i++) {
        lastTimeDataArr.push(lastTimeData[i + 1].slice(1));
    }
    const date = timetable['일자자료'][0][1].split(' ~ ').map((x: string) => x.split('-').map((y: string) => parseInt(y)));
    date[0][0] += 2000;
    date[0][1]--;
    date[1][0] += 2000;
    date[1][1]--;
    date[1][2] -= 1;
    const realDate = [new Date(date[0][0], date[0][1], date[0][2]), new Date(date[1][0], date[1][1], date[1][2])];
    const finalData: Timetable = {
        lastUpdated: new Date(timetable['자료' + updatedTimeName].replace(' ', 'T') + '.000+0900'),
        date: {
            start: [realDate[0].getFullYear(), realDate[0].getMonth() + 1, realDate[0].getDate()],
            end: [realDate[1].getFullYear(), realDate[1].getMonth() + 1, realDate[1].getDate()]
        },
        timetable: []
    };
    for (let i = 0; i < timeDataArr.length; i++) {
        const tmpData = [];
        for (let j = 0; j < timeDataArr[i].length; j++) {
            tmpData.push({
                subject: timetable['자료' + subjArrName][Math.floor(timeDataArr[i][j] / separator)],
                teacher: timetable['자료' + tcrArrName][timeDataArr[i][j] % separator],
                prevData: timeDataArr[i][j] !== lastTimeDataArr[i][j] ? {
                    subject: timetable['자료' + subjArrName][Math.floor(lastTimeDataArr[i][j] / separator)],
                    teacher: timetable['자료' + tcrArrName][lastTimeDataArr[i][j] % separator]
                } : undefined
            });
        }
        finalData.timetable.push(tmpData);
        if (timeDataArr[i].length < lastTimeDataArr[i].length) {
            for (let j = timeDataArr[i].length; j < lastTimeDataArr[i].length; j++) {
                finalData.timetable[finalData.timetable.length - 1].push({
                    subject: '',
                    teacher: '',
                    prevData: {
                        subject: timetable['자료' + subjArrName][Math.floor(lastTimeDataArr[i][j] / separator)],
                        teacher: timetable['자료' + tcrArrName][lastTimeDataArr[i][j] % separator]
                    }
                });
            }
        }
    }
    return finalData;
}
