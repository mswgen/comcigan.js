import { searchSchool } from "./search.js";
import { getTimetable } from "./get.js";
import { getTeacherTimetable } from "./teacher.js";
import { getSchoolInfo } from "./info.js";
import { TimetableError, SearchError, InfoError } from "./types.js";
import type { Timetable, TeacherTimetable, SchoolList, SchoolInfo } from "./types.js";

export default { searchSchool, getTimetable, getTeacherTimetable, getSchoolInfo, TimetableError, SearchError, InfoError };
export type { Timetable, TeacherTimetable, SchoolList, SchoolInfo };
