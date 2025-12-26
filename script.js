let userWeight;
let goal = 0;
let reminderInterval = null;
let dashoffset;
let consumed = 0;
let percent;
let days = 0;
let toggleActive = false;
const time = new Date().getHours();


const onboarding = document.querySelector(".onboarding");
const calculate = document.querySelector(".calculate");
const weight = document.querySelector(".weight");
const dashboard = document.querySelector(".dashboard");
const consumedAmt = document.querySelector(".consumed-amt");
let message = document.querySelector(".message");
const quick = document.querySelector(".quick");
const custom = document.querySelector(".custom");
const quickOpt = document.querySelector(".quick-opt");
const customOpt = document.querySelector(".custom-opt");
const history = document.querySelector(".history");
const back = document.querySelector(".back");

function getTodayKey() {
    return getLocalDateKey();
}

function loadHistory() {
    return JSON.parse(localStorage.getItem("waterHistory")) || {};
}

function saveHistory(history) {
    localStorage.setItem("waterHistory", JSON.stringify(history));
}


window.addEventListener("load", () => {

    // LOAD SAVED DATA FIRST
    userWeight = Number(localStorage.getItem("userWeight")) || 0;
    goal = Number(localStorage.getItem("goal")) || 0;
    consumed = Number(localStorage.getItem("consumed")) || 0;
    dashoffset = Number(localStorage.getItem("dashoffset")) || 628;
    percent = Number(localStorage.getItem("percent")) || 0;
    days = Number(localStorage.getItem("days")) || 0;
    toggleActive = JSON.parse(localStorage.getItem("toggle")) || false;
    if (toggleActive) {
        document.body.classList.add("dark");
    }

    resetNewDay();
    renderWeeklyBars();

    document.querySelector(".streak-counter").textContent =
        Number(localStorage.getItem("streak")) || 0;

    if (userWeight && goal) {
        onboarding.style.display = "none";
        dashboard.style.display = "block";
    }

    document.querySelector(".days-count").textContent = days;
    consumedAmt.textContent = consumed;
    document.querySelector(".goal").textContent = `GOAL: ${goal} ML`;
    document.querySelector(".progress").style.strokeDashoffset = dashoffset;

    message.innerHTML = motivationMsg(Math.round(percent * 100));
    progress();
    renderWeeklyBars();
});





//Date
const dateEl = document.querySelector('.date');
const now = new Date();
const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
};
dateEl.textContent = now.toLocaleDateString('en-US', options);

// calculate
calculate.addEventListener("click", () => {
    if (!weight.value || isNaN(weight.value)) return;
    onboarding.style.display = "none";
    dashboard.style.display = "block";

    userWeight = Number(weight.value);
    localStorage.setItem("userWeight", userWeight);

    goal = Math.floor((Number(weight.value) * 0.033) * 1000);
    consumedAmt.innerHTML = `0`;
    document.querySelector(".goal").innerHTML = `GOAL: ${goal} ML`;
    consumedAmt.textContent = "0";

    saveData();
    progress();
});

//streak
function updateDailyStreak() {
    const today = getLocalDateKey();
    let streak = Number(localStorage.getItem("streak") || 0);
    const lastdate = localStorage.getItem("lastDateOfCompletion");

    if (localStorage.getItem("streakUpdatedToday") === today) return;
    localStorage.setItem("streakUpdatedToday", today);


    if (!lastdate) {
        streak = 1;
    } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yDate = yesterday.toISOString().split('T')[0];

        if ((lastdate === today)) return
        else if (lastdate === yDate) streak++;
        else streak = 1;
    }
    days = streak;
    document.querySelector(".streak-counter").textContent = streak;
    document.querySelector(".days-count").textContent = days;

    localStorage.setItem("streak", streak);
    localStorage.setItem("lastDateOfCompletion", today);

}

//toggle theme
const toggle = document.querySelector(".toggle");
toggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("toggle", JSON.stringify(isDark));
});

//consume option
quick.addEventListener("click", () => {
    customOpt.style.display = "none";
    quickOpt.style.display = "flex";
})
custom.addEventListener("click", () => {
    quickOpt.style.display = "none";
    customOpt.style.display = "flex";
})

// quick add
const quickBtn = document.querySelectorAll(".ml");
quickBtn.forEach(button => {
    button.addEventListener("click", function () {
        let val = Number(button.dataset.value)
        const nextConsumed = consumed + val;

        if (nextConsumed >= goal) {
            consumed = goal;
        } else {
            consumed = nextConsumed;
        }

        consumedAmt.textContent = consumed;
        progress();
        saveData()
    });
});

//custom Input
const customInt = document.querySelector(".custom-input");
const customBtn = document.querySelector(".custom-btn");
customBtn.addEventListener("click", () => {
    let val = Number(customInt.value);
    if (!val || val <= 0 || goal === 0) return;
    const nextConsumed = consumed + val;

    if (nextConsumed >= goal) {
        consumed = goal;
    } else {
        consumed = nextConsumed;
    }

    consumedAmt.textContent = consumed;
    customInt.value = "";
    customInt.placeholder = "ml?";

    progress();
    saveData()
})

//progress
function progress() {
    if (goal === 0) return;

    percent = Math.min(Math.max(consumed / goal, 0), 1);
    dashoffset = 628 * (1 - percent);

    document.querySelector(".progress").style.strokeDashoffset = dashoffset;
    message.innerHTML = motivationMsg(Math.round(percent * 100));

    updateTodayHistory();

}

//update today history
function updateTodayHistory() {
    const history = loadHistory();
    const todayKey = getLocalDateKey();

    let status = "not-started";

    if (consumed > 0 && consumed < goal) status = "partial";
    if (consumed >= goal) status = "completed";

    history[todayKey] = {
        consumed,
        goal,
        status
    };

    saveHistory(history);
}


// motivation message
function motivationMsg(percentage) {

    if (percentage === 0) {
        return "Fresh start! Let's fuel your focus";
    }

    if (percentage < 25) {
        return `${percentage}% completed. Early hydration supports focus and metabolism.`;
    }

    if (percentage === 25) {
        return "25% completed. A strong start supporting energy and digestion.";
    }

    if (percentage < 50) {
        return `${percentage}% completed. Consistent hydration aids concentration.`;
    }

    if (percentage === 50) {
        return "50% completed. Hydration now supports circulation and balance.";
    }

    if (percentage < 75) {
        return `${percentage}% completed. Steady intake supports endurance and clarity.`;
    }

    if (percentage === 75) {
        return "75% completed. Hydration supports muscle recovery and joints.";
    }

    if (percentage < 100) {
        return `${percentage}% completed. Nearly there—hydration optimizes alertness.`;
    }
    if (percentage >= 100) {
        updateDailyStreak();
        return "100% completed. Hydration goal achieved for optimal daily function.";
    }
}


// reset on new day
function resetNewDay() {
    const todayKey = getLocalDateKey();
    const lastReset = localStorage.getItem("lastResetDate");

    if (lastReset !== todayKey) {
        const history = loadHistory();

        // Save yesterday's final state if it exists
        if (lastReset) {
            let yesterdayConsumed = Number(localStorage.getItem("consumed")) || 0;
            let yesterdayGoal = Number(localStorage.getItem("goal")) || 0;

            let status = "not-started";
            if (yesterdayConsumed > 0 && yesterdayConsumed < yesterdayGoal) status = "partial";
            if (yesterdayConsumed >= yesterdayGoal) status = "completed";

            history[lastReset] = {
                consumed: yesterdayConsumed,
                goal: yesterdayGoal,
                status
            };
            saveHistory(history);
        }

        // Only reset daily consumed, not userWeight or goal
        consumed = 0;
        percent = 0;
        dashoffset = 628;

        localStorage.setItem("consumed", 0);
        localStorage.setItem("percent", 0);
        localStorage.setItem("dashoffset", 628);

        // Always update lastResetDate
        localStorage.setItem("lastResetDate", todayKey);
    }
}





// history
history.addEventListener("click", () => {
    document.querySelector(".history-content").style.display = "flex";
    dashboard.style.display = "none";
    renderWeeklyBars();
});
// history back button
back.addEventListener("click", () => {
    document.querySelector(".history-content").style.display = "none";
    dashboard.style.display = "block";
});

// settings
const settings = document.querySelector(".settings");
const setting = document.querySelector(".settings-content");
settings.addEventListener("click", (e) => {
    e.stopPropagation();
    setting.style.display = setting.style.display === "block" ? "none" : "block";
});

setting.addEventListener("click", (e) => {    //click inside the should not close it
    e.stopPropagation();
});

document.addEventListener("click", () => {
    setting.style.display = "none";
})

//edit goal and weight
const goalInput = document.querySelector("#goal-input");
const weightInput = document.querySelector("#weight-input");
const change = document.querySelector(".change");

change.addEventListener("click", (e) => {
    e.stopPropagation();

    const newGoal = Number(goalInput.value);
    const newWeight = Number(weightInput.value);

    let updated = false;

    if (newWeight && newWeight > 0) {
        userWeight = newWeight;
        localStorage.setItem("userWeight", userWeight);

        goal = Math.floor(userWeight * 0.033 * 1000);
        localStorage.setItem("goal", goal);

        updated = true;
    }
    else if (newGoal && newGoal > 0) {
        goal = newGoal;
        localStorage.setItem("goal", goal);

        updated = true;
    }

    if (!updated) return;

    document.querySelector(".goal").textContent = `GOAL: ${goal} ML`;

    progress();
    saveData();

    // clear inputs
    goalInput.value = "";
    weightInput.value = "";

    setting.style.display = "none";
});


// weekly data
function renderWeeklyBars() {
    const history = loadHistory();

    const bars = document.querySelectorAll(".goal-range .bar");
    const labels = document.querySelectorAll(".goal-range .day");
    const dailyData = document.querySelector(".daily-data");

    dailyData.innerHTML = ""; // clear ONCE

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /*render WEEKLY BARS*/
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));

        const key = getLocalDateKey(d);
        const bar = bars[i];
        const label = labels[i];

        let dayData;

        if (key === getLocalDateKey()) {
            dayData = {
                consumed,
                goal,
                status:
                    consumed >= goal
                        ? "completed"
                        : consumed > 0
                        ? "partial"
                        : "not-started"
            };
        } else {
            dayData = history[key];
        }

        let percent = 0;
        let completed = false;

        if (dayData) {
            percent = dayData.goal
                ? dayData.consumed / dayData.goal
                : 0;
            completed = dayData.status === "completed";
        }

        bar.style.height = percent > 0
            ? `${Math.max(percent * 100, 4)}%`
            : "0%";

        bar.classList.toggle("active", completed);

        label.textContent = d
            .toLocaleDateString("en-US", { weekday: "short" })
            .charAt(0);
    }

    /*render DAILY CARDS*/
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i); // reverse

        const key = getLocalDateKey(d);

        let dayData;
        let isToday = i === 0;

        if (isToday) {
            dayData = {
                consumed,
                goal,
                status:
                    consumed >= goal
                        ? "completed"
                        : consumed > 0
                        ? "partial"
                        : "not-started"
            };
        } else {
            dayData = history[key];
        }

        if (dayData) {
            createElements(key, dayData, isToday);
        }
    }
}


function createElements(dayKey, dayData, isToday = false) {
    if (!dayData) return;

    const dailyData = document.querySelector(".daily-data");

    const daily = document.createElement("div");
    daily.className = "daily";

    // image
    const img = document.createElement("img");
    if (dayData.status === "completed") img.src = "./asset/check.svg";
    else if (dayData.status === "not-started") img.src = "./asset/not.svg";
    else img.src = "./asset/drop.svg";

    const imgBg = document.createElement("div");
    imgBg.className = "img-bg";
    if(dayData.status === "completed") imgBg.style.backgroundColor ="#e5f6dcff";
    imgBg.appendChild(img);

    const dayImg = document.createElement("div");
    dayImg.className = "day-img";
    dayImg.appendChild(imgBg);

    // text section
    const goalStatus = document.createElement("div");
    goalStatus.className = "goal-status";

    const dayCurrent = document.createElement("div");
    dayCurrent.className = "day-current in-daily";
    dayCurrent.textContent = isToday
        ? "Today"
        : new Date(dayKey).toLocaleDateString("en-US", { weekday: "short" });

    const goalText = document.createElement("div");
    goalText.className = "goal-text status-daily";
    goalText.textContent = `Goal : ${dayData.goal} ml`;

    goalStatus.append(dayCurrent, goalText);
    dayImg.appendChild(goalStatus);

    // progress
    const dailyProgress = document.createElement("div");
    dailyProgress.className = "daily-progress";

    const consumedWt = document.createElement("div");
    consumedWt.className = "consumed in-daily";
    consumedWt.textContent = `${dayData.consumed} ml`;

    const dailyStatus = document.createElement("div");
    dailyStatus.className = "daily-status status-daily";
    dailyStatus.textContent = dayData.status;

    dailyProgress.append(consumedWt, dailyStatus);

    daily.append(dayImg, dailyProgress);
    dailyData.appendChild(daily);
}

// local storage
function saveData() {
    localStorage.setItem("goal", goal);
    localStorage.setItem("consumed", consumed);
    localStorage.setItem("dashoffset", dashoffset)
    localStorage.setItem("percent", percent);
    localStorage.setItem("days", days);
}

// function debugHistory() {
//     const history = JSON.parse(localStorage.getItem("waterHistory")) || {};
//     console.log("Water History:", history);
//     console.log("Goal:", goal);

//     const bars = document.querySelectorAll(".goal-range .bar");
//     bars.forEach((bar, i) => {
//         console.log(`Bar ${i} height:`, bar.style.height);
//     });
// }


// local date
function getLocalDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
