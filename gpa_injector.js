/*
  Description:
    - Caculates GPA in Studentweb from Results-page. 
    - Creates table with GPA together with a plot with student's grade distribution.
*/

// Set logo to active
console.log("GPA Injector Active");
chrome.runtime.sendMessage({ newIconPath: "icons/active/icon-32.png" });

// Variables custom to the site
let grade_column_idx = 5;
let semester_column_idx = 0;
let course_column_idx = 1;
let result_tag = "table";
let toggle = false;

// Inserting content div
let insertPoint = $("form").get(1);
let contentDiv = document.createElement("div");
contentDiv.className = "gpa-content";
contentDiv.style = "width: 100%; display: none;";
insertPoint.parentNode.insertBefore(contentDiv, insertPoint);

var tables = $(result_tag);
var results = tables.get(1);
var tbody = $(results.tBodies[0]);

let totalGrades = 0;
const gradings = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
};

const gradingPoints = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
    F: 0,
};

grades = {};

// Calculating GPA
$(tbody.find("tr").get().reverse()).each(function () {
    let resultColumn = $(this).find("td").get(grade_column_idx);
    let grade = $(resultColumn).find("span").get(0).innerHTML;

    if (grade in gradings) {
        gradings[grade] += 1;

        // Add grading to semester
        let semesterColumn = $(this).find("td").get(semester_column_idx);
        let semester = $(semesterColumn).find("div").get(2).innerHTML;

        let courseColumn = $(this).find("td").get(course_column_idx);
        let courseCode = $(courseColumn).find("div div").get(1).innerHTML;
        let courseName = $(courseColumn).find("div div").get(2).innerHTML;

        let gradeDict = {
            y: gradingPoints[grade],
            x: totalGrades,
            label: `${courseCode} ${courseName}`,
        };
        if (semester in grades) {
            grades[semester].push(gradeDict);
        } else {
            grades[semester] = [gradeDict];
        }
        totalGrades += 1;
    }
});

let gpa = 0;
for (const [grade, value] of Object.entries(gradings)) {
    gpa += gradingPoints[grade] * value;
}

gpa = gpa / totalGrades;

// Adding toggle button
let toggleButton = document.createElement("button");
let toggleSpan = document.createElement("span");
toggleSpan.innerHTML = "Show GPA and Grade Distribution <br> ";
toggleButton.style =
    "height: 60px; width: 100%; color: black; margin-bottom: 10px;";
toggleButton.appendChild(toggleSpan);

contentDiv.parentNode.insertBefore(toggleButton, contentDiv);

// Creating GPA Table
const gpaTableDiv = $(results.parentNode.parentNode).clone().get(0);
const gpaTable = $(gpaTableDiv).find("table").get(0);

// Removing possible external results
const externalResult = $(gpaTableDiv).children()[1];
if (externalResult) gpaTableDiv.removeChild(externalResult);

gpaTable.removeChild(gpaTable.getElementsByTagName("tbody")[0]);

$(gpaTable.caption).find("div").get(0).innerHTML = "Gjennomsnittskarakter";
let thead = $(gpaTable).find("thead").get(0);

let theadContent = $(thead).find("tr").get(0);
$(theadContent).empty();

let th1 = document.createElement("th");
th1.innerHTML = "GPA";

let th2 = document.createElement("th");
th2.innerHTML = `${gpa.toFixed(3)} / 5.0`;

theadContent.appendChild(th1);
theadContent.appendChild(th2);

// Removing native footer on tables
contentDiv.appendChild(gpaTableDiv);
let footer = $(gpaTableDiv).find("p").get(0);
footer.className = "";
footer.innerHTML =
    "<br><i> Calculated as grade mean using these values: A = 5, B = 4, C = 3, D = 2, E = 1 and F = 0.</i>";
let footerParent = $(gpaTableDiv).children()[0];
footerParent.removeChild(footer);

// Plotting grades over time
let lineplotDiv = document.createElement("div");
lineplotDiv.id = "container2";
lineplotDiv.style = "width: 100%; height: 400px;";

contentDiv.appendChild(lineplotDiv);
gradeToLabelDict = {
    6: "",
    5: "A",
    4: "B",
    3: "C",
    2: "D",
    1: "E",
    0: "E",
};

values = Object.values(grades).flat();
stripLines = Object.values(grades).map((gradeList, index, array) => {
    let start_idx = array.slice(0, index).flat().length;
    let end_idx = start_idx + gradeList.length;
    let color = index % 2 === 0 ? "rgba(1,77,101,.1)" : "#FFFF";
    return {
        startValue: start_idx - 0.5,
        endValue: end_idx - 0.5,
        color: color,
        labelBackgroundColor: "transparent",
        labelFontColor: "gray",
        labelPlacement: "inside",
        labelAlign: "center",
        label: Object.keys(grades)[index],
    };
});

console.log(grades);

var linechart = new CanvasJS.Chart("container2", {
    animationEnabled: true,
    theme: "light2",
    title: {
        text: "Grades over time",
        fontSize: 20,
        fontFamily: "Arial, sans-serif",
    },
    axisX: {
        minimum: -0.5,
        interval: 1,
        title: "",
        stripLines: stripLines,
        labelFormatter: function (e) {
            if (e.value > -1 && e.value < values.length) {
                return values[e.value].label.split(" ")[0];
            }
            return "";
        },
    },
    axisY: {
        interval: 1,
        minimum: 0,
        maximum: 6,
        margin: 30,
        labelFormatter: function (e) {
            return gradeToLabelDict[e.value];
        },
    },
    data: [
        {
            type: "line",
            indexLabelFontSize: 16,
            dataPoints: values,
        },
    ],
    toolTip: {
        contentFormatter: function (e) {
            let y = gradeToLabelDict[e.entries[0].dataPoint.y];
            let x = values[e.entries[0].dataPoint.x].label;
            return `${x}: ${y}`;
        },
    },
});
linechart.render();

// Adding distribution plot div
let plotDiv = document.createElement("div");
plotDiv.id = "container";
plotDiv.style = "width: 100%; height: 400px; margin-top: 20px;";
contentDiv.appendChild(plotDiv);
contentDiv.appendChild(footer);

var barchart = new CanvasJS.Chart("container", {
    animationEnabled: true,
    theme: "light2",
    title: {
        text: "Grade distribution",
        fontSize: 20,
        fontFamily: "Arial, sans-serif",
    },
    axisY: {
        title: "Count",
    },
    data: [
        {
            type: "column",
            showInLegend: false,

            color: "#015C6F",
            legendText: "Count",
            dataPoints: [
                { y: gradings.A, label: "A" },
                { y: gradings.B, label: "B" },
                { y: gradings.C, label: "C" },
                { y: gradings.D, label: "D" },
                { y: gradings.E, label: "E" },
                { y: gradings.F, label: "F" },
            ],
        },
    ],
});
barchart.render();
let credits = $(".canvasjs-chart-credit").get(0);
credits.parentNode.removeChild(credits);

// Setting eventlistener to togglbutton
toggleButton.onclick = function (event) {
    toggle = !toggle;
    let buttonText = toggle ? "Hide" : "Show";
    let display = toggle ? "display: block;" : "display: none;";
    contentDiv.style = `width: 100%; height: 950px; ${display}`;
    toggleSpan.innerHTML = `${buttonText} GPA and Grade Distribution <br>`;
    barchart.render();
    linechart.render();
};
