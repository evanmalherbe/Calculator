
// Variables
let valueObject = { "value1": undefined, "value2": undefined, "operator": undefined, "answer": undefined, "hasPeriodValue1": false, "hasPeriodValue2": false };
let $displayArea = $("#displayArea");
let $userMessage = $("#message");

$('.calculator-button').on('click', function (event)
{
	// Stop the browser from executing its default action (like 'Touch to Search')
	// This is the key fix for the mobile issue!
	event.preventDefault();

	// Optional: Stop the event from bubbling up the DOM tree,
	// which can also help prevent unintended interactions.
	event.stopPropagation();
});

// listen for user keyboard key presses
$(document).on('keydown', function (event)
{
	handleKeyPress(event, event.key);
});

function handleKeyPress(event, key)
{
	if (key === 'Enter' || key === 'NumpadEnter' || key === '=' || key === "Backspace")
	{
		// Prevents a form submission that enter might cause. Backspace can make browser navigate to previous page in history
		event.preventDefault();
	}
	renderClick(key);
}
function displayUserMessage(msg)
{
	$userMessage.empty().append(`<span id='error-message' class='text-danger d-flex justify-content-end'>${msg}</span>`);
}
function calculateAnswer(operator)
{
	let innerOperator = valueObject.operator;
	let value1 = Number(valueObject.value1);
	let value2 = Number(valueObject.value2);
	let isInvalid = false;
	if (operator === ".")
	{
		//valueObject.value2 += operator;
		valueObject.hasPeriodValue2 = true;
		$displayArea.append(operator);
		return;
	}

	// Addition
	if (innerOperator == "+")
	{
		let tempAnswer = value1 + value2;
		valueObject.answer = parseFloat(tempAnswer.toFixed(4)).toString();
	}
	else if (innerOperator == "-")
	{
		// Subtraction
		if (value1 < value2)
		{
			// invalid operation
			displayUserMessage("Invalid operation");
			isInvalid = true;
		}
		else
		{
			let tempAnswer = value1 - value2;
			valueObject.answer = parseFloat(tempAnswer.toFixed(4)).toString();
		}
	}
	else if (innerOperator == "*")
	{
		// Multiplication
		let tempAnswer = value1 * value2;
		valueObject.answer = parseFloat(tempAnswer.toFixed(4)).toString();
	}
	else if (innerOperator == "/")
	{
		// Division
		if (value2 == 0)
		{
			// invalid operation
			displayUserMessage("Invalid operation: can't divide by zero");
			isInvalid = true;
		}
		else
		{
			// convert numbers to floating point numbers before division, otherwise answers less than one (e.g. 0.89) are displayed as 0
			value1 = parseFloat(value1);
			value2 = parseFloat(value2);
			valueObject.answer = parseFloat((value1 / value2).toFixed(4)).toString();
		}
	}
	if (!isInvalid)
	{
		// if is a valid calculation
		// save answer value to object and clear other values
		valueObject.value1 = valueObject.answer;
		valueObject.value2 = undefined;
		valueObject.operator = undefined;
		valueObject.hasPeriodValue1 = valueObject.value1.includes(".");
		$displayArea.empty().append(valueObject.answer);
		if (operator != "=")
		{
			valueObject.operator = operator;
			$displayArea.append(operator);
		}
	}
	else
	{
		// if is INVALID calculation (e.g. divide by zero)
		if (valueObject.value2.length > 1)
		{
			// if second number is more than 1 digit long
			valueObject.value2 = undefined;
			$displayArea.empty().append(valueObject.value1 + valueObject.operator);
		}
		else
		{
			// remove last number
			backspaceOperation();
		}
	}
}
function isBothValues()
{
	// do both values exist already?
	if (valueObject.value1 != undefined && valueObject.value2 != undefined)
	{
		return true;
	}
	return false;
}
// actions to take if number has a period
function hasPeriodActions(charArray, vtrPartOfValue1, vtrPartOfValue2)
{
	let updatedArray = charArray.slice(0, -1);
	let updatedValue = updatedArray.join("");
	// make it zero if remaining value would be "0."
	if (updatedValue === "0.")
	{
		if (vtrPartOfValue1)
		{
			valueObject.value1 = undefined;
			$displayArea.empty().append("0");
		}
	}
	else if (updatedArray[updatedArray.length - 1] === ".")
	{
		if (vtrPartOfValue1)
		{
			// value to remove is part of value 1
			// is last character a period but not "0."? Then remove period to just leave number. E.g. "2." --> "2"
			valueObject.value1 = updatedArray.slice(0, -1).join("");
			return valueObject.value1;
		}
		else
		{
			// value to remove is part of value 2
			let tempValue2 = valueObject.value2.toString();
			let charArray2 = tempValue2.split("");
			charArray2.pop();
			valueObject.value2 = charArray2.join("");
			updatedArray.pop();
			return updatedArray.join("");
		}
	}
	// else do nothing and return undefined
}
function backspaceIsNumerical(valueToRemove, charArray)
{
	let updatedValue = "";
	let val1 = valueObject.value1;
	let val2 = valueObject.value2;
	let hasPeriodValue1 = valueObject.hasPeriodValue1;
	let hasPeriodValue2 = valueObject.hasPeriodValue2;
	let vtrPartOfValue1 = val1 !== undefined && val2 == undefined;
	let vtrPartOfValue2 = val1 !== undefined && val2 !== undefined;
	// if value to remove IS numerical
	// ## Add something here to deal with situation where both values are the same number!
	let valueToRemoveHasPeriod = false;
	if (vtrPartOfValue1)
	{
		valueToRemoveHasPeriod = val1.includes(".");
	}
	else
	{
		valueToRemoveHasPeriod = val2.includes(".");
	}

	valueToRemove = valueToRemove;
	if (valueToRemove == val2)
	{
		valueObject.value2 = undefined;
		if (valueToRemoveHasPeriod)
		{
			let response = hasPeriodActions(charArray, vtrPartOfValue1, vtrPartOfValue2);
			if (response !== undefined)
			{
				updatedValue = response;
			}
			else
			{
				// response is undefined
				charArray.pop();
				updatedValue = charArray.join("");
			}
		}
		else
		{
			// does not have period
			charArray.pop();
			updatedValue = charArray.join("");
		}
	}
	else
	{
		// is there a period in this number
		if (valueToRemoveHasPeriod)
		{
			let response = hasPeriodActions(charArray, vtrPartOfValue1, vtrPartOfValue2);
			if (response !== undefined)
			{
				updatedValue = response;
			}
			else
			{
				// response is undefined
				charArray.pop();
				updatedValue = charArray.join("");
				if (vtrPartOfValue1)
				{
					valueObject.value1 = updatedValue;
				}
				else
				{
					let tempValue2 = valueObject.value2;
					valueObject.value2 = tempValue2.slice(0, -1);
				}
			}
		}
		else
		{
			// doesn't have a period in number
			// number is 1 digit long
			if (val1.length == 1)
			{
				valueObject.value1 = undefined;
			}
			else
			{
				// number more than 1 digit long
				charArray.pop();
				updatedValue = charArray.join("");
				valueObject.value1 = updatedValue;
			}
		}
	}
	return updatedValue;
}
function backspaceOperation()
{
	let currentValue = $displayArea.text();
	let charArray = currentValue.split("");
	valueObject.hasPeriod = charArray.includes(".");
	let valueMoreThan1Digit = false;
	let valueToRemove = charArray[charArray.length - 1];
	let updatedValue = "";
	// if value to remove IS numerical
	if (!isNaN(valueToRemove))
	{
		updatedValue = backspaceIsNumerical(valueToRemove, charArray, valueMoreThan1Digit);
		// ## Add something here to deal with situation where both values are the same number!
	}
	else
	{
		// if value is NOT numerical (i.e. it's an operator)
		if (valueToRemove == valueObject.operator)
		{
			valueObject.operator = undefined;
			charArray.pop();
			updatedValue = charArray.join("");
		}
	}

	// display updated value to user
	$displayArea.empty().append(updatedValue);
	if ($displayArea.text() == "")
	{
		$displayArea.append("0");
	}
}
function clearOperation()
{
	$displayArea.empty().append("0");
	valueObject = { "value1": undefined, "value2": undefined, "operator": undefined, "answer": undefined, "hasPeriodValue1": false, "hasPeriodValue2": false };
	$userMessage.empty().append("<span>&nbsp;</span>")
}
function processOperatorKeys(value)
{
	let actualValue = "";
	switch (value)
	{
		case "Backspace":
		case "backspace":
			backspaceOperation();
			return;
			break;
		case "Escape":
		case "clear":
			clearOperation();
			return;
			break;
		case "-":
		case "NumpadSubtract":
		case "subtract":
			actualValue = "-";
			break;
		case "NumpadAdd":
		case "+":
		case "add":
			actualValue = "+";
			break;
		case "NumpadMultiply":
		case "*":
		case "multiply":
			actualValue = "*";
			break;
		case "NumpadDivide":
		case "/":
		case "divide":
			actualValue = "/";
			break;
		case "NumpadDecimal":
		case ".":
		case "period":
			actualValue = ".";
			break;
		case "Enter":
		case "NumpadEnter":
		case "=":
		case "equals":
			actualValue = "=";
			break;
	}

	if (isBothValues())
	{
		// Check if there are already 2 values. If so, calculate answer
		calculateAnswer(actualValue);
	}
	else
	{
		if (valueObject.operator === undefined)
		{
			// so value 1 exists already
			if (actualValue !== "." && actualValue !== "")
			{
				if (valueObject.value1 !== undefined)
				{
					valueObject.operator = actualValue;
					$displayArea.append(actualValue);
				}
				else
				{
					$displayArea.append("0");
				}
			}

			if (actualValue === ".")
			{
				valueObject.hasPeriodValue1 = true;
				if (valueObject.value1 === undefined)
				{
					$displayArea.empty().append("0.");
				}
				else
				{
					$displayArea.append(".");
				}
			}
		}
		else
		{
			if (actualValue === ".")
			{
				valueObject.hasPeriod = true;
				if (valueObject.value2 === undefined)
				{
					$displayArea.append("0.");
				}
				else
				{
					$displayArea.append(".");
				}
			}
		}
	}
}
function renderClick(buttonValue)
{
	$userMessage.empty().append("<span>&nbsp;</span>");
	// if value is an operator (not a number)
	if (isNaN(buttonValue))
	{
		if (valueObject.value1 === undefined && buttonValue !== "period")
		{
			return;
		}
		if ((buttonValue === "equals" || buttonValue === "=" || buttonValue === 'Enter' || buttonValue === 'NumpadEnter') && (!isBothValues()))
		{
			return;
		}
		// operator value entered
		processOperatorKeys(buttonValue);
	}
	else
	{
		// number value entered
		addNumberToVariable(buttonValue);

		if ($displayArea.text() == "0")
		{
			$displayArea.empty();
		}
		$displayArea.append(buttonValue);
	}
}
function addNumberToVariable(buttonValue)
{
	let value1 = valueObject.value1;
	let value2 = valueObject.value2;
	let hasValue1 = valueObject.value1 !== undefined;
	let hasValue2 = valueObject.value2 !== undefined;
	let hasPeriodValue1 = valueObject.hasPeriodValue1;
	let hasPeriodValue2 = valueObject.hasPeriodValue2;
	let hasOperator = valueObject.operator !== undefined;

	// Add number to variable
	if (!hasValue1 && !hasOperator && !hasPeriodValue1)
	{
		valueObject.value1 = buttonValue;
	}
	else if (!hasValue1 && !hasOperator && hasPeriodValue1)
	{
		assignValue("value1", buttonValue);
	}
	else if (hasValue1 && !hasOperator)
	{
		calculation(value1, hasPeriodValue1, buttonValue, "value1");
	}
	else if (hasValue1 && hasOperator && !hasValue2 && !hasPeriodValue2)
	{
		valueObject.value2 = buttonValue;
	}
	else if (hasValue1 && hasOperator && !hasValue2 && hasPeriodValue2)
	{
		assignValue("value2", buttonValue);
	}
	else if (hasValue1 && hasOperator && hasValue2)
	{
		calculation(value2, hasPeriodValue2, buttonValue, "value2");
	}
}
function assignValue(whichObjectValue, buttonValue)
{
	valueObject[whichObjectValue] = "0" + "." + buttonValue;
	//valueObject.hasPeriod = false;
}
function calculation(valueString, hasPeriod, buttonValue, whichObjectValue)
{
	if (hasPeriod && !valueString.includes("."))
	{
		valueObject[whichObjectValue] = valueString + "." + buttonValue;
		//valueObject.hasPeriod = false;
	}
	else if (hasPeriod && valueString.includes("."))
	{
		valueObject[whichObjectValue] = valueString + buttonValue;
		valueObject.hasPeriod = false;
	}
	else
	{
		valueObject[whichObjectValue] = valueString + buttonValue;
	}
}
