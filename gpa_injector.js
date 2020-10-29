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

// Calculating GPA
tbody.find("tr").each(function () {
    let resultColumn = $(this).find("td").get(grade_column_idx);
    let grade = $(resultColumn).find("span").get(0).innerHTML;

    if (grade in gradings) {
        gradings[grade] += 1;
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
//insertPoint.parentNode.insertBefore(gpaTableDiv, insertPoint);
contentDiv.appendChild(gpaTableDiv);
let footer = $(gpaTableDiv).find("p").get(0);
footer.className = "";
footer.innerHTML =
    "<br><i> Calculated as grade mean using these values: A = 5, B = 4, C = 3, D = 2, E = 1 and F = 0.</i>";
let footerParent = $(gpaTableDiv).children()[0];
footerParent.removeChild(footer);

// Adding plot div
let plotDiv = document.createElement("div");
plotDiv.id = "container";
plotDiv.style = "width: 100%; height: 400px;";

contentDiv.appendChild(plotDiv);
contentDiv.appendChild(footer);
//insertPoint.parentNode.insertBefore(plotDiv, insertPoint);
//insertPoint.parentNode.insertBefore(footer, insertPoint);

var chart = new CanvasJS.Chart("container", {
    animationEnabled: true,
    theme: "light1",
    title: {
        text: "Grade distribution",
        fontFamily: "Arial, sans-serif",
    },
    axisY: {
        title: "Count",
    },
    data: [
        {
            type: "column",
            showInLegend: true,

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
chart.render();
let credits = $(".canvasjs-chart-credit").get(0);
credits.parentNode.removeChild(credits);

// Setting eventlistener to togglbutton
toggleButton.onclick = function (event) {
    toggle = !toggle;
    let buttonText = toggle ? "Hide" : "Show";
    let display = toggle ? "display: block;" : "display: none;";
    contentDiv.style = `width: 100%; height: 550px; ${display}`;
    toggleSpan.innerHTML = `${buttonText} GPA and Grade Distribution <br>`;
    chart.render();
};
