export type Timetable = {
    lastUpdated: Date,
    timetable: Array<
        Array<{
            subject: string,
            teacher: string,
            prevData?: {
                subject: string,
                teacher: string
            }
        }>
    >
};

export type SchoolInfo = {
    lastUpdated: Date,
    data: {
        code: number,
        grades: number,
        classes: number
    }
};

export type SchoolList = Array<{
    name: string,
    code: number
}>;

export class TimetableError extends Error {
    errorCode: number;
    static errorMsgs = [
        "Comcigan site has been updated and this module is not compatible with the new site.",
        "School does not exist.",
        "Grade does not exist.",
        "Class does not exist.",
    ]
    constructor(code: number) {
        super(TimetableError.errorMsgs[code]);
        this.errorCode = code + 1;
        Object.setPrototypeOf(this, TimetableError.prototype);
    }
}

export class InfoError extends Error {
    errorCode: number;
    static errorMsgs = [
        "Comcigan site has been updated and this module is not compatible with the new site.",
        "School does not exist."
    ]
    constructor(code: number) {
        super(TimetableError.errorMsgs[code]);
        this.errorCode = code + 1;
        Object.setPrototypeOf(this, TimetableError.prototype);
    }
}

export class SearchError extends Error {
    errorCode: number;
    static errorMsgs = [
        "Comcigan site has been updated and this module is not compatible with the new site.",
        "School does not exist."
    ]
    constructor(code: number) {
        super(SearchError.errorMsgs[code]);
        this.errorCode = code + 1;
        Object.setPrototypeOf(this, SearchError.prototype);
    }
}
