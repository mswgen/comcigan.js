# comcigan.js
## JavaScript용 컴시간 파싱 라이브러리
[컴시간](http://112.186.146.81:4082/st)을 사용하는 학교의 시간표를 파싱하는 라이브러리입니다.

[컴시간 뷰어](https://comci.eastus.cloudapp.azure.com)([소스 코드](https://github.com/mswgen/comci-viewer))는 이 라이브러리를 사용하여 만들어졌습니다.

## 설치 방법
NPM을 사용하는 경우
```bash
npm i --save comcigan.js
```
Yarn을 사용하는 경우
```bash
yarn add comcigan.js
```

## 사용법
### 학교 검색하기
컴시간은 내부적으로 학교 코드를 사용하여 시간표를 가져옵니다. `searchSchool` 함수를 사용하여 학교를 검색할 수 있습니다.

```javascript
searchSchool(schoolName: string): Promise<schoolList>
```

#### 파라미터
- `schoolName`(`string`): 학교 이름
#### 반환값(Promise)
- `schoolList`: 학교 목록 배열
  - `name`(`string`): 학교 이름
  - `code`(`number`): 학교 코드
```javascript
import comcigan from 'comcigan.js';
comcigan.searchSchool('학교 이름').then(schools => {
  console.log(schools[0].name); // 첫 번째 학교의 이름
  console.log(schools[0].code); // 첫 번째 학교의 코드
});
```
### 학교 정보 가져오기
`getSchoolInfo` 함수를 사용하여 학교 정보를 가져올 수 있습니다.

```javascript
getSchoolInfo(schoolCode: number): Promise<SchoolInfo>
```

#### 파라미터
- `schoolCode`(`number`): 학교 코드
#### 반환값(Promise)
- `schoolInfo`: 학교 정보
  - `lastUpdated`(`Date`): 마지막 업데이트 시각
  - `grades`(`number`): 학년 수
  - `classes`(`number[]`): 각 학년별 학급 수
  - `teachers`(`string[]`): 교사 이름 목록
```javascript
import comcigan from 'comcigan.js';
comcigan.getSchoolInfo(12345).then(info => {
  console.log(info.lastUpdated); // 마지막 업데이트 시각
  console.log(info.grades); // 학년 수
  console.log(info.classes); // 각 학년별 학급 수
  console.log(info.teachers[0]); // 첫 번째 교사 이름
});
```
### 시간표 가져오기
`getTimetable` 함수를 사용하여 시간표를 가져올 수 있습니다.

```javascript
getTimetable(schoolCode: number, grade: number, classNum: number): Promise<Timetable>
```

#### 파라미터
- `schoolCode`(`number`): 학교 코드
- `grade`(`number`): 학년
- `classNum`(`number`): 반
#### 반환값(Promise)
- `Timetable`: 학교 정보
  - `lastUpdated`(`Date`): 마지막 업데이트 시각
  - `date`: 시간표 날짜
    - `start`(`[number, number, number]`): 시작 날짜(연, 월, 일 순서, 보통 월요일)
    - `end`(`[number, number, number]`): 끝 날짜(보통 금요일)
  - `timetable`: 시간표 배열의 배열
    - `(Array)`: 요일별 시간표 배열
      - `subject`(`string`): 과목
      - `teacher`(`string`): 교사 이름
      - `prevData?`: 마지막 변경 전 데이터
        - `subject`(`string`): 과목
        - `teacher`(`string`): 교사 이름
    
```javascript
import comcigan from 'comcigan.js';
comcigan.getTimetable(12345, 1, 1).then(timetable => {
  console.log(timetable.lastUpdated); // 마지막 업데이트 시각
  console.log(timetable.date.start); // 시작 날짜
  console.log(timetable.date.end); // 끝 날짜
  console.log(timetable.timetable[0][0].subject); // 월요일 1교시 과목
  console.log(timetable.timetable[0][0].teacher); // 월요일 1교시 교사 이름
  if (timetable.timetable[0][0].prevData) { // 이전 데이터가 있는 경우
    console.log(timetable.timetable[0][0].prevData.subject); // 월요일 1교시 과목(이전 데이터)
    console.log(timetable.timetable[0][0].prevData.teacher); // 월요일 1교시 교사 이름(이전 데이터)
  }
});
```
### 교사 시간표 가져오기
`getTeacherTimetable` 함수를 사용하여 시간표를 가져올 수 있습니다.

```javascript
getTeacherTimetable(schoolCode: number, teacher: number): Promise<TeacherTimetable>
```

#### 파라미터
- `schoolCode`(`number`): 학교 코드
- `teacher`(`number`): 교사 코드
#### 반환값(Promise)
- `TeacherTimetable`: 학교 정보
  - `lastUpdated`(`Date`): 마지막 업데이트 시각
  - `date`: 시간표 날짜
    - `start`(`[number, number, number]`): 시작 날짜(연, 월, 일 순서, 보통 월요일)
    - `end`(`[number, number, number]`): 끝 날짜(보통 금요일)
  - `timetable`: 시간표 배열의 배열
    - `(Array)`: 요일별 시간표 배열
      - `grade`(`number`): 학년
      - `classNum`(`number`): 반
      - `subject`(`string`): 과목
      - `prevData?`: 마지막 변경 전 데이터
        - `grade`(`number`): 학년
        - `classNum`(`number`): 반
        - `subject`(`string`): 과목
    
```javascript
import comcigan from 'comcigan.js';
comcigan.getTeacherTimetable(12345, 1).then(timetable => {
  console.log(timetable.lastUpdated); // 마지막 업데이트 시각
  console.log(timetable.date.start); // 시작 날짜
  console.log(timetable.date.end); // 끝 날짜
  if (timetable.timetable[0][0]) { // 월요일 1교시에 수업이 있는 경우
    console.log(timetable.timetable[0][0].grade); // 월요일 1교시 학년
    console.log(timetable.timetable[0][0].classNum); // 월요일 1교시 반
    console.log(timetable.timetable[0][0].subject); // 월요일 1교시 과목
    if (timetable.timetable[0][0].prevData) { // 이전 데이터가 있는 경우
      console.log(timetable.timetable[0][0].prevData.grade); // 월요일 1교시 학년(이전 데이터)
      console.log(timetable.timetable[0][0].prevData.classNum); // 월요일 1교시 반(이전 데이터)
      console.log(timetable.timetable[0][0].prevData.subject); // 월요일 1교시 과목(이전 데이터)
    }
  }
});
```