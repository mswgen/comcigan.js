import { searchSchool } from "./search";
import { getTimetable } from "./get";
import { TimetableError, SearchError } from "./types";
import type { Timetable } from "./types";

export default { searchSchool, getTimetable, TimetableError, SearchError };
export type { Timetable };