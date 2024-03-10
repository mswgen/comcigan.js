import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import { TimetableError } from './types.js';
import type { TeacherTimetable } from './types.js';

export async function getTeacherTimetable(schoolCode: number, teacher: number): Promise<TeacherTimetable> {
    const stuPage = iconv.decode(Buffer.from(await fetch('http://comci.net:4082/st').then(res => res.arrayBuffer())), 'euc-kr');
    const schoolCodeEndpoint = stuPage.match(/function school_ra\(sc\){\$\.ajax\(\{ url:'\.\/[0-9]+\?[0-9]+l\'/g);
    if (!schoolCodeEndpoint) {
        throw new TimetableError(0);
    }
    const schoolCodeURI = schoolCodeEndpoint[0].match(/[0-9]+/g);
    if (!schoolCodeURI || schoolCodeURI.length !== 2) {
        throw new TimetableError(0);
    }
    const endpoint = `http://comci.net:4082/${schoolCodeURI[0]}`;
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
    const subjectCodes = timetable['자료' + subjArrName]
    const tcrArrNameCode = stuPage.match(/자료\.자료[0-9]+\[th\]/g);
    if (!tcrArrNameCode) {
        throw new TimetableError(0);
    }
    const tcrArrName = tcrArrNameCode[0].match(/[0-9]+/g);
    if (!tcrArrName) {
        throw new TimetableError(0);
    }
    const teacherCodes = timetable['자료' + tcrArrName];
    if (teacher >= teacherCodes.length) {
        throw new TimetableError(2);
    }
    const timeData = timetable['자료' + currDataName];
    const timeDataArr: Array<Array<{ grade: number, classNum: number, subject: string }>> = [];
    timeData.slice(1).forEach((grade: any, gradeKey: number) => {
        grade.slice(1).forEach((classNum: any, classNumKey: number) => {
            classNum.slice(1).forEach((day: any, dayKey: number) => {
                if (gradeKey === 0 && classNumKey === 0) timeDataArr.push([]);
                day.slice(1).forEach((time: number, timeKey: number) => {
                    if (time % separator === teacher) {
                        for (let i = 0; i < timeKey; i++) {
                            if (!timeDataArr[dayKey][i]) timeDataArr[dayKey][i] = ({ grade: 0, classNum: 0, subject: '' });
                        }
                        timeDataArr[dayKey][timeKey] = ({ grade: gradeKey + 1, classNum: classNumKey + 1, subject: subjectCodes[Math.floor(time / separator)] });
                    }
                });
            });
        });
    });
    const lastTimeData = timetable['자료' + lastDataName];
    const lastTimeDataArr: Array<Array<{ grade: number, classNum: number, subject: string }>> = [];
    lastTimeData.slice(1).forEach((grade: any, gradeKey: number) => {
        grade.slice(1).forEach((classNum: any, classNumKey: number) => {
            classNum.slice(1).forEach((day: any, dayKey: number) => {
                if (gradeKey === 0 && classNumKey === 0) lastTimeDataArr.push([]);
                day.slice(1).forEach((time: number, timeKey: number) => {
                    if (time % separator === teacher) {
                        lastTimeDataArr[dayKey][timeKey] = ({ grade: gradeKey + 1, classNum: classNumKey + 1, subject: subjectCodes[Math.floor(time / separator)] });
                    }
                });
            });
        });
    });
    const date = timetable['일자자료'][0][1].split(' ~ ').map((x: string) => x.split('-').map((y: string) => parseInt(y)));
    date[0][0] += 2000;
    date[0][1]--;
    date[1][0] += 2000;
    date[1][1]--;
    date[1][2] -= 1;
    const realDate = [new Date(date[0][0], date[0][1], date[0][2]), new Date(date[1][0], date[1][1], date[1][2])];
    const finalData: TeacherTimetable = {
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
                grade: timeDataArr[i][j].grade,
                classNum: timeDataArr[i][j].classNum,
                subject: timeDataArr[i][j].subject,
                prevData: JSON.stringify(timeDataArr[i][j]) !== JSON.stringify(lastTimeDataArr[i][j]) && lastTimeDataArr[i][j] ? {
                    grade: lastTimeDataArr[i][j].grade,
                    classNum: lastTimeDataArr[i][j].classNum,
                    subject: lastTimeDataArr[i][j].subject
                } : undefined
            });
        }
        finalData.timetable.push(tmpData);
        if (timeDataArr[i].length < lastTimeDataArr[i].length) {
            for (let j = timeDataArr[i].length; j < lastTimeDataArr[i].length; j++) {
                if (lastTimeDataArr[i][j]) finalData.timetable[finalData.timetable.length - 1].push({
                    grade: 0,
                    classNum: 0,
                    subject: '',
                    prevData: {
                        grade: lastTimeDataArr[i][j].grade,
                        classNum: lastTimeDataArr[i][j].classNum,
                        subject: lastTimeDataArr[i][j].subject
                    }
                });
                else finalData.timetable[finalData.timetable.length - 1].push({
                    grade: 0,
                    classNum: 0,
                    subject: '',
                    prevData: undefined
                });
            }
        }
    }
    return finalData;
}
