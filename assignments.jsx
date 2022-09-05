let url = window.location.href

function correctSite() {
	let correct = true;

	if (!url.includes("learn.quipper.com")) {
		alert("What are you doing?!?!\n\nThis script is supposed to be run on learn.quipper.com!");
		correct = false;
		throw new Error("This script is supposed to be run on learn.quipper.com!");
	}
	else if (!url.includes("/en/assignments")) {
		alert("This script will only work on assignments (still incompatible with exams)\n\nRun the script on the page of any assignment");
		correct = false;
		throw new Error("Run the script on the page of any assignment");
	}
	else if (!url.includes("topics") || !url.includes("/questions")) {
		alert("Re-run the script on the page of the first question");
		correct = false;
		throw new Error("Re-run the script on the page of the first question");
	}

	return correct;
}

async function answer() {
	//@ts-check

	correctSite()
	console.clear();

	let link = url
		.replace("/en/assignments", "/qlearn/v1/schedule")
		.replace("topics", "topic")
		.split("/questions")[0] + "/contents";

	let headers = new Headers({
		"Authorization": "Token 8QvdupAhRlEdE457u8RhnvK5FKX7zjKH4gPBCKH2xHQ9paDflu5I6vMxhtn-5Eozoy-zFr4HMNCgIsnTpfcSVg=="
	});

	// @ts-ignore
	let response = await fetch(link,
		{
			headers: headers,
			method: "GET"
		});

	let quickMode = false;
	// @ts-ignore
	quickMode = prompt(
		"Use quick mode?"
		+ "\n"
		+ "\nQuick mode will only show what you need: the number of questions with their correct answer(s)"
		+ "\n> Useful for rushing the assignment"
		+ "\n"
		+ "\n(Type y or n)"
	).toLowerCase() == "y";

	// @ts-ignore
	let includeSearch = quickMode ? false : prompt(
		"Inlude search results?"
		+ "\n"
		+ "\nEnabling this will include links to google search results of each question. Not reliable in every case"
		+ "\n> Useful for learning the question/answer's topic"
		+ "\n"
		+ "\n(Type y or n)"
	).toLowerCase() == "y";

	// @ts-ignore
	let ct = await response.json();

	let qShuffled = ct.shuffle_questions;
	if (qShuffled) {
		console.log("%c[!] WARNING: For this specific assignment, all questions are shuffled [!]\n[Question numbers may not be accurate]", "color: #9980FF");
	}

	console.log("[" + link + "]\n\n");
	console.log("-\n\n[" + ct.name + "]");

	for (let i = 0; i < ct.number_of_questions; i++) {

		let _q = ct.questions[i];

		if (quickMode) {
			console.log("\n", (i + 1), ":")

			switch (_q.answer_type) {
				case "multiple_choice":
					{
						for (let j = 0; j < Object.keys(_q.choices).length; j++) {

							let _ch = _q.choices[j];

							if (_ch.correct) {
								let _t = _ch.body[0].text;

								if (isChImgLnk(_t)) {
									console.log("   | ");
									logImage(cleanChImgLnk(_t));
								}
								else {
									console.log("   | " + clean(_t));
								}
							}
						}
					}
					break;

				case "exact_value":
					{
						let _ch = _q.choices[0]
						let l = Object.keys(_ch.alternatives).length;

						if (l > 1) {
							console.log("   [", l, "valid answers ]:")
							for (let j = 0; j < l; j++) {

								let _alt = _ch.alternatives[j];
								console.log("   " + "%c%s", "color: #9980FF", _alt.text.trim());
							}
						}
						else {
							console.log("   " + "%c%s", "color: #9980FF", _ch.alternatives[0].text.trim());
						}

						console.log("\n   [Case sensitive: " + (_q.case_sensitive ? "yes" : "no") + "]");
					}
					break;

				case "grouped_choices":
					{
						for (let j = 0; j < Object.keys(_q.choices).length; j++) {

							let _ch = _q.choices[j];

							for (let k = 0; k < Object.keys(_q.answer_categories).length; k++) {

								let _cat = _q.answer_categories[k];

								if (_ch.answer_category_id == _cat.id && _ch.correct) {
									console.log("   " + clean(_cat.section.text) + " :");
									console.log("        | " + "%c%s", "color: #9980FF", _ch.body[0].text.trim());
								}
							}
						}
					}
					break;

				case "correct_order":
					{
						for (let j = 0; j < Object.keys(_q.choices).length; j++) {

							let _ch = _q.choices[j];

							console.log("  ", (j + 1), clean(_ch.body[0].text));
						}
					}
					break;

				case "categorise":
					{
						for (let j = 0; j < Object.keys(_q.choices).length; j++) {

							let _ch = _q.choices[j];

							for (let z = 0; z < Object.keys(_q.answer_categories).length; z++) {

								let _cat = _q.answer_categories[z];
								if (_cat.id == _ch.answer_category_id) {
									console.log("   " + clean(_ch.body[0].text) + " :");
									console.log("        | " + "%c%s", "color: #9980FF", _cat.section.text.trim());
								}
							}
						}
					}
					break;

				default:
					{
						console.log("	Question type either invalid or unsupported by the script.");
					}
					break;
			}
		}
		else {
			console.log(
				"\nQ", (i + 1), "/ " + (ct.number_of_questions), "(" + _q.answer_type + ")" +
				(includeSearch ? " [" + "https://www.google.com/search?q=" + encodeURI(clean(_q.plain_text)) + "]" : "") +
				"\n" + clean(_q.plain_text)
			);

			switch (_q.answer_type) {
				case "multiple_choice":
					{
						for (let j = 0; j < Object.keys(_q.choices).length; j++) {

							let _ch = _q.choices[j];
							let _t = _ch.body[0].text;

							if (isChImgLnk(_t)) {
								if (_ch.correct) {
									console.log("%cc  ", "color: #9980FF", "|");
								}
								else {
									console.log("w	|");
								}
								logImage(cleanChImgLnk(_t));
							}
							else {
								if (_ch.correct) {
									console.log("%cc  ", "color: #9980FF", "|", clean(_t));
								}
								else {
									console.log("w	|", clean(_t));
								}
							}
						}
					}
					break;

				case "exact_value":
					{
						let _ch = _q.choices[0]
						let l = Object.keys(_ch.alternatives).length;

						if (l > 1) {
							console.log("   [", l, "valid answers ]:")
							for (let j = 0; j < l; j++) {

								let _alt = _ch.alternatives[j];
								console.log("   " + "%c%s", "color: #9980FF", _alt.text.trim());
							}
						}
						else {
							console.log("   " + "%c%s", "color: #9980FF", _ch.alternatives[0].text.trim());
						}

						console.log("\n   [Case sensitive: " + (_q.case_sensitive ? "yes" : "no") + "]");
					}
					break;

				case "grouped_choices":
					{
						console.log("	Question type still unsupported.");
					}
					break;

				case "correct_order":
					{
						console.log("	 [Arrange the items in this order]");
						for (let j = 0; j < Object.keys(_q.choices).length; j++) {

							let _ch = _q.choices[j];

							console.log("	", (j + 1), clean(_ch.body[0].text));
						}
					}
					break;

				case "categorise":
					{
						for (let j = 0; j < Object.keys(_q.choices).length; j++) {

							let _ch = _q.choices[j];

							for (let z = 0; z < Object.keys(_q.answer_categories).length; z++) {

								let _cat = _q.answer_categories[z];
								if (_cat.id == _ch.answer_category_id) {
									console.log("   " + clean(_ch.body[0].text) + " :");
									console.log("        | " + "%c%s", "color: #9980FF", _cat.section.text.trim());
								}
							}
						}
					}
					break;

				default:
					{
						console.log("	Question type either invalid or unsupported.");
					}
					break;
			}

			if (Object.keys(_q.explanation).length > 0) {
				let exp = clean(_q.explanation[0].text);
				console.log("\n> " + "%cExplanation:", "color: #707070", exp);
			}
		}
	}

	function removedHtml(str) {
		var div = document.createElement("div");
		div.innerHTML = str;
		return div.innerText;
	}

	function manageMath(str) {
		return str
			.replace(/\\lt/g, " < ")
			.replace(/\\gt/g, " > ")
			.replace(/=/g, " = ")
			.replace(/\\cdots/g, "...")
			.replace(/\\times/g, " x ");
	}

	function clean(str) {
		return removedHtml(manageMath(str)
			.replace(/\[%/g, "")
			.replace(/%\]/g, "")
			.replace(/\s+\./g, ".")
			.replace(/,/g, ", ")
			.replace(/\s+\,/g, ",")
		)
			.replace(/\s+/g, " ")
			.trim();
	}

	function isChImgLnk(str) {
		return str.includes("![") && str.includes("](") && str.includes("http");
	}
	function cleanChImgLnk(str) {
		return str.split("](")[1].replace(")", "");
	}

	function logImage(url) {
		console.log("%c                                                                             ",
			"font-size:1px; " +
			"padding: " + 25 + "px " + 25 + "px;" +
			"background:url(" + url + ") no-repeat;" +
			"background-size: contain;");
	}

	console.log("\n%c[!] Warning: choices may not be in corresponding order [!]", "color: #9980FF");
	console.log("[:_____script_made_with_anger_by_jvd_____:]");
	console.log("%c[This script is not finished, some questions and assignment types (like exams) might not be supported yet]", "color: #707070");
}

function start() {
	if (correctSite()) {
		answer();
	}
}

start();