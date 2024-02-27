export type Timetable = {
    lastUpdated: Date,
    timetable: Array<
        Array<{
            subject: string,
            teacher: string,
            isChanged: boolean
        }>
    >
};

export type SchoolList = Array<{
    name: string,
    code: number
}>;

export class TimetableError extends Error {
    errorCode: number;
    static errorMsgs = [
        "사이트 코드가 변경되어 정보를 가져올 수 없습니다.",
        "학년이 존재하지 않습니다.",
        "반이 존재하지 않습니다."
    ]
    constructor(code: number) {
        super(TimetableError.errorMsgs[code]);
        this.errorCode = code;
        Object.setPrototypeOf(this, TimetableError.prototype);
    }
}

export class SearchError extends Error {
    errorCode: number;
    static errorMsgs = [
        "사이트 코드가 변경되어 정보를 가져올 수 없습니다.",
        "학교가 존재하지 않습니다."
    ]
    constructor(code: number) {
        super(SearchError.errorMsgs[code]);
        this.errorCode = code;
        Object.setPrototypeOf(this, SearchError.prototype);
    }
}
