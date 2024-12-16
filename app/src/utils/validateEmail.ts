/**
 * Validates an email address
 * @param email email to validate
 * @returns whether the email is valid
 */
const validateEmail = (email: string): boolean => {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
};

export default validateEmail;
