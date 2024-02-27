import { searchSchool } from "./search.js";
import { getTimetable } from "./get.js";
import { getSchoolInfo } from "./info.js";
import { TimetableError, SearchError, InfoError } from "./types.js";
import type { Timetable, SchoolList, SchoolInfo } from "./types.js";

export default { searchSchool, getTimetable, getSchoolInfo, TimetableError, SearchError, InfoError };
export type { Timetable, SchoolList, SchoolInfo };
