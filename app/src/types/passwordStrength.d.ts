interface PasswordChecklist {
	hasUpperCase: boolean;
	hasLowerCase: boolean;
	hasNumbers: boolean;
	hasSpecialChar: boolean;
	sufficientLength: boolean;
}

interface PasswordStrength {
	strength: string;
	color: string;
	checklist: PasswordChecklist;
}

export type { PasswordChecklist, PasswordStrength };
