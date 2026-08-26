// Service placeholder file for email service
export const sendWelcomeEmail = async (email: string) => {
	console.log(`Sending welcome email to: ${email}`);

	await new Promise((resolve) => {
		setTimeout(resolve, 5000);
	});

	console.log(`Welcome email sent to: ${email}`);
};
