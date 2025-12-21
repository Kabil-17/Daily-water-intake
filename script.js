let userWeight;
let goal = 0;
let reminderInterval = null;
let dashoffset;
let consumed = 0;
let percent;
let days = 0;
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

window.addEventListener("load", () => {
    resetNewDay();
    const savedWeight = Number(localStorage.getItem("userWeight")) || 0;
    userWeight = savedWeight;

    const savedStreak = Number(localStorage.getItem("streak")) || 0;
    const savedGoal = Number(localStorage.getItem("goal")) || 0;
    const savedConsume = Number(localStorage.getItem("consumed")) || 0;
    const savedDashoffset = Number(localStorage.getItem("dashoffset")) || 628;
    const savedPercent = Number(localStorage.getItem("percent")) || 0;
    const savedDays = Number(localStorage.getItem("days"));
    document.querySelector(".streak-counter").textContent = savedStreak;


    goal = savedGoal;
    if (userWeight && goal) {
        onboarding.style.display = "none";
        dashboard.style.display = "block";
    }
    consumed = savedConsume;
    dashoffset = savedDashoffset;
    percent = savedPercent;
    days = savedDays;

    document.querySelector(".days-count").innerHTML = days;

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
    const today = new Date().toISOString().split('T')[0];
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
    document.body.classList.toggle("dark");
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
    message.innerHTML = motivationMsg(Math.round(percent * 100));
    dashoffset = 628 * (1 - percent);
    document.querySelector(".progress").style.strokeDashoffset = `${dashoffset}`;
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
    const today = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem("lastResetDate");

    if (lastReset && lastReset !== today) {
        saveDailyHistory();
    }

    if (lastReset !== today) {
        consumed = 0;
        percent = 0;
        dashoffset = 628;

        localStorage.setItem("consumed", 0);
        localStorage.setItem("percent", 0);
        localStorage.setItem("dashoffset", 628);
        localStorage.setItem("lastResetDate", today);
        // renderWeeklyBars();
    }
}

// history
history.addEventListener("click", () => {
    document.querySelector(".history-content").style.display = "flex";
    dashboard.style.display = "none";
    renderWeeklyBars();
})

back.addEventListener("click", () => {
    document.querySelector(".history-content").style.display = "none";
    dashboard.style.display = "block";

})

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




// save daily history
function saveDailyHistory() {
    const date = new Date();
    date.setDate(date.getDate() - 1); // yesterday

    const key = date.toISOString().split("T")[0];
    const history = JSON.parse(localStorage.getItem("waterHistory")) || {};

    history[key] = {
        consumed,
        goal
    };
    localStorage.setItem("waterHistory", JSON.stringify(history));
}


function renderWeeklyBars() {
    if (!goal) return;
    const history = JSON.parse(localStorage.getItem("waterHistory")) || {};
    const bars = document.querySelectorAll(".goal-range .bar");

    const today = new Date();

    // loop last 7 days (oldest → today)
    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);

        const dateKey = day.toISOString().split("T")[0];
        const dayData = history[dateKey];
        const percent = dayData
            ? Math.min(dayData.consumed / dayData.goal, 1): 0;

        const bar = bars[6 - i]; // left → right mapping
        bar.style.height = `${percent * 100}%`;

        bar.style.background = percent >= 1 ? "#2563eb" : "#dbeafe";
    }
}



// local storage
function saveData() {
    localStorage.setItem("goal", goal);
    localStorage.setItem("consumed", consumed);
    localStorage.setItem("dashoffset", dashoffset)
    localStorage.setItem("percent", percent);
    localStorage.setItem("days", days);
}