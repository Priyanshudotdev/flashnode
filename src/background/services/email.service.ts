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

export const sendPasswordResetEmail = async (
	email: string,
	resetUrl: string,
) => {
	console.log(
		`Sending password reset email to: ${email} with reset link: ${resetUrl}`,
	);

	await new Promise((resolve) => setTimeout(resolve, 1000));

	console.log(`Password reset email sent to: ${email}`);
};

export const paymentConfirmationEmail = async (
	email: string,
	orderId: string,
	amount: number,
) => {
	console.log(
		`Sending payment confirmation email to: ${email} for order ${orderId} of amount ${amount}`,
	);

	await new Promise((resolve) => setTimeout(resolve, 1000));

	console.log(`Payment confirmation email sent to: ${email}`);
};

export const sendVerificationEmail = async (
	email: string,
	verificationUrl: string,
) => {
	console.log(
		`Sending verification email to: ${email} with verification link: ${verificationUrl}`,
	);

	await new Promise((resolve) => setTimeout(resolve, 1000));

	console.log(`Verification email sent to: ${email}`);
};
