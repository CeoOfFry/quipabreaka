console.clear();

let L = window.location.href
    .replace("/en/exams", "/qlearn/v1/schedule")
    .split("/questions")[0] + "/usage";

let H = new Headers({
    "Authorization": "Token xd31sYEPWvR+ZWzJlLoMMqTr2XooH2uRZ5zKHDSkRyppdEB4116XvMRUp+RC3/6h1hbRzD/la4+pK6/4WeCVxw=="
});

let R = await fetch(L,
    {
        headers: H,
        method: "GET"
    });

let O = await R.json();
let o = O[0];

console.log("[" + L + "]\n\n");
console.log("-\n\n[" + o.name + "]");

let wr = "[❌ incorrectly answered questions]: \n";
let un = "[unanswered questions]: \n";
for (let i = 0; i < Object.keys(o.last_attempt_scores).length; i++) {
    let _a = o.last_attempt_scores[i];

    console.log(i + 1,
        (_a == "previously_correct" ? "✔️ correct" :
            _a == "incorrect" ? "❌ wrong" :
                _a == null ? "[unanswered]" :
                    null)
    );

    if (_a == "incorrect") {
        wr = wr + (i + 1).toString() + "\n";
    }
    else if (_a == null) {
        un = un + (i + 1).toString() + "\n";
    }
}


console.log(
    "\n| current %", o.correct_percent,
    "\n| answered questions", o.questions_answered_count, "/", o.questions_count,
    "\n| correctly answered questions", o.questions_answered_count * (o.correct_percent / 100), "/", o.questions_count
);

if (wr != "[❌ incorrectly answered questions]: \n") console.log("\n" + wr);
if (un != "[unanswered questions]: \n") console.log("\n" + un);