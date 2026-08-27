// Service placeholder file for email service
export const sendWelcomeEmail = async (email: string) => {
	console.log(`Sending welcome email to: ${email}`);

	await new Promise((_resolve, reject) => {
		setTimeout(() => {
			reject(new Error("Error while processing the email"));
		}, 5000);
	});

	console.log(`Welcome email sent to: ${email}`);
};
