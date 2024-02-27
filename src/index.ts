import { searchSchool } from "./search.js";
import { getTimetable } from "./get.js";
import { TimetableError, SearchError } from "./types.js";
import type { Timetable, SchoolList } from "./types.js";

export default { searchSchool, getTimetable, TimetableError, SearchError };
export type { Timetable, SchoolList };
