import { PasswordStrength, PasswordChecklist } from "@/types/passwordStrength";

export const checkPasswordStrength = (password: string): PasswordStrength => {
	let strengthScore = 0;

	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasNumbers = /\d/.test(password);
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
	const sufficientLength = password.length >= 8;

	if (hasUpperCase) strengthScore++;
	if (hasLowerCase) strengthScore++;
	if (hasNumbers) strengthScore++;
	if (hasSpecialChar) strengthScore++;
	if (sufficientLength) strengthScore++;

	const checklist: PasswordChecklist = {
		hasUpperCase,
		hasLowerCase,
		hasNumbers,
		hasSpecialChar,
		sufficientLength
	};

	switch (strengthScore) {
		case 0:
		case 1:
		case 2:
			return {
				strength: "Weak",
				color: "red",
				checklist
			};
		case 3:
			return {
				strength: "Medium",
				color: "orange",
				checklist
			};
		case 4:
		case 5:
			return {
				strength: "Strong",
				color: "green",
				checklist
			};
		default:
			return {
				strength: "Very Weak",
				color: "red.500",
				checklist
			};
	}
};
