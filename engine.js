import data from "./USCIS_CivicsQuestionsAndAnswers_2008.json" with { type: "json" };

document.getElementById("info").innerHTML = "<details><summary>Information</summary><p>"+data.meta.about.split("\n\n").join("</p><p>") +
    "</p><p class='starred-only'><input type='checkbox' id='starred-only' name='starred-only'><label for='starred-only'" +
    "> Are you a 20+ year U.S. resident who's &ge;65 years old? (Check the box, if so.)</label></p></details>";

const progressEl = document.getElementById("progress");
const qaEl = document.getElementById("qa");
const colorMap = data.meta.color_map;
const pool = { all: [], starred: [] };
let whichPool, question;

function init() {
    question = [];
    pool.all = [];
    pool.starred = [];
    let areas = {};
    let areas_i = {}, ai = 0;
    let css = "";
    for (const [i, q] of data.question_pool.entries()) {
        let area = `${q.category}: ${q.subcategory}`;
        question.push({
            area: area,
            question: q.question,
            answer: q.answer.replaceAll("\n", "<br/>")
        });
        pool.all.push(i);
        if (q.starred)
            pool.starred.push(i);
        if (!(area in areas))
            areas[area] = [];
        areas[area].push(i);
        if (!(area in areas_i)) {
            areas_i[area] = ai;
            css += `.a_${ai} { border-color: ${colorMap[area]}; }\n`;
            css += `.a_${ai} > div { background-color: ${colorMap[area]}; }\n`;
            ai++;
        }
    }

    whichPool = "all";
    let htm = "";
    for (const [i, q] of question.entries()) {
        let classes = ["qbox", `a_${areas_i[q.area]}`];
        if (pool.starred.includes(i))
            classes.push("starred");
        htm += `<div id="q_${i}" class="${classes.join(' ')}"><div>&nbsp;</div></div>`;
    }
    progressEl.innerHTML = `<p>Progress</p><div>${htm}</div>`;

    // head = document.head || document.getElementsByTagName('head')[0],
    let style = document.createElement('style');
    document.head.appendChild(style);
    // style.type = 'text/css';
    // if (style.styleSheet)
    //     style.styleSheet.cssText = css; // This is required for IE8 and below.
    // else
        style.appendChild(document.createTextNode(css));

    document.getElementById("starred-only").addEventListener('click', () => {
        if (document.getElementById("starred-only").checked) {
            whichPool = "starred";
            for (const e of document.getElementsByClassName("qbox")) {
                e.classList.add("hide-unstarred");
            }
        } else {
            whichPool = "all";
            for (const e of document.getElementsByClassName("qbox")) {
                e.classList.remove("hide-unstarred");
            }
        }
        if (pool.starred.length == 0)
            selectQuestion();
    });
}

function displayQuestion(qn) {
    qaEl.innerHTML = `<details><summary>(${qn+1}) ${question[qn].area}<br><h3>${question[qn].question}</h3></summary>${question[qn].answer}<br><br><button id='btn--next'>Next</button></details>`;
    document.getElementById('btn--next').addEventListener('click', () => {
        document.getElementById(`q_${qn}`).classList.add('answered');
        Object.keys(pool).forEach(k => {
            const i = pool[k].indexOf(qn);
            if (i !== -1)
                pool[k].splice(i, 1);
        });
        selectQuestion();
    });
}

function selectQuestion() {
    if (pool[whichPool].length > 0) {
        displayQuestion(pool[whichPool][Math.floor(Math.random() * pool[whichPool].length)]);
    } else {
        qaEl.innerHTML = "You've answered all the questions! Refresh the page to start over.";
    }
}

window.onload = () => {
    init();
    selectQuestion();
};
// "category": "AMERICAN GOVERNMENT",
// "subcategory": "Principles of American Democracy",
// "question": "What is the supreme law of the land?",
// "answer": "▪ the Constitution",
// "starred": false

